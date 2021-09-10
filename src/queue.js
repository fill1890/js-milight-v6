/*
Provides an automated transmission queue with optional keep-alive transmission at intervals

Initialising:

`Queue.createQueue({props})`

Returns a new queue with given properties, as follows:

`interval`: Interval between transmissions, defaults to 75ms
`ka_interval`: Interval between keep-alive transmissions, defaults to 5s
`ka_msg`: Message to send for keep-alive; disabled if not provided
`transmit`: Function to call for transmission
`transmit_callback`: Callback after transmission (optional)

Add messages to the queue using `queue.push({msg: message[, id: id]})`
Stop the queue with `queue.stop()`. Note this should be done for stopping keep-alive

Any messages in the queue will be fired every `interval`
Keep-alive messages will be fired after `ka_interval` with no other transmissions
Keep-alive messages are disabled if `ka_msg` is not provided
Will call `transmit(message)` to transmit a message
Will call `transmit_callback([id])` upon transmission. `id` will be sent if given, will be -1 for keep-alive
*/

const Queue = {
    // Message queue
    messages: [],
    timeout: undefined,
    interval: 75,
    ka_interval: 5000,
    ka_msg: '',

    /*
     * push({message: msg[, id: id]}): Add a message to the queue
     *
     * @param msg: Message to send
     * @param id: Optional id, used in transmission callback
     */
    push: function(msg) {
        this.messages.push(msg)
        if(typeof this.timeout === 'undefined') {
            this.shift()
        }
    },

    /*
     * shift(): Timeout handler for sending messages
     *
     * Should only be used internally
     */
    shift: function() {
        if(this.messages.length > 0) {
            this.send_msg(this.messages.shift())

            this.timeout = setTimeout(this.shift.bind(this), this.interval)
        } else {
            this.timeout = undefined
        }
    },

    /*
     * send_msg: Send a message
     *
     * @param msg: Message to send in form of {msg: message[, id: id]}
     *
     * Should only be used internally
     */
    send_msg: function(msg) {
        clearInterval(this.ka_timer)
        this.transmit(msg.msg)

        // This feels wrong but I don't know a better way to do it
        if(msg.hasOwnProperty('id') && this.hasOwnProperty('transmit_callback')) {
            this.transmit_callback(msg.id)
        } else if(this.hasOwnProperty('transmit_callback')) {
            this.transmit_callback()
        }

        if(this.ka_msg !== '') {
            this.ka_timer = setInterval(this.send_ka.bind(this), this.ka_interval)
        }
    },

    /*
     * send_ka: Send a keepalive
     *
     * Should only be used internally
     */
    send_ka: function() {
        this.send_msg({msg: this.ka_msg, id: -1})
    },

    /*
     * stop(): Stop the queue
     */
    stop: function() {
        clearTimeout(this.timeout)
        clearInterval(this.ka_timer)
    }
}

/*
 * createQueue(props)
 *
 * Create and start a new queue with properties as following Queue
 *
 * Required: transmit callback to transmit message
 */
createQueue = (props) => {
    let queue = Object.assign(Object.create(Queue), props)

    if(queue.ka_msg !== '')
        queue.ka_timer = setInterval(queue.send_ka.bind(queue), queue.ka_interval)

    return queue
}

module.exports = {
    createQueue: createQueue
}
