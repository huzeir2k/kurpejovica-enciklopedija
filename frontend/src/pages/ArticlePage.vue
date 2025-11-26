<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import api from '@/services/api'
import PageHeader from '@/components/PageHeader.vue'
import AlertMessage from '@/components/AlertMessage.vue'
import LoadingSpinner from '@/components/LoadingSpinner.vue'
import Button from '@/components/Button.vue'
import ImageGallery from '@/components/ImageGallery.vue'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()

// State
const article = ref(null)
const images = ref([])
const isEditing = ref(false)
const loading = ref(false)
const saving = ref(false)
const error = ref('')
const success = ref('')

// Form data for editing
const editData = ref({
  title: '',
  category: '',
  content: '',
})

// Check if user is admin
const isAdmin = computed(() => authStore.isAdmin)

/**
 * Load article by ID
 */
async function loadArticle() {
  loading.value = true
  error.value = ''
  try {
    const response = await api.get(`/general-articles/${route.params.id}`)
    article.value = response.data
    editData.value = {
      title: article.value.title,
      category: article.value.category || '',
      content: article.value.content,
    }

    // Load article images
    try {
      const imagesResponse = await api.get(`/images/article/${route.params.id}`)
      images.value = imagesResponse.data.images || []
    } catch (err) {
      console.error('Failed to load article images:', err)
      images.value = []
    }
  } catch (err) {
    error.value = 'Article not found'
    console.error(err)
  } finally {
    loading.value = false
  }
}

/**
 * Start editing
 */
function startEditing() {
  isEditing.value = true
}

/**
 * Cancel editing
 */
function cancelEditing() {
  isEditing.value = false
  editData.value = {
    title: article.value.title,
    category: article.value.category || '',
    content: article.value.content,
  }
  error.value = ''
  success.value = ''
}

/**
 * Save article changes
 */
async function saveArticle() {
  if (!editData.value.title.trim()) {
    error.value = 'Title is required'
    return
  }
  if (!editData.value.content.trim()) {
    error.value = 'Content is required'
    return
  }

  saving.value = true
  error.value = ''
  success.value = ''

  try {
    const response = await api.put(`/general-articles/${article.value.id}`, {
      title: editData.value.title,
      category: editData.value.category || null,
      content: editData.value.content,
    })
    article.value = response.data
    success.value = 'Article updated successfully!'
    isEditing.value = false
    setTimeout(() => (success.value = ''), 3000)
  } catch (err) {
    error.value = err.response?.data?.error || 'Failed to update article'
    console.error(err)
  } finally {
    saving.value = false
  }
}

/**
 * Delete article
 */
async function deleteArticle() {
  if (!confirm('Are you sure you want to delete this article?')) return

  saving.value = true
  error.value = ''

  try {
    await api.delete(`/general-articles/${article.value.id}`)
    success.value = 'Article deleted successfully!'
    setTimeout(() => router.push('/articles'), 1500)
  } catch (err) {
    error.value = err.response?.data?.error || 'Failed to delete article'
    console.error(err)
  } finally {
    saving.value = false
  }
}

/**
 * Format date helper
 */
function formatDate(dateString) {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

/**
 * Load article on mount
 */
onMounted(() => {
  loadArticle()
})
</script>

<template>
  <div class="article-page">
    <PageHeader :title="article?.title || 'Article'" />

    <LoadingSpinner
      v-if="loading"
      message="Loading article..."
      size="large"
    />

    <AlertMessage
      v-if="error"
      type="error"
      :message="error"
      @dismiss="error = ''"
    />

    <!-- View Mode -->
    <div v-if="article && !isEditing" class="article-view">
      <div class="article-header">
        <h1 class="article-title">{{ article.title }}</h1>
        <div class="article-meta">
          <span v-if="article.category" class="article-category">
            {{ article.category }}
          </span>
          <span class="article-date">{{ formatDate(article.created_at) }}</span>
        </div>
      </div>

      <!-- Admin Controls -->
      <div v-if="isAdmin" class="admin-controls">
        <Button variant="secondary" @click="startEditing">
          ✎ Edit Article
        </Button>
        <Button variant="danger" @click="deleteArticle">
          🗑 Delete Article
        </Button>
      </div>

      <!-- Article Content -->
      <div class="article-content" v-html="article.content.replace(/\n/g, '<br>')"></div>

      <!-- Image Gallery -->
      <div v-if="images.length" class="gallery-section">
        <h2>Gallery</h2>
        <ImageGallery
          :images="images"
          :isAdmin="false"
        />
      </div>
    </div>

    <!-- Edit Mode -->
    <div v-if="article && isEditing" class="article-edit">
      <div class="edit-form">
        <!-- Title -->
        <div class="form-group">
          <label for="title" class="form-label">Title</label>
          <input
            id="title"
            v-model="editData.title"
            type="text"
            class="form-input"
            placeholder="Enter article title"
          />
        </div>

        <!-- Category -->
        <div class="form-group">
          <label for="category" class="form-label">Category (Optional)</label>
          <input
            id="category"
            v-model="editData.category"
            type="text"
            class="form-input"
            placeholder="Enter category or leave blank"
          />
        </div>

        <!-- Content -->
        <div class="form-group">
          <label for="content" class="form-label">Content</label>
          <textarea
            id="content"
            v-model="editData.content"
            class="form-textarea"
            rows="20"
            placeholder="Enter article content..."
          ></textarea>
        </div>

        <!-- Error/Success Messages -->
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

        <!-- Action Buttons -->
        <div class="form-actions">
          <Button
            variant="primary"
            :loading="saving"
            @click="saveArticle"
          >
            {{ saving ? 'Saving...' : 'Save Changes' }}
          </Button>
          <Button variant="secondary" @click="cancelEditing">
            Cancel
          </Button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped src="@/styles/pages/ArticlePage.css"></style>
