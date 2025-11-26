<script setup>
import { onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useLanguageStore } from '@/stores/language'

const authStore = useAuthStore()
const languageStore = useLanguageStore()

onMounted(async () => {
  await Promise.all([
    authStore.fetchCurrentUser(),
    languageStore.initializeLanguage(),
  ])
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
        <RouterLink to="/articles" class="nav-link">Articles</RouterLink>
        <div class="language-selector">
          <select
            :value="languageStore.currentLanguage"
            @change="languageStore.setLanguage($event.target.value)"
            class="language-select"
            :title="languageStore.isAutoDetected ? 'Language auto-detected from your location' : 'Select language'"
          >
            <option
              v-for="lang in languageStore.getAvailableLanguages()"
              :key="lang.code"
              :value="lang.code"
            >
              {{ lang.nativeName }}
            </option>
          </select>
          <span v-if="languageStore.isAutoDetected" class="auto-detect-badge" title="This language was auto-detected">
            🌍
          </span>
        </div>
        <div class="auth-menu">
          <template v-if="authStore.isAuthenticated">
            <span class="user-name">{{ authStore.user?.name }}</span>
            <RouterLink v-if="authStore.canEdit" to="/family" class="nav-link editor-link">
              Family Management
            </RouterLink>
            <RouterLink v-if="authStore.isAdmin" to="/admin/articles" class="nav-link editor-link">
              Manage Articles
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

<style scoped src="@/styles/App.css"></style>

