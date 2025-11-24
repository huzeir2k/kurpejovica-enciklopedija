<script setup>
defineProps({
  message: {
    type: String,
    default: 'Loading...',
  },
  size: {
    type: String,
    default: 'medium',
    validator: (value) => ['small', 'medium', 'large'].includes(value),
  },
})
</script>

<template>
  <div :class="['loading-container', `size-${size}`]">
    <div class="spinner"></div>
    <p>{{ message }}</p>
  </div>
</template>

<style scoped>
.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  padding: 2rem 1rem;
  color: var(--text-muted);
}

.spinner {
  border: 3px solid var(--border-color);
  border-top: 3px solid var(--primary-color);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

.size-small .spinner {
  width: 24px;
  height: 24px;
}

.size-medium .spinner {
  width: 40px;
  height: 40px;
}

.size-large .spinner {
  width: 60px;
  height: 60px;
}

.loading-container.size-small {
  padding: 1rem;
  gap: 0.5rem;
}

.loading-container.size-small p {
  font-size: 0.9rem;
}

.loading-container.size-large {
  padding: 3rem 1rem;
}

.loading-container.size-large p {
  font-size: 1.1rem;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}
</style>
