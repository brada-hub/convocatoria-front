<template>
  <div class="q-pa-md">
    <q-stepper
      v-model="step"
      ref="stepper"
      color="primary"
      animated
      header-nav
    >
      <!-- Paso 0: Identificación -->
      <q-step
        :name="1"
        title="Identificación"
        icon="perm_identity"
        :done="step > 1"
      >
        <div class="text-h6 q-mb-md">Bienvenido</div>
        <p>Ingrese su CI para comenzar o continuar su postulación.</p>
        <q-input
          filled
          v-model="ci"
          label="CI (Ej: 1234567 LP)"
          class="q-mb-md"
          @keyup.enter="checkCI"
        />
        <q-btn color="primary" label="Verificar CI" @click="checkCI" :loading="loading" />
      </q-step>

      <!-- Paso 1: Datos Personales -->
      <q-step
        :name="2"
        title="Datos Personales"
        icon="person"
        :done="step > 2"
      >
        <div class="row q-col-gutter-md">
          <div class="col-12">
            <q-input filled v-model="form.nombre_completo" label="Nombre Completo" />
          </div>
          <div class="col-6">
            <q-input filled v-model="form.email" label="Email" type="email" />
          </div>
          <div class="col-6">
            <q-input filled v-model="form.telefono" label="Teléfono" />
          </div>
        </div>
      </q-step>

      <!-- Paso 2: Formación Académica -->
      <q-step
        :name="3"
        title="Formación"
        icon="school"
        :done="step > 3"
      >
        <div v-for="(item, index) in form.formaciones" :key="index" class="q-mb-lg border-bottom q-pb-md">
          <div class="row q-col-gutter-sm items-center">
            <div class="col-3">
              <q-select
                filled
                v-model="item.tipo"
                :options="['pregrado', 'postgrado']"
                label="Tipo"
              />
            </div>
            <div class="col-4">
              <q-input filled v-model="item.titulo" label="Título" />
            </div>
            <div class="col-3">
              <q-input filled v-model="item.universidad" label="Universidad" />
            </div>
            <div class="col-1">
              <q-btn round flat color="negative" icon="delete" @click="removeRecord('formaciones', index)" />
            </div>
          </div>
        </div>
        <q-btn outline color="primary" icon="add" label="Agregar Título" @click="addRecord('formaciones', {tipo: 'pregrado', titulo: '', universidad: ''})" />
      </q-step>

      <!-- Paso 3: Experiencia -->
      <q-step
        :name="4"
        title="Experiencia"
        icon="work"
        :done="step > 4"
      >
        <p class="text-caption text-negative">* Solo se permiten registros de los últimos 5 años.</p>
        <div v-for="(item, index) in form.experiencias" :key="index" class="q-mb-lg border-bottom q-pb-md">
          <div class="row q-col-gutter-sm">
            <div class="col-4">
              <q-input filled v-model="item.cargo" label="Cargo/Materia" />
            </div>
            <div class="col-4">
              <q-input filled v-model="item.institucion" label="Institución" />
            </div>
            <div class="col-2">
              <q-input filled v-model="item.fecha_fin" label="Fecha Fin" type="date" />
            </div>
            <div class="col-1">
              <q-btn round flat color="negative" icon="delete" @click="removeRecord('experiencias', index)" />
            </div>
          </div>
        </div>
        <q-btn outline color="primary" icon="add" label="Agregar Experiencia" @click="addRecord('experiencias', {cargo: '', institucion: '', fecha_fin: ''})" />
      </q-step>

      <!-- Paso 4: Finalizar -->
      <q-step
        :name="5"
        title="Enviar"
        icon="send"
      >
        <div class="text-center q-pa-xl">
          <q-icon name="check_circle" color="positive" size="100px" />
          <div class="text-h5 q-mt-md">Todo listo</div>
          <p>Verifique su información antes de enviar su postulación.</p>
          <q-btn color="positive" size="lg" label="Finalizar Postulación" @click="submitPostulacion" :loading="loading" />
        </div>
      </q-step>

      <template v-slot:navigation>
        <q-stepper-navigation v-if="step > 1">
          <q-btn v-if="step < 5" color="primary" @click="$refs.stepper.next()" label="Siguiente" />
          <q-btn flat color="primary" @click="$refs.stepper.previous()" label="Atrás" class="q-ml-sm" />
        </q-stepper-navigation>
      </template>
    </q-stepper>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { api } from 'boot/axios'
import { useQuasar } from 'quasar'

const $q = useQuasar()
const step = ref(1)
const ci = ref('')
const loading = ref(false)

const form = reactive({
  nombre_completo: '',
  email: '',
  telefono: '',
  formaciones: [],
  experiencias: [],
  capacitaciones: [],
  reconocimientos: []
})

const checkCI = async () => {
  if (!ci.value) return
  loading.value = true
  try {
    const response = await api.post('/check-ci', { ci: ci.value, slug: 'convocatoria-ejemplo' })
    if (response.data.status === 'exists') {
      $q.notify({
        type: 'warning',
        message: `Ya existe una postulación. Estado: ${response.data.estado}`
      })
    } else {
      step.value = 2
    }
  } catch {
    $q.notify({ type: 'negative', message: 'Error de conexión' })
  } finally {
    loading.value = false
  }
}

const addRecord = (field, structure) => {
  form[field].push({...structure})
}

const removeRecord = (field, index) => {
  form[field].splice(index, 1)
}

const submitPostulacion = async () => {
  loading.value = true
  try {
    // Aquí se enviaría el form como FormData
    await api.post('/postular', { ...form, ci: ci.value, convocatoria_id: 1 })
    $q.notify({ type: 'positive', message: 'Postulación enviada con éxito' })
    step.value = 1
    ci.value = ''
  } catch {
    $q.notify({ type: 'negative', message: 'Error al enviar' })
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.border-bottom {
  border-bottom: 1px solid #ddd;
}
</style>
