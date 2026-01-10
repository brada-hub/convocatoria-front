<template>
  <div class="animate-fadeIn">
      <div class="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        <!-- Header Purple Style -->
        <div class="bg-primary px-5 py-3 flex flex-col md:flex-row justify-between items-center gap-4">
           <div class="flex items-center gap-3">
              <div class="p-2 bg-white/10 rounded-lg text-white backdrop-blur-sm">
                 <q-icon name="manage_accounts" size="22px" />
              </div>
              <div class="text-white">
                 <h3 class="text-base font-bold leading-tight">Gestión de Usuarios</h3>
                 <div class="text-[11px] opacity-90 font-medium">Administra personal y accesos</div>
              </div>
           </div>

           <button @click="openDialog()" class="bg-secondary hover:bg-teal-600 text-white px-3 py-1.5 rounded-lg text-sm font-bold transition-all shadow-md hover:shadow-lg flex items-center gap-2">
             <q-icon name="person_add" size="16px" /> Nuevo Usuario
           </button>
        </div>

        <q-table :rows="users" :columns="columns" row-key="id" flat class="qt-clean" :loading="loading">
          <template v-slot:body-cell-rol="props">
            <q-td :props="props">
              <span class="px-2 py-1 bg-purple-50 text-purple-700 rounded-lg text-xs font-bold uppercase">
                {{ props.row.rol?.nombre || 'Sin Rol' }}
              </span>
            </q-td>
          </template>
           <template v-slot:body-cell-activo="props">
            <q-td :props="props">
              <q-toggle
                :model-value="props.row.activo"
                @update:model-value="toggleUser(props.row)"
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
                <button @click="editUser(props.row)" class="p-1.5 text-gray-500 hover:text-blue-600 rounded-lg" title="Editar"><q-icon name="edit" size="18px"/></button>
                <button @click="resetPassword(props.row)" class="p-1.5 text-gray-500 hover:text-orange-600 rounded-lg" title="Restablecer Contraseña (CI)"><q-icon name="lock_reset" size="18px"/></button>
                <button @click="deleteUser(props.row)" class="p-1.5 text-gray-500 hover:text-red-600 rounded-lg" title="Eliminar"><q-icon name="delete" size="18px"/></button>
              </div>
            </q-td>
          </template>
        </q-table>
      </div>

    <!-- Dialog User -->
    <q-dialog v-model="showDialog">
      <q-card style="min-width: 450px" class="rounded-xl">
        <q-card-section class="bg-gray-50 border-b border-gray-100 py-4 font-bold">
          {{ editingUser ? 'Editar Usuario' : 'Nuevo Usuario' }}
        </q-card-section>
        <q-card-section class="space-y-4 pt-4">
          <div class="grid grid-cols-2 gap-4">
              <q-input v-model="form.nombres" outlined dense label="Nombres *" :rules="[val => !!val || 'Requerido']" />
              <q-input v-model="form.apellidos" outlined dense label="Apellidos *" :rules="[val => !!val || 'Requerido']" />
          </div>

          <q-input v-model="form.ci" outlined dense label="Cédula de Identidad (Usuario)*" :rules="[val => !!val || 'Requerido']" hint="Será el usuario y contraseña inicial" />

          <q-select
            v-model="form.rol_id"
            :options="rolOptions"
            option-label="nombre"
            option-value="id"
            emit-value
            map-options
            outlined
            dense
            label="Rol *"
            :rules="[val => !!val || 'Requerido']"
          />

           <div v-if="!editingUser" class="bg-blue-50 p-3 rounded-lg text-xs text-blue-800 flex items-start gap-2">
              <q-icon name="info" size="16px" class="mt-0.5" />
              <div>
                  <strong>Nota:</strong> La contraseña inicial será el número de Cédula de Identidad. El usuario deberá cambiarla en su primer inicio de sesión.
              </div>
          </div>

        </q-card-section>
        <q-card-actions align="right" class="p-4 bg-gray-50">
          <q-btn flat label="Cancelar" v-close-popup class="text-gray-600" />
          <q-btn color="primary" label="Guardar" @click="saveUser" :loading="saving" />
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
const users = ref([])
const rolOptions = ref([])
const loading = ref(false)
const saving = ref(false)
const showDialog = ref(false)
const editingUser = ref(null)
const form = ref({ nombres: '', apellidos: '', ci: '', rol_id: null })

