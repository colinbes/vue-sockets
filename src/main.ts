import './assets/main.css'

import { createApp } from 'vue'
import App from './App.vue'
import { setupWorker } from 'msw/browser'
import { handlers } from './mocks/handlers'
import { http, HttpResponse, ws } from 'msw'
import { toSocketIo } from '@mswjs/socket.io-binding'
import { worker } from '@/mocks/browser'

async function enableMocking() {
  await worker.start()
}

(async () => {
  await enableMocking()

  const app = createApp(App)
  app.mount('#app')

})()
