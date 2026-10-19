#!/usr/bin/env python3
"""Local dev server with cache disabled so CSS/JS changes show on reload."""

from http.server import HTTPServer, SimpleHTTPRequestHandler
import sys


class NoCacheHandler(SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header("Cache-Control", "no-store, no-cache, must-revalidate")
        self.send_header("Pragma", "no-cache")
        self.send_header("Expires", "0")
        super().end_headers()


def main() -> None:
    port = int(sys.argv[1]) if len(sys.argv) > 1 else 8000
    server = HTTPServer(("", port), NoCacheHandler)
    print(f"Serving at http://localhost:{port} (cache disabled)")
    print("Press Ctrl+C to stop.")
    server.serve_forever()


if __name__ == "__main__":
    main()
