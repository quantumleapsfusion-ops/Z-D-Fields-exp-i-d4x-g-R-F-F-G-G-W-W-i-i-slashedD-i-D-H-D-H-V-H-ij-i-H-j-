import json
from collections.abc import Callable, Iterator

import httpx
import pytest
from fastapi.testclient import TestClient

from davinci.backends import Backends
from davinci.config import Settings
from davinci.main import create_app

SECRET = "test-secret-0123456789abcdef"
AUTH = {"Authorization": f"Bearer {SECRET}"}

Handler = Callable[[httpx.Request], httpx.Response]


class Upstream:
    """Records every request the gateway makes and answers with the configured handler."""

    def __init__(self) -> None:
        self.requests: list[httpx.Request] = []
        self.handler: Handler = lambda _: httpx.Response(500, text="no handler")

    def __call__(self, request: httpx.Request) -> httpx.Response:
        self.requests.append(request)
        return self.handler(request)

    def respond_json(self, status: int, body: object) -> None:
        self.handler = lambda _: httpx.Response(status, json=body)

    def last_json(self) -> dict[str, object]:
        data: dict[str, object] = json.loads(self.requests[-1].content)
        return data


@pytest.fixture
def settings() -> Settings:
    return Settings(secret=SECRET)


@pytest.fixture
def upstream() -> Upstream:
    return Upstream()


@pytest.fixture
def client(settings: Settings, upstream: Upstream) -> Iterator[TestClient]:
    backends = Backends(settings, transport=httpx.MockTransport(upstream))
    with TestClient(create_app(settings, backends)) as tc:
        yield tc
