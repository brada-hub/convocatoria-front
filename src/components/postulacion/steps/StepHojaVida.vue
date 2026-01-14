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
          <li v-for="doc in store.documentosRequeridos" :key="doc.id" class="list-disc">
            {{ doc.nombre }}
            <span v-if="doc.obligatorio"
              class="text-red-700 font-bold text-xs bg-red-50 px-1 rounded ml-1">OBLIGATORIO</span>
          </li>
        </ul>
      </div>
    </q-banner>

    <!-- NOTA: Los documentos generales (CV, Carta, CI) ahora se suben en el paso "Datos Personales" -->

    <!-- SECCIÓN 1: Formación Académica -->
    <div v-if="isSectionRequired('formacion')" class="section-container q-mb-xxl">
      <div class="flex items-center gap-3 q-mb-lg pb-4 border-b border-gray-200">
        <div class="bg-blue-100 p-2 rounded-lg text-primary"><q-icon name="school" size="24px" /></div>
        <div>
          <div class="text-lg font-bold text-gray-800">1. Formación Académica</div>
          <div class="text-xs text-gray-500">Registre sus títulos (Licenciatura, Maestría, etc).</div>
        </div>
      </div>

      <div v-for="(item, index) in store.formaciones" :key="'form-' + index"
        class="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6 relative hover:shadow-md transition-shadow">
        <div class="absolute -right-3 -top-3">
          <q-btn round color="red-1" text-color="negative" icon="delete" unelevated size="sm"
            @click="store.eliminarRegistro('formaciones', index)"><q-tooltip>Eliminar</q-tooltip></q-btn>
        </div>
        <div class="row q-col-gutter-lg">
          <div class="col-12 col-md-6">
            <label class="block text-sm font-bold text-gray-700 mb-2">Copia de Título (PDF) <span
                class="text-red-500">*</span></label>
            <div
              class="border-2 border-dashed border-gray-300 rounded-lg p-4 flex flex-col items-center justify-center bg-gray-50 hover:bg-blue-50 transition-colors cursor-pointer relative"
              @click.self="triggerFilePicker('form', index)">
              <div class="absolute right-2 top-2 z-10">
                <GoogleDriveUploadBtn @file-selected="(f) => item.archivo = f" />
              </div>
              <q-icon name="cloud_upload" size="30px" color="primary" class="q-mb-sm" />
              <div class="text-sm text-primary font-medium">{{ item.archivo ? 'Archivo Cargado' : 'Subir Título' }}
              </div>
              <div class="text-xs text-gray-400 mt-1 truncate">{{ item.archivo ? item.archivo.name : 'PDF - Max 2MB' }}
              </div>
              <q-file :ref="el => setFileRef(el, 'form', index)" v-model="item.archivo" class="hidden" accept=".pdf"
                max-file-size="2097152" @rejected="onRejected" />
            </div>
          </div>
          <div class="col-12 col-md-6">
            <div class="row q-col-gutter-y-md">
              <div class="col-12">
                <label class="block text-sm font-bold text-gray-700 mb-1">Nivel Académico <span
                    class="text-red-500">*</span></label>
                <q-select v-model="item.nivel" :options="nivelesAcademicos" emit-value map-options outlined dense
                  bg-color="white" :rules="[val => !!val || 'Requerido']" />
              </div>
              <div class="col-12">
                <label class="block text-sm font-bold text-gray-700 mb-1">Título / Profesión <span
                    class="text-red-500">*</span></label>
                <q-input v-model="item.titulo_profesion" outlined dense bg-color="white"
                  :rules="[val => !!val || 'Requerido']" />
              </div>
              <div class="col-12">
                <label class="block text-sm font-bold text-gray-700 mb-1">Universidad <span
                    class="text-red-500">*</span></label>
                <q-input v-model="item.universidad" outlined dense bg-color="white"
                  :rules="[val => !!val || 'Requerido']" />
              </div>
              <div class="col-12">
                <label class="block text-sm font-bold text-gray-700 mb-1">Año de Emisión <span
                    class="text-red-500">*</span></label>
                <q-input v-model="item.anio_emision" outlined dense type="number" bg-color="white"
                  :rules="[val => !!val || 'Requerido']" />
              </div>
            </div>
          </div>
        </div>
      </div>
      <q-btn outline color="primary" class="full-width q-py-md border-dashed rounded-lg" no-caps
        @click="agregarFormacion">
        <div class="flex items-center gap-2"><q-icon name="add_circle" /><span class="font-bold">Agregar Título</span>
        </div>
      </q-btn>
    </div>

    <!-- SECCIÓN 2: Experiencia Profesional -->
    <div v-if="isSectionRequired('experiencia')" class="section-container q-mb-xxl">
      <div class="flex items-center gap-3 q-mb-lg pb-4 border-b border-gray-200">
        <div class="bg-blue-100 p-2 rounded-lg text-primary"><q-icon name="work" size="24px" /></div>
        <div>
          <div class="text-lg font-bold text-gray-800">2. Experiencia Profesional</div>
          <div class="text-xs text-gray-500">Agregue sus experiencias laborales.</div>
        </div>
      </div>
      <div v-for="(item, index) in store.experiencias" :key="'exp-' + index"
        class="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6 relative hover:shadow-md transition-shadow">
        <div class="absolute -right-3 -top-3">
          <q-btn round color="red-1" text-color="negative" icon="delete" unelevated size="sm"
            @click="store.eliminarRegistro('experiencias', index)"><q-tooltip>Eliminar</q-tooltip></q-btn>
        </div>
        <div class="row q-col-gutter-lg">
          <div class="col-12 col-md-5">
            <label class="block text-sm font-bold text-gray-700 mb-2">Certificado (PDF) <span
                class="text-red-500">*</span></label>
            <div
              class="border-2 border-dashed border-gray-300 rounded-lg p-4 flex flex-col items-center justify-center bg-gray-50 hover:bg-blue-50 transition-colors cursor-pointer relative"
              @click.self="triggerFilePicker('exp', index)">
              <div class="absolute right-2 top-2 z-10">
                <GoogleDriveUploadBtn @file-selected="(f) => item.archivo = f" />
              </div>
              <q-icon name="cloud_upload" size="30px" color="primary" class="q-mb-sm" />
              <div class="text-sm text-primary font-medium">{{ item.archivo ? 'Archivo Cargado' : 'Subir Certificado' }}
              </div>
              <div class="text-xs text-gray-400 mt-1 truncate">{{ item.archivo ? item.archivo.name : 'PDF - Max 2MB' }}
              </div>
              <q-file :ref="el => setFileRef(el, 'exp', index)" v-model="item.archivo" class="hidden" accept=".pdf"
                max-file-size="2097152" @rejected="onRejected" />
            </div>
          </div>
          <div class="col-12 col-md-7">
            <div class="row q-col-gutter-y-md">
              <div class="col-12"><label class="block text-sm font-bold text-gray-700 mb-1">Cargo</label><q-input
                  v-model="item.cargo_desempenado" outlined dense bg-color="white"
                  :rules="[val => !!val || 'Requerido']" />
              </div>
              <div class="col-12"><label class="block text-sm font-bold text-gray-700 mb-1">Empresa</label><q-input
                  v-model="item.empresa_institucion" outlined dense bg-color="white"
                  :rules="[val => !!val || 'Requerido']" /></div>
              <div class="row q-col-gutter-md col-12">
                <div class="col-6"><label class="block text-sm font-bold text-gray-700 mb-1">Año Inicio</label><q-input
                    v-model="item.anio_inicio" type="number" outlined dense bg-color="white"
                    :rules="[val => !!val || 'Requerido']" /></div>
                <div class="col-6"><label class="block text-sm font-bold text-gray-700 mb-1">Año Fin</label><q-input
                    v-model="item.anio_fin" type="number" outlined dense bg-color="white" /></div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <q-btn outline color="primary" class="full-width q-py-md border-dashed rounded-lg" no-caps
        @click="agregarExperiencia">
        <div class="flex items-center gap-2"><q-icon name="add_circle" /><span class="font-bold">Agregar
            Experiencia</span>
        </div>
      </q-btn>
    </div>

    <!-- SECCIÓN 3: Capacitaciones -->
    <div v-if="isSectionRequired('capacitacion')" class="section-container q-mb-xxl">
      <div class="flex items-center gap-3 q-mb-lg pb-4 border-b border-gray-200">
        <div class="bg-blue-100 p-2 rounded-lg text-primary"><q-icon name="menu_book" size="24px" /></div>
        <div>
          <div class="text-lg font-bold text-gray-800">3. Cursos y Capacitaciones</div>
          <div class="text-xs text-gray-500">Cursos, talleres, seminarios.</div>
        </div>
      </div>
      <div v-for="(item, index) in store.capacitaciones" :key="'cap-' + index"
        class="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6 relative hover:shadow-md transition-shadow">
        <div class="absolute -right-3 -top-3">
          <q-btn round color="red-1" text-color="negative" icon="delete" unelevated size="sm"
            @click="store.eliminarRegistro('capacitaciones', index)"><q-tooltip>Eliminar</q-tooltip></q-btn>
        </div>
        <div class="row q-col-gutter-lg">
          <div class="col-12 col-md-5">
            <label class="block text-sm font-bold text-gray-700 mb-2">Certificado (PDF) <span
                class="text-red-500">*</span></label>
            <div
              class="border-2 border-dashed border-gray-300 rounded-lg p-4 flex flex-col items-center justify-center bg-gray-50 hover:bg-blue-50 transition-colors cursor-pointer relative"
              @click.self="triggerFilePicker('cap', index)">
              <div class="absolute right-2 top-2 z-10">
                <GoogleDriveUploadBtn @file-selected="(f) => item.archivo = f" />
              </div>
              <q-icon name="cloud_upload" size="30px" color="primary" class="q-mb-sm" />
              <div class="text-sm text-primary font-medium">{{ item.archivo ? 'Archivo Cargado' : 'Subir Certificado' }}
              </div>
              <div class="text-xs text-gray-400 mt-1 truncate">{{ item.archivo ? item.archivo.name : 'PDF - Max 2MB' }}
              </div>
              <q-file :ref="el => setFileRef(el, 'cap', index)" v-model="item.archivo" class="hidden" accept=".pdf"
                max-file-size="2097152" @rejected="onRejected" />
            </div>
          </div>
          <div class="col-12 col-md-7">
            <div class="row q-col-gutter-y-md">
              <div class="col-12"><label class="block text-sm font-bold text-gray-700 mb-1">Nombre Curso</label><q-input
                  v-model="item.nombre_curso" outlined dense bg-color="white" :rules="[val => !!val || 'Requerido']" />
              </div>
              <div class="col-12"><label class="block text-sm font-bold text-gray-700 mb-1">Institución</label><q-input
                  v-model="item.institucion_emisora" outlined dense bg-color="white"
                  :rules="[val => !!val || 'Requerido']" /></div>
              <div class="row q-col-gutter-md col-12">
                <div class="col-6"><label class="block text-sm font-bold text-gray-700 mb-1">Año</label><q-input
                    v-model="item.anio" type="number" outlined dense bg-color="white"
                    :rules="[val => !!val || 'Requerido']" /></div>
                <div class="col-6"><label class="block text-sm font-bold text-gray-700 mb-1">Horas</label><q-input
                    v-model="item.carga_horaria" type="number" outlined dense bg-color="white" /></div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <q-btn outline color="primary" class="full-width q-py-md border-dashed rounded-lg" no-caps
        @click="agregarCapacitacion">
        <div class="flex items-center gap-2"><q-icon name="add_circle" /><span class="font-bold">Agregar Curso</span>
        </div>
      </q-btn>
    </div>

    <!-- SECCIÓN 4: Producción Intelectual -->
    <div v-if="isSectionRequired('produccion')" class="section-container q-mb-xxl">
      <div class="flex items-center gap-3 q-mb-lg pb-4 border-b border-gray-200">
        <div class="bg-blue-100 p-2 rounded-lg text-primary"><q-icon name="auto_stories" size="24px" /></div>
        <div>
          <div class="text-lg font-bold text-gray-800">4. Producción Intelectual</div>
          <div class="text-xs text-gray-500">Libros, artículos, investigaciones.</div>
        </div>
      </div>
      <div v-for="(item, index) in store.producciones" :key="'prod-' + index"
        class="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6 relative hover:shadow-md transition-shadow">
        <div class="absolute -right-3 -top-3">
          <q-btn round color="red-1" text-color="negative" icon="delete" unelevated size="sm"
            @click="store.eliminarRegistro('producciones', index)"><q-tooltip>Eliminar</q-tooltip></q-btn>
        </div>
        <div class="row q-col-gutter-lg">
          <div class="col-12 col-md-5">
            <label class="block text-sm font-bold text-gray-700 mb-2">Respaldo (PDF) <span
                class="text-red-500">*</span></label>
            <div
              class="border-2 border-dashed border-gray-300 rounded-lg p-4 flex flex-col items-center justify-center bg-gray-50 hover:bg-blue-50 transition-colors cursor-pointer relative"
              @click.self="triggerFilePicker('prod', index)">
              <div class="absolute right-2 top-2 z-10">
                <GoogleDriveUploadBtn @file-selected="(f) => item.archivo = f" />
              </div>
              <q-icon name="cloud_upload" size="30px" color="primary" class="q-mb-sm" />
              <div class="text-sm text-primary font-medium">{{ item.archivo ? 'Archivo Cargado' : 'Subir Documento' }}
              </div>
              <div class="text-xs text-gray-400 mt-1 truncate">{{ item.archivo ? item.archivo.name : 'PDF - Max 2MB' }}
              </div>
              <q-file :ref="el => setFileRef(el, 'prod', index)" v-model="item.archivo" class="hidden" accept=".pdf"
                max-file-size="2097152" @rejected="onRejected" />
            </div>
          </div>
          <div class="col-12 col-md-7">
            <div class="row q-col-gutter-y-md">
              <div class="col-12"><label class="block text-sm font-bold text-gray-700 mb-1">Título de
                  Obra</label><q-input v-model="item.titulo" outlined dense bg-color="white"
                  :rules="[val => !!val || 'Requerido']" /></div>
              <div class="col-12"><label class="block text-sm font-bold text-gray-700 mb-1">Tipo</label><q-select
                  v-model="item.tipo" :options="tiposProduccion" outlined dense bg-color="white" /></div>
              <div class="col-12"><label class="block text-sm font-bold text-gray-700 mb-1">Año</label><q-input
                  v-model="item.anio" type="number" outlined dense bg-color="white" /></div>
            </div>
          </div>
        </div>
      </div>
      <q-btn outline color="primary" class="full-width q-py-md border-dashed rounded-lg" no-caps
        @click="agregarProduccion">
        <div class="flex items-center gap-2"><q-icon name="add_circle" /><span class="font-bold">Agregar
            Producción</span>
        </div>
      </q-btn>
    </div>

    <!-- SECCIÓN 5: Reconocimientos -->
    <div v-if="isSectionRequired('reconocimiento')" class="section-container q-mb-xxl">
      <div class="flex items-center gap-3 q-mb-lg pb-4 border-b border-gray-200">
        <div class="bg-blue-100 p-2 rounded-lg text-primary"><q-icon name="emoji_events" size="24px" /></div>
        <div>
          <div class="text-lg font-bold text-gray-800">5. Reconocimientos</div>
          <div class="text-xs text-gray-500">Premios y distinciones.</div>
        </div>
      </div>
      <div v-for="(item, index) in store.reconocimientos" :key="'rec-' + index"
        class="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6 relative hover:shadow-md transition-shadow">
        <div class="absolute -right-3 -top-3">
          <q-btn round color="red-1" text-color="negative" icon="delete" unelevated size="sm"
            @click="store.eliminarRegistro('reconocimientos', index)"><q-tooltip>Eliminar</q-tooltip></q-btn>
        </div>
        <div class="row q-col-gutter-lg">
          <div class="col-12 col-md-5">
            <label class="block text-sm font-bold text-gray-700 mb-2">Respaldo (PDF) <span
                class="text-red-500">*</span></label>
            <div
              class="border-2 border-dashed border-gray-300 rounded-lg p-4 flex flex-col items-center justify-center bg-gray-50 hover:bg-blue-50 transition-colors cursor-pointer relative"
              @click.self="triggerFilePicker('rec', index)">
              <div class="absolute right-2 top-2 z-10">
                <GoogleDriveUploadBtn @file-selected="(f) => item.archivo = f" />
              </div>
              <q-icon name="cloud_upload" size="30px" color="primary" class="q-mb-sm" />
              <div class="text-sm text-primary font-medium">{{ item.archivo ? 'Archivo Cargado' : 'Subir Documento' }}
              </div>
              <div class="text-xs text-gray-400 mt-1 truncate">{{ item.archivo ? item.archivo.name : 'PDF - Max 2MB' }}
              </div>
              <q-file :ref="el => setFileRef(el, 'rec', index)" v-model="item.archivo" class="hidden" accept=".pdf"
                max-file-size="2097152" @rejected="onRejected" />
            </div>
          </div>
          <div class="col-12 col-md-7">
            <div class="row q-col-gutter-y-md">
              <div class="col-12"><label
                  class="block text-sm font-bold text-gray-700 mb-1">Motivo/Título</label><q-input v-model="item.titulo"
                  outlined dense bg-color="white" :rules="[val => !!val || 'Requerido']" /></div>
              <div class="col-12"><label class="block text-sm font-bold text-gray-700 mb-1">Entidad</label><q-input
                  v-model="item.otorgado_por" outlined dense bg-color="white" /></div>
              <div class="col-12"><label class="block text-sm font-bold text-gray-700 mb-1">Año</label><q-input
                  v-model="item.anio" type="number" outlined dense bg-color="white" /></div>
            </div>
          </div>
        </div>
      </div>
      <q-btn outline color="primary" class="full-width q-py-md border-dashed rounded-lg" no-caps
        @click="agregarReconocimiento">
        <div class="flex items-center gap-2"><q-icon name="add_circle" /><span class="font-bold">Agregar
            Reconocimiento</span></div>
      </q-btn>
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
import { ref, computed, onMounted } from 'vue'
import { usePostulacionStore } from 'stores/postulacion-store'
import { useQuasar } from 'quasar'
import { api } from 'boot/axios'
import GoogleDriveUploadBtn from 'src/components/common/GoogleDriveUploadBtn.vue'

