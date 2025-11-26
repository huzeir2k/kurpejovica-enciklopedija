<script setup>
/**
 * HOME PAGE COMPONENT
 * 
 * Landing page that displays featured family members and articles
 * Provides an inviting introduction to the Kurpejović family encyclopedia
 * 
 * Features:
 * - Hero section with title and subtitle
 * - Featured family members section (6 random members)
 * - Featured articles section (3 random articles)
 * - Links to search/browse all content
 * - Language selector in header
 * 
 * Data Loading:
 * - Fetches all family members and articles on mount
 * - Selects random items for featured display
 * - Shows loading spinner while fetching
 * 
 * Components Used:
 * - PageHeader: Title and subtitle display
 * - LoadingSpinner: Loading state indicator
 * - MemberCard: Individual family member card
 * - Button: Reusable button component
 * 
 * Services Used:
 * - familyService: Fetch all family members
 * - generalArticleService: Fetch all articles
 * 
 * Styling:
 * - CSS grid layout for responsive family members
 * - CSS grid layout for articles
 * - Responsive design for mobile/tablet/desktop
 * 
 * @component HomePage
 */

import { ref, onMounted } from 'vue'
import { familyService } from '@/services/familyService'
import { generalArticleService } from '@/services/generalArticleService'
import PageHeader from '@/components/PageHeader.vue'
import LoadingSpinner from '@/components/LoadingSpinner.vue'
import MemberCard from '@/components/MemberCard.vue'
import Button from '@/components/Button.vue'

/**
 * REACTIVE STATE
 */

/**
 * familyMembers: Array of 6 random family members for featured display
 * 
 * Structure: Array of member objects with:
 * - id: Unique identifier
 * - firstName: Member's first name
 * - lastName: Member's last name
 * - birthDate: Birth date string
 * - deathDate: Death date or null
 * - image: Profile image URL
 * - bio: Short biography excerpt
 * 
 * Populated on mount via familyService.getAllFamilyMembers()
 */
const familyMembers = ref([])

/**
 * articles: Array of 3 random articles for featured display
 * 
 * Structure: Array of article objects with:
 * - id: Unique identifier
 * - title: Article title
 * - content: Full article content (text)
 * - category: Article category (e.g., "History", "Culture")
 * - createdAt: Creation date
 * 
 * Populated on mount via generalArticleService.getArticles()
 */
const articles = ref([])

/**
 * loading: Loading state flag during data fetch
 * 
 * true while API calls are in progress
 * false when data is loaded or error occurs
 * Used to show/hide LoadingSpinner component
 */
const loading = ref(false)

/**
 * UTILITY FUNCTIONS
 */

/**
 * Get random items from array
 * 
 * Shuffles array using Fisher-Yates algorithm (via Math.random)
 * Returns first N items from shuffled array
 * 
 * Creates new array (non-destructive)
 * Suitable for featured/spotlight displays
 * 
 * @param {Array} arr - Input array to shuffle
 * @param {number} count - Number of random items to return
 * @returns {Array} Array of randomly selected items
 * 
 * @example
 * const members = [m1, m2, m3, m4, m5]
 * const featured = getRandomItems(members, 3)
 * // Returns 3 random members from array
 * 
 * @example
 * const featured = getRandomItems(familyMembers.value, 6)
 * // Returns exactly 6 random members
 */
function getRandomItems(arr, count) {
  // Create copy to avoid modifying original array
  const shuffled = [...arr].sort(() => Math.random() - 0.5)
  // Return first N items after shuffle
  return shuffled.slice(0, count)
}

/**
 * LIFECYCLE HOOKS
 */

/**
 * On Component Mount
 * 
 * Executes when component is first rendered
 * Fetches data from API in parallel
 * Shows loading spinner during fetch
 * Handles errors gracefully
 * 
 * Process:
 * 1. Set loading.value = true (show spinner)
 * 2. Fetch family members and articles in parallel with Promise.all()
 * 3. Extract data from responses
 * 4. Select random items:
 *    - 6 random family members for featured display
 *    - 3 random articles for featured display
 * 5. Set loading.value = false (hide spinner)
 * 6. Handle any errors with try/catch
 * 
 * Error Handling:
 * - Catches and logs errors without crashing
 * - Still hides loading spinner on error
 * - Page shows empty sections gracefully
 * 
 * @async
 * 
 * @example
 * // Component mounts and automatically loads data
 * // User sees loading spinner while fetching
 * // After ~500ms, sees 6 family members + 3 articles
 */
