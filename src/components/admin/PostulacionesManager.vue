<template>
  <div class="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
    <!-- Header -->
    <div class="bg-primary px-5 py-3 flex flex-col md:flex-row justify-between items-center gap-4">
      <div class="flex items-center gap-3">
        <div class="p-2 bg-white/10 rounded-lg text-white backdrop-blur-sm">
          <q-icon name="people_alt" size="22px" />
        </div>
        <div class="text-white">
          <h3 class="text-base font-bold leading-tight">Gestión de Postulaciones</h3>
          <div class="text-[11px] opacity-90 font-medium">Revise y gestione los candidatos</div>
        </div>
      </div>
      <button @click="loadData"
        class="bg-white/10 hover:bg-white/20 text-white px-3 py-1.5 rounded-lg text-sm font-bold transition-all backdrop-blur-md flex items-center gap-2">
        <q-icon name="refresh" size="16px" /> Actualizar
      </button>
    </div>

    <!-- Filtros -->
    <div class="p-6 border-b border-gray-100 bg-gray-50/50">
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
        <q-select v-model="filtros.convocatoria" :options="convocatoriasOptions" label="Convocatoria" outlined dense
          emit-value map-options clearable @update:model-value="loadData" />
        <q-select v-model="filtros.sede" :options="sedesOptions" label="Sede" outlined dense emit-value map-options
          clearable @update:model-value="loadData" />
        <q-select v-model="filtros.cargo" :options="cargosOptions" label="Cargo" outlined dense emit-value map-options
          clearable @update:model-value="loadData" />
        <q-select v-model="filtros.estado" :options="estadoOptions" label="Estado" outlined dense emit-value map-options
          clearable @update:model-value="loadData" />
      </div>
    </div>

    <!-- Table -->
    <q-table :rows="postulaciones" :columns="columns" row-key="id" flat :loading="loading"
      :pagination="{ rowsPerPage: 10 }">
      <template v-slot:body-cell-postulante="props">
        <q-td :props="props">
          <div class="flex items-center gap-3">
            <div
              class="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 font-bold text-xs">
              {{ props.row.postulante?.nombres?.[0] }}{{ props.row.postulante?.apellidos?.[0] }}
            </div>
            <div>
              <div class="font-medium text-gray-900">{{ props.row.postulante?.nombres }} {{
                props.row.postulante?.apellidos }}</div>
              <div class="text-xs text-gray-500">{{ props.row.postulante?.ci }}</div>
            </div>
          </div>
        </q-td>
      </template>
      <template v-slot:body-cell-estado="props">
        <q-td :props="props">
          <q-select :model-value="props.row.estado" :options="estadoOptions" dense outlined class="text-xs"
            bg-color="white" emit-value map-options @update:model-value="val => cambiarEstado(props.row, val)" />
        </q-td>
      </template>
      <template v-slot:body-cell-acciones="props">
        <q-td :props="props">
          <button @click="$emit('ver-expediente', props.row)"
            class="px-3 py-1.5 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-md text-xs font-medium transition-colors">
            Ver Expediente
          </button>
        </q-td>
      </template>
    </q-table>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useQuasar } from 'quasar'
import { api } from 'boot/axios'

defineEmits(['ver-expediente'])
const $q = useQuasar()

const loading = ref(false)
const postulaciones = ref([])
const convocatorias = ref([])
const sedes = ref([])
const cargos = ref([])
const filtros = ref({ convocatoria: null, sede: null, cargo: null, estado: null })

const columns = [
  { name: 'postulante', label: 'Postulante', field: 'postulante', align: 'left' },
  { name: 'cargo', label: 'Cargo', field: row => row.oferta?.cargo?.nombre, align: 'left' },
  { name: 'sede', label: 'Sede', field: row => row.oferta?.sede?.nombre, align: 'left' },
  { name: 'fecha', label: 'Fecha', field: row => row.created_at?.split('T')[0], align: 'center' },
  { name: 'estado', label: 'Estado', field: 'estado', align: 'center' },
  { name: 'acciones', label: '', field: 'acciones', align: 'center' }
]

const estadoOptions = [
  { label: 'Pendiente', value: 'pendiente' },
  { label: 'En Revisión', value: 'en_revision' },
  { label: 'Observado', value: 'observado' },
  { label: 'Habilitado', value: 'habilitado' },
  { label: 'Rechazado', value: 'rechazado' },
  { label: 'Seleccionado', value: 'seleccionado' }
]

const convocatoriasOptions = computed(() => convocatorias.value.map(c => ({ label: c.titulo, value: c.id })))
const sedesOptions = computed(() => sedes.value.map(s => ({ label: s.nombre, value: s.id })))
const cargosOptions = computed(() => cargos.value.map(c => ({ label: c.nombre, value: c.id })))

const loadCatalogos = async () => {
  try {
    const [convRes, sedesRes, cargosRes] = await Promise.all([
      api.get('/admin/convocatorias'),
      api.get('/admin/sedes'),
      api.get('/admin/cargos')
    ])
    convocatorias.value = convRes.data
    sedes.value = sedesRes.data
    cargos.value = cargosRes.data
  } catch { console.error('Error loading catalogos') }
}

const loadData = async () => {
  loading.value = true
  try {
    const params = {}
    if (filtros.value.convocatoria) params.convocatoria_id = filtros.value.convocatoria
    if (filtros.value.sede) params.sede_id = filtros.value.sede
    if (filtros.value.cargo) params.cargo_id = filtros.value.cargo
    if (filtros.value.estado) params.estado = filtros.value.estado

    const { data } = await api.get('/admin/postulaciones', { params })
    postulaciones.value = data
  } catch { $q.notify({ type: 'negative', message: 'Error al cargar postulaciones' }) }
  finally { loading.value = false }
}

const cambiarEstado = async (row, nuevoEstado) => {
  try {
    await api.patch(`/admin/postulaciones/${row.id}/estado`, { estado: nuevoEstado })
    row.estado = nuevoEstado
    $q.notify({ type: 'positive', message: 'Estado actualizado' })
  } catch { $q.notify({ type: 'negative', message: 'Error al actualizar estado' }) }
}

onMounted(() => {
  loadCatalogos()
  loadData()
})

defineExpose({ loadData })
</script>
