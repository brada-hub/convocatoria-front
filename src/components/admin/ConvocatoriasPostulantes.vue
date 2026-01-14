<template>
  <div class="animate-fadeIn">
    <div class="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
      <!-- Header Purple Style -->
      <div class="bg-primary px-5 py-4 flex flex-col md:flex-row justify-between items-center gap-4">
        <div class="flex items-center gap-3">
          <div class="p-2 bg-white/10 rounded-lg text-white backdrop-blur-sm">
            <q-icon name="groups" size="24px" />
          </div>
          <div class="text-white">
            <h3 class="text-lg font-bold leading-tight">Gestión de Convocatorias</h3>
            <div class="text-xs opacity-90 font-medium">Visualice las convocatorias y sus postulantes</div>
          </div>
        </div>

        <button @click="loadConvocatorias"
          class="bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-lg text-sm font-bold transition-all backdrop-blur-md flex items-center gap-2">
          <q-icon name="refresh" size="18px" />
          Actualizar
        </button>
      </div>

      <!-- Loading state -->
      <div v-if="loading" class="p-12 flex justify-center">
        <q-spinner color="primary" size="48px" />
      </div>

      <!-- Content -->
      <div v-else class="divide-y divide-gray-100">
        <!-- Empty state -->
        <div v-if="convocatorias.length === 0" class="p-12 text-center">
          <q-icon name="inbox" size="64px" class="text-gray-300 mb-4" />
          <p class="text-gray-500 text-lg">No hay convocatorias registradas</p>
        </div>

        <!-- Convocatorias List -->
        <div v-for="convocatoria in convocatorias" :key="convocatoria.id" class="group">
          <!-- Convocatoria Header - Clickable -->
          <div @click="toggleConvocatoria(convocatoria.id)"
            class="flex items-center justify-between px-6 py-4 cursor-pointer hover:bg-gray-50/50 transition-colors">
            <div class="flex items-center gap-4">
              <!-- Expand/Collapse Icon -->
              <div
                class="w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-300"
                :class="expandedConvocatorias.includes(convocatoria.id) ? 'bg-primary text-white rotate-90' : 'bg-gray-100 text-gray-500'">
                <q-icon name="chevron_right" size="20px" />
              </div>

              <!-- Convocatoria Info -->
              <div>
                <div class="font-bold text-gray-900 text-base">{{ convocatoria.titulo }}</div>
                <div class="flex items-center gap-3 mt-1">
                  <span
                    :class="getEstadoClass(convocatoria)"
                    class="px-2 py-0.5 rounded-full text-xs font-bold uppercase tracking-wide">
                    {{ getEstadoLabel(convocatoria) }}
                  </span>
                  <span class="text-xs text-gray-500">
                    {{ formatDate(convocatoria.fecha_inicio) }} - {{ formatDate(convocatoria.fecha_cierre) }}
                  </span>
                </div>
              </div>
            </div>

            <!-- Stats & Actions -->
            <div class="flex items-center gap-4">
              <div class="text-right hidden sm:block">
                <div class="text-2xl font-bold text-primary">{{ convocatoria.postulantes_count || 0 }}</div>
                <div class="text-xs text-gray-500">Postulantes</div>
              </div>

              <!-- Export Button (Only visible when expanded) -->
              <button
                v-if="expandedConvocatorias.includes(convocatoria.id)"
                @click.stop="exportarPostulantes(convocatoria)"
                :disabled="exportingId === convocatoria.id"
                class="px-4 py-2 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white rounded-lg font-semibold text-sm transition-all shadow-md hover:shadow-lg flex items-center gap-2 disabled:opacity-50">
                <q-spinner v-if="exportingId === convocatoria.id" size="16px" color="white" />
                <q-icon v-else name="download" size="18px" />
                <span class="hidden md:inline">Exportar Excel</span>
              </button>
            </div>
          </div>

          <!-- Expanded Postulantes Section -->
          <transition
            enter-active-class="transition-all duration-300 ease-out"
            leave-active-class="transition-all duration-200 ease-in"
            enter-from-class="opacity-0 max-h-0"
            enter-to-class="opacity-100 max-h-[2000px]"
            leave-from-class="opacity-100 max-h-[2000px]"
            leave-to-class="opacity-0 max-h-0">
            <div v-if="expandedConvocatorias.includes(convocatoria.id)" class="overflow-hidden">
              <div class="bg-gray-50/70 px-6 py-4 border-t border-gray-100">

                <!-- Filters -->
                <div class="flex flex-wrap gap-3 mb-4">
                  <q-select
                    v-model="filters[convocatoria.id].sede_id"
                    :options="getSedesForConvocatoria(convocatoria)"
                    label="Filtrar por Sede"
                    outlined
                    dense
                    clearable
                    class="w-48"
                    bg-color="white"
                    emit-value
                    map-options
                    @update:model-value="loadPostulantes(convocatoria.id)" />
                  <q-select
                    v-model="filters[convocatoria.id].estado"
                    :options="estadosOptions"
                    label="Filtrar por Estado"
                    outlined
                    dense
                    clearable
                    class="w-48"
                    bg-color="white"
                    emit-value
                    map-options
                    @update:model-value="loadPostulantes(convocatoria.id)" />
                </div>

                <!-- Loading Postulantes -->
                <div v-if="loadingPostulantes[convocatoria.id]" class="py-8 flex justify-center">
                  <q-spinner color="primary" size="32px" />
                </div>

                <!-- Postulantes Table -->
                <div v-else-if="postulantesMap[convocatoria.id]?.length > 0" class="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
                  <q-table
                    :rows="postulantesMap[convocatoria.id]"
                    :columns="postulantesColumns"
                    row-key="id"
                    flat
                    :pagination="{ rowsPerPage: 10 }"
                    class="qt-clean">
                    <!-- Postulante Cell -->
                    <template v-slot:body-cell-postulante="props">
                      <q-td :props="props">
                        <div class="flex items-center gap-3">
                          <div class="w-9 h-9 rounded-full bg-gradient-to-br from-primary to-indigo-600 flex items-center justify-center text-white font-bold text-sm shadow">
                            {{ props.row.postulante?.nombres?.[0] || 'P' }}{{ props.row.postulante?.apellidos?.[0] || '' }}
                          </div>
                          <div>
                            <div class="font-medium text-gray-900">{{ props.row.postulante?.nombres }} {{ props.row.postulante?.apellidos }}</div>
                            <div class="text-xs text-gray-500">CI: {{ props.row.postulante?.ci }}</div>
                          </div>
                        </div>
                      </q-td>
                    </template>

                    <!-- Estado Cell -->
                    <template v-slot:body-cell-estado="props">
                      <q-td :props="props">
                        <span
                          :class="getEstadoPostulanteClass(props.row.estado)"
                          class="px-2.5 py-1 rounded-full text-xs font-bold">
                          {{ getEstadoPostulanteLabel(props.row.estado) }}
                        </span>
                      </q-td>
                    </template>

                    <!-- Acciones Cell -->
                    <template v-slot:body-cell-acciones="props">
                      <q-td :props="props">
                        <button
                          @click="$emit('ver-expediente', props.row)"
                          class="px-3 py-1.5 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-lg text-xs font-medium transition-colors flex items-center gap-1">
                          <q-icon name="visibility" size="14px" />
                          <span class="hidden sm:inline">Ver Expediente</span>
                        </button>
                      </q-td>
                    </template>
                  </q-table>
                </div>

                <!-- Empty Postulantes -->
                <div v-else class="py-8 text-center bg-white rounded-xl border border-dashed border-gray-300">
                  <q-icon name="person_search" size="40px" class="text-gray-300 mb-2" />
                  <p class="text-gray-400 text-sm">No hay postulantes en esta convocatoria</p>
                </div>

              </div>
            </div>
          </transition>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useQuasar } from 'quasar'
