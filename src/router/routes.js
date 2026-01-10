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
      }
    ]
  },
  {
    path: '/admin',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      {
        path: '',
        name: 'admin',
        component: () => import('pages/AdminPage.vue'),
        meta: { title: 'Panel Administrativo', requiresAuth: true }
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
