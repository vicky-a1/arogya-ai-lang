#!/usr/bin/env python3
"""
Production HTTP server for Arogya AI application
"""
import http.server
import socketserver
import os
import sys
import mimetypes
from datetime import datetime

class ProductionHTTPRequestHandler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory="public", **kwargs)

    def end_headers(self):
        # Security headers
        self.send_header('X-Content-Type-Options', 'nosniff')
        self.send_header('X-Frame-Options', 'DENY')
        self.send_header('X-XSS-Protection', '1; mode=block')
        self.send_header('Referrer-Policy', 'strict-origin-when-cross-origin')

        # Cache control for production
        if self.path.endswith(('.css', '.js')):
            self.send_header('Cache-Control', 'public, max-age=86400')  # 1 day
        elif self.path.endswith(('.png', '.jpg', '.jpeg', '.gif', '.ico', '.svg')):
            self.send_header('Cache-Control', 'public, max-age=604800')  # 1 week
        else:
            self.send_header('Cache-Control', 'no-cache, no-store, must-revalidate')

        super().end_headers()

    def log_message(self, format, *args):
        # Minimal logging for production
        timestamp = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
        print(f"[{timestamp}] {format % args}")

def main():
    PORT = 8000

    # Change to the directory containing this script
    os.chdir(os.path.dirname(os.path.abspath(__file__)))

    # Verify required files exist
    required_files = [
        'public/index.html',
        'public/script.js',
        'public/styles.css'
    ]

    for file_path in required_files:
        if not os.path.exists(file_path):
            print(f"Error: Required file '{file_path}' not found!")
            sys.exit(1)

    # Set up MIME types
    mimetypes.add_type('application/javascript', '.js')
    mimetypes.add_type('text/css', '.css')

    with socketserver.TCPServer(("", PORT), ProductionHTTPRequestHandler) as httpd:
        print(f"Arogya AI Production Server")
        print(f"Running at: http://localhost:{PORT}")
        print(f"Started: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
        print("Press Ctrl+C to stop")
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print(f"\nServer stopped at {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")

if __name__ == "__main__":
    main()
