# API Specification

This document reflects the **current backend implementation in the repo** for the Door Usage Monitor project.

**Repository:** ZhaoXiangLan/Door-Usage-Monitor  
**Backend file:** `api/data.py`

## Overview

The backend is a FastAPI app connected to MongoDB. It stores door usage events in:

- **Database:** `esp32_db`
- **Collection:** `door-usage-data`

Timestamps are generated on the server in the **America/New_York** timezone and saved as strings in the format:

```text
YYYY-MM-DD HH:MM:SS
```

## Current Base Path

There is **no `/api/v1` prefix in the current code**.

The current routes are:

- `GET /api/data`
- `POST /api/data`

---

## GET /api/data

Simple health check route.

### Request

```http
GET /api/data
```

### Success Response (`200 OK`)

```json
{
  "message": "Server is working"
}
```

### Notes

- This route only confirms that the FastAPI app is responding.
- It does **not** currently test MongoDB connectivity.

---

## POST /api/data

Submit a new door event.

### Request

```http
POST /api/data
Content-Type: application/json
x-api-key: THE_API_KEY
```

### Request Body

```json
{
  "state": "open",
  "device": "Door_2"
}
```

### Required Fields

| Field | Type | Required | Description |
|---|---|---:|---|
| `state` | string | Yes | Door event state, such as `"open"` |
| `device` | string | No | Device name or door identifier. Defaults to `"esp32"` if omitted |

### Behavior

The backend:

1. Reads the `x-api-key` header
2. Compares it with the server environment variable `API_KEY`
3. Parses the JSON request body
4. Checks that `state` exists
5. Creates a record with:
   - `time`
   - `state`
   - `device`
6. Inserts that record into MongoDB

### Success Response (`200 OK`)

```json
{
  "message": "Data saved"
}
```

### Stored MongoDB Record

```json
{
  "time": "2026-04-07 18:30:00",
  "state": "open",
  "device": "Door_2"
}
```

### Error Responses

| Status | When | Example |
|---|---|---|
| 401 | Missing or incorrect API key | `"Unauthorized"` |
| 400 | Missing `state` field | `"Missing state"` |

### Notes

- The backend currently accepts **any string** for `state`; it is not restricted to `"open"` or `"closed"` in code.
- For our project, using `"open"` as a generic **door usage event** works with the current backend.
- If `device` is omitted, the backend stores `"esp32"` by default.

---

## Current ESP32 Payload Format

Based on our repo and Arduino code, the ESP32 should send JSON like this:

```json
{
  "state": "open",
  "device": "Door_2"
}
```

And include this header:

```http
x-api-key: THE_API_KEY
```

---

## Example Flow

1. ESP32 detects a door event or ToF pass event
2. ESP32 sends:

```json
{
  "state": "open",
  "device": "Door_2"
}
```

3. Backend validates the API key
4. Backend creates a timestamp in New York time
5. Backend inserts the record into MongoDB
6. Backend responds with:

```json
{
  "message": "Data saved"
}
```

---

## Current Limitations of the Backend

The current backend is intentionally simple. It does **not** currently provide:

- PLACE HERE

So routes like these are **not currently implemented** in the repo:

- `PLACE HERE`