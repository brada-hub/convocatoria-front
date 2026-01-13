<template>
    <q-page class="flex items-center justify-center bg-gradient-to-br from-[#5b2586] to-[#0e4d92]">
        <div class="w-full max-w-[400px] p-4 animate-fade">
            <q-card class="w-full rounded-2xl shadow-2xl overflow-hidden">
                <q-card-section class="flex flex-col items-center pt-8 pb-4">
                    <div class="p-3 bg-purple-50 rounded-xl text-[#5b2586] mb-4 shadow-sm">
                        <q-icon name="lock_reset" size="32px" />
                    </div>

                    <div class="text-center">
                        <h2 class="text-xl font-bold text-[#5b2586] m-0">Actualizar Contraseña</h2>
                        <div class="text-xs text-gray-500 mt-1 uppercase tracking-wide">Por seguridad, establezca una
                            nueva clave</div>
                    </div>
                </q-card-section>

                <q-card-section class="px-8 py-2">
                    <div class="text-center mb-6 text-gray-500 text-sm">
                        Es necesario cambiar su contraseña temporal
                    </div>

                    <q-form @submit="handleChangePassword" class="space-y-4">
                        <div>
                            <label class="text-[11px] font-bold text-gray-700 uppercase tracking-wider mb-1 block">Nueva
                                Contraseña</label>
                            <q-input v-model="password" :type="showPassword ? 'text' : 'password'" outlined dense placeholder="Mínimo 6 caracteres"
                                bg-color="white"
                                :rules="[val => !!val || 'Requerido', val => val.length >= 6 || 'Mínimo 6 caracteres']">
                                <template v-slot:prepend>
                                    <q-icon name="lock" color="purple-8" size="20px" />
                                </template>
                                <template v-slot:append>
                                    <q-icon :name="showPassword ? 'visibility' : 'visibility_off'"
                                        class="cursor-pointer" color="gray" @click="showPassword = !showPassword" />
                                </template>
                            </q-input>
                        </div>

                        <div>
                            <label
                                class="text-[11px] font-bold text-gray-700 uppercase tracking-wider mb-1 block">Confirmar
                                Contraseña</label>
                            <q-input v-model="passwordConfirm" :type="showPasswordConfirm ? 'text' : 'password'" outlined dense
                                placeholder="Repita la contraseña" bg-color="white" :rules="[
                                    val => !!val || 'Requerido',
                                    val => val === password || 'Las contraseñas no coinciden'
                                ]">
                                <template v-slot:prepend>
                                    <q-icon name="lock_clock" color="purple-8" size="20px" />
                                </template>
                                <template v-slot:append>
                                    <q-icon :name="showPasswordConfirm ? 'visibility' : 'visibility_off'"
                                        class="cursor-pointer" color="gray" @click="showPasswordConfirm = !showPasswordConfirm" />
                                </template>
                            </q-input>
                        </div>

                        <div class="pt-4 pb-2">
                            <q-btn type="submit" label="Actualizar y Continuar" color="primary"
                                class="w-full py-2.5 font-bold rounded-lg shadow-md hover:shadow-lg transition-all"
                                :loading="loading" unelevated />
                        </div>
                    </q-form>
                </q-card-section>

                <q-card-section class="pb-6 pt-2 text-center">
                    <div class="text-[10px] text-gray-400">
                        © {{ new Date().getFullYear() }} Universidad Técnica Privada Cosmos
                    </div>
                </q-card-section>
            </q-card>
        </div>
    </q-page>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from 'stores/auth-store'
import { api } from 'boot/axios'
import { useQuasar } from 'quasar'

const $q = useQuasar()
const router = useRouter()
const authStore = useAuthStore()

const password = ref('')
const passwordConfirm = ref('')
const showPassword = ref(false)
const showPasswordConfirm = ref(false)
const loading = ref(false)

const handleChangePassword = async () => {
    loading.value = true
    try {
        // Usamos el endpoint del usuario autenticado actual 'api/auth/change-password' o similar
        // Asumimos que el Controller User o Auth tiene este método
        // Si no, lo crearemos (ya vi que AuthController.php tiene cambiarPassword)

        await api.post('/auth/cambiar-password', {
            password: password.value,
            password_confirmation: passwordConfirm.value
        })

        $q.notify({ type: 'positive', message: 'Contraseña actualizada correctamente' })

        if (authStore.user) authStore.user.must_change_password = false

        router.push('/admin')
    } catch (error) {
        console.error(error)
        // Si falla por current_password, tendriamos que pedirla.
        // Pero idealmente el endpoint de "reset inicial" no deberia pedir la anterior si ya estas autenticado y must_change_password=true
        $q.notify({ type: 'negative', message: error.response?.data?.message || 'Error al actualizar contraseña' })
    } finally {
        loading.value = false
    }
}
</script>
