<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useAuth } from '@/composables/useAuth'
import { useLanguage } from '@/composables/useLanguage'
import familyService from '@/services/familyService'
import PageHeader from '@/components/PageHeader.vue'
import FormInput from '@/components/FormInput.vue'
import FormTextarea from '@/components/FormTextarea.vue'
import Button from '@/components/Button.vue'
import AlertMessage from '@/components/AlertMessage.vue'
import LoadingSpinner from '@/components/LoadingSpinner.vue'
import ImageGallery from '@/components/ImageGallery.vue'
import ImageUploader from '@/components/ImageUploader.vue'

/**
 * COMPOSITION API USAGE
 */

const route = useRoute()
const { canEdit } = useAuth()
const { currentLanguage } = useLanguage()

/**
 * REACTIVE STATE
 */

/**
 * familyMember: Current member data being edited
 * 
 * Object containing:
 * - id: Unique identifier
 * - name: Member's full name
 * - birthYear: Birth year (nullable)
 * - deathYear: Death year (nullable)
 * - birthPlace: Birth location
 * - occupation: Profession/occupation
 * - shortBio: Short biography excerpt
 * 
 * Loaded on component mount from API
 */
const familyMember = ref(null)

/**
 * images: Family member's image gallery
 * 
 * Array of image objects with:
 * - id: Unique identifier
 * - url: Image URL path
 * - caption: Caption text
 * - alt_text: Accessibility text
 * - display_width: CSS width for display
 * 
 * Limited to 10 images per member (enforced backend)
 * Refreshed after image upload/delete
 */
const images = ref([])

/**
 * loading: Initial page load state
 * true while fetching member data
 * false when data loaded or error occurs
 */
const loading = ref(false)

/**
 * editing: Active edit mode
 * true when form is being modified
 * Used to show save/cancel buttons
 */
const editing = ref(false)

/**
 * editForm: Form data for member editing
 * 
 * Contains editable fields:
 * - name: Member's name
 * - birthYear: Birth year
 * - deathYear: Death year
 * - birthPlace: Birth location
 * - occupation: Profession
 * - shortBio: Short biography
 * 
 * Synced with familyMember data when editing starts
 * Posted to API when saved
 */
const editForm = ref({
  name: '',
  birthYear: '',
  deathYear: '',
  birthPlace: '',
  occupation: '',
  shortBio: ''
})

/**
 * alertMessage: Alert message display state
 * 
 * Object with:
 * - type: 'success', 'error', 'info'
 * - message: Message text
 * - visible: Show/hide alert
 * 
 * Auto-hides after 5 seconds
 */
const alertMessage = ref({
  type: 'info',
  message: '',
  visible: false
})

/**
 * FUNCTIONS
 */

/**
 * Show temporary alert message
 * Automatically hides after 5 seconds
 * 
 * @param {string} type - 'success', 'error', or 'info'
 * @param {string} message - Alert text to display
 */
function showAlert(type, message) {
  alertMessage.value = { type, message, visible: true }
  setTimeout(() => {
    alertMessage.value.visible = false
  }, 5000)
}

/**
 * Start editing member details
 * Populates editForm with current member data
 * Shows form inputs for editing
 */
function startEdit() {
  editForm.value = {
    name: familyMember.value.name,
    birthYear: familyMember.value.birthYear || '',
    deathYear: familyMember.value.deathYear || '',
    birthPlace: familyMember.value.birthPlace || '',
    occupation: familyMember.value.occupation || '',
    shortBio: familyMember.value.shortBio || ''
  }
  editing.value = true
}

/**
 * Cancel editing
 * Discards any changes and hides form
 */
function cancelEdit() {
  editing.value = false
}

/**
 * Save member changes to backend
 * 
 * Process:
 * 1. Submit editForm data to API
 * 2. Update familyMember with response
 * 3. Show success message
 * 4. Close editing mode
 * 
 * Error Handling:
 * - Shows error alert if save fails
 * - Keeps editing mode open for retry
 * 
 * @async
 */
async function saveMember() {
  try {
    const updated = await familyService.updateFamilyMember(
      route.params.id,
      editForm.value
    )
    familyMember.value = updated
    editing.value = false
    showAlert('success', 'Family member updated successfully!')
  } catch (error) {
    console.error('Error saving member:', error)
    showAlert('error', 'Failed to save changes. Please try again.')
  }
}

/**
 * Refresh image gallery
 * Called after image upload or deletion
 * 
 * Fetches latest image list from API
 * Limited to 10 images per member
 * 
 * @async
 */
async function refreshImages() {
  try {
    const response = await fetch(`/api/images/member/${route.params.id}`)
      .then(r => r.json())
    images.value = response.images || []
  } catch (err) {
    console.error('Failed to refresh images:', err)
  }
}

/**
 * Handle image upload success
 * Called by ImageUploader component after successful upload
 * 
 * @async
 */
async function handleImageUpload() {
  showAlert('success', 'Image uploaded successfully!')
  await refreshImages()
}

/**
 * Handle image deletion
 * Called by ImageGallery component
 * 
 * Process:
 * 1. Delete image via API
 * 2. Refresh image gallery
 * 3. Show confirmation message
 * 
 * @async
 * @param {number} imageId - ID of image to delete
 */
