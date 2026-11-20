#!/usr/bin/env python3
# ============================================================================
# serve.py — سرور توسعه محلی برای PWA
# سرویس‌ورکر روی file: کار نمی‌کند؛ برای تست باید از http استفاده کرد.
# اجرا:  python scripts/serve.py [پورت] [--no-browser]
# ============================================================================
import http.server
import socketserver
import socket
import sys
import webbrowser
from pathlib import Path

# کنسول ویندوز به‌طور پیش‌فرض cp1256 است؛ برای پیام‌های فارسی
if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")

ROOT = Path(__file__).resolve().parent.parent
PORT = int(sys.argv[1]) if len(sys.argv) > 1 and sys.argv[1].isdigit() else 8000
OPEN_BROWSER = "--no-browser" not in sys.argv


class Handler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(ROOT), **kwargs)

    extensions_map = {
        **http.server.SimpleHTTPRequestHandler.extensions_map,
        ".webmanifest": "application/manifest+json",
        ".js": "text/javascript",
        ".mjs": "text/javascript",
        ".woff2": "font/woff2",
    }

    def end_headers(self):
        # جلوگیری از کش در حین توسعه
        self.send_header("Cache-Control", "no-store")
        super().end_headers()

    def log_message(self, fmt, *args):
        print(f"  {self.address_string()} — {fmt % args}")


def lan_ip():
    try:
        s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
        s.connect(("8.8.8.8", 80))
        ip = s.getsockname()[0]
        s.close()
        return ip
    except OSError:
        return None


def main():
    class Server(socketserver.ThreadingTCPServer):
        allow_reuse_address = True

    with Server(("", PORT), Handler) as httpd:
        print(f"سرور توسعه «مربی عادت معامله‌گر»")
        print(f"  محلی:    http://localhost:{PORT}")
        ip = lan_ip()
        if ip:
            print(f"  شبکه:    http://{ip}:{PORT}  (توجه: سرویس‌ورکر روی IP شبکه فعال نمی‌شود؛ فقط localhost)")
        print("برای توقف Ctrl+C را بزن.")
        if OPEN_BROWSER:
            webbrowser.open(f"http://localhost:{PORT}")
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\nسرور متوقف شد.")


if __name__ == "__main__":
    main()
