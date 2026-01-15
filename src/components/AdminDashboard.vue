<template>
  <div class="min-h-screen bg-gray-50 p-6 md:p-8 animate-fade">

    <!-- Login Modal Estilizado -->
    <!-- Login Dialog Removed (Handled by LoginPage) -->

    <!-- Contenido Principal - Full Width -->
    <div v-if="isAuthenticated" class="w-full px-4 sm:px-6 py-6 pb-20">

      <!-- Encabezado de Sección (Solo visible en Dashboard) -->
      <div v-if="activeTab === 'dashboard'" class="flex flex-col gap-4 mb-6">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 class="text-2xl font-bold text-gray-900 tracking-tight">{{ currentSectionTitle }}</h1>
            <p class="text-gray-500 text-sm mt-1 flex items-center gap-2">
              <span class="w-2 h-2 rounded-full bg-green-500"></span>
              Panel de Administración
            </p>
          </div>

          <!-- Acciones Rápidas Globales -->
          <div class="flex gap-2">
            <button @click="loadData"
              class="p-2 text-gray-400 hover:text-gray-600 bg-white hover:bg-gray-50 border border-gray-200 rounded-lg transition-colors shadow-sm">
              <q-icon name="refresh" size="20px" />
              <q-tooltip>Actualizar Datos</q-tooltip>
            </button>
          </div>
        </div>
      </div>

      <!-- VISTA: DASHBOARD -->
      <div v-show="activeTab === 'dashboard'">
        <AdminHomeComp :stats="stats" @change-tab="(tab) => activeTab = tab" />
      </div>

      <!-- VISTA: CONVOCATORIAS -->
      <div v-show="activeTab === 'convocatorias'" class="animate-fadeIn">
        <div class="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          <!-- Header Purple Style - Reference Image 1 -->
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

            <button @click="showConvocatoriaDialog = true"
              class="bg-secondary hover:bg-teal-600 text-white px-3 py-1.5 rounded-lg text-sm font-bold transition-all shadow-md hover:shadow-lg flex items-center gap-2">
              <q-icon name="add" size="16px" /> Nueva
            </button>
          </div>

          <q-table :rows="convocatorias" :columns="convocatoriasColumns" row-key="id" flat
            :pagination="{ rowsPerPage: 10 }" class="qt-clean">
            <template v-slot:body-cell-estado="props">
              <q-td :props="props">
                <span :class="{
                  'bg-green-100 text-green-700': new Date(props.row.fecha_cierre) >= new Date() && new Date(props.row.fecha_inicio) <= new Date(),
                  'bg-gray-100 text-gray-600': new Date(props.row.fecha_inicio) > new Date(),
                  'bg-red-100 text-red-700': new Date(props.row.fecha_cierre) < new Date(),
                }" class="px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wide">
                  {{ new Date(props.row.fecha_cierre) < new Date() ? 'Cerrada' : (new Date(props.row.fecha_inicio) > new
                    Date() ? 'Próxima' : 'Activa') }}
                </span>
                <span class="text-xs text-gray-400 ml-2 block mt-1">{{ props.row.ofertas_count || 0 }}
                  Ofertas</span>
              </q-td>
            </template>
            <template v-slot:body-cell-acciones="props">
              <q-td :props="props">
                <div class="flex justify-center gap-2">
                  <button @click="editConvocatoria(props.row)"
                    class="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"><q-icon
                      name="edit" size="18px" /></button>
                  <button @click="gestionarOfertas(props.row)"
                    class="p-1.5 text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"><q-icon
                      name="settings" size="18px" /></button>
                  <button @click="openAfichePreview(props.row)"
                    class="p-1.5 text-gray-500 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors" title="Ver Afiche">
                    <q-icon name="image" size="18px" />
                  </button>
                  <button @click="verPostulaciones(props.row)"
                    class="p-1.5 text-gray-500 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors relative">
                    <q-icon name="visibility" size="18px" />
                  </button>
                  <button @click="eliminarConvocatoria(props.row)"
                    class="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="Eliminar">
                    <q-icon name="delete" size="18px" />
                  </button>
                </div>
              </q-td>
            </template>
          </q-table>
        </div>
      </div>

      <!-- VISTA: GESTIÓN CONVOCATORIAS (Ver Postulantes) -->
      <div v-show="activeTab === 'gestion-convocatorias'" class="animate-fadeIn">
        <ConvocatoriasPostulantes @ver-expediente="verExpediente" />
      </div>

      <!-- VISTA: SEDES -->
      <div v-show="activeTab === 'sedes'">
        <AdminSedes />
      </div>

      <!-- VISTA: CARGOS -->
      <div v-show="activeTab === 'cargos'">
        <AdminCargos />
      </div>

      <!-- VISTA: TIPOS DE DOCUMENTO -->
      <div v-show="activeTab === 'tipos-documento'">
        <TiposDocumentoManager />
      </div>



      <!-- VISTA: USUARIOS -->
      <div v-if="activeTab === 'usuarios' && isAdmin">
        <AdminUsuarios />
      </div>

      <!-- VISTA: ROLES -->
      <div v-if="activeTab === 'roles' && isAdmin">
        <AdminRoles />
      </div>

      <!-- VISTA: POSTULACIONES -->
      <div v-show="activeTab === 'postulaciones'" class="animate-fadeIn">
        <div class="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          <!-- Header Purple Style -->
          <div class="bg-primary px-5 py-3 flex flex-col md:flex-row justify-between items-center gap-4">
            <div class="flex items-center gap-3">
              <div class="p-2 bg-white/10 rounded-lg text-white backdrop-blur-sm">
                <q-icon name="people_alt" size="22px" />
              </div>
              <div class="text-white">
                <h3 class="text-base font-bold leading-tight">Gestión de Postulaciones</h3>
                <div class="text-[11px] opacity-90 font-medium">Revise y gestione los candidatos</div>
              </div>
            </div>

            <button @click="cargarPostulaciones"
              class="bg-white/10 hover:bg-white/20 text-white px-3 py-1.5 rounded-lg text-sm font-bold transition-all backdrop-blur-md flex items-center gap-2">
              <q-icon name="refresh" size="16px" /> Actualizar
            </button>
          </div>

          <div class="p-6 border-b border-gray-100 bg-gray-50/50">
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
              <q-select v-model="filtroConvocatoria" :options="convocatoriasOptions" label="Convocatoria" outlined dense
                bg-color="white" emit-value map-options clearable @update:model-value="cargarPostulaciones">
                <template v-slot:no-option><q-item><q-item-section class="text-gray-400 italic">No hay
                      datos</q-item-section></q-item></template>
              </q-select>

              <q-select v-model="filtroSede" :options="sedesOptions" label="Sede" outlined dense bg-color="white"
                emit-value map-options clearable @update:model-value="cargarPostulaciones">
                <template v-slot:no-option><q-item><q-item-section class="text-gray-400 italic">No hay
                      datos</q-item-section></q-item></template>
              </q-select>

              <q-select v-model="filtroCargo" :options="cargosOptions" label="Cargo" outlined dense bg-color="white"
                emit-value map-options clearable @update:model-value="cargarPostulaciones">
                <template v-slot:no-option><q-item><q-item-section class="text-gray-400 italic">No hay
                      datos</q-item-section></q-item></template>
              </q-select>
            </div>
          </div>

          <q-table :rows="postulaciones" :columns="postulacionesColumns" row-key="id" flat
            :loading="loadingPostulaciones" class="qt-clean">
            <template v-slot:body-cell-postulante="props">
              <q-td :props="props">
                <div class="flex items-center gap-3">
                  <div
                    class="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 font-bold text-xs">
                    {{ props.row.postulante?.nombres[0] }}{{ props.row.postulante?.apellidos[0] }}
                  </div>
                  <div>
                    <div class="font-medium text-gray-900">{{ props.row.postulante?.nombres }} {{
                      props.row.postulante?.apellidos }}</div>
                    <div class="text-xs text-gray-500">{{ props.row.postulante?.ci }}</div>
                  </div>
                </div>
              </q-td>
            </template>
            <template v-slot:body-cell-estado="props">
              <q-td :props="props">
                <q-select :model-value="props.row.estado" :options="estadosOptions" dense outlined class="text-xs"
                  bg-color="white" emit-value map-options @update:model-value="val => cambiarEstado(props.row, val)" />
              </q-td>
            </template>
            <template v-slot:body-cell-acciones="props">
              <q-td :props="props">
                <button @click="verExpediente(props.row)"
                  class="px-3 py-1.5 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-md text-xs font-medium transition-colors">
                  Ver Expediente
                </button>
              </q-td>
            </template>
          </q-table>
        </div>
      </div>

      <!-- VISTA: TIPOS DE DOCUMENTO -->
      <div v-show="activeTab === 'documentos'" class="animate-fadeIn">
        <TiposDocumentoManager />
      </div>

      <!-- VISTA: REPORTES -->
      <div v-show="activeTab === 'reportes'" class="animate-fadeIn">
        <ReportsDashboard />
      </div>

    </div>

    <!-- Dialogs Modals (Manteniendo estructura Quasar para funcionalidad, pero con clases si aplica) -->
    <!-- (Se mantienen igual para no romper los formularios, solo pequeñas mejoras visuales) -->

    <q-dialog v-model="showConvocatoriaDialog" @hide="resetConvocatoriaForm">
      <q-card style="min-width: 900px; max-width: 95vw;" class="rounded-xl">
        <q-card-section class="row items-center border-b border-gray-100 q-py-md px-6 bg-white">
          <div>
            <div class="text-xl font-bold text-gray-900">{{ editingConvocatoria ? 'Editar' : 'Nueva' }}
              Convocatoria
            </div>
            <div class="text-sm text-gray-500">Gestione la información y vacantes</div>
          </div>
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup class="text-gray-500" />
        </q-card-section>

        <q-card-section class="q-pa-none">
          <q-stepper v-model="step" ref="stepper" animated flat active-color="primary" done-color="positive"
            class="w-full" header-class="bg-gray-50 border-b border-gray-100 text-gray-600">

            <!-- PASO 1: DATOS GENERALES -->
            <q-step :name="1" title="Datos Generales" icon="settings" :done="step > 1" class="h-full">
              <div class="max-w-3xl mx-auto py-4">
                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div class="col-span-2">
                    <label class="block text-sm font-medium text-gray-700 mb-1">Título de la Convocatoria
                      <span class="text-red-500">*</span></label>
                    <q-input v-model="convocatoriaForm.titulo" outlined dense bg-color="white"
                      placeholder="Ej: Convocatoria Nacional 2026" :rules="[val => !!val || 'Requerido']" />
                  </div>
                  <div class="col-span-2">
                    <label class="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
                    <q-input v-model="convocatoriaForm.descripcion" outlined dense type="textarea" bg-color="white"
                      rows="2" placeholder="Breve descripción de la convocatoria..." />
                  </div>

                  <!-- Perfil Profesional Requerido -->
                  <div class="col-span-2">
                    <label class="block text-sm font-medium text-gray-700 mb-1">
                      <q-icon name="school" class="mr-1" /> Perfil Profesional Requerido
                    </label>
                    <q-input v-model="convocatoriaForm.perfil_profesional" outlined dense type="textarea" bg-color="white"
                      rows="4" placeholder="• Título profesional a nivel licenciatura (obligatorio)
• Diplomado en Educación Superior (deseable)
• Maestría en el área (deseable)
• Doctorado (deseable)" />
                  </div>

                  <!-- Experiencia Requerida -->
                  <div class="col-span-2">
                    <label class="block text-sm font-medium text-gray-700 mb-1">
                      <q-icon name="work_history" class="mr-1" /> Experiencia Requerida
                    </label>
                    <q-input v-model="convocatoriaForm.experiencia_requerida" outlined dense type="textarea" bg-color="white"
                      rows="3" placeholder="• Experiencia mínima de 5 años en docencia universitaria
