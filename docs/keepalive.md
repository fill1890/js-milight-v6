The keepalive module tracks messages, sends keepalive messages when necessary
to maintain a connection, and throws an error if too many messages are missed.

## Usage

`const keepalive = start_keepalive(Events, emitter, callback[, timer, threshold])`

`Events`: Object with keys `transmit` and `keepalive`
`emitter`: Event emitter
`callback`: Callback to run for each keepalive message
`timer`: Interval between messages, defaults to 4s
`threshold`: Threshold of missed messages before throwing an error, defaults to 5, -1 to disable

`transmit` and `keepalive` should both refer to strings; `transmit` should be
the name of the message transmission event on `emitter` and `keepalive` the
event for a keepalive response. Note that this assumes another module is
interpreting responses and fires a `keepalive` event

## Behaviour

When a keepalive module is started, it will listen to `emitter` for transmission
and keepalive responses. A countdown of `timer` milliseconds will automatically
be started; when it reaches 0 `callback` will be called to send a keepalive
message.

If a transmission event occures, the timer will be reset - this is based on the
assumption that keepalive messages only need to be sent when no others are.

After `threshold` messages and no keepalive response events, an error will be
thrown. Each time a keepalive response is received, the threshold counter is
reset. Note that this does not require a response for every message for the
counter to be 0.
This behaviour can be disabled by setting `threshold` to -1.

## Methods

### `keepalive.stop()`

Stops the keepalive. Will stop transmitting and clears the
listeners. No longer usable afterwards, start a new one if needed

## Listeners

### `transmit`

Assumes `transmit` is emitted from `emitter` every time a message is sent, to
keep track of when a keepalive message is sent

### `keepalive`

Assumes `keepalive` is emitted from `keepalive` every time a keepalive reponse
is received, to keep track if whether any have been missed

## Errors

### `KeepaliveError`

Fires when `threshold` number of messages have been sent, and during that time
zero keepalive responses have been received. If responses are not expected or
do not need to be verified, `threshold` can be set to -1 to ignore.

