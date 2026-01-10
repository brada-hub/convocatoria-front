<template>
    <div class="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        <!-- Header -->
        <div class="bg-primary px-5 py-3 flex flex-col md:flex-row justify-between items-center gap-4">
            <div class="flex items-center gap-3">
                <div class="p-2 bg-white/10 rounded-lg text-white backdrop-blur-sm">
                    <q-icon name="campaign" size="22px" />
                </div>
                <div class="text-white">
                    <h3 class="text-base font-bold leading-tight">Gestión de Convocatorias</h3>
                    <div class="text-[11px] opacity-90 font-medium">Administre las ofertas laborales vigentes</div>
                </div>
            </div>
            <button @click="openDialog()"
                class="bg-secondary hover:bg-teal-600 text-white px-3 py-1.5 rounded-lg text-sm font-bold transition-all shadow-md hover:shadow-lg flex items-center gap-2">
                <q-icon name="add" size="16px" /> Nueva
            </button>
        </div>

        <!-- Table -->
        <q-table :rows="convocatorias" :columns="columns" row-key="id" flat :pagination="{ rowsPerPage: 10 }"
            class="qt-clean">
            <template v-slot:body-cell-estado="props">
                <q-td :props="props">
                    <span :class="getEstadoClass(props.row)"
                        class="px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wide">
                        {{ getEstadoLabel(props.row) }}
                    </span>
                    <span class="text-xs text-gray-400 ml-2 block mt-1">{{ props.row.ofertas_count || 0 }}
                        Ofertas</span>
                </q-td>
            </template>
            <template v-slot:body-cell-acciones="props">
                <q-td :props="props">
                    <div class="flex justify-center gap-2">
                        <button @click="openDialog(props.row)"
                            class="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                            <q-icon name="edit" size="18px" />
                        </button>
                        <button @click="$emit('manage-ofertas', props.row)"
                            class="p-1.5 text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors">
                            <q-icon name="settings" size="18px" />
                        </button>
                        <button @click="$emit('view-postulaciones', props.row)"
                            class="p-1.5 text-gray-500 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors">
                            <q-icon name="visibility" size="18px" />
                        </button>
                        <button @click="eliminar(props.row)"
                            class="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                            <q-icon name="delete" size="18px" />
                        </button>
                    </div>
                </q-td>
            </template>
        </q-table>

        <!-- Dialog Crear/Editar -->
        <q-dialog v-model="showDialog" persistent>
            <q-card style="min-width: 600px; max-width: 95vw;" class="rounded-xl">
                <q-card-section class="row items-center border-b border-gray-100 q-py-md px-6 bg-white">
                    <div>
                        <div class="text-xl font-bold text-gray-900">{{ editingItem ? 'Editar' : 'Nueva' }} Convocatoria
                        </div>
                        <div class="text-sm text-gray-500">Complete la información básica</div>
                    </div>
                    <q-space />
                    <q-btn icon="close" flat round dense v-close-popup class="text-gray-500" />
                </q-card-section>

                <q-card-section class="q-pa-lg">
                    <div class="space-y-4">
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1">Título *</label>
                            <q-input v-model="form.titulo" outlined dense
                                placeholder="Ej: Convocatoria Nacional 2026" />
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
                            <q-input v-model="form.descripcion" outlined dense type="textarea" rows="3" />
                        </div>
                        <div class="grid grid-cols-2 gap-4">
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-1">Fecha Inicio *</label>
                                <q-input v-model="form.fecha_inicio" outlined dense type="date" />
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-1">Fecha Cierre *</label>
                                <q-input v-model="form.fecha_cierre" outlined dense type="date" />
                            </div>
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1">Estado</label>
                            <q-select v-model="form.estado" :options="estadoOptions" outlined dense emit-value
                                map-options />
                        </div>
                    </div>
                </q-card-section>

                <q-card-section class="flex justify-end gap-3 border-t border-gray-100">
                    <q-btn flat label="Cancelar" color="grey" v-close-popup />
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

