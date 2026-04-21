#include <Arduino.h>
#include <WiFi.h>
#include <HTTPClient.h>
#include <WiFiClientSecure.h>
#include "wifi_connect.h"
#include "sender.h"
#include "secrets.h"

// Pin connected to the door sensor
const int Door_Sensor_Pin = 18;
// Variable to store the last state of the door
int Last_Door_State;
//
unsigned long lastSendTime = 0;
const unsigned long debounceDelay = 300; // 200 ms debounce delay

constexpr const char* deviceId = "Door_2"; // Unique identifier for the device

void setup() {

  Serial.begin(115200);

  connectWiFi();

  pinMode(Door_Sensor_Pin, INPUT_PULLUP);

  Last_Door_State = digitalRead(Door_Sensor_Pin);
}

void loop() {
    int Current_Door_State = digitalRead(Door_Sensor_Pin);

    if (Current_Door_State != Last_Door_State) {

        unsigned long currentTime = millis();

        if (currentTime - lastSendTime >= debounceDelay) {
            lastSendTime = currentTime;  
            Last_Door_State = Current_Door_State;

            String stateStr;

            if (Current_Door_State == HIGH) {
                Serial.println("Door OPEN");
                stateStr = "open";
                // Send data only when state changes
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
                    }
            }else {
                Serial.println("Door CLOSED");
                stateStr = "closed";
            }
        }
    }
    delay(100);
}
