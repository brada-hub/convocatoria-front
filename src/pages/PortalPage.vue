<template>
  <q-page class="portal-page bg-grey-1">
    <!-- Hero Section -->
    <div class="hero-portal text-white q-pb-xl">
      <div class="hero-bg"></div>
      <div class="container mx-auto px-4 relative z-10 pt-16 pb-20 text-center">
        <div class="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-sm font-medium mb-6 animate-fadeIn">
          <q-icon name="campaign" color="warning" />
          <span>Convocatorias Externas Vigentes</span>
        </div>
        <h1 class="text-4xl md:text-6xl font-bold mb-6 tracking-tight animate-fadeInUp">
          Únete a Nuestro Equipo
        </h1>
        <p class="text-lg md:text-xl text-white/80 max-w-2xl mx-auto mb-10 animate-fadeInUp delay-100">
          Explora las oportunidades laborales disponibles y forma parte de una institución comprometida con la excelencia.
        </p>

        <!-- Botón Postular Ahora -->
        <div class="flex justify-center gap-4 animate-fadeInUp delay-300 q-mt-xl">
           <q-btn
              unelevated
              color="warning"
              text-color="dark"
              size="lg"
              class="rounded-xl px-12 py-4 font-bold shadow-2xl shadow-yellow-500/20 hover:scale-105 transition-transform"
              label="POSTULAR AHORA"
              icon-right="rocket_launch"
              to="/convocatoria/general"
           />
           <q-btn
              outline
              color="white"
              size="lg"
              class="rounded-xl px-8 font-bold"
              label="VER MI ESTADO"
              icon="search"
              to="/consultar"
           />
        </div>
      </div>
    </div>

    <!-- Sección Inferior: Beneficios -->
    <div class="container mx-auto px-4 py-20 relative z-20">
      <div class="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
        <div class="p-8 bg-white rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
          <div class="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <q-icon name="list_alt" size="32px" />
          </div>
          <h3 class="text-xl font-bold text-gray-900 mb-3">Selección Global</h3>
          <p class="text-gray-500 text-sm">Postule a múltiples cargos de diferentes sedes en un solo proceso unificado.</p>
        </div>

        <div class="p-8 bg-white rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
          <div class="w-16 h-16 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <q-icon name="verified_user" size="32px" />
          </div>
          <h3 class="text-xl font-bold text-gray-900 mb-3">Seguridad</h3>
          <p class="text-gray-500 text-sm">Sus datos y documentos están protegidos bajo estándares institucionales.</p>
        </div>

        <div class="p-8 bg-white rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
          <div class="w-16 h-16 bg-green-50 text-green-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <q-icon name="speed" size="32px" />
          </div>
          <h3 class="text-xl font-bold text-gray-900 mb-3">Agilidad</h3>
          <p class="text-gray-500 text-sm">Seguimiento en tiempo real del estado de su postulación mediante su CI.</p>
        </div>
      </div>
    </div>

    <!-- Footer Simple -->
    <div class="py-12 text-center text-gray-400 text-sm border-t border-gray-200 bg-white shadow-inner">
      <div class="flex items-center justify-center gap-2 mb-2 font-medium">
        <q-icon name="security" size="18px" />
        <span>Sistema Seguro de Reclutamiento • 2026</span>
      </div>
      <p>Derechos reservados • Sistema de Convocatorias</p>
    </div>
  </q-page>
</template>

<script setup>
import { onMounted } from 'vue'
import { usePostulacionStore } from 'stores/postulacion-store'

const store = usePostulacionStore()

onMounted(() => {
  store.cargarConvocatorias()
})
</script>

<style scoped>
.portal-page {
  min-height: 100vh;
}

.hero-portal {
  position: relative;
  background: #0f172a; /* slate-900 */
  overflow: hidden;
}

.hero-bg {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: radial-gradient(circle at 70% 30%, rgba(37, 99, 235, 0.15) 0%, transparent 50%),
              radial-gradient(circle at 10% 80%, rgba(99, 102, 241, 0.15) 0%, transparent 50%);
  opacity: 0.8;
}

.conv-card {
  height: 100%;
}

.delay-100 { animation-delay: 100ms; }
.delay-200 { animation-delay: 200ms; }

.container {
  max-width: 1200px;
}

.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.line-clamp-3 {
  display: -webkit-box;
  -webkit-line-clamp: 3;
  line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

@keyframes scaleIn {
  from { opacity: 0; transform: scale(0.95); }
  to { opacity: 1; transform: scale(1); }
}

.animate-scaleIn {
  animation: scaleIn 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}

@keyframes fadeInUp {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}

.animate-fadeInUp {
  animation: fadeInUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.animate-fadeIn {
  animation: fadeIn 0.8s ease-out forwards;
}
</style>
