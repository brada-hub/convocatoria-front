<template>
  <q-form ref="form" class="step-content animate-fadeInUp scrollable-step bg-grey-1 q-pa-lg">

    <div class="text-center q-mb-xl">
      <h2 class="text-h5 text-weight-bold text-gray-800 q-my-none">Documentación de Respaldo</h2>
      <p class="text-gray-500 q-mt-sm">Adjunte los documentos que respalden su formación y experiencia
        profesional.</p>
    </div>

    <!-- ALERTA IMPORTANTE SOBRE TAMAÑO DE ARCHIVOS -->
    <q-banner class="bg-blue-1 text-primary q-mb-lg rounded-lg">
      <template v-slot:avatar>
        <q-icon name="info" color="primary" />
      </template>
      <div class="text-weight-medium">Importante:</div>
      <ul class="q-my-xs q-pl-md">
        <li>Todos los documentos deben estar en formato <strong>PDF</strong></li>
        <li>El tamaño máximo por archivo es de <strong>2 MB</strong></li>
        <li>Suba únicamente los documentos originales, <strong>sin respaldos</strong></li>
      </ul>
    </q-banner>

    <!-- SECCIÓN 0: Documentos Requeridos (Dinámico) -->
    <div v-if="store.documentosRequeridos.length > 0" class="section-container q-mb-xxl">
      <div class="flex items-center gap-3 q-mb-lg pb-4 border-b border-gray-200">
        <div class="bg-orange-100 p-2 rounded-lg text-orange">
          <q-icon name="folder_special" size="24px" />
        </div>
        <div>
          <div class="text-lg font-bold text-gray-800">Documentos Requeridos</div>
          <div class="text-xs text-gray-500">
            Documentos solicitados para esta convocatoria ({{store.documentosRequeridos.filter(d =>
              d.obligatorio).length
            }} obligatorios)
          </div>
        </div>
      </div>

      <div class="row q-col-gutter-lg">
        <div v-for="doc in store.documentosRequeridos" :key="doc.id" class="col-12 col-md-4">
          <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-5 h-full">
            <label class="block text-sm font-bold text-gray-700 mb-3">
              {{ doc.nombre }}
              <span v-if="doc.obligatorio" class="text-red-500">*</span>
              <span v-else class="text-gray-400 text-xs font-normal">(Opcional)</span>
            </label>
            <div class="text-xs text-gray-500 mb-3" v-if="doc.descripcion">{{ doc.descripcion }}</div>
            <div
              class="border-2 border-dashed rounded-lg p-4 flex flex-col items-center justify-center bg-gray-50 hover:bg-orange-50 hover:border-orange-300 transition-colors cursor-pointer"
              :class="store.documentos[doc.id] ? 'border-green-400 bg-green-50' : 'border-gray-300'"
              @click="triggerDocumentPicker(doc.id)">
              <q-icon :name="store.documentos[doc.id] ? 'check_circle' : (doc.icono || 'cloud_upload')" size="36px"
                :color="store.documentos[doc.id] ? 'positive' : 'orange'" class="q-mb-sm" />
              <div class="text-sm font-medium text-center"
                :class="store.documentos[doc.id] ? 'text-positive' : 'text-orange'">
                {{ store.documentos[doc.id] ? 'Archivo cargado' : 'Click para subir' }}
              </div>
              <div class="text-xs text-gray-400 mt-1 max-w-full truncate text-center px-2">
                {{ store.documentos[doc.id]?.name || 'Máximo 2MB - PDF' }}
              </div>
            </div>
            <!-- Hidden file input -->
            <input type="file" :ref="el => setDocInputRef(el, doc.id)" accept=".pdf" class="hidden"
              @change="(e) => handleDocumentUpload(e, doc.id)" />
          </div>
        </div>
      </div>

      <!-- Mensaje si no hay documentos configurados -->
      <div v-if="store.documentosRequeridos.length === 0"
        class="text-center p-8 border-2 border-dashed border-gray-300 rounded-xl bg-gray-50 text-gray-400">
        <q-icon name="description" size="40px" class="q-mb-sm opacity-50" />
        <div>Esta convocatoria no requiere documentos específicos.</div>
      </div>
    </div>

    <!-- SECCIÓN 1: Formación Académica -->
    <div class="section-container q-mb-xxl">
      <div class="flex items-center gap-3 q-mb-lg pb-4 border-b border-gray-200">
        <div class="bg-blue-100 p-2 rounded-lg text-primary"><q-icon name="school" size="24px" /></div>
        <div>
          <div class="text-lg font-bold text-gray-800">1. Formación Académica</div>
          <div class="text-xs text-gray-500">Títulos de licenciatura, maestría, doctorado.</div>
        </div>
      </div>

      <div v-if="store.formaciones.length === 0"
        class="text-center p-8 border-2 border-dashed border-gray-300 rounded-xl bg-gray-50 text-gray-400 mb-4">
        <q-icon name="school" size="40px" class="q-mb-sm opacity-50" />
        <div>No ha registrado ninguna formación académica aún.</div>
      </div>

      <div v-for="(item, index) in store.formaciones" :key="'form-' + index"
        class="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6 relative hover:shadow-md transition-shadow group">
        <div class="absolute -right-3 -top-3">
          <q-btn round color="red-1" text-color="negative" icon="delete" unelevated size="sm"
            @click="store.eliminarRegistro('formaciones', index)">
            <q-tooltip>Eliminar este registro</q-tooltip>
          </q-btn>
        </div>

        <div class="row q-col-gutter-lg">
          <div class="col-12 col-md-6">
            <label class="block text-sm font-bold text-gray-700 mb-2">Copia de Título (PDF) <span
                class="text-red-500">*</span></label>
            <div
              class="border-2 border-dashed border-gray-300 rounded-lg p-4 flex flex-col items-center justify-center bg-gray-50 hover:bg-blue-50 hover:border-blue-300 transition-colors cursor-pointer"
              @click="triggerFilePicker('form', index)">
              <q-icon name="cloud_upload" size="30px" color="primary" class="q-mb-sm" />
              <div class="text-sm text-primary font-medium">Click para subir archivo</div>
              <div class="text-xs text-gray-400 mt-1 max-w-full truncate text-center px-2">
                {{ item.archivo ? item.archivo.name : 'Máximo 2MB' }}
              </div>
              <q-file :ref="el => setFileRef(el, 'form', index)" v-model="item.archivo" class="hidden" accept=".pdf"
                max-file-size="2097152" @rejected="onRejected" />
            </div>
          </div>

          <div class="col-12 col-md-6">
            <div class="row q-col-gutter-y-md">
              <div class="col-12">
                <label class="block text-sm font-bold text-gray-700 mb-1">Título / Profesión <span
                    class="text-red-500">*</span></label>
                <q-input v-model="item.titulo_profesion" outlined dense placeholder="Ej: Licenciado en Derecho"
                  bg-color="white" :rules="[val => !!val || 'Requerido']" />
              </div>
              <div class="col-12">
                <label class="block text-sm font-bold text-gray-700 mb-1">Universidad <span
                    class="text-red-500">*</span></label>
                <q-input v-model="item.universidad" outlined dense placeholder="Nombre de la Universidad"
                  bg-color="white" :rules="[val => !!val || 'Requerido']" />
              </div>
              <div class="col-12">
                <label class="block text-sm font-bold text-gray-700 mb-1">Año de Emisión <span
                    class="text-red-500">*</span></label>
                <q-input v-model="item.anio_emision" outlined dense type="number" placeholder="Ej: 2022"
                  bg-color="white"
                  :rules="[val => !!val || 'Requerido', val => (val >= 1900 && val <= 2100) || 'Año inválido']" />
              </div>
            </div>
          </div>
        </div>
      </div>

      <q-btn outline color="primary" class="full-width q-py-md border-dashed rounded-lg" no-caps
        @click="agregarFormacion">
        <div class="flex items-center gap-2">
          <q-icon name="add_circle" />
          <span class="font-bold">Agregar Título Académico</span>
        </div>
      </q-btn>
    </div>


    <!-- SECCIÓN 2: Experiencia Profesional -->
    <div class="section-container q-mb-xxl q-mt-xxl">
      <div class="flex items-center gap-3 q-mb-lg pb-4 border-b border-gray-200">
        <div class="bg-blue-100 p-2 rounded-lg text-primary"><q-icon name="work_history" size="24px" /></div>
        <div>
          <div class="text-lg font-bold text-gray-800">2. Experiencia Profesional</div>
          <div class="text-xs text-gray-500">Agregue sus experiencias laborales relevantes.</div>
        </div>
      </div>

      <div v-if="store.experiencias.length === 0"
        class="text-center p-8 border-2 border-dashed border-gray-300 rounded-xl bg-gray-50 text-gray-400 mb-4">
        <q-icon name="work_off" size="40px" class="q-mb-sm opacity-50" />
        <div>No ha registrado experiencia laboral aún.</div>
      </div>

      <div v-for="(item, index) in store.experiencias" :key="'exp-' + index"
        class="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6 relative hover:shadow-md transition-shadow">
        <div class="absolute -right-3 -top-3">
          <q-btn round color="red-1" text-color="negative" icon="delete" unelevated size="sm"
            @click="store.eliminarRegistro('experiencias', index)">
            <q-tooltip>Eliminar</q-tooltip>
          </q-btn>
        </div>

        <div class="row q-col-gutter-lg">
          <div class="col-12 col-md-5">
            <label class="block text-sm font-bold text-gray-700 mb-2">Certificado (PDF)</label>
            <div
              class="border-2 border-dashed border-gray-300 rounded-lg p-4 flex flex-col items-center justify-center bg-gray-50 hover:bg-blue-50 hover:border-blue-300 transition-colors cursor-pointer h-full"
              @click="triggerFilePicker('exp', index)">
              <q-icon name="cloud_upload" size="30px" color="primary" class="q-mb-sm" />
              <div class="text-sm text-primary font-medium">Subir Certificado</div>
              <div class="text-xs text-gray-400 mt-1 max-w-full truncate text-center px-2">
                {{ item.archivo ? item.archivo.name : 'Máximo 2MB' }}
              </div>
              <q-file :ref="el => setFileRef(el, 'exp', index)" v-model="item.archivo" class="hidden" accept=".pdf"
                max-file-size="2097152" @rejected="onRejected" />
            </div>
          </div>

          <div class="col-12 col-md-7">
            <div class="row q-col-gutter-md">
              <div class="col-12 col-md-6">
                <label class="block text-sm font-bold text-gray-700 mb-1">Cargo Desempeñado</label>
                <q-input v-model="item.cargo_desempenado" outlined dense placeholder="Nombre del cargo" bg-color="white"
                  :rules="[val => !!val || 'Requerido']" />
              </div>
              <div class="col-12 col-md-6">
                <label class="block text-sm font-bold text-gray-700 mb-1">Institución / Empresa</label>
                <q-input v-model="item.empresa_institucion" outlined dense placeholder="Nombre de la entidad"
                  bg-color="white" :rules="[val => !!val || 'Requerido']" />
              </div>
              <div class="col-12 col-md-6">
                <label class="block text-sm font-bold text-gray-700 mb-1">Año de Inicio</label>
                <q-input v-model="item.anio_inicio" outlined dense type="number" placeholder="Ej: 2020" bg-color="white"
                  :rules="[val => !!val || 'Requerido', val => (val >= 1900 && val <= 2100) || 'Año inválido']" />
              </div>
              <div class="col-12 col-md-6">
                <label class="block text-sm font-bold text-gray-700 mb-1">Año de Fin (Opcional)</label>
                <q-input v-model="item.anio_fin" outlined dense type="number" placeholder="Dejar vacío si actual"
                  bg-color="white" :rules="[val => !val || (val >= 1900 && val <= 2100) || 'Año inválido']" />
              </div>
            </div>
          </div>
        </div>
      </div>

      <q-btn outline color="primary" class="full-width q-py-md border-dashed rounded-lg" no-caps
        @click="agregarExperiencia">
        <div class="flex items-center gap-2">
          <q-icon name="add_circle" />
          <span class="font-bold">Agregar Experiencia Profesional</span>
        </div>
      </q-btn>
    </div>


    <!-- SECCIÓN 3: Capacitaciones -->
    <div class="section-container q-mb-xxl q-mt-xxl">
      <div class="flex items-center gap-3 q-mb-lg pb-4 border-b border-gray-200">
        <div class="bg-blue-100 p-2 rounded-lg text-primary"><q-icon name="menu_book" size="24px" /></div>
        <div>
          <div class="text-lg font-bold text-gray-800">3. Cursos y Capacitaciones</div>
          <div class="text-xs text-gray-500">Cursos, talleres, seminarios relevantes al cargo.</div>
        </div>
      </div>

      <div v-if="store.capacitaciones.length === 0"
        class="text-center p-8 border-2 border-dashed border-gray-300 rounded-xl bg-gray-50 text-gray-400 mb-4">
        <q-icon name="class" size="40px" class="q-mb-sm opacity-50" />
        <div>No ha registrado capacitaciones.</div>
      </div>

      <div v-for="(item, index) in store.capacitaciones" :key="'cap-' + index"
        class="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6 relative hover:shadow-md transition-shadow">
        <div class="absolute -right-3 -top-3">
          <q-btn round color="red-1" text-color="negative" icon="delete" unelevated size="sm"
            @click="store.eliminarRegistro('capacitaciones', index)">
            <q-tooltip>Eliminar</q-tooltip>
          </q-btn>
        </div>

        <div class="row q-col-gutter-lg">
          <div class="col-12 col-md-5">
            <label class="block text-sm font-bold text-gray-700 mb-2">Certificado (PDF)</label>
            <div
              class="border-2 border-dashed border-gray-300 rounded-lg p-4 flex flex-col items-center justify-center bg-gray-50 hover:bg-blue-50 hover:border-blue-300 transition-colors cursor-pointer h-full"
              @click="triggerFilePicker('cap', index)">
              <q-icon name="cloud_upload" size="30px" color="primary" class="q-mb-sm" />
              <div class="text-sm text-primary font-medium">Subir Certificado</div>
              <div class="text-xs text-gray-400 mt-1 max-w-full truncate text-center px-2">
                {{ item.archivo ? item.archivo.name : 'Máximo 2MB' }}
              </div>
              <q-file :ref="el => setFileRef(el, 'cap', index)" v-model="item.archivo" class="hidden" accept=".pdf"
                max-file-size="2097152" @rejected="onRejected" />
            </div>
          </div>

          <div class="col-12 col-md-7">
            <div class="row q-col-gutter-md">
              <div class="col-12">
                <label class="block text-sm font-bold text-gray-700 mb-1">Nombre del Curso /
                  Taller</label>
                <q-input v-model="item.nombre_curso" outlined dense placeholder="Nombre completo" bg-color="white" />
              </div>
              <div class="col-12">
                <label class="block text-sm font-bold text-gray-700 mb-1">Institución Emisora</label>
                <q-input v-model="item.institucion_emisora" outlined dense placeholder="Institución" bg-color="white" />
              </div>
              <div class="col-6">
                <label class="block text-sm font-bold text-gray-700 mb-1">Año</label>
                <q-input v-model="item.anio" outlined dense type="number" placeholder="2023" bg-color="white"
                  :rules="[val => !!val || 'Requerido', val => (val >= 1900 && val <= 2100) || 'Año inválido']" />
              </div>
              <div class="col-6">
                <label class="block text-sm font-bold text-gray-700 mb-1">Carga Horaria</label>
                <q-input v-model="item.carga_horaria" outlined dense type="number" suffix="Hrs" placeholder="40"
                  bg-color="white" />
              </div>
            </div>
          </div>
        </div>
      </div>

      <q-btn outline color="primary" class="full-width q-py-md border-dashed rounded-lg" no-caps
        @click="agregarCapacitacion">
        <div class="flex items-center gap-2">
          <q-icon name="add_circle" />
          <span class="font-bold">Agregar Capacitación</span>
        </div>
      </q-btn>
    </div>

    <!-- SECCIÓN 4: Producción Intelectual -->
    <div class="section-container q-mb-xxl q-mt-xxl">
      <div class="flex items-center gap-3 q-mb-lg pb-4 border-b border-gray-200">
        <div class="bg-blue-100 p-2 rounded-lg text-primary"><q-icon name="auto_stories" size="24px" /></div>
        <div>
          <div class="text-lg font-bold text-gray-800">4. Producción Intelectual</div>
          <div class="text-xs text-gray-500">Libros, artículos científicos, investigaciones, software.</div>
        </div>
      </div>

      <div v-if="store.producciones.length === 0"
        class="text-center p-8 border-2 border-dashed border-gray-300 rounded-xl bg-gray-50 text-gray-400 mb-4">
        <q-icon name="library_books" size="40px" class="q-mb-sm opacity-50" />
        <div>No ha registrado producción intelectual.</div>
      </div>

      <div v-for="(item, index) in store.producciones" :key="'prod-' + index"
        class="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6 relative hover:shadow-md transition-shadow">
        <div class="absolute -right-3 -top-3">
          <q-btn round color="red-1" text-color="negative" icon="delete" unelevated size="sm"
            @click="store.eliminarRegistro('producciones', index)">
            <q-tooltip>Eliminar</q-tooltip>
          </q-btn>
        </div>

        <div class="row q-col-gutter-lg">
          <div class="col-12 col-md-5">
            <label class="block text-sm font-bold text-gray-700 mb-2">Documento de Respaldo (PDF)</label>
            <div
              class="border-2 border-dashed border-gray-300 rounded-lg p-4 flex flex-col items-center justify-center bg-gray-50 hover:bg-blue-50 hover:border-blue-300 transition-colors cursor-pointer h-full"
              @click="triggerFilePicker('prod', index)">
              <q-icon name="cloud_upload" size="30px" color="primary" class="q-mb-sm" />
              <div class="text-sm text-primary font-medium">Subir Documento</div>
              <div class="text-xs text-gray-400 mt-1 max-w-full truncate text-center px-2">
                {{ item.archivo ? item.archivo.name : 'Máximo 2MB' }}
              </div>
              <q-file :ref="el => setFileRef(el, 'prod', index)" v-model="item.archivo" class="hidden" accept=".pdf"
                max-file-size="2097152" @rejected="onRejected" />
            </div>
          </div>

          <div class="col-12 col-md-7">
            <div class="row q-col-gutter-md">
              <div class="col-12 col-md-6">
                <label class="block text-sm font-bold text-gray-700 mb-1">Tipo de Producción</label>
                <q-select v-model="item.tipo" :options="tiposProduccion" outlined dense emit-value map-options
                  bg-color="white" />
              </div>
              <div class="col-12 col-md-6">
                <label class="block text-sm font-bold text-gray-700 mb-1">Año</label>
                <q-input v-model="item.anio" outlined dense type="number" bg-color="white"
                  :rules="[val => !!val || 'Requerido', val => (val >= 1900 && val <= 2100) || 'Año inválido']" />
              </div>
              <div class="col-12">
                <label class="block text-sm font-bold text-gray-700 mb-1">Título de la Obra</label>
                <q-input v-model="item.titulo" outlined dense placeholder="Título completo" bg-color="white" />
              </div>
            </div>
          </div>
        </div>
      </div>

      <q-btn outline color="primary" class="full-width q-py-md border-dashed rounded-lg" no-caps
        @click="agregarProduccion">
        <div class="flex items-center gap-2">
          <q-icon name="add_circle" />
          <span class="font-bold">Agregar Producción Intelectual</span>
        </div>
      </q-btn>
    </div>

    <!-- SECCIÓN 5: Reconocimientos -->
    <div class="section-container q-mb-xxl q-mt-xxl">
      <div class="flex items-center gap-3 q-mb-lg pb-4 border-b border-gray-200">
        <div class="bg-blue-100 p-2 rounded-lg text-primary"><q-icon name="emoji_events" size="24px" /></div>
        <div>
          <div class="text-lg font-bold text-gray-800">5. Reconocimientos y Premios</div>
          <div class="text-xs text-gray-500">Distinciones, premios, reconocimientos honoríficos.</div>
        </div>
      </div>

      <div v-if="store.reconocimientos.length === 0"
        class="text-center p-8 border-2 border-dashed border-gray-300 rounded-xl bg-gray-50 text-gray-400 mb-4">
        <q-icon name="military_tech" size="40px" class="q-mb-sm opacity-50" />
        <div>No ha registrado reconocimientos.</div>
      </div>

      <div v-for="(item, index) in store.reconocimientos" :key="'rec-' + index"
        class="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6 relative hover:shadow-md transition-shadow">
        <div class="absolute -right-3 -top-3">
          <q-btn round color="red-1" text-color="negative" icon="delete" unelevated size="sm"
            @click="store.eliminarRegistro('reconocimientos', index)">
            <q-tooltip>Eliminar</q-tooltip>
          </q-btn>
        </div>

        <div class="row q-col-gutter-lg">
          <div class="col-12 col-md-5">
            <label class="block text-sm font-bold text-gray-700 mb-2">Documento de Respaldo (PDF)</label>
            <div
              class="border-2 border-dashed border-gray-300 rounded-lg p-4 flex flex-col items-center justify-center bg-gray-50 hover:bg-blue-50 hover:border-blue-300 transition-colors cursor-pointer h-full"
              @click="triggerFilePicker('rec', index)">
              <q-icon name="cloud_upload" size="30px" color="primary" class="q-mb-sm" />
              <div class="text-sm text-primary font-medium">Subir Documento</div>
              <div class="text-xs text-gray-400 mt-1 max-w-full truncate text-center px-2">
                {{ item.archivo ? item.archivo.name : 'Máximo 2MB' }}
              </div>
              <q-file :ref="el => setFileRef(el, 'rec', index)" v-model="item.archivo" class="hidden" accept=".pdf"
                max-file-size="2097152" @rejected="onRejected" />
            </div>
          </div>

          <div class="col-12 col-md-7">
            <div class="row q-col-gutter-md">
              <div class="col-12 col-md-6">
                <label class="block text-sm font-bold text-gray-700 mb-1">Tipo de Reconocimiento</label>
                <q-input v-model="item.tipo_reconocimiento" outlined dense placeholder="Premio, Distinción, etc."
                  bg-color="white" />
              </div>
              <div class="col-12 col-md-6">
                <label class="block text-sm font-bold text-gray-700 mb-1">Año</label>
                <q-input v-model="item.anio" outlined dense type="number" bg-color="white"
                  :rules="[val => !!val || 'Requerido', val => (val >= 1900 && val <= 2100) || 'Año inválido']" />
              </div>
              <div class="col-12">
                <label class="block text-sm font-bold text-gray-700 mb-1">Entidad que Otorga</label>
                <q-input v-model="item.otorgado_por" outlined dense placeholder="Institución" bg-color="white" />
              </div>
              <div class="col-12">
                <label class="block text-sm font-bold text-gray-700 mb-1">Motivo / Título</label>
                <q-input v-model="item.titulo" outlined dense class="bg-gray-50" hide-bottom-space />
              </div>
            </div>
          </div>
        </div>
      </div>

      <q-btn outline color="primary" class="full-width q-py-md border-dashed rounded-lg" no-caps
        @click="agregarReconocimiento">
        <div class="flex items-center gap-2">
          <q-icon name="add_circle" />
          <span class="font-bold">Agregar Reconocimiento</span>
        </div>
      </q-btn>
    </div>

    <!-- Botones Navegación Step 3 -->
    <div class="flex justify-between mt-12 pt-6 border-t border-gray-200">
      <q-btn flat color="primary" icon="arrow_back" label="Atrás" @click="emit('prev')" no-caps />
      <q-btn unelevated color="primary" label="Ir a Confirmación" icon-right="check_circle" @click="validateAndNext"
        no-caps class="px-6 py-2" />
    </div>
  </q-form>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { usePostulacionStore } from 'stores/postulacion-store'
