# Test Specification

## Test Structure

```
tests/
├── conftest.py          # Shared fixtures and fake database
├── test_api_root.py         # Root endpoint tests
├── test_api_get_data.py     # GET /api/data tests
└── test_api_post_data.py    # POST /api/data tests
```

---

## Fixtures

| Fixture Name | Description |
|-------------|------------|
| FakeCollection | Simulates MongoDB collection (no real database needed) |
| client | Creates FastAPI test client and replaces DB with fake |

```python
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
```
---

## API Endpoint Tests

### GET `/`

| Test Name | Setup | Request | Expected Result |
|----------|------|--------|----------------|
| test_root | None | GET / | 200, `{"message": "Server is working"}` |

---

### GET `/api/data`

| Test Name | Setup | Request | Expected Result |
|----------|------|--------|----------------|
| test_get_data_empty | Empty fake DB | GET /api/data | 200, empty `raw_data` and `hourly_data` |
| test_get_data_hourly_aggregation | Insert 3 records | GET /api/data | 200, correct hourly grouping |

---

### POST `/api/data`

| Test Name | Setup | Request | Expected Result |
|----------|------|--------|----------------|
| test_post_data_success | Valid API key | Valid JSON | 200, data saved |
| test_post_data_unauthorized | Wrong API key | Valid JSON | 401 Unauthorized |
| test_post_data_missing_state | Missing `state` | JSON without state | 400 Missing state |
| test_post_data_default_device | Missing device | JSON without device | 200, device = "esp32" |
| test_post_data_invalid_state | Invalid state value | `state="banana"` | 400 Invalid state |

---

## Edge Cases

| Scenario | Expected Behavior |
|---------|-----------------|
| Wrong API key | Request rejected (401) |
| Missing required field | Request rejected (400) |
| Invalid state value | Request rejected (400) |
| No data in database | Empty response returned |

---

## Integration Test

| Test Name | Steps | Expected Result |
|----------|------|----------------|
| test_full_api_flow | POST → GET | Data appears and is counted correctly |

Example:

```python
def test_full_api_flow(client):
    test_client, _ = client

    test_client.post(
        "/api/data",
        headers={"x-api-key": "test-api-key"},
        json={"state": "open", "device": "Door_1"}
    )

    response = test_client.get("/api/data")
    data = response.json()

    assert len(data["raw_data"]) == 1