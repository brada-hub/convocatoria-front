<template>
  <div class="animate-fadeIn">
    <div class="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
      <div class="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/30">
        <h3 class="text-lg font-semibold text-gray-800">Sedes y Ubicaciones</h3>
        <button @click="openDialog()" class="bg-gray-900 hover:bg-gray-800 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 shadow-sm">
          <q-icon name="add" /> Nueva Sede
        </button>
      </div>
      <q-table :rows="sedes" :columns="columns" row-key="id" flat class="qt-clean" :loading="loading">
        <template v-slot:body-cell-activo="props">
          <q-td :props="props">
            <q-toggle :model-value="props.row.activo" @update:model-value="toggleSede(props.row)" color="black" size="sm" />
          </q-td>
        </template>
        <template v-slot:body-cell-acciones="props">
          <q-td :props="props">
            <div class="flex justify-center gap-2">
              <button @click="editSede(props.row)" class="p-1.5 text-gray-500 hover:text-blue-600 rounded-lg"><q-icon name="edit" size="18px"/></button>
              <button @click="deleteSede(props.row)" class="p-1.5 text-gray-500 hover:text-red-600 rounded-lg"><q-icon name="delete" size="18px"/></button>
            </div>
          </q-td>
        </template>
      </q-table>
    </div>

    <!-- Dialog Sede -->
    <q-dialog v-model="showDialog">
      <q-card style="min-width: 400px" class="rounded-xl">
        <q-card-section class="bg-gray-50 border-b border-gray-100 py-4 font-bold">
          {{ editingSede ? 'Editar Sede' : 'Nueva Sede' }}
        </q-card-section>
        <q-card-section class="space-y-4 pt-4">
          <q-input v-model="form.nombre" outlined dense label="Nombre *" :rules="[val => !!val || 'Requerido']" />
        </q-card-section>
        <q-card-actions align="right" class="p-4 bg-gray-50">
          <q-btn flat label="Cancelar" v-close-popup class="text-gray-600" />
          <q-btn color="primary" label="Guardar" @click="saveSede" :loading="saving" />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { api } from 'boot/axios'
import { useQuasar } from 'quasar'
import { useAuthStore } from 'stores/auth-store'

const $q = useQuasar()
const authStore = useAuthStore()
const sedes = ref([])
const loading = ref(false)
const saving = ref(false)
const showDialog = ref(false)
const editingSede = ref(null)
const form = ref({ nombre: '' })

const columns = [
  { name: 'nombre', label: 'Nombre', field: 'nombre', align: 'left', sortable: true },
  { name: 'activo', label: 'Activo', field: 'activo', align: 'center' },
  { name: 'acciones', label: '', field: 'acciones', align: 'center' },
]

const loadSedes = async () => {
  loading.value = true
  try {
    const { data } = await api.get('/admin/sedes')
    sedes.value = data
  } catch (e) {
    console.error(e)
    $q.notify({ type: 'negative', message: 'Error cargando sedes' })
  } finally {
    loading.value = false
  }
}

const openDialog = () => {
  editingSede.value = null
  form.value = { nombre: '' }
  showDialog.value = true
}

const editSede = (item) => {
  editingSede.value = item
  form.value = { ...item }
  showDialog.value = true
}

const saveSede = async () => {
  if (!form.value.nombre) return

  saving.value = true
  try {
    if (editingSede.value) {
      await api.put(`/admin/sedes/${editingSede.value.id}`, form.value)
    } else {
      await api.post('/admin/sedes', form.value)
    }
    showDialog.value = false
    $q.notify({ type: 'positive', message: 'Sede guardada correctamente' })
    loadSedes()
  } catch (e) {
    console.error(e)
    $q.notify({ type: 'negative', message: 'Error al guardar sede' })
  } finally {
    saving.value = false
  }
}

const deleteSede = async (sede) => {
  $q.dialog({
    title: 'Confirmar',
    message: '¿Está seguro de eliminar esta sede?',
    cancel: true,
    persistent: true
  }).onOk(async () => {
    try {
      await api.delete(`/admin/sedes/${sede.id}`)
      loadSedes()
      $q.notify({ type: 'positive', message: 'Sede eliminada' })
    } catch {
      $q.notify({ type: 'negative', message: 'Error al eliminar' })
    }
  })
}

const toggleSede = async (sede) => {
  try {
    await api.patch(`/admin/sedes/${sede.id}/toggle`)
    loadSedes()
  } catch (e) {
    console.error(e)
    $q.notify({ type: 'negative', message: 'Error al cambiar estado' })
  }
}

onMounted(() => {
  // Solo cargar si está autenticado
  if (authStore.isLoggedIn) {
    loadSedes()
  }
})
</script>
