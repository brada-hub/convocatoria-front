import { defineRouter } from '#q-app/wrappers'
import {
  createRouter,
  createMemoryHistory,
  createWebHistory,
  createWebHashHistory,
} from 'vue-router'
import routes from './routes'

/*
 * If not building with SSR mode, you can
 * directly export the Router instantiation;
 *
 * The function below can be async too; either use
 * async/await or return a Promise which resolves
 * with the Router instance.
 */

export default defineRouter(function (/* { store, ssrContext } */) {
  const createHistory = process.env.SERVER
    ? createMemoryHistory
    : process.env.VUE_ROUTER_MODE === 'history'
      ? createWebHistory
      : createWebHashHistory

  const Router = createRouter({
    scrollBehavior: () => ({ left: 0, top: 0 }),
    routes,
    history: createHistory(process.env.VUE_ROUTER_BASE),
  })

  // Global Route Guard
  Router.beforeEach(async (to, from, next) => {
    // We need to dynamically import/use store inside the guard to avoid Pinia initialization issues
    // Note: If you are using Quasar, 'useAuthStore' should be imported at top level but called inside if defineRouter is used.
    // However, in this file 'useAuthStore' is not imported yet. Let's rely on localStorage first for speed or import it.
    // Better to just check localStorage 'token' manually for simple redirect before full store check?
    // Or we can import store.

    // Simple check based on meta
    const token = localStorage.getItem('token')

    // Requires Auth
    if (to.matched.some(record => record.meta.requiresAuth)) {
      if (!token) {
        next({ name: 'login' })
        return
      }

      // If logged in, check for force password change
      // Ideally we should use the store, but accessing store instance here might be tricky without 'store' param injected
      // Let's assume the authStore state is hydrated or we can check the API/store.
      // For now, let's just allow through. We will implement the Force Change in the store's checkAuth or a boot file.
      // But typically, we should import the store here.
    }

    // Prevent logged in users from seeing login
    if (to.name === 'login' && token) {
      next({ name: 'admin' }) // or 'change-password' if needed
      return
    }

    next()
  })

  return Router
})
