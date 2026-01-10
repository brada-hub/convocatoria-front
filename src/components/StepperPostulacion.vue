<template>
  <div class="stepper-container">
    <!-- Hero Header -->
    <div class="hero-section q-mb-xl">
      <div class="hero-content">
        <div class="hero-icon q-mb-md">
          <q-icon name="work_outline" size="64px" color="primary" />
        </div>
        <h1 class="hero-title">{{ convocatoria?.convocatoria?.titulo || 'Portal de Postulación' }}</h1>
        <p class="hero-subtitle">
          Complete el siguiente formulario para enviar su postulación.
          Sus datos serán evaluados por nuestro equipo.
        </p>
        <div v-if="convocatoria?.convocatoria" class="hero-dates q-mt-md">
          <q-chip outline color="primary" icon="event">
            Cierre: {{ formatDate(convocatoria.convocatoria.fecha_cierre) }}
          </q-chip>
        </div>
      </div>
    </div>

    <!-- Stepper Principal -->
    <div class="stepper-wrapper q-pa-md">
      <q-stepper
        v-model="step"
        ref="stepper"
        color="primary"
        animated
        :contracted="$q.screen.lt.md"
        flat
        class="stepper-premium"
      >
        <!-- PASO 1: Selección de Cargos -->
        <q-step
          :name="1"
          title="Selección de Cargos"
          icon="work"
          :done="step > 1"
        >
          <div class="step-content animate-fadeInUp">
            <div class="row q-col-gutter-lg">
               <!-- Columna Izquierda: Tabs y Checkboxes -->
               <div class="col-12 col-md-8">
                  <div class="text-h6 q-mb-md flex items-center gap-2">
                     <q-icon name="apartment" color="primary"/> Sedes Disponibles
                  </div>

                  <div v-if="ofertasAgregadasPorSede.length" class="border rounded-xl overflow-hidden bg-gray-50 flex flex-col md:flex-row" style="min-height: 400px;">
                      <!-- Tabs Verticales de Sedes -->
                      <q-tabs
                        v-model="activeSedeTab"
                        :vertical="!$q.screen.lt.md"
                        class="text-grey-7 bg-white border-b md:border-b-0 md:border-r"
                        active-color="primary"
                        active-bg-color="blue-1"
                        indicator-color="primary"
                      >
                        <q-tab
                           v-for="grupo in ofertasAgregadasPorSede"
                           :key="grupo.sede.id"
                           :name="grupo.sede.id"
                           class="justify-start px-4 py-3"
                           no-caps
                        >
                           <div class="flex items-center gap-2 text-left w-full">
                              <q-icon name="location_on" size="xs" />
                              <div class="text-caption font-bold">{{ grupo.sede.nombre }}</div>
                           </div>
                        </q-tab>
                      </q-tabs>

                      <!-- Paneles de Checkboxes -->
                      <q-tab-panels
                        v-model="activeSedeTab"
                        animated
                        vertical
                        transition-prev="jump-up"
                        transition-next="jump-up"
                        class="bg-transparent flex-1"
                      >
                        <q-tab-panel
                           v-for="grupo in ofertasAgregadasPorSede"
                           :key="grupo.sede.id"
                           :name="grupo.sede.id"
                           class="p-4"
                        >
                           <div class="text-h6 q-mb-sm text-primary font-bold">{{ grupo.sede.nombre }}</div>
                           <p class="text-xs text-gray-500 mb-4">Seleccione los cargos de su interés en esta sede.</p>

                           <div class="grid gap-3">
                              <div
                                 v-for="oferta in grupo.cargos"
                                 :key="oferta.id"
                                 class="bg-white p-3 rounded-lg border border-gray-200 hover:border-blue-400 transition-colors flex items-center"
                              >
                                 <q-checkbox
                                    v-model="ofertasSeleccionadas"
                                    :val="oferta.id"
                                    color="primary"
                                    class="text-sm font-medium text-gray-800"
                                    :label="oferta.cargo.nombre"
                                 />
                              </div>
                           </div>
                        </q-tab-panel>
                      </q-tab-panels>
                  </div>
                  <div v-else class="text-center p-8 bg-gray-50 rounded-xl text-gray-500">
                     No hay ofertas disponibles.
                  </div>
               </div>

               <!-- Columna Derecha: Tabla Resumen -->
               <div class="col-12 col-md-4">
                  <div class="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden sticky-summary">
                     <div class="bg-primary text-white p-4">
                        <div class="text-subtitle1 font-bold flex items-center gap-2">
                           <q-icon name="shopping_bag"/> Mis Postulaciones
                        </div>
                        <div class="text-xs opacity-90">
                           {{ ofertasSeleccionadas.length }} cargos seleccionados
                        </div>
                     </div>

                     <div class="q-pa-none" style="max-height: 400px; overflow-y: auto;">
                        <q-list separator v-if="selectedOfertasDetails.length > 0">
                           <q-item v-for="item in selectedOfertasDetails" :key="item.id" class="hover:bg-gray-50">
                              <q-item-section>
                                 <q-item-label class="text-sm font-bold text-gray-800">{{ item.cargo }}</q-item-label>
                                 <q-item-label caption class="flex items-center gap-1 text-xs text-gray-500">
                                    <q-icon name="place" size="12px"/> {{ item.sede }}
                                 </q-item-label>
                              </q-item-section>
                              <q-item-section side>
                                 <q-btn flat round color="negative" icon="delete_outline" size="sm" @click="toggleOferta(item.id)">
                                    <q-tooltip>Eliminar</q-tooltip>
                                 </q-btn>
                              </q-item-section>
                           </q-item>
                        </q-list>
                        <div v-else class="p-8 text-center text-gray-400 text-sm">
                           <q-icon name="playlist_add" size="40px" class="mb-2 opacity-50 block mx-auto"/>
                           Seleccione cargos de la lista para postular.
                        </div>
                      </div>
                   </div>
                </div>
             </div>
           </div>
           <!-- Botones de Navegación Step 1 -->
           <div class="flex justify-end gap-3 mt-6 px-4 md:px-0">
             <q-btn
               unelevated
               color="primary"
               label="Siguiente"
               icon-right="arrow_forward"
               @click="avanzarStep"
               no-caps
               class="px-6 py-2"
             />
           </div>
        </q-step>

        <!-- PASO 2: Datos Personales -->
        <q-step
          :name="2"
          title="Datos Personales"
          icon="person"
          :done="step > 2"
        >
          <q-form ref="form2" class="step-content animate-fadeInUp">
            <div class="text-h5 q-mb-md text-weight-bold flex items-center">
              <q-icon name="person" class="q-mr-sm" color="primary" />
              Información Personal
            </div>

            <div class="row q-col-gutter-md">
              <div class="col-12 text-blue-900 bg-blue-50 p-3 rounded-lg q-mb-sm text-center" v-if="store.esPostulanteExistente">
                <q-icon name="check_circle" color="positive"/> Datos cargados automáticamente. Verifique su información.
              </div>

              <div class="col-12 col-md-6">
                <q-input
                  v-model="ci"
                  filled
                  label="Carnet de Identidad *"
                  placeholder="Ej: 12345678"
                  :rules="[val => !!val || 'Requerido']"
                  @blur="verificarCI"
                  :loading="loading"
                >
                  <template v-slot:append>
                    <q-btn flat round dense icon="search" v-if="!loading" @click="verificarCI" color="primary">
                       <q-tooltip>Buscar si ya estoy registrado</q-tooltip>
                    </q-btn>
                  </template>
                  <template v-slot:prepend>
                    <q-icon name="badge" />
                  </template>
                </q-input>
              </div>
              <div class="col-12 col-md-6">
                <q-input
                  v-model="postulante.celular"
                  filled
                  label="Celular *"
                  mask="########"
                  :rules="[val => !!val || 'Requerido']"
                >
                  <template v-slot:prepend>
                    <q-icon name="phone" />
                  </template>
                </q-input>
              </div>
              <div class="col-12 col-md-6">
                <q-input
                  v-model="postulante.nombres"
                  filled
                  label="Nombres *"
                  :rules="[val => !!val || 'Requerido']"
                >
                  <template v-slot:prepend>
                    <q-icon name="person" />
                  </template>
                </q-input>
              </div>
              <div class="col-12 col-md-6">
                <q-input
                  v-model="postulante.apellidos"
                  filled
                  label="Apellidos *"
                  :rules="[val => !!val || 'Requerido']"
                >
                  <template v-slot:prepend>
                    <q-icon name="person_outline" />
                  </template>
                </q-input>
              </div>
              <div class="col-12 col-md-6">
                <q-input
                  v-model="postulante.email"
                  filled
                  label="Correo Electrónico *"
                  type="email"
                  :rules="[val => !!val || 'Requerido', val => /.+@.+\..+/.test(val) || 'Correo inválido']"
                >
                  <template v-slot:prepend>
                    <q-icon name="email" />
                  </template>
                </q-input>
              </div>
              <div class="col-12 col-md-6">
                <div class="text-subtitle2 q-mb-sm text-grey-7">Foto de Perfil *</div>
                <div v-if="existingPhotoUrl" class="mb-2 flex items-center gap-3">
                   <q-avatar size="50px">
                     <img :src="existingPhotoUrl">
                   </q-avatar>
                   <div class="text-xs text-green-700 font-bold bg-green-50 px-2 py-1 rounded">
                     Foto actual cargada
                   </div>
                </div>
                <q-file
                  v-model="postulante.foto_perfil"
                  filled
                  label="Seleccionar foto (Rostro)"
                  accept="image/*"
                  max-file-size="2097152"
                  @rejected="onRejected"
                  :rules="[val => (!!val || !!existingPhotoUrl) || 'Foto requerida']"
                >
                  <template v-slot:prepend>
                    <q-icon name="photo_camera" />
                  </template>
                </q-file>
              </div>
            </div>


            <!-- Botones Navegación Step 2 -->
             <div class="flex justify-between mt-8 pt-4 border-t border-gray-200">
               <q-btn flat color="primary" icon="arrow_back" label="Atrás" @click="step = 1" no-caps />
               <q-btn unelevated color="primary" label="Siguiente" icon-right="arrow_forward" @click="avanzarStep" no-caps class="px-6" />
             </div>
          </q-form>
        </q-step>

        <!-- PASO 3: Hoja de Vida -->
        <q-step
          :name="3"
          title="Hoja de Vida"
          icon="description"
          :done="step > 3"
          class="q-pb-xl"
        >
          <q-form ref="form3" class="step-content animate-fadeInUp scrollable-step bg-grey-1 q-pa-lg">

            <div class="text-center q-mb-xl">
               <h2 class="text-h5 text-weight-bold text-gray-800 q-my-none">Documentación de Respaldo</h2>
               <p class="text-gray-500 q-mt-sm">Adjunte los documentos que respalden su formación y experiencia profesional.</p>
            </div>

            <!-- SECCIÓN 1: Formación Académica -->
            <div class="section-container q-mb-xxl">
                <div class="flex items-center gap-3 q-mb-lg pb-4 border-b border-gray-200">
                   <div class="bg-blue-100 p-2 rounded-lg text-primary"><q-icon name="school" size="24px"/></div>
                   <div>
                      <div class="text-lg font-bold text-gray-800">1. Formación Académica</div>
                      <div class="text-xs text-gray-500">Títulos de licenciatura, maestría, doctorado.</div>
                   </div>
                </div>

                <div v-if="formaciones.length === 0" class="text-center p-8 border-2 border-dashed border-gray-300 rounded-xl bg-gray-50 text-gray-400 mb-4">
                   <q-icon name="school" size="40px" class="q-mb-sm opacity-50"/>
                   <div>No ha registrado ninguna formación académica aún.</div>
                </div>

                <div v-for="(item, index) in formaciones" :key="'form-'+index" class="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6 relative hover:shadow-md transition-shadow group">
                  <div class="absolute -right-3 -top-3">
                     <q-btn round color="red-1" text-color="negative" icon="delete" unelevated size="sm" @click="eliminarRegistro('formaciones', index)">
                        <q-tooltip>Eliminar este registro</q-tooltip>
                     </q-btn>
                  </div>

                  <div class="row q-col-gutter-lg">
                    <div class="col-12 col-md-6">
                      <label class="block text-sm font-bold text-gray-700 mb-2">Copia de Título (PDF) <span class="text-red-500">*</span></label>
                      <div class="border-2 border-dashed border-gray-300 rounded-lg p-4 flex flex-col items-center justify-center bg-gray-50 hover:bg-blue-50 hover:border-blue-300 transition-colors cursor-pointer" @click="triggerFilePicker('form', index)">
                         <q-icon name="cloud_upload" size="30px" color="primary" class="q-mb-sm"/>
                         <div class="text-sm text-primary font-medium">Click para subir archivo</div>
                         <div class="text-xs text-gray-400 mt-1 max-w-full truncate text-center px-2">
                            {{ item.archivo ? item.archivo.name : 'Máximo 2MB' }}
                         </div>
                         <q-file :ref="el => setFileRef(el, 'form', index)" v-model="item.archivo" class="hidden" accept=".pdf" max-file-size="2097152" @rejected="onRejected"/>
                      </div>
                    </div>

                    <div class="col-12 col-md-6">
                       <div class="row q-col-gutter-y-md">
                          <div class="col-12">
                             <label class="block text-sm font-bold text-gray-700 mb-1">Título / Profesión <span class="text-red-500">*</span></label>
                             <q-input v-model="item.titulo_profesion" outlined dense placeholder="Ej: Licenciado en Derecho" bg-color="white" :rules="[val => !!val || 'Requerido']" />
                          </div>
                          <div class="col-12">
                             <label class="block text-sm font-bold text-gray-700 mb-1">Universidad <span class="text-red-500">*</span></label>
                             <q-input v-model="item.universidad" outlined dense placeholder="Nombre de la Universidad" bg-color="white" :rules="[val => !!val || 'Requerido']" />
                          </div>
                          <div class="col-12">
                             <label class="block text-sm font-bold text-gray-700 mb-1">Año de Emisión <span class="text-red-500">*</span></label>
                             <q-input v-model="item.anio_emision" outlined dense type="number" placeholder="Ej: 2022" bg-color="white" :rules="[val => !!val || 'Requerido', val => (val >= 1900 && val <= 2100) || 'Año inválido']" />
                          </div>
                       </div>
                    </div>
                  </div>
                </div>

                <q-btn outline color="primary" class="full-width q-py-md border-dashed rounded-lg" no-caps @click="agregarFormacion">
                   <div class="flex items-center gap-2">
                      <q-icon name="add_circle" />
                      <span class="font-bold">Agregar Título Académico</span>
                   </div>
                </q-btn>
            </div>


            <!-- SECCIÓN 2: Experiencia Profesional -->
            <div class="section-container q-mb-xxl q-mt-xxl">
                <div class="flex items-center gap-3 q-mb-lg pb-4 border-b border-gray-200">
                   <div class="bg-blue-100 p-2 rounded-lg text-primary"><q-icon name="work_history" size="24px"/></div>
                   <div>
                      <div class="text-lg font-bold text-gray-800">2. Experiencia Profesional</div>
                      <div class="text-xs text-gray-500">Agregue sus experiencias laborales relevantes.</div>
                   </div>
                </div>

                <div v-if="experiencias.length === 0" class="text-center p-8 border-2 border-dashed border-gray-300 rounded-xl bg-gray-50 text-gray-400 mb-4">
                   <q-icon name="work_off" size="40px" class="q-mb-sm opacity-50"/>
                   <div>No ha registrado experiencia laboral aún.</div>
                </div>

                <div v-for="(item, index) in experiencias" :key="'exp-'+index" class="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6 relative hover:shadow-md transition-shadow">
                  <div class="absolute -right-3 -top-3">
                     <q-btn round color="red-1" text-color="negative" icon="delete" unelevated size="sm" @click="eliminarRegistro('experiencias', index)">
                        <q-tooltip>Eliminar</q-tooltip>
                     </q-btn>
                  </div>

                  <div class="row q-col-gutter-lg">
                    <div class="col-12 col-md-5">
                      <label class="block text-sm font-bold text-gray-700 mb-2">Certificado (PDF)</label>
                      <div class="border-2 border-dashed border-gray-300 rounded-lg p-4 flex flex-col items-center justify-center bg-gray-50 hover:bg-blue-50 hover:border-blue-300 transition-colors cursor-pointer h-full" @click="triggerFilePicker('exp', index)">
                         <q-icon name="cloud_upload" size="30px" color="primary" class="q-mb-sm"/>
                         <div class="text-sm text-primary font-medium">Subir Certificado</div>
                         <div class="text-xs text-gray-400 mt-1 max-w-full truncate text-center px-2">
                            {{ item.archivo ? item.archivo.name : 'Máximo 2MB' }}
                         </div>
                         <q-file :ref="el => setFileRef(el, 'exp', index)" v-model="item.archivo" class="hidden" accept=".pdf" max-file-size="2097152" @rejected="onRejected"/>
                      </div>
                    </div>

                    <div class="col-12 col-md-7">
                       <div class="row q-col-gutter-md">
                          <div class="col-12 col-md-6">
                             <label class="block text-sm font-bold text-gray-700 mb-1">Cargo Desempeñado</label>
                             <q-input v-model="item.cargo_desempenado" outlined dense placeholder="Nombre del cargo" bg-color="white" :rules="[val => !!val || 'Requerido']" />
                          </div>
                          <div class="col-12 col-md-6">
                             <label class="block text-sm font-bold text-gray-700 mb-1">Institución / Empresa</label>
                             <q-input v-model="item.empresa_institucion" outlined dense placeholder="Nombre de la entidad" bg-color="white" :rules="[val => !!val || 'Requerido']" />
                          </div>
                          <div class="col-12 col-md-6">
                             <label class="block text-sm font-bold text-gray-700 mb-1">Año de Inicio</label>
                             <q-input v-model="item.anio_inicio" outlined dense type="number" placeholder="Ej: 2020" bg-color="white" :rules="[val => !!val || 'Requerido', val => (val >= 1900 && val <= 2100) || 'Año inválido']" />
                          </div>
                          <div class="col-12 col-md-6">
                             <label class="block text-sm font-bold text-gray-700 mb-1">Año de Fin (Opcional)</label>
                             <q-input v-model="item.anio_fin" outlined dense type="number" placeholder="Dejar vacío si actual" bg-color="white" :rules="[val => !val || (val >= 1900 && val <= 2100) || 'Año inválido']" />
                          </div>
                       </div>
                    </div>
                  </div>
                </div>

                <q-btn outline color="primary" class="full-width q-py-md border-dashed rounded-lg" no-caps @click="agregarExperiencia">
                   <div class="flex items-center gap-2">
                      <q-icon name="add_circle" />
                      <span class="font-bold">Agregar Experiencia Profesional</span>
                   </div>
                </q-btn>
            </div>


            <!-- SECCIÓN 3: Capacitaciones -->
            <div class="section-container q-mb-xxl q-mt-xxl">
                <div class="flex items-center gap-3 q-mb-lg pb-4 border-b border-gray-200">
                   <div class="bg-blue-100 p-2 rounded-lg text-primary"><q-icon name="menu_book" size="24px"/></div>
                   <div>
                      <div class="text-lg font-bold text-gray-800">3. Cursos y Capacitaciones</div>
                      <div class="text-xs text-gray-500">Cursos, talleres, seminarios relevantes al cargo.</div>
                   </div>
                </div>

                <div v-if="capacitaciones.length === 0" class="text-center p-8 border-2 border-dashed border-gray-300 rounded-xl bg-gray-50 text-gray-400 mb-4">
                   <q-icon name="class" size="40px" class="q-mb-sm opacity-50"/>
                   <div>No ha registrado capacitaciones.</div>
                </div>

                <div v-for="(item, index) in capacitaciones" :key="'cap-'+index" class="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6 relative hover:shadow-md transition-shadow">
                   <div class="absolute -right-3 -top-3">
                     <q-btn round color="red-1" text-color="negative" icon="delete" unelevated size="sm" @click="eliminarRegistro('capacitaciones', index)">
                        <q-tooltip>Eliminar</q-tooltip>
                     </q-btn>
                   </div>

                   <div class="row q-col-gutter-lg">
                    <div class="col-12 col-md-5">
                      <label class="block text-sm font-bold text-gray-700 mb-2">Certificado (PDF)</label>
                       <div class="border-2 border-dashed border-gray-300 rounded-lg p-4 flex flex-col items-center justify-center bg-gray-50 hover:bg-blue-50 hover:border-blue-300 transition-colors cursor-pointer h-full" @click="triggerFilePicker('cap', index)">
                         <q-icon name="cloud_upload" size="30px" color="primary" class="q-mb-sm"/>
                         <div class="text-sm text-primary font-medium">Subir Certificado</div>
                         <div class="text-xs text-gray-400 mt-1 max-w-full truncate text-center px-2">
                            {{ item.archivo ? item.archivo.name : 'Máximo 2MB' }}
                         </div>
                         <q-file :ref="el => setFileRef(el, 'cap', index)" v-model="item.archivo" class="hidden" accept=".pdf" max-file-size="2097152" @rejected="onRejected"/>
                      </div>
                    </div>

                    <div class="col-12 col-md-7">
                       <div class="row q-col-gutter-md">
                          <div class="col-12">
                             <label class="block text-sm font-bold text-gray-700 mb-1">Nombre del Curso / Taller</label>
                             <q-input v-model="item.nombre_curso" outlined dense placeholder="Nombre completo" bg-color="white" />
                          </div>
                          <div class="col-12">
                             <label class="block text-sm font-bold text-gray-700 mb-1">Institución Emisora</label>
                             <q-input v-model="item.institucion_emisora" outlined dense placeholder="Institución" bg-color="white" />
                          </div>
                          <div class="col-6">
                             <label class="block text-sm font-bold text-gray-700 mb-1">Año</label>
                             <q-input v-model="item.anio" outlined dense type="number" placeholder="2023" bg-color="white" :rules="[val => !!val || 'Requerido', val => (val >= 1900 && val <= 2100) || 'Año inválido']" />
                          </div>
                          <div class="col-6">
                             <label class="block text-sm font-bold text-gray-700 mb-1">Carga Horaria</label>
                             <q-input v-model="item.carga_horaria" outlined dense type="number" suffix="Hrs" placeholder="40" bg-color="white" />
                          </div>
                       </div>
                    </div>
                   </div>
                </div>

                <q-btn outline color="primary" class="full-width q-py-md border-dashed rounded-lg" no-caps @click="agregarCapacitacion">
                   <div class="flex items-center gap-2">
                      <q-icon name="add_circle" />
                      <span class="font-bold">Agregar Capacitación</span>
                   </div>
                </q-btn>
            </div>

            <!-- SECCIÓN 4: Producción Intelectual -->
            <div class="section-container q-mb-xxl q-mt-xxl">
                <div class="flex items-center gap-3 q-mb-lg pb-4 border-b border-gray-200">
                   <div class="bg-blue-100 p-2 rounded-lg text-primary"><q-icon name="auto_stories" size="24px"/></div>
                   <div>
                      <div class="text-lg font-bold text-gray-800">4. Producción Intelectual</div>
                      <div class="text-xs text-gray-500">Libros, artículos científicos, investigaciones, software.</div>
                   </div>
                </div>

                <div v-if="producciones.length === 0" class="text-center p-8 border-2 border-dashed border-gray-300 rounded-xl bg-gray-50 text-gray-400 mb-4">
                   <q-icon name="library_books" size="40px" class="q-mb-sm opacity-50"/>
                   <div>No ha registrado producción intelectual.</div>
                </div>

                <div v-for="(item, index) in producciones" :key="'prod-'+index" class="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6 relative hover:shadow-md transition-shadow">
                   <div class="absolute -right-3 -top-3">
                     <q-btn round color="red-1" text-color="negative" icon="delete" unelevated size="sm" @click="eliminarRegistro('producciones', index)">
                        <q-tooltip>Eliminar</q-tooltip>
                     </q-btn>
                   </div>

                   <div class="row q-col-gutter-lg">
                      <div class="col-12 col-md-5">
                        <label class="block text-sm font-bold text-gray-700 mb-2">Documento de Respaldo (PDF)</label>
                        <div class="border-2 border-dashed border-gray-300 rounded-lg p-4 flex flex-col items-center justify-center bg-gray-50 hover:bg-blue-50 hover:border-blue-300 transition-colors cursor-pointer h-full" @click="triggerFilePicker('prod', index)">
                           <q-icon name="cloud_upload" size="30px" color="primary" class="q-mb-sm"/>
                           <div class="text-sm text-primary font-medium">Subir Documento</div>
                           <div class="text-xs text-gray-400 mt-1 max-w-full truncate text-center px-2">
                              {{ item.archivo ? item.archivo.name : 'Máximo 2MB' }}
                           </div>
                           <q-file :ref="el => setFileRef(el, 'prod', index)" v-model="item.archivo" class="hidden" accept=".pdf" max-file-size="2097152" @rejected="onRejected"/>
                        </div>
                      </div>

                      <div class="col-12 col-md-7">
                         <div class="row q-col-gutter-md">
                            <div class="col-12 col-md-6">
                               <label class="block text-sm font-bold text-gray-700 mb-1">Tipo de Producción</label>
                               <q-select v-model="item.tipo" :options="tiposProduccion" outlined dense emit-value map-options bg-color="white" />
                            </div>
                             <div class="col-12 col-md-6">
                               <label class="block text-sm font-bold text-gray-700 mb-1">Año</label>
                               <q-input v-model="item.anio" outlined dense type="number" bg-color="white" :rules="[val => !!val || 'Requerido', val => (val >= 1900 && val <= 2100) || 'Año inválido']" />
                            </div>
                            <div class="col-12">
                               <label class="block text-sm font-bold text-gray-700 mb-1">Título de la Obra</label>
                               <q-input v-model="item.titulo" outlined dense placeholder="Título completo" bg-color="white" />
                            </div>
                         </div>
                      </div>
                   </div>
                </div>

                <q-btn outline color="primary" class="full-width q-py-md border-dashed rounded-lg" no-caps @click="agregarProduccion">
                   <div class="flex items-center gap-2">
                      <q-icon name="add_circle" />
                      <span class="font-bold">Agregar Producción Intelectual</span>
                   </div>
                </q-btn>
            </div>


            <!-- SECCIÓN 5: Reconocimientos -->
            <div class="section-container q-mb-xxl q-mt-xxl">
                <div class="flex items-center gap-3 q-mb-lg pb-4 border-b border-gray-200">
                   <div class="bg-blue-100 p-2 rounded-lg text-primary"><q-icon name="emoji_events" size="24px"/></div>
                   <div>
                      <div class="text-lg font-bold text-gray-800">5. Reconocimientos y Premios</div>
                      <div class="text-xs text-gray-500">Distinciones, premios, reconocimientos honoríficos.</div>
                   </div>
                </div>

                <div v-if="reconocimientos.length === 0" class="text-center p-8 border-2 border-dashed border-gray-300 rounded-xl bg-gray-50 text-gray-400 mb-4">
                   <q-icon name="military_tech" size="40px" class="q-mb-sm opacity-50"/>
                   <div>No ha registrado reconocimientos.</div>
                </div>

                <div v-for="(item, index) in reconocimientos" :key="'rec-'+index" class="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6 relative hover:shadow-md transition-shadow">
                   <div class="absolute -right-3 -top-3">
                     <q-btn round color="red-1" text-color="negative" icon="delete" unelevated size="sm" @click="eliminarRegistro('reconocimientos', index)">
                        <q-tooltip>Eliminar</q-tooltip>
                     </q-btn>
                   </div>

                   <div class="row q-col-gutter-lg">
                      <div class="col-12 col-md-5">
                        <label class="block text-sm font-bold text-gray-700 mb-2">Documento de Respaldo (PDF)</label>
                        <div class="border-2 border-dashed border-gray-300 rounded-lg p-4 flex flex-col items-center justify-center bg-gray-50 hover:bg-blue-50 hover:border-blue-300 transition-colors cursor-pointer h-full" @click="triggerFilePicker('rec', index)">
                           <q-icon name="cloud_upload" size="30px" color="primary" class="q-mb-sm"/>
                           <div class="text-sm text-primary font-medium">Subir Documento</div>
                           <div class="text-xs text-gray-400 mt-1 max-w-full truncate text-center px-2">
                              {{ item.archivo ? item.archivo.name : 'Máximo 2MB' }}
                           </div>
                           <q-file :ref="el => setFileRef(el, 'rec', index)" v-model="item.archivo" class="hidden" accept=".pdf" max-file-size="2097152" @rejected="onRejected"/>
                        </div>
                      </div>

                      <div class="col-12 col-md-7">
                         <div class="row q-col-gutter-md">
                            <div class="col-12 col-md-6">
                               <label class="block text-sm font-bold text-gray-700 mb-1">Tipo de Reconocimiento</label>
                               <q-input v-model="item.tipo_reconocimiento" outlined dense placeholder="Premio, Distinción, etc." bg-color="white" />
                            </div>
                            <div class="col-12 col-md-6">
                               <label class="block text-sm font-bold text-gray-700 mb-1">Año</label>
                               <q-input v-model="item.anio" outlined dense type="number" bg-color="white" :rules="[val => !!val || 'Requerido', val => (val >= 1900 && val <= 2100) || 'Año inválido']" />
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

                <q-btn outline color="primary" class="full-width q-py-md border-dashed rounded-lg" no-caps @click="agregarReconocimiento">
                   <div class="flex items-center gap-2">
                      <q-icon name="add_circle" />
                      <span class="font-bold">Agregar Reconocimiento</span>
                   </div>
                </q-btn>
            </div>

            <!-- Botones Navegación Step 3 -->
             <div class="flex justify-between mt-12 pt-6 border-t border-gray-200">
               <q-btn flat color="primary" icon="arrow_back" label="Atrás" @click="step = 2" no-caps />
               <q-btn unelevated color="primary" label="Ir a Confirmación" icon-right="check_circle" @click="avanzarStep" no-caps class="px-6 py-2" />
             </div>
          </q-form>
        </q-step>
        <!-- PASO 4: Confirmación -->
        <q-step
          :name="4"
          title="Confirmar"
          icon="send"
        >
          <div class="step-content animate-fadeInUp text-center">
            <div class="confirmation-icon q-mb-lg">
              <q-icon name="fact_check" size="80px" color="primary" />
            </div>

            <div class="text-h4 q-mb-md text-weight-bold">¡Revise su Postulación!</div>
            <p class="text-body1 text-grey-5 q-mb-xl">
              Verifique que toda la información sea correcta antes de enviar.
            </p>

            <!-- Resumen -->
            <div class="summary-card q-pa-lg q-mb-xl text-left">
              <div class="row q-col-gutter-lg">
                <div class="col-12 col-md-6">
                  <div class="text-subtitle2 text-grey-5">DATOS PERSONALES</div>
                  <div class="text-h6">{{ postulante.nombres }} {{ postulante.apellidos }}</div>
                  <div class="text-body2">CI: {{ ci }}</div>
                  <div class="text-body2">Tel: {{ postulante.celular }}</div>
                </div>
                <div class="col-12 col-md-6">
                  <div class="text-subtitle2 text-grey-5">CARGOS SELECCIONADOS</div>
                  <div class="text-h6">{{ ofertasSeleccionadas.length }} cargo(s)</div>
                </div>
                <div class="col-12 col-md-3">
                  <div class="stat-mini">
                    <q-icon name="school" size="24px" color="primary" />
                    <span>{{ formaciones.length }} Formaciones</span>
                  </div>
                </div>
                <div class="col-12 col-md-3">
                  <div class="stat-mini">
                    <q-icon name="work" size="24px" color="secondary" />
                    <span>{{ experiencias.length }} Experiencias</span>
                  </div>
                </div>
                <div class="col-12 col-md-3">
                  <div class="stat-mini">
                    <q-icon name="menu_book" size="24px" color="warning" />
                    <span>{{ capacitaciones.length }} Cursos</span>
                  </div>
                </div>
                <div class="col-12 col-md-3">
                  <div class="stat-mini">
                    <q-icon name="emoji_events" size="24px" color="positive" />
                    <span>{{ producciones.length + reconocimientos.length }} Otros</span>
                  </div>
                </div>
              </div>
            </div>

            <div class="flex flex-col items-center gap-4">
              <q-btn
                class="btn-primary q-px-xl"
                size="lg"
                icon="send"
                label="Enviar Postulación"
                :loading="loading"
                @click="enviarPostulacion"
                no-caps
              />
              <q-btn
                flat
                color="grey-7"
                label="Regresar a Hoja de Vida"
                icon="arrow_back"
                @click="step = 3"
                no-caps
              />
            </div>
          </div>
        </q-step>


      </q-stepper>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useQuasar, QTabs, QTab, QTabPanels, QTabPanel } from 'quasar'
