import os
from http.server import BaseHTTPRequestHandler, HTTPServer


class Handler(BaseHTTPRequestHandler):
    def do_GET(self):
        path = self.path.replace('/daily-saikou/', './docs/')
        path = path.split('?')[0]
        if os.path.isdir(path):
            path += 'index.html'
        with open(path, 'rb') as f:
            self.send_response(200)
            self.send_header('Content-type', 'text/html')
            self.end_headers()
            self.wfile.write(f.read())


HTTPServer(('0.0.0.0', 2333), Handler).serve_forever()
