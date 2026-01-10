import { ref } from 'vue'

/**
 * Composable para manejo de drag & drop de archivos
 */
export function useDragDrop(options = {}) {
    const {
        accept = '.pdf,.jpg,.jpeg,.png',
        maxSize = 2 * 1024 * 1024, // 2MB por defecto
        multiple = false
    } = options

    const isDragging = ref(false)
    const dragError = ref(null)

    /**
     * Validar archivo
     */
    const validateFile = (file) => {
        // Validar tipo
        const acceptTypes = accept.split(',').map(t => t.trim().toLowerCase())
        const fileExt = '.' + file.name.split('.').pop().toLowerCase()
        const isValidType = acceptTypes.some(type => {
            if (type.startsWith('.')) return fileExt === type
            return file.type.includes(type.replace('*', ''))
        })

        if (!isValidType) {
            return `Tipo de archivo no permitido. Use: ${accept}`
        }

        // Validar tamaño
        if (file.size > maxSize) {
            const maxMb = (maxSize / 1024 / 1024).toFixed(1)
            return `El archivo excede el tamaño máximo de ${maxMb}MB`
        }

        return null
    }

    /**
     * Manejar evento dragover
     */
    const handleDragOver = (e) => {
        e.preventDefault()
        e.stopPropagation()
        isDragging.value = true
        dragError.value = null
    }

    /**
     * Manejar evento dragleave
     */
    const handleDragLeave = (e) => {
        e.preventDefault()
        e.stopPropagation()
        isDragging.value = false
    }

    /**
     * Manejar evento drop
     * @returns {File|File[]|null}
     */
    const handleDrop = (e, callback) => {
        e.preventDefault()
        e.stopPropagation()
        isDragging.value = false
        dragError.value = null

        const files = Array.from(e.dataTransfer?.files || [])

        if (files.length === 0) {
            dragError.value = 'No se detectaron archivos'
            return null
        }

        // Validar archivos
        const validFiles = []
        for (const file of files) {
            const error = validateFile(file)
            if (error) {
                dragError.value = error
                return null
            }
            validFiles.push(file)
            if (!multiple) break
        }

        const result = multiple ? validFiles : validFiles[0]

        if (callback) {
            callback(result)
        }

        return result
    }

    /**
     * Props para zona drop
     */
    const dropZoneProps = {
        onDragover: handleDragOver,
        onDragleave: handleDragLeave
    }

    return {
        isDragging,
        dragError,
        validateFile,
        handleDragOver,
        handleDragLeave,
        handleDrop,
        dropZoneProps
    }
}
