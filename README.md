# Final Project: Door Usage Monitor

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

[ESP32 Development Board](https://www.amazon.com/ESP-WROOM-32-Development-Microcontroller-Integrated-Compatibility/dp/B08D5ZD528)

### 2. **Reed Switch Sensor(NC)**

A magnetic sensor used to detect whether the door is open.

[Reed Switch Sensor](https://www.amazon.com/Gebildet-Recessed-Security-Magnetic-Normally/dp/B07YFBG27Y)

### 3. **Power Supply**

Supplies stable power to the ESP32 and sensors.

For this student project, a portable power bank is currently used for simplicity and convenience. Future work is exploring the use of a rechargeable lithium battery combined with a solar panel to achieve a low-maintenance and long-term stable power solution. For permanent deployment, a more reliable and continuous power source will be considered.

### 4. **Jumper Wires**

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

## How to use This Repository
Follow these steps to deploy and run the Door Usage Monitor system.

### 1. Fork the Repository
1. Go to the project repository:
     👉 https://github.com/ZhaoXiangLan/Door-Usage-Monitor
2. Click the "Fork" button (top-right corner)
3. This will create a copy of the repository in your own GitHub account

### 2. Deploy the Project on Vercel
1. Go to [Vercel](https://vercel.com)
2. Click "Add New Project"
3. Import your GitHub repository
4. Vercel will automatically detect and build both frontend and backend

### 3. Set Up Database
1. Go to [MongoDB Atlas](https://www.mongodb.com/) (or any cloud database)
2. Create a database
3. Get your Database Connection String
Example:
```
mongodb+srv://username:password@cluster.mongodb.net/
```

### 4. Configure Environment Variables in Vercel
In your Vercel project settings, add:
| Variable      | Description               |
|---------------|---------------------------|
| Data_Base_URL |Database Connection String |
| API_KEY       | Your custom API key       |

### 5. Clone the Repository
```
git clone https://github.com/ZhaoXiangLan/Door-Usage-Monitor.git
cd Door-Usage-Monitor
```

### 6. Configure ESP32 Firmware
1. Go to:
```
Esp32-Door-Usage-Monitor/src/

```
2. Edit secrets.h
Update:
- WiFi SSID
- WiFi password
- API key
- Server URL (your deployed backend API)

3. Edit main.cpp
Set your device ID:
line 9:
```
constexpr const char* deviceId = "Door_2"; // Unique identifier for the device
```
4. Upload to ESP32
- Open the ESP32 project in PlatformIO
- Select your ESP32 board
- Upload the code

### 7. Hardware Connection
Connect the reed switch:
- One side → GPIO 18
- Other side → GND

### 8. Run the System
1. Power on the ESP32
2. Wait for it to connect to WiFi
3. Open/close the door

### 9.Verify the System
You should see:
- Data stored in MongoDB
- Data shown on the frontend dashboard
- Charts updating with door activity

### What Happens Internally
```
Door opens
   ↓
Reed switch triggers
   ↓
ESP32 sends JSON
   ↓
Vercel API receives data
   ↓
MongoDB stores data
   ↓
Frontend displays results
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