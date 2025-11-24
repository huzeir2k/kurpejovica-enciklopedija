<script setup>
import { ref } from 'vue'
import { familyService } from '@/services/familyService'
import FormInput from '@/components/FormInput.vue'
import Button from '@/components/Button.vue'
import LoadingSpinner from '@/components/LoadingSpinner.vue'
import MemberCard from '@/components/MemberCard.vue'

const query = ref('')
const results = ref([])
const loading = ref(false)
const searched = ref(false)

async function handleSearch() {
  if (!query.value.trim()) {
    results.value = []
    searched.value = false
    return
  }

  loading.value = true
  searched.value = true
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
      <form @submit.prevent="handleSearch" class="search-form">
        <FormInput
          id="search"
          label=""
          type="text"
          :value="query"
          placeholder="Enter name or keywords..."
          @update:value="query = $event"
        />
        <Button
          type="submit"
          variant="primary"
          size="large"
          :loading="loading"
        >
          Search
        </Button>
      </form>
    </div>

    <LoadingSpinner
      v-if="loading"
      message="Searching..."
      size="large"
    />

    <div v-else-if="results.length > 0" class="results">
      <div class="results-count">
        Found {{ results.length }} result{{ results.length !== 1 ? 's' : '' }}
      </div>
      <div class="results-grid">
        <MemberCard
          v-for="member in results"
          :key="member.id"
          :member="member"
        />
      </div>
    </div>

    <div v-else-if="searched" class="no-results">
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

.search-form {
  display: flex;
  gap: 0.5rem;
  max-width: 600px;
  margin: 0 auto;
}

.search-form :deep(.form-group) {
  margin-bottom: 0;
  flex: 1;
}

.search-form :deep(.form-group label) {
  display: none;
}

.results-count {
  margin-bottom: 1.5rem;
  color: var(--text-muted);
  font-size: 0.9rem;
}

.results-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1.5rem;
}

.no-results,
.prompt {
  text-align: center;
  padding: 2.5rem 1rem;
  color: var(--text-muted);
  font-size: 1rem;
}

@media (max-width: 600px) {
  .search-box {
    padding: 1.5rem 1rem;
  }

  .search-box h1 {
    font-size: 1.4rem;
  }

  .search-form {
    flex-direction: column;
  }

  .search-form :deep(.form-input) {
    margin-bottom: 1rem;
  }

  .results-grid {
    grid-template-columns: 1fr;
  }
}
</style>