import { useQuasar } from 'quasar'

const store = usePostulacionStore()
const $q = useQuasar()
const form = ref(null)

const emit = defineEmits(['next', 'prev'])

const currentYear = new Date().getFullYear()

const tiposProduccion = [
  { label: 'Libro', value: 'libro' },
  { label: 'Artículo Científico', value: 'articulo' },
  { label: 'Software', value: 'software' },
  { label: 'Investigación', value: 'investigacion' },
  { label: 'Proyecto', value: 'proyecto' },
  { label: 'Otro', value: 'otro' },
]

// Refs para archivos
const fileInputRefs = ref({})
const setFileRef = (el, type, index) => {
  if (el) {
    fileInputRefs.value[`${type}_${index}`] = el
  }
}
const triggerFilePicker = (type, index) => {
  const ref = fileInputRefs.value[`${type}_${index}`]
  if (ref) {
    ref.pickFiles()
  }
}

// Refs para documentos dinámicos
const docInputRefs = ref({})
const setDocInputRef = (el, docId) => {
  if (el) {
    docInputRefs.value[docId] = el
  }
}

const triggerDocumentPicker = (docId) => {
  const input = docInputRefs.value[docId]
  if (input) {
    input.click()
  }
}

const handleDocumentUpload = (event, docId) => {
  const file = event.target.files[0]
  if (!file) return

  // Validar tamaño (2MB)
  if (file.size > 2097152) {
    $q.notify({
      type: 'negative',
      message: 'El archivo excede el tamaño máximo de 2MB',
      position: 'top'
    })
    event.target.value = '' // Reset input
    return
  }

  // Validar tipo
  if (!file.name.toLowerCase().endsWith('.pdf')) {
    $q.notify({
      type: 'negative',
      message: 'Solo se permiten archivos PDF',
      position: 'top'
    })
    event.target.value = '' // Reset input
    return
  }

  // Guardar en el store
  store.setDocumento(docId, file)
  $q.notify({
    type: 'positive',
    message: 'Documento cargado correctamente',
    position: 'top',
    timeout: 1500
  })
}

