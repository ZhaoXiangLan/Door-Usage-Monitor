#ifndef SECRETS_H
#define SECRETS_H
// Wifi configuration
constexpr const char* ssidList[] = {

};

constexpr const char* passwordList[] = {

};
constexpr const char* enterpriseSSID = ""; // Enterprise WiFi SSID
constexpr const char* enterpriseUsername = ""; // Enterprise WiFi username
constexpr const char* enterprisePassword = ""; // Enterprise WiFi password

constexpr int wifiCount = sizeof(ssidList) / sizeof(ssidList[0]);

constexpr const char* serverUrl = "";// Sserver URL

constexpr const char* apiKey = ""; // API key for backend authentication


#endif 