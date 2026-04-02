from fastapi import FastAPI, Request, HTTPException
from pymongo import MongoClient
from datetime import datetime
from zoneinfo import ZoneInfo
import os

app = FastAPI()

# Read required secrets from environment.
MONGO_URI = os.environ["MONGO_URI"]
API_KEY = os.environ["API_KEY"]
NEW_YORK_TZ = ZoneInfo("America/New_York")
DATABASE_NAME = "esp32_db"
COLLECTION_NAME = "door-usage-data"

# Create Mongo objects once so each request can reuse them.
client = MongoClient(MONGO_URI)
db = client[DATABASE_NAME]
collection = db[COLLECTION_NAME]

def current_time_string():
    # Save timestamps in New York time for consistent reporting.
    return datetime.now(NEW_YORK_TZ).strftime("%Y-%m-%d %H:%M:%S")

@app.get("/api/data")
def health_check():
    return {"message": "Server is working"}

@app.post("/api/data")
async def receive_data(request: Request):
    # Accept writes only from clients with the shared API key.
    api_key = request.headers.get("x-api-key")
    if api_key != API_KEY:
        raise HTTPException(status_code=401, detail="Unauthorized")

    body = await request.json()
    state = body.get("state")
    device = body.get("device", "esp32")

    if state is None:
        raise HTTPException(status_code=400, detail="Missing state")

    record = {
        "time": current_time_string(),
        "state": state,
        "device": device
    }
    collection.insert_one(record)

    return {"message": "Data saved"}