<script setup>
import { ref, computed, onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import api from '@/services/api'
import PageHeader from '@/components/PageHeader.vue'
import AlertMessage from '@/components/AlertMessage.vue'
import LoadingSpinner from '@/components/LoadingSpinner.vue'
import FormInput from '@/components/FormInput.vue'
import FormSelect from '@/components/FormSelect.vue'
import FormTextarea from '@/components/FormTextarea.vue'
import Button from '@/components/Button.vue'
import ImageGallery from '@/components/ImageGallery.vue'
import ImageUploader from '@/components/ImageUploader.vue'

const authStore = useAuthStore()

// State
const articles = ref([])
const selectedArticle = ref(null)
const images = ref([])
const isCreating = ref(false)
const loading = ref(false)
const saving = ref(false)
const error = ref('')
const success = ref('')
const categories = ref([])

// Form data
const formData = ref({
  title: '',
  category: '',
  content: '',
})

/**
 * Load all articles
 */
async function loadArticles() {
  loading.value = true
  error.value = ''
  try {
    const response = await api.get('/general-articles')
    articles.value = response.data.articles || []
  } catch (err) {
    error.value = 'Failed to load articles'
    console.error(err)
  } finally {
    loading.value = false
  }
}

/**
 * Load all categories
 */
async function loadCategories() {
  try {
    const response = await api.get('/general-articles/categories')
    categories.value = response.data.categories || []
  } catch (err) {
    console.error('Failed to load categories:', err)
  }
}

/**
 * Start creating new article
 */
function startCreating() {
  isCreating.value = true
  selectedArticle.value = null
  formData.value = {
    title: '',
    category: '',
    content: '',
  }
  error.value = ''
  success.value = ''
}

/**
 * Select article for editing
 */
async function selectArticle(article) {
  selectedArticle.value = article
  isCreating.value = false
  formData.value = {
    title: article.title,
    category: article.category || '',
    content: article.content,
  }
  error.value = ''
  success.value = ''

  // Load article images
  try {
    const response = await api.get(`/images/article/${article.id}`)
    images.value = response.data.images || []
  } catch (err) {
    console.error('Failed to load images:', err)
    images.value = []
  }
}

/**
 * Close editor and return to list
 */
function closeEditor() {
  selectedArticle.value = null
  isCreating.value = false
  formData.value = { title: '', category: '', content: '' }
  images.value = []
  error.value = ''
  success.value = ''
}

/**
 * Save article (create or update)
 */
async function saveArticle() {
  if (!formData.value.title.trim()) {
    error.value = 'Title is required'
    return
  }
  if (!formData.value.content.trim()) {
    error.value = 'Content is required'
    return
  }

  saving.value = true
  error.value = ''
  success.value = ''

  try {
    if (isCreating.value) {
      await api.post('/general-articles', {
        title: formData.value.title,
        category: formData.value.category || null,
        content: formData.value.content,
      })
      success.value = 'Article created successfully!'
    } else {
      await api.put(`/general-articles/${selectedArticle.value.id}`, {
        title: formData.value.title,
        category: formData.value.category || null,
        content: formData.value.content,
      })
      success.value = 'Article updated successfully!'
    }

    await loadArticles()
    setTimeout(() => closeEditor(), 1500)
  } catch (err) {
    error.value = err.response?.data?.error || 'Failed to save article'
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
    await api.delete(`/general-articles/${selectedArticle.value.id}`)
    success.value = 'Article deleted successfully!'
    await loadArticles()
    closeEditor()
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
    month: 'short',
    day: 'numeric',
  })
}

/**
 * Truncate text for preview
 */
function truncateText(text, length = 150) {
  if (text.length <= length) return text
  return text.substring(0, length) + '...'
}

/**
 * Handle image upload success
 */
async function handleImageUpload() {
  success.value = 'Image uploaded successfully!'
  await refreshArticleImages()
}

/**
 * Refresh article images
 */
async function refreshArticleImages() {
  try {
    const response = await api.get(`/images/article/${selectedArticle.value.id}`)
    images.value = response.data.images || []
  } catch (err) {
    console.error('Failed to refresh images:', err)
  }
}

/**
 * Handle image delete
 */
async function handleImageDelete(imageId) {
  try {
    await api.delete(`/images/${imageId}`)
    images.value = images.value.filter(img => img.id !== imageId)
    success.value = 'Image deleted successfully!'
  } catch (err) {
    error.value = 'Failed to delete image'
  }
}

/**
 * Handle image edit
 */
