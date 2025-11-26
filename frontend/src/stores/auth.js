/**
 * Authentication Store (Pinia)
 * 
 * Global state management for user authentication
 * Stores user information, authentication token, and provides methods for login/logout
 * 
 * State is reactive and accessible throughout the app via useAuthStore()
 * Persists token in localStorage across page refreshes
 */

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { authService } from '@/services/authService'

export const useAuthStore = defineStore('auth', () => {
  /**
   * REACTIVE STATE
   */

  /**
   * user: Currently authenticated user object or null
   * Contains: { id, name, email, role (viewer/editor/admin) }
   */
  const user = ref(null)

  /**
   * token: JWT authentication token
   * Loaded from localStorage on app start
   * Sent with every API request via interceptor in api.js
   */
  const token = ref(localStorage.getItem('authToken'))

  /**
   * loading: Loading state during auth operations
   * true while login/logout/fetchCurrentUser is in progress
   */
  const loading = ref(false)

  /**
   * COMPUTED PROPERTIES
   */

  /**
   * isAuthenticated: Whether user is currently logged in
   * Checks if both token and user object exist
   * Used by router guards and conditional rendering
   * 
   * @returns {boolean} true if user is authenticated
   */
  const isAuthenticated = computed(() => !!token.value && !!user.value)

  /**
   * isAdmin: Whether current user has admin role
   * Only admins can manage all users, articles, and settings
   * 
   * @returns {boolean} true if user.role === 'admin'
   */
  const isAdmin = computed(() => user.value?.role === 'admin')

  /**
   * canEdit: Whether current user can edit/create content
   * True for both editors and admins
   * Determines access to AdminPage, FamilyManagementPage, etc.
   * 
   * @returns {boolean} true if authenticated AND (admin OR editor)
   */
  const canEdit = computed(() => isAuthenticated.value && (isAdmin.value || user.value?.role === 'editor'))

  /**
   * METHODS
   */

  /**
   * Login user with email and password
   * 
   * Process:
   * 1. Calls authService.login with credentials
   * 2. On success: stores token and user in state
   * 3. Token automatically included in future API requests
   * 4. On error: exception is thrown to caller
   * 
   * @async
   * @param {string} email - User's email address
   * @param {string} password - User's password
   * @returns {Promise<Object>} Login response with token and user data
   * @throws {Error} If credentials are invalid
   * 
   * @example
   * try {
   *   const auth = useAuthStore()
   *   await auth.login("user@example.com", "password")
   *   console.log(auth.user.name)
   * } catch (error) {
   *   console.error("Login failed")
   * }
   */
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

  /**
   * Logout current user
   * 
   * Process:
   * 1. Calls authService.logout to clear token from storage
   * 2. Clears user and token from store
   * 3. Subsequent API calls will be unauthenticated
   * 4. User is redirected to login on next protected route access
   * 
   * @async
   * @returns {Promise<void>}
   * 
   * @example
   * const auth = useAuthStore()
   * await auth.logout()
   * // Token and user cleared, user logged out
   */
  async function logout() {
    await authService.logout()
    user.value = null
    token.value = null
  }

  /**
   * Fetch current authenticated user information
   * 
   * Used on app startup to restore user session
   * Called in App.vue onMounted hook
   * Only fetches if token exists in localStorage
   * 
   * Process:
   * 1. Checks if token exists (returns early if not)
   * 2. Calls authService.getCurrentUser()
   * 3. Updates user state with response
   * 4. If call fails, user remains null (gracefully handled)
   * 
   * @async
   * @returns {Promise<void>}
   * 
   * @example
   * const auth = useAuthStore()
   * await auth.fetchCurrentUser()
   * if (auth.isAuthenticated) {
   *   console.log("User:", auth.user.name)
   * }
   */
  async function fetchCurrentUser() {
    if (!token.value) return
    loading.value = true
    try {
      user.value = await authService.getCurrentUser()
    } finally {
      loading.value = false
    }
  }

  /**
   * Directly set user object (internal use)
   * 
   * Used for manual state updates when needed
   * Normally not called directly; use login() instead
   * 
   * @param {Object} userData - User object to set
   * 
   * @example
   * const auth = useAuthStore()
   * auth.setUser({ id: 1, name: "John", role: "admin" })
   */
  function setUser(userData) {
    user.value = userData
  }

  /**
   * RETURN PUBLIC API
   */
  return {
    // State
    user,
    token,
    loading,
    // Computed
    isAuthenticated,
    isAdmin,
    canEdit,
    // Methods
    login,
    logout,
    fetchCurrentUser,
    setUser,
  }
})
