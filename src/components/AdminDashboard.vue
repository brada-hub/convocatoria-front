<template>
  <div class="min-h-screen bg-gray-50 p-6 md:p-8 animate-fade">

    <!-- Login Modal Estilizado -->
    <!-- Login Modal Estilizado (Full Screen) -->
    <q-dialog v-model="showLogin" persistent maximized transition-show="fade" transition-hide="fade">
      <div class="w-full h-full bg-slate-900 flex items-center justify-center p-4">
        <div class="bg-white rounded-2xl shadow-2xl overflow-hidden max-w-sm w-full relative">
          <!-- Decoración de fondo de tarjeta -->
          <div class="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-600 to-indigo-600"></div>

          <div class="p-8">
            <div class="text-center mb-8">
              <div class="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-50 text-blue-600 mb-4 shadow-sm">
                <q-icon name="admin_panel_settings" size="32px" />
              </div>
              <h2 class="text-2xl font-bold text-gray-900">Panel Administrativo</h2>
              <p class="text-gray-500 text-sm mt-2">Acceso restringido a personal autorizado</p>
            </div>

            <div class="space-y-5">
              <div>
                <label class="block text-xs font-bold text-gray-700 mb-1 uppercase tracking-wider">Correo Institucional</label>
                <q-input
                  v-model="loginForm.email"
                  outlined
                  dense
                  placeholder="admin@sistema.com"
                  bg-color="white"
                  class="w-full"
                >
                  <template v-slot:prepend><q-icon name="email" class="text-gray-400" /></template>
                </q-input>
              </div>

              <div>
                <label class="block text-xs font-bold text-gray-700 mb-1 uppercase tracking-wider">Contraseña</label>
                <q-input
                  v-model="loginForm.password"
                  outlined
                  dense
                  :type="showPassword ? 'text' : 'password'"
                  placeholder="••••••••"
                  bg-color="white"
                  @keyup.enter="login"
                >
                  <template v-slot:prepend><q-icon name="lock" class="text-gray-400" /></template>
                  <template v-slot:append>
                    <q-icon
                      :name="showPassword ? 'visibility_off' : 'visibility'"
                      class="cursor-pointer text-gray-400 hover:text-gray-600"
                      @click="showPassword = !showPassword"
                    />
                  </template>
                </q-input>
              </div>

              <button
                @click="login"
                :disabled="loading"
                class="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg transition-all shadow-lg shadow-blue-500/30 flex items-center justify-center gap-2 mt-2"
              >
                <q-spinner v-if="loading" size="xs" />
                <span>{{ loading ? 'Verificando...' : 'Iniciar Sesión' }}</span>
              </button>
            </div>
          </div>
          <div class="bg-gray-50 p-4 text-center border-t border-gray-100">
            <p class="text-xs text-gray-400">© 2026 Sistema de Convocatorias</p>
          </div>
        </div>
      </div>
    </q-dialog>

    <!-- Contenido Principal -->
    <div v-if="isAuthenticated" class="max-w-7xl mx-auto pb-20 px-4 sm:px-6 lg:px-8">

      <!-- Encabezado de Sección -->
      <div class="flex flex-col gap-4 mb-6 md:mb-8">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 class="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">{{ currentSectionTitle }}</h1>
            <p class="text-gray-500 text-sm mt-1 flex items-center gap-2">
              <span class="w-2 h-2 rounded-full bg-green-500"></span>
              Panel de Administración
            </p>
          </div>

          <!-- Acciones Rápidas Globales -->
          <div class="flex gap-2">
            <button @click="loadData" class="p-2 sm:p-2.5 text-gray-400 hover:text-gray-600 bg-white hover:bg-gray-50 border border-gray-200 rounded-lg transition-colors shadow-sm">
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
          <div class="p-6 border-b border-gray-100 flex flex-col md:flex-row justify-between items-center gap-4 bg-gray-50/30">
            <div class="relative w-full md:w-64">
              <q-icon name="search" class="absolute left-3 top-3 text-gray-400 z-10" size="20px" />
              <input type="text" placeholder="Buscar convocatoria..." class="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm" />
            </div>
            <button @click="showConvocatoriaDialog = true" class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 shadow-sm">
              <q-icon name="add" /> Nueva Convocatoria
            </button>
          </div>

          <q-table
            :rows="convocatorias"
            :columns="convocatoriasColumns"
            row-key="id"
            flat
            :pagination="{ rowsPerPage: 10 }"
            class="qt-clean"
          >
            <template v-slot:body-cell-estado="props">
              <q-td :props="props">
                <span :class="{
                  'bg-green-100 text-green-700': new Date(props.row.fecha_cierre) >= new Date() && new Date(props.row.fecha_inicio) <= new Date(),
                  'bg-gray-100 text-gray-600': new Date(props.row.fecha_inicio) > new Date(),
                  'bg-red-100 text-red-700': new Date(props.row.fecha_cierre) < new Date(),
                }" class="px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wide">
                  {{ new Date(props.row.fecha_cierre) < new Date() ? 'Cerrada' : (new Date(props.row.fecha_inicio) > new Date() ? 'Próxima' : 'Activa') }}
                </span>
                <span class="text-xs text-gray-400 ml-2 block mt-1">{{ props.row.ofertas_count || 0 }} Ofertas</span>
              </q-td>
            </template>
            <template v-slot:body-cell-acciones="props">
              <q-td :props="props">
                <div class="flex justify-center gap-2">
                  <button @click="editConvocatoria(props.row)" class="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"><q-icon name="edit" size="18px"/></button>
                  <button @click="gestionarOfertas(props.row)" class="p-1.5 text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"><q-icon name="settings" size="18px"/></button>
                  <button @click="verPostulaciones(props.row)" class="p-1.5 text-gray-500 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors relative">
                    <q-icon name="visibility" size="18px"/>
                  </button>
                  <button @click="eliminarConvocatoria(props.row)" class="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Eliminar">
                    <q-icon name="delete" size="18px"/>
                  </button>
                </div>
              </q-td>
            </template>
          </q-table>
        </div>
      </div>

      <!-- VISTA: SEDES -->
      <div v-show="activeTab === 'sedes'">
         <AdminSedes />
      </div>

      <!-- VISTA: CARGOS -->
      <div v-show="activeTab === 'cargos'">
         <AdminCargos />
      </div>

      <!-- VISTA: POSTULACIONES -->
      <div v-show="activeTab === 'postulaciones'" class="animate-fadeIn">
        <div class="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          <div class="p-6 border-b border-gray-100 flex flex-col gap-4 bg-gray-50/30">
            <div class="flex items-center justify-between">
               <h3 class="text-lg font-semibold text-gray-800">Gestión de Postulaciones</h3>
               <button @click="cargarPostulaciones" class="text-blue-600 hover:bg-blue-50 p-2 rounded-lg transition-colors" title="Actualizar lista">
                 <q-icon name="refresh" size="20px"/>
               </button>
            </div>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
              <q-select
                v-model="filtroConvocatoria"
                :options="convocatoriasOptions"
                label="Convocatoria"
                outlined dense bg-color="white"
                emit-value map-options clearable
                @update:model-value="cargarPostulaciones"
              >
                 <template v-slot:no-option><q-item><q-item-section class="text-gray-400 italic">No hay datos</q-item-section></q-item></template>
              </q-select>

              <q-select
                v-model="filtroSede"
                :options="sedesOptions"
                label="Sede"
                outlined dense bg-color="white"
                emit-value map-options clearable
                @update:model-value="cargarPostulaciones"
              >
                  <template v-slot:no-option><q-item><q-item-section class="text-gray-400 italic">No hay datos</q-item-section></q-item></template>
              </q-select>

              <q-select
                v-model="filtroCargo"
                :options="cargosOptions"
                label="Cargo"
                outlined dense bg-color="white"
                emit-value map-options clearable
                @update:model-value="cargarPostulaciones"
              >
                  <template v-slot:no-option><q-item><q-item-section class="text-gray-400 italic">No hay datos</q-item-section></q-item></template>
              </q-select>
            </div>
          </div>

          <q-table
            :rows="postulaciones"
            :columns="postulacionesColumns"
            row-key="id"
            flat
            :loading="loadingPostulaciones"
            class="qt-clean"
          >
            <template v-slot:body-cell-postulante="props">
              <q-td :props="props">
                <div class="flex items-center gap-3">
                  <div class="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 font-bold text-xs">
                    {{ props.row.postulante?.nombres[0] }}{{ props.row.postulante?.apellidos[0] }}
                  </div>
                  <div>
                    <div class="font-medium text-gray-900">{{ props.row.postulante?.nombres }} {{ props.row.postulante?.apellidos }}</div>
                    <div class="text-xs text-gray-500">{{ props.row.postulante?.ci }}</div>
                  </div>
                </div>
              </q-td>
            </template>
            <template v-slot:body-cell-estado="props">
              <q-td :props="props">
                <q-select
                  :model-value="props.row.estado"
                  :options="estadosOptions"
                  dense
                  outlined
                  class="text-xs"
                  bg-color="white"
                  emit-value
                  map-options
                  @update:model-value="val => cambiarEstado(props.row, val)"
                />
              </q-td>
            </template>
             <template v-slot:body-cell-acciones="props">
              <q-td :props="props">
                 <button @click="verExpediente(props.row)" class="px-3 py-1.5 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-md text-xs font-medium transition-colors">
                    Ver Expediente
                 </button>
              </q-td>
            </template>
          </q-table>
        </div>
      </div>

    </div>

    <!-- Dialogs Modals (Manteniendo estructura Quasar para funcionalidad, pero con clases si aplica) -->
    <!-- (Se mantienen igual para no romper los formularios, solo pequeñas mejoras visuales) -->

    <q-dialog v-model="showConvocatoriaDialog">
      <q-card style="min-width: 900px; max-width: 95vw;" class="rounded-xl">
        <q-card-section class="row items-center border-b border-gray-100 q-py-md px-6 bg-white">
          <div>
            <div class="text-xl font-bold text-gray-900">{{ editingConvocatoria ? 'Editar' : 'Nueva' }} Convocatoria</div>
            <div class="text-sm text-gray-500">Gestione la información y vacantes</div>
          </div>
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup class="text-gray-500"/>
        </q-card-section>

        <q-card-section class="q-pa-none">
          <q-stepper v-model="step" ref="stepper" animated flat active-color="primary" done-color="positive" class="w-full" header-class="bg-gray-50 border-b border-gray-100 text-gray-600">

          <!-- PASO 1: DATOS GENERALES -->
          <q-step :name="1" title="Datos Generales" icon="settings" :done="step > 1" class="h-full">
            <div class="max-w-3xl mx-auto py-4">
              <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div class="col-span-2">
                   <label class="block text-sm font-medium text-gray-700 mb-1">Título de la Convocatoria <span class="text-red-500">*</span></label>
                   <q-input v-model="convocatoriaForm.titulo" outlined dense bg-color="white" placeholder="Ej: Convocatoria Nacional 2026" :rules="[val => !!val || 'Requerido']" />
                </div>
                <div class="col-span-2">
                   <label class="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
                   <q-input v-model="convocatoriaForm.descripcion" outlined dense type="textarea" bg-color="white" rows="3" />
                </div>
                <div>
                   <label class="block text-sm font-medium text-gray-700 mb-1">Fecha Inicio <span class="text-red-500">*</span></label>
                   <q-input v-model="convocatoriaForm.fecha_inicio" outlined dense type="date" bg-color="white" />
                </div>
                <div>
                   <label class="block text-sm font-medium text-gray-700 mb-1">Fecha Cierre <span class="text-red-500">*</span></label>
                   <q-input v-model="convocatoriaForm.fecha_cierre" outlined dense type="date" bg-color="white" />
                </div>
                <div class="col-span-2 bg-blue-50 p-4 rounded-xl text-blue-800 text-sm flex items-center gap-3">
                   <q-icon name="auto_mode" size="20px" />
                   <span>La convocatoria se activará automáticamente entre las fechas seleccionadas.</span>
                </div>
              </div>

              <div class="flex justify-end mt-12 pt-6 border-t border-gray-100">
                 <button v-if="editingConvocatoria" @click="saveConvocatoria" class="px-6 py-2.5 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 transition-colors flex items-center gap-2">
                    <q-spinner v-if="saving" size="xs"/> Guardar Cambios
                 </button>
                 <button v-else @click="() => { if(convocatoriaForm.titulo && convocatoriaForm.fecha_inicio && convocatoriaForm.fecha_cierre) step = 2; else $q.notify({type:'warning', message:'Complete los campos obligatorios'}) }" class="px-6 py-2.5 bg-gray-900 text-white rounded-lg font-bold hover:bg-gray-800 transition-colors flex items-center gap-2 group">
                    Siguiente Paso <q-icon name="arrow_forward" class="group-hover:translate-x-1 transition-transform" />
                 </button>
              </div>
            </div>
          </q-step>

          <!-- PASO 2: OFERTAS (Solo nueva) -->
          <q-step :name="2" title="Asignar Ofertas" icon="work" :disable="editingConvocatoria !== null" class="h-full">
             <div class="max-w-4xl mx-auto py-4">
                <div class="bg-blue-50 p-4 rounded-xl mb-8 border border-blue-100 flex items-start gap-3">
                   <q-icon name="info" class="text-blue-600 mt-0.5" size="20px"/>
                   <div class="text-sm text-blue-800">
                      Seleccione una Sede y uno o varios Cargos para asignarlos en bloque. Puede crear nuevas sedes o cargos si no existen.
                   </div>
                </div>

                <!-- Formulario Agregar -->
                <div class="bg-white p-5 rounded-xl border border-gray-200 shadow-sm mb-6">
                   <h4 class="text-sm font-bold text-gray-900 uppercase tracking-wide mb-4">Agregar Combinación</h4>
                   <div class="grid grid-cols-1 md:grid-cols-12 gap-4 items-start">

                      <!-- Sede -->
                      <div class="md:col-span-4 flex gap-2 items-start">
                         <div class="flex-1">
                            <q-select v-model="tempOferta.sede_id" :options="sedesOptions" label="Sede" outlined dense bg-color="white" emit-value map-options class="w-full">
                               <template v-slot:no-option>
                                  <q-item clickable @click="showQuickSede=true">
                                     <q-item-section class="text-blue-600"><q-icon name="add"/> Crear nueva sede</q-item-section>
                                  </q-item>
                               </template>
                            </q-select>
                         </div>
                         <button @click="showQuickSede=true" class="mt-1 p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg border border-blue-200" title="Crear Sede Rápida"><q-icon name="add" size="20px"/></button>
                      </div>

                      <!-- Cargos (Multiple) -->
                      <div class="md:col-span-5 flex gap-2 items-start">
                         <div class="flex-1">
                            <q-select
                               v-model="tempOferta.cargos_ids"
                               :options="cargosOptions"
                               label="Cargos"
                               outlined dense bg-color="white"
                               emit-value map-options
                               multiple
                               use-chips
                               stack-label
                               class="w-full"
                            >
                               <template v-slot:no-option>
                                  <q-item clickable @click="showQuickCargo=true">
                                     <q-item-section class="text-blue-600"><q-icon name="add"/> Crear nuevo cargo</q-item-section>
                                  </q-item>
                               </template>
                            </q-select>
                         </div>
                         <button @click="showQuickCargo=true" class="mt-1 p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg border border-blue-200" title="Crear Cargo Rápido"><q-icon name="add" size="20px"/></button>
                      </div>

                       <!-- Vacantes Detalladas (Aparece cuando hay cargos) -->
                       <div v-if="tempOferta.cargos_ids.length > 0" class="col-span-full bg-gray-50 p-4 rounded-xl border border-dashed border-gray-300 animate-fadeIn">
                          <div class="text-xs font-bold text-gray-500 mb-3 uppercase tracking-wider">Configurar Vacantes por Cargo</div>
                          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                             <div v-for="id in tempOferta.cargos_ids" :key="id" class="flex items-center gap-3 bg-white p-2 rounded-lg border">
                                <span class="flex-1 text-xs font-medium text-gray-700 truncate">{{ cargos.find(c => c.id === id)?.nombre }}</span>
                                <q-input
                                  v-model.number="tempOferta.vacantes_map[id]"
                                  type="number"
                                  outlined
                                  dense
                                  bg-color="white"
                                  style="width: 80px"
                                  min="1"
                                />
                             </div>
                          </div>
                       </div>

                       <!-- Botón Agregar -->
                       <div class="col-span-full flex justify-end">
                          <button @click="addOfertaToForm" class="px-8 py-3 bg-gray-900 text-white rounded-xl hover:bg-gray-800 font-bold shadow-lg shadow-gray-200 transition-all flex items-center gap-2">
                             <q-icon name="playlist_add" size="20px" /> Agregar Combinación a la Lista
                          </button>
                       </div>
                    </div>
                 </div>

                <!-- Lista -->
                <div class="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm min-h-[200px]">
                   <div v-if="convocatoriaForm.ofertas.length === 0" class="flex flex-col items-center justify-center py-12 text-gray-400">
                      <q-icon name="inbox" size="48px" class="mb-2 opacity-50"/>
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
                         <tr v-for="(oferta, idx) in convocatoriaForm.ofertas" :key="idx" class="hover:bg-gray-50 transition-colors">
                            <td class="p-4 font-medium text-gray-900">{{ sedes.find(s=>s.id===oferta.sede_id)?.nombre }}</td>
                            <td class="p-4 text-gray-700">{{ cargos.find(c=>c.id===oferta.cargo_id)?.nombre }}</td>
                             <td class="p-4 text-center font-mono">
                                <q-input v-model.number="oferta.vacantes" type="number" dense borderless input-class="text-center font-bold" min="1" />
                             </td>
                             <td class="p-4 text-right">
                               <button @click="removeOfertaFromForm(idx)" class="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all">
                                  <q-icon name="delete" size="18px"/>
                               </button>
                            </td>
                         </tr>
                      </tbody>
                   </table>
                </div>

                <div class="flex justify-between mt-8 pt-6 border-t border-gray-100">
                   <button @click="step = 1" class="px-6 py-2 text-gray-600 hover:text-gray-900 font-medium hover:bg-gray-100 rounded-lg transition-colors">
                      Atrás
                   </button>
                   <button @click="saveConvocatoria" class="px-8 py-3 bg-green-600 text-white rounded-lg font-bold hover:bg-green-700 shadow-lg hover:shadow-green-500/30 transition-all flex items-center gap-2 transform active:scale-95">
                      <q-icon name="check_circle" size="20px" /> Crear Convocatoria
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
        <div class="bg-white sticky top-0 z-10 border-b border-gray-200 px-6 py-4 flex justify-between items-center shadow-sm">
           <div class="flex items-center gap-4">
              <div class="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl">
                 <q-icon name="work_history" size="24px" />
              </div>
              <div>
                 <h2 class="text-xl font-bold text-gray-900 leading-tight">Gestionar Ofertas</h2>
                 <p class="text-sm text-gray-500 font-medium">{{ selectedConvocatoria?.titulo }}</p>
              </div>
           </div>
           <button @click="showOfertasDialog=false" class="p-2 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-full transition-all hover:rotate-90">
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
                    <div class="text-xs font-bold text-gray-400 bg-gray-50 px-2 py-1 rounded uppercase tracking-wider">Acción Rápida</div>
                 </div>

                 <div class="grid grid-cols-1 md:grid-cols-12 gap-6 items-end">
                    <!-- Sede Selection -->
                    <div class="md:col-span-4 space-y-1.5">
                       <label class="text-xs font-bold text-gray-500 uppercase ml-1">Sede</label>
                       <div class="flex gap-2">
                          <q-select
                             v-model="nuevaOferta.sede_id"
                             :options="sedesOptions"
                             outlined dense bg-color="white"
                             emit-value map-options class="flex-1"
                             placeholder="Seleccione Sede"
                          >
                             <template v-slot:no-option>
                                <q-item clickable @click="showQuickSede=true" class="text-blue-600 font-medium">
                                   <q-item-section>+ Crear nueva sede</q-item-section>
                                </q-item>
                             </template>
                          </q-select>
                          <button @click="showQuickSede=true" class="p-2 text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-lg border border-indigo-100 transition-colors">
                             <q-icon name="add" size="20px" />
                          </button>
                       </div>
                    </div>

                    <!-- Cargos Selection (Multi) -->
                    <div class="md:col-span-5 space-y-1.5">
                       <label class="text-xs font-bold text-gray-500 uppercase ml-1">Cargos (Selección Múltiple)</label>
                       <div class="flex gap-2">
                          <q-select
                             v-model="nuevaOferta.cargos_ids"
                             :options="cargosOptions"
                             multiple use-chips stack-label
                             outlined dense bg-color="white"
                             emit-value map-options class="flex-1"
                             placeholder="Seleccione Cargos"
                          >
                             <template v-slot:no-option>
                                <q-item clickable @click="showQuickCargo=true" class="text-blue-600 font-medium">
                                   <q-item-section>+ Crear nuevo cargo</q-item-section>
                                </q-item>
                             </template>
                          </q-select>
                          <button @click="showQuickCargo=true" class="p-2 text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-lg border border-indigo-100 transition-colors">
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
                          <button
                             @click="agregarOferta"
                             class="flex-1 bg-gray-900 hover:bg-black text-white rounded-xl font-bold text-sm transition-all transform active:scale-95 shadow-lg shadow-gray-200 flex items-center justify-center gap-2 mt-[22px]"
                          >
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

                 <q-table
                    :rows="ofertasConvocatoria"
                    :columns="ofertasColumns"
                    flat
                    class="qt-clean"
                    :pagination="{ rowsPerPage: 0 }"
                 >
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
                          <span class="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-indigo-50 text-indigo-700 font-bold border border-indigo-100">
                             {{ props.row.vacantes }}
                          </span>
                       </q-td>
                    </template>
                    <template v-slot:body-cell-acciones="props">
                       <q-td :props="props" class="text-right">
                          <button
                             @click="eliminarOferta(props.row)"
                             class="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                             title="Eliminar Oferta"
                          >
                             <q-icon name="delete_outline" size="20px"/>
                          </button>
                       </q-td>
                    </template>
                 </q-table>
              </div>

           </div>
        </div>
      </div>
    </q-dialog>

    <!-- Dialog Expediente (Similar al ofertas) -->
    <q-dialog v-model="showExpedienteDialog" maximized transition-show="slide-up" transition-hide="slide-down">
       <div class="bg-gray-50 min-h-screen flex flex-col">
          <div class="bg-white border-b border-gray-200 px-8 py-4 flex justify-between items-center shadow-sm sticky top-0 z-50">
             <div class="flex items-center gap-4">
                <div class="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold">
                   {{ selectedPostulante?.nombres[0] }}
                </div>
                <div>
                  <h2 class="text-lg font-bold text-gray-900">{{ selectedPostulante?.nombres }} {{ selectedPostulante?.apellidos }}</h2>
                  <p class="text-sm text-gray-500">Expediente Digital • CI: {{ selectedPostulante?.ci }}</p>
                </div>
             </div>
             <button @click="showExpedienteDialog=false" class="p-2 hover:bg-gray-100 rounded-full"><q-icon name="close" size="24px"/></button>
          </div>

          <div class="flex-1 overflow-auto p-8">
             <div class="max-w-5xl mx-auto space-y-8">
                <!-- Secciones de expediente con estilo Tailwind Card -->
                <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                   <h3 class="text-lg font-bold text-gray-800 mb-6 flex items-center gap-2"><q-icon name="school" class="text-blue-500"/> Formación Académica</h3>
                   <q-table
                     :rows="selectedPostulante?.formaciones || []"
                     :columns="columnasFormacion"
                     flat
                     class="qt-clean"
                     row-key="id"
                     :rows-per-page-options="[5, 10, 20]"
                   >
                     <template v-slot:body-cell-archivo_pdf="props">
                       <q-td :props="props">
                         <q-btn
                           v-if="props.row.archivo_pdf"
                           icon="picture_as_pdf"
                           color="red"
                           flat
                           dense
                           round
                           @click="abrirPDF(props.row.archivo_pdf)"
                         >
                           <q-tooltip>Ver PDF</q-tooltip>
                         </q-btn>
                         <span v-else class="text-grey-5">Sin archivo</span>
                       </q-td>
                     </template>
                   </q-table>
                </div>
                 <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                   <h3 class="text-lg font-bold text-gray-800 mb-6 flex items-center gap-2"><q-icon name="work" class="text-orange-500"/> Experiencia</h3>
                   <q-table
                     :rows="selectedPostulante?.experiencias || []"
                     :columns="columnasExperiencia"
                     flat
                     class="qt-clean"
                     row-key="id"
                     :rows-per-page-options="[5, 10, 20]"
                   >
                     <template v-slot:body-cell-archivo_pdf="props">
                       <q-td :props="props">
                         <q-btn
                           v-if="props.row.archivo_pdf"
                           icon="picture_as_pdf"
                           color="red"
                           flat
                           dense
                           round
                           @click="abrirPDF(props.row.archivo_pdf)"
                         >
                           <q-tooltip>Ver PDF</q-tooltip>
                         </q-btn>
                         <span v-else class="text-grey-5">Sin archivo</span>
                       </q-td>
                     </template>
                   </q-table>
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
            <q-btn color="primary" icon="content_copy" label="Copiar" @click="copyPortalLink" no-caps class="rounded-lg" />
          </div>
        </q-card-section>
      </q-card>
    </q-dialog>

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

