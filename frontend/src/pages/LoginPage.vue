<script setup>
import { ref } from 'vue'
import { useAuth } from '@/composables/useAuth'
import { useRouter } from 'vue-router'

const email = ref('')
const password = ref('')
const error = ref('')
const { login } = useAuth()
const router = useRouter()

async function handleLogin() {
  error.value = ''
  try {
    await login(email.value, password.value)
    router.push('/')
  } catch (err) {
    error.value = err.response?.data?.message || 'Login failed'
  }
}
</script>

<template>
  <div class="login-page">
    <div class="login-box">
      <h2>Login to Kurpejovica Enciklopedija</h2>

      <div v-if="error" class="error-message">
        {{ error }}
      </div>

      <form @submit.prevent="handleLogin">
        <div class="form-group">
          <label for="email">Email</label>
          <input
            id="email"
            v-model="email"
            type="email"
            required
            placeholder="your@email.com"
          />
        </div>

        <div class="form-group">
          <label for="password">Password</label>
          <input
            id="password"
            v-model="password"
            type="password"
            required
            placeholder="••••••••"
          />
        </div>

        <button type="submit" class="btn-login">
          Login
        </button>
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

.error-message {
  background: #fee;
  border-left: 4px solid var(--error-color);
  color: var(--error-color);
  padding: 0.75rem 1rem;
  border-radius: 3px;
  margin-bottom: 1.5rem;
  font-size: 0.9rem;
}

.form-group {
  margin-bottom: 1.25rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.4rem;
  color: var(--text-color);
  font-weight: 600;
  font-size: 0.95rem;
}

.form-group input {
  width: 100%;
  padding: 0.6rem 0.8rem;
  border: 1px solid var(--border-color);
  border-radius: 3px;
  font-size: 1rem;
  box-sizing: border-box;
  background-color: white;
  color: var(--text-color);
}

.form-group input:focus {
  outline: none;
  border-color: var(--primary-color);
  box-shadow: 0 0 0 2px rgba(51, 102, 204, 0.15);
}

.btn-login {
  width: 100%;
  padding: 0.7rem;
  background: var(--primary-color);
  color: white;
  border: 1px solid var(--primary-dark);
  border-radius: 3px;
  font-size: 1rem;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.2s;
}

.btn-login:hover {
  background: var(--primary-dark);
  opacity: 0.8;
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
