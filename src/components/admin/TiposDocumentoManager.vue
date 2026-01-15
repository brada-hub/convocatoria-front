<template>
  <div class="tipos-documento-manager" :class="{ 'q-pa-lg': !modoCompacto }">
    <!-- Header -->
    <div v-if="!modoCompacto" class="flex justify-between items-center q-mb-lg">
      <div>
        <h4 class="text-h5 font-bold text-gray-800 q-mb-xs">Gestión de Tipos de Documento</h4>
        <p class="text-grey-6">Configura los documentos que se pueden requerir en cada convocatoria</p>
      </div>
      <q-btn color="primary" icon="add" label="Nuevo Tipo" @click="openCreateModal" no-caps />
    </div>

    <!-- Filtros (Hidden in Compact) -->
    <div v-if="!modoCompacto" class="row q-col-gutter-md q-mb-lg">
      <div class="col-12 col-md-4">
        <q-input v-model="filtro" filled dense placeholder="Buscar por nombre..." clearable>
          <template v-slot:prepend><q-icon name="search" /></template>
        </q-input>
      </div>
      <div class="col-12 col-md-3">
        <q-select v-model="categoriaFiltro" filled dense :options="categoriasOpciones" emit-value map-options
          label="Categoría" clearable />
      </div>
    </div>

    <div v-if="!modoCompacto">
      <!-- Loading -->
      <div v-if="loading" class="text-center q-py-xl">
      <q-spinner-dots size="40px" color="primary" />
      <p class="text-grey-5 q-mt-md">Cargando tipos de documento...</p>
    </div>

    <!-- Lista de Tipos -->
    <div v-else class="row q-col-gutter-md">
      <div v-for="tipo in tiposFiltrados" :key="tipo.id" class="col-12 col-md-6 col-lg-4">
        <q-card class="tipo-card" :class="{ 'opacity-50': !tipo.activo }">
          <q-card-section>
            <div class="flex items-start gap-3">
              <!-- Icono -->
              <div class="tipo-icon" :class="`bg-${getCategoriaColor(tipo.categoria)}-100`">
                <q-icon :name="tipo.icono || 'description'" size="24px" :color="getCategoriaColor(tipo.categoria)" />
              </div>

              <!-- Info -->
              <div class="flex-1">
                <div class="flex justify-between items-start">
                  <div>
                    <div class="font-bold text-gray-800">{{ tipo.nombre }}</div>
                    <q-badge :color="getCategoriaColor(tipo.categoria)" class="q-mt-xs" outline>
                      {{ formatCategoria(tipo.categoria) }}
                    </q-badge>
                  </div>
                  <q-toggle v-model="tipo.activo" color="positive" @update:model-value="toggleActivo(tipo)" />
                </div>
                <p class="text-xs text-grey-6 q-mt-sm line-clamp-2">{{ tipo.descripcion }}</p>

                <!-- Campos -->
                <div v-if="tipo.campos && tipo.campos.length > 0" class="q-mt-sm">
                  <div class="text-xs text-grey-7 font-medium q-mb-xs">Campos del formulario:</div>
                  <div class="flex flex-wrap gap-1">
                    <q-chip v-for="campo in tipo.campos" :key="campo.nombre" size="sm" dense color="grey-3">
                      {{ campo.label }}
                      <q-icon v-if="campo.obligatorio" name="star" color="red" size="10px" class="q-ml-xs" />
                    </q-chip>
                  </div>
                </div>
                <div v-else class="q-mt-sm">
                  <q-chip size="sm" color="orange-2" text-color="orange-9">Solo archivo (sin campos adicionales)</q-chip>
                </div>
              </div>
            </div>
          </q-card-section>

          <q-separator />

          <q-card-actions align="right">
            <q-btn flat size="sm" icon="edit" color="primary" @click="openEditModal(tipo)">
              <q-tooltip>Editar</q-tooltip>
            </q-btn>
            <q-btn flat size="sm" icon="delete" color="negative" @click="confirmarEliminar(tipo)">
              <q-tooltip>Eliminar</q-tooltip>
            </q-btn>
          </q-card-actions>
        </q-card>
    </div>
    </div>
  </div>

    <!-- Modal Crear/Editar -->
    <q-dialog v-model="showModal" persistent transition-show="slide-up">
      <q-card class="modal-card">
        <q-card-section class="bg-primary text-white">
          <div class="flex justify-between items-center">
            <div class="text-h6">{{ editando ? 'Editar' : 'Crear' }} Tipo de Documento</div>
            <q-btn flat round icon="close" @click="closeModal" />
          </div>
        </q-card-section>

        <q-card-section class="q-pa-lg" style="max-height: 70vh; overflow-y: auto;">
          <q-form ref="formRef" class="row q-col-gutter-md">
            <!-- Nombre -->
            <div class="col-12 col-md-6">
              <q-input v-model="form.nombre" filled label="Nombre del Tipo *"
                :rules="[val => !!val || 'Requerido']" />
            </div>

            <!-- Categoría -->
            <div class="col-12 col-md-6">
              <q-select v-model="form.categoria" filled label="Categoría *"
                :options="categoriasOpciones" emit-value map-options
                :rules="[val => !!val || 'Requerido']" />
            </div>

            <!-- Descripción -->
            <div class="col-12">
              <q-input v-model="form.descripcion" filled label="Descripción" type="textarea" rows="2" />
            </div>

            <!-- Icono y Permite Múltiples -->
            <div class="col-12 col-md-6">
              <q-select v-model="form.icono" filled label="Icono *"
                :options="iconosOpciones" emit-value map-options>
                <template v-slot:prepend>
                  <q-icon :name="form.icono || 'description'" />
                </template>
                <template v-slot:option="scope">
                  <q-item v-bind="scope.itemProps">
                    <q-item-section avatar>
                      <q-icon :name="scope.opt.value" />
                    </q-item-section>
                    <q-item-section>
                      <q-item-label>{{ scope.opt.label }}</q-item-label>
                    </q-item-section>
                  </q-item>
                </template>
              </q-select>
            </div>
            <div class="col-12 col-md-6">
              <q-toggle v-model="form.permite_multiples" label="Permite agregar múltiples registros" />
              <div class="text-caption text-grey-6">Si está activado, el postulante puede agregar varios (ej: varios títulos)</div>
            </div>

            <!-- Campos Dinámicos -->
            <div class="col-12">
              <q-separator class="q-my-md" />
              <div class="flex justify-between items-center q-mb-md">
                <div>
                  <div class="text-subtitle1 font-bold">Campos del Formulario</div>
                  <div class="text-caption text-grey-6">Define qué información debe llenar el postulante además del archivo</div>
                </div>
                <q-btn outline color="primary" icon="add" label="Agregar Campo" @click="agregarCampo" no-caps size="sm" />
              </div>

              <div v-if="form.campos.length === 0" class="text-center q-py-lg bg-grey-1 rounded-lg">
                <q-icon name="info" size="32px" color="grey-5" />
                <p class="text-grey-5 q-mt-sm">Sin campos adicionales. Solo se solicitará el archivo.</p>
              </div>

              <draggable v-else v-model="form.campos" item-key="id" handle=".handle" class="campos-list">
                <template #item="{ element: campo, index }">
                  <div class="campo-item q-mb-sm">
                    <div class="row q-col-gutter-sm items-center">
                      <div class="col-auto">
                        <q-icon name="drag_indicator" class="handle cursor-move text-grey-5" />
                      </div>
                      <div class="col">
                        <q-input v-model="campo.label" filled dense label="Etiqueta *"
                          @update:model-value="generarNombreInterno(campo)" />
                      </div>
                      <!-- Hidden Nombre interno - Generated automatically -->
                      <input type="hidden" v-model="campo.nombre" />
                      <div class="col">
                        <q-select v-model="campo.tipo" filled dense label="Tipo *"
                          :options="tiposCampo" emit-value map-options />
                      </div>
                      <div class="col-auto">
                        <q-toggle v-model="campo.obligatorio" color="red" size="sm">
                          <q-tooltip>Obligatorio</q-tooltip>
                        </q-toggle>
                      </div>
                      <div class="col-auto">
                        <q-btn flat round size="sm" icon="delete" color="negative" @click="eliminarCampo(index)" />
                      </div>
                    </div>

                    <!-- Opciones para Select -->
                    <div v-if="campo.tipo === 'select'" class="q-mt-sm q-ml-xl">
                      <q-input v-model="campo.opcionesText" filled dense label="Opciones (separadas por coma)"
                        hint="Ej: Licenciatura, Maestría, Doctorado"
                        @update:model-value="actualizarOpciones(campo)" />
                    </div>

                    <!-- Opciones para Archivo -->
                    <div v-if="campo.tipo === 'file'" class="q-mt-sm q-ml-xl">
                      <div class="row q-col-gutter-md items-center">
                        <div class="col-auto">
                          <q-select v-model="campo.formatoArchivo" filled dense label="Formato aceptado"
                            :options="formatosArchivo" emit-value map-options style="min-width: 160px" />
                        </div>
                        <div class="col-auto">
                          <q-checkbox v-model="campo.permiteDrive" label="Permitir Google Drive" color="primary" />
                        </div>
                      </div>
                    </div>
                  </div>
                </template>
              </draggable>
            </div>
          </q-form>
        </q-card-section>

        <q-card-actions align="right" class="q-pa-md bg-grey-1">
          <q-btn flat label="Cancelar" @click="closeModal" no-caps />
          <q-btn color="primary" :label="editando ? 'Guardar Cambios' : 'Crear Tipo'"
            @click="guardar" :loading="guardando" no-caps />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </div>
