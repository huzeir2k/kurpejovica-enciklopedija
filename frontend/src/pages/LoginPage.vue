<script setup>
/**
 * LOGIN PAGE COMPONENT
 * 
 * User authentication form for accessing protected areas
 * Handles email/password login and manages JWT token
 * 
 * Features:
 * - Email and password input fields
 * - Form validation (HTML5 required attributes)
 * - Error message display
 * - Loading state during login request
 * - Redirect to home page on successful login
 * 
 * Authentication Flow:
 * 1. User enters email and password
 * 2. Form submission calls handleLogin()
 * 3. Calls authService.login() via useAuth composable
 * 4. On success:
 *    - JWT token stored in localStorage
 *    - Auth store updated with user data
 *    - Router redirects to home page (/)
 * 5. On error:
 *    - Error message displayed to user
 *    - User can retry or contact admin
 * 
 * Components Used:
 * - FormInput: Email and password input fields
 * - Button: Submit button with loading state
 * - AlertMessage: Error message display and dismissal
 * 
 * Composables Used:
 * - useAuth: Provides login() function from authService
 * - useRouter: Provides router for redirect after login
 * 
 * Security:
 * - Password field hides input with type="password"
 * - Email validated with HTML5 email input
 * - JWT token persisted in localStorage after login
 * - Axios interceptor auto-injects token in requests
 * 
 * Styling:
 * - Centered login box with form fields
 * - Error alert displays above form
 * - Loading indicator on submit button
 * 
 * @component LoginPage
 */

import { ref } from 'vue'
import { useAuth } from '@/composables/useAuth'
import { useRouter } from 'vue-router'
import FormInput from '@/components/FormInput.vue'
import Button from '@/components/Button.vue'
import AlertMessage from '@/components/AlertMessage.vue'

/**
 * REACTIVE STATE
 */

/**
 * email: Email address input value
 * 
 * Bound to email FormInput field
 * Sent to backend for authentication
 * Validated as email format by HTML5 browser validation
 * 
 * @type {Ref<string>}
 */
const email = ref('')

/**
 * password: Password input value
 * 
 * Bound to password FormInput field (type="password" hides input)
 * Sent to backend for authentication
 * Combined with email for login credentials
 * 
 * @type {Ref<string>}
 */
const password = ref('')

/**
 * error: Error message displayed to user
 * 
 * Set when login fails with error details
 * Cleared when user dismisses alert or retries
 * Shows API error message or generic "Login failed" message
 * 
 * @type {Ref<string>}
 */
const error = ref('')

/**
 * loading: Login request in-progress flag
 * 
 * true while API call is executing
 * false when complete (success or error)
 * Used to:
 * - Disable form submission during request
 * - Show "Logging in..." text on button
 * - Show loading indicator on button
 * 
 * Prevents duplicate submissions if user clicks button multiple times
 * 
 * @type {Ref<boolean>}
 */
const loading = ref(false)

/**
 * COMPOSABLES AND ROUTER
 */

/**
 * login: Authentication function from useAuth composable
 * 
 * Calls authService.login(email, password)
 * Returns promise that:
 * - Resolves on success (token stored, user data fetched)
 * - Rejects on error (wrong credentials, server error, etc.)
 * 
 * Wraps authService to work with composition API
 * Handles token storage and auth state updates internally
 */
const { login } = useAuth()

/**
 * router: Vue Router instance
 * 
 * Used to navigate to home page after successful login
 * router.push('/') redirects to home page
 * Automatically executes route guards in router/index.js
 */
const router = useRouter()

/**
 * FUNCTIONS
 */

/**
 * Handle login form submission
 * 
 * Process:
 * 1. Clear any previous error messages
 * 2. Set loading = true (disables button, shows loading state)
 * 3. Try to authenticate with email and password
 * 4. On success:
 *    - Token stored in localStorage by authService
 *    - User data fetched and stored in auth store
 *    - Redirect to home page with router.push('/')
 * 5. On error:
 *    - Extract error message from API response
 *    - Display message to user
 *    - User can retry (button enabled)
 * 6. Finally:
 *    - Always set loading = false (re-enable button)
 * 
 * Error Handling:
 * - Catches rejection from login() promise
 * - Accesses error.response.data.message from API
 * - Falls back to generic "Login failed" message
 * - Doesn't throw error (handled gracefully)
 * 
 * This is the form's @submit.prevent handler
 * .prevent prevents default form submission behavior
 * 
 * @async
 * @throws {void} Never throws - errors caught and displayed
 * 
 * @example
 * // User enters email/password and clicks submit
 * // handleLogin() executes automatically
 * // Shows loading spinner while authenticating
 * // Redirects to home on success, shows error on failure
 */
async function handleLogin() {
  // Clear previous error message
  error.value = ''
  
  // Disable form while request is in progress
  loading.value = true
  
  try {
    // Attempt to login with provided credentials
    // This will throw if credentials are invalid or server error
    await login(email.value, password.value)
    
    // Login successful - redirect to home page
    router.push('/')
  } catch (err) {
    // Login failed - show error message to user
    // Try to use API error message, fallback to generic message
    error.value = err.response?.data?.message || 'Login failed'
  } finally {
    // Always re-enable form, even if login failed
    loading.value = false
  }
}
</script>

<template>
  <div class="login-page">
    <!-- Login Form Container -->
    <div class="login-box">
      <!-- Page Title -->
      <h2>Login to Kurpejovica Enciklopedija</h2>

      <!-- Error Alert Message
           - Shows only if error exists
           - Displays error message with dismiss button
           - User can dismiss to clear message
      -->
      <AlertMessage
        v-if="error"
        type="error"
        :message="error"
        @dismiss="error = ''"
      />

      <!-- Login Form
           @submit.prevent prevents default form submission
           Form submission calls handleLogin()
      -->
      <form @submit.prevent="handleLogin">
        <!-- Email Input Field
             - Type: email (HTML5 validation)
             - Placeholder: example@email.com
             - Binds to email ref with v-model equivalent
             - Required for form submission
        -->
        <FormInput
          id="email"
          label="Email"
          type="email"
          :value="email"
          placeholder="your@email.com"
          required
          @update:value="email = $event"
        />

        <!-- Password Input Field
             - Type: password (hides input as dots)
             - Placeholder: dots for visual feedback
             - Binds to password ref with v-model equivalent
             - Required for form submission
        -->
        <FormInput
          id="password"
          label="Password"
          type="password"
          :value="password"
          placeholder="••••••••"
          required
          @update:value="password = $event"
        />

        <!-- Submit Button
             - type="submit" triggers form submission
             - variant="primary" for visual prominence
             - size="large" for easier clicking
             - style="width: 100%" makes button full-width
             - :loading="loading" shows loading state
             - Button text changes based on loading state
             - Disabled while loading (via Button component)
        -->
        <Button
          type="submit"
          variant="primary"
          size="large"
          :loading="loading"
          @click="handleLogin"
          style="width: 100%"
        >
          {{ loading ? 'Logging in...' : 'Login' }}
        </Button>
      </form>

      <!-- Information Text
           - Tells user how to get an account
           - Links to admin contact if needed
      -->
      <p class="info-text">
        Contact an administrator to request an account.
      </p>
    </div>
  </div>
</template>

<style scoped src="@/styles/pages/LoginPage.css"></style>