const store = usePostulacionStore()
const $q = useQuasar()
const form = ref(null)
const emit = defineEmits(['next', 'prev'])

// ---------- HELPER PARA SECCIÓN REQUERIDA (Mapping) ----------
const sectionKeywords = {
  'formacion': ['título', 'titulo', 'diploma', 'académico', 'academico', 'grado', 'licenciatura', 'maestría', 'maestria', 'doctorado'],
  'experiencia': ['experiencia', 'trabajo', 'laboral'],
  'capacitacion': ['curso', 'taller', 'seminario', 'capacitación', 'capacitacion'],
  'produccion': ['producción', 'produccion', 'intelectual', 'libro', 'artículo', 'articulo'],
  'reconocimiento': ['reconocimiento', 'premio', 'distinción', 'distincion']
}

const isSectionRequired = (sectionKey) => {
  // Mantenemos la lógica de mostrar secciones si hay palabras clave,
  // pero ya no quitamos los documentos de la lista de arriba.
  return store.documentosRequeridos.some(doc =>
    sectionKeywords[sectionKey].some(keyword =>
      doc.nombre.toLowerCase().includes(keyword.toLowerCase())
    )
  )
}

// Documentos que NO calzan en ninguna sección (Generic Grid)
// Documentos que NO calzan en ninguna sección (Generic Grid) -> AHORA SON TODOS
const unmappedDocuments = computed(() => {
  // Retornamos TODOS los documentos para que aparezcan como cajitas de subida obligatoria/general.
  // Las secciones de abajo (Formación, Experiencia) servirán para detallar la información.
  return store.documentosRequeridos
})

