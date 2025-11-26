<script setup>
/**
 * IMAGE GALLERY COMPONENT
 * 
 * Displays a responsive gallery of images with optional captions.
 * Features:
 * - Responsive CSS grid layout
 * - Image zoom/lightbox functionality
 * - Caption display underneath each image
 * - Alt text for accessibility
 * - Clickable images for detail view
 * - Edit button for admin users
 * 
 * Props:
 * - images: Array of image objects
 * - isAdmin: Whether current user is admin
 * - onEdit: Callback when edit button clicked
 * - onDelete: Callback when delete button clicked
 * 
 * Usage:
 * <ImageGallery
 *   :images="images"
 *   :isAdmin="isAdmin"
 *   @edit="handleImageEdit"
 *   @delete="handleImageDelete"
 * />
 */

import { ref } from 'vue'
import Button from '@/components/Button.vue'

const props = defineProps({
  /**
   * images: Array of image objects
   * 
   * Each image object should contain:
   * {
   *   id: number,
   *   url: string,
   *   caption: string (optional),
   *   alt_text: string (optional),
   *   display_width: string (CSS width, e.g., "100%" or "300px")
   * }
   */
  images: {
    type: Array,
    default: () => [],
  },

  /**
   * isAdmin: Whether current user has edit permissions
   * Shows edit/delete buttons when true
   */
  isAdmin: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['edit', 'delete', 'select'])

/**
 * selectedImage: Currently selected image for lightbox
 * null when lightbox closed
 */
const selectedImage = ref(null)

/**
 * Close lightbox
 */
function closeImageModal() {
  selectedImage.value = null
}

/**
 * Navigate to next image in lightbox
 */
function nextImage() {
  if (!selectedImage.value) return
  const currentIndex = props.images.findIndex(img => img.id === selectedImage.value.id)
  if (currentIndex < props.images.length - 1) {
    selectedImage.value = props.images[currentIndex + 1]
  }
}

/**
 * Navigate to previous image in lightbox
 */
function prevImage() {
  if (!selectedImage.value) return
  const currentIndex = props.images.findIndex(img => img.id === selectedImage.value.id)
  if (currentIndex > 0) {
    selectedImage.value = props.images[currentIndex - 1]
  }
}
</script>

<template>
  <div class="image-gallery">
    <!-- Empty state -->
    <div v-if="images.length === 0" class="gallery-empty">
      <p>No images available</p>
    </div>

    <!-- Image grid -->
    <div v-else class="gallery-grid">
      <div
        v-for="image in images"
        :key="image.id"
        class="gallery-item"
        @click="selectedImage = image"
      >
        <!-- Image with caption -->
        <div class="image-wrapper">
          <img
            :src="image.url"
            :alt="image.alt_text || 'Gallery image'"
            class="gallery-image"
            :style="{ maxWidth: image.display_width || '100%' }"
          />
        </div>

        <!-- Caption underneath image -->
        <div v-if="image.caption" class="image-caption">
          {{ image.caption }}
        </div>

        <!-- Edit/Delete buttons for admin -->
        <div v-if="isAdmin" class="gallery-actions">
          <Button
            size="small"
            variant="secondary"
            @click.stop="$emit('edit', image)"
          >
            Edit
          </Button>
          <Button
            size="small"
            variant="danger"
            @click.stop="$emit('delete', image)"
          >
            Delete
          </Button>
        </div>
      </div>
    </div>

    <!-- Image lightbox/modal -->
    <div v-if="selectedImage" class="image-modal" @click="closeImageModal">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <button class="modal-close" @click="closeImageModal">×</button>
        </div>

        <div class="modal-body">
          <button
            class="modal-nav prev"
            @click="prevImage"
            :disabled="images.indexOf(selectedImage) === 0"
          >
            ← Previous
          </button>

          <div class="modal-image-container">
            <img
              :src="selectedImage.url"
              :alt="selectedImage.alt_text || 'Gallery image'"
              class="modal-image"
            />
          </div>

          <button
            class="modal-nav next"
            @click="nextImage"
            :disabled="images.indexOf(selectedImage) === images.length - 1"
          >
            Next →
          </button>
        </div>

        <div v-if="selectedImage.caption" class="modal-caption">
          {{ selectedImage.caption }}
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.image-gallery {
  width: 100%;
}

.gallery-empty {
  padding: 2rem;
  text-align: center;
  color: #666;
  background: #f5f5f5;
  border-radius: 8px;
}

.gallery-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 1.5rem;
  padding: 1rem 0;
}

.gallery-item {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
  border-radius: 8px;
  overflow: hidden;
  background: white;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.gallery-item:hover {
  transform: translateY(-4px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.image-wrapper {
  overflow: hidden;
  background: #f0f0f0;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 200px;
}

.gallery-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s;
}

.gallery-item:hover .gallery-image {
  transform: scale(1.05);
}

.image-caption {
  padding: 0.75rem;
  font-size: 0.875rem;
  color: #555;
  background: white;
  border-bottom: 1px solid #eee;
}

.gallery-actions {
  display: flex;
  gap: 0.5rem;
  padding: 0.5rem;
  background: #f9f9f9;
}

/* Lightbox Modal */
.image-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  position: relative;
  background: white;
  border-radius: 8px;
  max-width: 90%;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.modal-header {
  display: flex;
  justify-content: flex-end;
  padding: 1rem;
  border-bottom: 1px solid #eee;
}

.modal-close {
  background: none;
  border: none;
  font-size: 2rem;
  color: #666;
  cursor: pointer;
  padding: 0;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.modal-close:hover {
  color: #000;
}

.modal-body {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 2rem;
  padding: 2rem;
  overflow: auto;
}

.modal-image-container {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
}

.modal-image {
  max-width: 100%;
  max-height: 500px;
  object-fit: contain;
}

.modal-nav {
  background: #f0f0f0;
  border: 1px solid #ddd;
  padding: 0.75rem 1.5rem;
  border-radius: 4px;
  cursor: pointer;
  transition: background 0.2s;
}

.modal-nav:hover:not(:disabled) {
  background: #e0e0e0;
}

.modal-nav:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.modal-caption {
  padding: 1rem;
  text-align: center;
  color: #555;
  border-top: 1px solid #eee;
  font-size: 0.95rem;
}

/* Responsive */
@media (max-width: 768px) {
  .gallery-grid {
    grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
    gap: 1rem;
  }

  .modal-body {
    gap: 1rem;
    padding: 1rem;
    flex-direction: column;
  }

  .modal-nav {
    width: 100%;
  }

  .modal-image {
    max-height: 300px;
  }
}
</style>
