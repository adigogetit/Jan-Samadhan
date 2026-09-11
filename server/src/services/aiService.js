/**
 * aiService.js
 * ============
 * Thin wrapper around the Python Jan-Samadhan Grievance Classifier.
 *
 * Responsibilities:
 *   1. POST text to Python /classify endpoint.
 *   2. Normalise Python category -> JAN-SAMADHAN category.
 *   3. Validate priority value.
 *   4. Return a clean result object, or null on any failure.
 *
 * Python is NEVER called directly from React.
 * Python does NOT touch MongoDB.
 */

const http = require("http");

// ============================================================
// BASE URL  (override via AI_SERVICE_URL in .env)
// ============================================================

const AI_SERVICE_URL =
  process.env.AI_SERVICE_URL || "http://localhost:8000";

// ============================================================
// PYTHON CATEGORY  ->  JAN-SAMADHAN CATEGORY
// ============================================================

const AI_CATEGORY_MAP = {
  Agriculture:     "Agriculture",
  "Water Supply":  "Water & Sanitation",
  Hospital:        "Healthcare",
  School:          "Education",
  Roads:           "Roads & Transport",
  Electricity:     "Electricity",
  Sanitation:      "Waste Management",
  "Public Safety": "Public Safety",
  Welfare:         "Other",
  Administration:  "Other",
  Other:           "Other",
};

// ============================================================
// VALID PRIORITIES
// ============================================================

const VALID_PRIORITIES = ["Low", "Medium", "High", "Critical"];

// ============================================================
// HELPER: raw HTTP POST (no extra npm dependency)
// ============================================================

function httpPost(url, body, timeoutMs = 5000) {
  return new Promise((resolve, reject) => {
    const parsed = new URL(url);
    const data   = JSON.stringify(body);

    const options = {
      hostname: parsed.hostname,
      port:     parsed.port || 80,
      path:     parsed.pathname,
      method:   "POST",
      headers: {
        "Content-Type":   "application/json",
        "Content-Length": Buffer.byteLength(data),
      },
    };

    const req = http.request(options, (res) => {
      let raw = "";
      res.setEncoding("utf8");
      res.on("data", (chunk) => { raw += chunk; });
      res.on("end", () => {
        try {
          resolve({ status: res.statusCode, body: JSON.parse(raw) });
        } catch {
          reject(new Error("AI service returned non-JSON response"));
        }
      });
    });

    req.setTimeout(timeoutMs, () => {
      req.destroy();
      reject(new Error("AI service request timed out"));
    });

    req.on("error", reject);
    req.write(data);
    req.end();
  });
}

// ============================================================
// MAIN: classifyWithAI
// ============================================================

/**
 * Classify grievance text using the Python AI service.
 *
 * @param {string} text  Combined title + description of the complaint.
 * @returns {object|null}
 *   On success:
 *   {
 *     category:        string,   // JAN-SAMADHAN category
 *     priority:        string,   // Low | Medium | High | Critical
 *     language:        string,   // Hindi | English/Hinglish
 *     urgency:         string,   // Full urgency description from AI
 *     matchedKeywords: object,   // { category_phrase, priority_phrase }
 *   }
 *   On failure: null  (caller must use fallback logic)
 */
async function classifyWithAI(text) {
  try {
    const { status, body } = await httpPost(
      `${AI_SERVICE_URL}/classify`,
      { text }
    );

    if (status !== 200 || body.status !== "success") {
      console.warn(
        "[AI Service] Non-success response:",
        status,
        body?.message || ""
      );
      return null;
    }

    // --------------------------------------------------------
    // Normalise category
    // --------------------------------------------------------

    const rawCategory = body.category || "Other";
    const category    = AI_CATEGORY_MAP[rawCategory] || "Other";

    // --------------------------------------------------------
    // Normalise priority
    // --------------------------------------------------------

    const priority = VALID_PRIORITIES.includes(body.priority)
      ? body.priority
      : "Medium";

    return {
      category,
      priority,
      language:        body.language         || "Unknown",
      urgency:         body.urgency          || "",
      matchedKeywords: body.matched_keywords || {},
    };
  } catch (err) {
    console.warn("[AI Service] Unavailable or failed:", err.message);
    return null;
  }
}

module.exports = { classifyWithAI };
