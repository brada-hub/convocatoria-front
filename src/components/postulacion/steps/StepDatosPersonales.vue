<template>
    <q-form ref="form" class="step-content animate-fadeInUp">
        <div class="text-h5 q-mb-md text-weight-bold flex items-center">
            <q-icon name="person" class="q-mr-sm" color="primary" />
            Datos Personales
        </div>

        <div class="row q-col-gutter-md">
            <div class="col-12 text-blue-900 bg-blue-50 p-3 rounded-lg q-mb-sm text-center"
                v-if="store.esPostulanteExistente">
                <q-icon name="check_circle" color="positive" /> Datos cargados automáticamente. Verifique su
                información.
            </div>

            <!-- 1. Nombres -->
            <div class="col-12 col-md-6">
                <q-input v-model="store.postulante.nombres" filled label="Nombres *"
                    :rules="[val => !!val || 'Requerido']">
                    <template v-slot:prepend>
                        <q-icon name="person" />
                    </template>
                </q-input>
            </div>

            <!-- 2. Apellidos -->
            <div class="col-12 col-md-6">
                <q-input v-model="store.postulante.apellidos" filled label="Apellidos *"
                    :rules="[val => !!val || 'Requerido']">
                    <template v-slot:prepend>
                        <q-icon name="person_outline" />
                    </template>
                </q-input>
            </div>

            <!-- 3. Foto de Perfil -->
            <div class="col-12">
                <div class="text-subtitle2 q-mb-xs text-grey-8 font-bold">Fotografía Personal *</div>
                <div v-if="photoPreviewUrl"
                    class="mb-3 flex items-center gap-4 p-3 bg-gray-50 rounded-lg border border-gray-200 w-full md:w-1/2">
                    <q-avatar size="60px" class="shadow-sm">
                        <img :src="photoPreviewUrl" class="object-cover">
                    </q-avatar>
                    <div>
                        <div class="text-sm font-bold text-green-700 flex items-center gap-1">
                            <q-icon name="check_circle" color="positive" />
                            Foto cargada
                        </div>
                        <div class="text-xs text-gray-500 mt-0.5 ellipse">
                            {{ store.postulante.foto_perfil?.name || 'Foto actual' }}
                        </div>
                    </div>
                </div>
                <q-file v-model="store.postulante.foto_perfil" filled label="Subir fotografía (Rostro)"
                    accept="image/*,application/pdf" max-file-size="5242880" @rejected="onRejected" class="full-width"
                    :rules="[val => (!!val || !!existingPhotoUrl) || 'Foto requerida']">
                    <template v-slot:prepend>
                        <q-icon name="photo_camera" />
                    </template>
                </q-file>
            </div>

            <!-- 4. Cédula de Identidad + Expedido -->
            <div class="col-12 col-md-6">
                <div class="row q-col-gutter-sm">
                    <div class="col-8">
                        <q-input v-model="store.ci" filled label="Cédula de Identidad *" placeholder="Ej: 12345678"
                            :rules="[val => !!val || 'Requerido']" @blur="verificarCI" :loading="store.loading">
                            <template v-slot:append>
                                <q-btn flat round dense icon="search" v-if="!store.loading" @click="verificarCI" color="primary">
                                    <q-tooltip>Verificar si ya estoy registrado</q-tooltip>
                                </q-btn>
                            </template>
                            <template v-slot:prepend>
                                <q-icon name="badge" />
                            </template>
                        </q-input>
                    </div>
                    <div class="col-4">
                        <q-select v-model="store.postulante.ci_expedido" filled label="Exp. *"
                            :options="departamentosBolivia" emit-value map-options
                            :rules="[val => !!val || 'Requerido']">
                            <template v-slot:prepend>
                                <q-icon name="location_on" />
                            </template>
                        </q-select>
                    </div>
                </div>
            </div>

            <!-- 5. Nacionalidad -->
            <div class="col-12 col-md-6">
                <q-input v-model="store.postulante.nacionalidad" filled label="Nacionalidad *"
                    :rules="[val => !!val || 'Requerido']">
                    <template v-slot:prepend>
                        <q-icon name="public" />
                    </template>
                </q-input>
            </div>

            <!-- 6. Dirección -->
            <div class="col-12">
                <q-input v-model="store.postulante.direccion" filled label="Dirección de domicilio *"
                    :rules="[val => !!val || 'Requerido']">
                    <template v-slot:prepend>
                        <q-icon name="home" />
                    </template>
                </q-input>
            </div>

            <!-- 7. Celular -->
            <div class="col-12 col-md-6">
                <q-input v-model="store.postulante.celular" filled label="Número de celular de contacto *" mask="########"
                    :rules="[val => !!val || 'Requerido']">
                    <template v-slot:prepend>
                        <q-icon name="phone" />
                    </template>
                </q-input>
            </div>

             <!-- 8. Correo -->
            <div class="col-12 col-md-6">
                <q-input v-model="store.postulante.email" filled label="Correo electrónico *" type="email"
                    :rules="[val => !!val || 'Requerido', val => /.+@.+\..+/.test(val) || 'Correo inválido']">
                    <template v-slot:prepend>
                        <q-icon name="email" />
                    </template>
                </q-input>
            </div>

            <!-- Los documentos como Carta, CV y CI ahora se manejan dinámicamente según la convocatoria -->
            <div class="col-12" v-if="personalRequirements.length > 0">
                <div class="text-h6 q-mb-md flex items-center gap-2" style="color: #f59e0b;">
                    <q-icon name="folder_open" size="28px" />
                    Documentos Requeridos
                </div>
            </div>

            <template v-for="req in personalRequirements" :key="req.id">
                <div v-for="(item, index) in store.documentos[req.id]" :key="req.id + '-' + index" class="col-12 col-md-4">
                    <div class="document-card group/doc relative h-full">
                        <div class="document-title truncate pr-8" :title="req.nombre">
                            {{ req.nombre }} <span v-if="req.obligatorio" class="text-red">*</span>
                        </div>
                        <div class="document-dropzone" v-ripple @click="triggerPersonalFilePicker(req.id)">
                            <q-icon :name="req.icono || 'cloud_upload'" size="40px" class="text-amber-500 transform group-hover/doc:scale-110 transition-transform" />
                            <div class="text-amber-600 font-medium mt-2">Click para subir</div>
                            <div class="text-grey-5 text-xs">PDF · Max 2MB</div>
                            <div v-if="item.archivo" class="uploaded-file">
                                <q-icon name="check_circle" color="positive" size="16px" />
                                {{ item.archivo.name || 'Archivo cargado' }}
                            </div>
                        </div>
                        <GoogleDriveUploadBtn class="drive-btn" @file-selected="(f) => store.setDocumento(req.id, index, f)" />
                        <q-file :ref="el => setPersonalFileRef(el, req.id)" :model-value="item.archivo"
                            @update:model-value="(f) => store.setDocumento(req.id, index, f)" accept=".pdf"
                            max-file-size="2097152" @rejected="onRejected" class="hidden"
                            :rules="req.obligatorio ? [val => !!val || 'Requerido'] : []" />
                    </div>
                </div>
            </template>
        </div>


        <!-- Botones Navegación Step 2 -->
        <div class="flex justify-between mt-8 pt-4 border-t border-gray-200">
            <q-btn flat color="primary" icon="arrow_back" label="Atrás" @click="emit('prev')" no-caps />
            <q-btn unelevated color="primary" label="Siguiente" icon-right="arrow_forward" @click="validateAndNext"
                no-caps class="px-6" />
        </div>
    </q-form>
