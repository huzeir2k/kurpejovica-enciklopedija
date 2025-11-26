<script setup>
import { ref, computed, onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useLanguageStore } from '@/stores/language'
import api from '@/services/api'
import { articleService } from '@/services/articleService'
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
const languageStore = useLanguageStore()

// State
const articles = ref([])
const familyMembers = ref([])
const translations = ref([])
const images = ref([])
const selectedArticle = ref(null)
const isNewArticle = ref(false)
const loading = ref(false)
const saving = ref(false)
const error = ref('')
const success = ref('')
const selectedTemplate = ref('basic')
const fileInput = ref(null)

// Form data
const formData = ref({
  family_member_id: '',
  language: 'sr',
  content: '',
})

const languages = {
  sr: 'Serbo-Croatian',
  en: 'English',
  fr: 'French',
  de: 'German',
  sv: 'Swedish',
  it: 'Italian',
  es: 'Spanish',
  sq: 'Albanian',
  tr: 'Turkish',
}

const languageOptions = Object.entries(languages).map(([code, label]) => ({
  value: code,
  label,
}))

/**
 * Load articles
 */
async function loadArticles() {
  loading.value = true
  error.value = ''
  try {
    const response = await api.get('/articles')
    articles.value = response.data || []
  } catch (err) {
    error.value = 'Failed to load articles'
  } finally {
    loading.value = false
  }
}

/**
 * Load family members for selection
 */
async function loadFamilyMembers() {
  try {
    const response = await api.get('/family-members')
    familyMembers.value = response.data.members || []
  } catch (err) {
    console.error('Failed to load family members:', err)
  }
}

/**
 * Select article for editing
 */
async function selectArticle(article) {
  selectedArticle.value = article
  isNewArticle.value = false
  formData.value = {
    family_member_id: article.family_member_id,
    language: article.language,
    content: article.content,
  }

  // Load translations
  try {
    const response = await api.get(`/articles/${article.id}/translations`)
    translations.value = response.data || []
  } catch (err) {
    console.error('Failed to load translations:', err)
  }

  // Load images
  try {
    const response = await api.get(`/images/member/${article.family_member_id}`)
    images.value = response.data.images || []
  } catch (err) {
    console.error('Failed to load images:', err)
  }
}

/**
 * Start creating new article
 */
function startNewArticle() {
  isNewArticle.value = true
  selectedArticle.value = null
  formData.value = {
    family_member_id: '',
    language: 'sr',
    content: getTemplateContent('basic'),
  }
  translations.value = []
  images.value = []
}

/**
 * Close editor and return to list
 */
function closeEditor() {
  selectedArticle.value = null
  isNewArticle.value = false
  formData.value = { family_member_id: '', language: 'sr', content: '' }
  error.value = ''
  success.value = ''
}

/**
 * Get template content
 */
function getTemplateContent(template) {
  const templates = {
    basic: '<section class="wiki-section">\n  <h2>Biography</h2>\n  <p>Write article content here...</p>\n</section>',
    infobox: '<div class="wiki-infobox">\n  <div class="infobox-title">Information</div>\n  <table class="infobox-table">\n    <tr><td class="label">Name:</td><td>Value</td></tr>\n  </table>\n</div>',
    section: '<section class="wiki-section">\n  <h2>Section Title</h2>\n  <p>Content here...</p>\n</section>',
    table: '<table class="wiki-table">\n  <tr><th>Header 1</th><th>Header 2</th></tr>\n  <tr><td>Data 1</td><td>Data 2</td></tr>\n</table>',
  }
  return templates[template] || templates.basic
}

/**
 * Insert template into editor
 */
function insertTemplate(template) {
  formData.value.content += '\n\n' + getTemplateContent(template)
}

/**
 * Save article
 */
async function saveArticle() {
  if (!formData.value.content.trim()) {
    error.value = 'Content cannot be empty'
    return
  }

  saving.value = true
  error.value = ''
  success.value = ''

  try {
    if (isNewArticle.value) {
      if (!formData.value.family_member_id) {
        error.value = 'Please select a family member'
        return
      }
      await api.post('/articles', {
        family_member_id: parseInt(formData.value.family_member_id),
        language: formData.value.language,
        content: formData.value.content,
      })
      success.value = 'Article created successfully!'
      loadArticles()
      isNewArticle.value = false
    } else {
      await api.put(`/articles/${selectedArticle.value.id}`, {
        content: formData.value.content,
      })
      success.value = 'Article updated successfully!'
      loadArticles()
    }

    setTimeout(() => closeEditor(), 2000)
  } catch (err) {
    error.value = err.response?.data?.error || 'Failed to save article'
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
    await api.delete(`/articles/${selectedArticle.value.id}`)
    success.value = 'Article deleted successfully!'
    loadArticles()
    closeEditor()
  } catch (err) {
    error.value = err.response?.data?.error || 'Failed to delete article'
  } finally {
    saving.value = false
  }
}

/**
 * Translate article
 */
