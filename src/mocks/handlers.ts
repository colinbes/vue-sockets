import { http, HttpResponse, passthrough } from 'msw'
import { ws } from 'msw'
import { toSocketIo } from '@mswjs/socket.io-binding'

const mysocket = ws.link('ws://localhost:3000')

let clientRef: any //Pity type for clientRef 'SocketIoConnection' is not exposed here so unable to do type checking.

const sendEvent = () => {
  if (clientRef !== undefined) {
    clientRef.emit("send:status", `start clicked ${new Date().getSeconds()}`)
  }
}

export const handlers = [
  mysocket.addEventListener('connection', (connection) => {
    console.log("adding socket event listener")

    const io = toSocketIo(connection)
    clientRef = io.client

    io.client.on('hello', (event, message) => {
      const username = message
      const resp = `hello there, ${username}!`
      io.client.emit('message', resp)
    })
  }),
  http.put('http://localhost:3000/start', () => {
    sendEvent()
    return new HttpResponse(undefined, { status: 204 })
  }),
  http.get('http://localhost:3000/user', () => {
    return HttpResponse.json({
      id: 'c7b3d8e0-5e0b-4b0f-8b3a-3b9f4b3d3b3d',
      firstName: 'John A',
      lastName: 'Maverick',
    })
  })
]
