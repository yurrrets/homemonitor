#include "sensor.h"

#ifdef CONFIG_ORANGEPI_I96

#include <wiringPi.h>
#include <stdint.h>

#define MAXTIMINGS	85

void dht_init()
{
    wiringPiSetup();
}

DhtReadResult dht_readValue(int gpioNo)
{
    DhtReadResult ret;
    uint8_t laststate	= HIGH;
    uint8_t counter		= 0;
    uint8_t j		= 0, i;
    float	f;

    // pull the pin high and wait 250 milliseconds
    digitalWrite(gpioNo, HIGH);
    delay(250);

    ret.valid = false;
    ret.temp = 0;
    ret.humidity = 0;

    pinMode( gpioNo, OUTPUT );
    digitalWrite( gpioNo, LOW );
    delay( 20 );
    digitalWrite( gpioNo, HIGH );
    delayMicroseconds( 40 );
    pinMode( gpioNo, INPUT );

    int dht11_dat[5] = { 0, 0, 0, 0, 0 };
    for ( i = 0; i < MAXTIMINGS; i++ )
    {
        counter = 0;
        while ( digitalRead( gpioNo ) == laststate )
        {
            counter++;
            delayMicroseconds( 1 );
            if ( counter == 255 )
            {
                break;
            }
        }
        laststate = digitalRead( gpioNo );

        if ( counter == 255 )
            break;

        if ( (i >= 4) && (i % 2 == 0) )
        {
            dht11_dat[j / 8] <<= 1;
            if ( counter > 6 )
                dht11_dat[j / 8] |= 1;
            j++;
        }
    }

    if ( (j >= 40) &&
         (dht11_dat[4] == ( (dht11_dat[0] + dht11_dat[1] + dht11_dat[2] + dht11_dat[3]) & 0xFF) ) )
    {
        ret.humidity = dht11_dat[0] + 0.1f * dht11_dat[1];
        ret.temp = dht11_dat[2] + 0.1f * dht11_dat[3];
        ret.valid = true;
    }

    return ret;
}


#else

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

#endif
