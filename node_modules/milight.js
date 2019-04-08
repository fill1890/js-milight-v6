#!/usr/bin/env node

const dgram = require('dgram')

const hexChar = ["0", "1", "2", "3", "4", "5", "6", "7","8", "9", "A", "B", "C", "D", "E", "F"];
function byteToHex(b) {
    return hexChar[(b >> 4) & 0x0f] + hexChar[b & 0x0f];
}

const create_hex = msg => Buffer.from(msg.replace(/\s/g, ''), 'hex')
const connect_string = "20 00 00 00 16 02 62 3A D5 ED A3 01 AE 08 2D 46 61 41 A7 F6 DC AF D3 E6 00 00 1E"
const ka_string = "D0 00 00 00 02 WB1 00"
const cmd_string = "80 00 00 00 11 WB1 WB2 00 SN 00 PL ZN 00 CS"
const pl_string = "31 00 00 08 LF LV 00 00 00"

const map = (num, in_min, in_max, out_min, out_max) => {
    return (num - in_min) * (out_max - out_min) / (in_max - in_min) + out_min
}

const prep_pl = (lf, lv) => pl_string.replace('LF', lf).replace('LV', lv)

const milight_connect = (host, port) => {
    const socket = dgram.createSocket('udp4')

    const promise = new Promise((resolve, reject) => {
        socket.once('msg', (msg, rinfo) => {
            resolve({
                host: host,
                port: port,
                flow: 0,
                wbid_1: byteToHex(msg[19]),
                wbid_2: byteToHex(msg[20]),
                socket: socket
            })
        })
        socket.once('err', reject)
    })

    socket.send(create_hex(connect_string))
    return promise
}

const milight_send = (socket, command) => {
    socket.flow += 1

    command = command.replace('WB1', byteToHex(socket.wbid_1))
        .replace('WB2', byteToHex(socket.wbid_2))
        .replace('SN', byteToHex(socket.flow))

    const promise = new Promise((resolve, reject) => {
        socket.once('msg', resolve)
        socket.once('error', reject)
    })

    socket.socket.send(command)
    return promise
}

const milight_keepalive = socket => {
    return milight_send(socket, ka_string)
}

const bulbs = Object.freeze({
    RGBWW: 0,
    RGBW: 1,
    WW: 2,
    WHITE: 3
})

const modes = Object.freeze({
    FADE: 0,
    FADE_WHITE: 1,
    FADE_RGB: 2,
    DISCO_A: 3,
    DISCO_B: 4,
    DANCE_RED: 5,
    DANCE_GREEN: 6,
    DANCE_BLUE: 7,
    DANCE_WHITE: 8
})

const bridge = {
    port: 5987,
    delay: 75,
    repeat: 2,
    ka_interval: 5,

    _socket: null,
    _ka_timeout: null,

    all: _ => this.zone = 0,
    set zone(z) {
        this._zone = z
        return this
    },
    _zone: 0,

    send: (payload) => {
        const cmd = cmd_string
            .replace('ZN', byteToHex(this._zone))
            .replace('PL', payload)

        return milight_send(this._socket, cmd)
    },

    chain: ([payload, ...other]) => {
        if (payload === []) return

        send(payload)
        window.setTimeout(chain, this.delay, other)
    },

    //transition: (transitions, time) => {},

    disconnect: () => {
        this._socket.socket.close()
        window.clearInterval(this._ka_timeout)
    }
}

const bulb_ww = {
    white: temp => {
        const clean_temp = map(temp, 2700, 6500, 0, 100)
        return prep_pl('05', byteToHex(parseInt(clean_temp)))
    }
}

const bulb_rgb = {
    mode: m => prep_pl('04', byteToHex(m)),
    increaseSpeed: _ => prep_pl('04', '03'),
    decreaseSpeed: _ => prep_pl('04', '04'),
    saturation: val => prep_pl('02', byteToHex(val)),
    rgb: (r, g, b) => {
        // Need to convert in groups of 85
        // R primary: 0 + (g-b)/(max-min)
        // G primary: 2 + (b-r)/(max-min)
        // B primary: 4 + (r-g)/(max-min)
        
        const max = Math.max(r, g, b),
            min = Math.min(r, g, b)

        let res = 0

        switch(max) {
            case r:
                res = (g - b)/(max - min)
                break
            case g:
                res = 2 + (b - r)/(max - min)
                break
            case b:
                res = 4 + (r - g)/(max - min)
                break
        }

        console.log(res)

        if (res < 0) res += 1

        res *= 85 / 2

        console.log(res)

        return prep_pl('01', byteToHex(res))
        
    }
}

const bulb_base = {
    on: _ => prep_pl('04', '01'),
    off: _ => prep_pl('04', '02'),
    night: _ => prep_pl('04', '05'),
    brightness: val => prep_pl('03', byteToHex(val))
}

const connect = (host, options) => {
    const new_bridge = Object.assign(bridge, options)
    new_bridge.host = host

    return milight_connect(host, new_bridge.port)
    .then((socket) => {
        new_bridge._socket = socket

        new_bridge._ka_timeout = window.setInterval(() => {
            milight_keepalive(socket)
        }, new_bridge.ka_interval)

        return new_bridge
    })
}

const light = (bulb) => {
    const base = Object.assign({}, bulb_base)
    
    console.log(base)

    switch(bulb) {
        case bulbs.RGBWW:
            Object.assign(base, bulb_ww, bulb_rgb)
            break
    }

    return base
}

module.exports = {
    connect: connect,
    light: light,
    bulbs: bulbs,
    modes: modes,
}