import { usePostulacionStore } from 'stores/postulacion-store'
import { storeToRefs } from 'pinia'

const form2 = ref(null)
const form3 = ref(null)
const stepper = ref(null)
const $q = useQuasar()
const route = useRoute()
const store = usePostulacionStore()

// Refs del store
const {
  loading, ci, postulante,
  formaciones, experiencias, capacitaciones, producciones, reconocimientos,
  ofertasSeleccionadas
} = storeToRefs(store)

// Estado local
const step = ref(1)
const convocatoria = ref(null)
const activeSedeTab = ref(null)

// Watch para inicializar tab
watch(() => convocatoria.value?.ofertas_por_sede, (newVal) => {
   if(newVal && newVal.length > 0 && !activeSedeTab.value) {
      activeSedeTab.value = newVal[0].sede.id
   }
}, { immediate: true })

// Watch para inicializar items por defecto en paso 3 (Hoja de Vida)
watch(step, (newStep) => {
   if (newStep === 3) {
      // Asegurar que haya al menos una formación y una experiencia
      if (formaciones.value.length === 0) agregarFormacion()
      if (experiencias.value.length === 0) agregarExperiencia()
      // Las demás secciones son opcionales, así que las agregamos vacías
      if (capacitaciones.value.length === 0) agregarCapacitacion()
      if (producciones.value.length === 0) agregarProduccion()
      if (reconocimientos.value.length === 0) agregarReconocimiento()
   }
})

