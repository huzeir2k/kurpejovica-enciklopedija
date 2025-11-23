<script setup>
import { onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useLanguageStore } from '@/stores/language'

const authStore = useAuthStore()
const languageStore = useLanguageStore()

onMounted(async () => {
  await authStore.fetchCurrentUser()
})
</script>

<template>
  <div class="app">
    <nav class="navbar">
      <div class="navbar-brand">
        <RouterLink to="/">
          <h1>Kurpejovica Enciklopedija</h1>
        </RouterLink>
      </div>
      <div class="navbar-menu">
        <RouterLink to="/search" class="nav-link">Search</RouterLink>
        <div class="language-selector">
          <select
            :value="languageStore.currentLanguage"
            @change="languageStore.setLanguage($event.target.value)"
            class="language-select"
          >
            <option
              v-for="lang in languageStore.getAvailableLanguages()"
              :key="lang.code"
              :value="lang.code"
            >
              {{ lang.nativeName }}
            </option>
          </select>
        </div>
        <div class="auth-menu">
          <template v-if="authStore.isAuthenticated">
            <span class="user-name">{{ authStore.user?.name }}</span>
            <RouterLink v-if="authStore.isAdmin" to="/articles" class="nav-link editor-link">
              Edit Articles
            </RouterLink>
            <RouterLink v-if="authStore.isAdmin" to="/admin" class="nav-link admin-link">
              Admin
            </RouterLink>
            <button @click="authStore.logout()" class="btn-logout">
              Logout
            </button>
          </template>
          <template v-else>
            <RouterLink to="/login" class="nav-link">Login</RouterLink>
          </template>
        </div>
      </div>
    </nav>

    <main class="main-content">
      <RouterView />
    </main>

    <footer class="footer">
      <p>&copy; 2025 Kurpejovica Enciklopedija. All rights reserved.</p>
    </footer>
  </div>
</template>

<style scoped>
.app {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background-color: var(--bg-secondary);
}

.navbar {
  background-color: white;
  border-bottom: 1px solid var(--border-color);
  padding: 1rem;
  box-shadow: 0 1px 1px rgba(0, 0, 0, 0.1);
  position: sticky;
  top: 0;
  z-index: 100;
}

.navbar-brand h1 {
  margin: 0;
  font-size: 1.4rem;
  color: var(--primary-color);
}

.navbar-brand a {
  color: var(--primary-color);
  text-decoration: none;
  display: flex;
  align-items: center;
}

.navbar-menu {
  display: flex;
  gap: 1rem;
  align-items: center;
  flex-wrap: wrap;
  margin-top: 1rem;
}

.nav-link {
  color: var(--primary-color);
  text-decoration: none;
  padding: 0.4rem 0.8rem;
  border-radius: 3px;
  transition: background-color 0.2s;
  font-size: 0.95rem;
}

.nav-link:hover {
  background-color: var(--primary-light);
}

.admin-link {
  background-color: var(--primary-light);
  font-weight: 600;
}

.editor-link {
  background-color: #f0f7ff;
  color: var(--primary-color);
  font-weight: 600;
}

.language-select {
  padding: 0.4rem 0.6rem;
  border: 1px solid var(--border-color);
  border-radius: 3px;
  font-size: 0.9rem;
  background-color: white;
  color: var(--text-color);
}

.auth-menu {
  display: flex;
  gap: 1rem;
  align-items: center;
  margin-left: auto;
}

.user-name {
  font-size: 0.9rem;
  color: var(--text-muted);
}

.btn-logout {
  background-color: transparent;
  color: var(--primary-color);
  border: 1px solid var(--border-color);
  padding: 0.4rem 0.8rem;
  border-radius: 3px;
  cursor: pointer;
  font-size: 0.9rem;
  transition: all 0.2s;
}

.btn-logout:hover {
  background-color: var(--primary-light);
}

.main-content {
  flex: 1;
  padding: 1.5rem;
  max-width: 900px;
  margin: 0 auto;
  width: 100%;
}

.footer {
  background-color: white;
  text-align: center;
  padding: 1.5rem;
  border-top: 1px solid var(--border-color);
  color: var(--text-muted);
  font-size: 0.85rem;
}

@media (max-width: 768px) {
  .navbar {
    padding: 0.75rem;
  }

  .navbar-menu {
    gap: 0.5rem;
    margin-top: 0.5rem;
  }

  .navbar-brand h1 {
    font-size: 1.2rem;
  }

  .auth-menu {
    margin-left: 0;
    width: 100%;
    justify-content: flex-start;
  }

  .main-content {
    padding: 1rem;
  }
}
</style>

