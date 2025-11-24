<script setup>
defineProps({
  id: {
    type: String,
    required: true,
  },
  label: {
    type: String,
    required: true,
  },
  placeholder: {
    type: String,
    default: '',
  },
  value: {
    type: String,
    default: '',
  },
  rows: {
    type: Number,
    default: 5,
  },
  required: {
    type: Boolean,
    default: false,
  },
  disabled: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['update:value'])

function handleInput(event) {
  emit('update:value', event.target.value)
}
</script>

<template>
  <div class="form-group">
    <label :for="id">{{ label }}</label>
    <textarea
      :id="id"
      :placeholder="placeholder"
      :value="value"
      :rows="rows"
      :required="required"
      :disabled="disabled"
      @input="handleInput"
      class="form-textarea"
    ></textarea>
  </div>
</template>

<style scoped>
.form-group {
  margin-bottom: 1.25rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.4rem;
  color: var(--text-color);
  font-weight: 600;
  font-size: 0.95rem;
}

.form-textarea {
  width: 100%;
  padding: 0.6rem 0.8rem;
  border: 1px solid var(--border-color);
  border-radius: 3px;
  font-size: 1rem;
  box-sizing: border-box;
  background-color: white;
  color: var(--text-color);
  font-family: inherit;
  resize: vertical;
  transition: all 0.2s;
}

.form-textarea:focus {
  outline: none;
  border-color: var(--primary-color);
  box-shadow: 0 0 0 2px rgba(51, 102, 204, 0.15);
}

.form-textarea:disabled {
  background-color: var(--bg-secondary);
  cursor: not-allowed;
  opacity: 0.6;
}
</style>
