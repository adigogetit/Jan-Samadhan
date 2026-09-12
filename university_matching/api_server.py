"""
Societal Innovation Problem Analyzer - REST API Server
======================================================
REST API server providing endpoints for problem analysis, deterministic
priority scoring, and university matching against the 25 HEI dataset.

Start server:
    python api_server.py --port 5002

Endpoints:
    GET  /health        -> Health check and service metadata
    GET  /universities  -> Returns dataset of 25 Higher Education Institutions
    POST /analyze       -> Analyzes problem text and returns structured JSON
    POST /priority      -> Calculates composite priority score (0-100)
    POST /match         -> Matches structured requirements against 25 universities
    POST /pipeline      -> End-to-end: Analysis -> Priority -> University Matching
"""

import os
import sys
import io
import json
import argparse
from http.server import HTTPServer, BaseHTTPRequestHandler
from pathlib import Path

# Ensure UTF-8 output
if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8', errors='replace')

from problem_analyzer import SocietalProblemAnalyzer
from priority_engine import calculate_priority_score
from university_matching_engine import UniversityMatchingEngine

analyzer = SocietalProblemAnalyzer()
matching_engine = UniversityMatchingEngine()


class SocietalInnovationAPIHandler(BaseHTTPRequestHandler):
    """HTTP Handler with CORS support."""

    def _set_headers(self, status=200, content_type='application/json'):
        self.send_response(status)
        self.send_header('Content-Type', f'{content_type}; charset=utf-8')
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type, Authorization')
        self.end_headers()

    def do_OPTIONS(self):
        """Handle CORS pre-flight."""
        self._set_headers(204)

    def do_GET(self):
        """Handle GET requests."""
        if self.path == '/' or self.path == '/health':
            response = {
                "status": "healthy",
                "service": "Societal Innovation Problem Analyzer API",
                "version": "2.0",
                "taxonomy_domains": 10,
                "dataset": "25 Universities (15 Jharkhand HEIs + 10 National HEIs)",
                "endpoints": {
                    "POST /analyze": "JSON {\"text\": \"...\"} or {\"title\": \"...\", \"description\": \"...\"} -> Structured Analysis",
                    "POST /priority": "JSON {\"priorityFactors\": {...}} -> Composite Priority (0-100)",
                    "POST /match": "JSON {\"analysis\": {...}} -> Ranked Universities",
                    "POST /pipeline": "JSON {\"text\": \"...\"} -> Complete End-to-End Output (Analysis + Priority + Matching)",
                    "POST /classify": "JSON {\"text\": \"...\"} -> Category + Priority + Full Pipeline Result",
                    "GET /universities": "Returns all 25 institutions"
                }
            }
            self._set_headers(200)
            self.wfile.write(json.dumps(response, ensure_ascii=False, indent=2).encode('utf-8'))

        elif self.path == '/universities':
            self._set_headers(200)
            self.wfile.write(json.dumps(matching_engine.universities, ensure_ascii=False, indent=2).encode('utf-8'))

        else:
            self._set_headers(404)
            self.wfile.write(json.dumps({"error": "Endpoint not found"}).encode('utf-8'))

    def do_POST(self):
        """Handle POST requests."""
        content_length = int(self.headers.get('Content-Length', 0))
        body = self.rfile.read(content_length).decode('utf-8')
        data = json.loads(body) if body else {}

        def get_text(payload):
            if payload.get('text'):
                return payload['text'].strip()
            title = payload.get('title', '').strip()
            desc = payload.get('description', '').strip()
            if title and desc:
                return f"{title}. {desc}"
            return title or desc

        text = get_text(data)

        if self.path == '/analyze':
            if not text:
                self._set_headers(400)
                self.wfile.write(json.dumps({"error": "Missing 'text' or 'title'/'description' in JSON body"}).encode('utf-8'))
                return

            result = analyzer.analyze(text)
            self._set_headers(200)
            self.wfile.write(json.dumps({
                "success": True,
                "analysis": result
            }, ensure_ascii=False, indent=2).encode('utf-8'))

        elif self.path == '/priority':
            factors = data.get('priorityFactors') or data.get('impact') or data
            result = calculate_priority_score(factors)
            self._set_headers(200)
            self.wfile.write(json.dumps({
                "success": True,
                "priority": result
            }, ensure_ascii=False, indent=2).encode('utf-8'))

        elif self.path == '/match':
            analysis = data.get('analysis') or data
            top_k = int(data.get('top_k', data.get('num_matches', 5)))
            result = matching_engine.match(analysis, top_k=top_k)
            self._set_headers(200)
            self.wfile.write(json.dumps({
                "success": True,
                "university_matches": result.get("topMatches", []),
                "universityMatching": result
            }, ensure_ascii=False, indent=2).encode('utf-8'))

        elif self.path == '/pipeline' or self.path == '/classify':
            if not text:
                self._set_headers(400)
                self.wfile.write(json.dumps({"error": "Missing 'text' or 'title'/'description' in JSON body"}).encode('utf-8'))
                return

            top_k = int(data.get('top_k', data.get('num_matches', 5)))
            analysis = analyzer.analyze(text)
            priority = calculate_priority_score(analysis.get('priorityFactors', {}))
            matches = matching_engine.match(analysis, top_k=top_k)

            domain = analysis.get("problem", {}).get("domain", "Other")
            band = priority.get("priorityBand", "MEDIUM")
            priority_mapped = {"CRITICAL": "Critical", "HIGH": "High", "MEDIUM": "Medium", "LOW": "Low"}.get(band, "Medium")

            full_result = {
                "status": "success",
                "success": True,
                "category": domain,
                "priority": priority_mapped,
                "language": "English/Hindi",
                "urgency": priority.get("recommendedAction", ""),
                "matched_keywords": {
                    "research_areas": analysis.get("requirements", {}).get("researchAreas", []),
                    "skills": analysis.get("requirements", {}).get("requiredSkills", []),
                    "technologies": analysis.get("requirements", {}).get("technologies", [])
                },
                "analysis": analysis,
                "priority_details": priority,
                "priority": priority_mapped,
                "university_matches": matches.get("topMatches", []),
                "universityMatching": matches,
                "structuredProblem": analysis,
                "deterministicPriority": priority
            }
            self._set_headers(200)
            self.wfile.write(json.dumps(full_result, ensure_ascii=False, indent=2).encode('utf-8'))

        else:
            self._set_headers(404)
            self.wfile.write(json.dumps({"error": "Endpoint not found"}).encode('utf-8'))


def run_server(port=8000):
    server_address = ('', port)
    httpd = HTTPServer(server_address, SocietalInnovationAPIHandler)
    print("=" * 65)
    print(f"  Societal Innovation Problem Analyzer API Server running on port {port}")
    print(f"  URL: http://localhost:{port}/health")
    print("=" * 65)
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print("\nServer shutting down.")
        httpd.server_close()


if __name__ == '__main__':
    default_port = int(os.environ.get("PORT", 8000))
    parser = argparse.ArgumentParser(description="Societal Innovation Analyzer API Server")
    parser.add_argument('--port', type=int, default=default_port, help=f"Port to run on (default {default_port})")
    args = parser.parse_args()
    run_server(args.port)

