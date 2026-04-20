# Test GET when no data exists
def test_get_data_empty(client):
    test_client, _ = client
    response = test_client.get("/api/data")

    assert response.status_code == 200
    assert response.json() == {
        "raw_data": [],
        "hourly_data": []
    }

# Test hourly aggregation logic
def test_get_data_hourly_aggregation(client):
    test_client, fake_collection = client

    fake_collection.records = [
        {"time": "2026-04-20 14:10:00", "state": "open", "device": "Door_1"},
        {"time": "2026-04-20 14:20:00", "state": "open", "device": "Door_2"},
        {"time": "2026-04-20 15:05:00", "state": "closed", "device": "Door_1"},
    ]

    response = test_client.get("/api/data")
    data = response.json()

    assert response.status_code == 200
    assert len(data["raw_data"]) == 3
    assert data["hourly_data"] == [
        {"hour": "14", "count": 2},
        {"hour": "15", "count": 1},
    ]