onMounted(async () => {
  loading.value = true
  try {
    // Fetch all data in parallel for better performance
    const [membersResponse, articlesResponse] = await Promise.all([
      familyService.getAllFamilyMembers(),
      generalArticleService.getArticles(),
    ])

    // Extract data from responses
    familyMembers.value = getRandomItems(membersResponse.members || [], 6)
    articles.value = getRandomItems(articlesResponse.articles || [], 3)
  } catch (error) {
    // Log error but don't crash - page shows empty sections
    console.error('Error loading home page data:', error)
  } finally {
    // Always hide loading spinner, even on error
    loading.value = false
  }
})

/**
 * Truncate text for preview display
 * 
 * Limits text length to specified characters
 * Adds "..." ellipsis for truncated text
 * Used for article previews to keep layout consistent
 * 
 * @param {string} text - Text to truncate
 * @param {number} [length=150] - Maximum text length (default 150 chars)
 * @returns {string} Truncated text or original if shorter than limit
 * 
 * @example
 * truncateText("This is a very long article content...", 20)
 * // Returns: "This is a very long..."
 * 
 * @example
 * truncateText("Short", 20)
 * // Returns: "Short" (no truncation)
 * 
 * @example
 * truncateText(article.content)
 * // Returns article content truncated to 150 chars
 */
function truncateText(text, length = 150) {
  if (text.length <= length) return text
  return text.substring(0, length) + '...'
}
</script>

<template>
  <div class="home-page">
    <!-- Page Title and Subtitle Section -->
    <PageHeader
      title="Welcome to Kurpejovica Enciklopedija"
      subtitle="A comprehensive family encyclopedia, available in multiple languages."
    />

    <!-- Loading Indicator - Shows while fetching data -->
    <LoadingSpinner
      v-if="loading"
      message="Loading..."
      size="large"
    />

    <!-- Main Content - Shows after loading -->
    <template v-else>
      <!-- Featured Family Members Section
           - Displays 6 random family members
           - Each shown as a card with image and basic info
           - "View All Members" link to search page
      -->
      <section class="featured-section">
        <h2>Featured Family Members</h2>
        <div class="members-grid">
          <MemberCard
            v-for="member in familyMembers"
            :key="member.id"
            :member="member"
          />
        </div>
        <div class="see-all">
          <RouterLink to="/search">
            <Button variant="primary" size="large">
              View All Members
            </Button>
          </RouterLink>
        </div>
      </section>

      <!-- Featured Articles Section
           - Shows only if articles exist (v-if guards against empty list)
           - Displays 3 random articles
           - Articles clickable to view full content
           - Shows title, category, and preview text
           - "View All Articles" link to articles listing page
      -->
      <section v-if="articles.length > 0" class="featured-section">
        <h2>Featured Articles</h2>
        <div class="articles-grid">
          <!-- Article Card: Click to navigate to article detail page -->
          <div
            v-for="article in articles"
            :key="article.id"
            class="article-card"
            @click="$router.push(`/articles/${article.id}`)"
          >
            <!-- Article Header: Title and Category -->
            <div class="article-header">
              <h3 class="article-title">{{ article.title }}</h3>
              <!-- Category Badge: Only shows if category exists -->
              <span v-if="article.category" class="article-category">
                {{ article.category }}
              </span>
            </div>
            <!-- Article Preview: Truncated content (150 chars) -->
            <p class="article-preview">{{ truncateText(article.content) }}</p>
            <!-- Article Footer: "Read more" CTA -->
            <div class="article-footer">
              <span class="read-more">Read more →</span>
            </div>
          </div>
        </div>
        <!-- Link to all articles page -->
        <div class="see-all">
          <RouterLink to="/articles">
            <Button variant="primary" size="large">
              View All Articles
            </Button>
          </RouterLink>
        </div>
      </section>
    </template>
  </div>
</template>

<style scoped src="@/styles/pages/HomePage.css"></style>
