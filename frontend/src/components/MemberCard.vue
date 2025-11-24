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

<style scoped>
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
</style>
