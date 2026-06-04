export default defineNuxtConfig({
  future: {
    compatibilityVersion: 4,
  },
  modules: ['@nuxtjs/supabase'],

  supabase: {
    redirect: false 
  },

  compatibilityDate: '2026-06-04'
})