// Computed para agrupar todas las ofertas de todas las convocatorias por sede
const ofertasAgregadasPorSede = computed(() => {
  const sedesMap = {}

  store.convocatorias.forEach(conv => {
    conv.ofertas.forEach(oferta => {
      const sedeId = oferta.sede.id
      if (!sedesMap[sedeId]) {
        sedesMap[sedeId] = {
          sede: oferta.sede,
          cargos: []
        }
      }
      // Evitar duplicados si el mismo cargo está en varias convocatorias para la misma sede
      // aunque técnicamente deberían ser registros de oferta distintos (IDs distintos)
      sedesMap[sedeId].cargos.push({
        id: oferta.id,
        cargo: oferta.cargo,
        convocatoria: conv.titulo
      })
    })
  })

  return Object.values(sedesMap)
})

const existingPhotoUrl = computed(() => {
  if (store.esPostulanteExistente && typeof postulante.value.foto_perfil === 'string') {
    return `http://localhost:8000/storage/${postulante.value.foto_perfil}`
  }
  return null
})

// Computed para detalles de lo seleccionado
const selectedOfertasDetails = computed(() => {
   const details = []
   const todasLasOfertas = []

   store.convocatorias.forEach(conv => {
     conv.ofertas.forEach(o => {
       todasLasOfertas.push({
         id: o.id,
         cargo: o.cargo.nombre,
         sede: o.sede.nombre
       })
     })
   })

   ofertasSeleccionadas.value.forEach(id => {
      const oferta = todasLasOfertas.find(o => o.id === id)
      if (oferta) {
        details.push(oferta)
      }
   })
   return details
})