</template>

<script setup>
const props = defineProps({
  modoCompacto: { type: Boolean, default: false }
})

const emit = defineEmits(['tipo-creado', 'cancelar'])
import { ref, computed, onMounted } from 'vue'
import { useQuasar } from 'quasar'
import { api } from 'boot/axios'
import draggable from 'vuedraggable'

const $q = useQuasar()
const tipos = ref([])
const loading = ref(false)
const guardando = ref(false)
const showModal = ref(false)
const editando = ref(false)
const formRef = ref(null)

const filtro = ref('')
const categoriaFiltro = ref(null)

const categoriasOpciones = [
  { label: 'Personal', value: 'personal' },
  { label: 'Académico', value: 'academico' },
  { label: 'Laboral', value: 'laboral' },
  { label: 'Capacitación', value: 'capacitacion' },
  { label: 'Producción', value: 'produccion' },
  { label: 'Reconocimiento', value: 'reconocimiento' },
  { label: 'General', value: 'general' },
]

const iconosOpciones = [
  { label: 'Documento', value: 'description' },
  { label: 'Educación', value: 'school' },
  { label: 'Título', value: 'workspace_premium' },
  { label: 'Trabajo', value: 'work' },
  { label: 'Historial', value: 'work_history' },
  { label: 'Libro', value: 'auto_stories' },
  { label: 'Medalla', value: 'emoji_events' },
  { label: 'Identificación', value: 'badge' },
  { label: 'Correo', value: 'mail' },
  { label: 'Calendario', value: 'event' },
  { label: 'Persona', value: 'person' },
  { label: 'Configuración', value: 'settings' },
  { label: 'Info', value: 'info' },
  { label: 'Estrella', value: 'star' },
  { label: 'Check', value: 'check_circle' },
]

