import { fileURLToPath, URL } from 'node:url'

import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'

// https://vite.dev/config/
export default defineConfig((env) => {
  const envars = loadEnv(env.mode, './');

  const serverURL = new URL(
    envars.VITE_SERVER_URL ?? '<http://localhost:3000>'
  );
  const serverAPIPath = envars.VITE_SERVER_API_PATH ?? '/api';

  return {
    envDir: './',
    plugins: [
      vue(),
      vueDevTools(),
    ],
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url))
      },
    },
    server: {
      port: 5173,
      proxy: {
        // proxy requests with the API path to the server
        // <http://localhost:5173/api> -> <http://localhost:3000/api>
        [serverAPIPath]: serverURL.origin,
        // '/socket.io': {
        //   target: 'ws://localhost:3000',
        //   ws: true,
        //   rewriteWsOrigin: true,
        // },
      },
    },
  }
})
