# Test root endpoint
def test_root(client):
    test_client, _ = client
    response = test_client.get("/")

    assert response.status_code == 200
    assert response.json() == {"message": "Server is working"}
# Test entire flow
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