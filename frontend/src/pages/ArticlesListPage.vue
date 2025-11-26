<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import api from '@/services/api'
import PageHeader from '@/components/PageHeader.vue'
import AlertMessage from '@/components/AlertMessage.vue'
import LoadingSpinner from '@/components/LoadingSpinner.vue'
import FormSelect from '@/components/FormSelect.vue'

const router = useRouter()

// State
const articles = ref([])
const categories = ref([])
const loading = ref(false)
const error = ref('')
const selectedCategory = ref('')
const searchQuery = ref('')

/**
 * Load all articles
 */
async function loadArticles() {
  loading.value = true
  error.value = ''
  try {
    const response = await api.get('/general-articles', {
      params: selectedCategory.value ? { category: selectedCategory.value } : {},
    })
    articles.value = response.data.articles || []
  } catch (err) {
    error.value = 'Failed to load articles'
    console.error(err)
  } finally {
    loading.value = false
  }
}

/**
 * Load categories
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
 * Navigate to article
 */
function viewArticle(articleId) {
  router.push(`/articles/${articleId}`)
}

/**
 * Filter articles by search query
 */
const filteredArticles = computed(() => {
  if (!searchQuery.value) return articles.value
  return articles.value.filter(
    article =>
      article.title.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      article.content.toLowerCase().includes(searchQuery.value.toLowerCase())
  )
})

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
function truncateText(text, length = 200) {
  const cleanText = text.replace(/<[^>]*>/g, '') // Remove HTML tags
  if (cleanText.length <= length) return cleanText
  return cleanText.substring(0, length) + '...'
}

/**
 * Handle category filter change
 */
function onCategoryChange(category) {
  selectedCategory.value = category
  loadArticles()
}

/**
 * Load data on mount
 */
onMounted(async () => {
  await Promise.all([loadArticles(), loadCategories()])
})
</script>

<template>
  <div class="articles-list-page">
    <PageHeader
      title="Articles"
      subtitle="Explore family history and stories"
    />

    <!-- Filters Section -->
    <div class="filters-section">
      <div class="search-box">
        <input
          v-model="searchQuery"
          type="text"
          class="search-input"
          placeholder="Search articles..."
        />
      </div>

      <FormSelect
        v-if="categories.length > 0"
        id="category-filter"
        label="Filter by Category"
        :value="selectedCategory"
        :options="[
          { value: '', label: 'All Categories' },
          ...categories.map(cat => ({ value: cat, label: cat })),
        ]"
        @update:value="onCategoryChange"
      />
    </div>

    <!-- Loading State -->
    <LoadingSpinner
      v-if="loading"
      message="Loading articles..."
      size="large"
    />

    <!-- Error State -->
    <AlertMessage
      v-else-if="error"
      type="error"
      :message="error"
      @dismiss="error = ''"
    />

    <!-- Empty State -->
    <div v-else-if="filteredArticles.length === 0" class="empty-state">
      <p>No articles found.</p>
    </div>

    <!-- Articles Grid -->
    <div v-else class="articles-grid">
      <div
        v-for="article in filteredArticles"
        :key="article.id"
        class="article-card"
        @click="viewArticle(article.id)"
      >
        <div class="article-header">
          <h3 class="article-title">{{ article.title }}</h3>
          <span v-if="article.category" class="article-category">
            {{ article.category }}
          </span>
        </div>
        <p class="article-preview">{{ truncateText(article.content) }}</p>
        <div class="article-footer">
          <span class="article-date">{{ formatDate(article.created_at) }}</span>
          <span class="read-more">Read more →</span>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped src="@/styles/pages/ArticlesListPage.css"></style>
