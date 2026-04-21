# Door Usage Monitor - Project Requirements

## Overview
The Door Usage Monitor is an IoT-based system for monitoring door activity in a building.  
ESP32 devices detect door open events, send the data to a cloud API, store the records in MongoDB, and display the results on a web dashboard.

---

## Tech Stack
- **Language:** Python 3.11+ , JavaScript , and html
- **Backend Framework:** FastAPI
- **Database:** MongoDB Atlas
- **Validation:** Manual request validation using FastAPI request handling
- **Testing:** pytest, pytest-asyncio
- **Device Platform:** ESP32 (Arduino framework)
- **Frontend:** React
- **Deployment:** Vercel

---

## User Stories

### As an ESP32 door device, I need to:
- Detect whether a door is open
- Send door event data to the backend API
- Include a unique device ID in each request
- Receive confirmation when data is stored successfully
- Be rejected if authentication is missing or invalid

### As a dashboard user, I need to:
- View recent door activity
- View historical door event records
- See hourly usage summaries
- Identify which door generated each event
- See updated data automatically without manually reloading
- View the door activity using graph

### As a system administrator, I need to:
- Configure the database connection using environment variables
- Configure API key authentication
- Ensure timestamps are generated consistently on the server
- Handle multiple ESP32 devices sending data
- Receive clear error messages when failures happen
---

## Non-Functional Requirements
- The API should respond quickly for normal single-request operations.
- The system should handle multiple updates without data loss.
- The server shall generate timestamps in the EDT timezone.
- Input validation shall return clear error messages.
- The project should be easy to deploy using environment variables.
- The dashboard should refresh automatically every few seconds.

---

## Related Specifications
- [Data Models](2_data_models.md)
- [API Specification](3_api_spec.md)
- [Test Cases](4_tests.md)

---

## Proposed File Structure

```text
Door-Usage-Monitor/
├── api/
│   └── data.py                     # FastAPI backend
│
├── app/
│   ├── app.jsx                     # React main component
│   └── main.jsx                    # React entry point
│
├── Esp32-Door-Usage/
│   ├── include/
│   │   └── README                  # Header files description
│   ├── lib/
│   │   └── README                  # External libraries
│   ├── src/
│   │   ├── main.cpp                # Main ESP32 program
│   │   ├── sender.cpp              # HTTP sending logic
│   │   ├── sender.h
│   │   ├── wifi_connect.cpp        # WiFi connection logic
│   │   ├── wifi_connect.h
│   │   └── secrets.h               # WiFi/API credentials
│   ├── test/
│   │   └── README                  # ESP32 test files
│   ├── platformio.ini              # ESP32 project configuration
│   └── .gitignore
│
├── Specfiles/
│   ├── 1_requirements.md           # Project requirements
│   ├── 2_data_models.md            # Data models
│   ├── 3_api_spec.md               # API specification
│   └── 4_tests.md                  # Test cases
│
├── tests/                          # Backend tests
│   ├── conftest.py                 # pytest config
│   ├── test_api_get_data.py        # test GET /api/data
│   ├── test_api_post_data.py       # test POST /api/data
│   ├── test_api_root.py            # test root path
│   └── test_api_ttl.py             # test ttl auto-delete
│
├── index.html                      # Frontend HTML entry
├── index.jsx                       # React root file
├── package.json                    # Frontend dependencies
├── package-lock.json               # dependency lock file
├── vite.config.js                  # Vite configuration
│
├── requirements.txt                # Python dependencies
├── README.md                       # Project overview
└── .gitignore
```