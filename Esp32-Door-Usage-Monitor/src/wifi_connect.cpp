#include <WiFi.h>
#include <Arduino.h>
#include "wifi_connect.h"
#include "secrets.h"

extern "C" {
  #include "esp_wpa2.h"
  #include "esp_wifi.h"
}

void connectWiFi() {
  Serial.println("Trying multiple WiFi networks...");

  for (int i = 0; i < wifiCount; i++) {
    Serial.print("Connecting to: ");
    Serial.println(ssidList[i]);

    WiFi.begin(ssidList[i], passwordList[i]);

    int retry = 0;
    while (WiFi.status() != WL_CONNECTED && retry < 10) {
      delay(1000);
      Serial.print(".");
      retry++;
    }

    if (WiFi.status() == WL_CONNECTED) {
      Serial.println("\nConnected!");
      Serial.print("SSID: ");
      Serial.println(ssidList[i]);
      Serial.print("IP: ");
      Serial.println(WiFi.localIP());
      return;
    }

    Serial.println("\nFailed, trying next...\n");
  }

  Serial.println("Could not connect to any WiFi.");
}

void connectEnterpriseWiFi() {
  Serial.println("Trying to connect to Enterprise WiFi...");

  WiFi.disconnect(true);
  delay(500);
  WiFi.mode(WIFI_STA);

  if (enterpriseSSID == nullptr || enterpriseUsername == nullptr || enterprisePassword == nullptr) {
    Serial.println("Enterprise WiFi config missing.");
    return;
  }

  WiFi.begin(
    enterpriseSSID,
    WPA2_AUTH_PEAP,
    enterpriseUsername,   // identity
    enterpriseUsername,   // username
    enterprisePassword    // password
  );

  int retry = 0;
  while (WiFi.status() != WL_CONNECTED && retry < 15) {
    delay(1000);
    Serial.print(".");
    retry++;
  }

  if (WiFi.status() == WL_CONNECTED) {
    Serial.println("\nConnected to Enterprise WiFi!");
    Serial.print("SSID: ");
    Serial.println(enterpriseSSID);
    Serial.print("IP: ");
    Serial.println(WiFi.localIP());
  } else {
    Serial.println("\nFailed to connect to Enterprise WiFi.");
  }
}