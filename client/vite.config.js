import { defineConfig } from 'vite'
import { svelte } from '@sveltejs/vite-plugin-svelte'
//import { VitePWA } from 'vite-plugin-pwa'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    svelte(),
  ],
  // build: {
  //   rollupOptions: {
  //     output: {
  //       entryFileNames: `assets/[name].js`,
  //       chunkFileNames: `assets/[name].js`,
  //       assetFileNames: `assets/[name].[ext]`
  //     }
  //   }
  // }
})

