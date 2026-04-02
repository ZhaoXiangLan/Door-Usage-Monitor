#include <WiFi.h>
#include <Arduino.h>
#include "wifi_connect.h"
#include "secrets.h"

void connectWiFi() {
  WiFi.mode(WIFI_STA);
  WiFi.disconnect(true, true);
  delay(1000);

  Serial.println("Trying multiple WiFi networks...");

  for (int i = 0; i < wifiCount; i++) {
    Serial.println();
    Serial.print("Connecting to: ");
    Serial.println(ssidList[i]);

    WiFi.disconnect(true, true);
    delay(1000);

    WiFi.begin(ssidList[i], passwordList[i]);

    int retry = 0;
    while (WiFi.status() != WL_CONNECTED && retry < 20) {
      delay(500);
      Serial.print(".");
      retry++;
    }

    Serial.println();

    if (WiFi.status() == WL_CONNECTED) {
      Serial.println("Connected!");
      Serial.print("SSID: ");
      Serial.println(ssidList[i]);
      Serial.print("IP: ");
      Serial.println(WiFi.localIP());
      return;
    }

    Serial.print("Failed. Status = ");
    Serial.println(WiFi.status());
  }

  Serial.println("Could not connect to any WiFi.");
}