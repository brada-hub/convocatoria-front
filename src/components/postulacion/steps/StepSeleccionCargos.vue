<template>
  <div class="step-content animate-fadeInUp">
    <!-- FASE 1: Selección de Convocatoria -->
    <div v-if="!store.convocatoriaSeleccionadaId">
      <div class="text-h5 q-mb-lg flex items-center gap-2 text-gray-800">
        <q-icon name="campaign" color="primary" size="28px" />
        Seleccione una Convocatoria
      </div>
      <p class="text-gray-500 mb-6">Elija la convocatoria a la que desea postular. Solo podrá aplicar a cargos de
        una convocatoria a la vez.</p>

      <div v-if="store.convocatorias.length === 0" class="text-center p-12 bg-gray-50 rounded-xl">
        <q-spinner size="40px" color="primary" class="mb-4" v-if="store.loading" />
        <div v-else class="text-gray-500">No hay convocatorias abiertas actualmente.</div>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div v-for="conv in store.convocatorias" :key="conv.id" @click="seleccionarConvocatoria(conv.id)"
          class="bg-white rounded-2xl border-2 border-gray-200 p-5 cursor-pointer hover:border-purple-500 hover:shadow-xl transition-all group relative overflow-hidden">
          <!-- Decorative gradient bar -->
          <div
            class="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-500 to-indigo-500 opacity-0 group-hover:opacity-100 transition-opacity">
          </div>

          <div class="flex items-start gap-4">
            <div
              class="w-14 h-14 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center text-white shadow-lg">
              <q-icon name="work" size="28px" />
            </div>
            <div class="flex-1 min-w-0">
              <h3 class="font-bold text-lg text-gray-800 mb-1 group-hover:text-purple-700 transition-colors">
                {{ conv.titulo }}</h3>
              <p class="text-sm text-gray-500 line-clamp-2 mb-3">{{ conv.descripcion || 'Sin descripción'
                }}</p>

              <!-- Sedes badges -->
              <div class="flex flex-wrap gap-1 mb-3">
                <template v-if="getSedesFromConv(conv).length <= 3">
                  <span v-for="sede in getSedesFromConv(conv)" :key="sede"
                    class="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-50 text-blue-700 text-xs rounded-full">
                    <q-icon name="location_on" size="10px" />
                    {{ sede }}
                  </span>
                </template>
                <template v-else>
                  <span
                    class="inline-flex items-center gap-1 px-2 py-0.5 bg-green-50 text-green-700 text-xs rounded-full font-medium">
                    <q-icon name="public" size="12px" />
                    Nacional ({{ getSedesFromConv(conv).length }} sedes)
                  </span>
                </template>
              </div>

              <div class="flex items-center gap-4 text-xs text-gray-400">
                <span class="flex items-center gap-1 bg-gray-100 px-2 py-1 rounded-full">
                  <q-icon name="business" size="14px" color="primary" />
                  <strong class="text-gray-700">{{ conv.ofertas?.length || 0 }}</strong> vacantes
                </span>
                <span class="flex items-center gap-1">
                  <q-icon name="event" size="14px" />
                  Hasta {{ formatFecha(conv.fecha_cierre) }}
                </span>
              </div>
            </div>
            <div
              class="flex items-center justify-center w-10 h-10 rounded-full bg-gray-100 group-hover:bg-purple-500 transition-colors">
              <q-icon name="arrow_forward" size="20px" class="text-gray-400 group-hover:text-white transition-colors" />
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- FASE 2: Selección de Cargos de la Convocatoria Elegida -->
    <div v-else>
      <!-- Header con info de convocatoria seleccionada -->
      <div
        class="bg-gradient-to-r from-purple-50 to-indigo-50 border-2 border-purple-200 rounded-xl p-4 mb-6 flex items-center justify-between">
        <div class="flex items-center gap-3">
          <div
            class="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center text-white shadow-md">
            <q-icon name="campaign" size="24px" />
          </div>
          <div>
            <div class="font-bold text-gray-800 text-lg">{{ store.convocatoriaSeleccionada?.titulo }}</div>
            <div class="text-xs text-purple-600">Convocatoria seleccionada</div>
          </div>
        </div>
        <q-btn outline color="purple" label="Cambiar Convocatoria" icon="swap_horiz" no-caps class="font-bold"
          @click="cambiarConvocatoria" />
      </div>

      <div class="row q-col-gutter-lg">
        <!-- Columna Izquierda: Tabs y Checkboxes -->
        <div class="col-12 col-md-8">
          <div class="text-h6 q-mb-md flex items-center gap-2">
            <q-icon name="apartment" color="primary" />
            Sedes Disponibles
          </div>

          <div v-if="ofertasAgrupadas.length"
            class="border rounded-xl overflow-hidden bg-gray-50 flex flex-col md:flex-row" style="min-height: 400px;">
            <!-- Tabs Verticales de Sedes -->
            <q-tabs v-model="activeSedeTab" :vertical="!$q.screen.lt.md"
              class="text-grey-7 bg-white border-b md:border-b-0 md:border-r" active-color="primary"
              active-bg-color="blue-1" indicator-color="primary">
              <q-tab v-for="grupo in ofertasAgrupadas" :key="grupo.sede.id" :name="grupo.sede.id"
                class="justify-start px-4 py-3" no-caps>
                <div class="flex items-center gap-2 text-left w-full">
                  <q-icon name="location_on" size="xs" />
                  <div class="text-caption font-bold">{{ grupo.sede.nombre }}</div>
                </div>
              </q-tab>
            </q-tabs>

            <!-- Paneles de Checkboxes -->
            <q-tab-panels v-model="activeSedeTab" animated vertical transition-prev="jump-up" transition-next="jump-up"
              class="bg-transparent flex-1">
              <q-tab-panel v-for="grupo in ofertasAgrupadas" :key="grupo.sede.id" :name="grupo.sede.id" class="p-4">
                <div class="text-h6 q-mb-sm text-primary font-bold">{{ grupo.sede.nombre }}</div>
                <p class="text-xs text-gray-500 mb-4">Seleccione los cargos de su interés en esta sede.
                </p>

                <div class="grid gap-3">
                  <div v-for="oferta in grupo.cargos" :key="oferta.id"
                    class="bg-white p-3 rounded-lg border border-gray-200 hover:border-blue-400 transition-colors flex items-center">
                    <q-checkbox v-model="store.ofertasSeleccionadas" :val="oferta.id" color="primary"
                      class="text-sm font-medium text-gray-800" :label="oferta.cargo?.nombre || oferta.cargo" />
                  </div>
                </div>
              </q-tab-panel>
            </q-tab-panels>
          </div>
          <div v-else class="text-center p-8 bg-gray-50 rounded-xl text-gray-500">
            No hay ofertas disponibles en esta convocatoria.
          </div>
        </div>

        <!-- Columna Derecha: Tabla Resumen -->
        <div class="col-12 col-md-4">
          <div class="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden sticky-summary">
            <div class="bg-primary text-white p-4">
              <div class="text-subtitle1 font-bold flex items-center gap-2">
                <q-icon name="shopping_bag" />
                Mis Postulaciones
              </div>
              <div class="text-xs opacity-90">
                {{ store.ofertasSeleccionadas.length }} cargos seleccionados
              </div>
            </div>

            <div class="q-pa-none" style="max-height: 400px; overflow-y: auto;">
              <q-list separator v-if="selectedDetails.length > 0">
                <q-item v-for="item in selectedDetails" :key="item.id" class="hover:bg-gray-50">
                  <q-item-section>
                    <q-item-label class="text-sm font-bold text-gray-800">{{ item.cargo
                      }}</q-item-label>
                    <q-item-label caption class="flex items-center gap-1 text-xs text-gray-500">
                      <q-icon name="place" size="12px" /> {{ item.sede }}
                    </q-item-label>
                  </q-item-section>
                  <q-item-section side>
                    <q-btn flat round color="negative" icon="delete_outline" size="sm"
                      @click="store.toggleOferta(item.id)">
                      <q-tooltip>Eliminar</q-tooltip>
                    </q-btn>
                  </q-item-section>
                </q-item>
              </q-list>
              <div v-else class="p-8 text-center text-gray-400 text-sm">
                <q-icon name="playlist_add" size="40px" class="mb-2 opacity-50 block mx-auto" />
                Seleccione cargos de la lista para postular.
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Botones de Navegación -->
      <div class="flex justify-end gap-3 mt-6 px-4 md:px-0">
        <q-btn unelevated color="primary" label="Siguiente" icon-right="arrow_forward" @click="validateAndNext" no-caps
          class="px-6 py-2" />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { usePostulacionStore } from 'stores/postulacion-store'
