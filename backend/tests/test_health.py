from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)


def test_health_check_status_200():
    response = client.get("/health")
    assert response.status_code == 200


def test_health_check_returns_ok():
    response = client.get("/health")
    assert response.json()["status"] == "ok"


def test_health_check_returns_version():
    response = client.get("/health")
    assert "version" in response.json()
