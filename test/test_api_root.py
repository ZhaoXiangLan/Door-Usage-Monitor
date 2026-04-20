# Test root endpoint
def test_root(client):
    test_client, _ = client
    response = test_client.get("/")

    assert response.status_code == 200
    assert response.json() == {"message": "Server is working"}