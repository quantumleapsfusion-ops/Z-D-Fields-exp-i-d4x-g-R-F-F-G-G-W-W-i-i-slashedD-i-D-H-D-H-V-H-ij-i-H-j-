from fastapi.testclient import TestClient

from main import app

client = TestClient(app)


def test_root_reports_operational() -> None:
    response = client.get("/")
    assert response.status_code == 200
    assert response.json() == {"system": "E1-4 Engine", "status": "Operational"}


def test_health() -> None:
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json() == {"ok": True}


def test_cors_allows_production_and_localhost() -> None:
    for origin in ("https://earth1.co", "https://e1-4.com", "http://localhost:3001"):
        response = client.get("/health", headers={"Origin": origin})
        assert response.headers.get("access-control-allow-origin") == origin, origin


def test_cors_rejects_other_origins() -> None:
    response = client.get("/health", headers={"Origin": "https://evil.example"})
    assert "access-control-allow-origin" not in response.headers
