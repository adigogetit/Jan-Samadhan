"""
Jan-Samadhan Grievance Classifier - REST API Server
===================================================
A zero-dependency HTTP REST API server using Python's built-in `http.server`.
Allows any external project (Node.js, Express, React, Next.js, Django, FastAPI,
Android/iOS, PHP, Java, cURL) to easily connect and classify grievances.

Start server:
    python api_server.py --port 5000

Endpoints:
    GET  /health          -> Check server health status
    POST /classify        -> Classify a single grievance JSON {"text": "..."}
    POST /classify-batch  -> Classify multiple grievances JSON {"texts": ["...", "..."]}
"""

import sys
import io
import json
import argparse
from http.server import HTTPServer, BaseHTTPRequestHandler

# Ensure UTF-8 output on console
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')

from classifier_engine import classify_grievance, classify_batch, CAT_ICON, PRI_ICON, URGENCY


class GrievanceAPIHandler(BaseHTTPRequestHandler):
    """HTTP Request Handler with CORS support."""

    def _set_headers(self, status=200, content_type='application/json'):
        self.send_response(status)
        self.send_header('Content-Type', f'{content_type}; charset=utf-8')
        # Enable CORS for frontend web apps
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type, Authorization')
        self.end_headers()

    def do_OPTIONS(self):
        """Handle CORS pre-flight requests."""
        self._set_headers(204)

    def do_GET(self):
        """Handle GET requests."""
        if self.path == '/' or self.path == '/health':
            response = {
                "status": "healthy",
                "service": "Jan-Samadhan Grievance Classification Model API",
                "supported_languages": ["English", "Hinglish", "Hindi (Devanagari)"],
                "endpoints": {
                    "POST /classify": "Send JSON {\"text\": \"your complaint\"}",
                    "POST /classify-batch": "Send JSON {\"texts\": [\"comp 1\", \"comp 2\"]}"
                }
            }
            self._set_headers(200)
            self.wfile.write(json.dumps(response, ensure_ascii=False, indent=2).encode('utf-8'))
        else:
            self._set_headers(404)
            self.wfile.write(json.dumps({"error": "Endpoint not found"}).encode('utf-8'))

    def do_POST(self):
        """Handle POST requests for classification."""
        if self.path == '/classify':
            try:
                content_length = int(self.headers.get('Content-Length', 0))
                body = self.rfile.read(content_length).decode('utf-8')
                data = json.loads(body) if body else {}

                text = data.get('text', '')
                if not text:
                    self._set_headers(400)
                    self.wfile.write(json.dumps({
                        "status": "error",
                        "message": "Missing 'text' field in JSON body. Example: {\"text\": \"खेत में पानी नहीं आ रहा है।\"}"
                    }).encode('utf-8'))
                    return

                result = classify_grievance(text)
                self._set_headers(200)
                self.wfile.write(json.dumps(result, ensure_ascii=False, indent=2).encode('utf-8'))

            except Exception as e:
                self._set_headers(500)
                self.wfile.write(json.dumps({"status": "error", "message": str(e)}).encode('utf-8'))

        elif self.path == '/classify-batch':
            try:
                content_length = int(self.headers.get('Content-Length', 0))
                body = self.rfile.read(content_length).decode('utf-8')
                data = json.loads(body) if body else {}

                texts = data.get('texts', [])
                if not isinstance(texts, list) or len(texts) == 0:
                    self._set_headers(400)
                    self.wfile.write(json.dumps({
                        "status": "error",
                        "message": "Missing or invalid 'texts' list in JSON body. Example: {\"texts\": [\"problem 1\", \"problem 2\"]}"
                    }).encode('utf-8'))
                    return

                results = classify_batch(texts)
                response = {
                    "status": "success",
                    "count": len(results),
                    "results": results
                }
                self._set_headers(200)
                self.wfile.write(json.dumps(response, ensure_ascii=False, indent=2).encode('utf-8'))

            except Exception as e:
                self._set_headers(500)
                self.wfile.write(json.dumps({"status": "error", "message": str(e)}).encode('utf-8'))

        else:
            self._set_headers(404)
            self.wfile.write(json.dumps({"error": "Endpoint not found"}).encode('utf-8'))

    def log_message(self, format, *args):
        """Custom clean logging."""
        sys.stderr.write(f"[Jan-Samadhan API] {self.address_string()} - {format % args}\n")


def run(host='0.0.0.0', port=8000):
    server_address = (host, port)
    httpd = HTTPServer(server_address, GrievanceAPIHandler)
    print('=' * 68)
    print(f'  Jan-Samadhan Model API Server Running')
    print(f'  URL: http://localhost:{port}')
    print(f'  Health Check: http://localhost:{port}/health')
    print(f'  Classify API: POST http://localhost:{port}/classify')
    print('  Press Ctrl+C to stop the server')
    print('=' * 68)
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print('\n[Jan-Samadhan API] Server stopped gracefully.')
        httpd.server_close()


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description='Jan-Samadhan Model REST API Server')
    parser.add_argument('--host', type=str, default='0.0.0.0', help='Host to bind server (default: 0.0.0.0)')
    parser.add_argument('--port', type=int, default=8000, help='Port to bind server (default: 8000)')
    args = parser.parse_args()
    run(host=args.host, port=args.port)
