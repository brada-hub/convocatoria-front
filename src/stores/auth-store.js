import { defineStore } from 'pinia'
import { api } from 'boot/axios'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null,
    token: localStorage.getItem('token') || null,
    isAuthenticated: !!localStorage.getItem('token'),
    loading: false,
    error: null,
  }),

  getters: {
    isLoggedIn: (state) => state.isAuthenticated && state.token,
    currentUser: (state) => state.user,
  },

  actions: {
    async login(email, password) {
      this.loading = true
      this.error = null

      try {
        // Obtener cookie CSRF desde la raíz del dominio (api.defaults.baseURL apunta a /api)
        // Usar regex para reemplazar solo el /api del final para no romper subdominios como api.dominio.com
        const baseUrl = api.defaults.baseURL.replace(/\/api$/, '')
        await api.get(`${baseUrl}/sanctum/csrf-cookie`)
        const response = await api.post('/auth/login', { email, password })

        this.token = response.data.token
        this.user = response.data.user
        this.isAuthenticated = true

        localStorage.setItem('token', this.token)
        api.defaults.headers.common['Authorization'] = `Bearer ${this.token}`

        return { success: true }
      } catch (error) {
        this.error = error.response?.data?.message || 'Error de autenticación'
        return { success: false, error: this.error }
      } finally {
        this.loading = false
      }
    },

    async logout() {
      try {
        await api.post('/auth/logout')
      } catch {
        // Ignorar errores de logout
      }

      this.token = null
      this.user = null
      this.isAuthenticated = false

      localStorage.removeItem('token')
      delete api.defaults.headers.common['Authorization']
    },

    async checkAuth() {
      if (!this.token) return false

      try {
        api.defaults.headers.common['Authorization'] = `Bearer ${this.token}`
        const response = await api.get('/auth/me')
        this.user = response.data.user
        this.isAuthenticated = true
        return true
      } catch {
        this.logout()
        return false
      }
    },

    initAuth() {
      const token = localStorage.getItem('token')
      if (token) {
        this.token = token
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`
        this.checkAuth()
      }
    }
  },
})
