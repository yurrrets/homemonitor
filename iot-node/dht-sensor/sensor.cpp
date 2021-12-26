#include "sensor.h"
#include <stdlib.h>
#include <time.h>


inline float nextf()
{
    return rand() / float(RAND_MAX);
}

void dht_init()
{
    srand(time(NULL));
}

DhtReadResult dht_readValue(int gpioNo)
{
    DhtReadResult ret;
    if (rand() % 4 == 0)
    {
        ret.valid = false;
        ret.temp = 0;
        ret.humidity = 0;
        return ret;
    }
    ret.valid = true;
    ret.temp = 23 + (nextf() - .5f);
    ret.humidity = 42 + 5*(nextf() - .5f);
    return ret;
}
