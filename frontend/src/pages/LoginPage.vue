<script setup>
import { ref } from 'vue'
import { useAuth } from '@/composables/useAuth'
import { useRouter } from 'vue-router'
import FormInput from '@/components/FormInput.vue'
import Button from '@/components/Button.vue'
import AlertMessage from '@/components/AlertMessage.vue'

const email = ref('')
const password = ref('')
const error = ref('')
const loading = ref(false)
const { login } = useAuth()
const router = useRouter()

async function handleLogin() {
  error.value = ''
  loading.value = true
  try {
    await login(email.value, password.value)
    router.push('/')
  } catch (err) {
    error.value = err.response?.data?.message || 'Login failed'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="login-page">
    <div class="login-box">
      <h2>Login to Kurpejovica Enciklopedija</h2>

      <AlertMessage
        v-if="error"
        type="error"
        :message="error"
        @dismiss="error = ''"
      />

      <form @submit.prevent="handleLogin">
        <FormInput
          id="email"
          label="Email"
          type="email"
          :value="email"
          placeholder="your@email.com"
          required
          @update:value="email = $event"
        />

        <FormInput
          id="password"
          label="Password"
          type="password"
          :value="password"
          placeholder="••••••••"
          required
          @update:value="password = $event"
        />

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

      <p class="info-text">
        Contact an administrator to request an account.
      </p>
    </div>
  </div>
</template>

<style scoped>
.login-page {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 60vh;
  padding: 1.5rem;
}

.login-box {
  background: white;
  padding: 2rem;
  border-radius: 3px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.12), 0 1px 2px rgba(0, 0, 0, 0.24);
  width: 100%;
  max-width: 380px;
  border: 1px solid #d0d0d0;
}

.login-box h2 {
  margin-top: 0;
  margin-bottom: 1.5rem;
  text-align: center;
  color: var(--text-color);
  font-size: 1.4rem;
}

.info-text {
  text-align: center;
  color: var(--text-muted);
  font-size: 0.85rem;
  margin-top: 1.25rem;
  margin-bottom: 0;
}

@media (max-width: 480px) {
  .login-box {
    padding: 1.5rem;
  }

  .login-box h2 {
    font-size: 1.2rem;
  }
}
</style>
