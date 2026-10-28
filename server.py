#!/usr/bin/env python3
"""
server.py - local development server.

    python3 server.py            # then open http://127.0.0.1:8765

Serves the static files in this folder and the same JSON API that Vercel runs
from api/*.py. Binds to 127.0.0.1 so it is only reachable from this computer.
"""

import mimetypes
import os
from http.server import ThreadingHTTPServer
from urllib.parse import urlparse

from jyotish.service import ApiHandler

HERE = os.path.dirname(os.path.abspath(__file__))
PORT = int(os.environ.get("PORT", "8765"))
STATIC_FILES = {"index.html", "style.css", "app.js"}


class DevHandler(ApiHandler):
    def do_GET(self):
        path = urlparse(self.path).path
        if path.startswith("/api/"):
            return super().do_GET()
        name = "index.html" if path in ("", "/") else path.lstrip("/")
        if name not in STATIC_FILES:
            return self.send_body(404, "Not found", "text/plain; charset=utf-8")
        ctype = mimetypes.guess_type(name)[0] or "application/octet-stream"
        with open(os.path.join(HERE, name), "rb") as f:
            self.send_body(200, f.read(), ctype + "; charset=utf-8")


if __name__ == "__main__":
    srv = ThreadingHTTPServer(("127.0.0.1", PORT), DevHandler)
    print(f"Jyotisha readings running at http://127.0.0.1:{PORT}  (Ctrl+C to stop)")
    try:
        srv.serve_forever()
    except KeyboardInterrupt:
        pass
