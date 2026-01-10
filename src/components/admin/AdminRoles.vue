<template>
  <div class="animate-fadeIn">
      <div class="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        <!-- Header Purple Style -->
        <div class="bg-primary px-5 py-3 flex flex-col md:flex-row justify-between items-center gap-4">
           <div class="flex items-center gap-3">
              <div class="p-2 bg-white/10 rounded-lg text-white backdrop-blur-sm">
                 <q-icon name="security" size="22px" />
              </div>
              <div class="text-white">
                 <h3 class="text-base font-bold leading-tight">Gestión de Roles</h3>
                 <div class="text-[11px] opacity-90 font-medium">Administra los roles del sistema</div>
              </div>
           </div>

           <button @click="openDialog()" class="bg-secondary hover:bg-teal-600 text-white px-3 py-1.5 rounded-lg text-sm font-bold transition-all shadow-md hover:shadow-lg flex items-center gap-2">
             <q-icon name="add" size="16px" /> Nuevo Rol
           </button>
        </div>

        <q-table :rows="roles" :columns="columns" row-key="id" flat class="qt-clean" :loading="loading">
          <template v-slot:body-cell-activo="props">
            <q-td :props="props">
              <q-toggle
                :model-value="props.row.activo"
                @update:model-value="toggleRol(props.row)"
                checked-icon="check"
                unchecked-icon="close"
                color="green"
                size="md"
              />
            </q-td>
          </template>
          <template v-slot:body-cell-acciones="props">
            <q-td :props="props">
              <div class="flex justify-center gap-2">
                <button @click="editRol(props.row)" class="p-1.5 text-gray-500 hover:text-blue-600 rounded-lg"><q-icon name="edit" size="18px"/></button>
                <button @click="deleteRol(props.row)" class="p-1.5 text-gray-500 hover:text-red-600 rounded-lg"><q-icon name="delete" size="18px"/></button>
              </div>
            </q-td>
          </template>
        </q-table>
      </div>

    <!-- Dialog Rol -->
    <q-dialog v-model="showDialog">
      <q-card style="min-width: 400px" class="rounded-xl">
        <q-card-section class="bg-gray-50 border-b border-gray-100 py-4 font-bold">
          {{ editingRol ? 'Editar Rol' : 'Nuevo Rol' }}
        </q-card-section>
        <q-card-section class="space-y-4 pt-4">
          <q-input v-model="form.nombre" outlined dense label="Nombre *" :rules="[val => !!val || 'Requerido']" />
          <q-input v-model="form.descripcion" outlined dense label="Descripción" type="textarea" rows="2" />
        </q-card-section>
        <q-card-actions align="right" class="p-4 bg-gray-50">
          <q-btn flat label="Cancelar" v-close-popup class="text-gray-600" />
          <q-btn color="primary" label="Guardar" @click="saveRol" :loading="saving" />
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
const roles = ref([])
const loading = ref(false)
const saving = ref(false)
const showDialog = ref(false)
const editingRol = ref(null)
const form = ref({ nombre: '', descripcion: '' })

const columns = [
  { name: 'nombre', label: 'Nombre', field: 'nombre', align: 'left', sortable: true },
  { name: 'descripcion', label: 'Descripción', field: 'descripcion', align: 'left' },
  { name: 'activo', label: 'Activo', field: 'activo', align: 'center' },
  { name: 'acciones', label: '', field: 'acciones', align: 'center' },
]

const loadRoles = async () => {
  loading.value = true
  try {
    const { data } = await api.get('/admin/roles')
    roles.value = data
  } catch (e) {
    console.error(e)
    $q.notify({ type: 'negative', message: 'Error cargando roles' })
  } finally {
    loading.value = false
  }
}

const openDialog = () => {
  editingRol.value = null
  form.value = { nombre: '', descripcion: '' }
  showDialog.value = true
}

const editRol = (item) => {
  editingRol.value = item
  form.value = { ...item }
  showDialog.value = true
}

const saveRol = async () => {
  if (!form.value.nombre) return

  saving.value = true
  try {
    if (editingRol.value) {
      await api.put(`/admin/roles/${editingRol.value.id}`, form.value)
    } else {
      await api.post('/admin/roles', form.value)
    }
    showDialog.value = false
    $q.notify({ type: 'positive', message: 'Rol guardado correctamente' })
    loadRoles()
  } catch (e) {
    console.error(e)
    $q.notify({ type: 'negative', message: 'Error al guardar rol' })
  } finally {
    saving.value = false
  }
}

const deleteRol = async (rol) => {
  $q.dialog({
    title: 'Confirmar',
    message: '¿Está seguro de eliminar este rol?',
    cancel: true,
    persistent: true
  }).onOk(async () => {
    try {
      await api.delete(`/admin/roles/${rol.id}`)
      loadRoles()
      $q.notify({ type: 'positive', message: 'Rol eliminado' })
    } catch {
      $q.notify({ type: 'negative', message: 'Error al eliminar' })
    }
  })
}

const toggleRol = async (rol) => {
  try {
    const { data } = await api.patch(`/admin/roles/${rol.id}/toggle`)
    loadRoles()

    if (data.activo) {
        $q.notify({ type: 'positive', message: 'Rol activado correctamente', icon: 'check_circle' })
    } else {
        $q.notify({ type: 'warning', message: 'Rol desactivado', icon: 'block' })
    }
  } catch (e) {
    console.error(e)
    $q.notify({ type: 'negative', message: 'Error al cambiar estado' })
  }
}

onMounted(() => {
  if (authStore.isLoggedIn) {
    loadRoles()
  }
})
</script>