• Experiencia mínima de 3 años en cargos de gestión académica" />
                  </div>

                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Fecha Inicio <span
                        class="text-red-500">*</span></label>
                    <q-input v-model="convocatoriaForm.fecha_inicio" outlined dense type="date" bg-color="white" />
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Fecha Cierre <span
                        class="text-red-500">*</span></label>
                    <q-input v-model="convocatoriaForm.fecha_cierre" outlined dense type="date" bg-color="white" />
                  </div>

                  <!-- Hora Límite -->
                  <div class="col-span-2 md:col-span-1">
                    <label class="block text-sm font-medium text-gray-700 mb-1">
                      <q-icon name="schedule" class="mr-1" /> Hora Límite de Postulación
                    </label>
                    <q-input v-model="convocatoriaForm.hora_limite" outlined dense type="time" bg-color="white" />
                  </div>

                  <div class="col-span-2 bg-blue-50 p-4 rounded-xl text-blue-800 text-sm flex items-center gap-3">
                    <q-icon name="auto_mode" size="20px" />
                    <span>La convocatoria se activará automáticamente entre las fechas seleccionadas hasta la hora límite indicada.</span>
                  </div>
                </div>

                <div class="flex justify-end gap-3 mt-12 pt-6 border-t border-gray-100">
                  <button v-if="editingConvocatoria" @click="showConvocatoriaDialog = false"
                    class="px-4 py-2 text-red-500 hover:bg-red-50 rounded-lg font-medium mr-auto">
                    Cancelar
                  </button>

                  <button v-if="editingConvocatoria" @click="step = 3"
                    class="px-6 py-2.5 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg font-bold transition-colors flex items-center gap-2">
                    Gestionar Documentos <q-icon name="description" />
                  </button>

                  <button v-if="editingConvocatoria" @click="saveConvocatoria"
                    class="px-6 py-2.5 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 transition-colors flex items-center gap-2">
                    <q-spinner v-if="saving" size="xs" /> Guardar Cambios
                  </button>

                  <button v-if="!editingConvocatoria" @click="() => {
                    if (convocatoriaForm.titulo && convocatoriaForm.fecha_inicio && convocatoriaForm.fecha_cierre) {
                      step = 2;
                    } else {
                      $q.notify({ type: 'warning', message: 'Complete los campos obligatorios' })
                    }
                  }"
                    class="px-6 py-2.5 bg-gray-900 text-white rounded-lg font-bold hover:bg-gray-800 transition-colors flex items-center gap-2 group">
                    Siguiente Paso <q-icon name="arrow_forward"
                      class="group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>
              </div>
            </q-step>

            <!-- PASO 2: OFERTAS (Solo nueva) -->
            <q-step :name="2" title="Asignar Ofertas" icon="work" :disable="editingConvocatoria !== null"
              class="h-full">
              <div class="max-w-4xl mx-auto py-4">
                <div class="bg-blue-50 p-4 rounded-xl mb-8 border border-blue-100 flex items-start gap-3">
                  <q-icon name="info" class="text-blue-600 mt-0.5" size="20px" />
                  <div class="text-sm text-blue-800">
                    Seleccione una o varias Sedes y uno o varios Cargos para asignarlos en bloque. Puede crear nuevas sedes o cargos si no existen.
                  </div>
                </div>

                <!-- Formulario Agregar -->
                <div class="bg-white p-5 rounded-xl border border-gray-200 shadow-sm mb-6">
                  <h4 class="text-sm font-bold text-gray-900 uppercase tracking-wide mb-4">Agregar Combinación
                  </h4>
                  <div class="grid grid-cols-1 md:grid-cols-12 gap-4 items-start">

                    <!-- Sede -->
                    <div class="md:col-span-4 flex gap-2 items-start">
                      <div class="flex-1">
                        <q-select v-model="tempOferta.sedes_ids" :options="sedesOptions" label="Sedes" outlined dense
                          bg-color="white" emit-value map-options multiple use-chips stack-label class="w-full">
                          <template v-slot:no-option>
                            <q-item clickable @click="showQuickSede = true">
                              <q-item-section class="text-blue-600"><q-icon name="add" /> Crear nueva
                                sede</q-item-section>
                            </q-item>
                          </template>
                        </q-select>
                      </div>
                      <button @click="showQuickSede = true"
                        class="mt-1 p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg border border-blue-200"
                        title="Crear Sede Rápida"><q-icon name="add" size="20px" /></button>
                    </div>

                    <!-- Cargos (Multiple) -->
                    <div class="md:col-span-5 flex gap-2 items-start">
                      <div class="flex-1">
                        <q-select v-model="tempOferta.cargos_ids" :options="cargosOptions" label="Cargos" outlined dense
                          bg-color="white" emit-value map-options multiple use-chips stack-label class="w-full">
                          <template v-slot:no-option>
                            <q-item clickable @click="showQuickCargo = true">
                              <q-item-section class="text-blue-600"><q-icon name="add" /> Crear nuevo
                                cargo</q-item-section>
                            </q-item>
                          </template>
                        </q-select>
                      </div>
                      <button @click="showQuickCargo = true"
                        class="mt-1 p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg border border-blue-200"
                        title="Crear Cargo Rápido"><q-icon name="add" size="20px" /></button>
                    </div>

                    <!-- Vacantes Detalladas (Aparece cuando hay cargos) -->
                    <div v-if="tempOferta.cargos_ids.length > 0"
                      class="col-span-full bg-gray-50 p-4 rounded-xl border border-dashed border-gray-300 animate-fadeIn">
                      <div class="text-xs font-bold text-gray-500 mb-3 uppercase tracking-wider">Configurar
                        Vacantes por Cargo</div>
                      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        <div v-for="id in tempOferta.cargos_ids" :key="id"
                          class="flex items-center gap-3 bg-white p-2 rounded-lg border">
                          <span class="flex-1 text-xs font-medium text-gray-700 truncate">{{
                            getCargoName(id)
                          }}</span>
                          <q-input v-model.number="tempOferta.vacantes_map[id]" type="number" outlined dense
                            bg-color="white" style="width: 80px" min="1" />
                        </div>
                      </div>
                    </div>

                    <!-- Botón Agregar -->
                    <div class="col-span-full flex justify-end">
                      <button @click="addOfertaToForm"
                        class="px-8 py-3 bg-gray-900 text-white rounded-xl hover:bg-gray-800 font-bold shadow-lg shadow-gray-200 transition-all flex items-center gap-2">
                        <q-icon name="playlist_add" size="20px" /> Agregar Combinación a la Lista
                      </button>
                    </div>
                  </div>
                </div>

                <!-- Lista -->
                <div class="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm min-h-[200px]">
                  <div v-if="convocatoriaForm.ofertas.length === 0"
                    class="flex flex-col items-center justify-center py-12 text-gray-400">
                    <q-icon name="inbox" size="48px" class="mb-2 opacity-50" />
                    <p>Lista de ofertas vacía</p>
                  </div>
                  <table v-else class="w-full text-left">
                    <thead class="bg-gray-50 text-gray-500 uppercase text-xs font-semibold border-b border-gray-100">
                      <tr>
                        <th class="p-4">Sede</th>
                        <th class="p-4">Cargo</th>
                        <th class="p-4 text-center">Vacantes</th>
                        <th class="p-4 text-right">Acción</th>
                      </tr>
                    </thead>
                    <tbody class="divide-y divide-gray-100">
                      <tr v-for="(oferta, idx) in convocatoriaForm.ofertas" :key="idx"
                        class="hover:bg-gray-50 transition-colors">
                        <td class="p-4 font-medium text-gray-900">{{
                          sedes.find(s => s.id === oferta.sede_id)?.nombre
                        }}</td>
                        <td class="p-4 text-gray-700">{{cargos.find(c => c.id === oferta.cargo_id)?.nombre}}
                        </td>
                        <td class="p-4 text-center font-mono">
                          <q-input v-model.number="oferta.vacantes" type="number" dense borderless
                            input-class="text-center font-bold" min="1" />
                        </td>
                        <td class="p-4 text-right">
                          <button @click="removeOfertaFromForm(idx)"
                            class="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all">
                            <q-icon name="delete" size="18px" />
                          </button>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <div class="flex justify-between mt-8 pt-6 border-t border-gray-100">
                  <button @click="step = 1"
                    class="px-6 py-2 text-gray-600 hover:text-gray-900 font-medium hover:bg-gray-100 rounded-lg transition-colors">
                    Atrás
                  </button>
                  <button @click="step = 3"
                    class="px-8 py-3 bg-gray-900 text-white rounded-lg font-bold hover:bg-gray-800 transition-colors flex items-center gap-2 group">
                    Siguiente: Documentos <q-icon name="arrow_forward"
                      class="group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>
              </div>
            </q-step>

            <!-- PASO 3: DOCUMENTOS REQUERIDOS -->
            <q-step :name="3" title="Documentos" icon="description" class="h-full">
              <div class="max-w-4xl mx-auto py-4">
                <div class="bg-blue-50 p-4 rounded-xl mb-8 border border-blue-100 flex items-start gap-3">
                  <q-icon name="info" class="text-blue-600 mt-0.5" size="20px" />
                  <div class="text-sm text-blue-800">
                    Seleccione los documentos que serán requeridos para postular a esta convocatoria.
                    Marque como <strong>obligatorio</strong> los que son indispensables.
                  </div>
                </div>

                <!-- Lista de Tipos de Documento -->
                <div class="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                  <div class="px-6 py-4 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
                    <h4 class="font-bold text-gray-700">Tipos de Documento Disponibles</h4>
                    <q-btn flat round color="primary" icon="add" size="sm" @click="showQuickTipoDocumento = true">
                      <q-tooltip>Crear nuevo tipo de documento</q-tooltip>
                    </q-btn>
                  </div>

                  <div class="divide-y divide-gray-100">
                    <!-- SECCIÓN: DOCUMENTOS PERSONALES -->
                    <div class="px-6 py-3 bg-amber-50/50 flex items-center gap-2">
                       <q-icon name="person" color="amber-9" size="18px" />
                       <span class="text-xs font-bold text-amber-900 uppercase tracking-wider">Archivos para Datos Personales</span>
                    </div>
                    <template v-for="tipo in filteredTiposDocumento.filter(t => t.categoria === 'personal')" :key="'p-'+tipo.id">
                      <div class="grid grid-cols-12 items-center p-4 hover:bg-gray-50 transition-colors border-b border-gray-50 last:border-0 gap-4">
                        <div class="col-span-9 flex items-center gap-4">
                          <q-checkbox :model-value="isDocumentoSelected(tipo.id)"
                            @update:model-value="toggleDocumento(tipo.id)" color="primary" />
                          <div class="p-2 bg-amber-50 text-amber-600 rounded-lg shrink-0">
                            <q-icon :name="tipo.icono || 'person'" size="20px" />
                          </div>
                          <div>
                            <div class="font-medium text-gray-900">{{ tipo.nombre }}</div>
                            <div class="text-xs text-gray-500">{{ tipo.descripcion }}</div>
                          </div>
                        </div>
                        <div class="col-span-3 flex justify-end">
                          <div v-if="isDocumentoSelected(tipo.id)"
                            class="flex items-center gap-2 bg-orange-50 px-3 py-1 rounded-full">
                            <span class="text-xs text-orange-800 font-medium">¿Obligatorio?</span>
                            <q-toggle :model-value="isObligatorio(tipo.id)"
                              @update:model-value="toggleObligatorio(tipo.id)" color="orange" size="sm" />
                          </div>
                        </div>
                      </div>
                    </template>

                    <!-- SECCIÓN: DOCUMENTOS DE EXPEDIENTE -->
                    <div class="px-6 py-3 bg-indigo-50/50 flex items-center gap-2 mt-2">
                       <q-icon name="folder_special" color="indigo-9" size="18px" />
                       <span class="text-xs font-bold text-indigo-900 uppercase tracking-wider">Documentos del Expediente / Hoja de Vida</span>
                    </div>
                    <template v-for="tipo in filteredTiposDocumento.filter(t => t.categoria !== 'personal')" :key="'e-'+tipo.id">
                      <div class="grid grid-cols-12 items-center p-4 hover:bg-gray-50 transition-colors border-b border-gray-50 last:border-0 gap-4">
                        <div class="col-span-9 flex items-center gap-4">
                          <q-checkbox :model-value="isDocumentoSelected(tipo.id)"
                            @update:model-value="toggleDocumento(tipo.id)" color="primary" />
                          <div class="p-2 bg-indigo-50 text-indigo-600 rounded-lg shrink-0">
                            <q-icon :name="tipo.icono || 'description'" size="20px" />
                          </div>
                          <div>
                            <div class="font-medium text-gray-900">{{ tipo.nombre }}</div>
                            <div class="text-xs text-gray-500">{{ tipo.descripcion }}</div>
                          </div>
                        </div>
                        <div class="col-span-3 flex justify-end">
                          <div v-if="isDocumentoSelected(tipo.id)"
                            class="flex items-center gap-2 bg-orange-50 px-3 py-1 rounded-full">
                            <span class="text-xs text-orange-800 font-medium">¿Obligatorio?</span>
                            <q-toggle :model-value="isObligatorio(tipo.id)"
                              @update:model-value="toggleObligatorio(tipo.id)" color="orange" size="sm" />
                          </div>
                        </div>
                      </div>
                    </template>
                  </div>

                  <div v-if="tiposDocumento.length === 0" class="p-8 text-center text-gray-400 italic">
                    No hay tipos de documento configurados
                  </div>
                </div>

                <!-- Resumen de selección -->
                <div v-if="convocatoriaForm.documentos.length > 0"
                  class="mt-6 bg-green-50 p-4 rounded-xl border border-green-200">
                  <div class="text-sm text-green-800">
                    <strong>{{ convocatoriaForm.documentos.length }}</strong> documentos seleccionados
                    ({{convocatoriaForm.documentos.filter(d => d.obligatorio).length}} obligatorios)
                  </div>
                </div>

                <div class="flex justify-between mt-8 pt-6 border-t border-gray-100">
                  <button @click="showConvocatoriaDialog = false"
                    class="px-6 py-2 text-red-500 hover:text-red-700 font-medium hover:bg-red-50 rounded-lg transition-colors mr-auto">
                    Cancelar
                  </button>
                  <button @click="step = editingConvocatoria ? 1 : 2"
                    class="px-6 py-2 text-gray-600 hover:text-gray-900 font-medium hover:bg-gray-100 rounded-lg transition-colors">
                    Atrás
                  </button>
                  <button @click="saveConvocatoria"
                    class="px-8 py-3 bg-green-600 text-white rounded-lg font-bold hover:bg-green-700 shadow-lg hover:shadow-green-500/30 transition-all flex items-center gap-2 transform active:scale-95">
                    <q-icon name="check_circle" size="20px" />
                    <span v-if="editingConvocatoria">Guardar Cambios</span>
                    <span v-else>Crear Convocatoria</span>
                  </button>
                </div>
              </div>
            </q-step>
          </q-stepper>
        </q-card-section>
      </q-card>
    </q-dialog>





    <!-- Dialog Ofertas (Maximized) - Gestión de vacantes para convocatorias existentes -->
    <q-dialog v-model="showOfertasDialog" maximized transition-show="slide-up" transition-hide="slide-down">
      <div class="bg-gray-50 min-h-screen flex flex-col">
        <!-- Header -->
        <div
          class="bg-white sticky top-0 z-10 border-b border-gray-200 px-6 py-4 flex justify-between items-center shadow-sm">
          <div class="flex items-center gap-4">
            <div class="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl">
              <q-icon name="work_history" size="24px" />
            </div>
            <div>
              <h2 class="text-xl font-bold text-gray-900 leading-tight">Gestionar Ofertas</h2>
              <p class="text-sm text-gray-500 font-medium">{{ selectedConvocatoria?.titulo }}</p>
            </div>
          </div>
          <button @click="showOfertasDialog = false"
            class="p-2 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-full transition-all hover:rotate-90">
            <q-icon name="close" size="20px" />
          </button>
        </div>

        <div class="flex-1 overflow-auto p-6 md:p-8">
          <div class="max-w-6xl mx-auto space-y-8">

            <!-- Constructor de Ofertas (Batch Add) -->
            <div class="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm relative overflow-hidden">
              <div class="absolute top-0 left-0 w-1 h-full bg-green-500"></div>
              <div class="flex items-center justify-between mb-6">
                <h3 class="text-lg font-bold text-gray-800 flex items-center gap-2">
                  <q-icon name="add_circle" class="text-green-500" />
                  Agregar Nuevas Vacantes
                </h3>
                <div class="text-xs font-bold text-gray-400 bg-gray-50 px-2 py-1 rounded uppercase tracking-wider">
                  Acción Rápida</div>
              </div>

              <div class="grid grid-cols-1 md:grid-cols-12 gap-6 items-end">
                <!-- Sede Selection -->
                <div class="md:col-span-4 space-y-1.5">
                  <label class="text-xs font-bold text-gray-500 uppercase ml-1">Sedes</label>
                  <div class="flex gap-2">
                    <q-select v-model="nuevaOferta.sedes_ids" :options="sedesOptions" label="Sedes" outlined dense bg-color="white"
                      emit-value map-options multiple use-chips stack-label class="flex-1" placeholder="Seleccione Sedes">
                      <template v-slot:no-option>
                        <q-item clickable @click="showQuickSede = true" class="text-blue-600 font-medium">
                          <q-item-section>+ Crear nueva sede</q-item-section>
                        </q-item>
                      </template>
                    </q-select>
                    <button @click="showQuickSede = true"
                      class="p-2 text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-lg border border-indigo-100 transition-colors">
                      <q-icon name="add" size="20px" />
                    </button>
                  </div>
                </div>

                <!-- Cargos Selection (Multi) -->
                <div class="md:col-span-5 space-y-1.5">
                  <label class="text-xs font-bold text-gray-500 uppercase ml-1">Cargos (Selección
                    Múltiple)</label>
                  <div class="flex gap-2">
                    <q-select v-model="nuevaOferta.cargos_ids" :options="cargosOptions" multiple use-chips stack-label
                      outlined dense bg-color="white" emit-value map-options class="flex-1"
                      placeholder="Seleccione Cargos">
                      <template v-slot:no-option>
                        <q-item clickable @click="showQuickCargo = true" class="text-blue-600 font-medium">
                          <q-item-section>+ Crear nuevo cargo</q-item-section>
                        </q-item>
                      </template>
                    </q-select>
                    <button @click="showQuickCargo = true"
                      class="p-2 text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-lg border border-indigo-100 transition-colors">
                      <q-icon name="add" size="20px" />
                    </button>
                  </div>
                </div>

                <!-- Vacantes y Botón -->
                <div class="md:col-span-3">
                  <div class="flex gap-3 h-full">
                    <div class="flex-none space-y-1.5 w-24">
                      <label class="text-xs font-bold text-gray-500 uppercase ml-1">Vacantes</label>
                      <q-input v-model="nuevaOferta.vacantes" type="number" outlined dense bg-color="white" min="1" />
                    </div>
                    <button @click="agregarOferta"
                      class="flex-1 bg-gray-900 hover:bg-black text-white rounded-xl font-bold text-sm transition-all transform active:scale-95 shadow-lg shadow-gray-200 flex items-center justify-center gap-2 mt-[22px]">
                      <q-icon name="playlist_add" size="18px" />
                      Agregar
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <!-- Listado de Ofertas Existentes -->
            <div class="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
              <div class="px-6 py-4 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
                <h4 class="font-bold text-gray-700">Ofertas Disponibles</h4>
                <span class="px-2.5 py-1 bg-white border border-gray-200 rounded-lg text-xs font-bold text-gray-500">
                  {{ ofertasConvocatoria.length }} Total
                </span>
              </div>

              <q-table :rows="ofertasConvocatoria" :columns="ofertasColumns" flat class="qt-clean"
                :pagination="{ rowsPerPage: 0 }">
                <template v-slot:body-cell-sede="props">
                  <q-td :props="props">
                    <div class="font-medium text-gray-900">{{ props.row.sede?.nombre }}</div>
                    <div class="text-xs text-gray-400">{{ props.row.sede?.ciudad }}</div>
                  </q-td>
                </template>
                <template v-slot:body-cell-cargo="props">
                  <q-td :props="props">
                    <div class="font-bold text-indigo-700">{{ props.row.cargo?.nombre }}</div>
                  </q-td>
                </template>
                <template v-slot:body-cell-vacantes="props">
                  <q-td :props="props" class="text-center">
                    <span
                      class="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-indigo-50 text-indigo-700 font-bold border border-indigo-100">
                      {{ props.row.vacantes }}
                    </span>
                  </q-td>
                </template>
                <template v-slot:body-cell-acciones="props">
                  <q-td :props="props" class="text-right">
                    <button @click="eliminarOferta(props.row)"
                      class="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                      title="Eliminar Oferta">
                      <q-icon name="delete_outline" size="20px" />
                    </button>
                  </q-td>
                </template>
              </q-table>
            </div>

          </div>
        </div>
      </div>
    </q-dialog>

    <!-- Dialog Expediente con Panel de Previsualización -->
    <q-dialog v-model="showExpedienteDialog" maximized transition-show="slide-up" transition-hide="slide-down">
      <div class="bg-gray-50 min-h-screen flex flex-col">
        <div
          class="bg-white border-b border-gray-200 px-8 py-4 flex justify-between items-center shadow-sm sticky top-0 z-50">
          <div class="flex items-center gap-4">
            <!-- Foto del postulante o inicial - Click para ampliar -->
            <q-avatar size="56px"
              class="shadow-md border-2 border-white cursor-pointer hover:ring-4 hover:ring-blue-200 transition-all"
              @click="selectedPostulante?.foto_perfil && (showPhotoDialog = true)">
              <img v-if="selectedPostulante?.foto_perfil" :src="getStorageUrl(selectedPostulante.foto_perfil)"
                @error="$event.target.src = ''">
              <div v-else
                class="w-full h-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-xl">
                {{ selectedPostulante?.nombres?.[0] || 'P' }}
              </div>
              <q-tooltip v-if="selectedPostulante?.foto_perfil">Click para ampliar foto</q-tooltip>
            </q-avatar>
            <div>
              <h2 class="text-lg font-bold text-gray-900">{{ selectedPostulante?.nombres }} {{
                selectedPostulante?.apellidos }}</h2>
              <p class="text-sm text-gray-500">Expediente Digital • CI: {{ selectedPostulante?.ci }}</p>
            </div>
          </div>
          <div class="flex items-center gap-2">
            <!-- Botón Descargar Expediente Completo -->
            <button @click="descargarExpedienteCompleto" :disabled="downloadingExpediente"
              class="px-4 py-2 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white rounded-lg font-bold text-sm transition-all shadow-md hover:shadow-lg flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed">
              <q-spinner v-if="downloadingExpediente" size="16px" color="white" />
              <q-icon v-else name="download" size="18px" />
              <span class="hidden sm:inline">Descargar Expediente</span>
            </button>
            <button @click="showExpedienteDialog = false" class="p-2 hover:bg-gray-100 rounded-full"><q-icon name="close"
                size="24px" /></button>
          </div>
        </div>

        <!-- Layout dividido: Datos a la izquierda, Preview a la derecha -->
        <div class="flex-1 flex overflow-hidden">
          <!-- Panel Izquierdo: Hoja de Vida Estructurada -->
          <!-- Panel Izquierdo: Hoja de Vida Estructurada (Estilo Exacto) -->
          <div id="expediente-visual" class="w-full md:w-1/2 overflow-y-auto p-4 md:p-8 border-r border-gray-200 bg-white font-serif" style="max-height: calc(100vh - 88px);">
            <div class="max-w-4xl mx-auto text-gray-800">

              <!-- HEADER -->
              <div class="text-center mb-8">
                <div class="font-bold text-2xl md:text-3xl text-black mb-1">UNITEPC</div>
                <div class="font-bold text-lg md:text-xl text-black mb-2 uppercase">Universidad Técnica Privada Cosmos</div>
                <div class="font-bold text-lg text-purple-900 uppercase">
                    {{
                      convocatorias.find(c => c.id === filtroConvocatoria)?.titulo ||
                      selectedPostulante?.postulaciones?.[0]?.oferta?.convocatoria?.titulo ||
                      'SELECCIÓN DOCENTE'
                    }}
                </div>
                <div class="bg-gray-50 flex justify-between items-end mt-6 px-4 py-2 border-t border-b border-gray-100">
                     <!-- Escudo Izquierda -->
                     <img :src="unitepcEscudo" class="w-20 md:w-24 h-auto object-contain" />

                     <!-- Foto+QR Derecha -->
                     <div class="flex items-center gap-3">
                        <div class="flex flex-col items-end gap-0.5">
                            <span class="font-bold text-[10px] md:text-xs text-black uppercase tracking-wider">Fotografía Personal:</span>
                            <a v-if="fotoDoc?.archivo_pdf"
                               @click="previewPDF(fotoDoc.archivo_pdf, 'Fotografía Personal')"
                               class="text-[10px] text-blue-600 underline cursor-pointer hover:text-blue-800 transition-colors">
                                Ver Documento
                            </a>
                            <span v-else class="text-[10px] text-gray-400 italic">No registrada</span>
                        </div>

                        <div class="bg-white p-1 border border-gray-200 shadow-sm shrink-0">
                            <qrcode-vue v-if="fotoDoc?.archivo_pdf" :value="getStorageUrl(fotoDoc.archivo_pdf)" :size="64" level="M" render-as="svg" />
                            <div v-else class="w-16 h-16 bg-gray-100 flex items-center justify-center text-gray-300">
                                <q-icon name="no_photography" size="24px" />
                            </div>
                        </div>
                     </div>
                </div>
              </div>

              <!-- I. DATOS PERSONALES -->
              <div class="mb-8">
                <h3 class="font-bold text-sm uppercase mb-1 ml-1 text-black">I. DATOS PERSONALES</h3>
                <table class="w-full border-collapse border border-purple-800 text-xs md:text-sm">
                  <tr>
                    <td class="border border-purple-800 p-1 px-2 font-bold text-purple-900 w-1/3">NOMBRE COMPLETO:</td>
                    <td class="border border-purple-800 p-2 font-bold text-purple-900 uppercase">
                      {{ selectedPostulante?.nombres }} {{ selectedPostulante?.apellidos }}
                    </td>
                  </tr>
                  <tr>
                    <td class="border border-purple-800 p-1 px-2 font-bold text-black text-xs">CARGO AL QUE POSTULA:</td>
                    <td class="border border-purple-800 p-2 text-black text-xs uppercase">
                        <!-- Filtrar postulaciones solo de esta convocatoria si hay filtro -->
                        <div v-if="selectedPostulante?.postulaciones?.length">
                            <span v-for="(p, i) in selectedPostulante.postulaciones.filter(pp => !filtroConvocatoria || pp.oferta?.convocatoria?.id === filtroConvocatoria || pp.oferta?.convocatoria_id === filtroConvocatoria)" :key="p.id">
                                {{ p.oferta?.cargo?.nombre }} <span class="text-gray-500 font-normal normal-case">({{ p.oferta?.sede?.nombre }})</span><span v-if="i < (selectedPostulante.postulaciones.length - 1)">, </span>
                            </span>
                        </div>
                        <span v-else class="italic text-gray-400">Sin postulación activa</span>
                    </td>
                  </tr>
                  <tr>
                    <td class="border border-purple-800 p-1 px-2 font-bold text-black text-xs">N° DE CÉDULA DE IDENTIDAD:</td>
                    <td class="border border-purple-800 p-2 text-black text-xs uppercase">
                        {{ selectedPostulante?.ci }} {{ selectedPostulante?.ci_expedido }}
                    </td>
                  </tr>
                  <tr>
                    <td class="border border-purple-800 p-1 px-2 font-bold text-black text-xs">CÉDULA DE IDENTIDAD:</td>
                    <td class="border border-purple-800 p-1 px-2">
                        <div class="flex items-center justify-between">
                             <a v-if="docsPorCategoria['personal']?.find(d => d.tipo_documento?.nombre?.toLowerCase().includes('cedula') || d.tipo_documento?.nombre?.toLowerCase().includes('ci'))"
                                @click="previewPDF(docsPorCategoria['personal'].find(d => d.tipo_documento?.nombre?.toLowerCase().includes('cedula') || d.tipo_documento?.nombre?.toLowerCase().includes('ci')).archivo_pdf, 'Cédula')"
                                class="text-blue-600 underline cursor-pointer text-xs">
                                Ver Documento Digital
                             </a>
                             <span v-else class="text-gray-400 italic text-xs">No adjuntado</span>
                             <q-icon name="qr_code_2" size="40px" />
                        </div>
                    </td>
                  </tr>
                  <tr>
                     <td class="border border-purple-800 p-1 px-2 font-bold text-black text-xs">NACIONALIDAD:</td>
                     <td class="border border-purple-800 p-2 text-black text-xs uppercase">{{ selectedPostulante?.nacionalidad || 'Boliviano' }}</td>
                  </tr>
                  <tr>
                     <td class="border border-purple-800 p-1 px-2 font-bold text-black text-xs">DIRECCIÓN DE DOMICILIO:</td>
                     <td class="border border-purple-800 p-2 text-black text-xs uppercase">{{ selectedPostulante?.direccion || '-' }}</td>
                  </tr>
                   <tr>
                     <td class="border border-purple-800 p-1 px-2 font-bold text-black text-xs">TELÉFONO / CELULAR:</td>
                     <td class="border border-purple-800 p-2 text-black text-xs">{{ selectedPostulante?.celular || '-' }}</td>
                  </tr>
                  <tr>
                     <td class="border border-purple-800 p-1 px-2 font-bold text-black text-xs">CORREO ELECTRÓNICO:</td>
                     <td class="border border-purple-800 p-2 text-black text-xs">{{ selectedPostulante?.email || '-' }}</td>
                  </tr>
                  <!-- Otros docs personales (Carta, CV, etc) EXCLUYENDO Cédula -->
                  <tr v-for="doc in docsPorCategoria['personal']?.filter(d =>
                        !d.tipo_documento?.nombre?.toLowerCase().includes('cedula') &&
                        !d.tipo_documento?.nombre?.toLowerCase().includes('ci')
                      )" :key="doc.id">
                     <td class="border border-purple-800 p-1 px-2 font-bold text-black text-xs uppercase">{{ doc.tipo_documento?.nombre }}:</td>
                     <td class="border border-purple-800 p-1 px-2">
                        <div class="flex items-center justify-between">
                             <a @click="previewPDF(doc.archivo_pdf, doc.tipo_documento?.nombre)" class="text-blue-600 underline cursor-pointer text-xs">
                                Ver Documento
                             </a>
                             <qrcode-vue v-if="doc.archivo_pdf" :value="getStorageUrl(doc.archivo_pdf)" :size="30" level="L" render-as="svg" />
                             <q-icon v-else name="qr_code_2" size="30px" color="grey-4" />
                        </div>
                     </td>
                  </tr>
                </table>
              </div>

              <!-- Dynamic Sections based on Convocatoria Requirements -->
              <div v-for="(section, index) in expedienteSections" :key="section.id" class="mb-8 font-serif">
                 <h3 class="font-bold text-sm uppercase mb-1 ml-1 text-black">
                    {{ toRoman(index + 2) }}. {{ section.titulo }}
                 </h3>
                 <div v-if="section.descripcion" class="text-[10px] text-gray-500 mb-2 ml-1 italic">
                    ({{ section.descripcion }})
                 </div>

                 <!-- Tabla Dinámica -->
                 <table class="w-full border-collapse border border-purple-800 text-xs text-center">
                    <thead>
                       <tr class="text-purple-900 font-bold">
                          <!-- Campos dinámicos -->
                          <th v-for="campo in section.campos" :key="campo.nombre" class="border border-purple-800 p-1 uppercase">
                             {{ campo.label }}
                          </th>
                          <!-- Campos fijos -->
                          <th class="border border-purple-800 p-1 uppercase">Evidencia</th>
                          <th class="border border-purple-800 p-1 uppercase">Visualización</th>
                       </tr>
                    </thead>
                    <tbody>
                       <!-- Filas de documentos subidos -->
                       <tr v-for="doc in section.uploads" :key="doc.id">
                          <td v-for="campo in section.campos" :key="campo.nombre" class="border border-purple-800 p-2 text-left">
                             {{ doc.metadatos?.[campo.nombre] || '-' }}
                          </td>
                          <td class="border border-purple-800 p-2">
                             <a v-if="doc.archivo_pdf" @click="previewPDF(doc.archivo_pdf, doc.tipo_documento?.nombre)" class="text-blue-600 underline cursor-pointer text-[10px] block break-all">
                                Ver Documento
                             </a>
                          </td>
                          <td class="border border-purple-800 p-1 flex justify-center items-center">
                             <qrcode-vue v-if="doc.archivo_pdf" :value="getStorageUrl(doc.archivo_pdf)" :size="36" level="L" render-as="svg" />
                             <q-icon v-else name="qr_code_2" size="36px" color="grey-4" />
                          </td>
                       </tr>
                       <tr v-if="section.uploads.length === 0 && (!section.legacy || section.legacy.length === 0)">
                          <td :colspan="section.campos.length + 2" class="border border-purple-800 p-2 text-gray-400 italic">
                             No se registraron documentos de este tipo.
                          </td>
                       </tr>
                       <!-- Filas Legacy (si aplica) -->
                       <template v-if="section.legacy && section.legacy.length > 0">
                          <tr class="bg-gray-50">
                             <td :colspan="section.campos.length + 2" class="border border-purple-800 p-1 text-[10px] font-bold text-left pl-2 text-purple-900 border-b-0">
                                REGISTROS ANTERIORES DEL EXPEDIENTE
                             </td>
                          </tr>
                          <tr v-for="item in section.legacy" :key="'leg-'+item.id">
                              <!-- Mapeo manual de campos legacy a campos dinámicos (Intentar match) -->
                              <td v-for="campo in section.campos" :key="'l-'+campo.nombre" class="border border-purple-800 p-2 text-left text-gray-600">
                                 <!-- Fallback simple: intentar adivinar por nombre de campo -->
                                 {{
                                    section.legacyType === 'formacion' ?
                                       (campo.nombre.includes('nivel') ? item.nivel :
                                        campo.nombre.includes('titulo') || campo.nombre.includes('profesion') ? item.titulo_profesion :
                                        campo.nombre.includes('universidad') ? item.universidad :
                                        campo.nombre.includes('fecha') || campo.nombre.includes('anio') ? item.anio_emision : '-')
                                    : section.legacyType === 'experiencia' ?
                                       (campo.nombre.includes('institucion') || campo.nombre.includes('empresa') ? item.empresa_institucion :
                                        campo.nombre.includes('cargo') ? item.cargo_desempenado :
                                        campo.nombre.includes('inicio') ? item.anio_inicio :
                                        campo.nombre.includes('fin') || campo.nombre.includes('conclusion') ? item.anio_fin : '-')
                                    : '-'
                                 }}
                              </td>
                              <td class="border border-purple-800 p-2">
                                <a v-if="item.archivo_pdf" @click="previewPDF(item.archivo_pdf, 'Documento')" class="text-blue-600 underline cursor-pointer text-[10px]">Ver PDF</a>
                              </td>
                              <td class="border border-purple-800 p-1 flex justify-center items-center">
                                <qrcode-vue v-if="item.archivo_pdf" :value="getStorageUrl(item.archivo_pdf)" :size="36" level="L" render-as="svg" />
                                <q-icon v-else name="qr_code_2" size="36px" color="grey-4" />
                              </td>
                          </tr>
                       </template>
                    </tbody>
                 </table>
              </div>

               <div class="mt-8 pt-4 border-t border-purple-200 text-center text-[10px] text-gray-400">
                  <p>Documento Generado Digitalmente por el Sistema de Convocatorias UNITEPC</p>
                  <p>{{ new Date().toLocaleDateString() }}</p>
               </div>

            </div>
          </div>

          <!-- Panel Derecho: Previsualización de PDF -->
          <div class="w-1/2 bg-gray-100 flex flex-col">
            <div v-if="!previewPdfUrl" class="flex-1 flex flex-col items-center justify-center text-gray-400">
              <q-icon name="description" size="80px" class="mb-4 opacity-30" />
              <p class="text-lg font-medium">Seleccione un documento</p>
              <p class="text-sm">Haga clic en el icono PDF para previsualizarlo aquí</p>
            </div>
            <div v-else class="flex-1 flex flex-col">
              <div class="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
                <div class="flex items-center gap-2">
                  <q-icon name="picture_as_pdf" class="text-red-500" size="20px" />
                  <span class="font-medium text-gray-700 text-sm">{{ previewPdfName }}</span>
                </div>
                <div class="flex gap-1">
                  <q-btn flat dense round icon="open_in_new" size="sm" @click="abrirPDF(currentPdfPath)">
                    <q-tooltip>Abrir en nueva pestaña</q-tooltip>
                  </q-btn>
                  <q-btn flat dense round icon="close" size="sm" @click="closePreview">
                    <q-tooltip>Cerrar preview</q-tooltip>
                  </q-btn>
                </div>
              </div>
              <iframe :src="previewPdfUrl" class="flex-1 w-full bg-white" />
            </div>
          </div>
        </div>
      </div>
    </q-dialog>

    <!-- Diálogo Compartir Portal General -->
    <q-dialog v-model="showShareDialog">
      <q-card class="rounded-2xl overflow-hidden" style="width: 450px; max-width: 90vw;">
        <div class="bg-gray-900 p-6 text-white flex justify-between items-center">
          <div>
            <div class="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Acceso Público</div>
            <div class="text-xl font-bold">Portal de Convocatorias</div>
          </div>
          <q-btn icon="close" flat round dense v-close-popup />
        </div>

        <q-card-section class="q-pa-xl text-center">
          <div class="bg-gray-50 p-4 rounded-2xl inline-block border border-gray-100 shadow-inner mb-6">
            <img :src="qrCodeUrl" alt="QR Link Portal" class="block w-64 h-64 mix-blend-multiply" />
          </div>

          <div class="text-gray-500 text-sm mb-6 leading-relaxed">
            Escanee este código QR para acceder directamente al listado de convocatorias vigentes.
          </div>

          <div class="flex gap-2">
            <q-input v-model="publicLink" readonly filled dense class="flex-1 bg-gray-50 font-mono text-xs" />
            <q-btn color="primary" icon="content_copy" label="Copiar" @click="copyPortalLink" no-caps
              class="rounded-lg" />
          </div>
        </q-card-section>
      </q-card>
    </q-dialog>

    <!-- Dialog Foto Ampliada del Postulante -->
    <q-dialog v-model="showPhotoDialog" class="photo-preview-dialog">
      <q-card class="bg-white rounded-2xl overflow-hidden" style="max-width: 500px;">
        <q-card-section class="bg-gradient-to-r from-purple-600 to-indigo-600 text-white py-3 px-4">
          <div class="flex justify-between items-center">
            <div class="flex items-center gap-2">
              <q-icon name="photo_camera" size="20px" />
              <span class="font-bold">Foto del Postulante</span>
            </div>
            <q-btn flat dense round icon="close" color="white" @click="showPhotoDialog = false" />
          </div>
        </q-card-section>
        <q-card-section class="flex flex-col items-center p-6 bg-gray-50">
          <div class="w-72 h-72 rounded-2xl overflow-hidden shadow-xl border-4 border-white">
            <img v-if="selectedPostulante?.foto_perfil" :src="getStorageUrl(selectedPostulante.foto_perfil)"
              class="w-full h-full object-cover" @error="$event.target.src = ''">
          </div>
          <div class="mt-4 text-center">
            <div class="font-bold text-lg text-gray-800">{{ selectedPostulante?.nombres }} {{
              selectedPostulante?.apellidos }}</div>
            <div class="text-sm text-gray-500">CI: {{ selectedPostulante?.ci }}</div>
          </div>
        </q-card-section>
      </q-card>
    </q-dialog>

    <!-- Dialog Quick Create Sede -->
    <q-dialog v-model="showQuickSede" persistent>
      <q-card style="width: 400px; border-radius: 16px;">
        <q-card-section class="bg-indigo-600 text-white flex justify-between items-center">
          <div class="text-h6">Crear Nueva Sede</div>
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>
        <q-card-section class="q-pa-md space-y-4">
          <q-input v-model="quickSedeForm.nombre" label="Nombre de la Sede" outlined dense autofocus
            placeholder="Ej. Cochabamba - Central" />
          <q-input v-model="quickSedeForm.direccion" label="Dirección / Ubicación" outlined dense type="textarea"
            rows="2" />
        </q-card-section>
        <q-card-actions align="right" class="q-pa-md bg-gray-50">
          <q-btn flat label="Cancelar" color="gray" v-close-popup />
          <q-btn label="Guardar Sede" color="indigo" :loading="saving" @click="saveQuickSede" unelevated
            class="rounded-lg" />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- Dialog Quick Create Cargo -->
    <q-dialog v-model="showQuickCargo" persistent>
      <q-card style="width: 400px; border-radius: 16px;">
        <q-card-section class="bg-indigo-600 text-white flex justify-between items-center">
          <div class="text-h6">Crear Nuevo Cargo</div>
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>
        <q-card-section class="q-pa-md space-y-4">
          <q-input v-model="quickCargoForm.nombre" label="Nombre del Cargo" outlined dense autofocus
            placeholder="Ej. Analista de Sistemas" />
          <q-input v-model="quickCargoForm.descripcion" label="Descripción del Cargo" outlined dense type="textarea"
            rows="2" />
        </q-card-section>
        <q-card-actions align="right" class="q-pa-md bg-gray-50">
          <q-btn flat label="Cancelar" color="gray" v-close-popup />
          <q-btn label="Guardar Cargo" color="indigo" :loading="saving" @click="saveQuickCargo" unelevated
            class="rounded-lg" />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- Dialog Afiche Generado -->
    <q-dialog v-model="showAficheDialog">
      <q-card style="min-width: 600px; overflow: hidden; border-radius: 8px;">
        <q-card-section class="row items-center q-pb-none bg-gray-50 border-b border-gray-100">
          <div class="text-h6 text-gray-800">Afiche Generado</div>
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>

        <q-card-section class="q-pa-md flex justify-center bg-gray-100 scroll" style="max-height: 80vh;">
           <!-- CONTENIDO DEL AFICHE (Canvas Target) -->
           <div class="transform-gpu flex-shrink-0 shadow-2xl overflow-hidden"
                style="transform: scale(0.85); transform-origin: top center;">
              <div id="afiche-content" class="bg-white relative shadow-lg flex-shrink-0 flex flex-col" style="width: 595px; height: 842px; overflow: hidden;">
              <!-- Texture Background -->
              <div class="absolute inset-0 opacity-10 pointer-events-none"
                   style="background-image: repeating-linear-gradient(45deg, #4f46e5 25%, transparent 25%, transparent 75%, #4f46e5 75%, #4f46e5), repeating-linear-gradient(45deg, #4f46e5 25%, #f0f0ff 25%, #f0f0ff 75%, #4f46e5 75%, #4f46e5); background-position: 0 0, 10px 10px; background-size: 20px 20px;"></div>

              <!-- Header with UNITEPC Logo -->
              <div class="h-28 bg-white relative flex flex-col items-center justify-center pt-6 z-10">
                  <div class="flex items-baseline gap-0 mb-1">
                      <span class="text-5xl font-black tracking-tight" style="color: #502f80; font-family: Arial Black, sans-serif;">UNI</span>
                      <span class="text-5xl font-black tracking-tight" style="color: #009587; font-family: Arial Black, sans-serif;">TEPC</span>
                  </div>
                  <div class="text-[10px] font-bold uppercase tracking-[0.3em] mt-1" style="color: #009587;">
                      UNIVERSIDAD PRIVADA
                  </div>
              </div>

              <!-- Title Section -->
              <div class="relative py-2 flex flex-col justify-center items-center z-10 w-full mb-2">
                  <h2 class="text-2xl font-bold uppercase tracking-[0.2em] mb-1" style="color: #502f80;">CONVOCATORIA</h2>
                  <div class="bg-[#502f80] text-white px-8 py-2 rounded-full font-black text-xl shadow-xl relative z-10 uppercase tracking-wide border-4 border-white text-center max-w-[90%] break-all leading-tight">
                    {{ aficheConvocatoria?.titulo || 'DIRECCIÓN DE CARRERA' }}
                  </div>
              </div>

              <div class="px-8 py-2 text-gray-800 text-sm leading-relaxed relative z-10 flex-1 flex flex-col overflow-hidden">

                  <!-- Descripción (Se encoge para dar espacio al perfil) -->
                  <div class="mb-3 text-center text-gray-700 font-medium text-xs px-2 leading-tight text-justify overflow-hidden shrink min-h-0 flex flex-col justify-center">
                    <div class="break-all whitespace-pre-wrap line-clamp-[12]">
                        {{ aficheConvocatoria?.descripcion || convocatoriaForm.descripcion || 'La Universidad Técnica Privada Cosmos invita a profesionales a postularse a esta convocatoria.' }}
                    </div>
                  </div>

                  <!-- Perfil y Experiencia (Fijos, no se encogen) -->
                  <div class="space-y-3 text-left shrink-0">
                    <div v-if="aficheConvocatoria?.perfil_profesional || convocatoriaForm.perfil_profesional" class="relative">
                        <h3 class="font-black mb-1 uppercase text-[10px] tracking-widest flex items-center gap-2" style="color: #502f80;">
                          <q-icon name="school" size="14px" style="color: #009587;" /> Perfil Profesional
                        </h3>
                        <div class="pl-3 text-gray-700 text-[10px] border-l-4 py-1 break-all whitespace-pre-wrap line-clamp-6" style="border-color: #502f80;">
                          {{ aficheConvocatoria?.perfil_profesional || convocatoriaForm.perfil_profesional }}
                        </div>
                    </div>

                    <div v-if="aficheConvocatoria?.experiencia_requerida || convocatoriaForm.experiencia_requerida" class="relative">
                        <h3 class="font-black mb-1 uppercase text-[10px] tracking-widest flex items-center gap-2" style="color: #502f80;">
                          <q-icon name="work_history" size="14px" style="color: #009587;" /> Experiencia
                        </h3>
                        <div class="pl-3 text-gray-700 text-[10px] border-l-4 py-1 break-all whitespace-pre-wrap line-clamp-6" style="border-color: #009587;">
                          {{ aficheConvocatoria?.experiencia_requerida || convocatoriaForm.experiencia_requerida }}
                        </div>
                    </div>
                  </div>
              </div>

              <!-- Bottom / Footer -->
              <div class="w-full h-[220px] relative shrink-0 mt-auto">
                  <!-- Footer Background Gradient -->
                  <div class="absolute bottom-0 w-full h-full bg-gradient-to-t from-[#502f80] via-[#502f80]/95 to-transparent"></div>

                  <div class="absolute bottom-0 w-full flex items-end justify-between px-8 pb-6 z-20">

                      <!-- Left: Fecha Límite -->
                      <div class="mb-1 text-white">
                         <div class="flex items-center gap-3 mb-2">
                            <div class="bg-white/10 p-2 rounded-lg backdrop-blur-md border border-white/20">
                              <q-icon name="event" size="24px" class="text-white" />
                            </div>
                            <div>
                              <div class="text-[9px] font-bold uppercase tracking-widest opacity-80 mb-0.5">Fecha Límite</div>
                              <div class="text-2xl font-black text-white leading-none tracking-tight">
                                  {{ aficheConvocatoria?.fecha_cierre ? new Date(String(aficheConvocatoria.fecha_cierre).substring(0,10) + 'T12:00:00').toLocaleDateString('es-BO', { day: 'numeric', month: 'long', year: 'numeric' }) : '-' }}
                              </div>
                            </div>
                         </div>
                         <div v-if="aficheConvocatoria?.hora_limite" class="flex items-center gap-2 text-xs font-bold bg-[#009587] px-3 py-1.5 rounded-full w-max text-white shadow-lg">
                            <q-icon name="schedule" size="14px" />
                            Hasta las {{ aficheConvocatoria.hora_limite.substring(0,5) }} hrs.
                         </div>
                      </div>

                      <!-- Right: QR and CTA -->
                      <div class="flex flex-col items-center bg-white p-2.5 rounded-xl shadow-2xl relative border-4 transform translate-y-2" style="border-color: #009587;">
                          <div class="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#009587] text-white text-[8px] font-black px-2 py-0.5 rounded-full uppercase tracking-widest">Escanea</div>

                          <qrcode-vue :value="aficheConvocatoria?.url_postulacion || 'https://unitepc.edu.bo'" :size="110" level="H" foreground="#502f80" />

                          <div class="mt-1.5 text-center w-full pt-1.5 border-t border-gray-100">
                              <div class="text-base font-black leading-none tracking-tight" style="color: #502f80;">POSTÚLATE</div>
                          </div>
                      </div>
                  </div>
              </div>
           </div>
           </div>
        </q-card-section>

        <q-card-actions align="right" class="q-pa-md bg-white border-t border-gray-100">
          <q-btn flat label="Cerrar" color="grey-7" v-close-popup />
          <q-btn icon="download" label="Descargar Imagen" color="primary" @click="downloadAfiche" unelevated class="rounded-lg px-4 font-bold" />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <TiposDocumentoManager
      v-if="showQuickTipoDocumento"
      modo-compacto
      @tipo-creado="onTipoDocumentoCreado"
      @cancelar="showQuickTipoDocumento = false"
    />

    <!-- HIDDEN RENDER TARGET (Full HD 1080x1350) for Image Generation -->
    <div id="afiche-render-target" class="bg-white flex flex-col" style="position: fixed; left: 0; top: 0; width: 1080px; height: 1350px; z-index: -100; overflow: hidden;">
         <!-- Header -->
              <div class="h-36 bg-white relative w-full flex flex-col items-center justify-center pt-4 z-10 shrink-0 text-center">
                  <div class="flex items-center justify-center gap-0 mb-0 w-full">
                      <span class="text-6xl font-black tracking-tight" style="color: #502f80; font-family: Arial Black, sans-serif;">UNI</span>
                      <span class="text-6xl font-black tracking-tight" style="color: #009587; font-family: Arial Black, sans-serif;">TEPC</span>
                  </div>
                  <div class="text-sm font-bold uppercase tracking-[0.3em] mt-1" style="color: #009587;">
                      UNIVERSIDAD PRIVADA
                  </div>
              </div>

              <!-- Title -->
              <div class="relative py-4 flex flex-col justify-center items-center z-10 w-full mb-3 shrink-0">
                  <h2 class="text-3xl font-bold uppercase tracking-[0.2em] mb-2" style="color: #502f80;">CONVOCATORIA</h2>
                  <div class="bg-[#502f80] text-white px-10 py-3 rounded-full font-black text-2xl shadow-xl relative z-10 uppercase tracking-wide border-4 border-white text-center max-w-[90%] break-all leading-tight">
                    {{ aficheConvocatoria?.titulo || 'CONVOCATORIA' }}
                  </div>
              </div>

              <!-- Content -->
              <div class="px-12 py-4 text-gray-800 leading-relaxed relative z-10 flex-1 flex flex-col overflow-hidden w-full">
                  <div class="w-full mb-6 text-center text-gray-700 font-medium px-4 leading-relaxed text-justify text-2xl break-all whitespace-pre-wrap max-h-[250px] overflow-hidden text-ellipsis shrink">
                    {{ aficheConvocatoria?.descripcion || 'La Universidad Técnica Privada Cosmos invita a profesionales a postularse a esta convocatoria.' }}
                  </div>

                  <div class="w-full space-y-8 text-left shrink-0">
                    <div v-if="aficheConvocatoria?.perfil_profesional">
                        <h3 class="font-black mb-2 uppercase text-xl tracking-widest flex items-center gap-3" style="color: #502f80;">
                          <q-icon name="school" size="32px" style="color: #009587;" /> Perfil Profesional
                        </h3>
                        <div class="pl-6 text-gray-700 text-xl border-l-8 py-2 break-all whitespace-pre-wrap max-h-[220px] overflow-hidden" style="border-color: #502f80;">
                          {{ aficheConvocatoria?.perfil_profesional }}
                        </div>
                    </div>

                    <div v-if="aficheConvocatoria?.experiencia_requerida">
                        <h3 class="font-black mb-2 uppercase text-xl tracking-widest flex items-center gap-3" style="color: #502f80;">
                          <q-icon name="work_history" size="32px" style="color: #009587;" /> Experiencia
                        </h3>
                        <div class="pl-6 text-gray-700 text-xl border-l-8 py-2 break-all whitespace-pre-wrap max-h-[220px] overflow-hidden" style="border-color: #009587;">
                          {{ aficheConvocatoria?.experiencia_requerida }}
                        </div>
                    </div>
                  </div>
              </div>

              <!-- Footer -->
              <div class="w-full h-[320px] relative shrink-0 mt-auto">
                  <div class="absolute bottom-0 w-full h-full bg-gradient-to-t from-[#502f80] via-[#502f80]/95 to-transparent"></div>

                  <div class="absolute bottom-0 w-full flex items-end justify-between px-16 pb-12 z-20">
                      <div class="mb-2 text-white">
                         <div class="flex items-center gap-4 mb-4">
                            <div class="bg-white/10 p-4 rounded-xl backdrop-blur-md border border-white/20">
                              <q-icon name="event" size="40px" class="text-white" />
                            </div>
                            <div>
                              <div class="text-sm font-bold uppercase tracking-widest opacity-80 mb-1">Fecha Límite</div>
                              <div class="text-4xl font-black text-white leading-none tracking-tight">
                                  {{ aficheConvocatoria?.fecha_cierre ? new Date(String(aficheConvocatoria.fecha_cierre).substring(0,10) + 'T12:00:00').toLocaleDateString('es-BO', { day: 'numeric', month: 'long', year: 'numeric' }) : '-' }}
                              </div>
                            </div>
                         </div>
                         <div v-if="aficheConvocatoria?.hora_limite" class="flex items-center gap-3 text-lg font-bold bg-[#009587] px-6 py-3 rounded-full w-max text-white shadow-lg">
                            <q-icon name="schedule" size="24px" />
                            Hasta las {{ aficheConvocatoria.hora_limite.substring(0,5) }} hrs.
                         </div>
                      </div>

                      <div class="flex flex-col items-center bg-white p-5 rounded-2xl shadow-2xl relative border-4 transform translate-y-2" style="border-color: #009587;">
                          <div class="absolute -top-4 left-1/2 -translate-x-1/2 bg-[#009587] text-white text-xs font-black px-3 py-1 rounded-full uppercase tracking-widest">Escanea</div>
                          <qrcode-vue :value="aficheConvocatoria?.url_postulacion || 'https://unitepc.edu.bo'" :size="160" level="H" foreground="#502f80" />
                          <div class="mt-3 text-center w-full pt-2 border-t border-gray-100">
                              <div class="text-2xl font-black leading-none tracking-tight" style="color: #502f80;">POSTÚLATE</div>
                          </div>
                      </div>
                  </div>
              </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useQuasar } from 'quasar'