function handleImageEdit(imageId) {
  // TODO: Implement image editing modal
  console.log('Edit image:', imageId)
}

/**
 * Load data on mount
 */
onMounted(async () => {
  await Promise.all([loadArticles(), loadCategories()])
})
</script>

<template>
  <div class="admin-article-page">
    <PageHeader
      :title="isCreating ? 'Create Article' : selectedArticle ? 'Edit Article' : 'Manage Articles'"
    />

    <!-- Article List (if no article selected) -->
    <div v-if="!selectedArticle && !isCreating" class="article-list-section">
      <div class="section-header">
        <h2>Articles</h2>
        <Button variant="primary" @click="startCreating">
          + New Article
        </Button>
      </div>

      <LoadingSpinner
        v-if="loading"
        message="Loading articles..."
        size="large"
      />
      <AlertMessage
        v-else-if="error"
        type="error"
        :message="error"
        @dismiss="error = ''"
      />
      <div v-else-if="articles.length === 0" class="empty-state">
        <p>No articles yet. Create your first article to get started.</p>
      </div>
      <div v-else class="articles-grid">
        <div
          v-for="article in articles"
          :key="article.id"
          class="article-card"
          @click="selectArticle(article)"
        >
          <div class="article-header">
            <h3 class="article-title">{{ article.title }}</h3>
            <span v-if="article.category" class="article-category">
              {{ article.category }}
            </span>
          </div>
          <p class="article-preview">{{ truncateText(article.content) }}</p>
          <div class="article-meta">
            <span class="article-date">{{ formatDate(article.created_at) }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Editor Section -->
    <div v-if="selectedArticle || isCreating" class="editor-section">
      <div class="editor-header">
        <Button variant="secondary" @click="closeEditor">← Back</Button>
        <div class="editor-title">
          {{ isCreating ? 'New Article' : article.title }}
        </div>
      </div>

      <!-- Form -->
      <div class="editor-form">
        <!-- Title -->
        <FormInput
          id="title"
          label="Title"
          type="text"
          :value="formData.title"
          placeholder="Enter article title"
          required
          @update:value="formData.title = $event"
        />

        <!-- Category -->
        <FormSelect
          id="category"
          label="Category (Optional)"
          :value="formData.category"
          :options="[
            { value: '', label: 'No category' },
            ...categories.map(cat => ({ value: cat, label: cat })),
            { value: '_new', label: '+ Create new category' },
          ]"
          @update:value="
            formData.category = $event === '_new' ? prompt('New category name:') || '' : $event
          "
        />

        <!-- Content -->
        <FormTextarea
          id="content"
          label="Article Content"
          :value="formData.content"
          placeholder="Enter article content here..."
          rows="20"
          @update:value="formData.content = $event"
        />

        <!-- Preview -->
        <div class="preview-section">
          <h3>Preview</h3>
          <div class="preview-content">
            <h2>{{ formData.title }}</h2>
            <div class="preview-text" v-html="formData.content.replace(/\n/g, '<br>')"></div>
          </div>
        </div>

        <!-- Image Gallery Section (if article exists) -->
        <div v-if="!isCreating" class="images-section">
          <h3>Article Images</h3>
          <p class="images-hint">
            Upload images to display in the article gallery. You can add up to 10 images.
          </p>

          <!-- Current Images Gallery -->
          <div v-if="images.length" class="gallery-subsection">
            <h4>Current Images</h4>
            <ImageGallery
              :images="images"
              :isAdmin="true"
              @delete="handleImageDelete"
              @edit="handleImageEdit"
            />
          </div>

          <!-- Image Upload -->
          <div class="upload-subsection">
            <h4>Add Images</h4>
            <ImageUploader
              :articleId="selectedArticle.id"
              :maxImages="10"
              @upload-success="handleImageUpload"
              @upload-error="(err) => error = err"
            />
          </div>
        </div>

        <!-- Action Buttons -->
        <div class="form-actions">
          <Button
            variant="primary"
            :loading="saving"
            @click="saveArticle"
          >
            {{ saving ? 'Saving...' : (isCreating ? 'Create Article' : 'Update Article') }}
          </Button>
          <Button
            v-if="!isCreating"
            variant="danger"
            @click="deleteArticle"
          >
            Delete Article
          </Button>
          <Button variant="secondary" @click="closeEditor">Cancel</Button>
        </div>

        <!-- Status Messages -->
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
      </div>
    </div>
  </div>
</template>

<style scoped src="@/styles/pages/AdminArticlePage.css"></style>
