import { defineConfig } from 'vite'
import { svelte } from '@sveltejs/vite-plugin-svelte'
//import { VitePWA } from 'vite-plugin-pwa'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    svelte(),
    // VitePWA({ 
    //   registerType: 'autoUpdate',
    //   devOptions: {
    //     enabled: true
    //   },
    //   workbox: {
    //     globPatterns: ['**/*.{js,css,html,ico,png,svg,woff,woff2}']
    //   },
    //   includeAssets: ['favicon.ico']
    // })
  ],
})