import { api } from 'boot/axios'
import { useAuthStore } from 'stores/auth-store'

import AdminHomeComp from './admin/AdminHomeComp.vue'
import AdminSedes from './admin/AdminSedes.vue'
import AdminCargos from './admin/AdminCargos.vue'

import AdminUsuarios from './admin/AdminUsuarios.vue'
import AdminRoles from './admin/AdminRoles.vue'
import TiposDocumentoManager from './admin/TiposDocumentoManager.vue'
import ReportsDashboard from './admin/ReportsDashboard.vue'
import ConvocatoriasPostulantes from './admin/ConvocatoriasPostulantes.vue'
import jsPDF from 'jspdf'

const $q = useQuasar()
const route = useRoute()
// Imports
import QrcodeVue from 'qrcode.vue'
import html2canvas from 'html2canvas'
import unitepcEscudo from 'src/assets/unitepc_escudo.png'

const router = useRouter()
const authStore = useAuthStore()

// Lógica de Tabs manejada por URL
const activeTab = computed({
  get: () => route.query.section || 'dashboard',
  set: (val) => router.push({ query: { ...route.query, section: val } })
})

const currentSectionTitle = computed(() => {
  const map = {
    dashboard: 'Panel de Control',
    convocatorias: 'Convocatorias',
    'gestion-convocatorias': 'Gestión de Convocatorias',
    sedes: 'Sedes y Ubicaciones',
    cargos: 'Catálogo de Cargos',

    postulaciones: 'Gestión de Postulaciones',
    usuarios: 'Gestión de Usuarios',
    roles: 'Gestión de Roles',
    documentos: 'Tipos de Documento',
    reportes: 'Reportes y Estadísticas'
  }
  return map[activeTab.value] || 'Administración'
})

