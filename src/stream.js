/* Create a stream
 *
 * @param Events: Object with event macros; should conform to {ready, unready, data}
 * @param event_node: Event emitter
 *
 * @returns stream configured to use event_node
 *
 * See docs for usage
 */
const create_stream = (Events, event_node) => {
    let stream = []
    let ready = false

    const emitter = new EventEmitter()

    const ready_handler = () => {
        ready = true

        if(stream.length > 0) {
            event_node.emit(Events.data, stream.shift())
            ready = false
        }
    }
    const unready_handler = () => ready = false

    event_node.on(Events.ready, ready_handler)
    event_node.on(Events.unready, unready_handler)

    return {
        stop: () => {
            event_node.removeListener(Events.ready, ready_handler)
            event_node.removeListener(Events.unready, unready_handler)
            stream = []
        },
        push: item => {
            stream.push(item)
            if(ready === true) ready_handler()
        }
    }
}

module.exports = create_stream
