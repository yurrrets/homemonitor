const dht_sensor = require('./build/Release/dht-sensor.node')
const config = require('./config').config

if (config.httpOptions.protocol === 'http:') {
    const https = require('http')
} else {
    const https = require('https')
}

let _is_running = true
let _async_ops = []
let _exit_f = null


function delay(t, val) {
    return new Promise(function(resolve) {
        setTimeout(function() {
            resolve(val);
        }, t);
    });
}



function wait_exit() {
    return new Promise(function(resolve) {
        _exit_f = resolve
    })
}

async function app_exit(retcode) {
    _is_running = false
    for (x of _async_ops) {
        await x
    }
    _exit_f(retcode)
}


async function send_message(type, data) {
    //const httpData = new TextEncoder().encode(
        const httpData =    JSON.stringify({ ...config.messages.auth, ...data, type: type })
    //)
    // console.log('httpData: '+httpData)

    let httpOpts = { 
        ...config.httpOptions,
        path: '/data/send',
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Content-Length': httpData.length
        }
    }

    // console.log('httpOpts: '+JSON.stringify(httpOpts))

    return new Promise(function(resolve, reject) {
        const req = https.request(httpOpts, res => {
            // console.log(`statusCode: ${res.statusCode}`)
        
            res.on('data', d => {
                // process.stdout.write(d)
                res.data = d
                resolve(res)
            })
            // resolve(res)
        })
        
        req.on('error', error => {
            reject(error)
        })
        
        req.write(httpData)
        req.end()
    })
}

async function read_send_temphumid() {
    while (_is_running) {
        const dhtval = dht_sensor.dhtValue(config.dhtSensor.gpionum)
        // if (dhtval)
        //     console.log(`i = ${i}, temp = ${dhtval.temperature} humid = ${dhtval.humidity}`)
        // else
        //     console.log(`i = ${i}, temp / humid = [n/a]`)

        send_message("temphumid", dhtval).then(
            data => { console.log(`sent temphumid ok, status=${data.statusCode}, resp=${data.data}`) },
            err => { console.log(`sent temphumid error: ${err}`) }
        )

        await delay(config.messages.tm_temphumid_every)
    }
}

async function send_pings() {
    while (_is_running) {
        send_message("ping").then(
            data => { console.log(`sent ping ok, status=${data.statusCode}, resp=${data.data}`) },
            err => { console.log(`sent ping error: ${err}`) }
        )
        await delay(config.messages.tm_ping_every)
    }
}

async function main() {
    console.log('hello world!')
    send_message("start")
    _async_ops.push( read_send_temphumid() )
    _async_ops.push( send_pings() )
    return await wait_exit()
}

main().then(
    x => {},
    err => { console.log("Error in main: "+err)}
)