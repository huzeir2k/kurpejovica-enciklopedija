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
 * Upload image
 */
async function uploadImage(event) {
  const file = event.target.files?.[0]
  if (!file) return

  const formDataUpload = new FormData()
  formDataUpload.append('file', file)
  formDataUpload.append('family_member_id', selectedArticle.value.family_member_id)
  formDataUpload.append('description', file.name)

  try {
    const response = await api.post('/images/upload', formDataUpload, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    images.value.push(response.data.image)
    success.value = 'Image uploaded successfully!'
  } catch (err) {
    error.value = 'Failed to upload image'
  }

  if (fileInput.value) fileInput.value.value = ''
}

/**
 * Delete image
 */
async function deleteImage(imageId) {
  if (!confirm('Delete this image?')) return

  try {
    await api.delete(`/images/${imageId}`)
    images.value = images.value.filter(img => img.id !== imageId)
    success.value = 'Image deleted successfully!'
  } catch (err) {
    error.value = 'Failed to delete image'
  }
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
        <h3>Images</h3>
        <div class="image-upload">
          <input
            type="file"
            ref="fileInput"
            accept="image/*"
            @change="uploadImage"
            class="file-input"
          />
          <Button variant="secondary" @click="$refs.fileInput?.click()">
            Upload Image
          </Button>
        </div>
        <div class="images-list">
          <div
            v-for="image in images"
            :key="image.id"
            class="image-item"
          >
            <img :src="image.url" :alt="image.description" />
            <div class="image-info">
              <div class="image-desc">{{ image.description || 'No description' }}</div>
              <div class="image-size">{{ formatFileSize(image.file_size) }}</div>
              <Button
                variant="danger"
                size="small"
                @click="deleteImage(image.id)"
              >
                Delete
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useLanguageStore } from '@/stores/language'
import api from '@/services/api'
import { articleService } from '@/services/articleService'

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
 * Upload image
 */
async function uploadImage(event) {
  const file = event.target.files?.[0]
  if (!file) return

  const formDataUpload = new FormData()
  formDataUpload.append('file', file)
  formDataUpload.append('family_member_id', selectedArticle.value.family_member_id)
  formDataUpload.append('description', file.name)

  try {
    const response = await api.post('/images/upload', formDataUpload, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    images.value.push(response.data.image)
    success.value = 'Image uploaded successfully!'
  } catch (err) {
    error.value = 'Failed to upload image'
  }

  if (fileInput.value) fileInput.value.value = ''
}

/**
 * Delete image
 */
async function deleteImage(imageId) {
  if (!confirm('Delete this image?')) return

  try {
    await api.delete(`/images/${imageId}`)
    images.value = images.value.filter(img => img.id !== imageId)
    success.value = 'Image deleted successfully!'
  } catch (err) {
    error.value = 'Failed to delete image'
  }
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

<style scoped>
.article-editor-page {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem 1rem;
}

.page-header {
  margin-bottom: 2rem;
}

.page-header h1 {
  color: var(--primary-color);
  font-size: 2.5rem;
}

/* Article List */
.article-list-section {
  background: white;
  border-radius: 8px;
  padding: 2rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.section-header h2 {
  color: var(--primary-color);
  font-size: 1.5rem;
  margin: 0;
}

.articles-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 1rem;
}

.article-card {
  border: 1px solid var(--border-color);
  border-radius: 8px;
  padding: 1.5rem;
  cursor: pointer;
  transition: all 0.3s;
}

.article-card:hover {
  border-color: var(--primary-color);
  box-shadow: 0 4px 12px rgba(51, 102, 204, 0.1);
}

.article-title {
  font-weight: 600;
  color: var(--text-color);
  margin-bottom: 0.5rem;
}

.article-language {
  color: var(--primary-color);
  font-size: 0.9rem;
  margin-bottom: 0.5rem;
}

.article-date {
  color: var(--text-muted);
  font-size: 0.85rem;
}

/* Editor Section */
.editor-section {
  background: white;
  border-radius: 8px;
  padding: 2rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.editor-header {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 2rem;
  padding-bottom: 1.5rem;
  border-bottom: 2px solid var(--border-color);
}

.editor-title {
  flex: 1;
  font-size: 1.5rem;
  color: var(--text-color);
}

.language-tag {
  background: var(--primary-light);
  color: var(--primary-color);
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.9rem;
  margin-left: 0.5rem;
}

/* Form Styles */
.editor-form {
  margin-bottom: 2rem;
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 600;
  color: var(--text-color);
}

.form-control {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid var(--border-color);
  border-radius: 4px;
  font-size: 1rem;
  font-family: inherit;
}

.form-control:focus {
  outline: none;
  border-color: var(--primary-color);
  box-shadow: 0 0 0 3px rgba(51, 102, 204, 0.1);
}

.content-editor {
  width: 100%;
  height: 400px;
  padding: 1rem;
  border: 1px solid var(--border-color);
  border-radius: 4px;
  font-family: 'Monaco', 'Courier New', monospace;
  font-size: 0.9rem;
  resize: vertical;
}

/* Editor Toolbar */
.editor-toolbar {
  display: flex;
  gap: 0.5rem;
  margin: 1rem 0 2rem;
  flex-wrap: wrap;
}

.btn-small {
  padding: 0.5rem 1rem;
  font-size: 0.85rem;
}

/* Preview */
.preview-section {
  background: var(--bg-secondary);
  border-radius: 8px;
  padding: 1.5rem;
  margin-bottom: 2rem;
}

.preview-section h3 {
  color: var(--primary-color);
  margin-top: 0;
}

.preview-content {
  background: white;
  padding: 1rem;
  border-radius: 4px;
  border: 1px solid var(--border-color);
}

.preview-content h2 {
  color: var(--primary-color);
  font-size: 1.3rem;
}

.preview-content h3 {
  color: var(--text-color);
  font-size: 1.1rem;
}

.preview-content table {
  width: 100%;
  border-collapse: collapse;
  margin: 1rem 0;
}

.preview-content table th,
.preview-content table td {
  border: 1px solid var(--border-color);
  padding: 0.75rem;
  text-align: left;
}

.preview-content table th {
  background: var(--primary-light);
  color: var(--primary-color);
}

/* Form Actions */
.form-actions {
  display: flex;
  gap: 1rem;
  margin-bottom: 2rem;
  flex-wrap: wrap;
}

.btn {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 4px;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.3s;
  font-weight: 600;
}

.btn-primary {
  background: var(--primary-color);
  color: white;
}

.btn-primary:hover {
  background: var(--primary-dark);
}

.btn-primary:disabled {
  background: var(--text-muted);
  cursor: not-allowed;
}

.btn-secondary {
  background: var(--border-color);
  color: var(--text-color);
}

.btn-secondary:hover {
  background: var(--primary-light);
}

.btn-danger {
  background: #dc3545;
  color: white;
}

.btn-danger:hover {
  background: #c82333;
}

/* Translations Section */
.translations-section {
  background: var(--bg-secondary);
  border-radius: 8px;
  padding: 1.5rem;
  margin-top: 2rem;
}

.translations-section h3 {
  color: var(--primary-color);
  margin-top: 0;
}

.translations-list {
  margin-bottom: 1.5rem;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 1rem;
}

.translation-item {
  background: white;
  padding: 1rem;
  border-radius: 4px;
  border-left: 4px solid var(--primary-color);
}

.translation-lang {
  font-weight: 600;
  color: var(--text-color);
  display: block;
  margin-bottom: 0.5rem;
}

.translation-status {
  font-size: 0.85rem;
  color: var(--text-muted);
}

/* Images Section */
.images-section {
  background: var(--bg-secondary);
  border-radius: 8px;
  padding: 1.5rem;
  margin-top: 2rem;
}

.images-section h3 {
  color: var(--primary-color);
  margin-top: 0;
}

.image-upload {
  margin-bottom: 1.5rem;
}

.file-input {
  display: none;
}

.images-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 1rem;
}

.image-item {
  background: white;
  border-radius: 8px;
  overflow: hidden;
  border: 1px solid var(--border-color);
}

.image-item img {
  width: 100%;
  height: 150px;
  object-fit: cover;
  display: block;
}

.image-info {
  padding: 0.75rem;
}

.image-desc {
  font-weight: 600;
  font-size: 0.85rem;
  color: var(--text-color);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.image-size {
  font-size: 0.75rem;
  color: var(--text-muted);
  margin: 0.25rem 0;
}

/* Alerts */
.error-alert {
  background: #f8d7da;
  border: 1px solid #f5c6cb;
  color: #721c24;
  padding: 1rem;
  border-radius: 4px;
  margin-bottom: 1rem;
}

.success-alert {
  background: #d4edda;
  border: 1px solid #c3e6cb;
  color: #155724;
  padding: 1rem;
  border-radius: 4px;
  margin-bottom: 1rem;
}

.loading {
  padding: 2rem;
  text-align: center;
  color: var(--text-muted);
}

/* Responsive */
@media (max-width: 768px) {
  .articles-grid {
    grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  }

  .editor-header {
    flex-direction: column;
    align-items: flex-start;
  }

  .section-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }

  .content-editor {
    height: 300px;
  }

  .form-actions {
    flex-direction: column;
  }

  .btn {
    width: 100%;
  }
}
</style>
