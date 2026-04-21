import os
import sys
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))
import importlib
from fastapi.testclient import TestClient
import pytest
# These tests verify API functionality, validation, and data processing logic.

# Fake MongoDB collection for testing (no real database)
class FakeCollection:
    def __init__(self):
        self.records = []
        self.inserted = []

    def find(self, *args, **kwargs):
        return self.records

    def insert_one(self, record):
        self.inserted.append(record)
        self.records.append(record)
        return {"acknowledged": True}

# Setup test client and replace real DB with fake DB
@pytest.fixture
def client(monkeypatch):
    os.environ["MONGO_URI"] = "mongodb://fake" # fake DB URI
    os.environ["API_KEY"] = "test-api-key"  # test API key

    import api.data as data_module
    importlib.reload(data_module) # reload module with new env

    fake_collection = FakeCollection()
    monkeypatch.setattr(data_module, "collection", fake_collection) # replace DB

    test_client = TestClient(data_module.app) # create test client
    return test_client, fake_collection

