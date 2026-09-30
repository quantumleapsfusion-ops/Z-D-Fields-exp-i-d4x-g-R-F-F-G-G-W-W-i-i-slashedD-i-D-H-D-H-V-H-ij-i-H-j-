"""Thin clients for the OpenAI-compatible model servers Da Vinci sits in front of."""

import json
from typing import Any

import httpx
from fastapi import HTTPException, status

from .config import Settings
from .schemas import (
    CompleteRequest,
    CompleteResponse,
    EmbedRequest,
    EmbedResponse,
    TranscribeResponse,
    TranscriptSegment,
    Usage,
)


class UpstreamError(HTTPException):
    def __init__(self, service: str, detail: str) -> None:
        super().__init__(status.HTTP_502_BAD_GATEWAY, f"{service}: {detail}")


class Backends:
    def __init__(self, settings: Settings, transport: httpx.AsyncBaseTransport | None = None):
        self.settings = settings
        self.llm_client = httpx.AsyncClient(
            base_url=settings.llm_url, timeout=settings.llm_timeout_s, transport=transport
        )
        self.stt_client = httpx.AsyncClient(
            base_url=settings.stt_url, timeout=settings.stt_timeout_s, transport=transport
        )
        self.embed_client = httpx.AsyncClient(
            base_url=settings.embed_url, timeout=settings.embed_timeout_s, transport=transport
        )

    async def aclose(self) -> None:
        for client in (self.llm_client, self.stt_client, self.embed_client):
            await client.aclose()

    async def _post(
        self, client: httpx.AsyncClient, service: str, path: str, **kwargs: Any
    ) -> dict[str, Any]:
        try:
            res = await client.post(path, **kwargs)
        except httpx.HTTPError as exc:
            raise UpstreamError(service, f"unreachable ({exc.__class__.__name__})") from exc
        if res.status_code >= 400:
            raise UpstreamError(service, f"HTTP {res.status_code} {res.text[:300]}")
        body: dict[str, Any] = res.json()
        return body

    async def _healthy(self, client: httpx.AsyncClient) -> bool:
        try:
            return (await client.get("/models", timeout=3.0)).status_code < 500
        except httpx.HTTPError:
            return False

    async def readiness(self) -> dict[str, bool]:
        return {
            "llm": await self._healthy(self.llm_client),
            "stt": await self._healthy(self.stt_client),
            "embed": await self._healthy(self.embed_client),
        }

    async def complete(self, req: CompleteRequest) -> CompleteResponse:
        model = (
            self.settings.llm_model_heavy
            if req.tier == "heavy"
            else self.settings.llm_model_everyday
        )
        payload: dict[str, Any] = {
            "model": model,
            "messages": [
                {"role": "system", "content": req.system},
                {"role": "user", "content": req.prompt},
            ],
            "temperature": req.temperature,
            "max_tokens": req.max_tokens,
            # Thinking off: UI-driving outputs must be the answer, not a monologue.
            "chat_template_kwargs": {"enable_thinking": False},
        }
        if req.seed is not None:
            payload["seed"] = req.seed
        if req.json_schema is not None:
            payload["response_format"] = {
                "type": "json_schema",
                "json_schema": {"name": "davinci_output", "schema": req.json_schema},
            }

        body = await self._post(self.llm_client, "llm", "/chat/completions", json=payload)
        try:
            text: str = body["choices"][0]["message"]["content"] or ""
        except (KeyError, IndexError, TypeError) as exc:
            raise UpstreamError("llm", "malformed completion") from exc
        usage = body.get("usage") or {}
        parsed: Any | None = None
        if req.json_schema is not None:
            try:
                parsed = json.loads(text)
            except json.JSONDecodeError as exc:
                raise UpstreamError(
                    "llm", "constrained decoding returned invalid JSON"
                ) from exc
        return CompleteResponse(
            text=text,
            json=parsed,
            model=model,
            usage=Usage(
                input_tokens=int(usage.get("prompt_tokens", 0)),
                output_tokens=int(usage.get("completion_tokens", 0)),
            ),
        )

    async def transcribe(
        self, audio: bytes, filename: str, mime_type: str, language: str | None
    ) -> TranscribeResponse:
        model = self.settings.stt_model
        data: dict[str, str] = {"model": model, "response_format": "verbose_json"}
        if language:
            data["language"] = language
        body = await self._post(
            self.stt_client,
            "stt",
            "/audio/transcriptions",
            data=data,
            files={"file": (filename, audio, mime_type)},
        )
        segments = [
            TranscriptSegment(
                start=float(s.get("start", 0)),
                end=float(s.get("end", 0)),
                text=s.get("text", ""),
            )
            for s in body.get("segments") or []
        ]
        return TranscribeResponse(
            text=(body.get("text") or "").strip(),
            language=body.get("language"),
            duration_s=body.get("duration"),
            segments=segments,
            model=model,
        )

    async def embed(self, req: EmbedRequest) -> EmbedResponse:
        model = self.settings.embed_model
        body = await self._post(
            self.embed_client,
            "embed",
            "/embeddings",
            json={
                "model": model,
                "input": req.texts,
                "dimensions": self.settings.embed_dimensions,
            },
        )
        rows = sorted(body.get("data") or [], key=lambda d: int(d.get("index", 0)))
        vectors = [list(map(float, r["embedding"])) for r in rows]
        if len(vectors) != len(req.texts):
            raise UpstreamError("embed", "vector count mismatch")
        usage = body.get("usage") or {}
        return EmbedResponse(
            vectors=vectors,
            model=model,
            dimensions=self.settings.embed_dimensions,
            usage=Usage(input_tokens=int(usage.get("prompt_tokens", 0))),
        )
