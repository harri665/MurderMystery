import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  
  return {
    plugins: [react()],
    envDir: '.',
    server: {
      port: 5173,
      host: true
    },
    define: {
      // Make environment variables available at build time
      'import.meta.env.VITE_API_BASE': JSON.stringify(
        mode === 'development' ? 'http://localhost:3001' : env.VITE_API_BASE
      )
    }
  }
})
