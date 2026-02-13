"""
Simple server that serves static files and falls back to index.html for SPA routes.
Run: python server.py
Then open: http://localhost:8000
"""
import http.server
import os
import urllib.parse

class SPAHandler(http.server.SimpleHTTPRequestHandler):
    def do_GET(self):
        # Parse path (remove query string)
        parsed = urllib.parse.urlparse(self.path)
        path = urllib.parse.unquote(parsed.path)
        
        # If path is root or looks like a route (no file extension), serve index.html
        if path == '/' or path.startswith('/dashboard') or path.startswith('/saved') or \
           path.startswith('/digest') or path.startswith('/settings') or path.startswith('/proof') or \
           path.startswith('/jt/'):
            self.path = '/index.html'
        
        return http.server.SimpleHTTPRequestHandler.do_GET(self)

    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=os.path.dirname(os.path.abspath(__file__)), **kwargs)

if __name__ == '__main__':
    port = 8000
    with http.server.HTTPServer(('', port), SPAHandler) as httpd:
        print(f"Serving at http://localhost:{port}")
        print("Open http://localhost:8000 then navigate to Proof, or go to http://localhost:8000/jt/proof")
        httpd.serve_forever()
