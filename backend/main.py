from pathlib import Path

from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles

from backend.db import PHOTOS_DIR, init_db
from backend.routers import items, owners, sales, suppliers

FRONTEND_DIR = Path(__file__).resolve().parent.parent / "frontend"
PHOTOS_DIR.mkdir(parents=True, exist_ok=True)

app = FastAPI(title="Brechó")


@app.on_event("startup")
def on_startup() -> None:
    init_db()


@app.get("/api/health")
def health() -> dict:
    return {"status": "ok"}


app.include_router(owners.router)
app.include_router(suppliers.router)
app.include_router(items.router)
app.include_router(sales.router)

app.mount("/photos", StaticFiles(directory=PHOTOS_DIR), name="photos")
app.mount("/", StaticFiles(directory=FRONTEND_DIR, html=True), name="frontend")
