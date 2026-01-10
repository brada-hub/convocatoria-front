<template>
  <q-page class="index-page">
    <StepperPostulacion />
  </q-page>
</template>

<script setup>
import StepperPostulacion from 'components/StepperPostulacion.vue'
</script>

<style scoped>
.index-page {
  min-height: 100vh;
  background: var(--bg-dark);
}
</style>
