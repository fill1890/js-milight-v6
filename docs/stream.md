The `stream` object provides a stream that hooks into an event emitter to handle data.

## Usage

`const stream = create_stream(Events, emitter)`

`Events`: Object with keys `data`, `ready`, and `unready`
`emitter`: Event emitter to hook into

`data`, `ready`, and `unready` should all be strings referring to the events to be used in the event emitter.
`data` when the stream sends out data, `ready` to flag to the stream it can send data, and `unready` to flag to the
stream it should not send data.

## Behaviour

Upon creation, the stream will be empty and will accept data, but will not transmit until it has had an explicit
`ready` event. Once it recieves a `ready` event, it will send the first item in the stream (FIFO), then wait for
another `ready` event to continue sending data - in essence, one item per event. If there is not currently any
data in the stream, it will assume listeners are still ready for data, and send data as soon as it is available.

If at any time the stream recieves an `unready` event, it will not process data until it recieves a `ready` event.
This is helpful if the stream is currently ready but waiting for data, and needs to start queueing again.

If the stream is given data while not ready, it will queue the data for processing until it is ready.

## Methods

### `stream.stop()`

Stops the stream. Will clear the processing queue and remove listeners. Will no longer be usable; if it is needed
again another stream should be created.

### `stream.push(item)`

Queue `item` for release when ready.

## Events

### `data`

Emitted when data is available and the stream has received a ready for data event.
Contains the data waiting to be processed in the stream

## Listeners

### `ready`

Flags the stream as ready. If data is currently waiting to be processed, it will be sent out via the `data` event;
if not, the stream will wait for data and immediately send when ready.

### `unready`

Flags the stream as not ready. Will not transmit data until it has recieved a `ready` event.