const $q = useQuasar()
const route = useRoute()
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
    sedes: 'Sedes y Ubicaciones',
    cargos: 'Catálogo de Cargos',
    postulaciones: 'Gestión de Postulaciones'
  }
  return map[activeTab.value] || 'Administración'
})

// Estado
const showLogin = ref(!authStore.isLoggedIn)
const showPassword = ref(false)
const loading = ref(false)
const saving = ref(false)

const loginForm = ref({ email: '', password: '' })
const isAuthenticated = computed(() => authStore.isLoggedIn)

const stats = ref({ convocatorias_activas: 0, total_postulaciones: 0, pendientes: 0, postulantes: 0 })
const convocatorias = ref([])
const sedes = ref([])
const cargos = ref([])
const postulaciones = ref([])

// Columnas para tablas de expediente
const columnasFormacion = [
  { name: 'nivel', label: 'Nivel', field: 'nivel', align: 'left', sortable: true },
  { name: 'titulo_profesion', label: 'Título/Profesión', field: 'titulo_profesion', align: 'left', sortable: true },
  { name: 'universidad', label: 'Universidad', field: 'universidad', align: 'left', sortable: true },
  { name: 'anio_emision', label: 'Año', field: 'anio_emision', align: 'center', sortable: true },
  { name: 'archivo_pdf', label: 'PDF', field: 'archivo_pdf', align: 'center' }
]

