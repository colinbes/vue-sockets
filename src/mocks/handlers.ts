import { http, HttpResponse, ws } from 'msw'
import { toSocketIo } from '@mswjs/socket.io-binding'


const mysocket = ws.link('ws://localhost:3000')

export const handlers = [
  mysocket.addEventListener('connection', (connection) => {
    console.log("adding socket event listener")
    const io = toSocketIo(connection)
    io.client.on('hello', (username) => {
      io.client.emit('message', `hello there, ${username}!`)
    })
  }),
  http.get('http://localhost:3000/user', () => {
    return HttpResponse.json({
      id: 'c7b3d8e0-5e0b-4b0f-8b3a-3b9f4b3d3b3d',
      firstName: 'John',
      lastName: 'Maverick',
    })
  }),
]