const tiposCampo = [
  { label: 'Texto', value: 'text' },
  { label: 'Número', value: 'number' },
  { label: 'Año', value: 'year' },
  { label: 'Fecha', value: 'date' },
  { label: 'Selector', value: 'select' },
  { label: 'Texto largo', value: 'textarea' },
  { label: '📄 Archivo (PDF/Imagen)', value: 'file' },
]

const formatosArchivo = [
  { label: 'Solo PDF', value: 'pdf' },
  { label: 'Solo Imágenes', value: 'imagen' },
  { label: 'PDF e Imágenes', value: 'ambos' },
]

const defaultForm = () => ({
  id: null,
  nombre: '',
  descripcion: '',
  categoria: 'general',
  icono: 'description',
  permite_multiples: true,
  activo: true,
  campos: []
})

const form = ref(defaultForm())

const tiposFiltrados = computed(() => {
  return tipos.value
    .filter(t => {
      const matchNombre = !filtro.value || t.nombre.toLowerCase().includes(filtro.value.toLowerCase())
      const matchCategoria = !categoriaFiltro.value || t.categoria === categoriaFiltro.value
      return matchNombre && matchCategoria
    })
    .sort((a, b) => (a.orden || 0) - (b.orden || 0))
})

const getCategoriaColor = (cat) => {
  const colors = {
    personal: 'blue',
    academico: 'purple',
    laboral: 'green',
    capacitacion: 'orange',
    produccion: 'teal',
    reconocimiento: 'amber',
    general: 'grey'
  }
  return colors[cat] || 'grey'
}

const formatCategoria = (cat) => {
  const labels = {
    personal: 'Personal',
    academico: 'Académico',
    laboral: 'Laboral',
    capacitacion: 'Capacitación',
    produccion: 'Producción',
    reconocimiento: 'Reconocimiento',
    general: 'General'
  }
  return labels[cat] || cat
}

const cargarTipos = async () => {
  loading.value = true
  try {
    const { data } = await api.get('/admin/tipos-documento')
    tipos.value = data
  } catch (error) {
    console.error('Error cargando tipos:', error)
    $q.notify({ type: 'negative', message: 'Error al cargar tipos de documento' })
  } finally {
    loading.value = false
  }
}