const columnasExperiencia = [
  { name: 'cargo_desempenado', label: 'Cargo', field: 'cargo_desempenado', align: 'left', sortable: true },
  { name: 'empresa_institucion', label: 'Empresa/Institución', field: 'empresa_institucion', align: 'left', sortable: true },
  { name: 'anio_inicio', label: 'Año Inicio', field: 'anio_inicio', align: 'center', sortable: true },
  { name: 'anio_fin', label: 'Año Fin', field: 'anio_fin', align: 'center', sortable: true },
  { name: 'funciones', label: 'Funciones', field: 'funciones', align: 'left' },
  { name: 'archivo_pdf', label: 'PDF', field: 'archivo_pdf', align: 'center' }
]

// Dialogs
const showConvocatoriaDialog = ref(false)
const showOfertasDialog = ref(false)
const showExpedienteDialog = ref(false)
const showShareDialog = ref(false)
const qrCodeUrl = ref('')
const publicLink = ref('')

// Forms
const convocatoriaForm = ref({ titulo: '', descripcion: '', fecha_inicio: '', fecha_cierre: '', estado: 'borrador', ofertas: [] })
const nuevaOferta = ref({ sede_id: null, cargos_ids: [], vacantes: 1 }) // vacantes es para el batch add
const tempOferta = ref({ sede_id: null, cargos_ids: [], vacantes_map: {} }) // vacantes_map para el stepper