import { api } from 'src/boot/axios'

const $q = useQuasar()

// Emits
defineEmits(['ver-expediente'])

// State
const loading = ref(false)
const exportingId = ref(null)
const convocatorias = ref([])
const expandedConvocatorias = ref([])
const postulantesMap = reactive({})
const loadingPostulantes = reactive({})
const filters = reactive({})

// Columns for postulantes table
const postulantesColumns = [
  { name: 'postulante', label: 'Postulante', field: 'postulante', align: 'left' },
  { name: 'sede', label: 'Sede', field: row => row.oferta?.sede?.nombre || '-', align: 'left', sortable: true },
  { name: 'cargo', label: 'Cargo', field: row => row.oferta?.cargo?.nombre || '-', align: 'left', sortable: true },
  { name: 'fecha', label: 'Fecha', field: row => formatDate(row.created_at), align: 'center', sortable: true },
  { name: 'estado', label: 'Estado', field: 'estado', align: 'center' },
  { name: 'acciones', label: '', field: 'acciones', align: 'right' },
]

const estadosOptions = [
  { label: 'Pendiente', value: 'pendiente' },
  { label: 'En Revisión', value: 'en_revision' },
  { label: 'Observado', value: 'observado' },
  { label: 'Habilitado', value: 'habilitado' },
  { label: 'Rechazado', value: 'rechazado' },
  { label: 'Seleccionado', value: 'seleccionado' },
]

// Methods
const loadConvocatorias = async () => {
  loading.value = true
  try {
    const { data } = await api.get('/admin/convocatorias')
    convocatorias.value = data

    // Initialize filters for each convocatoria
    data.forEach(c => {
      if (!filters[c.id]) {
        filters[c.id] = { sede_id: null, cargo_id: null, estado: null }
      }
    })
  } catch (error) {
    console.error('Error loading convocatorias:', error)
    $q.notify({ type: 'negative', message: 'Error al cargar convocatorias' })
  } finally {
    loading.value = false
  }
}

