import { defineConfig } from 'vite'
import { createVuePlugin as vue } from 'vite-plugin-vue2'

const path = require('path')

// https://vitejs.dev/config/
export default defineConfig({
  root: 'src/renderer',
  base: './',
  build: {
    emptyOutDir: true,
    outDir: '../../dist/renderer'
  },
  plugins: [vue()],
  resolve: {
    alias: {
      '@': path.resolve('src/renderer'),
      '?': path.resolve('spec/renderer')
    },
  },
  server: {
    port: 8080,
  }
})
