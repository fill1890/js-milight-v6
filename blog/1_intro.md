# Introduction: Days 1-4, The Story so Far

On Monday, we recieved delivery of some new MiLight RGBW lights, a remote, and a Wifi bridge.
Having set up the phone app and the remote, I decided it was far too inconvenient to have to
take out my phone or find the remote every time I entered or left the room - so I decided that
I would make a control panel.

So far, the idea for the panel is a Raspberry Pi-powered touchscreen panel, roughly 15x10cm
(perhaps smaller), and couple of centimetres deep to allow for the raspberry pi itself,
maybe the wifi bridge, and any other devices needed to power the panel.

I also decided that probably the best way to develop this panel would be to write an Electron-
based app that runs fullscreen on the Pi, which allows for two things: firstly, development on
a different computer; and secondly, a nice UI without fiddling around with GTK or Qt or another
graphics library, including C++ and various other difficult things.

On Monday I pulled out my (ancient, model B) Pi, to begin the project - naturally, whatever was
on the SD card was not, say, a useful Linux installation (if I recall correctly, I may have been
trying to program a pi bare metal style). Clearly, the solution was to simply install Linux on
the SD card - easy, yes?

No. Helpfully, my laptop has an SD card reader; unhelpfully, the hackintosh macOS I use doesn't
recognise it. This wouldn't be an issue with Raspbian, but my preferred distro is Arch Linux,
largely because it's lightweight, and to install Arch ARM a working install of desktop Arch
is needed, which I don't have. After a little wrangling with the problem, I had Arch installed
on a USB key, which I then used to install Arch ARM onto the SD card. I then proceeded to plug
in the Pi and completely ignore it.

The next step in the process was to figure out how to actually communicate with the wifi bridge,
so I did some googling and found a Python library that was supposed to handle all the heavy
lifting (python-milight). It blatantly refused to work at all, so I proceeded to then spend a
few hours figuring out how to set up Wireshark to monitor traffic to and from the wifi bridge
to compare packets from the working phone app with the broken Python library (which resulted in
introducing a second laptop, as a hacked-in macOS isn't exactly reliable when it comes to
packet sniffing). As it turned out, the library was sending completely the wrong messages, so I
decided that instead of dealing with more libraries I would write my own - the python-milight
library was fairly straightword, so I figured it wouldn't be too complicated.

After a lot of searching, I eventually found that there used to be documentation for the bridge
API on the limitlessled.com website - which no longer exists, but someone had stored the
information in a Github repository. Annoyingly, the documentation was a bit of a mess, so I
rewrote it - primarly for my own benefit, so I could actually understand it. Testing with `nc`
(after figuring out how to convert hex into something useful) confirmed that I was on the right
track.

After trying to figure out how to manually send packets to control a light for a while, I
hypothesised that if I was to control a light with a session ID, then based on the keep-alive
time of five seconds I would need to initiate a session and send a command within a five
second timeframe. As it turns out (after a number of hours of pain) Python doesn't seem to be
able to recieve responses to UDP messages, so I switched to Nodejs, and at about 10pm on
Thursday night I managed to complete the euphoric achievement of turning of a light with
a js script.

This brings us to two conclusions:
1. Turning off an RGBW MiLight requires four days of work, and you have to know what you're
doing - it's not following a tutorial.
2. The conclusion of this post!
