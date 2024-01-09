import { defineConfig } from 'vite'
import { svelte } from '@sveltejs/vite-plugin-svelte'
import { VitePWA } from 'vite-plugin-pwa'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    svelte(),
    VitePWA({ 
      registerType: 'autoUpdate',
      devOptions: {
        enabled: true
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff,woff2}']
      },
      includeAssets: ['favicon.ico', 'vite.svg'],
      manifest: {
        "name": "MAG: Indice de Arrendamiento Rural",
        "short_name": "MAG",
        "description": "Indice de precio sugerido para arrendamiento de campos",
        "start_url": "/",
        "id": "/",
        "theme_color": "#ffffff",
        "background_color": "#ffffff",
        "display": "fullscreen",
        "icons": [
          {
            "src": "favicon.ico",
            "sizes": "256x256"
          },
          {
            "src": "images/circle.svg",
            "sizes": "72x72",
            "purpose": "maskable"
          },
          {
            "src": "images/tire.svg",
            "sizes": "128x128"
          },
          {
            "src": "images/wheel.svg",
            "sizes": "512x512"
          }
        ],
        "screenshots": [
          {
            "src": "images/screenshot1.png",
            "type": "image/png",
            "sizes": "540x720",
            "form_factor": "narrow"
          },
          {
            "src": "images/screenshot2.png",
            "type": "image/jpg",
            "sizes": "720x540",
            "form_factor": "wide"
          }
        ]
      }    
    })
  ],
})