// Estado
const loading = ref(false)
const saving = ref(false)
const isAuthenticated = computed(() => authStore.isLoggedIn)
const showAficheDialog = ref(false)
const aficheConvocatoria = ref(null)

const stats = ref({ convocatorias_activas: 0, total_postulaciones: 0, pendientes: 0, postulantes: 0 })
const convocatorias = ref([])
const sedes = ref([])
const cargos = ref([])
const postulaciones = ref([])
const tiposDocumento = ref([])

// Columnas legacy eliminadas (ya no se usan q-table)

// Dialogs
const showConvocatoriaDialog = ref(false)
const showOfertasDialog = ref(false)
const showExpedienteDialog = ref(false)
const showShareDialog = ref(false)
const showPhotoDialog = ref(false)
const downloadingExpediente = ref(false)
const qrCodeUrl = ref('')
const publicLink = ref('')

// Forms
const convocatoriaForm = ref({
  titulo: '',
  descripcion: '',
  perfil_profesional: '',
  experiencia_requerida: '',
  fecha_inicio: '',
  fecha_cierre: '',
  hora_limite: '23:59',
  estado: 'borrador',
  ofertas: [],
  documentos: []
})
// Construcción dinámica de secciones basada estricta y únicamente en los Tipos de Documento solicitados
const showQuickTipoDocumento = ref(false)

