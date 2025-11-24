<script setup>
defineProps({
  title: {
    type: String,
    required: true,
  },
  subtitle: {
    type: String,
    default: '',
  },
})
</script>

<template>
  <div class="page-header">
    <h1>{{ title }}</h1>
    <p v-if="subtitle">{{ subtitle }}</p>
  </div>
</template>

<style scoped>
.page-header {
  background-color: var(--primary-light);
  border-left: 4px solid var(--primary-color);
  padding: 2rem;
  margin-bottom: 2rem;
  border-radius: 3px;
}

.page-header h1 {
  margin: 0 0 0.5rem 0;
  color: var(--text-color);
  font-size: 2rem;
}

.page-header p {
  margin: 0;
  color: var(--text-muted);
  font-size: 1.05rem;
}

@media (max-width: 480px) {
  .page-header {
    padding: 1.5rem;
  }

  .page-header h1 {
    font-size: 1.4rem;
  }

  .page-header p {
    font-size: 0.95rem;
  }
}
</style>
