<template>
  <q-page class="admin-page">
    <AdminDashboard />
  </q-page>
</template>

<script setup>
import AdminDashboard from 'components/AdminDashboard.vue'
</script>

<style scoped>
.admin-page {
  min-height: 100vh;
  background: var(--bg-dark);
}
</style>
