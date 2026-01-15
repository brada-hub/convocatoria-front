<template>
  <q-form ref="form" class="step-content animate-fadeInUp scrollable-step bg-grey-1 q-pa-lg">

    <!-- BANNER: Información de la Convocatoria Seleccionada -->
    <div v-if="store.convocatoriaSeleccionada" class="bg-primary/5 border border-primary/20 rounded-xl p-4 mb-6">
      <div class="flex items-start gap-3">
        <div class="w-10 h-10 rounded-lg bg-primary flex items-center justify-center text-white shrink-0">
          <q-icon name="campaign" size="20px" />
        </div>
        <div class="flex-1">
          <div class="font-bold text-gray-800">{{ store.convocatoriaSeleccionada.titulo }}</div>
          <p class="text-xs text-gray-500 mt-1 line-clamp-2" v-if="store.convocatoriaSeleccionada.descripcion">
            {{ store.convocatoriaSeleccionada.descripcion }}
          </p>
        </div>
      </div>
    </div>

    <!-- ALERTA IMPORTANTE -->
    <q-banner class="bg-blue-1 text-primary q-mb-lg rounded-lg">
      <template v-slot:avatar><q-icon name="info" color="primary" /></template>
      <div class="text-weight-medium">Importante:</div>
      <ul class="q-my-xs q-pl-md">
        <li>Todos los documentos deben estar en formato <strong>PDF</strong></li>
        <li>El tamaño máximo por archivo es de <strong>2 MB</strong></li>
      </ul>
    </q-banner>

    <!-- BANNER DE REQUISITOS -->
    <q-banner class="bg-orange-100 text-orange-900 q-mb-xl rounded-xl border-2 border-orange-300">
      <template v-slot:avatar><q-icon name="warning" color="orange" size="28px" /></template>
      <div class="text-weight-bold text-lg">Requisitos de la Convocatoria</div>
      <div class="text-sm mt-1">
        Esta convocatoria requiere la presentación de:
        <ul class="q-pl-md q-mt-xs space-y-1">
          <li v-for="doc in store.documentosRequeridos.filter(d => d.categoria !== 'personal')" :key="doc.id" class="list-disc">
            {{ doc.nombre }}
            <span v-if="doc.obligatorio"
              class="text-red-700 font-bold text-xs bg-red-50 px-1 rounded ml-1">OBLIGATORIO</span>
          </li>
        </ul>
      </div>
    </q-banner>

    <!-- NOTA: Los documentos generales (CV, Carta, CI) ahora se suben en el paso "Datos Personales" -->

      <!-- Cuerpo del Formulario -->
      <!-- Lista de Documentos Requeridos ordenados por su posición (II, III, IV...) -->
      <div v-for="req in sortedRequirements" :key="req.id" class="q-mb-xl p-8 bg-white shadow-xl rounded-3xl border border-gray-100 relative">

        <!-- Cabecera de la Sección (II. FORMACIÓN ACADÉMICA, etc.) -->
        <div class="flex items-start justify-between mb-4">
          <div class="flex items-center gap-5">
            <div class="bg-primary p-4 rounded-2xl text-white shadow-lg transform hover:scale-110 transition-transform">
              <q-icon :name="req.icono || 'description'" size="32px" />
            </div>
            <div>
              <div class="text-h5 font-bold text-grey-9 flex items-center gap-3">
                {{ req.nombre }}
                <q-badge v-if="req.obligatorio" color="red" label="REQUERIDO" class="text-weight-bold px-3 py-1" />
              </div>
              <div v-if="req.descripcion" class="text-subtitle1 text-grey-6 font-medium mt-1">
                {{ req.descripcion }}
              </div>
            </div>
          </div>
        </div>

        <q-separator class="q-my-lg opacity-30" />

        <!-- Lista de entradas para este tipo de documento -->
        <div v-for="(item, index) in store.documentos[req.id]" :key="req.id + '-' + index"
          class="bg-gray-50/50 rounded-3xl border border-gray-200 p-8 mb-10 relative hover:bg-white hover:shadow-2xl hover:border-primary/20 transition-all duration-500 group/item">

          <!-- Botón Eliminar -->
          <div v-if="req.permite_multiples || store.documentos[req.id].length > 1" class="absolute -right-4 -top-4 z-20">
            <q-btn round color="negative" icon="delete" unelevated size="md" @click="store.eliminarDocumentoDinamico(req.id, index)" class="shadow-xl">
              <q-tooltip anchor="top middle" self="bottom middle">Eliminar este registro</q-tooltip>
            </q-btn>
          </div>

          <div class="row q-col-gutter-xl">
            <!-- Columna Archivo -->
            <div class="col-12 col-md-4">
              <label class="block text-sm font-bold text-grey-8 mb-4 uppercase tracking-widest flex items-center gap-2">
                <q-icon name="picture_as_pdf" color="primary" />
                Archivo de Respaldo (PDF) <span class="text-red-500">*</span>
              </label>
              <div
                class="border-3 border-dashed border-gray-300 rounded-3xl p-8 flex flex-col items-center justify-center bg-white hover:border-primary hover:bg-primary/5 transition-all cursor-pointer relative h-56 group/file overflow-hidden"
                v-ripple
                @click="triggerFilePicker(req.id, index)">

                <div class="absolute right-4 top-4 z-10 opacity-0 group-hover/file:opacity-100 transition-opacity" @click.stop>
                  <GoogleDriveUploadBtn @file-selected="(f) => store.setDocumento(req.id, index, f)" />
                </div>

                <div class="text-center transform group-hover/file:scale-110 transition-transform duration-500 pointer-events-none">
                  <q-icon name="cloud_upload" size="64px" :color="item.archivo ? 'positive' : 'grey-4'" class="q-mb-md" />
                  <div class="text-subtitle1 font-black" :class="item.archivo ? 'text-positive' : 'text-primary'">
                    {{ item.archivo ? '¡ARCHIVO CARGADO!' : 'SUBIR DOCUMENTO' }}
                  </div>
                  <div class="text-caption text-grey-5 mt-2 px-6 truncate max-w-xs font-medium">
                    {{ item.archivo ? (item.archivo.name || 'PDF SELECCIONADO') : 'Formato PDF · Máx 2MB' }}
                  </div>
                </div>

                <q-file :ref="el => setFileRef(el, req.id, index)" :model-value="item.archivo"
                  @update:model-value="(f) => store.setDocumento(req.id, index, f)" class="hidden" accept=".pdf"
                  max-file-size="2097152" @rejected="onRejected" />
              </div>
            </div>

            <!-- Columna Campos Dinámicos -->
            <div class="col-12 col-md-8">
              <div class="row q-col-gutter-y-lg q-col-gutter-x-xl">
                 <div v-for="campo in req.campos" :key="campo.nombre" class="col-12" :class="campo.tipo === 'textarea' ? 'col-md-12' : 'col-md-6'">
                   <label class="block text-xs font-black text-grey-7 mb-2 uppercase tracking-tighter">
                     {{ campo.label }} <span v-if="campo.obligatorio" class="text-red-500">*</span>
                   </label>

                   <!-- Input Texto -->
                   <q-input v-if="campo.tipo === 'text' || campo.tipo === 'textarea'"
                     v-model="item.metadatos[campo.nombre]" :type="campo.tipo === 'textarea' ? 'textarea' : 'text'"
                     outlined dense bg-color="white" :placeholder="'Ingresar ' + campo.label.toLowerCase()"
                     :rules="campo.obligatorio ? [val => !!val || 'Requerido'] : []" hide-bottom-space class="custom-input h-auto rounded-xl" />

                   <!-- Input Número -->
                   <q-input v-else-if="campo.tipo === 'number' || campo.tipo === 'year'"
                     v-model.number="item.metadatos[campo.nombre]" type="number" outlined dense bg-color="white"
                     :placeholder="campo.tipo === 'year' ? 'Ej: 2024' : '0'"
                     :rules="campo.obligatorio ? [val => !!val || 'Requerido'] : []" hide-bottom-space class="custom-input" />

                   <!-- Selector -->
                   <q-select v-else-if="campo.tipo === 'select'" v-model="item.metadatos[campo.nombre]"
                     :options="campo.opciones" outlined dense bg-color="white" placeholder="Seleccionar..."
                     emit-value map-options
                     :rules="campo.obligatorio ? [val => !!val || 'Requerido'] : []" hide-bottom-space class="custom-input" />

                   <!-- Fecha -->
                   <q-input v-else-if="campo.tipo === 'date'" v-model="item.metadatos[campo.nombre]" type="date"
                     outlined dense bg-color="white" :rules="campo.obligatorio ? [val => !!val || 'Requerido'] : []"
                     hide-bottom-space class="custom-input" />
                 </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Botón Agregar Otro (Al final de la sección) -->
        <div v-if="req.permite_multiples && store.documentos[req.id]?.length > 0" class="flex justify-center mt-6">
           <q-btn unelevated color="primary" icon="add_circle" label="Agregar otro registro" no-caps
             @click="store.agregarDocumentoDinamico(req.id)" class="px-10 py-3 rounded-2xl shadow-2xl hover:scale-110 transition-all font-bold" />
        </div>

        <!-- Botón para el primer registro si no hay nada -->
        <div v-if="!store.documentos[req.id] || store.documentos[req.id].length === 0" class="text-center p-16 bg-gray-50/50 rounded-3xl border-3 border-dashed border-gray-200">
            <q-icon name="post_add" size="80px" color="grey-3" class="q-mb-md" />
            <div class="text-h6 text-grey-5 q-mb-xl font-bold">No se han registrado datos en esta sección</div>
           <q-btn unelevated color="primary" icon="add" :label="'Comenzar a llenar ' + req.nombre" no-caps size="lg"
             @click="store.agregarDocumentoDinamico(req.id)" class="px-8 py-3 rounded-2xl shadow-xl" />
        </div>
      </div>


    <!-- Footer -->
    <div class="flex justify-between mt-12 pt-6 border-t border-gray-200">
      <q-btn flat color="primary" icon="arrow_back" label="Atrás" @click="emit('prev')" no-caps />
      <q-btn unelevated color="primary" label="Ir a Confirmación" icon-right="check_circle" @click="validateAndNext"
        no-caps class="px-6 py-2" />
    </div>

  </q-form>
