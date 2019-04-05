const dgram = require('dgram')
const socket = dgram.createSocket('udp4')

const connect_msg = Buffer.from("20 00 00 00 16 02 62 3A D5 ED A3 01 AE 08 2D 46 61 41 A7 F6 DC AF D3 E6 00 00 1E".replace(/\s/g, ''), 'hex')
const command_template = "80 00 00 00 11 WB1 WB2 00 01 00 31 00 00 08 04 02 00 00 00 00 00 3f"

const hexChar = ["0", "1", "2", "3", "4", "5", "6", "7","8", "9", "A", "B", "C", "D", "E", "F"];

function byteToHex(b) {
  return hexChar[(b >> 4) & 0x0f] + hexChar[b & 0x0f];
}

socket.on('error', err => {
    console.log('server error')
})

socket.on('message', (msg, rinfo) => {
    let command = command_template
        .replace('WB1', byteToHex(msg[19]))
        .replace('WB2', byteToHex(msg[20]))
        .replace(/\s/g, '')
    socket.send(Buffer.from(command, 'hex'), 5987, '192.168.1.216')
})

socket.send(connect_msg, 5987, '192.168.1.216')


