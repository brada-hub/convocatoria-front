<template>
    <div class="min-h-screen bg-gray-50/50 p-4 md:p-6">
        <!-- Header -->
        <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <div>
                <h2 class="text-2xl font-bold text-gray-800">Tipos de Documento</h2>
                <p class="text-sm text-gray-500 mt-1">Catálogo de documentos que pueden requerirse en las convocatorias
                </p>
            </div>
            <button @click="openDialog()"
                class="px-4 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-semibold shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 transition-all flex items-center gap-2 whitespace-nowrap">
                <q-icon name="add" size="20px" />
                Nuevo Tipo
            </button>
        </div>

        <!-- Lista de Tipos de Documento -->
        <div class="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div class="overflow-x-auto">
                <table class="min-w-full">
                    <thead class="bg-gray-50 border-b border-gray-100">
                        <tr>
                            <th class="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wide">
                                Icono</th>
                            <th class="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wide">
                                Nombre</th>
                            <th class="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wide">
                                Descripción</th>
                            <th class="px-6 py-4 text-center text-xs font-bold text-gray-500 uppercase tracking-wide">
                                Estado</th>
                            <th class="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase tracking-wide">
                                Acciones</th>
                        </tr>
                    </thead>
                    <tbody class="divide-y divide-gray-50">
                        <tr v-for="tipo in tiposDocumento" :key="tipo.id" class="hover:bg-gray-50/50 transition-colors">
                            <td class="px-6 py-4">
                                <div class="p-2 bg-blue-50 text-blue-600 rounded-lg w-fit">
                                    <q-icon :name="tipo.icono || 'description'" size="20px" />
                                </div>
                            </td>
                            <td class="px-6 py-4 font-medium text-gray-900">{{ tipo.nombre }}</td>
                            <td class="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">{{ tipo.descripcion || '-' }}
                            </td>
                            <td class="px-6 py-4 text-center">
                                <span :class="tipo.activo ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'"
                                    class="px-3 py-1 rounded-full text-xs font-semibold">
                                    {{ tipo.activo ? 'Activo' : 'Inactivo' }}
                                </span>
                            </td>
                            <td class="px-6 py-4 text-right">
                                <div class="flex items-center justify-end gap-2">
                                    <button @click="openDialog(tipo)"
                                        class="p-2 hover:bg-blue-50 rounded-lg transition-colors text-blue-600">
                                        <q-icon name="edit" size="18px" />
                                    </button>
                                    <button @click="toggleActivo(tipo)"
                                        :class="tipo.activo ? 'hover:bg-orange-50 text-orange-600' : 'hover:bg-green-50 text-green-600'"
                                        class="p-2 rounded-lg transition-colors">
                                        <q-icon :name="tipo.activo ? 'visibility_off' : 'visibility'" size="18px" />
                                    </button>
                                    <button @click="eliminar(tipo)"
                                        class="p-2 hover:bg-red-50 rounded-lg transition-colors text-red-500">
                                        <q-icon name="delete" size="18px" />
                                    </button>
                                </div>
                            </td>
                        </tr>
                    </tbody>
                </table>

                <div v-if="tiposDocumento.length === 0" class="p-12 text-center text-gray-400">
                    <q-icon name="folder_open" size="48px" class="mb-4 opacity-50" />
                    <p>No hay tipos de documento registrados</p>
                </div>
            </div>
        </div>

        <!-- Dialog Crear/Editar -->
        <q-dialog v-model="showDialog" persistent>
            <q-card class="w-full max-w-md rounded-2xl">
                <q-card-section class="border-b border-gray-100">
                    <div class="text-lg font-bold text-gray-800">
                        {{ editingItem ? 'Editar Tipo de Documento' : 'Nuevo Tipo de Documento' }}
                    </div>
                </q-card-section>

                <q-card-section class="q-pt-lg">
                    <div class="space-y-4">
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1">Nombre *</label>
                            <q-input v-model="form.nombre" outlined dense placeholder="Ej: Diploma Académico"
                                :rules="[v => !!v || 'Requerido']" />
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
                            <q-input v-model="form.descripcion" outlined dense type="textarea" rows="2"
                                placeholder="Descripción breve del documento" />
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1">Icono (Material Icons)</label>
                            <q-input v-model="form.icono" outlined dense placeholder="Ej: school, work, badge">
                                <template v-slot:prepend>
                                    <q-icon :name="form.icono || 'description'" />
                                </template>
                            </q-input>
                            <div class="text-xs text-gray-400 mt-1">
                                <a href="https://fonts.google.com/icons" target="_blank"
                                    class="text-blue-500 hover:underline">
                                    Ver iconos disponibles
                                </a>
                            </div>
                        </div>
                    </div>
                </q-card-section>

                <q-card-section class="flex justify-end gap-3 border-t border-gray-100">
                    <q-btn flat label="Cancelar" color="grey" @click="showDialog = false" />
                    <q-btn unelevated label="Guardar" color="primary" @click="guardar" :loading="saving" />
                </q-card-section>
            </q-card>
        </q-dialog>
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useQuasar } from 'quasar'
import { api } from 'boot/axios'

const $q = useQuasar()

const tiposDocumento = ref([])
const showDialog = ref(false)
const editingItem = ref(null)
const saving = ref(false)
const form = ref({
    nombre: '',
    descripcion: '',
    icono: 'description'
})

const loadData = async () => {
    try {
        const { data } = await api.get('/admin/tipos-documento')
        tiposDocumento.value = data
    } catch {
        $q.notify({ type: 'negative', message: 'Error al cargar tipos de documento' })
    }
}

const openDialog = (item = null) => {
    editingItem.value = item
    if (item) {
        form.value = { ...item }
    } else {
        form.value = { nombre: '', descripcion: '', icono: 'description' }
    }
    showDialog.value = true
}

const guardar = async () => {
    if (!form.value.nombre) {
        $q.notify({ type: 'warning', message: 'El nombre es requerido' })
        return
    }

    saving.value = true
    try {
        if (editingItem.value) {
            await api.put(`/admin/tipos-documento/${editingItem.value.id}`, form.value)
        } else {
            await api.post('/admin/tipos-documento', form.value)
        }
        showDialog.value = false
        loadData()
        $q.notify({ type: 'positive', message: 'Guardado correctamente' })
    } catch (e) {
        $q.notify({ type: 'negative', message: e.response?.data?.message || 'Error al guardar' })
    } finally {
        saving.value = false
    }
}

const toggleActivo = async (item) => {
    try {
        await api.patch(`/admin/tipos-documento/${item.id}/toggle`)
        loadData()
        $q.notify({ type: 'positive', message: item.activo ? 'Desactivado' : 'Activado' })
    } catch {
        $q.notify({ type: 'negative', message: 'Error al cambiar estado' })
    }
}

const eliminar = (item) => {
    $q.dialog({
        title: 'Confirmar eliminación',
        message: `¿Eliminar "${item.nombre}"? Esta acción no se puede deshacer.`,
        persistent: true,
        ok: { label: 'Eliminar', color: 'red', flat: true },
        cancel: { label: 'Cancelar', color: 'grey', flat: true }
    }).onOk(async () => {
        try {
            await api.delete(`/admin/tipos-documento/${item.id}`)
            loadData()
            $q.notify({ type: 'positive', message: 'Eliminado correctamente' })
        } catch (e) {
            $q.notify({ type: 'negative', message: e.response?.data?.message || 'Error al eliminar' })
        }
    })
}

onMounted(loadData)
</script>