const onRejected = () => {
  $q.notify({
    type: 'negative',
    message: 'Archivo rechazado: Verifique el formato y tamaño (máx 2MB)'
  })
}

// Helpers para agregar registros (conectados al store)
const agregarFormacion = () => store.agregarRegistro('formaciones', {
  nivel: 'licenciatura',
  titulo_profesion: '',
  universidad: '',
  anio_emision: currentYear,
  archivo: null
})

const agregarExperiencia = () => store.agregarRegistro('experiencias', {
  cargo_desempenado: '',
  empresa_institucion: '',
  anio_inicio: '',
  anio_fin: '',
  funciones: '',
  archivo: null
})

const agregarCapacitacion = () => store.agregarRegistro('capacitaciones', {
  nombre_curso: '',
  institucion_emisora: '',
  carga_horaria: null,
  anio: currentYear,
  archivo: null
})

const agregarProduccion = () => store.agregarRegistro('producciones', {
  tipo: 'libro',
  titulo: '',
  descripcion: '',
  anio: currentYear,
  archivo: null
})

const agregarReconocimiento = () => store.agregarRegistro('reconocimientos', {
  tipo_reconocimiento: '',
  titulo: '',
  otorgado_por: '',
  anio: currentYear,
  archivo: null
})

// Inicialización de campos requeridos si están vacíos
onMounted(() => {
  if (store.formaciones.length === 0) agregarFormacion()
  if (store.experiencias.length === 0) agregarExperiencia()
  if (store.capacitaciones.length === 0) agregarCapacitacion()
  if (store.producciones.length === 0) agregarProduccion()
  if (store.reconocimientos.length === 0) agregarReconocimiento()
})

