<script setup>
defineProps({
  type: {
    type: String,
    default: 'info',
    validator: (value) => ['error', 'success', 'warning', 'info'].includes(value),
  },
  message: {
    type: String,
    required: true,
  },
  dismissible: {
    type: Boolean,
    default: true,
  },
})

const emit = defineEmits(['dismiss'])
</script>

<template>
  <div :class="['alert', `alert-${type}`]" v-if="message">
    <div class="alert-content">
      {{ message }}
      <button
        v-if="dismissible"
        @click="emit('dismiss')"
        class="alert-close"
        aria-label="Close alert"
      >
        ×
      </button>
    </div>
  </div>
</template>

<style scoped>
.alert {
  padding: 1rem;
  margin-bottom: 1.5rem;
  border-radius: 3px;
  border-left: 4px solid;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.alert-content {
  flex: 1;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
}

.alert-error {
  background: #fee;
  border-left-color: var(--error-color);
  color: var(--error-color);
}

.alert-success {
  background: #efe;
  border-left-color: var(--success-color);
  color: var(--success-color);
}

.alert-warning {
  background: #fef3cd;
  border-left-color: #856404;
  color: #856404;
}

.alert-info {
  background: #d1ecf1;
  border-left-color: #0c5460;
  color: #0c5460;
}

.alert-close {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: inherit;
  padding: 0;
  opacity: 0.7;
  transition: opacity 0.2s;
}

.alert-close:hover {
  opacity: 1;
}
</style>
