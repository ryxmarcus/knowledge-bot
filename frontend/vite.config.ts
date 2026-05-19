import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    allowedHosts: ["b87b01b5255d-10-244-3-234-3000.spca.r.killercoda.com"],
    proxy: {
      '/api': 'http://localhost:3001'
    }
  }
})
