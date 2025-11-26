<script setup>
/**
 * FAMILY MEMBER PAGE COMPONENT
 * 
 * Displays detailed profile of a single family member
 * Implements Wikipedia-style layout with main content + sidebar
 * Supports multi-language content with dynamic loading
 * 
 * Layout:
 * - Header: Name and life span (birth-death years)
 * - Main Content: Summary, Biography, See Also sections
 * - Sidebar: Information box with family relationships (sticky)
 * 
 * Features:
 * - Loads member details from API (name, dates, bio, occupation)
 * - Fetches article/biography in currently selected language
 * - Displays family tree relationships as links
 * - Switches language dynamically without page reload
 * - Shows loading spinner during data fetch
 * - Handles missing data gracefully (e.g., no biography available)
 * 
 * Data Loading:
 * - Initial load on mount: fetches member data + article + family tree
 * - Language change: re-fetches article in new language
 * - API transformations: converts backend snake_case to camelCase
 * - Relationship filtering: groups relationships by type (parent, spouse, etc.)
 * 
 * Services Used:
 * - familyService: Get member details, family tree, relationships
 * - articleService: Get member biography in selected language
 * 
 * Stores Used:
 * - languageStore: Current language selection, watch for changes
 * 
 * Components Used:
 * - PageHeader: Title and subtitle display
 * - LoadingSpinner: Loading indicator during data fetch
 * - RouterLink: Navigation to related members
 * 
 * Styling:
 * - CSS grid for 2-column layout (main content + sticky sidebar)
 * - Responsive design for mobile (sidebar below main)
 * - Sticky positioning for sidebar info box
 * - Semantic HTML for content structure
 * 
 * @component FamilyMemberPage
 * @example
 * // Accessed via /member/:id route
 * // Example: /member/42 or /member/kurpejovic-milos
 * // Component loads automatically based on route params.id
 */

