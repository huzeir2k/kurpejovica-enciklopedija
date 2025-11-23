<script setup>
import { ref, onMounted } from 'vue'
import { familyService } from '@/services/familyService'

const query = ref('')
const results = ref([])
const loading = ref(false)

async function handleSearch() {
  if (!query.value.trim()) {
    results.value = []
    return
  }

  loading.value = true
  try {
    const response = await familyService.searchFamilyMembers(query.value)
    results.value = response.members || []
  } catch (error) {
    console.error('Search error:', error)
    results.value = []
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="search-page">
    <div class="search-box">
      <h1>Search Family Members</h1>
      <form @submit.prevent="handleSearch">
        <div class="search-input-group">
          <input
            v-model="query"
            type="text"
            placeholder="Enter name or keywords..."
            class="search-input"
          />
          <button type="submit" class="btn-search">
            Search
          </button>
        </div>
      </form>
    </div>

    <div v-if="loading" class="loading">
      Searching...
    </div>

    <div v-else-if="results.length > 0" class="results">
      <div class="results-count">
        Found {{ results.length }} result{{ results.length !== 1 ? 's' : '' }}
      </div>
      <div class="results-list">
        <div
          v-for="member in results"
          :key="member.id"
          class="result-item"
        >
          <RouterLink :to="`/member/${member.id}`">
            <h3>{{ member.name }}</h3>
            <p v-if="member.birthYear" class="dates">
              {{ member.birthYear }} - {{ member.deathYear || 'Present' }}
            </p>
            <p v-if="member.shortBio" class="bio">
              {{ member.shortBio }}
            </p>
          </RouterLink>
        </div>
      </div>
    </div>

    <div v-else-if="query" class="no-results">
      No results found for "{{ query }}"
    </div>

    <div v-else class="prompt">
      Enter a search query to find family members.
    </div>
  </div>
</template>

<style scoped>
.search-page {
  padding: 0;
}

.search-box {
  background-color: var(--primary-light);
  border-left: 4px solid var(--primary-color);
  padding: 2rem 1.5rem;
  border-radius: 3px;
  margin-bottom: 2rem;
  text-align: center;
}

.search-box h1 {
  margin-top: 0;
  margin-bottom: 1.5rem;
  font-size: 1.8rem;
  color: var(--text-color);
}

.search-input-group {
  display: flex;
  gap: 0.5rem;
  max-width: 600px;
  margin: 0 auto;
}

.search-input {
  flex: 1;
  padding: 0.7rem 0.8rem;
  border: 1px solid var(--border-color);
  border-radius: 3px;
  font-size: 1rem;
  background-color: white;
  color: var(--text-color);
}

.search-input:focus {
  outline: none;
  border-color: var(--primary-color);
  box-shadow: 0 0 0 2px rgba(51, 102, 204, 0.15);
}

.btn-search {
  padding: 0.7rem 1.2rem;
  background: var(--primary-color);
  color: white;
  border: 1px solid var(--primary-dark);
  border-radius: 3px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.2s;
  font-size: 0.95rem;
}

.btn-search:hover {
  background: var(--primary-dark);
  opacity: 0.8;
}

.loading,
.no-results,
.prompt {
  text-align: center;
  padding: 2.5rem 1rem;
  color: var(--text-muted);
  font-size: 1rem;
}

.results-count {
  margin-bottom: 1.5rem;
  color: var(--text-muted);
  font-size: 0.9rem;
}

.results-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.result-item {
  background: white;
  border-left: 4px solid var(--primary-color);
  padding: 1.25rem;
  border-radius: 3px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
  border: 1px solid #d0d0d0;
  border-left: 4px solid var(--primary-color);
  transition: all 0.2s;
}

.result-item:hover {
  box-shadow: 0 2px 6px rgba(51, 102, 204, 0.15);
}

.result-item a {
  text-decoration: none;
  color: inherit;
}

.result-item h3 {
  margin: 0 0 0.4rem 0;
  color: var(--primary-color);
  font-size: 1.15rem;
  border-bottom: none;
}

.dates {
  margin: 0.2rem 0;
  color: var(--text-muted);
  font-weight: 500;
  font-size: 0.9rem;
}

.bio {
  margin: 0.6rem 0 0 0;
  color: var(--text-color);
  line-height: 1.6;
  font-size: 0.95rem;
}

@media (max-width: 600px) {
  .search-box {
    padding: 1.5rem 1rem;
  }

  .search-box h1 {
    font-size: 1.4rem;
  }

  .search-input-group {
    flex-direction: column;
  }

  .btn-search {
    width: 100%;
  }
}
</style>