</template>

<script setup>
import { ref, computed, onMounted, reactive } from 'vue'
import { usePostulacionStore } from 'stores/postulacion-store'
import { useQuasar } from 'quasar'
import GoogleDriveUploadBtn from 'src/components/common/GoogleDriveUploadBtn.vue'

const store = usePostulacionStore()
const $q = useQuasar()
const form = ref(null)
const emit = defineEmits(['next', 'prev'])

// Requerimientos ordenados (excluyendo 'personal' que ya está en el Paso 1)
const sortedRequirements = computed(() => {
  return [...store.documentosRequeridos]
    .filter(req => req.categoria !== 'personal')
    .sort((a, b) => (a.orden || 0) - (b.orden || 0))
})

// Mapeo de Metadatos de Categoría (Ya no se usa en el diseño plano, pero se mantiene referencia por si acaso)
// Eliminado para limpiar lint errors


// Referencias dinámicas para los inputs de archivo
const fileRefs = reactive({})

const setFileRef = (el, typeId, index) => {
  if (el) {
    fileRefs[`${typeId}-${index}`] = el
  }
}

const triggerFilePicker = (typeId, index) => {
  const ref = fileRefs[`${typeId}-${index}`]
  if (ref) {
    if (typeof ref.pickFiles === 'function') {
      ref.pickFiles()
    } else {
      ref.$el?.click() || ref.click?.()
    }
  }
}

