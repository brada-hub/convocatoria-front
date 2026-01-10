<template>
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
                    <div class="text-h6">{{ store.postulante.nombres }} {{ store.postulante.apellidos }}</div>
                    <div class="text-body2">CI: {{ store.ci }}</div>
                    <div class="text-body2">Tel: {{ store.postulante.celular }}</div>
                </div>
                <div class="col-12 col-md-6">
                    <div class="text-subtitle2 text-grey-5">CARGOS SELECCIONADOS</div>
                    <div class="text-h6">{{ store.ofertasSeleccionadas.length }} cargo(s)</div>
                </div>
                <div class="col-12 col-md-3">
                    <div class="stat-mini">
                        <q-icon name="school" size="24px" color="primary" />
                        <span>{{ store.formaciones.length }} Formaciones</span>
                    </div>
                </div>
                <div class="col-12 col-md-3">
                    <div class="stat-mini">
                        <q-icon name="work" size="24px" color="secondary" />
                        <span>{{ store.experiencias.length }} Experiencias</span>
                    </div>
                </div>
                <div class="col-12 col-md-3">
                    <div class="stat-mini">
                        <q-icon name="menu_book" size="24px" color="warning" />
                        <span>{{ store.capacitaciones.length }} Cursos</span>
                    </div>
                </div>
                <div class="col-12 col-md-3">
                    <div class="stat-mini">
                        <q-icon name="emoji_events" size="24px" color="positive" />
                        <span>{{ store.producciones.length + store.reconocimientos.length }} Otros</span>
                    </div>
                </div>
            </div>
        </div>

        <div class="flex flex-col items-center gap-4">
            <q-btn class="btn-primary q-px-xl" size="lg" icon="send" label="Enviar Postulación" :loading="store.loading"
                @click="enviarPostulacion" no-caps />
            <q-btn flat color="grey-7" label="Regresar a Hoja de Vida" icon="arrow_back" @click="emit('prev')"
                no-caps />
        </div>
    </div>
</template>

<script setup>
import { usePostulacionStore } from 'stores/postulacion-store'
import { useQuasar } from 'quasar'

const store = usePostulacionStore()
const $q = useQuasar()
const emit = defineEmits(['prev', 'success'])

const enviarPostulacion = async () => {
    // Validaciones finales por seguridad
    if (store.ofertasSeleccionadas.length === 0) {
        $q.notify({ type: 'warning', message: 'Seleccione al menos un cargo' })
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

        // Dialogo de Éxito
        $q.dialog({
            title: '¡Postulación Exitosa!',
            message: 'Su postulación ha sido registrada. Puede consultar el estado de su postulación en cualquier momento ingresando su CI.',
            persistent: true,
            ok: {
                label: 'Entendido',
                color: 'primary'
            }
        }).onOk(() => {
            // Resetear store y avisar al padre
            store.reset()
            emit('success')
        })

    } catch (e) {
        console.error('Error postulación:', e)
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
</script>

<style scoped>
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
    background: var(--bg-card);
    /* Usamos variable global si existe, o fallback */
    background: #ffffff;
    border: 1px solid #e5e7eb;
    border-radius: 12px;
}

.stat-mini {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 12px;
    background: #f9fafb;
    border-radius: 8px;
}

@keyframes pulse-glow {
    0% {
        box-shadow: 0 0 0 0 rgba(99, 102, 241, 0.4);
    }

    70% {
        box-shadow: 0 0 0 20px rgba(99, 102, 241, 0);
    }

    100% {
        box-shadow: 0 0 0 0 rgba(99, 102, 241, 0);
    }
}
</style>
