import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { authService } from '@/services/authService'

export const useAuthStore = defineStore('auth', () => {
  const user = ref(null)
  const token = ref(localStorage.getItem('authToken'))
  const loading = ref(false)

  const isAuthenticated = computed(() => !!token.value && !!user.value)
  const isAdmin = computed(() => user.value?.role === 'admin')
  const canEdit = computed(() => isAuthenticated.value && (isAdmin.value || user.value?.role === 'editor'))

  async function login(email, password) {
    loading.value = true
    try {
      const data = await authService.login(email, password)
      token.value = data.token
      user.value = data.user
      return data
    } finally {
      loading.value = false
    }
  }

  async function logout() {
    await authService.logout()
    user.value = null
    token.value = null
  }

  async function fetchCurrentUser() {
    if (!token.value) return
    loading.value = true
    try {
      user.value = await authService.getCurrentUser()
    } finally {
      loading.value = false
    }
  }

  function setUser(userData) {
    user.value = userData
  }

  return {
    user,
    token,
    loading,
    isAuthenticated,
    isAdmin,
    canEdit,
    login,
    logout,
    fetchCurrentUser,
    setUser,
  }
})
