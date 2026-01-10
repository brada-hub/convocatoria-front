import { useQuasar } from 'quasar'

/**
 * Composable para diálogos de confirmación estandarizados
 */
export function useConfirm() {
    const $q = useQuasar()

    /**
     * Confirmar eliminación
     */
    const confirmDelete = (itemName, options = {}) => {
        return new Promise((resolve) => {
            $q.dialog({
                title: options.title || 'Confirmar Eliminación',
                message: options.message || `¿Está seguro que desea eliminar "${itemName}"? Esta acción no se puede deshacer.`,
                persistent: true,
                ok: {
                    label: 'Eliminar',
                    color: 'negative',
                    flat: true,
                    ...options.ok
                },
                cancel: {
                    label: 'Cancelar',
                    color: 'grey',
                    flat: true,
                    ...options.cancel
                }
            }).onOk(() => resolve(true))
              .onCancel(() => resolve(false))
              .onDismiss(() => resolve(false))
        })
    }

    /**
     * Confirmar acción genérica
     */
    const confirm = (message, options = {}) => {
        return new Promise((resolve) => {
            $q.dialog({
                title: options.title || 'Confirmar',
                message,
                persistent: options.persistent ?? false,
                ok: {
                    label: options.okLabel || 'Aceptar',
                    color: options.okColor || 'primary',
                    flat: true,
                    ...options.ok
                },
                cancel: {
                    label: options.cancelLabel || 'Cancelar',
                    color: 'grey',
                    flat: true,
                    ...options.cancel
                }
            }).onOk(() => resolve(true))
              .onCancel(() => resolve(false))
              .onDismiss(() => resolve(false))
        })
    }

    /**
     * Confirmar con input
     */
    const prompt = (message, options = {}) => {
        return new Promise((resolve) => {
            $q.dialog({
                title: options.title || 'Ingrese datos',
                message,
                prompt: {
                    model: options.defaultValue || '',
                    type: options.type || 'text',
                    ...options.prompt
                },
                persistent: options.persistent ?? false,
                ok: {
                    label: options.okLabel || 'Aceptar',
                    color: 'primary',
                    flat: true
                },
                cancel: {
                    label: 'Cancelar',
                    color: 'grey',
                    flat: true
                }
            }).onOk((val) => resolve(val))
              .onCancel(() => resolve(null))
              .onDismiss(() => resolve(null))
        })
    }

    return {
        confirmDelete,
        confirm,
        prompt
    }
}
