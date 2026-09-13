"""
Societal Innovation Problem Analyzer - REST API Server
======================================================

REST API server providing endpoints for:
- Problem analysis
- Deterministic priority scoring
- University matching against the 25 HEI dataset

Local:
    python api_server.py --port 5002

Production / Render:
    python api_server.py --host 0.0.0.0 --port $PORT

Endpoints:
    GET  /health
    GET  /universities
    POST /analyze
    POST /priority
    POST /match
    POST /pipeline
    POST /classify
"""

import os
import sys
import json
import argparse
from http.server import HTTPServer, BaseHTTPRequestHandler

# Ensure UTF-8 output
if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(
        encoding="utf-8",
        errors="replace"
    )

from problem_analyzer import SocietalProblemAnalyzer
from priority_engine import calculate_priority_score
from university_matching_engine import UniversityMatchingEngine


# ============================================================
# INITIALIZE ENGINES
# ============================================================

analyzer = SocietalProblemAnalyzer()
matching_engine = UniversityMatchingEngine()


# ============================================================
# API HANDLER
# ============================================================

class SocietalInnovationAPIHandler(BaseHTTPRequestHandler):
    """HTTP Handler with CORS support."""

    def _set_headers(
        self,
        status=200,
        content_type="application/json"
    ):
        self.send_response(status)

        self.send_header(
            "Content-Type",
            f"{content_type}; charset=utf-8"
        )

        # CORS
        self.send_header(
            "Access-Control-Allow-Origin",
            "*"
        )

        self.send_header(
            "Access-Control-Allow-Methods",
            "GET, POST, OPTIONS"
        )

        self.send_header(
            "Access-Control-Allow-Headers",
            "Content-Type, Authorization"
        )

        self.end_headers()

    # --------------------------------------------------------
    # OPTIONS
    # --------------------------------------------------------

    def do_OPTIONS(self):
        """Handle CORS pre-flight requests."""
        self._set_headers(204)

    # --------------------------------------------------------
    # GET
    # --------------------------------------------------------

    def do_GET(self):
        """Handle GET requests."""

        # Health / root
        if self.path == "/" or self.path == "/health":

            response = {
                "status": "healthy",
                "service": "Societal Innovation Problem Analyzer API",
                "version": "2.0",

                "taxonomy_domains": 10,

                "dataset": (
                    "25 Universities "
                    "(15 Jharkhand HEIs + 10 National HEIs)"
                ),

                "endpoints": {
                    "POST /analyze":
                        "Analyze a societal problem",

                    "POST /priority":
                        "Calculate deterministic priority score",

                    "POST /match":
                        "Match problem requirements with universities",

                    "POST /pipeline":
                        "Complete Analysis + Priority + University Matching",

                    "POST /classify":
                        "Category + Priority + Full Pipeline Result",

                    "GET /universities":
                        "Return all 25 institutions"
                }
            }

            self._set_headers(200)

            self.wfile.write(
                json.dumps(
                    response,
                    ensure_ascii=False,
                    indent=2
                ).encode("utf-8")
            )

        # Universities dataset
        elif self.path == "/universities":

            self._set_headers(200)

            self.wfile.write(
                json.dumps(
                    matching_engine.universities,
                    ensure_ascii=False,
                    indent=2
                ).encode("utf-8")
            )

        else:

            self._set_headers(404)

            self.wfile.write(
                json.dumps({
                    "status": "error",
                    "error": "Endpoint not found"
                }).encode("utf-8")
            )

    # --------------------------------------------------------
    # POST
    # --------------------------------------------------------

    def do_POST(self):
        """Handle POST requests."""

        try:

            content_length = int(
                self.headers.get(
                    "Content-Length",
                    0
                )
            )

            body = self.rfile.read(
                content_length
            ).decode("utf-8")

            data = json.loads(body) if body else {}

        except json.JSONDecodeError:

            self._set_headers(400)

            self.wfile.write(
                json.dumps({
                    "status": "error",
                    "error": "Invalid JSON request body"
                }).encode("utf-8")
            )

            return

        except Exception as e:

            self._set_headers(400)

            self.wfile.write(
                json.dumps({
                    "status": "error",
                    "error": str(e)
                }).encode("utf-8")
            )

            return

        # ----------------------------------------------------
        # TEXT EXTRACTION
        # ----------------------------------------------------

        def get_text(payload):

            if payload.get("text"):
                return str(
                    payload["text"]
                ).strip()

            title = str(
                payload.get(
                    "title",
                    ""
                )
            ).strip()

            description = str(
                payload.get(
                    "description",
                    ""
                )
            ).strip()

            if title and description:
                return f"{title}. {description}"

            return title or description

        text = get_text(data)

        # ====================================================
        # /analyze
        # ====================================================

        if self.path == "/analyze":

            if not text:

                self._set_headers(400)

                self.wfile.write(
                    json.dumps({
                        "status": "error",
                        "error": (
                            "Missing 'text' or "
                            "'title'/'description' "
                            "in JSON body"
                        )
                    }).encode("utf-8")
                )

                return

            try:

                result = analyzer.analyze(text)

                self._set_headers(200)

                self.wfile.write(
                    json.dumps({
                        "success": True,
                        "analysis": result
                    },
                    ensure_ascii=False,
                    indent=2
                    ).encode("utf-8")
                )

            except Exception as e:

                self._set_headers(500)

                self.wfile.write(
                    json.dumps({
                        "success": False,
                        "error": str(e)
                    }).encode("utf-8")
                )

        # ====================================================
        # /priority
        # ====================================================

        elif self.path == "/priority":

            try:

                factors = (
                    data.get("priorityFactors")
                    or data.get("impact")
                    or data
                )

                result = calculate_priority_score(
                    factors
                )

                self._set_headers(200)

                self.wfile.write(
                    json.dumps({
                        "success": True,
                        "priority": result
                    },
                    ensure_ascii=False,
                    indent=2
                    ).encode("utf-8")
                )

            except Exception as e:

                self._set_headers(500)

                self.wfile.write(
                    json.dumps({
                        "success": False,
                        "error": str(e)
                    }).encode("utf-8")
                )

        # ====================================================
        # /match
        # ====================================================

        elif self.path == "/match":

            try:

                analysis = (
                    data.get("analysis")
                    or data
                )

                top_k = int(
                    data.get(
                        "top_k",
                        data.get(
                            "num_matches",
                            5
                        )
                    )
                )

                result = matching_engine.match(
                    analysis,
                    top_k=top_k
                )

                self._set_headers(200)

                self.wfile.write(
                    json.dumps({
                        "success": True,
                        "university_matches":
                            result.get(
                                "topMatches",
                                []
                            ),
                        "universityMatching":
                            result
                    },
                    ensure_ascii=False,
                    indent=2
                    ).encode("utf-8")
                )

            except Exception as e:

                self._set_headers(500)

                self.wfile.write(
                    json.dumps({
                        "success": False,
                        "error": str(e)
                    }).encode("utf-8")
                )

        # ====================================================
        # /pipeline AND /classify
        # ====================================================

        elif (
            self.path == "/pipeline"
            or self.path == "/classify"
        ):

            if not text:

                self._set_headers(400)

                self.wfile.write(
                    json.dumps({
                        "status": "error",
                        "error": (
                            "Missing 'text' or "
                            "'title'/'description' "
                            "in JSON body"
                        )
                    }).encode("utf-8")
                )

                return

            try:

                # --------------------------------------------
                # 1. ANALYSIS
                # --------------------------------------------

                analysis = analyzer.analyze(
                    text
                )

                # --------------------------------------------
                # 2. PRIORITY
                # --------------------------------------------

                priority_details = (
                    calculate_priority_score(
                        analysis.get(
                            "priorityFactors",
                            {}
                        )
                    )
                )

                # --------------------------------------------
                # 3. UNIVERSITY MATCHING
                # --------------------------------------------

                top_k = int(
                    data.get(
                        "top_k",
                        data.get(
                            "num_matches",
                            5
                        )
                    )
                )

                matches = matching_engine.match(
                    analysis,
                    top_k=top_k
                )

                # --------------------------------------------
                # CATEGORY
                # --------------------------------------------

                domain = (
                    analysis
                    .get("problem", {})
                    .get("domain", "Other")
                )

                # --------------------------------------------
                # PRIORITY BAND
                # --------------------------------------------

                band = priority_details.get(
                    "priorityBand",
                    "MEDIUM"
                )

                priority_mapped = {
                    "CRITICAL": "Critical",
                    "HIGH": "High",
                    "MEDIUM": "Medium",
                    "LOW": "Low"
                }.get(
                    band,
                    "Medium"
                )

                # --------------------------------------------
                # BUILD FINAL RESPONSE
                # --------------------------------------------

                full_result = {

                    "status": "success",
                    "success": True,

                    # Basic classification
                    "category": domain,
                    "priority": priority_mapped,
                    "language": "English/Hindi",

                    "urgency": priority_details.get(
                        "recommendedAction",
                        ""
                    ),

                    # Matching information
                    "matched_keywords": {

                        "research_areas":
                            analysis
                            .get("requirements", {})
                            .get(
                                "researchAreas",
                                []
                            ),

                        "skills":
                            analysis
                            .get("requirements", {})
                            .get(
                                "requiredSkills",
                                []
                            ),

                        "technologies":
                            analysis
                            .get("requirements", {})
                            .get(
                                "technologies",
                                []
                            )
                    },

                    # Complete analysis
                    "analysis": analysis,

                    # Complete priority calculation
                    "priority_details":
                        priority_details,

                    # University results
                    "university_matches":
                        matches.get(
                            "topMatches",
                            []
                        ),

                    "universityMatching":
                        matches,

                    # Backward-compatible fields
                    "structuredProblem":
                        analysis,

                    "deterministicPriority":
                        priority_details,

                    # Additional metadata
                    "meta": {
                        "top_k": top_k,
                        "universities_considered":
                            len(
                                matching_engine.universities
                            )
                    }
                }

                self._set_headers(200)

                self.wfile.write(
                    json.dumps(
                        full_result,
                        ensure_ascii=False,
                        indent=2
                    ).encode("utf-8")
                )

            except Exception as e:

                self._set_headers(500)

                self.wfile.write(
                    json.dumps({
                        "status": "error",
                        "success": False,
                        "error": str(e)
                    }).encode("utf-8")
                )

        # ====================================================
        # UNKNOWN POST ENDPOINT
        # ====================================================

        else:

            self._set_headers(404)

            self.wfile.write(
                json.dumps({
                    "status": "error",
                    "error": "Endpoint not found"
                }).encode("utf-8")
            )

    # --------------------------------------------------------
    # CLEAN LOGGING
    # --------------------------------------------------------

    def log_message(self, format, *args):

        sys.stderr.write(
            "[Jan-Samadhan University Matching API] "
            f"{self.address_string()} - "
            f"{format % args}\n"
        )


