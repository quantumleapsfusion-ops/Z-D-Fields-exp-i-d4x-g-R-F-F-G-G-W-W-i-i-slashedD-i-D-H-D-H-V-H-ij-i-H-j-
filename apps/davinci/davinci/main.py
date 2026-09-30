from collections.abc import AsyncIterator
from contextlib import asynccontextmanager
from typing import Annotated

from fastapi import Depends, FastAPI, File, Form, HTTPException, Request, UploadFile, status

from .auth import require_secret
from .backends import Backends
from .config import Settings, get_settings
from .schemas import (
    CompleteRequest,
    CompleteResponse,
    EmbedRequest,
    EmbedResponse,
    Health,
    Readiness,
    TranscribeResponse,
)

VERSION = "0.1.0"


def get_backends(request: Request) -> Backends:
    backends: Backends = request.app.state.backends
    return backends


BackendsDep = Annotated[Backends, Depends(get_backends)]
SettingsDep = Annotated[Settings, Depends(get_settings)]
Protected = [Depends(require_secret)]


def create_app(settings: Settings | None = None, backends: Backends | None = None) -> FastAPI:
    resolved = settings or get_settings()

    @asynccontextmanager
    async def lifespan(app: FastAPI) -> AsyncIterator[None]:
        app.state.backends = backends or Backends(resolved)
        try:
            yield
        finally:
            await app.state.backends.aclose()

    app = FastAPI(
        title="Da Vinci",
        version=VERSION,
        lifespan=lifespan,
        docs_url=None,
        redoc_url=None,
        openapi_url=None,
    )
    app.dependency_overrides[get_settings] = lambda: resolved

    @app.get("/healthz", response_model=Health)
    async def healthz() -> Health:
        return Health(status="ok", version=VERSION)

    @app.get("/readyz", response_model=Readiness, dependencies=Protected)
    async def readyz(be: BackendsDep) -> Readiness:
        return Readiness(**await be.readiness())

    @app.post("/v1/complete", response_model=CompleteResponse, dependencies=Protected)
    async def complete(req: CompleteRequest, be: BackendsDep) -> CompleteResponse:
        return await be.complete(req)

    @app.post("/v1/transcribe", response_model=TranscribeResponse, dependencies=Protected)
    async def transcribe(
        file: Annotated[UploadFile, File()],
        be: BackendsDep,
        cfg: SettingsDep,
        language: Annotated[str | None, Form()] = None,
    ) -> TranscribeResponse:
        audio = await file.read(cfg.max_audio_bytes + 1)
        if len(audio) > cfg.max_audio_bytes:
            raise HTTPException(status.HTTP_413_CONTENT_TOO_LARGE, "Audio too large")
        if not audio:
            raise HTTPException(status.HTTP_400_BAD_REQUEST, "Empty audio")
        return await be.transcribe(
            audio,
            file.filename or "audio.webm",
            file.content_type or "application/octet-stream",
            language,
        )

    @app.post("/v1/embed", response_model=EmbedResponse, dependencies=Protected)
    async def embed(req: EmbedRequest, be: BackendsDep) -> EmbedResponse:
        return await be.embed(req)

    return app


def app() -> FastAPI:
    """Uvicorn factory: `uvicorn davinci.main:app --factory`."""
    return create_app()
