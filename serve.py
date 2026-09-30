import http.server
import socketserver
import socket
import os
import sys

PORT = 8080

def get_local_ip():
    s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
    try:
        # doesn't even have to be reachable
        s.connect(('10.255.255.255', 1))
        ip = s.getsockname()[0]
    except Exception:
        ip = '127.0.0.1'
    finally:
        s.close()
    return ip

class Handler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        # Enable caching for PWA assets while allowing fresh loads
        self.send_header('Cache-Control', 'no-cache')
        super().end_headers()

if __name__ == '__main__':
    # Fix Windows console encoding for Unicode/Emojis
    if sys.stdout.encoding != 'utf-8':
        try:
            sys.stdout.reconfigure(encoding='utf-8')
        except Exception:
            pass
            
    os.chdir(os.path.dirname(os.path.abspath(__file__)))
    local_ip = get_local_ip()
    
    print("=" * 60)
    print("  BREBEUF PARKING APP - LOCAL SERVER  ")
    print("=" * 60)
    print(f"\n1. Open on your PC:")
    print(f"   ->  http://localhost:{PORT}")
    print(f"\n2. Open on your iPhone (connected to same Wi-Fi):")
    print(f"   ->  http://{local_ip}:{PORT}")
    print(f"\n* iPhone Safari Tip:")
    print(f"   Open the link above, tap 'Share' -> 'Add to Home Screen'.")
    print("=" * 60)
    print("Server running... Press Ctrl+C to stop.\n")
    
    with socketserver.TCPServer(("", PORT), Handler) as httpd:
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\nServer stopped.")
