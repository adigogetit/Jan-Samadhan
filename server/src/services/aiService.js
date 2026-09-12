/**
 * aiService.js
 * ============
 * Bridge to the Python University Matching & Problem Analyzer Service.
 *
 * Responsibilities:
 *   1. Send citizen problem text/details to Python AI (/pipeline or /classify).
 *   2. Normalise taxonomy domain -> JAN-SAMADHAN category.
 *   3. Normalise priority level (Critical, High, Medium, Low).
 *   4. Return comprehensive AI output: analysis, deterministic priority, and university matches.
 *   5. Provide health check & system monitoring without crashing on offline service.
 */

const http = require("http");

// ============================================================
// BASE URL (override via AI_SERVICE_URL in .env)
// ============================================================

const AI_SERVICE_URL =
  process.env.AI_SERVICE_URL || "http://localhost:8000";

// ============================================================
// DOMAIN / PYTHON CATEGORY -> JAN-SAMADHAN CATEGORY
// ============================================================

const AI_CATEGORY_MAP = {
  // Domain Taxonomy from problem_analyzer.py
  "Agriculture & Rural Technology": "Agriculture",
  "Water Resources & Management": "Water & Sanitation",
  "Environment, Forest & Climate": "Environment",
  "Mining & Mineral Technology": "Other",
  "Healthcare & Public Health": "Healthcare",
  "Education & Digital Learning": "Education",
  "Energy & Renewable Energy": "Electricity",
  "Infrastructure, Civil & Urban Systems": "Roads & Transport",
  "AI, IT & Digital Governance": "Other",
  "Rural Livelihood, Entrepreneurship & Social Innovation": "Other",

  // Legacy mappings
  Agriculture: "Agriculture",
  "Water Supply": "Water & Sanitation",
  Hospital: "Healthcare",
  School: "Education",
  Roads: "Roads & Transport",
  Electricity: "Electricity",
  Sanitation: "Waste Management",
  "Public Safety": "Public Safety",
  Welfare: "Other",
  Administration: "Other",
  Other: "Other",
};

// ============================================================
// VALID PRIORITIES
// ============================================================

const VALID_PRIORITIES = ["Low", "Medium", "High", "Critical"];

// ============================================================
// HELPER: Raw HTTP request (no extra npm dependency)
// ============================================================

function httpRequest(url, method = "GET", body = null, timeoutMs = 8000) {
  return new Promise((resolve, reject) => {
    const parsed = new URL(url);
    const data = body ? JSON.stringify(body) : null;

    const options = {
      hostname: parsed.hostname,
      port: parsed.port || 80,
      path: parsed.pathname + (parsed.search || ""),
      method,
      headers: {
        Accept: "application/json",
        ...(data
          ? {
            "Content-Type": "application/json",
            "Content-Length": Buffer.byteLength(data),
          }
          : {}),
      },
    };

    const req = http.request(options, (res) => {
      let raw = "";
      res.setEncoding("utf8");
      res.on("data", (chunk) => {
        raw += chunk;
      });
      res.on("end", () => {
        try {
          resolve({ status: res.statusCode, body: JSON.parse(raw) });
        } catch {
          resolve({ status: res.statusCode, body: raw });
        }
      });
    });

    req.setTimeout(timeoutMs, () => {
      req.destroy();
      reject(new Error("AI service request timed out"));
    });

    req.on("error", reject);
    if (data) req.write(data);
    req.end();
  });
}

// ============================================================
// MAIN: classifyWithAI
// ============================================================

/**
 * Analyze problem, compute deterministic priority, and find matching universities.
 *
 * @param {string} text Combined title + description of the complaint.
 * @param {object} [extraData] Optional problem fields (district, category, etc.)
 * @returns {object|null}
 */
