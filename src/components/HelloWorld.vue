<script setup lang="ts">
import type { User } from '@/models/User';
import type { Socket } from 'socket.io-client';
import { onMounted, onUnmounted, ref, type Ref } from 'vue';

/**
 * Test msw for api call
 */
async function getUser(): Promise<User> {
  const response = await fetch('http://localhost:3000/user')
  const user = await response.json()
  console.log(user)
  return user
}

const theUser: Ref<User | undefined> = ref()
const messages: Ref<string[]> = ref([])
const username: Ref<string> = ref('')
let mySocket: Socket

function sendMessage() {
  if (username.value) {
    const name: string = username.value
    mySocket.emit('hello', name)
  }
}

onMounted(async () => {
  // Get user data
  const { SocketService } = await import('@/services/socketService')
  theUser.value = await getUser()
  const newSocket = new SocketService("ws://localhost:3000")

  mySocket = newSocket.connect()

  // Set default username from user data
  if (theUser.value) {
    username.value = theUser.value.firstName
  }

  mySocket.on('message', (data) => {
    const abc = data
    console.log("pushing message", data)
    messages.value.push(data)
  })
})

onUnmounted(() => {
  // Clean up socket connection
  // socketService.disconnect()
})
</script>

<template>
  <div class="hello-container">
    <h1>Hello {{ theUser?.firstName }}</h1>

    <div class="socket-container">
      <h2>Socket.io Demo</h2>

      <div class="form-group">
        <label for="username">Your Name:</label>
        <input id="username" v-model="username" type="text" placeholder="Enter your name" />
        <button @click="sendMessage">Send Hello</button>
      </div>

      <div class="messages-container">
        <h3>Messages:</h3>
        <ul v-if="messages.length > 0">
          <li v-for="(msg, index) in messages" :key="index">{{ msg }}</li>
        </ul>
        <p v-else>No messages yet. Send a hello message to start!</p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.hello-container {
  max-width: 600px;
  margin: 0 auto;
  padding: 20px;
}

.socket-container {
  margin-top: 30px;
  padding: 20px;
  border: 1px solid #ddd;
  border-radius: 8px;
  background-color: #f9f9f9;
}

.form-group {
  margin-bottom: 20px;
}

label {
  display: block;
  margin-bottom: 5px;
  font-weight: bold;
}

input {
  padding: 8px;
  width: 100%;
  max-width: 300px;
  margin-bottom: 10px;
  border: 1px solid #ccc;
  border-radius: 4px;
}

button {
  padding: 8px 16px;
  background-color: #4CAF50;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

button:hover {
  background-color: #45a049;
}

.messages-container {
  margin-top: 20px;
  padding: 15px;
  background-color: white;
  border: 1px solid #eee;
  border-radius: 4px;
  min-height: 150px;
}

ul {
  list-style-type: none;
  padding: 0;
}

li {
  padding: 8px;
  margin-bottom: 5px;
  background-color: #e9f7ef;
  border-radius: 4px;
}
</style>
