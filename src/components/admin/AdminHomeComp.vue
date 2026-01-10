<template>
  <div class="animate-fadeIn">
    <!-- Stats Cards Modernos -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5">
      <!-- Card 1: Convocatorias Activas -->
      <div class="bg-gradient-to-br from-white to-blue-50/50 p-5 rounded-2xl shadow-sm border border-blue-100 flex items-center justify-between group hover:shadow-md transition-all duration-300">
        <div>
          <div class="text-3xl font-bold text-gray-900 mb-1 group-hover:text-blue-600 transition-colors">{{ stats.convocatorias_activas }}</div>
          <div class="text-xs text-blue-900/60 font-bold uppercase tracking-wider">Convocatorias</div>
        </div>
        <div class="p-3 bg-blue-100 text-blue-600 rounded-xl group-hover:scale-110 transition-transform shadow-sm shadow-blue-100">
          <q-icon name="campaign" size="24px" />
        </div>
      </div>

      <!-- Card 2: Postulaciones Totales -->
      <div class="bg-gradient-to-br from-white to-purple-50/50 p-5 rounded-2xl shadow-sm border border-purple-100 flex items-center justify-between group hover:shadow-md transition-all duration-300">
        <div>
          <div class="text-3xl font-bold text-gray-900 mb-1 group-hover:text-purple-600 transition-colors">{{ stats.total_postulaciones }}</div>
          <div class="text-xs text-purple-900/60 font-bold uppercase tracking-wider">Postulaciones</div>
        </div>
        <div class="p-3 bg-purple-100 text-purple-600 rounded-xl group-hover:scale-110 transition-transform shadow-sm shadow-purple-100">
          <q-icon name="people" size="24px" />
        </div>
      </div>

      <!-- Card 3: Pendientes -->
      <div class="bg-gradient-to-br from-white to-orange-50/50 p-5 rounded-2xl shadow-sm border border-orange-100 flex items-center justify-between group hover:shadow-md transition-all duration-300">
        <div>
          <div class="text-3xl font-bold text-gray-900 mb-1 group-hover:text-orange-600 transition-colors">{{ stats.pendientes }}</div>
          <div class="text-xs text-orange-900/60 font-bold uppercase tracking-wider">Pendientes</div>
        </div>
        <div class="p-3 bg-orange-100 text-orange-600 rounded-xl group-hover:scale-110 transition-transform shadow-sm shadow-orange-100">
          <q-icon name="assignment_late" size="24px" />
        </div>
      </div>

      <!-- Card 4: Postulantes -->
      <div class="bg-gradient-to-br from-white to-green-50/50 p-5 rounded-2xl shadow-sm border border-green-100 flex items-center justify-between group hover:shadow-md transition-all duration-300">
        <div>
          <div class="text-3xl font-bold text-gray-900 mb-1 group-hover:text-green-600 transition-colors">{{ stats.postulantes }}</div>
          <div class="text-xs text-green-900/60 font-bold uppercase tracking-wider">Registrados</div>
        </div>
         <div class="p-3 bg-green-100 text-green-600 rounded-xl group-hover:scale-110 transition-transform shadow-sm shadow-green-100">
          <q-icon name="person_search" size="24px" />
        </div>
      </div>
    </div>

    <!-- Actividad Reciente & Proximos Cierres -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">
      <!-- Tabla Actividad Reciente -->
      <div class="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden flex flex-col">
        <div class="p-6 border-b border-gray-100 flex justify-between items-center">
          <h3 class="font-bold text-gray-800 text-lg">Actividad Reciente</h3>
          <button @click="$emit('change-tab', 'postulaciones')" class="text-sm text-blue-600 hover:text-blue-800 font-medium cursor-pointer">Ver todo</button>
        </div>
        <div class="overflow-x-auto flex-1">
           <table class="w-full text-left">
              <thead class="bg-gray-50 text-gray-500 text-xs uppercase font-semibold">
                 <tr>
                    <th class="p-4">Postulante</th>
                    <th class="p-4">Cargo / Convocatoria</th>
                    <th class="p-4">Fecha</th>
                    <th class="p-4">Estado</th>
                 </tr>
              </thead>
              <tbody class="divide-y divide-gray-100 text-sm">
                 <tr v-for="post in stats.recientes || []" :key="post.id" class="hover:bg-gray-50">
                    <td class="p-4">
                       <div class="font-semibold text-gray-900">{{ post.postulante?.nombres }} {{ post.postulante?.apellidos }}</div>
                       <div class="text-xs text-gray-400">{{ post.postulante?.ci }}</div>
                    </td>
                    <td class="p-4">
                       <div class="text-gray-900 font-medium">{{ post.oferta?.cargo?.nombre }}</div>
                       <div class="text-xs text-blue-600">{{ post.oferta?.convocatoria?.titulo }}</div>
                    </td>
                    <td class="p-4 text-gray-500">{{ new Date(post.created_at).toLocaleDateString() }}</td>
                    <td class="p-4">
                       <span :class="{
                          'bg-yellow-100 text-yellow-800': post.estado === 'pendiente',
                          'bg-blue-100 text-blue-800': post.estado === 'en_revision',
                          'bg-green-100 text-green-800': post.estado === 'seleccionado' || post.estado === 'habilitado',
                          'bg-red-100 text-red-800': post.estado === 'rechazado'
                       }" class="px-2 py-1 rounded-lg text-xs font-bold uppercase tracking-wide">
                          {{ post.estado }}
                       </span>
                    </td>
                 </tr>
                 <tr v-if="!stats.recientes?.length">
                    <td colspan="4" class="p-8 text-center text-gray-400 italic">No hay actividad reciente</td>
                 </tr>
              </tbody>
           </table>
        </div>
      </div>

      <!-- Próximos Cierres -->
      <div class="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden flex flex-col">
         <div class="p-6 border-b border-gray-100">
           <h3 class="font-bold text-gray-800 text-lg">Próximos Cierres (Activas)</h3>
         </div>
         <div class="p-6 flex-1 space-y-4">
            <div v-for="conv in stats.proximas_cierre || []" :key="conv.id" class="flex gap-4 items-start p-3 rounded-xl bg-gray-50 border border-gray-100">
               <div class="bg-red-100 text-red-600 p-2 rounded-lg font-bold text-center min-w-[50px]">
                  <div class="text-xs uppercase">{{ getMonth(conv.fecha_cierre) }}</div>
                  <div class="text-xl leading-none">{{ new Date(conv.fecha_cierre).getDate() }}</div>
               </div>
               <div class="flex-1">
                  <div class="font-bold text-gray-900 text-sm line-clamp-1">{{ conv.titulo }}</div>
                  <div class="text-xs text-gray-500 mt-1 flex items-center gap-1">
                     <q-icon name="schedule" size="14px"/>
                     Cierra en {{ getDaysRemaining(conv.fecha_cierre) }} días
                  </div>
               </div>
            </div>
            <div v-if="!stats.proximas_cierre?.length" class="text-center text-gray-400 italic py-4">
               No hay convocatorias próximas a cerrar
            </div>
         </div>
         <div class="p-4 bg-gray-50 text-center border-t border-gray-100">
            <button @click="$emit('change-tab', 'convocatorias')" class="text-xs font-bold text-indigo-600 hover:text-indigo-800 uppercase tracking-wider">Gestionar Convocatorias</button>
         </div>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  stats: {
    type: Object,
    required: true,
    default: () => ({
      convocatorias_activas: 0,
      total_postulaciones: 0,
      pendientes: 0,
      postulantes: 0,
      recientes: [],
      proximas_cierre: []
    })
  }
})

const getMonth = (dateStr) => {
  return new Date(dateStr).toLocaleString('es-ES', { month: 'short' }).toUpperCase().replace('.', '')
}

const getDaysRemaining = (dateStr) => {
  return Math.ceil((new Date(dateStr) - new Date()) / (1000 * 60 * 60 * 24))
}
</script>
