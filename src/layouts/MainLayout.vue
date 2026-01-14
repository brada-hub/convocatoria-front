<template>
  <q-layout view="lHh LpR lFf">
    <!-- HEADER -->
    <q-header class="bg-primary text-white" height-hint="60">
      <q-toolbar class="h-16 px-6">
        <q-btn flat dense round icon="menu" aria-label="Menu" @click="toggleLeftDrawer" class="mr-4" />

        <q-toolbar-title class="flex items-center gap-4 cursor-pointer"
          @click="isAdminRoute ? $router.push('/admin') : $router.push('/')">
          <!-- Logo UNITEPC - White for contrast -->
          <img src="~assets/logo_unitepc.png" alt="UNITEPC Logo" class="h-10 bg-white rounded-lg p-1.5 shadow-sm" />

          <div class="flex flex-col leading-tight">
            <span class="font-bold text-lg tracking-wide uppercase">Convocatorias</span>
            <span class="text-[10px] opacity-90 font-light tracking-widest">Universidad Técnica Privada Cosmos</span>
          </div>
        </q-toolbar-title>

        <div class="flex items-center gap-4">
          <div class="hidden sm:flex flex-col items-end mr-2">
            <span class="text-sm font-bold">{{ today }}</span>
            <span class="text-xs opacity-80">Cochabamba, Bolivia</span>
          </div>

          <q-btn v-if="!authStore.isLoggedIn" to="/admin" flat label="Soy Administrador" no-caps
            class="bg-white/10 hover:bg-white/20 rounded-lg transition-colors" />
        </div>
      </q-toolbar>
    </q-header>

    <!-- SIDEBAR (Drawer) - REDESIGNED -->
    <q-drawer v-model="leftDrawerOpen" show-if-above class="bg-white" :width="260" bordered>
      <div class="flex flex-col h-full">
        <!-- Brand Area - CLEAN STYLE -->
        <div class="p-6 flex flex-col gap-1">
          <div class="flex items-center gap-2 text-primary font-bold text-xl tracking-tight">
            <span class="text-2xl">UNITEPC</span>
          </div>
          <div class="text-sm text-gray-400">Sistema Convocatorias</div>
        </div>

        <!-- Menu items -->
        <div class="flex-1 px-4 space-y-2 overflow-y-auto mt-2">

          <!-- Public Routes -->
          <template v-if="!isAdminRoute">
            <router-link to="/convocatoria/general" v-slot="{ isActive }">
              <div
                :class="['flex items-center gap-4 px-4 py-3 rounded-lg transition-all cursor-pointer', isActive ? 'bg-primary text-white font-medium shadow-md' : 'text-gray-600 hover:bg-gray-100']">
                <q-icon name="dashboard" size="22px" />
                <span>Postular</span>
              </div>
            </router-link>
            <router-link to="/consultar" v-slot="{ isActive }">
              <div
                :class="['flex items-center gap-4 px-4 py-3 rounded-lg transition-all cursor-pointer', isActive ? 'bg-primary text-white font-medium shadow-md' : 'text-gray-600 hover:bg-gray-100']">
                <q-icon name="search" size="22px" />
                <span>Consultar</span>
              </div>
            </router-link>
          </template>

          <!-- Admin Routes -->
          <template v-if="isAdminRoute && authStore.isLoggedIn">
            <div v-for="item in adminMenuItems" :key="item.id" @click="setAdminSection(item.id)"
              :class="['flex items-center gap-4 px-4 py-3 rounded-lg transition-colors cursor-pointer mb-1', currentAdminSection === item.id ? 'bg-primary text-white font-medium shadow-sm' : 'text-gray-700 hover:bg-gray-100 font-medium']">
              <q-icon :name="item.icon" size="22px" />
              <span>{{ item.label }}</span>
              <q-badge v-if="item.badge" color="red" rounded floating transparent>{{ item.badge }}</q-badge>
            </div>
          </template>
        </div>

        <!-- Footer - SIMPLE STYLE -->
        <div class="p-6 border-t border-gray-100 mt-auto">
          <div class="flex items-center gap-3 mb-4">
            <div
              class="w-10 h-10 rounded-full bg-teal-500 text-white flex items-center justify-center font-bold text-lg shadow-sm">
              {{ authStore.currentUser?.nombres?.[0] || 'A' }}
            </div>
            <div class="leading-tight">
              <div class="font-bold text-gray-900 text-sm uppercase">{{ authStore.currentUser?.nombres || 'Usuario' }}
                {{
                  authStore.currentUser?.apellidos || '' }}</div>
              <div class="text-xs text-gray-400">{{ authStore.currentUser?.rol?.nombre || 'Administrador' }}</div>
            </div>
          </div>

          <button @click="logout"
            class="flex items-center gap-2 text-red-600 hover:text-red-700 font-medium text-sm transition-colors pl-1">
            <q-icon name="logout" size="20px" class="rotate-180" />
            <span>Cerrar Sesión</span>
          </button>
        </div>
      </div>
    </q-drawer>

    <!-- MAIN CONTENT -->
    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from 'stores/auth-store'
import { useGoogleDrive } from 'src/composables/useGoogleDrive'

const authStore = useAuthStore()
const { loadGoogleScripts } = useGoogleDrive()

onMounted(() => {
  loadGoogleScripts()
})

const leftDrawerOpen = ref(false)
const route = useRoute()
const router = useRouter()

const isAdminRoute = computed(() => route.path.startsWith('/admin'))
const currentAdminSection = computed(() => route.query.section || 'dashboard')

const toggleLeftDrawer = () => {
  leftDrawerOpen.value = !leftDrawerOpen.value
}

const today = new Date().toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })

const adminMenuItems = computed(() => {
  const items = [
    { id: 'dashboard', label: 'Dashboard', icon: 'dashboard' },
    { id: 'convocatorias', label: 'Convocatorias', icon: 'campaign' },
    { id: 'gestion-convocatorias', label: 'Ver Postulantes', icon: 'groups' },
    { id: 'sedes', label: 'Sedes', icon: 'apartment' },
    { id: 'cargos', label: 'Cargos', icon: 'badge' },
    { id: 'niveles', label: 'Niveles Acad.', icon: 'school' },
    { id: 'postulaciones', label: 'Postulaciones', icon: 'people_alt' },
  ]

  // Solo Administradores ven Usuarios y Roles
  const rolName = authStore.currentUser?.rol?.nombre?.toLowerCase() || ''
  if (rolName === 'administrador' || rolName === 'super admin') {
    items.push({ id: 'usuarios', label: 'Usuarios', icon: 'manage_accounts' })
    items.push({ id: 'roles', label: 'Roles', icon: 'security' })
  }

  return items
})

const setAdminSection = (sectionId) => {
  router.push({ path: '/admin', query: { section: sectionId } })
}

const logout = async () => {
  await authStore.logout()
  router.push('/login')
}
</script>
