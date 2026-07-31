import threading

import uvicorn
import webview

from backend.main import app

HOST = "127.0.0.1"
PORT = 8000


def run_server() -> None:
    uvicorn.run(app, host=HOST, port=PORT, log_level="warning")


if __name__ == "__main__":
    threading.Thread(target=run_server, daemon=True).start()
    webview.create_window("Brechó", f"http://{HOST}:{PORT}", width=1100, height=750)
    webview.start()
