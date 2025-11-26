<script setup>
/**
 * SEARCH PAGE COMPONENT
 * 
 * Provides search interface for finding family members by name and keywords
 * Real-time search functionality with results display
 * 
 * Features:
 * - Text input for search query
 * - Form submission with search button
 * - Display of search results as member cards
 * - Result count and no-results handling
 * - Loading indicator during search
 * 
 * Search Flow:
 * 1. User enters search term (name, keyword, etc.)
 * 2. Clicks "Search" button (form submission)
 * 3. handleSearch() fetches results from backend
 * 4. Results displayed as grid of MemberCard components
 * 5. Results count shown at top
 * 6. "No results found" message if empty
 * 
 * Services Used:
 * - familyService.searchFamilyMembers(query)
 * 
 * Components Used:
 * - FormInput: Search input field
 * - Button: Search submit button
 * - LoadingSpinner: Loading indicator
 * - MemberCard: Individual family member card
 * 
 * Styling:
 * - Search box at top with input and button
 * - Results displayed in responsive CSS grid
 * - Result count and status messages
 * 
 * @component SearchPage
 */

import { ref } from 'vue'
import { familyService } from '@/services/familyService'
import FormInput from '@/components/FormInput.vue'
import Button from '@/components/Button.vue'
import LoadingSpinner from '@/components/LoadingSpinner.vue'
import MemberCard from '@/components/MemberCard.vue'

/**
 * REACTIVE STATE
 */

/**
 * query: Search input value
 * 
 * Bound to search FormInput field
 * Sent to backend when search form submitted
 * Trim() used to remove whitespace before search
 * 
 * @type {Ref<string>}
 */
const query = ref('')

/**
 * results: Array of family members matching search query
 * 
 * Structure: Array of member objects with:
 * - id: Unique identifier
 * - name: Member's name
 * - birthYear: Birth year
 * - image: Profile image URL
 * 
 * Empty array [] initially or if no results found
 * Populated from familyService.searchFamilyMembers() response
 */
const results = ref([])

/**
 * loading: Search request in-progress flag
 * 
 * true while API call executing
 * false when complete (success or error)
 * Used to show/hide LoadingSpinner
 */
const loading = ref(false)

/**
 * searched: Whether user has performed a search
 * 
 * false initially (shows "Enter search query" prompt)
 * true after first search attempt
 * Used to distinguish between:
 * - No search yet: show prompt
 * - Search performed but no results: show "No results found"
 */
const searched = ref(false)

/**
 * FUNCTIONS
 */

/**
 * Handle search form submission
 * 
 * Process:
 * 1. Get search query from input field
 * 2. Trim whitespace
 * 3. If empty, clear results and reset searched flag
 * 4. Set loading = true (show spinner)
 * 5. Set searched = true (mark search as performed)
 * 6. Fetch matching members from API
 * 7. Extract members array from response
 * 8. Set loading = false (hide spinner)
 * 9. Handle errors gracefully
 * 
 * Error Handling:
 * - Catches errors and logs them
 * - Sets results to empty array on error
 * - User can retry with different query
 * 
 * @async
 * 
 * @example
 * // User types "kurpejovic" and clicks search
 * // handleSearch() executes
 * // Shows loading spinner
 * // Returns 5 results matching "kurpejovic"
 * // Displays as grid of member cards with result count
 */
async function handleSearch() {
  // Guard: if empty search, clear results and reset
  if (!query.value.trim()) {
    results.value = []
    searched.value = false
    return
  }

  // Show loading indicator during search
  loading.value = true
  // Mark that a search has been performed
  searched.value = true
  
  try {
    // Call search API with query string
    const response = await familyService.searchFamilyMembers(query.value)
    // Extract members array from response
    results.value = response.members || []
  } catch (error) {
    // Log error but don't crash - show empty results
    console.error('Search error:', error)
    results.value = []
  } finally {
    // Always hide loading indicator
    loading.value = false
  }
}
</script>

<template>
  <div class="search-page">
    <!-- Search Box Section -->
    <div class="search-box">
      <h1>Search Family Members</h1>
      <!-- Search Form: @submit.prevent prevents page reload -->
      <form @submit.prevent="handleSearch" class="search-form">
        <!-- Search Input Field -->
        <FormInput
          id="search"
          label=""
          type="text"
          :value="query"
          placeholder="Enter name or keywords..."
          @update:value="query = $event"
        />
        <!-- Search Submit Button -->
        <Button
          type="submit"
          variant="primary"
          size="large"
          :loading="loading"
        >
          Search
        </Button>
      </form>
    </div>

    <!-- Loading Indicator: Shows while search is in progress -->
    <LoadingSpinner
      v-if="loading"
      message="Searching..."
      size="large"
    />

    <!-- Search Results: Shows when results found -->
    <div v-else-if="results.length > 0" class="results">
      <!-- Result Count Display -->
      <div class="results-count">
        Found {{ results.length }} result{{ results.length !== 1 ? 's' : '' }}
      </div>
      <!-- Results Grid: Display results as member cards -->
      <div class="results-grid">
        <MemberCard
          v-for="member in results"
          :key="member.id"
          :member="member"
        />
      </div>
    </div>

    <!-- No Results Message: Shows when search performed but no matches -->
    <div v-else-if="searched" class="no-results">
      No results found for "{{ query }}"
    </div>

    <!-- Initial Prompt: Shows before any search performed -->
    <div v-else class="prompt">
      Enter a search query to find family members.
    </div>
  </div>
</template>

<style scoped src="@/styles/pages/SearchPage.css"></style>
