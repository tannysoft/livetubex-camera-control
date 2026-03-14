import { defineNuxtConfig } from 'nuxt/config'

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
  }
})

