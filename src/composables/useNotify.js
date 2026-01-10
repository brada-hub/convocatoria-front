import { useQuasar } from 'quasar'

/**
 * Composable para notificaciones estandarizadas
 */
export function useNotify() {
    const $q = useQuasar()

    const success = (message, options = {}) => {
        $q.notify({
            type: 'positive',
            message,
            position: 'top',
            timeout: 2500,
            ...options
        })
    }

    const error = (message, options = {}) => {
        $q.notify({
            type: 'negative',
            message,
            position: 'top',
            timeout: 4000,
            ...options
        })
    }

    const warning = (message, options = {}) => {
        $q.notify({
            type: 'warning',
            message,
            position: 'top',
            timeout: 3000,
            ...options
        })
    }

    const info = (message, options = {}) => {
        $q.notify({
            type: 'info',
            message,
            position: 'top',
            timeout: 3000,
            ...options
        })
    }

    /**
     * Notificar error de API
     */
    const apiError = (err, fallbackMessage = 'Error en la operación') => {
        const message = err?.response?.data?.message || err?.message || fallbackMessage
        error(message)
    }

    return {
        success,
        error,
        warning,
        info,
        apiError
    }
}