const toggleOferta = (id) => {
   const index = ofertasSeleccionadas.value.indexOf(id)
   if (index > -1) {
      ofertasSeleccionadas.value.splice(index, 1)
   }
}

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

// Constantes
const currentYear = new Date().getFullYear()

const tiposProduccion = [
  { label: 'Libro', value: 'libro' },
  { label: 'Artículo Científico', value: 'articulo' },
  { label: 'Software', value: 'software' },
  { label: 'Investigación', value: 'investigacion' },
  { label: 'Proyecto', value: 'proyecto' },
  { label: 'Otro', value: 'otro' },
]

// Métodos
const formatDate = (date) => {
  return new Date(date).toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

const verificarCI = async () => {
  if (!ci.value) return

  try {
    await store.verificarCI(ci.value)

    if (store.esPostulanteExistente) {
      $q.notify({
        type: 'positive',
        message: '¡Bienvenido de nuevo!',
        caption: 'Hemos cargado sus datos automáticamente.',
        icon: 'person',
        timeout: 3000
      })
    }
  } catch (e) {
    console.warn('Postulante no encontrado o error:', e)
  }
}

const avanzarStep = async () => {
  if (step.value === 1) { // Selección de Cargos
    if (ofertasSeleccionadas.value.length === 0) {
      $q.notify({
        type: 'warning',
        message: 'Debe seleccionar al menos un cargo para postular.',
        position: 'center'
      })
      return
    }
  }

  if (step.value === 2) { // Datos Personales (incluye CI)
    const valid = await form2.value.validate()
    if (!valid) {
      $q.notify({
        type: 'warning',
        message: 'Por favor complete todos los campos requeridos.',
        position: 'top'
      })
      return
    }

    // Si el CI es nuevo o cambió, podríamos verificarlo aquí silenciosamente si fuera necesario
    // Pero por ahora confiamos en la validación directa
  }

  if (step.value === 3) { // Hoja de Vida
    // Validar que tenga al menos una formación
    if (formaciones.value.length === 0) {
      $q.notify({
        type: 'warning',
        message: 'Debe agregar al menos una formación académica.',
        position: 'top'
      })
      return
    }

    // Validar que tenga al menos una experiencia
    if (experiencias.value.length === 0) {
      $q.notify({
        type: 'warning',
        message: 'Debe agregar al menos una experiencia profesional.',
        position: 'top'
      })
      return
    }

    // Validar todos los campos del formulario
    const valid = await form3.value.validate()
    if (!valid) {
      $q.notify({
        type: 'negative',
        message: 'Por favor complete correctamente todos los campos marcados como requeridos.',
        caption: 'Revise los campos resaltados en rojo.',
        multiLine: true,
        position: 'top',
        timeout: 5000
      })
      return
    }
  }

  stepper.value.next()
}

const agregarFormacion = () => {
  formaciones.value.push({
    nivel: 'licenciatura',
    titulo_profesion: '',
    universidad: '',
    anio_emision: currentYear,
    archivo: null
  })
}

const agregarExperiencia = () => {
  experiencias.value.push({
    cargo_desempenado: '',
    empresa_institucion: '',
    anio_inicio: '',
    anio_fin: '',
    funciones: '',
    archivo: null
  })
}

const agregarCapacitacion = () => {
  capacitaciones.value.push({
    nombre_curso: '',
    institucion_emisora: '',
    carga_horaria: null,
    anio: currentYear,
    archivo: null
  })
}

const agregarProduccion = () => {
  producciones.value.push({
    tipo: 'libro',
    titulo: '',
    descripcion: '',
    anio: currentYear,
    archivo: null
  })
}

const agregarReconocimiento = () => {
  reconocimientos.value.push({
    tipo_reconocimiento: '',
    titulo: '',
    otorgado_por: '',
    anio: currentYear,
    archivo: null
  })
}

const eliminarRegistro = (seccion, index) => {
  store.eliminarRegistro(seccion, index)
}

const onRejected = () => {
  $q.notify({
    type: 'negative',
    message: 'Archivo rechazado: Verifique el formato y tamaño (máx 2MB)'
  })
}

const enviarPostulacion = async () => {
  // Validaciones de seguridad antes de enviar
  if (ofertasSeleccionadas.value.length === 0) {
    $q.notify({ type: 'warning', message: 'Seleccione al menos un cargo' })
    step.value = 1
    return
  }

  if (!postulante.value.nombres || !postulante.value.apellidos || !ci.value) {
    $q.notify({ type: 'warning', message: 'Complete sus datos personales' })
    step.value = 2
    return
  }

  if (formaciones.value.length === 0) {
    $q.notify({ type: 'warning', message: 'Agregue al menos una formación académica' })
    step.value = 3
    return
  }

  try {
    await store.enviarPostulacion()

    $q.notify({
      type: 'positive',
      message: '¡Postulación enviada exitosamente!',
      icon: 'check_circle',
      timeout: 5000
    })

    // Mostrar diálogo de éxito
    $q.dialog({
      title: '¡Postulación Exitosa!',
      message: 'Su postulación ha sido registrada. Puede consultar el estado de su postulación en cualquier momento ingresando su CI.',
      persistent: true,
      ok: {
        label: 'Entendido',
        color: 'primary'
      }
    }).onOk(() => {
      store.reset()
      step.value = 1
    })

  } catch (e) {
    console.error('Error postulación:', e)
    console.log('Response data:', e.response?.data)

    const serverMessage = e.response?.data?.message
    const errors = e.response?.data?.errors
    const erroresArray = e.response?.data?.errores

    let detail = ''
    if (errors) {
      detail = Object.values(errors).flat().join('\n')
    } else if (erroresArray && erroresArray.length > 0) {
      detail = erroresArray.join('\n')
    }

    $q.notify({
      type: 'negative',
      message: serverMessage || 'Error al enviar postulación',
      caption: detail || 'Revise los datos e intente nuevamente.',
      multiLine: true,
      position: 'top',
      timeout: 10000
    })
  }
}

// Cargar convocatorias al montar
onMounted(async () => {
  try {
    // Siempre cargar todas las convocatorias abiertas para mostrar los cargos
    await store.cargarConvocatorias()

    if (ofertasAgregadasPorSede.value.length > 0) {
      activeSedeTab.value = ofertasAgregadasPorSede.value[0].sede.id
    }

    const slugFromRoute = route.params.slug
    if (slugFromRoute) {
      const data = await store.cargarConvocatoria(slugFromRoute)
      convocatoria.value = data
    }
  } catch (e) {
    console.error('Error inicializando:', e)
  }
})
</script>

<style scoped>
.stepper-container {
  width: 100%;
  padding-bottom: 60px;
}

.stepper-wrapper {
  margin-top: -30px;
  position: relative;
  z-index: 10;
}

.hero-content {
  position: relative;
  z-index: 2;
}

.hero-section {
  background: linear-gradient(135deg, #f0f4ff 0%, #e0e7ff 100%);
  padding: 2rem 1rem;
  text-align: center;
  border-bottom: 1px solid rgba(0,0,0,0.05);
}

.hero-title {
  font-size: 1.8rem;
  font-weight: 800;
  color: #1a202c;
  margin: 0;
  line-height: 1.2;
}

.hero-subtitle {
  font-size: 1rem;
  color: #4a5568;
  max-width: 600px;
  margin: 1rem auto 0;
}

.hero-icon {
  animation: float 6s ease-in-out infinite;
}

.stepper-premium {
  background: transparent;
  width: 100%;
}

.step-content {
  background: transparent;
  padding: 0;
  box-shadow: none;
}

.scrollable-step {
  padding-right: 0;
}

.scroll-section {
  padding: 1rem;
  border: 1px solid #f3f4f6;
  border-radius: 12px;
  background-color: #ffffff;
}

.merit-card {
  border-left: 4px solid var(--q-primary);
  transition: all 0.3s ease;
}

.merit-card:hover {
  transform: translateX(4px);
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
}

.animate-fadeInUp {
  animation: fadeInUp 0.5s ease-out forwards;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes float {
  0% { transform: translateY(0px); }
  50% { transform: translateY(-10px); }
  100% { transform: translateY(0px); }
}

/* Custom Scrollbar for the long step */
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
.scrollable-step::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}

.hero-icon {
  background: var(--gradient-primary);
  width: 100px;
  height: 100px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto;
  box-shadow: var(--shadow-glow);
}

.hero-dates {
  display: flex;
  justify-content: center;
  gap: 12px;
}

.step-content {
  padding: 0;
}

.sede-group {
  background: var(--bg-dark);
  border-radius: var(--radius-lg);
  overflow: hidden;
  border: 1px solid var(--border-color);
}

.sede-header {
  background: var(--bg-card-hover);
  display: flex;
  align-items: center;
  border-bottom: 1px solid var(--border-color);
}

.cargos-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 8px;
}

.cargo-checkbox {
  background: var(--bg-card);
  padding: 12px 16px;
  border-radius: var(--radius-md);
  border: 1px solid var(--border-color);
  transition: all var(--transition-normal);
}

.cargo-checkbox:hover {
  border-color: var(--primary);
  background: var(--bg-card-hover);
}

.selection-summary {
  background: rgba(16, 185, 129, 0.1);
  border: 1px solid rgba(16, 185, 129, 0.3);
  border-radius: var(--radius-md);
}

.merit-card {
  background: var(--bg-dark);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  transition: all var(--transition-normal);
}

.merit-card:hover {
  border-color: var(--primary);
}

.confirmation-icon {
  background: rgba(99, 102, 241, 0.1);
  width: 140px;
  height: 140px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto;
  animation: pulse-glow 2s ease-in-out infinite;
}

.summary-card {
  background: var(--bg-dark);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-lg);
}

.stat-mini {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px;
  background: var(--bg-card);
  border-radius: var(--radius-md);
}

/* Responsive Navigation Fixed at Bottom for Mobile */
@media (max-width: 600px) {
  .q-stepper__content {
    padding-bottom: 80px; /* Space for fixed buttons if needed */
  }
}
</style>