import { useQuasar } from 'quasar'

const store = usePostulacionStore()
const $q = useQuasar()
const activeSedeTab = ref(null)

const emit = defineEmits(['next'])

// --- COMPUTED HELPERS ---

// Ofertas de la convocatoria seleccionada agrupadas por sede
const ofertasAgrupadas = computed(() => store.ofertasDeConvocatoriaActual)

// Detalles de ofertas seleccionadas
const selectedDetails = computed(() => {
  const details = []
  const conv = store.convocatoriaSeleccionada
  if (!conv) return details

  conv.ofertas.forEach(o => {
    if (store.ofertasSeleccionadas.includes(o.id)) {
      details.push({
        id: o.id,
        cargo: o.cargo?.nombre || 'Cargo',
        sede: o.sede.nombre
      })
    }
  })
  return details
})

// --- ACTIONS ---

const seleccionarConvocatoria = (id) => {
  store.seleccionarConvocatoria(id)
}

const cambiarConvocatoria = () => {
  store.convocatoriaSeleccionadaId = null
  store.ofertasSeleccionadas = []
}

const formatFecha = (fecha) => {
  if (!fecha) return 'Sin fecha'
  return new Date(fecha).toLocaleDateString('es-BO', { day: 'numeric', month: 'short', year: 'numeric' })
}

// Obtener sedes únicas de una convocatoria
const getSedesFromConv = (conv) => {
  if (!conv.ofertas || conv.ofertas.length === 0) return []
  const sedesSet = new Set()
  conv.ofertas.forEach(o => {
    if (o.sede?.nombre) sedesSet.add(o.sede.nombre)
  })
  return Array.from(sedesSet)
}

// Inicializar tab cuando cambia la convocatoria
watch(ofertasAgrupadas, (newVal) => {
  if (newVal && newVal.length > 0 && !activeSedeTab.value) {
    activeSedeTab.value = newVal[0].sede.id
  }
}, { immediate: true })

const validateAndNext = () => {
  if (store.ofertasSeleccionadas.length === 0) {
    $q.notify({
      type: 'warning',
      message: 'Debe seleccionar al menos un cargo para postular.',
      position: 'center'
    })
    return
  }
  emit('next')
}
</script>

<style scoped>
.sticky-summary {
  position: sticky;
  top: 20px;
}

.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
