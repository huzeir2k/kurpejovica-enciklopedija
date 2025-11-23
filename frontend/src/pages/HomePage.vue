<script setup>
import { ref, onMounted } from 'vue'
import { familyService } from '@/services/familyService'

const familyMembers = ref([])
const loading = ref(false)

onMounted(async () => {
  loading.value = true
  try {
    const response = await familyService.getAllFamilyMembers()
    familyMembers.value = response.members || []
  } catch (error) {
    console.error('Error loading family members:', error)
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <div class="home-page">
    <div class="hero">
      <h1>Welcome to Kurpejovica Enciklopedija</h1>
      <p>A comprehensive family encyclopedia, available in multiple languages.</p>
    </div>

    <div v-if="loading" class="loading">
      Loading family members...
    </div>

    <div v-else class="members-grid">
      <div
        v-for="member in familyMembers.slice(0, 9)"
        :key="member.id"
        class="member-card"
      >
        <RouterLink :to="`/member/${member.id}`">
          <h3>{{ member.name }}</h3>
          <p v-if="member.birthYear">{{ member.birthYear }} - {{ member.deathYear || 'Present' }}</p>
          <p class="description" v-if="member.shortBio">{{ member.shortBio }}</p>
        </RouterLink>
      </div>
    </div>

    <div class="see-all">
      <RouterLink to="/search" class="btn-primary">
        View All Members
      </RouterLink>
    </div>
  </div>
</template>

<style scoped>
.home-page {
  padding: 0;
}

.hero {
  background-color: var(--primary-light);
  border-left: 4px solid var(--primary-color);
  padding: 2rem;
  margin-bottom: 2rem;
  border-radius: 3px;
}

.hero h1 {
  margin-top: 0;
  margin-bottom: 0.5rem;
  color: var(--text-color);
  font-size: 2rem;
}

.hero p {
  margin: 0;
  color: var(--text-muted);
  font-size: 1.05rem;
}

.loading {
  text-align: center;
  padding: 3rem 1rem;
  color: var(--text-muted);
}

.members-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.member-card {
  background: white;
  border: 1px solid #d0d0d0;
  border-radius: 3px;
  overflow: hidden;
  transition: all 0.2s;
  height: 100%;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
}

.member-card:hover {
  border-color: var(--primary-color);
  box-shadow: 0 2px 8px rgba(51, 102, 204, 0.2);
}

.member-card a {
  text-decoration: none;
  color: inherit;
  padding: 1.25rem;
  display: flex;
  flex-direction: column;
  height: 100%;
}

.member-card h3 {
  margin: 0 0 0.4rem 0;
  color: var(--primary-color);
  font-size: 1.15rem;
  border-bottom: none;
}

.member-card p {
  margin: 0.3rem 0;
  font-size: 0.85rem;
  color: var(--text-muted);
}

.description {
  flex-grow: 1;
  margin-top: 0.5rem;
  line-height: 1.6;
  color: var(--text-color);
}

.see-all {
  text-align: center;
  margin: 2rem 0;
}

.btn-primary {
  display: inline-block;
  background: var(--primary-color);
  color: white;
  padding: 0.75rem 1.5rem;
  border-radius: 3px;
  text-decoration: none;
  border: none;
  transition: all 0.2s;
  font-size: 1rem;
  cursor: pointer;
}

.btn-primary:hover {
  background: var(--primary-dark);
  opacity: 0.8;
}

@media (max-width: 600px) {
  .hero {
    padding: 1.5rem;
  }

  .hero h1 {
    font-size: 1.6rem;
  }

  .members-grid {
    grid-template-columns: 1fr;
  }
}
</style>
