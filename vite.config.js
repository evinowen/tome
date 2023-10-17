import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vuetify from 'vite-plugin-vuetify'

const path = require('path')

// https://vitejs.dev/config/
export default defineConfig({
  root: 'src/renderer',
  base: './',
  build: {
    emptyOutDir: true,
    outDir: '../../dist/renderer'
  },
  plugins: [
    vue(),
    vuetify({ autoImport: false, styles: { configFile: 'styles/vuetify.scss' } })
  ],
  resolve: {
    alias: {
      '@': path.resolve('src/renderer'),
      '?': path.resolve('spec/renderer')
    },
  },
  server: {
    port: 8080,
  },
  css: {
    preprocessorOptions: {
      scss: {
      }
    }
  },
})
