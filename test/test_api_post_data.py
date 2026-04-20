# Test POST success case
def test_post_data_success(client):
    test_client, fake_collection = client

    payload = {
        "state": "open",
        "device": "Door_1"
    }

    response = test_client.post(
        "/api/data",
        headers={"x-api-key": "test-api-key"},
        json=payload
    )

    assert response.status_code == 200
    assert response.json() == {"message": "Data saved"}
    assert len(fake_collection.inserted) == 1
    assert fake_collection.inserted[0]["state"] == "open"
    assert fake_collection.inserted[0]["device"] == "Door_1"
    assert "time" in fake_collection.inserted[0]

# Test wrong API key
def test_post_data_unauthorized(client):
    test_client, _ = client

    response = test_client.post(
        "/api/data",
        headers={"x-api-key": "wrong-key"},
        json={"state": "open", "device": "Door_1"}
    )

    assert response.status_code == 401
    assert response.json() == {"detail": "Unauthorized"}

# Test missing state field
def test_post_data_missing_state(client):
    test_client, _ = client

    response = test_client.post(
        "/api/data",
        headers={"x-api-key": "test-api-key"},
        json={"device": "Door_1"}
    )

    assert response.status_code == 400
    assert response.json() == {"detail": "Missing state"}

# Test default device value
def test_post_data_default_device(client):
    test_client, fake_collection = client

    response = test_client.post(
        "/api/data",
        headers={"x-api-key": "test-api-key"},
        json={"state": "open"}
    )

    assert response.status_code == 200
    assert fake_collection.inserted[0]["device"] == "esp32"

# Test invalid state value (if validation exists)
def test_post_data_invalid_state(client):
    test_client, _ = client

    response = test_client.post(
        "/api/data",
        headers={"x-api-key": "test-api-key"},
        json={"state": "banana", "device": "Door_1"}
    )

    assert response.status_code == 400
    assert response.json() == {"detail": "Invalid state"}