# ============================================================
# SERVER
# ============================================================

def run_server(
    host="0.0.0.0",
    port=8000
):

    server_address = (
        host,
        port
    )

    httpd = HTTPServer(
        server_address,
        SocietalInnovationAPIHandler
    )

    print("=" * 70)

    print(
        "  Societal Innovation Problem Analyzer API"
    )

    print(
        f"  Host: {host}"
    )

    print(
        f"  Port: {port}"
    )

    print(
        f"  Health: http://{host}:{port}/health"
    )

    print(
        f"  Universities: http://{host}:{port}/universities"
    )

    print(
        f"  Pipeline: POST http://{host}:{port}/pipeline"
    )

    print("=" * 70)

    try:

        httpd.serve_forever()

    except KeyboardInterrupt:

        print(
            "\nServer shutting down."
        )

    finally:

        httpd.server_close()


# ============================================================
# ENTRY POINT
# ============================================================

if __name__ == "__main__":

    # Render provides PORT automatically.
    default_port = int(
        os.environ.get(
            "PORT",
            8000
        )
    )

    parser = argparse.ArgumentParser(
        description=(
            "Societal Innovation "
            "Problem Analyzer API Server"
        )
    )

    parser.add_argument(
        "--host",
        type=str,
        default="0.0.0.0",
        help=(
            "Host to bind the server "
            "(default: 0.0.0.0)"
        )
    )

    parser.add_argument(
        "--port",
        type=int,
        default=default_port,
        help=(
            f"Port to run on "
            f"(default: {default_port})"
        )
    )

    args = parser.parse_args()

    run_server(
        host=args.host,
        port=args.port
    )