<template>
    <div class="min-h-screen bg-gray-50/50 p-4 md:p-6">
        <!-- Header -->
        <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <div>
                <h2 class="text-2xl font-bold text-gray-800">Reportes y Estadísticas</h2>
                <p class="text-sm text-gray-500 mt-1">Análisis de datos del sistema de convocatorias</p>
            </div>
            <div class="flex gap-2">
                <q-select v-model="selectedPeriod" :options="periodOptions" dense outlined emit-value map-options
                    class="min-w-[150px]" @update:model-value="loadData" />
                <q-btn icon="refresh" flat round @click="loadData" :loading="loading">
                    <q-tooltip>Actualizar datos</q-tooltip>
                </q-btn>
            </div>
        </div>

        <!-- KPIs Cards -->
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div v-for="kpi in kpis" :key="kpi.label"
                class="bg-white rounded-xl shadow-sm border border-gray-100 p-5 hover:shadow-md transition-shadow">
                <div class="flex items-center justify-between">
                    <div>
                        <p class="text-sm text-gray-500 font-medium">{{ kpi.label }}</p>
                        <p class="text-2xl font-bold text-gray-900 mt-1">{{ kpi.value }}</p>
                        <p v-if="kpi.change" :class="kpi.change > 0 ? 'text-green-600' : 'text-red-600'"
                            class="text-xs mt-1 flex items-center gap-1">
                            <q-icon :name="kpi.change > 0 ? 'trending_up' : 'trending_down'" size="14px" />
                            {{ Math.abs(kpi.change) }}% vs período anterior
                        </p>
                    </div>
                    <div :class="kpi.color" class="p-3 rounded-xl">
                        <q-icon :name="kpi.icon" size="24px" class="text-white" />
                    </div>
                </div>
            </div>
        </div>

        <!-- Charts Row 1 -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <!-- Postulaciones por Estado -->
            <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
                <h3 class="text-lg font-bold text-gray-800 mb-4">Postulaciones por Estado</h3>
                <div class="h-[300px]">
                    <Doughnut :data="estadosChartData" :options="doughnutOptions" />
                </div>
            </div>

            <!-- Postulaciones por Mes -->
            <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
                <h3 class="text-lg font-bold text-gray-800 mb-4">Postulaciones por Mes</h3>
                <div class="h-[300px]">
                    <Bar :data="mensualChartData" :options="barOptions" />
                </div>
            </div>
        </div>

        <!-- Charts Row 2 -->
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
            <!-- Top Sedes -->
            <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
                <h3 class="text-lg font-bold text-gray-800 mb-4">Top Sedes con más Postulaciones</h3>
                <div class="space-y-3">
                    <div v-for="(sede, i) in topSedes" :key="sede.nombre" class="flex items-center gap-3">
                        <span class="text-lg font-bold text-gray-400 w-6">#{{ i + 1 }}</span>
                        <div class="flex-1">
                            <div class="flex justify-between text-sm mb-1">
                                <span class="font-medium text-gray-700">{{ sede.nombre }}</span>
                                <span class="text-gray-500">{{ sede.total }}</span>
                            </div>
                            <div class="h-2 bg-gray-100 rounded-full overflow-hidden">
                                <div class="h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full"
                                    :style="{ width: `${(sede.total / maxSede) * 100}%` }" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Top Cargos -->
            <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
                <h3 class="text-lg font-bold text-gray-800 mb-4">Cargos más Solicitados</h3>
                <div class="space-y-3">
                    <div v-for="(cargo, i) in topCargos" :key="cargo.nombre" class="flex items-center gap-3">
                        <span class="text-lg font-bold text-gray-400 w-6">#{{ i + 1 }}</span>
                        <div class="flex-1">
                            <div class="flex justify-between text-sm mb-1">
                                <span class="font-medium text-gray-700">{{ cargo.nombre }}</span>
                                <span class="text-gray-500">{{ cargo.total }}</span>
                            </div>
                            <div class="h-2 bg-gray-100 rounded-full overflow-hidden">
                                <div class="h-full bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full"
                                    :style="{ width: `${(cargo.total / maxCargo) * 100}%` }" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Convocatorias Activas -->
            <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
                <h3 class="text-lg font-bold text-gray-800 mb-4">Convocatorias Activas</h3>
                <div class="space-y-3">
                    <div v-for="conv in convocatoriasActivas" :key="conv.id"
                        class="p-3 bg-gray-50 rounded-lg border border-gray-100">
                        <p class="font-medium text-gray-800 text-sm">{{ conv.titulo }}</p>
                        <div class="flex justify-between items-center mt-2 text-xs">
                            <span class="text-gray-500">{{ conv.postulaciones }} postulaciones</span>
                            <span :class="getDaysColor(conv.dias_restantes)" class="font-medium">
                                {{ conv.dias_restantes }} días restantes
                            </span>
                        </div>
                    </div>
                    <div v-if="convocatoriasActivas.length === 0" class="text-center text-gray-400 py-4">
                        No hay convocatorias activas
                    </div>
                </div>
            </div>
        </div>

        <!-- Tabla de últimas postulaciones -->
        <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
            <h3 class="text-lg font-bold text-gray-800 mb-4">Últimas Postulaciones</h3>
            <q-table :rows="ultimasPostulaciones" :columns="columns" flat row-key="id" :pagination="{ rowsPerPage: 5 }">
                <template v-slot:body-cell-postulante="props">
                    <q-td :props="props">
                        <div class="flex items-center gap-2">
                            <div
                                class="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 font-bold text-xs">
                                {{ props.row.postulante?.nombres?.[0] }}{{ props.row.postulante?.apellidos?.[0] }}
                            </div>
                            <div>
                                <p class="font-medium text-gray-800">{{ props.row.postulante?.nombres }} {{
                                    props.row.postulante?.apellidos }}</p>
                                <p class="text-xs text-gray-500">{{ props.row.postulante?.ci }}</p>
                            </div>
                        </div>
                    </q-td>
                </template>
                <template v-slot:body-cell-estado="props">
                    <q-td :props="props">
                        <span :class="getEstadoClass(props.row.estado)"
                            class="px-2 py-1 rounded-full text-xs font-semibold">
                            {{ props.row.estado }}
                        </span>
                    </q-td>
                </template>
            </q-table>
        </div>
    </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { api } from 'boot/axios'