const filteredTiposDocumento = computed(() => {
  return [...tiposDocumento.value]
    .sort((a, b) => (a.orden || 0) - (b.orden || 0))
})

// Restaurado para compatibilidad con sección "Datos Personales"
const docsPorCategoria = computed(() => {
  if (!selectedPostulante.value?.documentos) return {}
  return selectedPostulante.value.documentos.reduce((acc, doc) => {
    const cat = doc.tipo_documento?.categoria || 'otros'
    if (!acc[cat]) acc[cat] = []
    acc[cat].push(doc)
    return acc
  }, {})
})

const expedienteSections = computed(() => {
  // 1. Obtener la definición de documentos requeridos (Contexto Convocatoria)
  let requeridos = []

  // Determinar ID de convocatoria: Directo del filtro o inferido del postulante
  let convId = filtroConvocatoria.value
  if (!convId && selectedPostulante.value?.postulaciones?.length > 0) {
      // Usar la convocatoria de la primera postulación encontrada
      convId = selectedPostulante.value.postulaciones[0].oferta?.convocatoria_id || selectedPostulante.value.postulaciones[0].oferta?.convocatoria?.id
  }

  // Buscar la convocatoria en la lista cargada (si existe)
  if (convId) {
     const conv = convocatorias.value.find(c => c.id === convId)
     // Flexibilidad con la propiedad de documentos (backend puede devolver variaciones)
     const docs = conv?.documentos || conv?.documentos_requeridos || conv?.documentosRequeridos
     // Solo usar si tiene documentos definidos
     if (docs && docs.length > 0) {
        requeridos = docs
     }
  }

  // 2. FALLBACK ROBUSTO: Si no se encontraron requisitos específicos, usar TODOS los tipos de documento definidos en el sistema.
  // Esto asegura que siempre se muestren las secciones estándar (Académica, Experiencia, etc.) para pintar la data.
  if (requeridos.length === 0 && tiposDocumento.value && tiposDocumento.value.length > 0) {
      requeridos = tiposDocumento.value
  }

  // 3. Fallback final: construir "tipos" basados en lo que el postulante tiene subido (si todo lo demás falla)
  if (requeridos.length === 0 && selectedPostulante.value?.documentos) {
     const map = new Map()
     selectedPostulante.value.documentos.forEach(d => {
        if (d.tipo_documento && !map.has(d.tipo_documento.id)) {
           map.set(d.tipo_documento.id, d.tipo_documento)
        }
     })
     requeridos = Array.from(map.values())
  }

  // Ordenar por campo 'orden'
  requeridos.sort((a, b) => (a.orden || 0) - (b.orden || 0))

  // FILTRAR: Excluir documentos personales (ya mostrados en sección I)
  requeridos = requeridos.filter(r => r.categoria !== 'personal')

  // 2. Construir la estructura de secciones
  return requeridos.map((tipo) => {
     // Parsear campos si es string
     let campos = []
     try {
       campos = typeof tipo.campos === 'string' ? JSON.parse(tipo.campos) : (tipo.campos || [])
     } catch { campos = [] }

     // Obtener uploads del postulante para este tipo
     const uploads = selectedPostulante.value?.documentos?.filter(d => d.tipo_documento_id === tipo.id) || []

     // Determinar si corresponde mostrar legacy data
     // Determinar si corresponde mostrar legacy data
     // Heurística simple por categoría o nombre
     let legacyData = []
     let legacyType = '' // 'formacion', 'experiencia'

     const nombreTipoNormalizado = tipo.nombre.toUpperCase();

     // Logica FORMACION (legacy)
     if (tipo.categoria === 'academico' || nombreTipoNormalizado.includes('ACADÉMICA') || nombreTipoNormalizado.includes('ACADEMICA')) {
        // Solo adjuntar si ES formación académica y NO posgrado (generalmente)
        // O si el backend lo marca categoria 'academico' y NO es posgrado explicitamente en nombre
        const esPosgrado = nombreTipoNormalizado.includes('POSGRADO') || nombreTipoNormalizado.includes('MAESTRÍA') || nombreTipoNormalizado.includes('DOCTORADO');

        if (!esPosgrado) {
             legacyData = selectedPostulante.value?.formaciones || []
             legacyType = 'formacion'
        }
     }

     // Logica EXPERIENCIA (legacy)
     else if (tipo.categoria === 'laboral' || nombreTipoNormalizado.includes('EXPERIENCIA')) {
        // Incluir experiencia laboral y docencia universitaria
        if (nombreTipoNormalizado.includes('LABORAL') || nombreTipoNormalizado.includes('PROFESIONAL') || nombreTipoNormalizado.includes('DOCENCIA')) {
             legacyData = selectedPostulante.value?.experiencias || []
             legacyType = 'experiencia'
        }
     }

     return {
        id: tipo.id,
        titulo: tipo.nombre,
        descripcion: tipo.descripcion,
        campos: campos,
        uploads: uploads,
        legacy: legacyData,
        legacyType: legacyType
     }
  })
})

