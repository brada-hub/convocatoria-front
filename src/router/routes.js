const routes = [
  {
    path: '/',
    component: () => import('layouts/PublicLayout.vue'),
    children: [
      {
        path: '',
        name: 'home',
        component: () => import('pages/PortalPage.vue'),
        meta: { title: 'Portal de Convocatorias' }
      },
      {
        path: 'convocatoria/:slug',
        name: 'convocatoria',
        component: () => import('pages/IndexPage.vue'),
        meta: { title: 'Postulación' }
      },
      {
        path: 'consultar',
        name: 'consultar',
        component: () => import('pages/ConsultarPage.vue'),
        meta: { title: 'Consultar Estado' }
      },
      // Login is public but part of the app flow
      {
        path: 'login',
        name: 'login',
        component: () => import('pages/LoginPage.vue'),
        meta: { title: 'Iniciar Sesión' }
      }
    ]
  },

  // Routes for authenticated users (Admin)
  {
    path: '/admin',
    component: () => import('layouts/MainLayout.vue'),
    meta: { requiresAuth: true },
    children: [
      {
        path: '',
        name: 'admin',
        component: () => import('pages/AdminPage.vue'),
        meta: { title: 'Panel Administrativo' }
      }
    ]
  },

  // Change Password Route (requires auth but is special)
  {
      path: '/change-password',
      component: () => import('layouts/PublicLayout.vue'), // Using PublicLayout as it's cleaner (no sidebar)
      meta: { requiresAuth: true },
      children: [
          {
              path: '',
              name: 'change-password',
              component: () => import('pages/ChangePasswordPage.vue'),
              meta: { title: 'Cambiar Contraseña' }
          }
      ]
  },

  // Always leave this as last one
  {
    path: '/:catchAll(.*)*',
    component: () => import('pages/ErrorNotFound.vue'),
  },
]

export default routes