const step = ref(1)

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

// Función para abrir PDFs
const abrirPDF = (rutaPdf) => {
  if (!rutaPdf) return
  const baseUrl = 'http://localhost:8000/storage/'
  window.open(baseUrl + rutaPdf, '_blank')
}

// Métodos
const login = async () => {
  loading.value = true
  const result = await authStore.login(loginForm.value.email, loginForm.value.password)
  loading.value = false
  if (result.success) { showLogin.value = false; loadData() }
  else { $q.notify({ type: 'negative', message: result.error }) }
}



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

const loadData = async () => {
  try {
    const [statsRes, convRes, sedesRes, cargosRes] = await Promise.all([
      api.get('/admin/dashboard/stats'),
      api.get('/admin/convocatorias'),
      api.get('/admin/sedes'),
      api.get('/admin/cargos'),
    ])
    stats.value = statsRes.data
    convocatorias.value = convRes.data
    sedes.value = sedesRes.data
    cargos.value = cargosRes.data

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
const editConvocatoria = (item) => {
  editingConvocatoria.value = item;
  // Formatear fechas para el input date HTML5 (YYYY-MM-DD)
  convocatoriaForm.value = {
    ...item,
    fecha_inicio: item.fecha_inicio ? item.fecha_inicio.split('T')[0] : '',
    fecha_cierre: item.fecha_cierre ? item.fecha_cierre.split('T')[0] : '',
    ofertas: []
  };
  step.value = 1;
  showConvocatoriaDialog.value = true
}

const addOfertaToForm = () => {
  if(!tempOferta.value.sede_id || tempOferta.value.cargos_ids.length === 0) {
     $q.notify({type:'warning', message: 'Seleccione Sede y al menos un Cargo'}); return
  }

  const selectedSedeObj = sedes.value.find(s => s.id === tempOferta.value.sede_id)
  let totalAdded = 0

  if (selectedSedeObj) {
      tempOferta.value.cargos_ids.forEach(cargoId => {
          const exists = convocatoriaForm.value.ofertas.some(o => o.sede_id === selectedSedeObj.id && o.cargo_id === cargoId)
          if(!exists) {
            convocatoriaForm.value.ofertas.push({
                sede_id: selectedSedeObj.id,
                cargo_id: cargoId,
                vacantes: tempOferta.value.vacantes_map[cargoId] || 1 // Use vacantes_map for individual vacancies
            })
            totalAdded++
          }
      })
  }

  if (totalAdded > 0) {
     $q.notify({type:'positive', message: `${totalAdded} cargos agregados`})
     tempOferta.value.cargos_ids = [] // Limpiar cargos
     tempOferta.value.vacantes_map = {} // Limpiar mapa
  } else {
     $q.notify({type:'warning', message: 'Los cargos seleccionados ya estaban agregados'})
  }
}



const removeOfertaFromForm = (index) => {
  convocatoriaForm.value.ofertas.splice(index, 1)
}

const saveConvocatoria = async () => {
   saving.value = true
   try {
     if (editingConvocatoria.value) {
        // En edición, ignoramos el array ofertas por seguridad, solo editamos datos base
        const data = { ...convocatoriaForm.value }
        delete data.ofertas
        await api.put(`/admin/convocatorias/${editingConvocatoria.value.id}`, data)
     } else {
        await api.post('/admin/convocatorias', convocatoriaForm.value)
     }
     showConvocatoriaDialog.value = false
     loadData()
     $q.notify({ type: 'positive', message: 'Guardado exitosamente' })
   } catch { $q.notify({ type: 'negative', message: 'Error al guardar' }) }
   finally { saving.value = false }
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
   const { data } = await api.get(`/admin/convocatorias/${conv.id}`)
   ofertasConvocatoria.value = data.ofertas || []
   showOfertasDialog.value = true
}

const agregarOferta = async () => {
    if(!nuevaOferta.value.sede_id || nuevaOferta.value.cargos_ids.length === 0) {
       $q.notify({type:'warning', message: 'Seleccione Sede y Cargos'}); return
    }

    try {
       loading.value = true

       const promises = []
       nuevaOferta.value.cargos_ids.forEach(cargoId => {
          promises.push(api.post(`/admin/convocatorias/${selectedConvocatoria.value.id}/ofertas`, {
             sede_id: nuevaOferta.value.sede_id,
             cargo_id: cargoId,
             vacantes: nuevaOferta.value.vacantes
          }))
       })

       await Promise.all(promises)

       const { data } = await api.get(`/admin/convocatorias/${selectedConvocatoria.value.id}`)
       ofertasConvocatoria.value = data.ofertas || []
       nuevaOferta.value.cargos_ids = [] // Limpiar selección
       $q.notify({type:'positive', message:'Ofertas agregadas correctamente'})
    } catch {
       $q.notify({type:'negative', message:'Error al agregar algunas ofertas'})
    } finally {
       loading.value = false
    }
}

const eliminarOferta = async (oferta) => {
   try {
     await api.delete(`/admin/convocatorias/${selectedConvocatoria.value.id}/ofertas/${oferta.id}`)
     ofertasConvocatoria.value = ofertasConvocatoria.value.filter(o => o.id !== oferta.id)
   } catch(e) { console.error(e) }
}

// Postulaciones
// Postulaciones
const verPostulaciones = (conv) => { filtroConvocatoria.value = conv.id; activeTab.value = 'postulaciones'; cargarPostulaciones() }
const cargarPostulaciones = async () => {
   loadingPostulaciones.value = true
   try {
      const params = {}
      if(filtroConvocatoria.value) params.convocatoria_id = filtroConvocatoria.value
      if(filtroSede.value) params.sede_id = filtroSede.value
      if(filtroCargo.value) params.cargo_id = filtroCargo.value

      const { data } = await api.get('/admin/postulaciones', { params })
      postulaciones.value = data
   } catch (e) {
      console.error('Error cargando postulaciones:', e)
      $q.notify({ type: 'negative', message: 'Error cargando postulaciones' })
   } finally { loadingPostulaciones.value = false }
}

const cambiarEstado = async (post, estado) => {
   try { await api.patch(`/admin/postulaciones/${post.id}/estado`, { estado }); post.estado = estado; $q.notify({type:'positive', message:'Estado actualizado'}) } catch { $q.notify({type:'negative', message: 'Error al actualizar'}) }
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
      if (activeTab.value === 'postulaciones') {
        cargarPostulaciones()
      }
    } else {
      showLogin.value = true
    }
  } else {
    showLogin.value = true
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
  color: #374151; /* text-gray-700 */
}
</style>
