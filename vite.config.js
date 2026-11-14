import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// base './' supaya hasil build bisa dibuka dari folder / hosting statis mana saja
export default defineConfig({
  base: './',
  plugins: [vue()],
})