// ---------- HELPERS PARA REGISTROS (Restaurados) ----------
const currentYear = new Date().getFullYear()
const agregarFormacion = () => store.agregarRegistro('formaciones', { nivel: '', titulo_profesion: '', universidad: '', anio_emision: currentYear, archivo: null })
const agregarExperiencia = () => store.agregarRegistro('experiencias', { cargo_desempenado: '', empresa_institucion: '', anio_inicio: '', anio_fin: '', archivo: null })
const agregarCapacitacion = () => store.agregarRegistro('capacitaciones', { nombre_curso: '', institucion_emisora: '', anio: currentYear, carga_horaria: '', archivo: null })
const agregarProduccion = () => store.agregarRegistro('producciones', { tipo: 'Libro', titulo: '', anio: currentYear, archivo: null })
const agregarReconocimiento = () => store.agregarRegistro('reconocimientos', { tipo_reconocimiento: '', titulo: '', otorgado_por: '', anio: currentYear, archivo: null })

// Dynamic Catalogs
const nivelesAcademicos = ref([])

// Auto-populate 1 empty item ONLY if section is required and empty
onMounted(async () => {
  try {
    const { data } = await api.get('/catalogos/niveles-academicos')
    nivelesAcademicos.value = data
  } catch (error) {
    console.error('Error al cargar catálogos', error)
  }

  if (isSectionRequired('formacion') && store.formaciones.length === 0) agregarFormacion()
  if (isSectionRequired('experiencia') && store.experiencias.length === 0) agregarExperiencia()
  if (isSectionRequired('capacitacion') && store.capacitaciones.length === 0) agregarCapacitacion()
  if (isSectionRequired('produccion') && store.producciones.length === 0) agregarProduccion()
  if (isSectionRequired('reconocimiento') && store.reconocimientos.length === 0) agregarReconocimiento()
})

