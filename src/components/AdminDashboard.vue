<template>
  <div class="q-pa-md">
    <div class="row q-col-gutter-md q-mb-lg">
      <div class="col-12 col-md-3">
        <q-card class="bg-primary text-white">
          <q-card-section>
            <div class="text-h6">Total Postulaciones</div>
            <div class="text-h4">{{ postulaciones.length }}</div>
          </q-card-section>
        </q-card>
      </div>
      <div class="col-12 col-md-3">
        <q-card class="bg-orange text-white">
          <q-card-section>
            <div class="text-h6">En Espera</div>
            <div class="text-h4">{{ stats.en_espera }}</div>
          </q-card-section>
        </q-card>
      </div>
    </div>

    <q-table
      title="Gestión de Convocatorias"
      :rows="postulaciones"
      :columns="columns"
      row-key="id"
      :loading="loading"
    >
      <template v-slot:body-cell-estado="props">
        <q-td :props="props">
          <q-badge :color="getStatusColor(props.value)">
            {{ props.value }}
          </q-badge>
        </q-td>
      </template>

      <template v-slot:body-cell-acciones="props">
        <q-td :props="props">
          <q-btn-dropdown flat color="grey-7" label="Acciones">
            <q-list>
              <q-item clickable v-close-popup @click="updateStatus(props.row.id, 'verificado')">
                <q-item-section avatar>
                  <q-icon name="check" color="positive" />
                </q-item-section>
                <q-item-section>Verificar</q-item-section>
              </q-item>
              <q-item clickable v-close-popup @click="updateStatus(props.row.id, 'observado')">
                <q-item-section avatar>
                  <q-icon name="warning" color="orange" />
                </q-item-section>
                <q-item-section>Observar</q-item-section>
              </q-item>
            </q-list>
          </q-btn-dropdown>
        </q-td>
      </template>
    </q-table>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { api } from 'boot/axios'
import { useQuasar } from 'quasar'

const $q = useQuasar()
const postulaciones = ref([])
const loading = ref(true)

const columns = [
  { name: 'postulante', label: 'Postulante', field: row => row.postulante.nombre_completo, align: 'left' },
  { name: 'ci', label: 'CI', field: row => row.postulante.ci, align: 'left' },
  { name: 'convocatoria', label: 'Convocatoria', field: row => row.convocatoria.titulo, align: 'left' },
  { name: 'estado', label: 'Estado', field: 'estado', align: 'center' },
  { name: 'acciones', label: 'Acciones', field: 'acciones', align: 'center' }
]

const stats = computed(() => {
  return {
    en_espera: postulaciones.value.filter(p => p.estado === 'en_espera').length
  }
})

const getStatusColor = (status) => {
  const colors = {
    en_espera: 'orange',
    verificado: 'positive',
    observado: 'warning',
    rechazado: 'negative'
  }
  return colors[status] || 'grey'
}

const fetchData = async () => {
  loading.value = true
  try {
    const response = await api.get('/admin/postulaciones')
    postulaciones.value = response.data
  } catch {
    $q.notify({ type: 'negative', message: 'Error al cargar datos' })
  } finally {
    loading.value = false
  }
}

const updateStatus = async (id, status) => {
  // Aquí se enviaría el update al backend
  $q.notify({ type: 'info', message: `Cambiando estado a ${status}... (Mock)` })
}

onMounted(fetchData)
</script>
