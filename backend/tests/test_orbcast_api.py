"""OrbCast Backend API Tests"""
import pytest
import requests
import os

BASE_URL = os.environ.get('EXPO_PUBLIC_BACKEND_URL', '').rstrip('/')


class TestHealth:
    def test_health_returns_200(self):
        r = requests.get(f"{BASE_URL}/api/health")
        assert r.status_code == 200
        data = r.json()
        assert data["status"] == "ok"
        assert "service" in data

    def test_network_info(self):
        r = requests.get(f"{BASE_URL}/api/network-info")
        assert r.status_code == 200
        data = r.json()
        assert "streamUrl" in data

    def test_stream_accessible(self):
        """Stream endpoint should return audio/wav with 200"""
        r = requests.get(f"{BASE_URL}/api/stream", stream=True, timeout=5)
        assert r.status_code == 200
        assert "audio" in r.headers.get("content-type", "")
        r.close()
