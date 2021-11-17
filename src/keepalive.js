function KeepaliveError(msg) {
    this.name = 'KeepaliveError'
    this.message = msg
}

/* Keepalive module
 *
 * Runs a keepalive function to maintain a connection when not otherwise transmitting
 *
 * @param Events: Events conforming to {transmit, keepalive}
 * @param event_node: Comms event node
 * @param ka_handler: Callback to transmit a keepalive
 * @param ka_timer: Interval between keepalive messages, default 4s
 * @param ka_threshold: Acceptable number of missed keepalive responses before an error, -1 to disable
 *
 * @returns object with method .stop() to stop the keepalive module
 *
 * @throws KeepaliveError if too many keepalive messages aren't responded to
 *
 * Refer to docs for full info
 */
const start_keepalive = (Events, event_node, ka_handler, ka_timer = 4000, ka_threshold = 5) => {
    let missed = 0

    let timer = setInterval(() => {
        ka_handler()
        missed += 1
        if(missed >= ka_threshold && ka_threshold !== -1) {
            throw new KeepaliveError('Too many keepalive messages missed')
            clearInterval(timer)
        }
    }, ka_timer)

    // Reset the timer when a message is sent out; we don't need to do keepalive if there is active communication
    const on_transmit = () => {
        clearInterval(timer)
        timer = setInterval(ka_handler, ka_timer)
    }

    // Reset the missed counter when we receive a response
    const on_keepalive = () => missed = 0

    event_node.on(Events.transmit, on_transmit)
    event_node.on(Events.keepalive, on_keepalive)

    return {
        stop: () => {
            clearInterval(timer)
            event_node.removeListener(Events.transmit, on_transmit)
            event_node.removeListener(Events.keepalive, on_keepalive)
        }
    }
}

module.exports = start_keepalive
