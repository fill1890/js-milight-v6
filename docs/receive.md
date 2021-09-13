The receiver module listens to socket for messages and fires events on a given
emitter when certain messages are received, according to matching patterns.

## Usage

`const receiver = start_receiver(socket, patterns, event_node)`

`socket`: Socket receiving messages. Expects a UDP/dgram socket
`patterns`: Event/pattern paired object
`event_node`: Node to fire received events on

`patterns` should have possible events as the keys, and regex patterns as the
values. These will be matched against to determine the appropriate events to
fire on `event_node`

## Behaviour

When started, the receiver will listen for messages on `socket`. When a message
arrives, it will be converted to hex, and pattern matched against the given
patterns in `patterns`; if a match is found, it will fire the key for the
pattern as an event on `event_node`.

For example:

`{
    keepalive: /ka/,
    data: /data[0-9]/
}`

will fire a `keepalive` event if `ka` is matched, and a `data` event if `data0`,
`data1`, etc. is matched.

Note that message buffers on `socket` are interpreted as hex strings.

## Methods

### `receiver.stop()`

Stop listeners. No longer usable afterwards

## Listeners

### `message` on `socket`

Listens for `message` events on `socket` to pattern match against. Converts
message buffers to hex strings before matching.

## Events

Can fire any key in `patterns` as an event on `event_node` if the pattern
matches a message from `socket`.
