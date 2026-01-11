<template>
  <div class="stepper-container">
    <!-- Stepper Principal -->
    <div class="stepper-wrapper q-pa-md">
      <q-stepper v-model="store.step" ref="stepper" color="primary" animated :contracted="$q.screen.lt.md" flat
        class="stepper-premium">
        <!-- PASO 1: Selección de Cargos -->
        <q-step :name="1" title="Selección de Cargos" icon="work" :done="store.step > 1">
          <StepSeleccionCargos @next="store.step++" />
        </q-step>

        <!-- PASO 2: Datos Personales -->
        <q-step :name="2" title="Datos Personales" icon="person" :done="store.step > 2">
          <StepDatosPersonales @next="store.step++" @prev="store.step--" />
        </q-step>

        <!-- PASO 3: Hoja de Vida -->
        <q-step :name="3" title="Hoja de Vida" icon="description" :done="store.step > 3" class="q-pb-xl">
          <StepHojaVida @next="store.step++" @prev="store.step--" />
        </q-step>

        <!-- PASO 4: Confirmación -->
        <q-step :name="4" title="Confirmar" icon="send">
          <StepConfirmacion @prev="store.step--" @success="onSuccess" />
        </q-step>

      </q-stepper>
    </div>
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { useQuasar } from 'quasar'
import { useRouter } from 'vue-router'
import { usePostulacionStore } from 'stores/postulacion-store'

// Import Steps
import StepSeleccionCargos from './postulacion/steps/StepSeleccionCargos.vue'
import StepDatosPersonales from './postulacion/steps/StepDatosPersonales.vue'
import StepHojaVida from './postulacion/steps/StepHojaVida.vue'
import StepConfirmacion from './postulacion/steps/StepConfirmacion.vue'

const store = usePostulacionStore()
const $q = useQuasar()
const router = useRouter()

// Cargar convocatorias al montar
onMounted(async () => {
  try {
    // Solo cargar la lista de convocatorias abiertas para mostrar los cargos
    await store.cargarConvocatorias()
  } catch (e) {
    console.error('Error cargando convocatorias:', e)
    $q.notify({
      type: 'negative',
      message: 'Error al cargar las convocatorias.'
    })
  }
})

// Redirigir a inicio después de una postulación exitosa
const onSuccess = () => {
  store.step = 1
  router.push('/')
}
</script>

<!-- Global Animations shared with children -->
<style>
.animate-fadeInUp {
  animation: fadeInUp 0.5s ease-out forwards;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes float {
  0% {
    transform: translateY(0px);
  }

  50% {
    transform: translateY(-10px);
  }

  100% {
    transform: translateY(0px);
  }
}
</style>

<style scoped>
.stepper-container {
  width: 100%;
  padding-bottom: 60px;
}

.stepper-wrapper {
  position: relative;
  z-index: 10;
}

.stepper-premium {
  background: transparent;
  width: 100%;
}

/* Responsive Navigation Fixed at Bottom for Mobile */
@media (max-width: 600px) {
  .q-stepper__content {
    padding-bottom: 80px;
  }
}
</style>
