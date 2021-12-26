const dht_sensor = require('./build/Release/dht-sensor.node')
const config = require('./config').config
const https = require('https')


function delay(t, val) {
    return new Promise(function(resolve) {
        setTimeout(function() {
            resolve(val);
        }, t);
    });
}


async function send_message(data) {
    //const httpData = new TextEncoder().encode(
        const httpData =    JSON.stringify({ ...config.messageAuth, ...data })
    //)
    console.log('httpData: '+httpData)

    let httpOpts = { 
        ...config.httpOptions,
        headers: {
            'Content-Type': 'application/json',
            'Content-Length': httpData.length
        }
    }

    console.log('httpOpts: '+JSON.stringify(httpOpts))

    return new Promise(function(resolve, reject) {
        const req = https.request(httpOpts, res => {
            // console.log(`statusCode: ${res.statusCode}`)
        
            // res.on('data', d => {
            // process.stdout.write(d)
            resolve(res)
        })
        
        req.on('error', error => {
            reject(error)
        })
        
        req.write(httpData)
        req.end()
    })
}

async function main() {
    console.log('hello world!')
    for (let i = 0; i < 2; i++) {
        await delay(200)
        const dhtval = dht_sensor.dhtValue()
        if (dhtval)
            console.log(`i = ${i}, temp = ${dhtval.temperature} humid = ${dhtval.humidity}`)
        else
            console.log(`i = ${i}, temp / humid = [n/a]`)

        send_message({ dhtval: dhtval }).then(
            data => { console.log(`sent ok, status=${data.statusCode}`) },
            err => { console.log(`sent err: ${err}`) }
        )
    }
}

main().then(
    x => {},
    err => { console.log("Error in main: "+err)}
)