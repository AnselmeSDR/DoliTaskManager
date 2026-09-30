import {defineConfig} from 'vite'
import react from '@vitejs/plugin-react'
import {viteStaticCopy} from 'vite-plugin-static-copy'
import {resolve} from 'path'
import {readFileSync} from 'fs'
import config from './src/config.js'

// Hosts stay out of the repository: __KEY__ placeholders of src/manifest.json are filled from src/config.js
const manifestPlugin = () => ({
    name: 'dtm-manifest',
    generateBundle() {
        const template = readFileSync(new URL('./src/manifest.json', import.meta.url), 'utf8')
        const source = template.replace(/__([A-Z_]+)__/g, (placeholder, key) => {
            if (!config[key]) throw new Error(`src/config.js: ${key} is missing (see src/config.example.js)`)
            return config[key]
        })

        this.emitFile({type: 'asset', fileName: 'manifest.json', source})
    }
})

export default defineConfig({
    plugins: [
        react(),
        manifestPlugin(),
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
