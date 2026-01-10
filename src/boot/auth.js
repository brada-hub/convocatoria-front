import { defineBoot } from '#q-app/wrappers'
import { useAuthStore } from 'stores/auth-store'

export default defineBoot(({ router }) => {
  const authStore = useAuthStore()

  // Inicializar autenticación al arrancar la app
  authStore.initAuth()

  // Guard de navegación para rutas protegidas
  router.beforeEach((to, from, next) => {
    if (to.path.startsWith('/admin') && !authStore.isLoggedIn) {
      // Si intenta acceder a admin sin estar logueado, permitir (mostrará login modal)
      next()
    } else {
      next()
    }
  })
})