const emit = defineEmits(['manage-ofertas', 'view-postulaciones', 'refresh'])
const $q = useQuasar()

const convocatorias = ref([])
const showDialog = ref(false)
const editingItem = ref(null)
const saving = ref(false)
const form = ref({ titulo: '', descripcion: '', fecha_inicio: '', fecha_cierre: '', estado: 'borrador' })

const columns = [
    { name: 'titulo', label: 'Convocatoria', field: 'titulo', align: 'left', sortable: true },
    { name: 'fecha_inicio', label: 'Inicio', field: 'fecha_inicio', align: 'center', format: val => val?.split('T')[0]?.split('-').reverse().join('/') || '-' },
    { name: 'fecha_cierre', label: 'Cierre', field: 'fecha_cierre', align: 'center', format: val => val?.split('T')[0]?.split('-').reverse().join('/') || '-' },
    { name: 'estado', label: 'Estado', field: 'estado', align: 'center' },
    { name: 'acciones', label: '', field: 'acciones', align: 'center' }
]

const estadoOptions = [
    { label: 'Borrador', value: 'borrador' },
    { label: 'Activa', value: 'activa' },
    { label: 'Cerrada', value: 'cerrada' }
]

const loadData = async () => {
    try {
        const { data } = await api.get('/admin/convocatorias')
        convocatorias.value = data
    } catch { $q.notify({ type: 'negative', message: 'Error al cargar convocatorias' }) }
}

const openDialog = (item = null) => {
    editingItem.value = item
    if (item) {
        form.value = {
            titulo: item.titulo,
            descripcion: item.descripcion || '',
            fecha_inicio: item.fecha_inicio?.split('T')[0] || '',
            fecha_cierre: item.fecha_cierre?.split('T')[0] || '',
            estado: item.estado || 'borrador'
        }
    } else {
        form.value = { titulo: '', descripcion: '', fecha_inicio: '', fecha_cierre: '', estado: 'borrador' }
    }
    showDialog.value = true
}

const guardar = async () => {
    if (!form.value.titulo || !form.value.fecha_inicio || !form.value.fecha_cierre) {
        $q.notify({ type: 'warning', message: 'Complete los campos requeridos' })
        return
    }
    saving.value = true
    try {
        if (editingItem.value) {
            await api.put(`/admin/convocatorias/${editingItem.value.id}`, form.value)
        } else {
            await api.post('/admin/convocatorias', form.value)
        }
        showDialog.value = false
        loadData()
        emit('refresh')
        $q.notify({ type: 'positive', message: 'Guardado correctamente' })
    } catch (e) {
        $q.notify({ type: 'negative', message: e.response?.data?.message || 'Error al guardar' })
    } finally { saving.value = false }
}

const eliminar = (item) => {
    $q.dialog({
        title: 'Confirmar eliminación',
        message: `¿Eliminar "${item.titulo}"?`,
        persistent: true,
        ok: { label: 'Eliminar', color: 'red', flat: true },
        cancel: { label: 'Cancelar', color: 'grey', flat: true }
    }).onOk(async () => {
        try {
            await api.delete(`/admin/convocatorias/${item.id}`)
            loadData()
            emit('refresh')
            $q.notify({ type: 'positive', message: 'Eliminado' })
        } catch (e) { $q.notify({ type: 'negative', message: e.response?.data?.message || 'Error' }) }
    })
}

const getEstadoClass = (row) => {
    const now = new Date()
    const cierre = new Date(row.fecha_cierre)
    const inicio = new Date(row.fecha_inicio)
    if (cierre < now) return 'bg-red-100 text-red-700'
    if (inicio > now) return 'bg-gray-100 text-gray-600'
    return 'bg-green-100 text-green-700'
}

const getEstadoLabel = (row) => {
    const now = new Date()
    const cierre = new Date(row.fecha_cierre)
    const inicio = new Date(row.fecha_inicio)
    if (cierre < now) return 'Cerrada'
    if (inicio > now) return 'Próxima'
    return 'Activa'
}

onMounted(loadData)

defineExpose({ loadData })
</script>
