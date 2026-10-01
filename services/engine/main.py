"""E1-4 Engine: the backend service for Earth 1 Coalescent.

Run locally with `uvicorn main:app --reload`.
"""

import os

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

PRODUCTION_ORIGINS = ["https://earth1.co", "https://e1-4.com"]
LOCAL_ORIGIN_RE = r"^https?://(localhost|127\.0\.0\.1)(:\d+)?$"


def create_app() -> FastAPI:
    app = FastAPI(title="E1-4 Engine API")

    configured = os.environ.get("ENGINE_EXTRA_ORIGINS", "")
    extra = [o.strip() for o in configured.split(",") if o.strip()]
    app.add_middleware(
        CORSMiddleware,
        allow_origins=[*PRODUCTION_ORIGINS, *extra],
        allow_origin_regex=LOCAL_ORIGIN_RE,
        allow_methods=["GET", "POST"],
        allow_headers=["*"],
    )

    @app.get("/")
    def root() -> dict[str, str]:
        return {"system": "E1-4 Engine", "status": "Operational"}

    @app.get("/health")
    def health() -> dict[str, bool]:
        return {"ok": True}

    return app


app = create_app()