const validateAndNext = async () => {
  // Validar documentos requeridos (dinámico)
  if (store.documentosFaltantes.length > 0) {
    const faltantes = store.documentosFaltantes.slice(0, 3).join(', ')
    const mas = store.documentosFaltantes.length > 3 ? ` y ${store.documentosFaltantes.length - 3} más` : ''
    $q.notify({
      type: 'warning',
      message: `Faltan documentos obligatorios: ${faltantes}${mas}`,
      position: 'top',
      timeout: 4000
    })
    return
  }

  // Validaciones obligatorias
  if (store.formaciones.length === 0) {
    $q.notify({ type: 'warning', message: 'Debe agregar al menos una formación académica.' })
    return
  }
  if (store.experiencias.length === 0) {
    $q.notify({ type: 'warning', message: 'Debe agregar al menos una experiencia profesional.' })
    return
  }

  const valid = await form.value.validate()
  if (!valid) {
    $q.notify({
      type: 'negative',
      message: 'Por favor complete correctamente todos los campos marcados como requeridos.',
      caption: 'Revise los campos resaltados en rojo.',
      position: 'top',
      timeout: 3000
    })
    return
  }

  emit('next')
}
</script>

<style scoped>
.scrollable-step::-webkit-scrollbar {
  width: 8px;
}

.scrollable-step::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 4px;
}

.scrollable-step::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 4px;
}
</style>
