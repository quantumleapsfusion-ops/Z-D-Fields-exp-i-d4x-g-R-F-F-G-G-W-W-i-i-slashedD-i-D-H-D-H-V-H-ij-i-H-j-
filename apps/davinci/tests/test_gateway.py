import httpx
from fastapi.testclient import TestClient

from davinci.backends import Backends
from davinci.config import Settings
from davinci.main import VERSION, create_app

from .conftest import AUTH, SECRET, Upstream

CHAT_OK = {
    "choices": [{"message": {"content": '{"summary":"hi","topics":["a"]}'}}],
    "usage": {"prompt_tokens": 12, "completion_tokens": 7},
}


def test_healthz_is_public(client: TestClient) -> None:
    res = client.get("/healthz")
    assert res.status_code == 200
    assert res.json() == {"status": "ok", "version": VERSION}


def test_v1_requires_bearer_secret(client: TestClient, upstream: Upstream) -> None:
    body = {"system": "s", "prompt": "p"}
    assert client.post("/v1/complete", json=body).status_code == 401
    assert (
        client.post("/v1/complete", json=body, headers={"Authorization": "Bearer nope"})
    ).status_code == 401
    assert (
        client.post("/v1/complete", json=body, headers={"Authorization": "Basic x"})
    ).status_code == 401
    assert client.get("/readyz").status_code == 401
    assert client.post("/v1/embed", json={"texts": ["x"]}).status_code == 401
    assert upstream.requests == []


def test_docs_are_disabled(client: TestClient) -> None:
    for path in ("/docs", "/redoc", "/openapi.json"):
        assert client.get(path).status_code == 404


def test_complete_free_text_uses_everyday_model(client: TestClient, upstream: Upstream) -> None:
    upstream.respond_json(200, CHAT_OK)
    res = client.post(
        "/v1/complete",
        json={"system": "sys", "prompt": "hello", "temperature": 0.2, "max_tokens": 50},
        headers=AUTH,
    )
    assert res.status_code == 200
    data = res.json()
    assert data["model"] == "Qwen/Qwen3.8-27B"
    assert data["json"] is None
    assert data["usage"] == {"input_tokens": 12, "output_tokens": 7}

    sent = upstream.last_json()
    assert upstream.requests[-1].url.path.endswith("/chat/completions")
    assert sent["messages"] == [
        {"role": "system", "content": "sys"},
        {"role": "user", "content": "hello"},
    ]
    assert sent["temperature"] == 0.2
    assert sent["max_tokens"] == 50
    assert sent["chat_template_kwargs"] == {"enable_thinking": False}
    assert "response_format" not in sent


def test_complete_with_schema_constrains_decoding_and_parses(
    client: TestClient, upstream: Upstream
) -> None:
    upstream.respond_json(200, CHAT_OK)
    schema = {
        "type": "object",
        "properties": {"summary": {"type": "string"}, "topics": {"type": "array"}},
        "required": ["summary", "topics"],
    }
    res = client.post(
        "/v1/complete",
        json={"system": "s", "prompt": "p", "tier": "heavy", "seed": 7, "json_schema": schema},
        headers=AUTH,
    )
    assert res.status_code == 200
    assert res.json()["json"] == {"summary": "hi", "topics": ["a"]}

    sent = upstream.last_json()
    assert sent["seed"] == 7
    assert sent["response_format"] == {
        "type": "json_schema",
        "json_schema": {"name": "davinci_output", "schema": schema},
    }


def test_complete_invalid_json_from_constrained_decoding_is_502(
    client: TestClient, upstream: Upstream
) -> None:
    upstream.respond_json(200, {"choices": [{"message": {"content": "not json"}}]})
    res = client.post(
        "/v1/complete",
        json={"system": "s", "prompt": "p", "json_schema": {"type": "object"}},
        headers=AUTH,
    )
    assert res.status_code == 502
    assert "invalid JSON" in res.json()["detail"]


