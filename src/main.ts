import './assets/main.css'

import { createApp } from 'vue'
import App from './App.vue'

async function enableMocking() {
  const { worker } = await import('@/mocks/browser')
  console.log("loaded worker")
  return worker.start()
}

(async () => {
  await enableMocking()

  console.log("mock enabled")
  const app = createApp(App)
  app.mount('#app')

})()
