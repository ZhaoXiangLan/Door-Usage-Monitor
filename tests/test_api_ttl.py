# test the TTL functionality of the API
def test_post_contains_expireAt(client):
    test_client, fake_collection = client

    response = test_client.post(
        "/api/data",
        json={"state": "open"},
        headers={"x-api-key": "test-api-key"}
    )

    assert response.status_code == 200

    assert len(fake_collection.records) == 1
    record = fake_collection.records[0]

    assert "expireAt" in record

    from datetime import datetime
    assert isinstance(record["expireAt"], datetime)

    assert record["expireAt"] > datetime.now(record["expireAt"].tzinfo)