const validateAndNext = async () => {
  let valid = true

  // 1. Validar documentos genericos (Solo si existen)
  const unmapped = unmappedDocuments.value
  const missingUnmapped = unmapped.filter(d => d.obligatorio && !store.documentos[d.id])

  if (missingUnmapped.length > 0) {
    $q.notify({ type: 'warning', message: `Falta subir: ${missingUnmapped.map(d => d.nombre).join(', ')}` })
    return
  }

  // 2. Validar Secciones Requeridas
  // Formación
  if (isSectionRequired('formacion') && store.formaciones.length === 0) {
    // Verificar si el documento base (ej. Diploma) es obligatorio. Si es optional, maybe 0 formations is ok?
    // Asumiremos que si la sección es visible por un documento obligatorio, se requiere al menos 1.
    // Pero si el documento es Opcional, permite 0?
    // Usaremos la lógica de "Si es Obligatorio en Requisitos -> Requiere >0 items".
    const requiredDocs = store.documentosRequeridos.filter(d => d.obligatorio)
    const formReq = requiredDocs.some(d => sectionKeywords['formacion'].some(k => d.nombre.toLowerCase().includes(k)))
    if (formReq) {
      $q.notify({ type: 'warning', message: 'Debe agregar al menos una Formación Académica.' })
      return
    }
  }

  // Experiencia
  if (isSectionRequired('experiencia') && store.experiencias.length === 0) {
    const requiredDocs = store.documentosRequeridos.filter(d => d.obligatorio)
    const expReq = requiredDocs.some(d => sectionKeywords['experiencia'].some(k => d.nombre.toLowerCase().includes(k)))
    if (expReq) {
      $q.notify({ type: 'warning', message: 'Debe agregar al menos una Experiencia Laboral.' })
      return
    }
  }

  // Validar Formulario Interno
  if (form.value) {
    valid = await form.value.validate()
    if (!valid) {
      $q.notify({ type: 'negative', message: 'Complete los campos obligatorios en rojo.' })
      return
    }
  }

  emit('next')
}

// Helpers File Upload Secciones
const fileInputRefs = ref({})
const setFileRef = (el, type, index) => { if (el) fileInputRefs.value[`${type}_${index}`] = el }
const triggerFilePicker = (type, index) => { const ref = fileInputRefs.value[`${type}_${index}`]; if (ref) ref.pickFiles() }
const onRejected = () => $q.notify({ type: 'negative', message: 'Archivo inválido o muy grande.' })

// Helpers Docs Genericos - REMOVIDO (Ahora en StepDatosPersonales)

// Datos estáticos

const tiposProduccion = ['Libro', 'Artículo', 'Investigación']
</script>

<style scoped>
.scrollable-step::-webkit-scrollbar {
  width: 8px;
}

.scrollable-step::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 4px;
}
</style>