const fotoDoc = computed(() => {
  // Buscar en documentos genéricos
  const doc = selectedPostulante.value?.documentos?.find(d =>
    d?.tipo_documento?.nombre?.toLowerCase().includes('foto') ||
    d?.tipo_documento?.nombre?.toLowerCase().includes('fotografía')
  )
  if (doc) return doc

  // Fallback: Verificar columna 'foto_perfil' directa
  if (selectedPostulante.value?.foto_perfil) {
      // Retornar objeto simulado con la ruta
      return { archivo_pdf: selectedPostulante.value.foto_perfil }
  }

  return null
})

// getCampoLabel eliminado
const nuevaOferta = ref({ sedes_ids: [], cargos_ids: [], vacantes: 1 }) // vacantes es para el batch add
const tempOferta = ref({ sedes_ids: [], cargos_ids: [], vacantes_map: {} }) // vacantes_map para el stepper

const step = ref(1)

// Persistencia del formulario
const STORAGE_KEY = 'convocatoria_form_draft'

watch(convocatoriaForm, (newVal) => {
  // Solo persistir si no estamos editando una existente
  if (!editingConvocatoria.value) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newVal))
  }
}, { deep: true })

const onTipoDocumentoCreado = async () => {
  showQuickTipoDocumento.value = false
  await loadData() // Recargar todos los tipos
  $q.notify({ type: 'positive', message: 'Nuevo tipo de documento disponible' })
}

const isAdmin = computed(() => {
  const rol = authStore.currentUser?.rol?.nombre?.toLowerCase() || ''
  return rol === 'administrador' || rol === 'super admin'
})