</template>

<script setup>
import { ref, computed, reactive, onMounted } from 'vue'
import { usePostulacionStore } from 'stores/postulacion-store'
import { useQuasar } from 'quasar'
import GoogleDriveUploadBtn from 'src/components/common/GoogleDriveUploadBtn.vue'


const store = usePostulacionStore()
const $q = useQuasar()
const form = ref(null)

const emit = defineEmits(['next', 'prev'])

// Lógica para documentos dinámicos de categoría Personal
const personalRequirements = computed(() => {
    return store.documentosRequeridos.filter(req => req.categoria === 'personal')
})

const personalFileRefs = reactive({})
const setPersonalFileRef = (el, typeId) => {
    if (el) personalFileRefs[typeId] = el
}

const triggerPersonalFilePicker = (typeId) => {
    const ref = personalFileRefs[typeId]
    if (ref) {
        if (typeof ref.pickFiles === 'function') ref.pickFiles()
        else ref.$el?.click() || ref.click?.()
    }
}

onMounted(() => {
  // Asegurar que existan los slots para los documentos personales requeridos
  personalRequirements.value.forEach(req => {
    if (!store.documentos[req.id] || store.documentos[req.id].length === 0) {
      store.agregarDocumentoDinamico(req.id)
    }
  })
})

// Departamentos de Bolivia para el selector de Expedido
const departamentosBolivia = [
    { label: 'LP', value: 'LP' },
    { label: 'CB', value: 'CB' },
    { label: 'SC', value: 'SC' },
    { label: 'OR', value: 'OR' },
    { label: 'PT', value: 'PT' },
    { label: 'TJ', value: 'TJ' },
    { label: 'CH', value: 'CH' },
    { label: 'BE', value: 'BE' },
    { label: 'PA', value: 'PA' },
]

