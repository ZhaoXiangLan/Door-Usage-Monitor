#include <Arduino.h>
#include <WiFi.h>
#include <HTTPClient.h>
#include <WiFiClientSecure.h>
#include <Wire.h>
#include <Adafruit_VL53L0X.h>

#include "wifi_connect.h"
#include "sender.h"
#include "secrets.h"

<<<<<<< HEAD
constexpr const char* deviceId = "Door_2"; // Unique identifier for the device

// Pin connected to the door sensor
const int Door_Sensor_Pin = 18;
// Variable to store the last state of the door
int Last_Door_State;
//
unsigned long lastSendTime = 0;
const unsigned long debounceDelay = 300; // 200 ms debounce delay

=======
Adafruit_VL53L0X lox = Adafruit_VL53L0X();

constexpr const char* deviceId = "Door_tof";

unsigned long lastSendTime = 0;
const unsigned long debounceDelay = 500;

// how much closer than the floor reading counts as usage
const int triggerDrop = 300;   // mm
const int resetBuffer = 100;   // mm

int floorDistance = 0;
String Last_Door_State = "closed";

int getDistance() {
    VL53L0X_RangingMeasurementData_t measure;
    lox.rangingTest(&measure, false);

    if (measure.RangeStatus != 4) {
        return measure.RangeMilliMeter;
    }

    return -1;
}

void sendDoorState(String stateStr) {
    if (WiFi.status() == WL_CONNECTED) {
        WiFiClientSecure client;
        client.setInsecure();

        HTTPClient http;
        http.setTimeout(10000);
        http.begin(client, serverUrl);
        http.addHeader("Content-Type", "application/json");
        http.addHeader("x-api-key", apiKey);

        String json = createJson(deviceId, stateStr);

        int code = http.POST(json);

        Serial.print("Response: ");
        Serial.println(code);

        http.end();
    } else {
        Serial.println("WiFi not connected");
    }
}

int calibrateFloorDistance() {
    long total = 0;
    int goodReads = 0;

    Serial.println("Calibrating floor distance... keep doorway empty");

    for (int i = 0; i < 10; i++) {
        int d = getDistance();
        if (d > 0) {
            total += d;
            goodReads++;
            Serial.print("Cal read: ");
            Serial.println(d);
        }
        delay(200);
    }

    if (goodReads == 0) {
        return 0;
    }

    return total / goodReads;
}

>>>>>>> tof-backend-implement
void setup() {
    Serial.begin(115200);
    delay(1000);

    connectWiFi();
    Wire.begin();

    if (!lox.begin()) {
        Serial.println("Failed to find VL53L0X sensor");
        while (1) {
            delay(100);
        }
    }

    Serial.println("VL53L0X started");

    floorDistance = calibrateFloorDistance();

    Serial.print("Baseline floor distance: ");
    Serial.print(floorDistance);
    Serial.println(" mm");

    Last_Door_State = "closed";
}

void loop() {
    int distance = getDistance();

    if (distance == -1) {
        Serial.println("Out of range");
        delay(100);
        return;
    }

    Serial.print("Distance: ");
    Serial.print(distance);
    Serial.println(" mm");

    unsigned long currentTime = millis();

    // object/person under doorway
    if (Last_Door_State == "closed" && distance < (floorDistance - triggerDrop)) {
        if (currentTime - lastSendTime >= debounceDelay) {
            Last_Door_State = "open";
            lastSendTime = currentTime;

            Serial.println("Door OPEN");
            sendDoorState("open");
        }
    }

    // doorway clear again, back near floor distance
    else if (Last_Door_State == "open" && distance > (floorDistance - resetBuffer)) {
        if (currentTime - lastSendTime >= debounceDelay) {
            Last_Door_State = "closed";
            lastSendTime = currentTime;

            Serial.println("Door CLOSED");
            sendDoorState("closed");
        }
    }

    delay(100);
}