<template>
  <div class="consulta-wrap">
    <div class="consulta-content">
      <!-- Header -->
      <div class="text-center q-mb-xl">
        <div class="hero-icon-container q-mb-lg">
           <q-icon name="manage_search" size="48px" class="text-white" />
        </div>
        <h2 class="text-2xl md:text-4xl font-bold q-mb-sm text-gray-900 leading-tight">Consulta tu Postulación</h2>
        <p class="text-sm md:text-lg text-grey-6 px-4" style="max-width: 500px; margin: 0 auto;">
          Ingresa tu número de Carnet de Identidad para verificar el estado actual de tus postulaciones.
        </p>
      </div>

      <!-- Formulario de búsqueda -->
      <transition name="fade" mode="out-in">
        <div class="search-box-container q-mb-xl md:q-mb-xxl" v-if="!resultado">
            <div class="bg-white rounded-xl shadow-lg border border-gray-100 p-6 md:p-8 w-full max-w-md mx-auto relative overflow-hidden">
               <!-- Decoración de fondo -->
               <div class="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-indigo-600"></div>

               <q-input
                  v-model="ci"
                  outlined
                  label="Carnet de Identidad"
                  placeholder="Ej: 1234567"
                  class="q-mb-lg text-lg"
                  bg-color="white"
                  :rules="[val => !!val || 'Requerido']"
                  @keyup.enter="consultar"
               >
                  <template v-slot:prepend>
                     <q-icon name="badge" color="grey-6" />
                  </template>
               </q-input>

               <q-btn
                  class="full-width q-py-md rounded-lg shadow-md"
                  color="primary"
                  label="Consultar Estado"
                  icon="search"
                  unelevated
                  size="lg"
                  :loading="loading"
                  @click="consultar"
               />

               <p class="text-center text-xs text-gray-400 mt-4">
                  Sus datos están protegidos y son confidenciales.
               </p>
            </div>
        </div>
      </transition>

      <!-- Resultados -->
      <transition name="fade">
        <div v-if="resultado" class="max-w-4xl mx-auto">
          <!-- Info del postulante -->
          <div v-if="resultado.encontrado" class="flex flex-col items-center q-mb-lg md:q-mb-xl animate-scaleIn">
             <div class="w-20 h-20 md:w-24 md:h-24 rounded-full bg-blue-100 flex items-center justify-center mb-3 md:mb-4 border-4 border-white shadow-md">
                <q-icon name="person" size="40px" class="md:text-[48px] text-primary"/>
             </div>
             <h3 class="text-xl md:text-2xl font-bold text-center text-gray-800 px-4 leading-tight">{{ resultado.postulante.nombre }}</h3>
             <div class="bg-gray-100 px-4 py-1 rounded-full text-xs md:text-sm font-medium text-gray-600 mt-2">
                CI: {{ resultado.postulante.ci }}
             </div>
          </div>

          <!-- Lista de postulaciones -->
          <div v-if="resultado.encontrado && resultado.postulaciones.length > 0">
            <div class="flex items-center gap-3 q-mb-lg">
               <div class="w-1 h-8 bg-primary rounded-full"></div>
               <h4 class="text-h6 font-bold m-0 text-gray-800">Historial de Postulaciones</h4>
            </div>

            <div class="grid gap-6">
              <div
                v-for="post in resultado.postulaciones"
                :key="post.id"
                class="bg-white rounded-xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden"
              >
                <!-- Indicador de estado -->
                <div :class="['absolute left-0 top-0 bottom-0 w-1', getEstadoColor(post.estado)]"></div>

                <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                   <div class="flex-1">
                      <div class="text-[10px] md:text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">{{ post.convocatoria }}</div>
                      <div class="text-lg md:text-xl font-bold text-gray-800 mb-1 md:mb-2 leading-tight">{{ post.cargo }}</div>
                      <div class="flex items-center gap-2 text-sm text-gray-500">
                         <q-icon name="place" size="14px"/> {{ post.sede }}
                      </div>
                   </div>

                   <div class="flex flex-row sm:flex-col items-center sm:items-end justify-between sm:justify-center w-full sm:w-auto gap-2 border-t sm:border-t-0 pt-3 sm:pt-0 mt-1 sm:mt-0">
                      <q-chip :color="getEstadoColorBg(post.estado)" :text-color="getEstadoColorText(post.estado)" class="font-bold text-xs" dense>
                         {{ post.estado_texto }}
                      </q-chip>
                      <div class="text-[11px] text-gray-400 font-medium">
                         {{ post.fecha }}
                      </div>
                   </div>
                </div>

                <div v-if="post.observaciones" class="mt-4 bg-orange-50 border border-orange-100 rounded-lg p-3 flex gap-3">
                   <q-icon name="info" color="warning" size="sm" class="mt-1"/>
                   <div class="text-sm text-gray-700">
                      <span class="font-bold block text-orange-800">Observación:</span>
                      {{ post.observaciones }}
                   </div>
                </div>
              </div>
            </div>
          </div>

          <!-- No encontrado -->
          <div v-else-if="!resultado.encontrado" class="text-center py-12 bg-white rounded-xl shadow-sm border border-gray-100">
            <div class="inline-block p-4 rounded-full bg-gray-50 mb-4">
               <q-icon name="person_off" size="48px" color="grey-5" />
            </div>
            <h4 class="text-xl font-bold text-gray-700 mb-2">No encontrado</h4>
            <p class="text-gray-500 max-w-sm mx-auto px-4">
              No hemos encontrado postulaciones asociadas al número de carnet proporcionado. Verifique que esté escrito correctamente.
            </p>
          </div>

          <!-- Sin postulaciones -->
          <div v-else-if="resultado.postulaciones.length === 0" class="text-center py-12 bg-white rounded-xl shadow-sm border border-gray-100">
            <div class="inline-block p-4 rounded-full bg-blue-50 mb-4">
               <q-icon name="folder_open" size="48px" color="primary" />
            </div>
            <h4 class="text-xl font-bold text-gray-700 mb-2">Expediente Vacío</h4>
            <p class="text-gray-500 max-w-sm mx-auto px-4">
              Usted está registrado en el sistema, pero no tiene postulaciones activas en este momento.
            </p>
          </div>

          <!-- Botón nueva consulta -->
          <div class="text-center q-mt-xl">
             <q-btn flat color="primary" icon="arrow_back" label="Realizar otra consulta" @click="nuevaConsulta" no-caps class="font-medium" />
          </div>
        </div>
      </transition>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useQuasar } from 'quasar'
