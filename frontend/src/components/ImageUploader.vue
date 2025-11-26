<script setup>
/**
 * IMAGE UPLOADER COMPONENT
 * 
 * Handles image uploads with metadata (caption, alt text, sizing).
 * Features:
 * - Drag-and-drop file upload
 * - File input dialog
 * - Preview before upload
 * - Metadata fields (caption, alt text, display width)
 * - Progress indication
 * - Error handling
 * 
 * Props:
 * - familyMemberId: Optional family member ID
 * - articleId: Optional article ID
 * - maxImages: Max number of images (default 10)
 * 
 * Emits:
 * - upload-success: Image successfully uploaded
 * - upload-error: Upload failed
 * 
 * Usage:
 * <ImageUploader
 *   :familyMemberId="memberId"
 *   @upload-success="handleImageUploaded"
 *   @upload-error="handleUploadError"
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
  familyMemberId: {
    type: Number,
    default: null,
  },
  articleId: {
    type: Number,
    default: null,
  },
  maxImages: {
    type: Number,
    default: 10,
  },
})

const emit = defineEmits(['upload-success', 'upload-error'])

/**
 * REACTIVE STATE
 */

const fileInput = ref(null)
const selectedFile = ref(null)
const preview = ref(null)
const uploading = ref(false)
const uploadProgress = ref(0)
const error = ref('')
const success = ref('')

/**
 * Form data for image metadata
 */
const imageData = ref({
  caption: '',
  altText: '',
  description: '',
  displayWidth: '100%',
})

/**
 * Display width options for common sizes
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
 * FUNCTIONS
 */

/**
 * Trigger file input dialog
 */
function triggerFileInput() {
  fileInput.value?.click()
}

/**
 * Handle file selection from input or drag-drop
 */
function handleFileSelect(event) {
  const files = event.target.files || event.dataTransfer?.files
  if (!files || files.length === 0) return

  const file = files[0]

  // Validate file type
  if (!file.type.startsWith('image/')) {
    error.value = 'Please select an image file'
    return
  }

  // Validate file size (max 10MB)
  if (file.size > 10 * 1024 * 1024) {
    error.value = 'File size must be less than 10MB'
    return
  }

  selectedFile.value = file
  error.value = ''

  // Generate preview
  const reader = new FileReader()
  reader.onload = (e) => {
    preview.value = e.target.result
  }
  reader.readAsDataURL(file)
}

/**
 * Handle drag-over event
 */
function handleDragOver(event) {
  event.preventDefault()
  event.currentTarget.classList.add('drag-over')
}

/**
 * Handle drag-leave event
 */
function handleDragLeave(event) {
  event.currentTarget.classList.remove('drag-over')
}

/**
 * Handle drop event
 */
function handleDrop(event) {
  event.preventDefault()
  event.currentTarget.classList.remove('drag-over')
  handleFileSelect(event)
}

/**
 * Cancel upload and clear form
 */
function cancelUpload() {
  selectedFile.value = null
  preview.value = null
  imageData.value = {
    caption: '',
    altText: '',
    description: '',
    displayWidth: '100%',
  }
  error.value = ''
  if (fileInput.value) {
    fileInput.value.value = ''
  }
}

/**
 * Upload image with metadata
 */
async function uploadImage() {
  if (!selectedFile.value) {
    error.value = 'Please select an image'
    return
  }

  if (!props.familyMemberId && !props.articleId) {
    error.value = 'Either familyMemberId or articleId is required'
    return
  }

  uploading.value = true
  uploadProgress.value = 0
  error.value = ''
  success.value = ''

  try {
    const formData = new FormData()
    formData.append('file', selectedFile.value)

    if (props.familyMemberId) {
      formData.append('family_member_id', props.familyMemberId)
    }
    if (props.articleId) {
      formData.append('article_id', props.articleId)
    }

    formData.append('caption', imageData.value.caption)
    formData.append('alt_text', imageData.value.altText)
    formData.append('description', imageData.value.description)
    formData.append('display_width', imageData.value.displayWidth)

    const response = await api.post('/images/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: (progressEvent) => {
        uploadProgress.value = Math.round((progressEvent.loaded / progressEvent.total) * 100)
      },
    })

    success.value = 'Image uploaded successfully!'
    emit('upload-success', response.data.image)

    // Reset form
    setTimeout(() => cancelUpload(), 1500)
  } catch (err) {
    error.value = err.response?.data?.error || 'Upload failed'
    emit('upload-error', error.value)
  } finally {
    uploading.value = false
  }
}
</script>

