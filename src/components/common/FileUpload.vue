<template>
    <div @dragover="handleDragOver" @dragleave="handleDragLeave" @drop="onDrop" @click="triggerInput" :class="[
        'relative border-2 border-dashed rounded-xl transition-all duration-200 cursor-pointer',
        isDragging ? 'border-primary bg-primary/5 scale-[1.02]' : 'border-gray-300 hover:border-primary/50 hover:bg-gray-50'
    ]">
        <input ref="fileInput" type="file" :accept="accept" :multiple="multiple" @change="handleFileSelect"
            class="hidden" />

        <div class="p-6 text-center">
            <!-- Estado: Arrastrando -->
            <div v-if="isDragging" class="text-primary">
                <q-icon name="cloud_upload" size="48px" class="mb-2 animate-bounce" />
                <p class="font-semibold">¡Suelte el archivo aquí!</p>
            </div>

            <!-- Estado: Archivo seleccionado -->
            <div v-else-if="selectedFile" class="flex items-center justify-center gap-4">
                <div class="flex items-center gap-3 bg-green-50 text-green-700 px-4 py-2 rounded-lg">
                    <q-icon :name="fileIcon" size="24px" />
                    <div class="text-left">
                        <p class="font-medium text-sm truncate max-w-[200px]">{{ selectedFile.name }}</p>
                        <p class="text-xs text-green-600">{{ formatSize(selectedFile.size) }}</p>
                    </div>
                    <q-btn flat round dense icon="close" size="sm" @click.stop="clearFile" />
                </div>
                <q-btn v-if="isPdf" flat round icon="visibility" color="primary" @click.stop="showPreview = true">
                    <q-tooltip>Ver documento</q-tooltip>
                </q-btn>
            </div>

            <!-- Estado: Sin archivo -->
            <div v-else class="text-gray-500">
                <q-icon name="upload_file" size="40px" class="mb-2 text-gray-400" />
                <p class="font-medium text-gray-700">{{ label }}</p>
                <p class="text-sm text-gray-400 mt-1">
                    Arrastre un archivo aquí o <span class="text-primary">haga clic para seleccionar</span>
                </p>
                <p class="text-xs text-gray-400 mt-2">
                    Formatos: {{ accept }} • Máximo {{ maxSizeMB }}MB
                </p>
            </div>

            <!-- Error -->
            <p v-if="dragError" class="text-red-500 text-sm mt-2 flex items-center justify-center gap-1">
                <q-icon name="error" size="16px" />
                {{ dragError }}
            </p>
        </div>

        <!-- PDF Preview -->
        <PdfPreview v-model="showPreview" :file="selectedFile" :file-name="selectedFile?.name || 'Documento.pdf'" />
    </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useDragDrop } from '@/composables/useDragDrop'
import PdfPreview from './PdfPreview.vue'

const props = defineProps({
    modelValue: { type: [File, Object], default: null },
    label: { type: String, default: 'Subir archivo' },
    accept: { type: String, default: '.pdf' },
    maxSize: { type: Number, default: 2 * 1024 * 1024 },
    multiple: { type: Boolean, default: false }
})

const emit = defineEmits(['update:modelValue'])

const fileInput = ref(null)
const showPreview = ref(false)

const { isDragging, dragError, handleDragOver, handleDragLeave, handleDrop } = useDragDrop({
    accept: props.accept,
    maxSize: props.maxSize,
    multiple: props.multiple
})

const selectedFile = computed(() => props.modelValue)

const maxSizeMB = computed(() => (props.maxSize / 1024 / 1024).toFixed(0))

const isPdf = computed(() => selectedFile.value?.name?.toLowerCase().endsWith('.pdf'))

const fileIcon = computed(() => {
    if (!selectedFile.value) return 'insert_drive_file'
    const ext = selectedFile.value.name.split('.').pop().toLowerCase()
    if (ext === 'pdf') return 'picture_as_pdf'
    if (['jpg', 'jpeg', 'png', 'gif'].includes(ext)) return 'image'
    return 'insert_drive_file'
})

const formatSize = (bytes) => {
    if (bytes < 1024) return bytes + ' B'
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
    return (bytes / 1024 / 1024).toFixed(1) + ' MB'
}

const triggerInput = () => {
    fileInput.value?.click()
}

const handleFileSelect = (e) => {
    const files = e.target.files
    if (files?.length > 0) {
        emit('update:modelValue', props.multiple ? Array.from(files) : files[0])
    }
}

const onDrop = (e) => {
    const file = handleDrop(e)
    if (file) {
        emit('update:modelValue', file)
    }
}

const clearFile = () => {
    emit('update:modelValue', null)
    if (fileInput.value) fileInput.value.value = ''
}
</script>
