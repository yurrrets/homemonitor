var express = require('express');
var router = express.Router();
var logger = require('morgan');

const keys = {
    "e83249bd3ba79932e16fb1fb5100dafade9954c2" : "home"
}

let msg_data = {
    "e83249bd3ba79932e16fb1fb5100dafade9954c2" : {
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

module.exports = router;
