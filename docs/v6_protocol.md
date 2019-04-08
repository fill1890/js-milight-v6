# V6 Wifi Protocol

This document lays out the basic operations required for interfacing with and controlling
MiLight V6 bridges. Note that due to the limited API information available, not
all commands and responses may be fully described or necessarily correct.

## 1. General interfacing

MiLight bridges utilise a basic UDP interface, connecing over port 5987. Interfacing
requires an initial connection to be made to wake up the device and designate a session ID,
followed by keep-alive messages when commands are not being sent.

Responses from the device generally contain the MAC address of the device; if multiple devices
are being communicated with at once this may be of use.

### 1.1 Initial connection

Transmission:
`20 00 00 00 16 02 62 3A D5 ED A3 01 AE 08 2D 46 61 41 A7 F6 DC AF D3 E6 00 00 1E`
(27 bytes)

Expected response:
`28 00 00 00 11 00 02 {mac address} 69 F0 3C 23 00 01 {WB1 WB2} 00`
(22 bytes)

`WB1, WB2`:
The Wifi Bridge session ID consists of the 20th and 21st bytes of the response. This
should be saved to be used in later commands.

### 1.2 Keep-alive messages

Keep-alive messages should be sent every 5 seconds when commands are not being sent,
to prevent session loss.

Transmission:
`D0 00 00 00 02 {WBID1} 00`
(7 bytes)

Expected response:
`D8 00 00 00 07 {mac address} 01`
(12 bytes)

Note that the transmission only requires the first byte of the session ID to be sent.

## 2. Sending Commands

Protocol documentation suggests a 100ms delay between commands.

### 2.1 Command format

Transmission:
`80 00 00 00 11 {WBID1} {WBID2} 00 {SN} 00 {COMMAND} {ZONE NUMBER} 00 {CHECKSUM}`

Expected response:
`88 00 00 00 03 00 {SN} 00`

Minimal testing suggests that invalid or unsuccessful commands have a trailing byte value
of 1, rather than 0.

### 2.2 Sequence Number

The sequence number is a simple tactic used to overcome the reliability issues with using
UDP as a transmission protocol. Beginning with 0, with each unique command sent the sequence
number is incremented; this allows the commands to remain ordered and duplicate packets to be
ignored. Standard protocol (used by the mobile app) appears to be to send each command twice,
presumably in case of dropped UDP packets.

Whether the sequence number is consistent between the transmission and response has not yet
been tested.

### 2.3 Zone Number

The zone number selects one (or all) of the four zones paired with the wifi bridge.
0 is used to target all four zones at once, otherwise 1-4 for each zone.

### 2.4 Checksum

The checksum is simply the sum of the last 11 bytes of the transmission, not including the
checksum itself - specifically, the bytes that make up the command and the zone number.
Once the checksum is calculated, it is appended to the end of the packet.

### 2.5 Specific commands

Each command is made up of 9 bytes, with two bytes dedicated to a function and a property.
The final 3 bytes are usually 0 - further testing may be warranted to confirm.

#### 2.5.1 Format

Payload:
`31 {PB1 PB2} {RS} {LF} {LV} 00 00 00`
(9 bytes)

#### 2.5.2 Password

The use of the two password bytes is currenctly unclear - documentation does not appear to
describe the circumstances for its use; the default is 0 for both.

#### 2.5.3 Remote style

The remote style byte is used to differentiate between the wifi bridge lamp and RGBW lamps.
For the bridge lamp 0 is used; for RGBW lamps a value of 8.

#### 2.5.4 Functions

|    Function    | Hex |
|:--------------:|:---:|
| Set color      |  01 |
| Set saturation | 02  |
| Set brightness | 03  |
| Misc controls  | 04  |
| Set white temp | 05  |
| Set mode       | 06  |

#### 2.5.5 Function properties

##### 2.5.5.1 Color

Colors consist of an RGB spectrum across values of 0 to 255, where both
0 and 255 are violet.

A list of a selection of hex values and their corresponsing colors if provided below:

```
0x00 Violet
0x10 Royal Blue
0x20 Baby Blue
0x30 Aqua
0x40 Mint
0x50 Seafoam Green
0x60 Green
0x70 Lime Green
0x80 Yellow
0x90 Yellow Orange
0xA0 Orange
0xB0 Red
0xC0 Pink
0xD0 Fusia
0xE0 Lilac
0xf0 Lavendar
```

##### 2.5.5.2 Saturation and brightness

Saturation and brightness are both a scale of 0-100, 0 being the lowest and 100 the highest.

Note that RGBW lamps store brightnesses for colours and white separately; if the colour
brightness is set, for example, to 50, and then the lamp is changed to white and the
brightness set to 76, the colour on return to RGB will return to 50.

##### 2.5.5.3 Controls

THe control function is less a function with properties and more a collection of different
functions that control the light. Values and their function are described below:

```
0x01 Light on
0x02 Light off
0x03 Increase mode speed
0x04 Decrease mode speed
0x05 Night light on
```

##### 2.5.5.4 White color temperature

Note that setting the white color temperature changes the light color to white.

White color temperatures are on a scale of 0-100, with 0 the warmest and 100 the coolest.

A number of values and their corresponding temperatures is provided below:

```
0x00 2700K
0x19 3650K
0x32 4600K
0x4B 5550K
0x64 6500K
```

##### 2.5.5.5 Modes

A number of modes are available. Each follows a pattern which can be increased or decreased
in speed. The modes are listed below.

| Mode |                  Pattern                  |
|:----:|:-----------------------------------------:|
| 1    | Continuous transition between RGB colours |
| 2    | Pulsing white                             |
| 3    | Pulse R, pulse G, pulse B                 |
| 4    | Switch r, g, b, yellow, pink, cyan, w     |
| 5    | Disco                                     |
| 6    | Pulse R, flash x 3                        |
| 7    | Pulse G, flash x 3                        |
| 8    | Pulse B, flash x 3                        |
| 9    | Pulse W, flash x 3                        |

