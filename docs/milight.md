### milight API docs

* Module: milight
  * milight.connect(host[, options])
  * Class: milight.bridge
    * bridge.all()
    * bridge.zone(zone)
    * bridge.send(payload)
    * bridge.chain(payloads)
    * bridge.transition(transitions, time)
    * bridge.disconnect()
  * Class: milight.light
    * milight.light(bulb)
    * light.on()
    * light.off()
    * light.night()
    * light.increaseSpeed()
    * light.decreaseSpeed()
    * light.mode(mode)
    * light.white(temp)
    * light.hsl(h, s, l)
    * light.rgb(r, g, b)
    * light.brightness(val)
    * light.saturation(val)
  * milight.bulbs
  * milight.modes

# Module: milight

This module provides an API for interacting with a MiLight V6 bridge.

### milight.connect(host[, options])

* `host` <string> IP address of bridge
* `options` <Object>
  * `port` <integer> Port to connect to, default 5987
  * `delay` <integer> Delay in ms between commands, default 75
  * `repeat` <integer> Number of times to repeat each command, default 2
  * `ka_interval` <integer> Time in seconds between keep-alive commands, default 5
* Returns: <milight.bridge>

Connects to a milight bridge and returns a Promise resolving to a bridge object.

Note that milight bridges use UDP as a protocol, with manual keep-alive, flow
control and session IDs; when a connection is 'established', the milight bridge
gives a session ID which is stored by the bridge object, flow control is reset,
and keep-alive commands are scheduled to be sent every 5 seconds by default.

## Class: milight.bridge

A bridge object allows control of a milight bridge.

### bridge.all()

* Returns: milight.bridge

Returns a bridge configured to target all zones for commands.

### bridge.zone(zone)

* `zone` <integer> Number of zone to target
* Returns: milight.bridge

Configures bridge to use given zone and returns bridge.

### bridge.send(payload)

* `payload` <string> String of hex bytes forming payload

Sends the given payload as a light command to the bridge.

Note that payloads should not be hand written; use milight.light to generate
payloads on-the-fly instead.

### bridge.chain(payloads)

* `payloads` <Array>
  * <string> String of hex bytes forming payload

Sends a series of commands to a bridge. Expects an array of milight.light-
generated payloads.

### bridge.transition(transitions, time)

* `transitions` <Array> Transitions to make
  * <(property, start, end)>
    * `property` <function> milight.light function
    * `start` <integer> Start value of property
    * `end` <integer> End value of property
* `time` <integer> Time in seconds to make transition

Transitions lights from one set of values to another. Can make multiple
transitions simultaneously. Note that only non-mutually-exclusive commands
should be transitioned across, e.g. white temp and brightness, but this is not
enforced.

### bridge.disconnect()

Disconnect from the bridge. Once disconnected, the bridge is no longer useful.
If a new connection is required, milight.connect should be used.

## Class: milight.light

Provides convenience functions for generating command payloads for different
kinds of lights.

### milight.light(bulb)

* `bulb` <string> Type of bulb. See milight.bulbs for available bulbs
* Returns: milight.light

Create a light object for generating command payloads.

### light.on(), light.off(), light.night(), light.increaseSpeed(), light.decreaseSpeed()

* `light.on()`: Turn on light
* `light.off()`: Turn off light
* `light.night()`: Turn on light in night mode
* `light.increaseSpeed()`: Increase mode speed
* `light.decreaseSpeed()`: Decrease mode speed

### light.mode(mode)

* `mode` <integer> Mode to set

RGB lights only.

Switch light to given disco mode. See milight.modes.

### light.white(temp)

* `temp` <integer> Light temperature to set

[\*]WW lights only.

Change white temperature of light. Temperature should be between 2700 and 6500,
as a colour temperature. Note that only 100 transition steps are available, so
colours may not be perfect. Will switch the light to white if not already.

### light.hsl(h, s, l)

TODO. Not currently available. May change in future.

Theoretical goal is provide a convenience function for combining RGB and
saturation, to allow 25,500 colours of the RGB spectrum rather than 255 +
separate saturation.

### light.rgb(r, g, b)

* `r, g, b` <integer> Red, green, and blue values for colour.

RGB\* lights only.

Change colour of light. Values should be between 0 and 255 for each value. Note
that only 255 values are available for control, so the actual colour range is
significantly limited. Will switch the light to RGB if not already. Use
saturation if more colours are required.

### light.brightness(val), light.saturation(val)

* `val` <integer> Value to set

Saturation is RGB\* bulbs only.

Change the brightness/saturation of light. Values should be between 0 and 100.
For brightness, 0 is dimmest and 100is brightest; for saturation, 0 is full
colour and 100 is almost full white. Note that saturation is useful for adding
more shades of colour to the available RGB colours.

## milight.bulbs

Object containing the available bulbs for control; use this
when initialising a milight.light to ensure commands are sent correctly.
Not all options may exist.

* `RGBWW`: RGB and variable colour temperature bulbs
* `RGBW`: RGB and fixed white temperature bulbs (not yet implemented)
* `WW`: Variable colour temperature bulbs (not yet implemented)
* `WHITE`: Fixed white temperature bulbs (not yet implemented)

## milight.modes

Available disco modes. May not work on all lights.

* `FADE`: fixed brightness, transition over colour wheel
* `FADE_WHITE`: Fixed white colour temperature, transition over brightness
* `FADE_RGB`: Transition over brightness, switch R, G, B at 0 brightness
* `DISCO_A`: Fixed brightness, cycle R, G, B, yellow, pink, cyan, white
* `DISCO_B`: switch through random brightness, random colour
* `DANCE_RED`: Pulse brightness 0-100-0, flash on-off three times
* `DANCE_GREEN`: See DANCE_RED
* `DANCE_BLUE`: See DANCE_RED
* `DANCE_WHITE`: See DANCE_WHITE

