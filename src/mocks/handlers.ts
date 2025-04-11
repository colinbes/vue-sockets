import { http, HttpResponse, ws } from 'msw'
import { toSocketIo } from '@mswjs/socket.io-binding'

const mysocket = ws.link('wss://localhost:3002')

export const handlers = [
  mysocket.addEventListener('connection', (connection) => {
    const io = toSocketIo(connection)
    // io.rawServer.connect() ??
    io.client.on('hello', (username) => {
      io.client.emit('message', `hello, ${username}!`)
    })
  }),
  http.get('http://example.com/user', () => {
    // ...and respond to them using this JSON response.
    return HttpResponse.json({
      id: 'c7b3d8e0-5e0b-4b0f-8b3a-3b9f4b3d3b3d',
      firstName: 'John',
      lastName: 'Maverick',
    })
  }),
]
