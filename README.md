# vue-sockets

mwsjs scratchpad
intercepting and responding to getUser api call
provide socket server functionality

## Build browser based worker

build worker `npx msw init ./public --save`

# Caveats

This code is NOT production ready and simply exists to get MSW working.

- On startup, url to fetch John's details will be recall and will be used to auto populate the Your Name text box.
- In addition a socket.io connection will be set up, on connection being establish `Connected to server` message will be sent to client and displaye in messages list.
- Clicking "start" will cause a PUT to api endpoint which via handler will push a socket event `send:status`
- Clicking "Say Hello" will send a `hello` event which will be received by handler and respond with a `message` event
