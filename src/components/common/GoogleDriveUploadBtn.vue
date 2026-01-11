<template>
    <q-btn outline color="primary" class="q-px-sm" :loading="isPicking" @click="handleClick" no-caps>
        <div class="flex items-center gap-2">
            <q-img src="https://upload.wikimedia.org/wikipedia/commons/1/12/Google_Drive_icon_%282020%29.svg"
                width="18px" height="18px" />
            <span class="text-xs font-medium">Drive</span>
        </div>
        <q-tooltip>Seleccionar desde Google Drive</q-tooltip>
    </q-btn>
</template>

<script setup>
import { useGoogleDrive } from 'src/composables/useGoogleDrive'

const props = defineProps({
    mimeTypes: {
        type: String,
        default: 'application/pdf'
    }
})

const emit = defineEmits(['file-selected'])
const { openDrivePicker, isPicking } = useGoogleDrive()

const handleClick = () => {
    openDrivePicker((file) => {
        emit('file-selected', file)
    }, props.mimeTypes)
}
</script>
