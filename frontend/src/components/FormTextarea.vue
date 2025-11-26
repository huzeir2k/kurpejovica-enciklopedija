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

<style scoped src="@/styles/components/FormTextarea.css"></style>
