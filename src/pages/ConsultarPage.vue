<template>
  <q-page class="consultar-page flex flex-center">
    <div class="w-full max-w-lg p-4">
      <ConsultaEstado />
    </div>
  </q-page>
</template>

<script setup>
import ConsultaEstado from 'components/ConsultaEstado.vue'
</script>

<style scoped>
.consultar-page {
  min-height: 100vh;
  background: var(--bg-dark);
}
</style>
