import glsl from 'vite-plugin-glsl'
import { defineConfig } from 'vite'
import path from 'path'

const dist = path.join(__dirname, '.', 'docs')

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [glsl()],
  base: './',
  server: {
    host: true
  },
  build: {
    outDir: dist
  }
})