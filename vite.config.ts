import {defineConfig, loadEnv} from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'
import {devApiPlugin} from './src/mocks/devApiPlugin.js'

export default defineConfig(({mode}) => {
    const env = loadEnv(mode, process.cwd(), '')
    const proxyTarget = env.VITE_PROXY_TARGET || 'http://localhost:8080';

    const plugins = [
        react(),
        tailwindcss(),
        ...(env.VITE_USE_MOCK_API === 'true' ? [devApiPlugin()] : []),
    ]

    return {
        plugins,
        build: {
            outDir: 'build',
        },
        resolve: {
            alias: {
                '@': path.resolve(__dirname, './src'),
            },
        },
        server: {
            host: true, // Crucial: Allows access from outside the container
            port: 3000,
            strictPort: true,
            allowedHosts: [
                'localhost',
                '127.0.0.1',
                '192.168.1.16',
                'zacommerce.co.za'// Add your domain here
            ],
            proxy: {
                // Directs frontend calls to the backend service
                '/api': {
                    target: proxyTarget,
                    changeOrigin: true,
                    secure: false
                },
                '/graphql': {
                    target: proxyTarget,
                    changeOrigin: true,
                    secure: false
                },
                '/static': {
                    target: proxyTarget,
                    changeOrigin: true,
                    secure: false
                }
            },
            watch: {
                usePolling: true, // Necessary for file changes to sync on Proxmox/VMs
            }
        },
    }
})
