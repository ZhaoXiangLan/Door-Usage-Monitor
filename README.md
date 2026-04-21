# Final Project: Door Usage

## Project Proposal

The project designs an IoT-based door usage monitoring system for the two front doorways in the ENGR building. The system detects door open event and sends the data to a cloud-based database for storage and analysis.

## Project Overview

The goal of this project is to build a reliable and scalable system that detects door activity and logs it to the cloud. The system emphasizes:
Reliable door state detection
Real-time data transmission
Cloud-based data storage
Data visualization through a web dashboard
Rather than focusing on complex sensing techniques, the project prioritizes data collection, consistency, and usability.

---

## Data Collection

The system will collect the following data:

### 1. **Door Event**
The system will record when a door is opened and closed.

### 2. **Device ID**
Identifies which door (sensor) generated the event.

### 3. **Timestamp**
The time of each event will be recorded.

**Why this data is collected:**
- Analyze door usage patterns
- Identify peak usage times
- Estimate building occupancy trends
- Enable future features such as alerts and automation
- Provide meaningful statistics for visualization

---

## Hardware

### 1. **ESP32 Development Board**

The ESP32 provides Wi-Fi connectivity and processes sensor input. It sends door event data to the cloud API.

### 2. **Reed Switch Sensor**

A magnetic sensor used to detect whether the door is open.

### 3. **Power Supply**

Supplies stable power to the ESP32 and sensors.

### 4. **Jumper Wires and Breadboard**

Used to connect components during prototyping.

---

## Backend
The backend is responsible for receiving data from ESP32 devices, validating it, and storing it in the database.

### Technologies Used
- FastAPI (Python)
- MongoDB Atlas (Cloud Database)
### How it works

#### 1. The reed switch detects a door state change
#### 2. The ESP32 sends a JSON request to the backend API
#### 3. The backend validates the request using an API key
#### 4. The backend generates a timestamp
#### 5. The data is stored in MongoDB

### Example JSON Request
```
{
  "state": "open",
  "device": "Door_1"
}
```

#### Stored Data Format
```
{
  "time": "2026-04-20 14:10:00",
  "state": "open",
  "device": "Door_1"
}
```

---

## Frontend
The frontend dashboard provides a visual interface for analyzing door usage data.

### Dashboard

#### Features
- Display real-time door usage data
- Show hourly activity charts
- Compare activity across multiple doors
- Visualize usage trends over time

#### Visualization
- Line chart: Door usage over time

#### Possible Features
- Daily/weekly/monthly statistics
- Alerts for high traffic conditions
- Average usage and peak hour detection
-Historical comparison between doors

---

## System Architecture
```
ESP32 Sensor
     ↓
HTTP POST (JSON)
     ↓
FastAPI Backend (API + Validation)
     ↓
MongoDB Atlas (Cloud Storage)
     ↓
React Frontend
```

---

## CI/CD

### Continuous Integration (CI)

#### GitHub Actions is used to automatically:
- Run backend tests using pytest
- Verify frontend builds

#### Triggered on:
- Code push
- Pull requests

#### Continuous Deployment (CD)
- Automatic deployment on every push
- Production deployment on main branch

---

## Future Improvements
- Add authentication for users
- Add automatic data cleanup (TTL)
- Support more sensors and locations
Improve UI/UX of dashboard