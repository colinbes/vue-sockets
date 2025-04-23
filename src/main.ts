import './assets/main.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import { worker } from '@/mocks/browser'

async function enableMocking() {
  // await worker.start({
  //   onUnhandledRequest(req: Request, print) {
  //     const pathname = URL.parse(req.url)?.pathname
  //     if (pathname?.startsWith('/src/')) {
  //       return
  //     }
  //     print.warning()
  //   }
  // })
  await worker.start()
}

(async () => {
  await enableMocking()

  const pinia = createPinia()
  const app = createApp(App)
  app.use(pinia)
  app.mount('#app')

})()

