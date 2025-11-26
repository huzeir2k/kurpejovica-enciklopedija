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

<style scoped src="@/styles/components/LoadingSpinner.css"></style>
