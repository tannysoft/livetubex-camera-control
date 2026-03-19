import { defineNuxtConfig } from 'nuxt/config'
import { resolve } from 'node:path'

export default defineNuxtConfig({
  ssr: false,
  modules: ['@nuxtjs/tailwindcss', '@pinia/nuxt'],
  css: [],
  tailwindcss: {
    cssPath: '~/assets/css/tailwind.css',
    configPath: 'tailwind.config.js'
  },
  typescript: {
    strict: false
  },
  nitro: {
    preset: 'node-server'
  },
  vite: {
    resolve: {
      alias: {
        // Workaround for Vite pre-transform trying to resolve Nuxt virtual module `#app-manifest`
        '#app-manifest': resolve(__dirname, 'app/app-manifest-stub')
      }
    }
  }
})

