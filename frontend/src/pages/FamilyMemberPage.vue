<script setup>
import { ref, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import { familyService } from '@/services/familyService'
import { articleService } from '@/services/articleService'
import { useLanguageStore } from '@/stores/language'
import PageHeader from '@/components/PageHeader.vue'
import LoadingSpinner from '@/components/LoadingSpinner.vue'

const route = useRoute()
const languageStore = useLanguageStore()

const familyMember = ref(null)
const article = ref(null)
const relatedMembers = ref([])
const loading = ref(false)

/**
 * Fetch article with current language
 */
async function fetchArticle() {
  if (!familyMember.value) return
  try {
    console.log(`[Translation] Fetching article for member ${route.params.id} in language: ${languageStore.currentLanguage}`)
    const data = await articleService.getArticle(
      route.params.id,
      languageStore.currentLanguage
    )
    console.log('[Translation] Article data received:', data)
    article.value = data
    console.log('[Translation] Article.content:', article.value?.content)
  } catch (error) {
    console.error('[Translation] Error loading article:', error)
    console.error('[Translation] Error response:', error.response?.data)
    article.value = null
  }
}

/**
 * Initial page load
 */
onMounted(async () => {
  loading.value = true
  try {
    familyMember.value = await familyService.getFamilyMember(route.params.id)
    await fetchArticle()
    const tree = await familyService.getFamilyTree(route.params.id)
    relatedMembers.value = tree.relatives || []
  } catch (error) {
    console.error('Error loading family member:', error)
  } finally {
    loading.value = false
  }
})

/**
 * Re-fetch article when language changes
 */
watch(() => languageStore.currentLanguage, () => {
  fetchArticle()
})
</script>

<template>
  <div class="family-member-page">
    <LoadingSpinner
      v-if="loading"
      message="Loading..."
      size="large"
    />

    <template v-else-if="familyMember">
      <PageHeader
        :title="familyMember.name"
        :subtitle="familyMember.birthYear ? `${familyMember.birthYear} - ${familyMember.deathYear || 'Present'}` : ''"
      />

      <div class="content-grid">
        <div class="article-section">
          <div v-if="article" class="article-content">
            <div v-html="article.content"></div>
          </div>
          <div v-else class="no-article">
            No article available in this language yet.
          </div>
        </div>

        <aside class="sidebar">
          <div class="info-box">
            <h3>Family Information</h3>
            <dl v-if="familyMember.parents && familyMember.parents.length">
              <dt>Parents:</dt>
              <dd v-for="parent in familyMember.parents" :key="parent.id">
                <RouterLink :to="`/member/${parent.id}`">
                  {{ parent.name }}
                </RouterLink>
              </dd>
            </dl>
            <dl v-if="familyMember.spouse">
              <dt>Spouse:</dt>
              <dd>
                <RouterLink :to="`/member/${familyMember.spouse.id}`">
                  {{ familyMember.spouse.name }}
                </RouterLink>
              </dd>
            </dl>
            <dl v-if="familyMember.children && familyMember.children.length">
              <dt>Children:</dt>
              <dd v-for="child in familyMember.children" :key="child.id">
                <RouterLink :to="`/member/${child.id}`">
                  {{ child.name }}
                </RouterLink>
              </dd>
            </dl>
          </div>

          <div v-if="relatedMembers.length" class="info-box">
            <h3>Related Members</h3>
            <ul class="related-list">
              <li v-for="member in relatedMembers" :key="member.id">
                <RouterLink :to="`/member/${member.id}`">
                  {{ member.name }}
                </RouterLink>
              </li>
            </ul>
          </div>
        </aside>
      </div>
    </template>

    <div v-else class="not-found">
      Family member not found.
    </div>
  </div>
</template>

<style scoped>
.family-member-page {
  padding: 0;
}

.not-found {
  text-align: center;
  padding: 3rem 1rem;
  color: var(--text-muted);
}

.content-grid {
  display: grid;
  grid-template-columns: 1fr 280px;
  gap: 1.5rem;
}

.article-section {
  background: white;
  padding: 1.5rem;
  border-radius: 3px;
  box-shadow: 0 1px 1px rgba(0, 0, 0, 0.1);
  border: 1px solid #d0d0d0;
}

.article-content :deep(*) {
  max-width: 100%;
}

.article-content :deep(p) {
  line-height: 1.8;
  color: var(--text-color);
  margin: 0.8em 0;
}

.article-content :deep(h2) {
  margin-top: 1em;
  margin-bottom: 0.5em;
  font-size: 1.35em;
}

.article-content :deep(h3) {
  font-size: 1.15em;
  margin-top: 0.8em;
}

.no-article {
  text-align: center;
  padding: 2rem 1rem;
  color: var(--text-muted);
  font-style: italic;
}

.sidebar {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.info-box {
  background: white;
  padding: 1.25rem;
  border-radius: 3px;
  box-shadow: 0 1px 1px rgba(0, 0, 0, 0.1);
  border: 1px solid #d0d0d0;
}

.info-box h3 {
  margin-top: 0;
  margin-bottom: 0.8rem;
  color: var(--text-color);
  font-size: 0.95rem;
  border-bottom: 1px solid var(--border-color);
  padding-bottom: 0.5rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.info-box dl {
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
  font-size: 0.9rem;
}

.info-box dt {
  font-weight: 600;
  color: var(--text-color);
  margin-top: 0.4rem;
}

.info-box dt:first-child {
  margin-top: 0;
}

.info-box dd {
  margin: 0;
  padding-left: 1rem;
  color: var(--text-color);
}

.info-box a {
  color: var(--primary-color);
}

.related-list {
  list-style: none;
  padding: 0;
  margin: 0;
  font-size: 0.9rem;
}

.related-list li {
  padding: 0.4rem 0;
  border-bottom: 1px solid #f0f0f0;
}

.related-list li:last-child {
  border-bottom: none;
}

.related-list a {
  color: var(--primary-color);
}

@media (max-width: 768px) {
  .content-grid {
    grid-template-columns: 1fr;
  }

  .sidebar {
    gap: 0.75rem;
  }
}
</style>
