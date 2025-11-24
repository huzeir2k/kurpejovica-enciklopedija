<script setup>
import { ref, onMounted } from 'vue'
import { familyService } from '@/services/familyService'
import PageHeader from '@/components/PageHeader.vue'
import LoadingSpinner from '@/components/LoadingSpinner.vue'
import MemberCard from '@/components/MemberCard.vue'
import Button from '@/components/Button.vue'

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
    <PageHeader
      title="Welcome to Kurpejovica Enciklopedija"
      subtitle="A comprehensive family encyclopedia, available in multiple languages."
    />

    <LoadingSpinner
      v-if="loading"
      message="Loading family members..."
      size="large"
    />

    <div v-else class="members-grid">
      <MemberCard
        v-for="member in familyMembers.slice(0, 9)"
        :key="member.id"
        :member="member"
      />
    </div>

    <div class="see-all">
      <RouterLink to="/search">
        <Button variant="primary" size="large">
          View All Members
        </Button>
      </RouterLink>
    </div>
  </div>
</template>

<style scoped>
.home-page {
  padding: 0;
}

.members-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.see-all {
  text-align: center;
  margin: 2rem 0;
}

.see-all a {
  text-decoration: none;
}

@media (max-width: 600px) {
  .members-grid {
    grid-template-columns: 1fr;
  }
}
</style>
