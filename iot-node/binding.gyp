{
    "variables": {
        "target_platform": "<!(uname -a | grep -q orangepii96 && echo 'orangepi' || echo 'general')"
    },
    "targets": [
        {
            "target_name": "dht-sensor",
            "sources": [
                "dht-sensor/binding.cpp",
                "dht-sensor/sensor.cpp",
            ],
            "include_dirs": [
                "<!@(node -p \"require('node-addon-api').include\")"
            ],
            "dependencies": [
                "<!(node -p \"require('node-addon-api').gyp\")"
            ],
            "cflags!": ["-fno-exceptions"],
            "cflags_cc!": ["-fno-exceptions"],
            "defines": ["NAPI_CPP_EXCEPTIONS"],
            "conditions": [ 
                [ "target_platform=='orangepi'", 
                {
                    "defines": [ "CONFIG_ORANGEPI_I96" ],
                    "libraries": [ "-lwiringPi" ]
                } ]
            ]
        }
    ]
}