const columns = [
  { name: 'nombres', label: 'Nombres', field: 'nombres', align: 'left', sortable: true },
  { name: 'apellidos', label: 'Apellidos', field: 'apellidos', align: 'left', sortable: true },
  { name: 'ci', label: 'CI (Usuario)', field: 'ci', align: 'left', sortable: true },
  { name: 'rol', label: 'Rol', field: 'rol', align: 'left' },
  { name: 'activo', label: 'Estado', field: 'activo', align: 'center' },
  { name: 'acciones', label: '', field: 'acciones', align: 'center' },
]

const loadUsers = async () => {
  loading.value = true
  try {
    const { data } = await api.get('/admin/users')
    users.value = data
  } catch (e) {
    console.error(e)
    $q.notify({ type: 'negative', message: 'Error cargando usuarios' })
  } finally {
    loading.value = false
  }
}

const loadRoles = async () => {
  try {
    const { data } = await api.get('/admin/roles')
    rolOptions.value = data
  } catch (e) { console.error(e) }
}

const openDialog = () => {
  editingUser.value = null
  form.value = { nombres: '', apellidos: '', ci: '', rol_id: null }
  showDialog.value = true
}

const editUser = (item) => {
  editingUser.value = item
  form.value = {
    nombres: item.nombres,
    apellidos: item.apellidos,
    ci: item.ci,
    rol_id: item.rol_id,
  }
  showDialog.value = true
}

const saveUser = async () => {
  if (!form.value.nombres || !form.value.apellidos || !form.value.ci || !form.value.rol_id) return

  saving.value = true
  try {
    if (editingUser.value) {
      await api.put(`/admin/users/${editingUser.value.id}`, form.value)
      $q.notify({ type: 'positive', message: 'Usuario actualizado correctamente' })
    } else {
      await api.post('/admin/users', form.value)
      $q.notify({ type: 'positive', message: 'Usuario creado. Contraseña inicial asignada (CI)' })
    }
    showDialog.value = false
    loadUsers()
  } catch (e) {
    console.error(e)
    const msg = e.response?.data?.message || 'Error al guardar usuario'
    $q.notify({ type: 'negative', message: msg })
  } finally {
    saving.value = false
  }
}

const toggleUser = async (user) => {
  try {
    const { data } = await api.patch(`/admin/users/${user.id}/toggle`)
    loadUsers()
    if (data.activo) {
        $q.notify({ type: 'positive', message: 'Usuario habilitado', icon: 'check_circle' })
    } else {
        $q.notify({ type: 'warning', message: 'Usuario deshabilitado', icon: 'block' })
    }
  } catch (e) {
    console.error(e)
    $q.notify({ type: 'negative', message: 'Error al cambiar estado' })
  }
}

const resetPassword = (user) => {
    $q.dialog({
    title: 'Restablecer Contraseña',
    message: `¿Desea restablecer la contraseña de <b>${user.nombres}</b> a su número de CI (${user.ci})?`,
    html: true,
    cancel: true,
    persistent: true,
    ok: { label: 'Restablecer', color: 'orange' }
  }).onOk(async () => {
    try {
      await api.patch(`/admin/users/${user.id}/reset-password`)
      $q.notify({ type: 'positive', message: 'Contraseña restablecida exitosamente' })
    } catch {
      $q.notify({ type: 'negative', message: 'Error al restablecer contraseña' })
    }
  })
}

const deleteUser = async (user) => {
  $q.dialog({
    title: 'Confirmar',
    message: '¿Está seguro de eliminar este usuario?',
    cancel: true,
    persistent: true,
    ok: { label: 'Eliminar', color: 'red', flat: true }
  }).onOk(async () => {
    try {
      await api.delete(`/admin/users/${user.id}`)
      loadUsers()
      $q.notify({ type: 'positive', message: 'Usuario eliminado' })
    } catch {
      $q.notify({ type: 'negative', message: 'Error al eliminar' })
    }
  })
}

onMounted(() => {
  if (authStore.isLoggedIn) {
    loadUsers()
    loadRoles()
  }
})
</script>
