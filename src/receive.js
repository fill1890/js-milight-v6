/* Receiver module
 *
 * Listens for data on a socket and fires a pattern-matched event when data is recieved
 *
 * @param socket: UDP/dgram socket, or any object that fires a 'message' event with a data buffer
 * @param patterns: key/value paired object with events and match patterns
 * @param event_node: Event emitter to hook into
 *
 * @method stop: Stop listening
 *
 * See docs for full usage
 */
const start_receive = (socket, patterns, event_node) => {
    const receiver = msg_buf => {
        const msg = msg_buf.toString('hex')
        Object.entries(patterns).forEach(([e, pattern]) => {
            if(pattern.test(msg)) event_node.emit(e, msg.match(pattern))
        })
    }

    socket.on('message', receiver)

    return {
        stop: () => {
            socket.removeListener('message', receiver)
        }
    }
}

module.exports = start_receive

