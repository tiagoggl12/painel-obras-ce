import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
// Base padrão '/' (Railway e outros hosts de raiz).
// O deploy no GitHub Pages usa `npm run build:gh`, que passa --base=/painel-obras-ce/.
export default defineConfig({
  plugins: [react()],
  base: '/',
})
