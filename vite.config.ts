import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path';
import dynamicImport from 'vite-plugin-dynamic-import'

export default defineConfig({
  plugins: [react(), dynamicImport()],
  assetsInclude: ['**/*.md'],
  resolve: {
    alias: {
      '@': path.join(__dirname, 'src'),
    },
  },
  server: {
    host: true, // Crucial: Allows access from outside the container
    port: 3000,
    strictPort: true,
    allowedHosts: [
      'localhost',
      '127.0.0.1',
      'ec.sdebiehome.co.za' // Add your domain here
    ],
    proxy: {
      // Directs frontend calls to the Docker service name
      '/api': {
        target: 'http://backend:8080',
        changeOrigin: true,
        secure: false
      }
    },
    watch: {
      usePolling: true, // Necessary for file changes to sync on Proxmox/VMs
    }
  },
  build: {
    outDir: 'build'
  }
})