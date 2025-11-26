<script setup>
defineProps({
  member: {
    type: Object,
    required: true,
  },
})
</script>

<template>
  <div class="member-card">
    <RouterLink :to="`/member/${member.id}`">
      <h3>{{ member.name }}</h3>
      <p v-if="member.birthYear || member.birth_year" class="dates">
        {{ member.birthYear || member.birth_year }} - {{ member.deathYear || member.death_year || 'Present' }}
      </p>
      <p v-if="member.shortBio || member.short_bio" class="description">
        {{ member.shortBio || member.short_bio }}
      </p>
    </RouterLink>
  </div>
</template>

<style scoped src="@/styles/components/MemberCard.css"></style>