<template>
  <div class="image-uploader">
    <!-- Show preview if image selected -->
    <div v-if="preview" class="uploader-content">
      <!-- Preview section -->
      <div class="preview-section">
        <h3>Image Preview</h3>
        <img :src="preview" alt="Preview" class="preview-image" />
      </div>

      <!-- Metadata form -->
      <div class="metadata-section">
        <h3>Image Details</h3>

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

        <!-- Caption -->
        <FormInput
          id="caption"
          label="Caption (displayed under image)"
          type="text"
          :value="imageData.caption"
          placeholder="e.g., 'Family gathering 1925'"
          @update:value="imageData.caption = $event"
        />

        <!-- Alt text -->
        <FormInput
          id="altText"
          label="Alt Text (for accessibility)"
          type="text"
          :value="imageData.altText"
          placeholder="e.g., 'Three men in formal attire'"
          @update:value="imageData.altText = $event"
        />

        <!-- Description -->
        <FormTextarea
          id="description"
          label="Description"
          :value="imageData.description"
          placeholder="Detailed description of the image..."
          :rows="3"
          @update:value="imageData.description = $event"
        />

        <!-- Display width -->
        <FormSelect
          id="displayWidth"
          label="Display Width"
          :value="imageData.displayWidth"
          :options="displayWidthOptions"
          @update:value="imageData.displayWidth = $event"
        />

        <!-- Upload progress -->
        <div v-if="uploading" class="progress-container">
          <div class="progress-bar">
            <div class="progress-fill" :style="{ width: uploadProgress + '%' }"></div>
          </div>
          <p class="progress-text">Uploading... {{ uploadProgress }}%</p>
        </div>

        <!-- Action buttons -->
        <div class="button-group">
          <Button
            variant="primary"
            :loading="uploading"
            @click="uploadImage"
          >
            {{ uploading ? 'Uploading...' : 'Upload Image' }}
          </Button>
          <Button
            variant="secondary"
            :disabled="uploading"
            @click="cancelUpload"
          >
            Cancel
          </Button>
        </div>
      </div>
    </div>

    <!-- Show upload area if no image selected -->
    <div
      v-else
      class="upload-area"
      @dragover="handleDragOver"
      @dragleave="handleDragLeave"
      @drop="handleDrop"
    >
      <div class="upload-prompt">
        <div class="upload-icon">📷</div>
        <h3>Upload Image</h3>
        <p>Drag and drop an image here or click to select</p>
        <p class="file-requirements">
          Supported: JPEG, PNG, WebP, GIF (max 10MB)
        </p>
      </div>

      <Button
        variant="primary"
        @click="triggerFileInput"
      >
        Select Image
      </Button>

      <!-- Hidden file input -->
      <input
        ref="fileInput"
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        style="display: none"
        @change="handleFileSelect"
      />

      <!-- Error message -->
      <AlertMessage
        v-if="error"
        type="error"
        :message="error"
        @dismiss="error = ''"
      />
    </div>
  </div>
</template>

<style scoped>
.image-uploader {
  width: 100%;
  padding: 1.5rem;
  border: 2px solid #ddd;
  border-radius: 8px;
  background: #fafafa;
}

/* Upload Area (no image selected) */
.upload-area {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.5rem;
  padding: 2rem;
  border: 2px dashed #426A8C;
  border-radius: 8px;
  background: #f0f4f8;
  text-align: center;
  cursor: pointer;
  transition: all 0.2s;
}

.upload-area:hover {
  border-color: #46788C;
  background: #e8eff5;
}

.upload-area.drag-over {
  border-color: #55736D;
  background: #dfe8e4;
}

.upload-prompt {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
}

.upload-icon {
  font-size: 3rem;
}

.upload-prompt h3 {
  margin: 0;
  color: #333;
  font-size: 1.25rem;
}

.upload-prompt p {
  margin: 0;
  color: #666;
  font-size: 0.95rem;
}

.file-requirements {
  font-size: 0.85rem;
  color: #999;
}

/* Uploader Content (image selected) */
.uploader-content {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;
}

.preview-section {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.preview-section h3 {
  margin: 0;
  color: #333;
}

.preview-image {
  width: 100%;
  max-width: 400px;
  height: auto;
  border-radius: 8px;
  object-fit: contain;
  background: white;
  border: 1px solid #ddd;
}

.metadata-section {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.metadata-section h3 {
  margin: 0;
  color: #333;
}

/* Progress bar */
.progress-container {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.progress-bar {
  width: 100%;
  height: 8px;
  background: #e0e0e0;
  border-radius: 4px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #426A8C, #46788C);
  transition: width 0.2s;
}

.progress-text {
  font-size: 0.875rem;
  color: #666;
  margin: 0;
}

/* Buttons */
.button-group {
  display: flex;
  gap: 1rem;
}

/* Responsive */
@media (max-width: 768px) {
  .uploader-content {
    grid-template-columns: 1fr;
  }

  .button-group {
    flex-direction: column;
  }
}
</style>
