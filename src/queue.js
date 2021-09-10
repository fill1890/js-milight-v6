/**
 * Options for the queue
 * @typedef {Object} QueueOptions
 * @property {Function} transmit Function to call for transmission
 * @property {Function} [transmit_callback] Callback after transmission
 * @property {number} [interval=75] Interval between transmissions (ms)
 * @property {number} [ka_interval=5000] Interval between keep-alive transmissions (ms)
 * @property {string} [ka_msg] Message to send for keep-alive, disabled if none present
 */

/**
 * Provides an automated transmission queue with optional keep-alive transmission at intervals.
 * 
 * Any messages in the queue will be fired every `interval`
 * Keep-alive messages will be fired after `ka_interval` with no other transmissions
 * Keep-alive messages are disabled if `ka_msg` is not provided
 * Will call `transmit(message)` to transmit a message
 * Will call `transmit_callback([id])` upon transmission. `id` will be sent if given, will be -1 for keep-alive
 * 
 * @name Queue
 * @extends {QueueOptions}
 */
const Queue = {
    /**
     * A message
     * @typedef {Object} Message
     * @property {string} msg The message content
     * @property {*} [id] The message id, used in transmission callback
     */

    /**
     * Queue of messages to send
     * @type {Array<Message>}
     * @name Queue#message
     */
    messages: [],

    timeout: undefined,
    interval: 75,
    ka_interval: 5000,
    ka_msg: '',

    /**
     * Add a message to the queue for transmission
     * @param {Message} msg New message
     */
    push: function(msg) {
        this.messages.push(msg)
        if(typeof this.timeout === 'undefined') {
            this.shift()
        }
    },

    /**
     * Timeout handler for sending messages
     * @private
     */
    shift: function() {
        if(this.messages.length > 0) {
            this.send_msg(this.messages.shift())

            this.timeout = setTimeout(this.shift.bind(this), this.interval)
        } else {
            this.timeout = undefined
        }
    },

    /**
     * Function to send a message
     * @param {Message} msg The message to send
     * @private
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

    /**
     * Function to send a keepalive message
     * @private
     */
    send_ka: function() {
        this.send_msg({msg: this.ka_msg, id: -1})
    },

    /**
     * Stop the queue, including the keepalive
     */
    stop: function() {
        clearTimeout(this.timeout)
        clearInterval(this.ka_timer)
    }
}

/**
 * Create and start a new queue
 * @param {QueueOptions} props The properties for the queue
 * @returns Queue
 */
function createQueue(props) {
    let queue = Object.assign(Object.create(Queue), props)

    if(queue.ka_msg !== '')
        queue.ka_timer = setInterval(queue.send_ka.bind(queue), queue.ka_interval)

    return queue
}

module.exports = { createQueue }