async function classifyWithAI(text, extraData = {}) {
  try {
    const payload = {
      text,
      title: extraData.title || "",
      description: extraData.description || "",
      category: extraData.category || "",
      location: extraData.district || extraData.location || "",
      // Validation dispatches each innovation problem to only the three best matches.
      top_k: 3,
    };

    // Try /pipeline endpoint on Python service
    let res = await httpRequest(
      `${AI_SERVICE_URL}/pipeline`,
      "POST",
      payload
    );

    // Fallback to /classify if needed
    if (res.status !== 200 || !res.body) {
      res = await httpRequest(
        `${AI_SERVICE_URL}/classify`,
        "POST",
        payload
      );
    }

    if (res.status !== 200 || !res.body) {
      console.warn(
        "[AI Service] Non-success response:",
        res.status,
        res.body
      );
      return null;
    }

    const body = res.body;

    const analysis = body.analysis || body.structuredProblem || {};
    const priorityData = body.priority || body.deterministicPriority || {};
    const matchingData = body.universityMatching || {};
    const topMatches =
      body.university_matches ||
      matchingData.topMatches ||
      [];

    // 1. Normalise Category
    const detectedDomain =
      analysis.problem?.domain || body.category || "Other";
    const category =
      AI_CATEGORY_MAP[detectedDomain] ||
      AI_CATEGORY_MAP[body.category] ||
      "Other";

    // 2. Normalise Priority
    const rawPriority =
      priorityData.priorityBand || body.priority || "Medium";
    const priorityKey =
      typeof rawPriority === "string"
        ? rawPriority.charAt(0).toUpperCase() +
        rawPriority.slice(1).toLowerCase()
        : "Medium";
    const priority = VALID_PRIORITIES.includes(priorityKey)
      ? priorityKey
      : "Medium";

    // 3. Extract Keywords & Requirements
    const reqs = analysis.requirements || {};
    const matchedKeywords = {
      domain: analysis.problem?.domain || detectedDomain,
      subDomain: analysis.problem?.subDomain || "",
      researchAreas: reqs.researchAreas || [],
      skills: reqs.requiredSkills || [],
      technologies: reqs.technologies || [],
      departments: reqs.departments || [],
      routingType:
        analysis.classification?.routingType ||
        matchingData.routingType ||
        "INNOVATION",
    };

    // 4. Detailed Structured AI Analysis for MongoDB
    const aiAnalysis = {
      status: "Completed",
      analyzedAt: new Date(),
      error: null,
      routingType: matchedKeywords.routingType,
      structuredProblem: analysis,
      deterministicPriority: priorityData,
      universityMatching: matchingData,
      universityMatches: topMatches,
    };

    return {
      category,
      priority,
      language: body.language || "English/Hindi",
      urgency:
        priorityData.recommendedAction ||
        body.urgency ||
        "Standard civic workflow",
      matchedKeywords,
      aiAnalysis,
    };
  } catch (err) {
    console.warn("[AI Service] Unavailable or failed:", err.message);
    return null;
  }
}

// ============================================================
// HEALTH CHECK
// ============================================================

async function checkAIHealth() {
  try {
    const res = await httpRequest(`${AI_SERVICE_URL}/health`, "GET", null, 3000);
    if (res.status === 200 && typeof res.body === "object") {
      return {
        isOnline: true,
        status: res.body.status || "healthy",
        details: res.body,
      };
    }
    return {
      isOnline: false,
      status: "unreachable",
      details: null,
    };
  } catch (error) {
    return {
      isOnline: false,
      status: "offline",
      error: error.message,
    };
  }
}

// ============================================================
// ADMIN STATS AGGREGATOR
// ============================================================

async function getAIStats(ProblemModel) {
  try {
    const [
      totalProblems,
      analyzedProblems,
      pendingProblems,
      failedProblems,
      withMatches,
      health,
    ] = await Promise.all([
      ProblemModel.countDocuments(),
      ProblemModel.countDocuments({ "aiAnalysis.status": "Completed" }),
      ProblemModel.countDocuments({
        $or: [
          { "aiAnalysis.status": "Pending" },
          { "aiAnalysis.status": "Processing" },
        ],
      }),
      ProblemModel.countDocuments({ "aiAnalysis.status": "Failed" }),
      ProblemModel.countDocuments({
        "aiAnalysis.universityMatches.0": { $exists: true },
      }),
      checkAIHealth(),
    ]);

    return {
      success: true,
      serviceHealth: health,
      metrics: {
        totalProblems,
        analyzedProblems,
        pendingProblems,
        failedProblems,
        problemsWithUniversityRecommendations: withMatches,
        coveragePercentage: totalProblems
          ? Math.round((analyzedProblems / totalProblems) * 100)
          : 0,
      },
    };
  } catch (error) {
    return {
      success: false,
      error: error.message,
    };
  }
}

module.exports = {
  classifyWithAI,
  checkAIHealth,
  getAIStats,
  AI_CATEGORY_MAP,
  VALID_PRIORITIES,
};
