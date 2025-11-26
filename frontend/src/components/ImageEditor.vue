<script setup>
/**
 * IMAGE EDITOR COMPONENT
 * 
 * Edit image metadata (caption, alt text, display width, etc.)
 * Features:
 * - Update caption and alt text
 * - Adjust display width
 * - Delete image
 * - Preview changes in real-time
 * 
 * Props:
 * - image: Image object to edit
 * - onSave: Callback when changes saved
 * - onDelete: Callback when image deleted
 * 
 * Usage:
 * <ImageEditor
 *   :image="selectedImage"
 *   @save="handleImageSave"
 *   @delete="handleImageDelete"
 * />
 */

import { ref } from 'vue'
import FormInput from '@/components/FormInput.vue'
import FormTextarea from '@/components/FormTextarea.vue'
import FormSelect from '@/components/FormSelect.vue'
import Button from '@/components/Button.vue'
import AlertMessage from '@/components/AlertMessage.vue'
import api from '@/services/api'

const props = defineProps({
  image: {
    type: Object,
    required: true,
  },
})

const emit = defineEmits(['save', 'delete', 'close'])

/**
 * REACTIVE STATE
 */

const saving = ref(false)
const deleting = ref(false)
const error = ref('')
const success = ref('')

/**
 * Form data for editing
 */
const editData = ref({
  caption: props.image?.caption || '',
  altText: props.image?.alt_text || '',
  description: props.image?.description || '',
  displayWidth: props.image?.display_width || '100%',
})

/**
 * Display width options
 */
const displayWidthOptions = [
  { value: '100%', label: 'Full width' },
  { value: '75%', label: '75% width' },
  { value: '50%', label: '50% width (half)' },
  { value: '33%', label: '33% width (third)' },
  { value: '300px', label: '300px' },
  { value: '400px', label: '400px' },
  { value: '500px', label: '500px' },
]

/**
 * Save image metadata
 */
async function saveImage() {
  saving.value = true
  error.value = ''
  success.value = ''

  try {
    const response = await api.put(`/images/${props.image.id}`, {
      caption: editData.value.caption,
      alt_text: editData.value.altText,
      description: editData.value.description,
      display_width: editData.value.displayWidth,
    })

    success.value = 'Image updated successfully!'
    emit('save', response.data)

    setTimeout(() => emit('close'), 1500)
  } catch (err) {
    error.value = err.response?.data?.error || 'Failed to save image'
  } finally {
    saving.value = false
  }
}

/**
 * Delete image
 */
async function deleteImage() {
  if (!confirm('Are you sure you want to delete this image?')) return

  deleting.value = true
  error.value = ''

  try {
    await api.delete(`/images/${props.image.id}`)
    emit('delete', props.image.id)
    emit('close')
  } catch (err) {
    error.value = err.response?.data?.error || 'Failed to delete image'
  } finally {
    deleting.value = false
  }
}
</script>

<template>
  <div class="image-editor">
    <!-- Messages -->
    <AlertMessage
      v-if="error"
      type="error"
      :message="error"
      @dismiss="error = ''"
    />
    <AlertMessage
      v-if="success"
      type="success"
      :message="success"
      @dismiss="success = ''"
    />

    <!-- Preview -->
    <div class="editor-preview">
      <h3>Preview</h3>
      <img
        :src="image.url"
        :alt="editData.altText || 'Image'"
        :style="{ maxWidth: editData.displayWidth }"
      />
      <p v-if="editData.caption" class="preview-caption">{{ editData.caption }}</p>
    </div>

    <!-- Edit form -->
    <div class="editor-form">
      <h3>Edit Details</h3>

      <FormInput
        id="caption"
        label="Caption"
        type="text"
        :value="editData.caption"
        placeholder="Image caption..."
        @update:value="editData.caption = $event"
      />

      <FormInput
        id="altText"
        label="Alt Text"
        type="text"
        :value="editData.altText"
        placeholder="Alternative text for accessibility..."
        @update:value="editData.altText = $event"
      />

      <FormTextarea
        id="description"
        label="Description"
        :value="editData.description"
        placeholder="Detailed description..."
        :rows="3"
        @update:value="editData.description = $event"
      />

      <FormSelect
        id="displayWidth"
        label="Display Width"
        :value="editData.displayWidth"
        :options="displayWidthOptions"
        @update:value="editData.displayWidth = $event"
      />

      <!-- Buttons -->
      <div class="editor-actions">
        <Button
          variant="primary"
          :loading="saving"
          @click="saveImage"
        >
          Save Changes
        </Button>
        <Button
          variant="danger"
          :loading="deleting"
          @click="deleteImage"
        >
          Delete Image
        </Button>
        <Button
          variant="secondary"
          :disabled="saving || deleting"
          @click="$emit('close')"
        >
          Close
        </Button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.image-editor {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;
  padding: 1.5rem;
  background: white;
  border-radius: 8px;
  border: 1px solid #ddd;
}

.editor-preview {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.editor-preview h3 {
  margin: 0;
  color: #333;
}

.editor-preview img {
  max-width: 100%;
  height: auto;
  border-radius: 8px;
  border: 1px solid #ddd;
  background: #f5f5f5;
}

.preview-caption {
  margin: 0;
  padding: 0.75rem;
  background: #f5f5f5;
  border-radius: 4px;
  font-size: 0.9rem;
  color: #666;
}

.editor-form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.editor-form h3 {
  margin: 0;
  color: #333;
}

.editor-actions {
  display: flex;
  gap: 1rem;
  margin-top: 1rem;
}

@media (max-width: 768px) {
  .image-editor {
    grid-template-columns: 1fr;
  }

  .editor-actions {
    flex-direction: column;
  }
}
</style>
