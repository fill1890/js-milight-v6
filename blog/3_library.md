# Day 6: The (Actual) Beginning of the Library

Despite yesterday's post claiming that the library had begun, in reality it was
only some protocol documentation and a test script. Today (hopefully) the actual
writing begins.

The repo is now available [online](github.com/fill1890/js-milight-v6).

Step 1: Figure out what to put in a library

I started to write some functions, then realised I had no idea how I actually
wanted to interface with this library, so I wrote a full module doc sheet. It'll
probably change with time and when I realise things are impossible or whatever,
but in the meantime it's a great place to start so that I know which functions I
want and need to implement.

Step 2: Write the library

With most of the hard parts over, the next step was to lay out the classes and
functions in the library file, then fill them in. Most of the functions were
straightforward to implement; the more interesting ones were the rgb setter
(which needed an rgb to 0-255 conversion), white temp (2600-6500 => 0-100),
and the communication functions, which I set up to (hopefully) convert Node
event emitters to promises, which I can pass back up to higher functions or
the library caller. Naturally, a bit of restructuring occured; I added a
socket object to the bridge class which I can pass around instead of passing the
entire bridge to, say, the keep-alive function.

Annoyingly, the promises make it slightly more difficult to test; I'll need to
write a small wrapper script to allow the promises to resolve and handle them
gracefully before I can actually start sending commands. I also need to write
the transition function, since that'll need a bit of algorithmic work.

Also on the todo list is to add a fair amount of error handling, which is in
place in some lower level functions but needs to be added to the actual classes,
clean up significant portions of the utility code, and actually do some testing
to see if it even works or not.