// Inicializar mapa de vacantes cuando cambian los cargos seleccionados
watch(() => tempOferta.value.cargos_ids, (newVal) => {
  const newMap = { ...tempOferta.value.vacantes_map }
  newVal.forEach(id => {
    if (!newMap[id]) newMap[id] = 1 // Default to 1 if not set
  })
  // Remove entries for deselected cargos
  for (const key in newMap) {
    if (!newVal.includes(Number(key))) {
      delete newMap[key]
    }
  }
  tempOferta.value.vacantes_map = newMap
}, { deep: true })

watch(() => nuevaOferta.value.cargos_ids, (newVal) => {
  const newMap = { ...nuevaOferta.value.vacantes_map }
  newVal.forEach(id => {
    if (!newMap[id]) newMap[id] = 1
  })
  nuevaOferta.value.vacantes_map = newMap
}, { deep: true })

// Editing states
const editingConvocatoria = ref(null)
const selectedConvocatoria = ref(null)
const selectedPostulante = ref(null)
const ofertasConvocatoria = ref([])

// Quick Create Forms (Used in Stepper)
const showQuickSede = ref(false)
const showQuickCargo = ref(false)
const quickSedeForm = ref({ nombre: '', direccion: '' })
const quickCargoForm = ref({ nombre: '', descripcion: '' })

const saveQuickSede = async () => {
  try {
    saving.value = true
    const { data } = await api.post('/admin/sedes', quickSedeForm.value)
    const createdSede = data.sede
    sedes.value.push(createdSede)
    tempOferta.value.sede_id = createdSede.id // Auto-select
    nuevaOferta.value.sede_id = createdSede.id // Auto-select for batch add dialog too
    showQuickSede.value = false
    quickSedeForm.value = { nombre: '', direccion: '' }
    $q.notify({ type: 'positive', message: 'Sede creada exitosamente' })
  } catch {
    $q.notify({ type: 'negative', message: 'Error al crear sede' })
  } finally {
    saving.value = false
  }
}

const saveQuickCargo = async () => {
  try {
    saving.value = true
    const { data } = await api.post('/admin/cargos', quickCargoForm.value)
    const createdCargo = data.cargo
    cargos.value.push(createdCargo)
    // Para multiselect, agregamos el ID
    if (!tempOferta.value.cargos_ids.includes(createdCargo.id)) {
      tempOferta.value.cargos_ids.push(createdCargo.id)
    }
    if (!nuevaOferta.value.cargos_ids.includes(createdCargo.id)) {
      nuevaOferta.value.cargos_ids.push(createdCargo.id)
    }
    showQuickCargo.value = false
    quickCargoForm.value = { nombre: '', descripcion: '' }
    $q.notify({ type: 'positive', message: 'Cargo creado exitosamente' })
  } catch {
    $q.notify({ type: 'negative', message: 'Error al crear cargo' })
  } finally {
    saving.value = false
  }
}


// ==========================================
// LÓGICA DE CONVOCATORIAS (CRUD + STEPPER)
// ==========================================












// Lógica del Stepper (Ofertas)






// Filtros Postulaciones
const filtroConvocatoria = ref(null)
const filtroSede = ref(null)
const filtroCargo = ref(null)
const loadingPostulaciones = ref(false)

// Columnas (Simplificadas para brevedad en script, se usan en template)
const convocatoriasColumns = [
  { name: 'titulo', label: 'Convocatoria', field: 'titulo', align: 'left', sortable: true },
  { name: 'fecha_inicio', label: 'Inicio', field: 'fecha_inicio', align: 'center', format: val => val ? val.split('T')[0].split('-').reverse().join('/') : '-' },
  { name: 'fecha_cierre', label: 'Cierre', field: 'fecha_cierre', align: 'center', format: val => val ? val.split('T')[0].split('-').reverse().join('/') : '-' },
  { name: 'estado', label: 'Estado', field: 'estado', align: 'center' },
  { name: 'ofertas_count', label: 'Ofertas', field: 'ofertas_count', align: 'center' },
  { name: 'acciones', label: '', field: 'acciones', align: 'center' },
]



const postulacionesColumns = [
  { name: 'postulante', label: 'Datos Postulante', field: 'postulante', align: 'left' },
  { name: 'convocatoria', label: 'Convocatoria', field: row => row.oferta?.convocatoria?.titulo, align: 'left' },
  { name: 'sede', label: 'Sede', field: row => row.oferta?.sede?.nombre, align: 'left' },
  { name: 'oferta', label: 'Cargo', field: row => row.oferta?.cargo?.nombre, align: 'left' },
  { name: 'fecha', label: 'Fecha', field: row => row.created_at?.split('T')[0], align: 'center' },
  { name: 'estado', label: 'Estado', field: 'estado', align: 'center' },
  { name: 'acciones', label: '', field: 'acciones', align: 'center' },
]

const ofertasColumns = [
  { name: 'sede', label: 'Sede', field: row => row.sede?.nombre, align: 'left' },
  { name: 'cargo', label: 'Cargo', field: row => row.cargo?.nombre, align: 'left' },
  { name: 'vacantes', label: 'Vacantes', field: 'vacantes', align: 'center' },
  { name: 'acciones', label: '', field: 'acciones', align: 'right' },
]

const estadosOptions = [
  { label: 'Pendiente', value: 'pendiente' },
  { label: 'Revisión', value: 'en_revision' },
  { label: 'Obs.', value: 'observado' },
  { label: 'Habilitado', value: 'habilitado' },
  { label: 'Rechazado', value: 'rechazado' },
  { label: 'Selecc.', value: 'seleccionado' },
]

const sedesOptions = computed(() => sedes.value.map(s => ({ label: s.nombre, value: s.id })))
const cargosOptions = computed(() => cargos.value.map(c => ({ label: c.nombre, value: c.id })))
const convocatoriasOptions = computed(() => convocatorias.value.map(c => ({ label: c.titulo, value: c.id })))

// Función para abrir PDFs en nueva pestaña
const abrirPDF = (rutaPdf) => {
  if (!rutaPdf) return
  const baseUrl = process.env.PROD
    ? 'https://api.sipo.xpertiaplus.com/storage/'
    : 'http://localhost:8081/storage/'
  window.open(baseUrl + rutaPdf, '_blank')
}

// Estado y funciones para preview de PDF en el panel lateral
const previewPdfUrl = ref('')
const previewPdfName = ref('')
const currentPdfPath = ref('')

// Helper para números romanos
const toRoman = (num) => {
  const lookup = {M:1000,CM:900,D:500,CD:400,C:100,XC:90,L:50,XL:40,X:10,IX:9,V:5,IV:4,I:1}
  let roman = '', i
  for ( i in lookup ) {
    while ( num >= lookup[i] ) {
      roman += i
      num -= lookup[i]
    }
  }
  return roman
}

const previewPDF = (rutaPdf, nombre) => {
  if (!rutaPdf) return
  // Usar helper centralizado
  const url = getStorageUrl(rutaPdf)

  previewPdfUrl.value = url
  previewPdfName.value = nombre || 'Documento'
  currentPdfPath.value = url
}

const closePreview = () => {
  previewPdfUrl.value = ''
  previewPdfName.value = ''
  currentPdfPath.value = ''
}

// Descargar expediente completo generando un PDF unificado en el cliente
// Descargar expediente completo generando un PDF unificado en el cliente
const descargarExpedienteCompleto = async () => {
  if (!selectedPostulante.value?.id) {
    $q.notify({ type: 'warning', message: 'No hay postulante seleccionado' })
    return
  }

  downloadingExpediente.value = true
  try {
    // 1. Capturar el elemento visual visualizado
    const element = document.getElementById('expediente-visual')
    if (!element) throw new Error('No se encontró el visualizador del expediente')

    // Configurar html2canvas
    const options = {
        scale: 2,
        useCORS: true,
        logging: false,
        windowWidth: element.scrollWidth,
        windowHeight: element.scrollHeight,
        x: 0,
        y: 0
    }

    // Forzar scroll top temporalmente
    const originalScrollTop = element.scrollTop
    element.scrollTop = 0

    const canvas = await html2canvas(element, options)

    // Restaurar scroll
    element.scrollTop = originalScrollTop

    const imgData = canvas.toDataURL('image/png')

    // 2. Crear PDF (A4)
    const pdf = new jsPDF('p', 'mm', 'a4')
    const pdfWidth = pdf.internal.pageSize.getWidth()
    const pdfHeight = pdf.internal.pageSize.getHeight()

    const imgProps = pdf.getImageProperties(imgData)
    const imgHeight = (imgProps.height * pdfWidth) / imgProps.width
    let heightLeft = imgHeight
    let position = 0

    // Primera página
    pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, imgHeight)
    heightLeft -= pdfHeight
    position -= pdfHeight

    // Páginas siguientes
    while (heightLeft > 0) {
      pdf.addPage()
      pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, imgHeight)
      heightLeft -= pdfHeight
      position -= pdfHeight
    }

    // 3. Descargar
    pdf.save(`Expediente_${selectedPostulante.value.ci}_Completo.pdf`)

    $q.notify({
      type: 'positive',
      message: 'Descarga exitosa (Vista Previa)',
      icon: 'check_circle'
    })

  } catch (error) {
    console.error('Error visual expediente:', error)
    $q.notify({
      type: 'negative',
      message: 'Error al generar el PDF visual',
      caption: error.message
    })
  } finally {
    downloadingExpediente.value = false
  }
}

// Login logic removed - handled by router and LoginPage
// Removed: showLogin, showPassword, loginForm, handleLogin, watcher

const copyPortalLink = () => {
  if (!publicLink.value) {
    publicLink.value = window.location.origin + '/#/'
  }
  const link = publicLink.value
  navigator.clipboard.writeText(link)
  $q.notify({
    type: 'positive',
    message: 'Link del Portal copiado',
    caption: link,
    icon: 'content_copy'
  })
}

const getCargoName = (id) => {
  return cargos.value.find(c => c.id === id)?.nombre || 'Cargo desconocido'
}