import { ref, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import { familyService } from '@/services/familyService'
import { articleService } from '@/services/articleService'
import { useLanguageStore } from '@/stores/language'
import PageHeader from '@/components/PageHeader.vue'
import LoadingSpinner from '@/components/LoadingSpinner.vue'
import ImageGallery from '@/components/ImageGallery.vue'

/**
 * ROUTER AND STORES
 */

/**
 * route: Vue Router route object
 * 
 * Contains current route information:
 * - route.params.id: Family member ID from URL
 *   Used to fetch specific member data
 *   Example: /member/42 -> params.id = "42"
 * 
 * Automatically updated when URL changes
 */
const route = useRoute()

/**
 * languageStore: Language state management store
 * 
 * Provides:
 * - currentLanguage: Currently selected language code
 * - isAutoDetected: Whether language was auto-detected
 * 
 * Watched to detect language changes
 * When changed, re-fetches article in new language
 */
const languageStore = useLanguageStore()

/**
 * REACTIVE STATE
 */

/**
 * familyMember: Family member details and relationships
 * 
 * Structure:
 * {
 *   id: number,
 *   name: string,
 *   birthYear: number,
 *   deathYear: number|null,
 *   birthPlace: string,
 *   occupation: string,
 *   shortBio: string,
 *   relationships: Array (all relationships),
 *   parents: Array (filtered parent relationships),
 *   spouse: Object|null (spouse relationship),
 *   children: Array (filtered child relationships),
 *   siblings: Array (filtered sibling relationships)
 * }
 * 
 * null while loading, populated after API response
 * 
 * Data transformation:
 * - Backend returns snake_case (birth_year, short_bio)
 * - Transformed to camelCase for template (birthYear, shortBio)
 * - Relationships filtered and organized by type
 */
const familyMember = ref(null)

/**
 * article: Family member biography/article in current language
 * 
 * Structure:
 * {
 *   id: number,
 *   familyMemberId: number,
 *   language: string,
 *   title: string,
 *   content: string (HTML rich text),
 *   createdAt: string (ISO date),
 *   updatedAt: string (ISO date)
 * }
 * 
 * null if no biography available in current language
 * Dynamically re-fetched when language changes
 * Content may contain HTML markup (displayed with v-html)
 */
const article = ref(null)

/**
 * relatedMembers: Family tree relatives of current member
 * 
 * Array of member objects similar to familyMember
 * Populated from familyService.getFamilyTree()
 * Displayed in "See Also" section as clickable links
 * Used for navigation between related family members
 */
const relatedMembers = ref([])

/**
 * images: Gallery of images for the family member
 * 
 * Array of image objects with:
 * - id: Unique identifier
 * - url: Image URL path
 * - caption: Caption text displayed underneath
 * - alt_text: Accessibility alt text
 * - display_width: CSS width for display
 * 
 * Fetched from API and displayed in ImageGallery component
 * Limited to 10 images per member
 */
const images = ref([])

/**
 * loading: Initial page load state
 * 
 * true while fetching member data, article, and family tree
 * false when all data loaded or error occurs
 * Used to show/hide LoadingSpinner component
 * 
 * Note: Language change re-fetches article without showing loading spinner
 */
const loading = ref(false)

/**
 * FUNCTIONS
 */

/**
 * Fetch article/biography in currently selected language
 * 
 * Called:
 * - On component mount (via onMounted hook)
 * - When language changes (via watch on languageStore.currentLanguage)
 * 
 * Process:
 * 1. Check if familyMember data exists (skip if not)
 * 2. Fetch article using:
 *    - familyMember ID (from API response)
 *    - Current language code from language store
 * 3. Updates article ref with biography content
 * 4. Sets article.value to null if not found (no error thrown)
 * 
 * Error Handling:
 * - Catches errors without crashing page
 * - Logs error details for debugging
 * - Gracefully shows "No biography available" message
 * 
 * Performance:
 * - Uses current language from store (no param needed)
 * - Axios interceptor auto-injects JWT token if needed
 * - Backend handles language fallback (e.g., falls back to Serbian)
 * 
 * @async
 * @private
 * 
 * @example
 * // Called automatically when language changes
 * // User selects 'de' in language selector
 * // watch() hook detects change and calls fetchArticle()
 * // Article now displays in German
 */
async function fetchArticle() {
  // Guard: skip if member data not yet loaded
  if (!familyMember.value) return
  
  try {
    // Fetch article for current member in current language
    const data = await articleService.getArticle(
      route.params.id,
      languageStore.currentLanguage
    )
    // Update article ref with fetched data
    article.value = data
  } catch (error) {
    // Article not found in selected language
    // Show "No biography available" message
    console.error('Error loading article:', error)
    article.value = null
  }
}

/**
 * LIFECYCLE HOOKS
 */

/**
 * On Component Mount
 * 
 * Executes when component is first rendered
 * Fetches all data needed to display member profile:
 * 1. Member details (name, dates, bio, occupation)
 * 2. Member biography in current language
 * 3. Family tree (related members)
 * 
 * Process:
 * 1. Set loading = true (show spinner)
 * 2. Fetch family member details by ID from route params
 * 3. Transform backend snake_case to template camelCase
 * 4. Filter relationships by type (parents, spouse, children, siblings)
 * 5. Fetch article/biography in current language
 * 6. Fetch family tree to populate "See Also" section
 * 7. Set loading = false
 * 8. Handle errors gracefully without crashing
 * 
 * Error Handling:
 * - Catches errors and logs them
 * - Page displays partial data (e.g., member without biography)
 * - Shows "Family member not found" if initial fetch fails
 * 
 * @async
 * 
 * @example
 * // User navigates to /member/42
 * // Component mounts and automatically loads:
 * // - Member details with loading spinner visible
 * // - Article in current language
 * // - Family tree relatives
 * // Spinner hides when all data loaded
 */
onMounted(async () => {
  loading.value = true
  try {
    // Fetch member details from API
    const memberData = await familyService.getFamilyMember(route.params.id)
    
    // Transform snake_case API response to camelCase for template
    // Also organize relationships by type for sidebar display
    familyMember.value = {
      id: memberData.id,
      name: memberData.name,
      birthYear: memberData.birth_year,
      deathYear: memberData.death_year,
      birthPlace: memberData.birth_place,
      occupation: memberData.occupation,
      shortBio: memberData.short_bio,
      relationships: memberData.relationships || [],
      // Pre-filter relationships by type for easy access
      parents: memberData.relationships?.filter(r => r.relationship_type === 'parent') || [],
      spouse: memberData.relationships?.find(r => r.relationship_type === 'spouse') || null,
      children: memberData.relationships?.filter(r => r.relationship_type === 'child') || [],
      siblings: memberData.relationships?.filter(r => r.relationship_type === 'sibling') || [],
    }
    
    // Fetch article/biography in current language
    await fetchArticle()
    
    // Fetch family tree to populate "See Also" section
    const tree = await familyService.getFamilyTree(route.params.id)
    relatedMembers.value = tree.relatives || []

    // Fetch images for gallery (limited to 10)
    try {
      const imagesResponse = await fetch(`/api/images/member/${route.params.id}`)
        .then(r => r.json())
      images.value = imagesResponse.images || []
    } catch (err) {
      console.error('Failed to load images:', err)
      images.value = []
    }
  } catch (error) {
    // Log error but don't crash - page shows gracefully
    console.error('Error loading family member:', error)
  } finally {
    // Always hide spinner when done (success or error)
    loading.value = false
  }
})

/**
 * Watch for Language Changes
 * 
 * Monitors languageStore.currentLanguage for changes
 * When user selects different language in language selector:
 * 1. Calls fetchArticle() to load biography in new language
 * 2. Article content updates without page reload
 * 3. Sidebar and other content remain unchanged
 * 
 * Watchers execute after watch dependency changes
 * Vue automatically tracks language store updates
 * 
 * @example
 * // User selects German in language dropdown
 * // languageStore.currentLanguage changes to 'de'
 * // watch() hook detects change
 * // fetchArticle() called
 * // Article displays in German
 * 
 * @see languageStore.setLanguage() - where user changes language
 */
watch(() => languageStore.currentLanguage, () => {
  fetchArticle()
})
</script>

<template>
  <div class="family-member-page">
    <!-- LOADING STATE: Show spinner while fetching data -->
    <LoadingSpinner
      v-if="loading"
      message="Loading..."
      size="large"
    />

    <!-- DATA LOADED: Main content displayed -->
    <template v-else-if="familyMember">
      <!-- Page Header: Name and life span -->
      <PageHeader
        :title="familyMember.name"
        :subtitle="familyMember.birthYear ? (familyMember.deathYear ? `${familyMember.birthYear} - ${familyMember.deathYear}` : `b. ${familyMember.birthYear}`) : ''"
      />

      <!-- Two-Column Layout: Main content + Sticky sidebar -->
      <div class="member-layout">
        <!-- MAIN CONTENT SECTION (Left Column) -->
        <div class="main-content">
          <!-- SUMMARY SECTION
               Shows quick facts about the member
               Displays only if data exists (v-if guards)
          -->
          <section v-if="familyMember.shortBio || familyMember.occupation" class="summary-section">
            <h2>Summary</h2>
            <!-- Occupation field (if available) -->
            <div v-if="familyMember.occupation" class="occupation">
              <strong>Occupation:</strong> {{ familyMember.occupation }}
            </div>
            <!-- Short biography excerpt -->
            <div v-if="familyMember.shortBio" class="bio">
              {{ familyMember.shortBio }}
            </div>
            <!-- Birth place field (if available) -->
            <div v-if="familyMember.birthPlace" class="birth-place">
              <strong>Birth Place:</strong> {{ familyMember.birthPlace }}
            </div>
          </section>

          <!-- BIOGRAPHY SECTION
               Full article/biography in current language
               Re-fetches when language changes (via watch)
               Shows HTML-formatted content (v-html)
          -->
          <section v-if="article" class="biography-section">
            <h2>Biography</h2>
            <!-- Display HTML content (article.content may contain formatting) -->
            <div class="article-content" v-html="article.content"></div>
          </section>

          <!-- IMAGE GALLERY SECTION
               Displays photos and images related to the family member
               Shown only if images exist for this member
               Supports lightbox viewing, admin edit/delete
          -->
          <section v-if="images.length" class="gallery-section">
            <h2>Gallery</h2>
            <ImageGallery 
              :images="images"
              :isAdmin="false"
            />
          </section>

          <!-- SEE ALSO SECTION
               Related family members from family tree
               Displayed as clickable links to related members' profiles
               Shows only if related members exist (v-if guards)
          -->
          <section v-if="relatedMembers.length" class="see-also-section">
            <h2>See Also</h2>
            <ul class="see-also-list">
              <!-- Iterate through related members -->
              <li v-for="member in relatedMembers" :key="member.id">
                <!-- Link to related member's profile page -->
                <RouterLink :to="`/member/${member.id}`">
                  {{ member.name }}
                </RouterLink>
              </li>
            </ul>
          </section>

          <!-- NO BIOGRAPHY MESSAGE
               Shows when article not available in current language
               Encourages user to select different language or contact admin
          -->
          <div v-if="!article" class="no-article">
            <p>No biography available in this language yet.</p>
          </div>
        </div>

        <!-- SIDEBAR SECTION (Right Column - Sticky)
             Information box with family relationships
             Stays visible while scrolling (position: sticky)
        -->
        <aside class="sidebar">
          <!-- INFO BOX: Family relationships and key facts -->
          <div class="info-box">
            <h3>Information</h3>
            
            <!-- LIFE SPAN ROW
                 Shows birth year and death year (or "living" if no death year)
                 Displayed only if birth year exists
            -->
            <div v-if="familyMember.birthYear || familyMember.deathYear" class="info-group">
              <dt>Life Span</dt>
              <dd>
                {{ familyMember.birthYear }}
                <!-- Show death year if exists, otherwise mark as living -->
                <span v-if="familyMember.deathYear">– {{ familyMember.deathYear }}</span>
                <span v-else>(living)</span>
              </dd>
            </div>

            <!-- PARENTS ROW
                 Links to parent members
                 Shows only if member has parents (v-if guards)
                 Multiple parents possible (v-for)
            -->
            <div v-if="familyMember.parents && familyMember.parents.length" class="info-group">
              <dt>Parents</dt>
              <!-- Iterate through parents array -->
              <dd v-for="parent in familyMember.parents" :key="parent.id" class="relation-link">
                <!-- Link to parent's profile page -->
                <RouterLink :to="`/member/${parent.id}`">
                  {{ parent.name }}
                </RouterLink>
              </dd>
            </div>

            <!-- SPOUSE ROW
                 Link to spouse (if married)
                 Shows only if spouse relationship exists
                 spouse is single object (not array) due to find() in script
            -->
            <div v-if="familyMember.spouse" class="info-group">
              <dt>Spouse</dt>
              <dd class="relation-link">
                <!-- Link to spouse's profile page -->
                <RouterLink :to="`/member/${familyMember.spouse.id}`">
                  {{ familyMember.spouse.name }}
                </RouterLink>
              </dd>
            </div>

            <!-- CHILDREN ROW
                 Links to children members
                 Shows only if member has children
                 Multiple children possible (v-for)
            -->
            <div v-if="familyMember.children && familyMember.children.length" class="info-group">
              <dt>Children</dt>
              <!-- Iterate through children array -->
              <dd v-for="child in familyMember.children" :key="child.id" class="relation-link">
                <!-- Link to child's profile page -->
                <RouterLink :to="`/member/${child.id}`">
                  {{ child.name }}
                </RouterLink>
              </dd>
            </div>

            <!-- SIBLINGS ROW
                 Links to sibling members
                 Shows only if member has siblings
                 Multiple siblings possible (v-for)
            -->
            <div v-if="familyMember.siblings && familyMember.siblings.length" class="info-group">
              <dt>Siblings</dt>
              <!-- Iterate through siblings array -->
              <dd v-for="sibling in familyMember.siblings" :key="sibling.id" class="relation-link">
                <!-- Link to sibling's profile page -->
                <RouterLink :to="`/member/${sibling.id}`">
                  {{ sibling.name }}
                </RouterLink>
              </dd>
            </div>
          </div>
        </aside>
      </div>
    </template>

    <!-- ERROR STATE: Member not found -->
    <div v-else class="not-found">
      Family member not found.
    </div>
  </div>
</template>

<style scoped src="@/styles/pages/FamilyMemberPage.css"></style>
