<template>
  <q-layout view="lHh LpR lFf" class="bg-gray-50 font-sans">

    <!-- HEADER (Navbar) -->
    <q-header class="bg-white/80 backdrop-blur-md border-b border-gray-200 text-gray-800 h-16 flex items-center shadow-sm">
      <q-toolbar>
        <q-btn
          flat
          dense
          round
          icon="menu"
          aria-label="Menu"
          @click="toggleLeftDrawer"
          class="text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
        />

        <q-toolbar-title class="flex items-center gap-3 cursor-pointer" @click="$router.push('/')">
          <div class="flex flex-col leading-tight">
            <span class="font-bold text-lg tracking-tight text-gray-900">SISTEMA</span>
            <span class="text-[10px] items-center font-medium text-gray-500 uppercase tracking-wider">de Convocatorias</span>
          </div>
        </q-toolbar-title>

        <div class="flex items-center gap-4">
          <!-- Usuario Logueado (Admin) -->
          <div v-if="authStore.isLoggedIn" class="flex items-center gap-3 pl-4 border-l border-gray-200">
            <div class="text-right hidden sm:block">
              <div class="text-sm font-semibold text-gray-900">{{ authStore.currentUser?.name || 'Administrador' }}</div>
              <div class="text-xs text-gray-500">Sesión Activa</div>
            </div>
            <q-btn round flat class="text-gray-500 hover:text-red-500 transition-colors" icon="logout" @click="logout">
              <q-tooltip>Cerrar Sesión</q-tooltip>
            </q-btn>
          </div>

          <!-- Botón Admin (si no está logueado en ruta publica) -->
          <q-btn
            v-else
            unelevated
            class="bg-gray-900 text-white hover:bg-gray-800 transition-colors rounded-lg px-4 py-2 font-medium text-sm"
            label="Acceso Admin"
            icon="admin_panel_settings"
            to="/admin"
          />
        </div>
      </q-toolbar>
    </q-header>

    <!-- SIDEBAR (Drawer) -->
    <q-drawer
      v-model="leftDrawerOpen"
      show-if-above
      bordered
      class="bg-white border-r border-gray-200"
      :width="280"
    >
      <div class="flex flex-col h-full">
        <!-- Perfil / Info -->
        <div class="p-6 border-b border-gray-100">
          <div class="flex items-center gap-3 mb-1">
            <div class="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
            <span class="text-xs font-bold text-gray-400 uppercase tracking-widest">Navegación</span>
          </div>
          <h2 class="text-xl font-bold text-gray-800">Menú Principal</h2>
        </div>

        <!-- Menú -->
        <div class="flex-1 overflow-y-auto py-4 px-3 space-y-1">
          <!-- Opciones Públicas -->
          <template v-if="!isAdminRoute">
            <div
               @click="$route.name !== 'convocatoria' ? $router.back() : null"
               :class="['flex items-center gap-3 px-4 py-3 rounded-xl cursor-pointer transition-all duration-200 group',
                 $route.name === 'convocatoria' ? 'bg-blue-50 text-blue-700 font-semibold' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900']"
            >
              <q-icon name="send" size="20px" :class="$route.name === 'convocatoria' ? 'text-blue-600' : 'text-gray-400 group-hover:text-gray-600'" />
              <span>Postular</span>
            </div>

            <router-link to="/consultar" v-slot="{ isActive, navigate }" custom>
              <div
                @click="navigate"
                :class="['flex items-center gap-3 px-4 py-3 rounded-xl cursor-pointer transition-all duration-200 group',
                  isActive ? 'bg-blue-50 text-blue-700 font-semibold' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900']"
              >
                <q-icon name="search" size="20px" :class="isActive ? 'text-blue-600' : 'text-gray-400 group-hover:text-gray-600'" />
                <span>Consultar Estado</span>
              </div>
            </router-link>
          </template>

          <!-- Opciones Admin -->
          <template v-if="isAdminRoute && authStore.isLoggedIn">
             <div class="mb-2 mt-4 px-4 text-xs font-bold text-gray-400 uppercase tracking-widest">Administración</div>

            <button
              v-for="item in adminMenuItems"
              :key="item.id"
              @click="setAdminSection(item.id)"
              :class="['w-full flex items-center gap-3 px-4 py-3 rounded-xl cursor-pointer transition-all duration-200 group text-left',
                currentAdminSection === item.id ? 'bg-indigo-50 text-indigo-700 font-semibold shadow-sm' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900']"
            >
              <q-icon :name="item.icon" size="20px" :class="currentAdminSection === item.id ? 'text-indigo-600' : 'text-gray-400 group-hover:text-gray-600'" />
              <span>{{ item.label }}</span>
              <q-badge v-if="item.badge" color="red" rounded floating transparent>{{ item.badge }}</q-badge>
            </button>
          </template>
        </div>

        <!-- Footer Sidebar -->
        <div class="p-4 border-t border-gray-100 bg-gray-50/50">
          <q-btn
            v-if="authStore.isLoggedIn"
            @click="logout"
            unelevated
            color="negative"
            icon="logout"
            label="Cerrar Sesión"
            class="w-full rounded-lg"
            no-caps
          />
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
import { ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from 'stores/auth-store'
import { useQuasar } from 'quasar'

// Configuración
const $q = useQuasar()
const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()

const leftDrawerOpen = ref(false)
const toggleLeftDrawer = () => leftDrawerOpen.value = !leftDrawerOpen.value

// Lógica de Admin Menu
const isAdminRoute = computed(() => route.path.startsWith('/admin'))

// Estado global simulado para la sección activa del dashboard (se comunica vía query param o evento)
// En un refactor mayor usaríamos store dedicado.
const adminMenuItems = [
  { id: 'dashboard', label: 'Dashboard', icon: 'dashboard' },
  { id: 'convocatorias', label: 'Convocatorias', icon: 'campaign' },
  { id: 'sedes', label: 'Sedes', icon: 'location_on' },
  { id: 'cargos', label: 'Cargos', icon: 'work' },
  { id: 'postulaciones', label: 'Postulaciones', icon: 'people_alt' },
]

// Sincronizar con la URL query param ?section=...
const currentAdminSection = computed(() => route.query.section || 'dashboard')

const setAdminSection = (sectionId) => {
  router.push({ path: '/admin', query: { section: sectionId } })
}

const logout = async () => {
  await authStore.logout()
  router.push('/')
  $q.notify({
    message: 'Sesión cerrada correctamente',
    color: 'positive',
    icon: 'check_circle'
  })
}
</script>

<style>
/* Forzamos algunos estilos si Tailwind no carga inmediatamente */
body {
  background-color: #f9fafb;
}
</style>
