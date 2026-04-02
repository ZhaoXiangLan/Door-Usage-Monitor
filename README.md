# Final Project: Door Usage

## Project Proposal

A door usage monitoring system for three doorways in the ENGR building using a cloud database.

## Project Overview

The goal of this project is to design a system that detects when a door opens and closes, then sends the data to a cloud database. The system focuses on reliable detection and data logging rather than complex sensor behavior.

---

## Data Collection

The system will collect the following data:

### 1. **Door Event**
The system will record when a door is opened and closed.

### 2. **Timestamp**
The time of each event will be recorded.

**Why this data is collected:**
- Monitor door usage and general traffic through a doorway.
- Determine busy times of the day.
- Enable simple notifications based on door usage data.
- Estimate building usage.
- Collecting door events, door IDs, and timestamps allows us to interpret the data in many ways.

---

## Hardware

### 1. **ESP32 Development Board**

The ESP32 has built-in Wi-Fi and Bluetooth modules that can send data to the cloud.

### 2. **Reed Switch Sensor**

Used to detect when a door opens and closes by sensing the presence of a magnet.

### 3. **Power Supply**

Provides power for ESP32 and sensors.

### 4. **Jumper Wires and Breadboard**

Used for wiring the system.

---
## Backend
The backend will be responsible for receiving the data from the ESP32 and
storing it in a cloud database.

### How it works
- When the reed switch detects a change in door state (open or closed), the ESP32 will then send a JSON file to the cloud server.
- The server will receive the data and store it in a MongoDB database.
- Each data transmission, or JSON file, will include the following: door ID, updated
  count, and timestamp.
  
## Frontend

### Dashboard

**The dashboard will allow the user to:**
- View the current traffic of each door.
- View charts of door activity over time.
- Monitor busy time periods.

### Possible Features

- Door usage history (daily or weekly graphs).
- Alerts when the count exceeds a threshold per hour.
- Other metadata such as: average usage per doorway (per day, week, month),
  most active doorway, highest and lowest count per hour of each, etc.

---