import { Bar, Doughnut } from 'vue-chartjs'
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    ArcElement,
    Title,
    Tooltip,
    Legend
} from 'chart.js'

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Title, Tooltip, Legend)

const loading = ref(false)
const selectedPeriod = ref('all')
const periodOptions = [
    { label: 'Todo el tiempo', value: 'all' },
    { label: 'Último mes', value: '30' },
    { label: 'Últimos 3 meses', value: '90' },
    { label: 'Último año', value: '365' }
]

// Data
const kpis = ref([
    { label: 'Total Postulaciones', value: 0, icon: 'description', color: 'bg-blue-500', change: 12 },
    { label: 'Postulantes Únicos', value: 0, icon: 'people', color: 'bg-emerald-500', change: 8 },
    { label: 'Convocatorias Activas', value: 0, icon: 'campaign', color: 'bg-purple-500' },
    { label: 'Tasa de Habilitación', value: '0%', icon: 'verified', color: 'bg-orange-500', change: -3 }
])

const topSedes = ref([])
const topCargos = ref([])
const convocatoriasActivas = ref([])
const ultimasPostulaciones = ref([])
const estadosData = ref({ labels: [], data: [] })
const mensualData = ref({ labels: [], data: [] })

// Computed
const maxSede = computed(() => Math.max(...topSedes.value.map(s => s.total), 1))
const maxCargo = computed(() => Math.max(...topCargos.value.map(c => c.total), 1))

const estadosChartData = computed(() => ({
    labels: estadosData.value.labels,
    datasets: [{
        data: estadosData.value.data,
        backgroundColor: ['#f59e0b', '#3b82f6', '#ef4444', '#10b981', '#8b5cf6', '#06b6d4'],
        borderWidth: 0
    }]
}))

const mensualChartData = computed(() => ({
    labels: mensualData.value.labels,
    datasets: [{
        label: 'Postulaciones',
        data: mensualData.value.data,
        backgroundColor: 'rgba(99, 102, 241, 0.8)',
        borderRadius: 8
    }]
}))

const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { position: 'right' } }
}

const barOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } }
}

const columns = [
    { name: 'postulante', label: 'Postulante', field: 'postulante', align: 'left' },
    { name: 'cargo', label: 'Cargo', field: row => row.oferta?.cargo?.nombre, align: 'left' },
    { name: 'sede', label: 'Sede', field: row => row.oferta?.sede?.nombre, align: 'left' },
    { name: 'estado', label: 'Estado', field: 'estado', align: 'center' },
    { name: 'fecha', label: 'Fecha', field: row => new Date(row.created_at).toLocaleDateString(), align: 'center' }
]

// Methods
const loadData = async () => {
    loading.value = true
    try {
        const { data } = await api.get('/admin/reports', { params: { period: selectedPeriod.value } })

        kpis.value[0].value = data.total_postulaciones || 0
        kpis.value[1].value = data.postulantes_unicos || 0
        kpis.value[2].value = data.convocatorias_activas || 0
        kpis.value[3].value = data.tasa_habilitacion ? `${data.tasa_habilitacion}%` : '0%'

        topSedes.value = data.top_sedes || []
        topCargos.value = data.top_cargos || []
        convocatoriasActivas.value = data.convocatorias || []
        ultimasPostulaciones.value = data.ultimas_postulaciones || []
        estadosData.value = data.por_estado || { labels: [], data: [] }
        mensualData.value = data.por_mes || { labels: [], data: [] }
    } catch (e) {
        console.error('Error loading reports:', e)
    } finally {
        loading.value = false
    }
}

const getDaysColor = (days) => {
    if (days <= 3) return 'text-red-600'
    if (days <= 7) return 'text-orange-600'
    return 'text-green-600'
}

const getEstadoClass = (estado) => {
    const classes = {
        pendiente: 'bg-yellow-100 text-yellow-700',
        en_revision: 'bg-blue-100 text-blue-700',
        habilitado: 'bg-green-100 text-green-700',
        rechazado: 'bg-red-100 text-red-700',
        seleccionado: 'bg-purple-100 text-purple-700'
    }
    return classes[estado] || 'bg-gray-100 text-gray-700'
}

onMounted(loadData)
</script>