import { api } from 'boot/axios'

const $q = useQuasar()
const ci = ref('')
const loading = ref(false)
const resultado = ref(null)

const consultar = async () => {
  if (!ci.value.trim()) {
    $q.notify({ type: 'warning', message: 'Ingrese su CI' })
    return
  }

  loading.value = true
  try {
    const { data } = await api.post('/consultar-estado', { ci: ci.value })
    resultado.value = data
  } catch {
    $q.notify({
      type: 'negative',
      message: 'Error al consultar. Intente nuevamente.'
    })
  } finally {
    loading.value = false
  }
}

const nuevaConsulta = () => {
  ci.value = ''
  resultado.value = null
}

// Helpers para colores
const getEstadoColor = (estado) => {
   const map = {
      'pendiente': 'bg-yellow-500',
      'aprobado': 'bg-green-500',
      'rechazado': 'bg-red-500',
      'revision': 'bg-blue-500'
   }
   return map[estado] || 'bg-gray-400'
}

const getEstadoColorBg = (estado) => {
   const map = {
      'pendiente': 'orange-1',
      'aprobado': 'green-1',
      'rechazado': 'red-1',
      'revision': 'blue-1'
   }
   return map[estado] || 'grey-3'
}

const getEstadoColorText = (estado) => {
   const map = {
      'pendiente': 'warning',
      'aprobado': 'positive',
      'rechazado': 'negative',
      'revision': 'primary'
   }
   return map[estado] || 'grey-8'
}
</script>

<style scoped>
.consulta-wrap {
  min-height: 80vh;
  display: flex;
  justify-content: center;
  padding: 20px 16px;
}

@media (min-width: 768px) {
  .consulta-wrap {
    padding: 40px 20px;
  }
}

.consulta-content {
  width: 100%;
  max-width: 1200px;
}

.hero-icon-container {
   width: 80px;
   height: 80px;
   border-radius: 20px;
   background: var(--gradient-primary);
   display: flex;
   align-items: center;
   justify-content: center;
   margin: 0 auto;
   box-shadow: 0 10px 20px rgba(79, 70, 229, 0.2);
   transform: rotate(-5deg);
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.animate-scaleIn {
   animation: scaleIn 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
}

@keyframes scaleIn {
   from { transform: scale(0.9); opacity: 0; }
   to { transform: scale(1); opacity: 1; }
}
</style>