const onRejected = () => {
  $q.notify({
    type: 'negative',
    message: 'Archivo inválido o excede el tamaño máximo (2MB)'
  })
}

const validateAndNext = async () => {
  let valid = true

  // 1. Validar q-form (reglas de inputs)
  if (form.value) {
    valid = await form.value.validate()
    if (!valid) {
      $q.notify({ type: 'negative', message: 'Por favor complete todos los campos obligatorios.' })
      return
    }
  }

  // 2. Validar que cada documento requerido obligatorio tenga al menos un archivo
  const obligatoriosFaltantes = store.documentosRequeridos
    .filter(req => req.categoria !== 'personal' && req.obligatorio)
    .filter(req => {
       const docs = store.documentos[req.id] || []
       return docs.length === 0 || docs.every(d => !d.archivo)
    })

  if (obligatoriosFaltantes.length > 0) {
    $q.notify({
      type: 'warning',
      message: `Faltan documentos obligatorios: ${obligatoriosFaltantes.map(d => d.nombre).join(', ')}`
    })
    return
  }

  emit('next')
}

// Inicializar un registro vacío para requerimientos obligatorios
onMounted(() => {
  store.documentosRequeridos.forEach(req => {
    if (req.categoria !== 'personal' && (!store.documentos[req.id] || store.documentos[req.id].length === 0)) {
       if (req.obligatorio) {
         store.agregarDocumentoDinamico(req.id)
       }
    }
  })
})
</script>

<style scoped>
.custom-input :deep(.q-field__control) {
  border-radius: 8px;
  background-color: #f8fafc !important;
  transition: all 0.3s ease;
}

.custom-input :deep(.q-field__control:hover) {
  background-color: #ffffff !important;
}

.section-container {
  background: white;
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);
}

.scrollable-step::-webkit-scrollbar {
  width: 8px;
}

.scrollable-step::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 4px;
}

.scrollable-step::-webkit-scrollbar-track {
  background: #f1f5f9;
}
</style>
