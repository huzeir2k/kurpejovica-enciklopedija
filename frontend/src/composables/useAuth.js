import { computed } from 'vue'
import { useAuthStore } from '@/stores/auth'

export function useAuth() {
  const authStore = useAuthStore()

  const isAuthenticated = computed(() => authStore.isAuthenticated)
  const isAdmin = computed(() => authStore.isAdmin)
  const canEdit = computed(() => authStore.canEdit)
  const user = computed(() => authStore.user)

  return {
    isAuthenticated,
    isAdmin,
    canEdit,
    user,
    login: authStore.login,
    logout: authStore.logout,
  }
}