const toggleConvocatoria = (id) => {
  const index = expandedConvocatorias.value.indexOf(id)
  if (index === -1) {
    expandedConvocatorias.value.push(id)
    loadPostulantes(id)
  } else {
    expandedConvocatorias.value.splice(index, 1)
  }
}

const loadPostulantes = async (convocatoriaId) => {
  loadingPostulantes[convocatoriaId] = true
  try {
    const params = {}
    const convFilters = filters[convocatoriaId]
    if (convFilters?.sede_id) params.sede_id = convFilters.sede_id
    if (convFilters?.cargo_id) params.cargo_id = convFilters.cargo_id
    if (convFilters?.estado) params.estado = convFilters.estado

    const { data } = await api.get(`/admin/convocatorias/${convocatoriaId}/postulaciones`, { params })
    postulantesMap[convocatoriaId] = data

    // Update postulantes count
    const conv = convocatorias.value.find(c => c.id === convocatoriaId)
    if (conv) {
      conv.postulantes_count = data.length
    }
  } catch (error) {
    console.error('Error loading postulantes:', error)
    $q.notify({ type: 'negative', message: 'Error al cargar postulantes' })
  } finally {
    loadingPostulantes[convocatoriaId] = false
  }
}

const exportarPostulantes = async (convocatoria) => {
  exportingId.value = convocatoria.id
  try {
    const params = {}
    const convFilters = filters[convocatoria.id]
    if (convFilters?.sede_id) params.sede_id = convFilters.sede_id
    if (convFilters?.estado) params.estado = convFilters.estado

    // Use axios with blob response type to maintain authentication
    const response = await api.get(`/admin/convocatorias/${convocatoria.id}/exportar-postulantes`, {
      params,
      responseType: 'blob'
    })

    // Create download link
    const blob = new Blob([response.data], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    })
    const blobUrl = window.URL.createObjectURL(blob)

    const link = document.createElement('a')
    link.href = blobUrl
    link.download = `Postulantes_${convocatoria.titulo.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.xlsx`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    window.URL.revokeObjectURL(blobUrl)

    $q.notify({ type: 'positive', message: 'Excel exportado correctamente', icon: 'download_done' })
  } catch (error) {
    console.error('Error exporting:', error)
    $q.notify({ type: 'negative', message: 'Error al exportar Excel' })
  } finally {
    exportingId.value = null
  }
}

const getSedesForConvocatoria = (convocatoria) => {
  const sedes = new Map()
  const postulantes = postulantesMap[convocatoria.id] || []
  postulantes.forEach(p => {
    if (p.oferta?.sede) {
      sedes.set(p.oferta.sede.id, p.oferta.sede.nombre)
    }
  })
  return Array.from(sedes, ([value, label]) => ({ label, value }))
}

// Format & Status helpers
const formatDate = (dateStr) => {
  if (!dateStr) return '-'
  const date = new Date(dateStr)
  return date.toLocaleDateString('es-BO', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

const getEstadoClass = (convocatoria) => {
  const now = new Date()
  const inicio = new Date(convocatoria.fecha_inicio)
  const cierre = new Date(convocatoria.fecha_cierre)

  if (cierre < now) return 'bg-red-100 text-red-700'
  if (inicio > now) return 'bg-gray-100 text-gray-600'
  return 'bg-green-100 text-green-700'
}

const getEstadoLabel = (convocatoria) => {
  const now = new Date()
  const inicio = new Date(convocatoria.fecha_inicio)
  const cierre = new Date(convocatoria.fecha_cierre)

  if (cierre < now) return 'Cerrada'
  if (inicio > now) return 'Próxima'
  return 'Activa'
}

const getEstadoPostulanteClass = (estado) => {
  const classes = {
    pendiente: 'bg-yellow-100 text-yellow-700',
    en_revision: 'bg-blue-100 text-blue-700',
    observado: 'bg-orange-100 text-orange-700',
    habilitado: 'bg-green-100 text-green-700',
    rechazado: 'bg-red-100 text-red-700',
    seleccionado: 'bg-purple-100 text-purple-700',
  }
  return classes[estado] || 'bg-gray-100 text-gray-600'
}

const getEstadoPostulanteLabel = (estado) => {
  const labels = {
    pendiente: 'Pendiente',
    en_revision: 'En Revisión',
    observado: 'Observado',
    habilitado: 'Habilitado',
    rechazado: 'Rechazado',
    seleccionado: 'Seleccionado',
  }
  return labels[estado] || estado
}

// Lifecycle
onMounted(() => {
  loadConvocatorias()
})
</script>

<style scoped>
.qt-clean :deep(.q-table__top),
.qt-clean :deep(.q-table__bottom) {
  border: none;
}

.qt-clean :deep(th) {
  background: #f8fafc !important;
  color: #64748b !important;
  font-weight: 600;
  text-transform: uppercase;
  font-size: 11px;
  letter-spacing: 0.05em;
}

.qt-clean :deep(td) {
  font-size: 13px;
}

.animate-fadeIn {
  animation: fadeIn 0.3s ease-out;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>
