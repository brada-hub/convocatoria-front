<template>
    <div class="step-content animate-fadeInUp">
        <div class="row q-col-gutter-lg">
            <!-- Columna Izquierda: Tabs y Checkboxes -->
            <div class="col-12 col-md-8">
                <div class="text-h6 q-mb-md flex items-center gap-2">
                    <q-icon name="apartment" color="primary" /> Sedes Disponibles
                </div>

                <div v-if="ofertasAgrupadas.length"
                    class="border rounded-xl overflow-hidden bg-gray-50 flex flex-col md:flex-row"
                    style="min-height: 400px;">
                    <!-- Tabs Verticales de Sedes -->
                    <q-tabs v-model="activeSedeTab" :vertical="!$q.screen.lt.md"
                        class="text-grey-7 bg-white border-b md:border-b-0 md:border-r" active-color="primary"
                        active-bg-color="blue-1" indicator-color="primary">
                        <q-tab v-for="grupo in ofertasAgrupadas" :key="grupo.sede.id" :name="grupo.sede.id"
                            class="justify-start px-4 py-3" no-caps>
                            <div class="flex items-center gap-2 text-left w-full">
                                <q-icon name="location_on" size="xs" />
                                <div class="text-caption font-bold">{{ grupo.sede.nombre }}</div>
                            </div>
                        </q-tab>
                    </q-tabs>

                    <!-- Paneles de Checkboxes -->
                    <q-tab-panels v-model="activeSedeTab" animated vertical transition-prev="jump-up"
                        transition-next="jump-up" class="bg-transparent flex-1">
                        <q-tab-panel v-for="grupo in ofertasAgrupadas" :key="grupo.sede.id" :name="grupo.sede.id"
                            class="p-4">
                            <div class="text-h6 q-mb-sm text-primary font-bold">{{ grupo.sede.nombre }}</div>
                            <p class="text-xs text-gray-500 mb-4">Seleccione los cargos de su interés en esta sede.</p>

                            <div class="grid gap-3">
                                <div v-for="oferta in grupo.cargos" :key="oferta.id"
                                    class="bg-white p-3 rounded-lg border border-gray-200 hover:border-blue-400 transition-colors flex items-center">
                                    <q-checkbox v-model="store.ofertasSeleccionadas" :val="oferta.id" color="primary"
                                        class="text-sm font-medium text-gray-800"
                                        :label="oferta.cargo?.nombre || oferta.cargo" />
                                </div>
                            </div>
                        </q-tab-panel>
                    </q-tab-panels>
                </div>
                <div v-else class="text-center p-8 bg-gray-50 rounded-xl text-gray-500">
                    No hay ofertas disponibles.
                </div>
            </div>

            <!-- Columna Derecha: Tabla Resumen -->
            <div class="col-12 col-md-4">
                <div class="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden sticky-summary">
                    <div class="bg-primary text-white p-4">
                        <div class="text-subtitle1 font-bold flex items-center gap-2">
                            <q-icon name="shopping_bag" /> Mis Postulaciones
                        </div>
                        <div class="text-xs opacity-90">
                            {{ store.ofertasSeleccionadas.length }} cargos seleccionados
                        </div>
                    </div>

                    <div class="q-pa-none" style="max-height: 400px; overflow-y: auto;">
                        <q-list separator v-if="selectedDetails.length > 0">
                            <q-item v-for="item in selectedDetails" :key="item.id" class="hover:bg-gray-50">
                                <q-item-section>
                                    <q-item-label class="text-sm font-bold text-gray-800">{{ item.cargo
                                    }}</q-item-label>
                                    <q-item-label caption class="flex items-center gap-1 text-xs text-gray-500">
                                        <q-icon name="place" size="12px" /> {{ item.sede }}
                                    </q-item-label>
                                </q-item-section>
                                <q-item-section side>
                                    <q-btn flat round color="negative" icon="delete_outline" size="sm"
                                        @click="store.toggleOferta(item.id)">
                                        <q-tooltip>Eliminar</q-tooltip>
                                    </q-btn>
                                </q-item-section>
                            </q-item>
                        </q-list>
                        <div v-else class="p-8 text-center text-gray-400 text-sm">
                            <q-icon name="playlist_add" size="40px" class="mb-2 opacity-50 block mx-auto" />
                            Seleccione cargos de la lista para postular.
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Botones de Navegación -->
        <div class="flex justify-end gap-3 mt-6 px-4 md:px-0">
            <q-btn unelevated color="primary" label="Siguiente" icon-right="arrow_forward" @click="validateAndNext"
                no-caps class="px-6 py-2" />
        </div>
    </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { usePostulacionStore } from 'stores/postulacion-store'
import { useQuasar } from 'quasar'

const store = usePostulacionStore()
const $q = useQuasar()
const activeSedeTab = ref(null)

const emit = defineEmits(['next'])

// --- COMPUTED HELPERS ---

// Agrupar ofertas por sede (similar al original pero optimizado)
const ofertasAgrupadas = computed(() => {
    const sedesMap = {}
    store.convocatorias.forEach(conv => {
        conv.ofertas.forEach(oferta => {
            const sedeId = oferta.sede.id
            if (!sedesMap[sedeId]) {
                sedesMap[sedeId] = {
                    sede: oferta.sede,
                    cargos: []
                }
            }
            sedesMap[sedeId].cargos.push({
                id: oferta.id,
                cargo: oferta.cargo, // Objeto cargo con nombre
                convocatoria: conv.titulo
            })
        })
    })
    return Object.values(sedesMap)
})

// Detalles de ofertas seleccionadas
const selectedDetails = computed(() => {
    const details = []
    const todasLasOfertas = []

    store.convocatorias.forEach(conv => {
        conv.ofertas.forEach(o => {
            todasLasOfertas.push({
                id: o.id,
                cargo: o.cargo?.nombre || 'Cargo',
                sede: o.sede.nombre
            })
        })
    })

    store.ofertasSeleccionadas.forEach(id => {
        const oferta = todasLasOfertas.find(o => o.id === id)
        if (oferta) details.push(oferta)
    })
    return details
})

// --- LOGIC ---

// Inicializar tab
watch(ofertasAgrupadas, (newVal) => {
    if (newVal && newVal.length > 0 && !activeSedeTab.value) {
        activeSedeTab.value = newVal[0].sede.id
    }
}, { immediate: true })

const validateAndNext = () => {
    if (store.ofertasSeleccionadas.length === 0) {
        $q.notify({
            type: 'warning',
            message: 'Debe seleccionar al menos un cargo para postular.',
            position: 'center'
        })
        return
    }
    emit('next')
}
</script>

<style scoped>
.sticky-summary {
    position: sticky;
    top: 20px;
}
</style>
