<template>
    <q-dialog v-model="showPreview" maximized>
        <q-card class="bg-gray-900">
            <q-card-section class="flex items-center justify-between bg-gray-800 border-b border-gray-700 py-3 px-4">
                <div class="flex items-center gap-3 text-white">
                    <q-icon name="picture_as_pdf" size="24px" class="text-red-400" />
                    <span class="font-medium">{{ fileName }}</span>
                </div>
                <div class="flex items-center gap-2">
                    <q-btn flat round icon="zoom_out" @click="zoom -= 0.1" :disable="zoom <= 0.5" class="text-white" />
                    <span class="text-white text-sm">{{ Math.round(zoom * 100) }}%</span>
                    <q-btn flat round icon="zoom_in" @click="zoom += 0.1" :disable="zoom >= 2" class="text-white" />
                    <q-btn flat round icon="download" @click="downloadPdf" class="text-white" />
                    <q-btn flat round icon="close" v-close-popup class="text-white" />
                </div>
            </q-card-section>

            <q-card-section class="q-pa-none flex-1 overflow-auto bg-gray-900" style="height: calc(100vh - 60px);">
                <div class="flex justify-center p-4">
                    <div v-if="loading" class="flex flex-col items-center justify-center text-white py-20">
                        <q-spinner size="48px" color="primary" />
                        <p class="mt-4">Cargando documento...</p>
                    </div>
                    <div v-else-if="error" class="flex flex-col items-center justify-center text-red-400 py-20">
                        <q-icon name="error" size="48px" />
                        <p class="mt-4">{{ error }}</p>
                    </div>
                    <iframe v-else :src="pdfUrl" :style="{ transform: `scale(${zoom})`, transformOrigin: 'top center' }"
                        class="bg-white rounded-lg shadow-2xl" style="width: 100%; height: 90vh; max-width: 900px;" />
                </div>
            </q-card-section>
        </q-card>
    </q-dialog>
</template>

<script setup>
import { ref, computed, watch } from 'vue'

const props = defineProps({
    modelValue: { type: Boolean, default: false },
    file: { type: [File, String], default: null },
    fileName: { type: String, default: 'Documento.pdf' }
})

const emit = defineEmits(['update:modelValue'])

const showPreview = computed({
    get: () => props.modelValue,
    set: (val) => emit('update:modelValue', val)
})

const loading = ref(false)
const error = ref(null)
const zoom = ref(1)
const pdfUrl = ref('')

// Observar cambios en el archivo
watch(() => props.file, async (newFile) => {
    if (!newFile) {
        pdfUrl.value = ''
        return
    }

    loading.value = true
    error.value = null

    try {
        if (newFile instanceof File) {
            // Es un archivo local
            pdfUrl.value = URL.createObjectURL(newFile)
        } else if (typeof newFile === 'string') {
            // Es una URL
            if (newFile.startsWith('http') || newFile.startsWith('blob:')) {
                pdfUrl.value = newFile
            } else {
                // Es una ruta relativa del storage
                const baseUrl = process.env.PROD
                    ? 'https://api.sipo.xpertiaplus.com'
                    : 'http://localhost:8081'
                pdfUrl.value = `${baseUrl}/storage/${newFile}`
            }
        }
    } catch (e) {
        error.value = 'Error al cargar el documento'
        console.error(e)
    } finally {
        loading.value = false
    }
}, { immediate: true })

// Limpiar URL cuando se cierra
watch(showPreview, (isOpen) => {
    if (!isOpen && pdfUrl.value.startsWith('blob:')) {
        URL.revokeObjectURL(pdfUrl.value)
    }
    zoom.value = 1
})

const downloadPdf = () => {
    if (pdfUrl.value) {
        const a = document.createElement('a')
        a.href = pdfUrl.value
        a.download = props.fileName
        a.click()
    }
}
</script>
