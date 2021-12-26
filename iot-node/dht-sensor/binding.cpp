#include <napi.h>
#include "sensor.h"

using namespace Napi;

Object DhtValue(const CallbackInfo &info) {
    int gpioNum = info[0].ToNumber();
    DhtReadResult dhtval = dht_readValue(gpioNum);
    if (!dhtval.valid)
        return Object();
    Object ret = Object::New(info.Env());
    ret.Set("temperature", Number::New(info.Env(), dhtval.temp));
    ret.Set("humidity", Number::New(info.Env(), dhtval.humidity));
    return ret;
}

Object Init(Env env, Object exports) {
    dht_init();
    exports.Set("dhtValue", Function::New(env, DhtValue));
    return exports;
}

NODE_API_MODULE(addon, Init)
