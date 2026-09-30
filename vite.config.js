import {defineConfig} from 'vite'
import react from '@vitejs/plugin-react'
import {viteStaticCopy} from 'vite-plugin-static-copy'
import {resolve} from 'path'

export default defineConfig({
    plugins: [
        react(),
        viteStaticCopy({
            targets: [
                {src: 'src/background.js', dest: ''},
                {
                    src: 'src/content.js',
                    dest: ''
                },
                {src: 'src/content.css', dest: ''}
            ]
        })
    ],
    build: {
        rollupOptions: {
            input: {
                popup: resolve(__dirname, 'index.html')
            },
            output: {
                entryFileNames: '[name].js'
            }
        },
        outDir: 'dist',
        emptyOutDir: true
    }
})
