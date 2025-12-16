import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
// @ts-ignore
// The config file itself is JS, but we need to ensure the plugins handle TSX.
// The current plugin @vitejs/plugin-react supports TSX out of the box.
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
})