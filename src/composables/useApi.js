import { ref } from 'vue'
import { api } from 'boot/axios'
import { useNotify } from './useNotify'

/**
 * Composable para manejo estandarizado de llamadas API
 */
export function useApi() {
    const { apiError } = useNotify()
    const loading = ref(false)
    const error = ref(null)

    /**
     * Ejecutar request GET
     */
    const get = async (url, config = {}) => {
        loading.value = true
        error.value = null
        try {
            const { data } = await api.get(url, config)
            return data
        } catch (err) {
            error.value = err
            if (!config.silent) apiError(err)
            throw err
        } finally {
            loading.value = false
        }
    }

    /**
     * Ejecutar request POST
     */
    const post = async (url, payload = {}, config = {}) => {
        loading.value = true
        error.value = null
        try {
            const { data } = await api.post(url, payload, config)
            return data
        } catch (err) {
            error.value = err
            if (!config.silent) apiError(err)
            throw err
        } finally {
            loading.value = false
        }
    }

    /**
     * Ejecutar request PUT
     */
    const put = async (url, payload = {}, config = {}) => {
        loading.value = true
        error.value = null
        try {
            const { data } = await api.put(url, payload, config)
            return data
        } catch (err) {
            error.value = err
            if (!config.silent) apiError(err)
            throw err
        } finally {
            loading.value = false
        }
    }

    /**
     * Ejecutar request DELETE
     */
    const del = async (url, config = {}) => {
        loading.value = true
        error.value = null
        try {
            const { data } = await api.delete(url, config)
            return data
        } catch (err) {
            error.value = err
            if (!config.silent) apiError(err)
            throw err
        } finally {
            loading.value = false
        }
    }

    /**
     * Ejecutar request PATCH
     */
    const patch = async (url, payload = {}, config = {}) => {
        loading.value = true
        error.value = null
        try {
            const { data } = await api.patch(url, payload, config)
            return data
        } catch (err) {
            error.value = err
            if (!config.silent) apiError(err)
            throw err
        } finally {
            loading.value = false
        }
    }

    return {
        loading,
        error,
        get,
        post,
        put,
        del,
        patch
    }
}