const existingPhotoUrl = computed(() => {
    if (store.esPostulanteExistente && typeof store.postulante.foto_perfil === 'string') {
        const storageBaseUrl = process.env.PROD
            ? 'https://api.sipo.xpertiaplus.com/storage/'
            : 'http://localhost:8000/storage/'
        return storageBaseUrl + store.postulante.foto_perfil
    }
    return null
})

// Preview URL: muestra foto existente del servidor O preview de archivo nuevo
const photoPreviewUrl = computed(() => {
    // Si se subió un nuevo archivo, crear URL temporal
    if (store.postulante.foto_perfil instanceof File) {
        return URL.createObjectURL(store.postulante.foto_perfil)
    }
    // Si es postulante existente con foto en servidor
    return existingPhotoUrl.value
})

const verificarCI = async () => {
    if (!store.ci) return

    try {
        await store.verificarCI(store.ci)

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

const onRejected = () => {
    $q.notify({
        type: 'negative',
        message: 'Archivo rechazado: Verifique el formato y tamaño (máx 2MB)'
    })
}

const validateAndNext = async () => {
    const valid = await form.value.validate()
    if (!valid) {
        $q.notify({
            type: 'warning',
            message: 'Por favor complete todos los campos requeridos.',
            position: 'top'
        })
        return
    }
    emit('next')
}
</script>

<style scoped>
.document-card {
    background: white;
    border: 2px solid #fef3c7;
    border-radius: 12px;
    padding: 16px;
    position: relative;
    transition: all 0.2s ease;
}

.document-card:hover {
    border-color: #f59e0b;
    box-shadow: 0 4px 12px rgba(245, 158, 11, 0.15);
}

.document-title {
    font-weight: 600;
    color: #374151;
    margin-bottom: 12px;
    font-size: 14px;
}

.document-dropzone {
    border: 2px dashed #fcd34d;
    border-radius: 8px;
    padding: 24px 16px;
    text-align: center;
    cursor: pointer;
    transition: all 0.2s ease;
    background: #fffbeb;
}

.document-dropzone:hover {
    border-color: #f59e0b;
    background: #fef3c7;
}

.uploaded-file {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    margin-top: 8px;
    font-size: 11px;
    color: #059669;
    font-weight: 500;
    word-break: break-all;
}

.drive-btn {
    position: absolute;
    top: 12px;
    right: 12px;
}

.hidden {
    display: none !important;
}
</style>
