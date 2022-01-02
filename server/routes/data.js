var express = require('express');
var router = express.Router();
var logger = require('morgan');
var config = require('../config')

const keys = config.iot_node_keys

let msg_data = { }

/// init msg_data with key-value pair, where key is iot-node key and value is an obj holding message data
function init_msg_data() {
    for (key in keys) {
        msg_data[key] = {
            start : {
                lasttime: null
            },
            ping : {
                lasttime: null
            },
            temphumid : {
                lasttime: null,
                temperature: 0,
                humidity : 0
            }
        }
    }
}

function retres(err_code, err_text) {
    return  {
        err_code: err_code,
        err_text: err_text
    }
}

// nodify msg_data
function processSendRequest(data) {
    if (!data || !data.type || !data.key)
        return retres(1, "Invalid request format")
    if (!(data.key in keys))
        return retres(2, "Key not found")
    let obj = msg_data[data.key]
    switch (data.type) {
        case "start":
            obj.start.lasttime = Date.now()
            break
        case "ping":
            obj.ping.lasttime = Date.now()
            break
        case "temphumid":
            obj.temphumid.lasttime = Date.now()
            if(typeof data.temperature !== 'undefined') {
                obj.temphumid.temperature = data.temperature
                obj.temphumid.humidity = data.humidity
            }
            break
        default:
            return retres(3, "Unknown message type")
    }
    return retres(0)
}


router.get('/', function(req, res, next) {
    res.render('data', { keys: keys, msg_data: msg_data });
});

router.post('/send', function(req, res, next) {
    // console.log("post data received: "+JSON.stringify(req.body))
    ret = processSendRequest(req.body)
    res.json(ret)
});


init_msg_data()
module.exports = router;