async function handleImageDelete(imageId) {
  try {
    await fetch(`/api/images/${imageId}`, { method: 'DELETE' })
    showAlert('success', 'Image deleted successfully!')
    await refreshImages()
  } catch (error) {
    console.error('Error deleting image:', error)
    showAlert('error', 'Failed to delete image.')
  }
}

/**
 * Handle image edit
 * Called by ImageGallery component
 * Could open modal or navigate to ImageEditor
 * 
 * @param {number} imageId - ID of image to edit
 */
function handleImageEdit(imageId) {
  // TODO: Implement image editing modal
  console.log('Edit image:', imageId)
}

/**
 * LIFECYCLE HOOKS
 */

/**
 * On Component Mount
 * 
 * Fetches member data if edit permission granted
 * 
 * Process:
 * 1. Check edit permission
 * 2. Show loading spinner
 * 3. Fetch member data from API
 * 4. Fetch member's images
 * 5. Hide spinner when complete
 * 
 * @async
 */
onMounted(async () => {
  if (!canEdit) return
  
  loading.value = true
  try {
    // Fetch member details
    const member = await familyService.getFamilyMember(route.params.id)
    familyMember.value = member

    // Fetch member's images
    await refreshImages()
  } catch (error) {
    console.error('Error loading member:', error)
    showAlert('error', 'Failed to load family member.')
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <div class="edit-member-page" v-if="canEdit">
    <!-- LOADING STATE -->
    <LoadingSpinner v-if="loading" message="Loading..." size="large" />

    <!-- MAIN CONTENT -->
    <template v-else-if="familyMember">
      <!-- PAGE HEADER -->
      <PageHeader
        :title="`Edit: ${familyMember.name}`"
        subtitle="Update family member information and photos"
      />

      <!-- ALERT MESSAGES -->
      <AlertMessage
        v-if="alertMessage.visible"
        :type="alertMessage.type"
        :message="alertMessage.message"
      />

      <!-- MEMBER DETAILS SECTION -->
      <section class="member-details">
        <h2>Member Details</h2>

        <!-- EDIT MODE: Show form inputs -->
        <template v-if="editing">
          <form @submit.prevent="saveMember" class="edit-form">
            <FormInput
              v-model="editForm.name"
              label="Full Name"
              type="text"
              required
            />

            <FormInput
              v-model="editForm.birthYear"
              label="Birth Year"
              type="number"
              placeholder="e.g., 1950"
            />

            <FormInput
              v-model="editForm.deathYear"
              label="Death Year"
              type="number"
              placeholder="e.g., 2020"
            />

            <FormInput
              v-model="editForm.birthPlace"
              label="Birth Place"
              type="text"
            />

            <FormInput
              v-model="editForm.occupation"
              label="Occupation"
              type="text"
            />

            <FormTextarea
              v-model="editForm.shortBio"
              label="Short Biography"
              placeholder="Brief summary of the family member..."
              rows="4"
            />

            <!-- FORM BUTTONS -->
            <div class="form-buttons">
              <Button type="submit" variant="primary">Save Changes</Button>
              <Button type="button" variant="secondary" @click="cancelEdit">
                Cancel
              </Button>
            </div>
          </form>
        </template>

        <!-- VIEW MODE: Show member info with edit button -->
        <template v-else>
          <div class="member-info">
            <div class="info-group">
              <label>Name:</label>
              <p>{{ familyMember.name }}</p>
            </div>

            <div v-if="familyMember.birthYear" class="info-group">
              <label>Birth Year:</label>
              <p>{{ familyMember.birthYear }}</p>
            </div>

            <div v-if="familyMember.deathYear" class="info-group">
              <label>Death Year:</label>
              <p>{{ familyMember.deathYear }}</p>
            </div>

            <div v-if="familyMember.birthPlace" class="info-group">
              <label>Birth Place:</label>
              <p>{{ familyMember.birthPlace }}</p>
            </div>

            <div v-if="familyMember.occupation" class="info-group">
              <label>Occupation:</label>
              <p>{{ familyMember.occupation }}</p>
            </div>

            <div v-if="familyMember.shortBio" class="info-group">
              <label>Short Biography:</label>
              <p>{{ familyMember.shortBio }}</p>
            </div>
          </div>

          <!-- EDIT BUTTON -->
          <Button variant="primary" @click="startEdit">Edit Member</Button>
        </template>
      </section>

      <!-- IMAGE GALLERY SECTION -->
      <section v-if="images.length" class="gallery-section">
        <h2>Member Photos</h2>
        <ImageGallery
          :images="images"
          :isAdmin="true"
          @delete="handleImageDelete"
          @edit="handleImageEdit"
        />
      </section>

      <!-- IMAGE UPLOAD SECTION -->
      <section class="upload-section">
        <h2>Upload Photos</h2>
        <p class="upload-hint">
          Upload photos of the family member. You can add up to 10 photos total.
        </p>
        <ImageUploader
          :familyMemberId="route.params.id"
          :maxImages="10"
          @upload-success="handleImageUpload"
          @upload-error="(err) => showAlert('error', err)"
        />
      </section>
    </template>

    <!-- ERROR STATE -->
    <div v-else class="error-state">
      <p>Failed to load family member. Please try again.</p>
    </div>
  </div>

  <!-- NO PERMISSION -->
  <div v-else class="access-denied">
    <p>You don't have permission to edit family members.</p>
  </div>
</template>

<style scoped src="@/styles/pages/EditMemberPage.css"></style>