// Helper para obtener la URL completa de storage
// Helper para obtener la URL completa de storage
const getStorageUrl = (path) => {
  if (!path) return ''
  // Si la ruta ya es completa (http...), retornarla tal cual
  if (path.startsWith('http')) return path;

  const baseUrl = import.meta.env.PROD
    ? 'https://api.sipo.xpertiaplus.com/storage/'
    : 'http://localhost:8000/storage/' // Corregido puerto default laravel 8000
  return baseUrl + path.replace(/^\//, '') // Evitar doble slash
}

const loadData = async () => {
  try {
    const [statsRes, convRes, sedesRes, cargosRes, tiposRes] = await Promise.all([
      api.get('/admin/dashboard/stats'),
      api.get('/admin/convocatorias'),
      api.get('/admin/sedes'),
      api.get('/admin/cargos'),
      api.get('/admin/tipos-documento'),
    ])
    stats.value = statsRes.data
    convocatorias.value = convRes.data
    sedes.value = sedesRes.data
    cargos.value = cargosRes.data
    tiposDocumento.value = tiposRes.data

    // Auto-seleccionar primera convocatoria para el filtro de postulaciones si no hay una
    if (!filtroConvocatoria.value && convocatorias.value.length > 0) {
      // Opcional: filtroConvocatoria.value = convocatorias.value[0].id
      // Dejamos en null para mostrar todas por defecto o seleccionamos la primera si se prefiere
    }
  } catch (e) {
    console.error(e)
  }
}

// CRUD Wrappers (Simplificado, misma lógica anterior)
const editConvocatoria = async (item) => {
  editingConvocatoria.value = item;
  try {
      $q.loading.show()
      const { data } = await api.get(`/admin/convocatorias/${item.id}`)
      const fullItem = (data.convocatoria || data) // Dependiendo de la respueta de show()

      // Formatear fechas para el input date HTML5 (YYYY-MM-DD)
      convocatoriaForm.value = {
        ...fullItem,
        perfil_profesional: fullItem.perfil_profesional || '',
        experiencia_requerida: fullItem.experiencia_requerida || '',
        hora_limite: fullItem.hora_limite ? fullItem.hora_limite.substr(0, 5) : '23:59',
        fecha_inicio: fullItem.fecha_inicio ? fullItem.fecha_inicio.split('T')[0] : '',
        fecha_cierre: fullItem.fecha_cierre ? fullItem.fecha_cierre.split('T')[0] : '',
        ofertas: [], // Las ofertas se gestionan en otro diálogo
        documentos: (fullItem.documentos_requeridos || fullItem.documentosRequeridos || fullItem.documentos || []).map(d => ({
          tipo_documento_id: d.id,
          obligatorio: d.pivot?.obligatorio == 1 || d.pivot?.obligatorio === true || d.pivot?.obligatorio === 'true'
        }))
      };
      step.value = 1;
      showConvocatoriaDialog.value = true
  } catch (e) {
      console.error(e)
      $q.notify({type: 'negative', message: 'Error al cargar detalles de la convocatoria'})
  } finally {
      $q.loading.hide()
  }
}

const addOfertaToForm = () => {
  if (tempOferta.value.sedes_ids.length === 0 || tempOferta.value.cargos_ids.length === 0) {
    $q.notify({ type: 'warning', message: 'Seleccione al menos una Sede y al menos un Cargo' }); return
  }

  let totalAdded = 0

  tempOferta.value.sedes_ids.forEach(sedeId => {
    const selectedSedeObj = sedes.value.find(s => s.id === sedeId)
    if (selectedSedeObj) {
      tempOferta.value.cargos_ids.forEach(cargoId => {
        const exists = convocatoriaForm.value.ofertas.some(o => o.sede_id === selectedSedeObj.id && o.cargo_id === cargoId)
        if (!exists) {
          convocatoriaForm.value.ofertas.push({
            sede_id: selectedSedeObj.id,
            cargo_id: cargoId,
            vacantes: tempOferta.value.vacantes_map[cargoId] || 1 // Use vacantes_map for individual vacancies
          })
          totalAdded++
        }
      })
    }
  })

  if (totalAdded > 0) {
    $q.notify({ type: 'positive', message: `${totalAdded} nuevas combinaciones agregadas` })
    tempOferta.value.cargos_ids = [] // Limpiar cargos
    tempOferta.value.sedes_ids = [] // Limpiar sedes
    tempOferta.value.vacantes_map = {} // Limpiar mapa
  } else {
    $q.notify({ type: 'warning', message: 'Las combinaciones seleccionadas ya estaban agregadas' })
  }
}



const removeOfertaFromForm = (index) => {
  convocatoriaForm.value.ofertas.splice(index, 1)
}

// Open afiche preview for existing convocatoria
// Open afiche preview for existing convocatoria


const openAfichePreview = async (convocatoria) => {
    $q.loading.show({ message: 'Preparando afiche...' })
    let displayData = { ...convocatoria }

    try {
        // Fetch full details if critical fields are missing (often not included in list view)
        if (!displayData.perfil_profesional || !displayData.experiencia_requerida) {
             try {
                const { data } = await api.get(`/admin/convocatorias/${convocatoria.id}`)
                const fullData = data.convocatoria || data // Handle different response wrappers if any
                displayData = { ...displayData, ...fullData }
                console.log('Full details loaded for afiche:', displayData)
             } catch (err) {
                console.warn('Could not fetch full details, using available data', err)
             }
        }

        // Fix Dates: Ensure YYYY-MM-DD
        if(displayData.fecha_cierre && displayData.fecha_cierre.length > 10) {
            displayData.fecha_cierre = displayData.fecha_cierre.substring(0, 10);
        }

        // Generate postulation URL if not present
        if(!displayData.url_postulacion) {
            displayData.url_postulacion = displayData.slug
                ? `${window.location.origin}/postular/${displayData.slug}`
                : 'https://unitepc.edu.bo';
        }

        aficheConvocatoria.value = displayData
        showAficheDialog.value = true
    } catch (error) {
        console.error('Error opening afiche', error)
        $q.notify({type: 'negative', message: 'Error al generar previsualización'})
    } finally {
        $q.loading.hide()
    }
}

const saveConvocatoria = async () => {
  saving.value = true
  try {
    let savedConv = null
    const payload = { ...convocatoriaForm.value }
    // Clean up empty objects
    if(!payload.perfil_profesional) delete payload.perfil_profesional
    if(!payload.experiencia_requerida) delete payload.experiencia_requerida

    if (editingConvocatoria.value) {
      delete payload.ofertas // No editar ofertas aquí
      const res = await api.put(`/admin/convocatorias/${editingConvocatoria.value.id}`, payload)
      savedConv = res.data
    } else {
      const res = await api.post('/admin/convocatorias', payload)
      savedConv = res.data
    }

    showConvocatoriaDialog.value = false
    loadData()
    $q.notify({ type: 'positive', message: 'Guardado exitosamente' })

    // Limpiar borrador local
    localStorage.removeItem(STORAGE_KEY)

    // PREPARAR DATOS PARA EL AFICHE
    const displayData = {
        ...convocatoriaForm.value,
        ...(savedConv || {})
    }

    if(!displayData.url_postulacion) {
        displayData.url_postulacion = displayData.slug ? `http://localhost:9000/postular/${displayData.slug}` : 'https://unitepc.edu.bo';
    }

    aficheConvocatoria.value = displayData
    showAficheDialog.value = true

    // Resetear formulario con delay
    setTimeout(() => {
       if(!showAficheDialog.value) resetConvocatoriaForm()
    }, 1000)

  } catch (e) {
    console.error(e)
    $q.notify({ type: 'negative', message: 'Error al guardar (Verifique consola)' })
  }
  finally { saving.value = false }
}

const downloadAfiche = async () => {
  const el = document.getElementById('afiche-render-target')
  if(!el) return

  const title = aficheConvocatoria.value?.titulo || convocatoriaForm.value?.titulo || 'convocatoria';
  const cleanTitle = title.replace(/[^a-z0-9]/gi, '_').toLowerCase();

  try {
    $q.loading.show({ message: 'Generando imagen HD...' })
    await new Promise(resolve => setTimeout(resolve, 800))

    const canvas = await html2canvas(el, {
      scale: 1,
      useCORS: true,
      backgroundColor: '#ffffff',
      logging: false,
      width: 1080,
      height: 1350,
      windowWidth: 1080,
      windowHeight: 1350,
      x: 0,
      y: 0
    })

    const link = document.createElement('a')
    link.download = `CONVOCATORIA_${cleanTitle}_${new Date().toISOString().split('T')[0]}.png`
    link.href = canvas.toDataURL('image/png')
    link.click()

    $q.notify({ type: 'positive', message: 'Afiche descargado (HD)', icon: 'check_circle' })
  } catch (err) {
    console.error('Error generating afiche:', err)
    $q.notify({type: 'negative', message: 'No se pudo generar la imagen'})
  } finally {
    $q.loading.hide()
  }
}

const resetConvocatoriaForm = () => {
  convocatoriaForm.value = {
    titulo: '',
    descripcion: '',
    perfil_profesional: '',
    experiencia_requerida: '',
    fecha_inicio: '',
    fecha_cierre: '',
    hora_limite: '23:59',
    estado: 'borrador',
    ofertas: [],
    documentos: []
  }
  editingConvocatoria.value = null
  step.value = 1
  tempOferta.value = { sedes_ids: [], cargos_ids: [], vacantes_map: {} }
  localStorage.removeItem(STORAGE_KEY)
}

const toggleDocumento = (tipoId) => {
  const idx = convocatoriaForm.value.documentos.findIndex(d => d.tipo_documento_id === tipoId)
  if (idx >= 0) {
    convocatoriaForm.value.documentos.splice(idx, 1)
  } else {
    convocatoriaForm.value.documentos.push({ tipo_documento_id: tipoId, obligatorio: true })
  }
}

const isDocumentoSelected = (tipoId) => {
  return convocatoriaForm.value.documentos.some(d => d.tipo_documento_id === tipoId)
}

const toggleObligatorio = (tipoId) => {
  const doc = convocatoriaForm.value.documentos.find(d => d.tipo_documento_id === tipoId)
  if (doc) {
    doc.obligatorio = !doc.obligatorio
  }
}

const isObligatorio = (tipoId) => {
  const doc = convocatoriaForm.value.documentos.find(d => d.tipo_documento_id === tipoId)
  return doc?.obligatorio ?? true
}

const eliminarConvocatoria = async (item) => {
  $q.dialog({
    title: 'Confirmar eliminación',
    message: `¿Está seguro que desea eliminar la convocatoria "${item.titulo}"? Esta acción no se puede deshacer.`,
    persistent: true,
    ok: {
      label: 'Eliminar',
      color: 'red',
      flat: true
    },
    cancel: {
      label: 'Cancelar',
      color: 'grey',
      flat: true
    }
  }).onOk(async () => {
    try {
      await api.delete(`/admin/convocatorias/${item.id}`)
      loadData()
      $q.notify({ type: 'positive', message: 'Convocatoria eliminada correctamente' })
    } catch (e) {
      console.error(e)
      const msg = e.response?.data?.message || 'Error al eliminar la convocatoria'
      $q.notify({ type: 'negative', message: msg })
    }
  })
}



const gestionarOfertas = async (conv) => {
  selectedConvocatoria.value = conv
  nuevaOferta.value = { sedes_ids: [], cargos_ids: [], vacantes: 1 }
  const { data } = await api.get(`/admin/convocatorias/${conv.id}`)
  ofertasConvocatoria.value = data.ofertas || []
  showOfertasDialog.value = true
}

const agregarOferta = async () => {
  if (nuevaOferta.value.sedes_ids.length === 0 || nuevaOferta.value.cargos_ids.length === 0) {
    $q.notify({ type: 'warning', message: 'Seleccione Sedes y Cargos' }); return
  }

  try {
    loading.value = true

    const promises = []
    nuevaOferta.value.sedes_ids.forEach(sedeId => {
      nuevaOferta.value.cargos_ids.forEach(cargoId => {
        promises.push(api.post(`/admin/convocatorias/${selectedConvocatoria.value.id}/ofertas`, {
          sede_id: sedeId,
          cargo_id: cargoId,
          vacantes: nuevaOferta.value.vacantes
        }))
      })
    })

    await Promise.all(promises)

    const { data } = await api.get(`/admin/convocatorias/${selectedConvocatoria.value.id}`)
    ofertasConvocatoria.value = data.ofertas || []
    nuevaOferta.value.cargos_ids = [] // Limpiar selección
    nuevaOferta.value.sedes_ids = [] // Limpiar selección
    $q.notify({ type: 'positive', message: 'Ofertas agregadas correctamente' })
  } catch {
    $q.notify({ type: 'negative', message: 'Error al agregar algunas ofertas' })
  } finally {
    loading.value = false
  }
}

const eliminarOferta = async (oferta) => {
  try {
    await api.delete(`/admin/convocatorias/${selectedConvocatoria.value.id}/ofertas/${oferta.id}`)
    ofertasConvocatoria.value = ofertasConvocatoria.value.filter(o => o.id !== oferta.id)
  } catch (e) { console.error(e) }
}

// Postulaciones
// Postulaciones
const verPostulaciones = (conv) => { filtroConvocatoria.value = conv.id; activeTab.value = 'postulaciones'; cargarPostulaciones() }
const cargarPostulaciones = async () => {
  loadingPostulaciones.value = true
  try {
    const params = {}
    if (filtroConvocatoria.value) params.convocatoria_id = filtroConvocatoria.value
    if (filtroSede.value) params.sede_id = filtroSede.value
    if (filtroCargo.value) params.cargo_id = filtroCargo.value

    const { data } = await api.get('/admin/postulaciones', { params })
    postulaciones.value = data
  } catch (e) {
    console.error('Error cargando postulaciones:', e)
    $q.notify({ type: 'negative', message: 'Error cargando postulaciones' })
  } finally { loadingPostulaciones.value = false }
}

const cambiarEstado = async (post, estado) => {
  try { await api.patch(`/admin/postulaciones/${post.id}/estado`, { estado }); post.estado = estado; $q.notify({ type: 'positive', message: 'Estado actualizado' }) } catch { $q.notify({ type: 'negative', message: 'Error al actualizar' }) }
}

const verExpediente = async (post) => {
  try {
    const { data } = await api.get(`/admin/postulantes/${post.postulante_id}/expediente`)
    selectedPostulante.value = data
    showExpedienteDialog.value = true
  } catch {
    $q.notify({ type: 'negative', message: 'Error al cargar expediente' })
  }
}



// Recargar postulaciones al cambiar al tab de postulaciones
watch(activeTab, (val) => {
  if (val === 'postulaciones') {
    cargarPostulaciones()
  }
})

onMounted(async () => {
  if (authStore.token) {
    const valid = await authStore.checkAuth()
    if (valid) {
      loadData()

      // Recuperar borrador
      const draft = localStorage.getItem(STORAGE_KEY)
      if (draft && !editingConvocatoria.value) {
        try {
          const parsed = JSON.parse(draft)
          convocatoriaForm.value = { ...convocatoriaForm.value, ...parsed }
        } catch (e) { console.error('Error recuperando borrador', e) }
      }

      if (activeTab.value === 'postulaciones') {
        cargarPostulaciones()
      }
    } else {
      router.push({ name: 'login' })
    }
  } else {
    router.push({ name: 'login' })
  }
})
</script>

<style>
/* Estilos Clean Table para integrar Quasar Table con estilo Tailwind */
.qt-clean .q-table__top,
.qt-clean .q-table__bottom,
.qt-clean thead tr:first-child th {
  background-color: #ffffff;
}

.qt-clean thead tr th {
  position: sticky;
  z-index: 1;
}

.qt-clean thead tr:first-child th {
  top: 0;
  font-weight: 600;
  color: #374151;
  /* text-gray-700 */
}
</style>
