# Test Specification

## Test Structure

tests/
├── conftest.py          # Shared fixtures and fake database
├── test_api_root.py         # Root endpoint tests
├── test_api_get_data.py     # GET /api/data tests
└── test_api_post_data.py    # POST /api/data tests

---

## Fixtures

### FakeCollection
A fake MongoDB collection used to simulate database operations.

- `find()` returns stored records
- `insert_one()` stores new records

### client fixture

Purpose:
- Set fake environment variables
- Load FastAPI app
- Replace MongoDB with FakeCollection

---

## API Endpoint Tests

### Root Endpoint

File: `test_api_root.py`

- `test_root`
  - Check if server is running
  - Expected: 200, {"message": "Server is working"}

---

### GET /api/data

File: `test_api_get_data.py`

- `test_get_data_empty`
  - No data in DB
  - Expected: empty raw_data and hourly_data

- `test_get_data_hourly_aggregation`
  - Multiple records
  - Expected: correct grouping by hour

---

### POST /api/data

File: `test_api_post_data.py`

- `test_post_data_success`
  - Valid request
  - Expected: 200 and data saved

- `test_post_data_unauthorized`
  - Wrong API key
  - Expected: 401

- `test_post_data_missing_state`
  - Missing required field
  - Expected: 400

- `test_post_data_default_device`
  - Missing device
  - Expected: default "esp32"

- `test_post_data_invalid_state`
  - Invalid state value
  - Expected: 400

---

## Edge Cases

- Unauthorized API access
- Missing required fields
- Invalid input values
- Empty database response

---

## Integration Test

Scenario:
1. Send POST request
2. Retrieve data using GET

Expected:
- New record appears in raw_data
- Hourly aggregation updates correctly

---

## Notes

- MongoDB is mocked using FakeCollection
- No real database is required
- Environment variables are faked during testing
- tzdata is required for timezone support
