import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import { PROD_CONFIG } from './src/config'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')

  console.log('Loaded environment variables:', {
    APP_ID: env.VITE_APP_ID || PROD_CONFIG.APP_ID,
    WS_URL: env.VITE_WS_URL || PROD_CONFIG.WS_URL,
    OAUTH_URL: env.VITE_OAUTH_URL || PROD_CONFIG.OAUTH_URL
  })

  return {
    plugins: [react()],
    server: {
      port: 8443,
    },
    base: '/',
    define: {
      'import.meta.env.VITE_APP_ID': JSON.stringify(env.VITE_APP_ID || PROD_CONFIG.APP_ID),
      'import.meta.env.VITE_WS_URL': JSON.stringify(env.VITE_WS_URL || PROD_CONFIG.WS_URL),
      'import.meta.env.VITE_OAUTH_URL': JSON.stringify(env.VITE_OAUTH_URL || PROD_CONFIG.OAUTH_URL),
      __APP_ENV__: env.APP_ENV
    }
  }
})