async function translateArticle() {
  const targetLang = prompt('Enter target language code (en, fr, de, sv, it, es, sq, tr):')
  if (!targetLang) return

  try {
    await api.post(`/articles/${selectedArticle.value.id}/translate`, {
      targetLanguage: targetLang,
    })
    success.value = `Article translated to ${getLanguageName(targetLang)} successfully!`
    const response = await api.get(`/articles/${selectedArticle.value.id}/translations`)
    translations.value = response.data || []
  } catch (err) {
    error.value = err.response?.data?.error || 'Translation failed'
  }
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
 * Helper functions
 */
function getLanguageName(code) {
  return languages[code] || code
}

function formatDate(date) {
  return new Date(date).toLocaleDateString()
}

function formatFileSize(bytes) {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i]
}

/**
 * Load data on mount
 */
onMounted(async () => {
  await Promise.all([loadArticles(), loadFamilyMembers()])
})
</script>

<template>
  <div class="article-editor-page">
    <PageHeader
      :title="isNewArticle ? 'Create Article' : 'Edit Article'"
    />

    <!-- Article List (if no article selected) -->
    <div v-if="!selectedArticle && !isNewArticle" class="article-list-section">
      <div class="section-header">
        <h2>Articles</h2>
        <Button variant="primary" @click="startNewArticle">
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
      <div v-else class="articles-grid">
        <div
          v-for="article in articles"
          :key="article.id"
          class="article-card"
          @click="selectArticle(article)"
        >
          <div class="article-title">{{ article.member_name }}</div>
          <div class="article-language">{{ getLanguageName(article.language) }}</div>
          <div class="article-date">{{ formatDate(article.updated_at) }}</div>
        </div>
      </div>
    </div>

    <!-- Editor Section -->
    <div v-if="selectedArticle || isNewArticle" class="editor-section">
      <div class="editor-header">
        <Button variant="secondary" @click="closeEditor">← Back</Button>
        <div class="editor-title">
          {{ selectedArticle?.member_name || 'New Article' }}
          <span v-if="selectedArticle" class="language-tag">
            {{ getLanguageName(selectedArticle.language) }}
          </span>
        </div>
      </div>

      <!-- Form -->
      <div class="editor-form">
        <!-- Member Selection (for new articles) -->
        <FormSelect
          v-if="isNewArticle"
          id="member"
          label="Select Family Member"
          :value="formData.family_member_id"
          :options="familyMembers.map(m => ({ value: m.id, label: `${m.name} (${m.birth_year})` }))"
          required
          @update:value="formData.family_member_id = $event"
        />

        <!-- Language Selection (for new articles) -->
        <FormSelect
          v-if="isNewArticle"
          id="language"
          label="Language"
          :value="formData.language"
          :options="languageOptions"
          required
          @update:value="formData.language = $event"
        />

        <!-- Template Selection -->
        <FormSelect
          v-if="isNewArticle"
          id="template"
          label="Template"
          :value="selectedTemplate"
          :options="[
            { value: 'basic', label: 'Basic (Section + Paragraph)' },
            { value: 'infobox', label: 'With Infobox' },
            { value: 'fullFeatured', label: 'Full Featured (Wikipedia-style)' },
          ]"
          @update:value="selectedTemplate = $event"
        />

        <!-- Content Editor -->
        <FormTextarea
          id="content"
          label="Article Content (HTML)"
          :value="formData.content"
          placeholder="Enter article content in HTML..."
          rows="20"
          @update:value="formData.content = $event"
        />

        <!-- Toolbar -->
        <div class="editor-toolbar">
          <Button variant="secondary" size="small" @click="insertTemplate('infobox')">
            Insert Infobox
          </Button>
          <Button variant="secondary" size="small" @click="insertTemplate('section')">
            Insert Section
          </Button>
          <Button variant="secondary" size="small" @click="insertTemplate('table')">
            Insert Table
          </Button>
        </div>

        <!-- Preview -->
        <div class="preview-section">
          <h3>Preview</h3>
          <div class="preview-content" v-html="formData.content"></div>
        </div>

        <!-- Action Buttons -->
        <div class="form-actions">
          <Button
            variant="primary"
            :loading="saving"
            @click="saveArticle"
          >
            {{ saving ? 'Saving...' : 'Save Article' }}
          </Button>
          <Button
            v-if="!isNewArticle"
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

      <!-- Translations Section -->
      <div v-if="!isNewArticle" class="translations-section">
        <h3>Translations</h3>
        <div class="translations-list">
          <div
            v-for="translation in translations"
            :key="translation.id"
            class="translation-item"
          >
            <span class="translation-lang">{{ getLanguageName(translation.language) }}</span>
            <span class="translation-status">
              {{ translation.is_auto_translated ? 'Auto-translated' : 'Manual' }}
            </span>
          </div>
        </div>
        <Button variant="secondary" @click="translateArticle">
          Auto-translate to Other Languages
        </Button>
      </div>

      <!-- Images Section -->
      <div v-if="!isNewArticle" class="images-section">
        <h3>Article Images</h3>
        <p class="images-hint">
          Upload images to display in the article gallery. You can add up to 10 images.
        </p>
        
        <!-- Image Gallery -->
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
    </div>
  </div>
</template>

<style scoped src="@/styles/pages/ArticleEditorPage.css"></style>
