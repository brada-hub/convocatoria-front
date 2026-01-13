<template>
    <q-form ref="form" class="step-content animate-fadeInUp">
        <div class="text-h5 q-mb-md text-weight-bold flex items-center">
            <q-icon name="person" class="q-mr-sm" color="primary" />
            Información Personal
        </div>

        <div class="row q-col-gutter-md">
            <div class="col-12 text-blue-900 bg-blue-50 p-3 rounded-lg q-mb-sm text-center"
                v-if="store.esPostulanteExistente">
                <q-icon name="check_circle" color="positive" /> Datos cargados automáticamente. Verifique su
                información.
            </div>

            <div class="col-12 col-md-6">
                <q-input v-model="store.ci" filled label="Carnet de Identidad *" placeholder="Ej: 12345678"
                    :rules="[val => !!val || 'Requerido']" @blur="verificarCI" :loading="store.loading">
                    <template v-slot:append>
                        <q-btn flat round dense icon="search" v-if="!store.loading" @click="verificarCI"
                            color="primary">
                            <q-tooltip>Buscar si ya estoy registrado</q-tooltip>
                        </q-btn>
                    </template>
                    <template v-slot:prepend>
                        <q-icon name="badge" />
                    </template>
                </q-input>
            </div>
            <div class="col-12 col-md-6">
                <q-input v-model="store.postulante.celular" filled label="Celular *" mask="########"
                    :rules="[val => !!val || 'Requerido']">
                    <template v-slot:prepend>
                        <q-icon name="phone" />
                    </template>
                </q-input>
            </div>
            <div class="col-12 col-md-6">
                <q-input v-model="store.postulante.nombres" filled label="Nombres *"
                    :rules="[val => !!val || 'Requerido']">
                    <template v-slot:prepend>
                        <q-icon name="person" />
                    </template>
                </q-input>
            </div>
            <div class="col-12 col-md-6">
                <q-input v-model="store.postulante.apellidos" filled label="Apellidos *"
                    :rules="[val => !!val || 'Requerido']">
                    <template v-slot:prepend>
                        <q-icon name="person_outline" />
                    </template>
                </q-input>
            </div>
            <div class="col-12 col-md-6">
                <q-input v-model="store.postulante.email" filled label="Correo Electrónico *" type="email"
                    :rules="[val => !!val || 'Requerido', val => /.+@.+\..+/.test(val) || 'Correo inválido']">
                    <template v-slot:prepend>
                        <q-icon name="email" />
                    </template>
                </q-input>
            </div>
            <div class="col-12 col-md-6">
                <div class="text-subtitle2 q-mb-sm text-grey-7">Foto de Perfil *</div>
                <!-- Preview de foto existente o nueva -->
                <div v-if="photoPreviewUrl"
                    class="mb-3 flex items-center gap-4 p-3 bg-gray-50 rounded-lg border border-gray-200">
                    <q-avatar size="70px" class="shadow-md">
                        <img :src="photoPreviewUrl">
                    </q-avatar>
                    <div>
                        <div class="text-sm font-bold text-green-700 flex items-center gap-1">
                            <q-icon name="check_circle" color="positive" />
                            Foto cargada
                        </div>
                        <div class="text-xs text-gray-500 mt-1">
                            {{ store.postulante.foto_perfil?.name || 'Foto de perfil' }}
                        </div>
                    </div>
                </div>
                <div class="flex items-start gap-2">
                    <q-file v-model="store.postulante.foto_perfil" filled label="Seleccionar foto (Rostro)"
                        accept="image/*" max-file-size="2097152" @rejected="onRejected" class="full-width"
                        :rules="[val => (!!val || !!existingPhotoUrl) || 'Foto requerida']">
                        <template v-slot:prepend>
                            <q-icon name="photo_camera" />
                        </template>
                    </q-file>
                    <div class="pt-2">
                        <GoogleDriveUploadBtn mime-types="image/jpeg,image/png,image/jpg"
                            @file-selected="(f) => store.postulante.foto_perfil = f" />
                    </div>
                </div>
            </div>
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
import { ref, computed } from 'vue'
import { usePostulacionStore } from 'stores/postulacion-store'
import { useQuasar } from 'quasar'
import GoogleDriveUploadBtn from 'src/components/common/GoogleDriveUploadBtn.vue'

const store = usePostulacionStore()
const $q = useQuasar()
const form = ref(null)

const emit = defineEmits(['next', 'prev'])

const existingPhotoUrl = computed(() => {
    if (store.esPostulanteExistente && typeof store.postulante.foto_perfil === 'string') {
        const storageBaseUrl = process.env.PROD
            ? 'https://api.sipo.xpertiaplus.com/storage/'
            : 'http://localhost:8081/storage/'
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
