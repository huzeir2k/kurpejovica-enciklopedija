<script setup>
defineProps({
  variant: {
    type: String,
    default: 'primary',
    validator: (value) => ['primary', 'secondary', 'danger', 'success'].includes(value),
  },
  size: {
    type: String,
    default: 'medium',
    validator: (value) => ['small', 'medium', 'large'].includes(value),
  },
  disabled: {
    type: Boolean,
    default: false,
  },
  loading: {
    type: Boolean,
    default: false,
  },
  type: {
    type: String,
    default: 'button',
  },
})

const emit = defineEmits(['click'])
</script>

<template>
  <button
    :class="['btn', `btn-${variant}`, `btn-${size}`]"
    :disabled="disabled || loading"
    :type="type"
    @click="emit('click')"
  >
    <span v-if="loading" class="spinner"></span>
    <slot></slot>
  </button>
</template>

<style scoped>
.btn {
  padding: 0.6rem 1rem;
  border: none;
  border-radius: 3px;
  cursor: pointer;
  font-size: 0.95rem;
  font-weight: 600;
  transition: all 0.2s;
  font-family: inherit;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
}

/* Variants */
.btn-primary {
  background: var(--primary-color);
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background: var(--primary-dark);
  opacity: 0.8;
}

.btn-secondary {
  background: var(--border-color);
  color: var(--text-color);
}

.btn-secondary:hover:not(:disabled) {
  background: var(--primary-light);
}

.btn-danger {
  background: var(--error-color);
  color: white;
}

.btn-danger:hover:not(:disabled) {
  opacity: 0.8;
}

.btn-success {
  background: var(--success-color);
  color: white;
}

.btn-success:hover:not(:disabled) {
  opacity: 0.8;
}

/* Sizes */
.btn-small {
  padding: 0.4rem 0.8rem;
  font-size: 0.85rem;
}

.btn-large {
  padding: 0.8rem 1.5rem;
  font-size: 1rem;
}

/* Disabled State */
.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* Loading Spinner */
.spinner {
  display: inline-block;
  width: 16px;
  height: 16px;
  border: 2px solid currentColor;
  border-top-color: transparent;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
