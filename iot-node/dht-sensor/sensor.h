struct DhtReadResult {
    bool valid;
    float temp;
    float humidity;
};

void dht_init();
DhtReadResult dht_readValue(int gpioNo);