def test_upstream_failures_map_to_502(client: TestClient, upstream: Upstream) -> None:
    upstream.respond_json(500, {"error": "boom"})
    res = client.post("/v1/complete", json={"system": "s", "prompt": "p"}, headers=AUTH)
    assert res.status_code == 502
    assert res.json()["detail"].startswith("llm: HTTP 500")

    def unreachable(_: httpx.Request) -> httpx.Response:
        raise httpx.ConnectError("refused")

    upstream.handler = unreachable
    res = client.post("/v1/complete", json={"system": "s", "prompt": "p"}, headers=AUTH)
    assert res.status_code == 502
    assert "unreachable" in res.json()["detail"]


def test_complete_validates_body(client: TestClient, upstream: Upstream) -> None:
    res = client.post("/v1/complete", json={"system": "s", "prompt": ""}, headers=AUTH)
    assert res.status_code == 422
    res = client.post(
        "/v1/complete", json={"system": "s", "prompt": "p", "tier": "ultra"}, headers=AUTH
    )
    assert res.status_code == 422
    assert upstream.requests == []


def test_transcribe_forwards_multipart_and_maps_segments(
    client: TestClient, upstream: Upstream
) -> None:
    upstream.respond_json(
        200,
        {
            "text": "  hello world ",
            "language": "en",
            "duration": 2.5,
            "segments": [{"start": 0, "end": 2.5, "text": "hello world"}],
        },
    )
    res = client.post(
        "/v1/transcribe",
        files={"file": ("clip.webm", b"\x1aE\xdf\xa3fake", "audio/webm")},
        data={"language": "en"},
        headers=AUTH,
    )
    assert res.status_code == 200
    assert res.json() == {
        "text": "hello world",
        "language": "en",
        "duration_s": 2.5,
        "segments": [{"start": 0.0, "end": 2.5, "text": "hello world"}],
        "model": "Qwen/Qwen3-ASR-1.7B",
    }
    sent = upstream.requests[-1]
    assert sent.url.path.endswith("/audio/transcriptions")
    assert b'name="file"; filename="clip.webm"' in sent.content
    assert b"audio/webm" in sent.content
    assert b"verbose_json" in sent.content


def test_transcribe_rejects_empty_and_oversized(upstream: Upstream) -> None:
    small = Settings(secret=SECRET, max_audio_bytes=8)
    with TestClient(
        create_app(small, Backends(small, transport=httpx.MockTransport(upstream)))
    ) as tc:
        res = tc.post(
            "/v1/transcribe", files={"file": ("a.webm", b"", "audio/webm")}, headers=AUTH
        )
        assert res.status_code == 400
        res = tc.post(
            "/v1/transcribe", files={"file": ("a.webm", b"x" * 9, "audio/webm")}, headers=AUTH
        )
        assert res.status_code == 413
    assert upstream.requests == []


def test_embed_orders_vectors_by_index(client: TestClient, upstream: Upstream) -> None:
    upstream.respond_json(
        200,
        {
            "data": [
                {"index": 1, "embedding": [0.5, 0.5]},
                {"index": 0, "embedding": [1.0, 0.0]},
            ],
            "usage": {"prompt_tokens": 4},
        },
    )
    res = client.post("/v1/embed", json={"texts": ["a", "b"]}, headers=AUTH)
    assert res.status_code == 200
    assert res.json()["vectors"] == [[1.0, 0.0], [0.5, 0.5]]
    assert res.json()["dimensions"] == 1024
    sent = upstream.last_json()
    assert sent == {
        "model": "Qwen/Qwen3-Embedding-0.6B",
        "input": ["a", "b"],
        "dimensions": 1024,
    }


def test_embed_count_mismatch_is_502(client: TestClient, upstream: Upstream) -> None:
    upstream.respond_json(200, {"data": [{"index": 0, "embedding": [1.0]}]})
    res = client.post("/v1/embed", json={"texts": ["a", "b"]}, headers=AUTH)
    assert res.status_code == 502


def test_readyz_reports_each_backend(client: TestClient, upstream: Upstream) -> None:
    def handler(request: httpx.Request) -> httpx.Response:
        if request.url.port == 8002:
            raise httpx.ConnectError("down")
        return httpx.Response(200, json={"data": []})

    upstream.handler = handler
    res = client.get("/readyz", headers=AUTH)
    assert res.status_code == 200
    assert res.json() == {"llm": True, "stt": False, "embed": True}
