<script setup lang="ts">
console.log("--->Loading Dashboard Vue file")
import type { User } from '@/models/User';
import { useSocketStore } from '@/store/socketStore';
import { onMounted, onUnmounted, ref, type Ref } from 'vue';

const socketStore = useSocketStore()

/**
 * Test msw for api call
 */
async function getUser(): Promise<User> {
  const response = await fetch('http://localhost:3000/user')
  // const response = await fetch('/user')
  const user = await response.json()
  console.log(user)
  return user
}

async function doStart(): Promise<void> {
  const response = await fetch('http://localhost:3000/start', {
    method: 'PUT'
  })
}

const theUser: Ref<User | undefined> = ref()
const messages: Ref<string[]> = ref([])
const username: Ref<string> = ref('')

function sendMessage() {
  if (username.value) {
    const name: string = username.value
    socketStore.emit('hello', name)
  }
}

onMounted(async () => {

  try {
    await socketStore.connect()
    messages.value.push('Connected to server')

    socketStore.on('message', (data) => {
      console.log("pushing message", data)
      if (typeof data === 'string') {
        messages.value.push(`<messages> ${data}`)
      } else if (data && typeof data === 'object') {
        messages.value.push(`Received-m: ${JSON.stringify(data)}`)
      }
    })
    socketStore.on('hello', (data) => {
      console.log("pushing hello", data)
      if (typeof data === 'string') {
        messages.value.push(`<hello> ${data}`)
      } else if (data && typeof data === 'object') {
        messages.value.push(`Receiv-h: ${JSON.stringify(data)}`)
      }
    })
    socketStore.on('send:status', (data) => {
      if (typeof data === 'string') {
        messages.value.push(`<send:status>  ${data}`)
      }
    })
  } catch (error) {
    messages.value.push(`Connection error: ${error instanceof Error ? error.message : String(error)}`)
  }

  try {
    // Get user data
    theUser.value = await getUser()

    // Set default username from user data
    if (theUser.value) {
      username.value = theUser.value.firstName
    }
  } catch (err) {
    console.error(`Error tryng to get get ${err}`)
  }
})

onUnmounted(() => {
  socketStore.disconnect()
})
</script>

<template>
  <div class="hello-container">
    <h1>Hello {{ theUser?.firstName }}</h1>

    <div class="socket-container">
      <h2>Socket.io Demo</h2>

      <div class="row">
        <label>Add send:status -> start clicked+seconds to messages</label>
        <button @click="doStart">Start</button>
      </div>
      <hr />
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
  max-width: 900px;
  margin: 0 auto;
  padding: 20px;
}

.row {
  display: flex;
  flex-direction: column;
  margin-bottom: 10px;
}

.socket-container {
  margin-top: 30px;
  padding: 20px;
  border: 1px solid #ddd;
  border-radius: 8px;
  background-color: #f9f9f9;
}

.form-group {
  margin-top: 10px;
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