const openCreateModal = () => {
  form.value = defaultForm()
  editando.value = false
  showModal.value = true
}

const openEditModal = (tipo) => {
  form.value = {
    ...tipo,
    campos: (tipo.campos || []).map((c, i) => ({
      ...c,
      id: i,
      opcionesText: c.opciones ? c.opciones.join(', ') : '',
      // Defaults para campos de archivo
      formatoArchivo: c.formatoArchivo || 'pdf',
      permiteDrive: c.permiteDrive !== false // Default true
    }))
  }
  editando.value = true
  showModal.value = true
}

const closeModal = () => {
  showModal.value = false
  form.value = defaultForm()
  if (props.modoCompacto) {
    emit('cancelar')
  }
}

const agregarCampo = () => {
  form.value.campos.push({
    id: Date.now(),
    nombre: '',
    label: '',
    tipo: 'text',
    obligatorio: false,
    opciones: [],
    opcionesText: '',
    // Campos para tipo archivo
    formatoArchivo: 'pdf',
    permiteDrive: true
  })
}

const eliminarCampo = (index) => {
  form.value.campos.splice(index, 1)
}

const generarNombreInterno = (campo) => {
  if (!campo.label) return
  campo.nombre = campo.label
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // Quitar tildes
    .replace(/[^a-z0-9]/g, '_')     // Solo letras, números y guiones bajos
    .replace(/_+/g, '_')             // Evitar múltiples guiones bajos
    .replace(/^_|_$/g, '')           // Quitar guiones al inicio o final
}

const actualizarOpciones = (campo) => {
  campo.opciones = campo.opcionesText.split(',').map(o => o.trim()).filter(o => o)
}

const guardar = async () => {
  const valid = await formRef.value?.validate()
  if (!valid) return

  guardando.value = true
  try {
    // Limpiar campos antes de enviar (remover id y opcionesText que son solo para UI)
    const camposLimpios = form.value.campos.length > 0
      ? form.value.campos.map(c => ({
          nombre: c.nombre,
          label: c.label,
          tipo: c.tipo,
          obligatorio: c.obligatorio,
          opciones: c.opciones,
          // Campos específicos para tipo archivo
          formatoArchivo: c.tipo === 'file' ? c.formatoArchivo : undefined,
          permiteDrive: c.tipo === 'file' ? c.permiteDrive : undefined
        }))
      : null

    const payload = {
      ...form.value,
      campos: camposLimpios
    }

    if (editando.value) {
      await api.put(`/admin/tipos-documento/${form.value.id}`, payload)
      $q.notify({ type: 'positive', message: 'Tipo actualizado correctamente' })
    } else {
      await api.post('/admin/tipos-documento', payload)
      $q.notify({ type: 'positive', message: 'Tipo creado correctamente' })
    }

    closeModal()
    if (props.modoCompacto) {
      emit('tipo-creado', payload)
    } else {
      await cargarTipos()
    }
  } catch (error) {
    console.error('Error guardando:', error)
    $q.notify({ type: 'negative', message: error.response?.data?.message || 'Error al guardar' })
  } finally {
    guardando.value = false
  }
}

const toggleActivo = async (tipo) => {
  try {
    await api.patch(`/admin/tipos-documento/${tipo.id}/toggle`)
  } catch {
    tipo.activo = !tipo.activo // Revertir
    $q.notify({ type: 'negative', message: 'Error al cambiar estado' })
  }
}

const confirmarEliminar = (tipo) => {
  $q.dialog({
    title: 'Eliminar Tipo de Documento',
    message: `¿Estás seguro de eliminar "${tipo.nombre}"? Esta acción no se puede deshacer.`,
    cancel: true,
    persistent: true
  }).onOk(async () => {
    try {
      await api.delete(`/admin/tipos-documento/${tipo.id}`)
      $q.notify({ type: 'positive', message: 'Tipo eliminado' })
      await cargarTipos()
    } catch (error) {
      $q.notify({ type: 'negative', message: error.response?.data?.message || 'No se pudo eliminar' })
    }
  })
}

onMounted(() => {
  if (props.modoCompacto) {
    openCreateModal()
  } else {
    cargarTipos()
  }
})
</script>

<style scoped>
.tipo-card {
  border-radius: 12px;
  transition: all 0.2s ease;
}
.tipo-card:hover {
  box-shadow: 0 4px 20px rgba(0,0,0,0.1);
}
.tipo-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
}
.campo-item {
  background: #f8f9fa;
  padding: 12px;
  border-radius: 8px;
  border: 1px solid #e9ecef;
}
.modal-card {
  width: 900px;
  max-width: 95vw;
}
</style>
