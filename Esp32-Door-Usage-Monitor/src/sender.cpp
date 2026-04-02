#include "sender.h"

String createJson(String device, String state) {
    String json = "{";
    json += "\"device\":\"" + device + "\",";
    json += "\"state\":\"" + state + "\"";
    json += "}";
    return json;
}