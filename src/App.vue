<template>
  <router-view />
</template>

<script setup>
import { onMounted } from 'vue'
import { useAuthStore } from 'stores/auth-store'

const authStore = useAuthStore()

onMounted(() => {
  // Restaurar autenticación desde localStorage
  authStore.initAuth()
})
</script>
