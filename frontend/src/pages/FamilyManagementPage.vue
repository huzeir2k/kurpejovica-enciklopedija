<script setup>
import { ref, onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import api from '@/services/api'
import PageHeader from '@/components/PageHeader.vue'
import AlertMessage from '@/components/AlertMessage.vue'
import LoadingSpinner from '@/components/LoadingSpinner.vue'
import FormInput from '@/components/FormInput.vue'
import FormSelect from '@/components/FormSelect.vue'
import FormTextarea from '@/components/FormTextarea.vue'
import Button from '@/components/Button.vue'

const authStore = useAuthStore()

// State
const familyMembers = ref([])
const loading = ref(false)
const error = ref('')
const success = ref('')
const activeTab = ref('members') // 'members' or 'relationships'

// Member Form State
const showMemberForm = ref(false)
const newMember = ref({
  name: '',
  birth_year: '',
  death_year: '',
  occupation: '',
  short_bio: '',
})

// Relationship Form State
const showRelationshipForm = ref(false)
const newRelationship = ref({
  member_id: '',
  related_member_id: '',
  relationship_type: 'spouse',
})

const relationshipTypes = [
  { value: 'parent', label: 'Parent' },
  { value: 'spouse', label: 'Spouse' },
  { value: 'sibling', label: 'Sibling' },
  { value: 'child', label: 'Child' },
  { value: 'grandparent', label: 'Grandparent' },
  { value: 'grandchild', label: 'Grandchild' },
  { value: 'uncle', label: 'Uncle' },
  { value: 'aunt', label: 'Aunt (Tetka)' },
  { value: 'cousin', label: 'Cousin' },
  { value: 'nephew', label: 'Nephew' },
  { value: 'niece', label: 'Niece' },
  { value: 'brother_in_law', label: 'Brother-in-law' },
  { value: 'sister_in_law', label: 'Sister-in-law' },
  { value: 'father_in_law', label: 'Father-in-law' },
  { value: 'mother_in_law', label: 'Mother-in-law' },
]

/**
 * Load all family members
 */
async function loadFamilyMembers() {
  loading.value = true
  error.value = ''
  try {
    const response = await api.get('/family-members')
    familyMembers.value = response.data.members || []
  } catch (err) {
    error.value = 'Failed to load family members'
  } finally {
    loading.value = false
  }
}

/**
 * Create new family member
 */
async function createFamilyMember() {
  if (!newMember.value.name.trim()) {
    error.value = 'Name is required'
    return
  }

  error.value = ''
  success.value = ''
  loading.value = true

  try {
    const data = {
      name: newMember.value.name,
      birth_year: newMember.value.birth_year ? parseInt(newMember.value.birth_year) : null,
      death_year: newMember.value.death_year ? parseInt(newMember.value.death_year) : null,
      occupation: newMember.value.occupation || null,
      short_bio: newMember.value.short_bio || null,
    }

    await api.post('/family-members', data)

    success.value = `"${newMember.value.name}" created successfully!`
    newMember.value = {
      name: '',
      birth_year: '',
      death_year: '',
      occupation: '',
      short_bio: '',
    }
    showMemberForm.value = false
    await loadFamilyMembers()

    setTimeout(() => {
      success.value = ''
    }, 3000)
  } catch (err) {
    error.value = err.response?.data?.error || 'Failed to create family member'
  } finally {
    loading.value = false
  }
}

/**
 * Delete family member
 */
async function deleteFamilyMember(memberId, memberName) {
  if (!confirm(`Are you sure you want to delete "${memberName}"? This will also remove all their relationships.`)) {
    return
  }

  error.value = ''
  try {
    await api.delete(`/family-members/${memberId}`)
    success.value = `"${memberName}" deleted successfully`
    await loadFamilyMembers()

    setTimeout(() => {
      success.value = ''
    }, 3000)
  } catch (err) {
    error.value = err.response?.data?.error || 'Failed to delete family member'
  }
}

/**
 * Create family relationship
 */
async function createFamilyRelationship() {
  if (!newRelationship.value.member_id || !newRelationship.value.related_member_id) {
    error.value = 'Please select both family members'
    return
  }

  if (newRelationship.value.member_id === newRelationship.value.related_member_id) {
    error.value = 'Cannot create relationship with the same person'
    return
  }

  error.value = ''
  success.value = ''
  loading.value = true

  try {
    const memberName = familyMembers.value.find(m => m.id === parseInt(newRelationship.value.member_id))?.name
    const relatedName = familyMembers.value.find(m => m.id === parseInt(newRelationship.value.related_member_id))?.name
    const relationType = relationshipTypes.find(r => r.value === newRelationship.value.relationship_type)?.label

    await api.post(`/family-members/${newRelationship.value.member_id}/relationships`, {
      related_member_id: parseInt(newRelationship.value.related_member_id),
      relationship_type: newRelationship.value.relationship_type,
    })

    success.value = `Relationship created: "${memberName}" is ${relationType} of "${relatedName}"`
    newRelationship.value = {
      member_id: '',
      related_member_id: '',
      relationship_type: 'spouse',
    }
    showRelationshipForm.value = false
    await loadFamilyMembers()

    setTimeout(() => {
      success.value = ''
    }, 3000)
  } catch (err) {
    error.value = err.response?.data?.error || 'Failed to create relationship'
  } finally {
    loading.value = false
  }
}

// Load on mount
onMounted(loadFamilyMembers)
</script>

<template>
  <div class="family-management-page" v-if="authStore.isEditor || authStore.isAdmin">
    <PageHeader
      title="Family Management"
      subtitle="Create and manage family members and relationships"
    />

    <!-- Messages -->
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

    <!-- Tabs -->
    <div class="tabs">
      <button
        :class="['tab', { active: activeTab === 'members' }]"
        @click="activeTab = 'members'"
      >
        Family Members
      </button>
      <button
        :class="['tab', { active: activeTab === 'relationships' }]"
        @click="activeTab = 'relationships'"
      >
        Relationships
      </button>
    </div>

    <!-- Family Members Section -->
    <div v-if="activeTab === 'members'" class="section">
      <div class="section-header">
        <h2>Family Members ({{ familyMembers.length }})</h2>
        <Button
          variant="primary"
          @click="showMemberForm = !showMemberForm"
        >
          {{ showMemberForm ? 'Hide Form' : '+ Add Member' }}
        </Button>
      </div>

      <!-- Add Member Form -->
      <form v-if="showMemberForm" @submit.prevent="createFamilyMember" class="form">
        <FormInput
          id="name"
          label="Full Name *"
          type="text"
          :value="newMember.name"
          placeholder="e.g., Hamza Kurpejović"
          required
          @update:value="newMember.name = $event"
        />

        <div class="form-row">
          <FormInput
            id="birth_year"
            label="Birth Year"
            type="number"
            :value="newMember.birth_year"
            placeholder="1945"
            @update:value="newMember.birth_year = $event"
          />
          <FormInput
            id="death_year"
            label="Death Year (Leave blank if living)"
            type="number"
            :value="newMember.death_year"
            placeholder="2020"
            @update:value="newMember.death_year = $event"
          />
        </div>

        <FormInput
          id="occupation"
          label="Occupation"
          type="text"
          :value="newMember.occupation"
          placeholder="e.g., Teacher, Farmer, Doctor"
          @update:value="newMember.occupation = $event"
        />

        <FormTextarea
          id="short_bio"
          label="Biography"
          :value="newMember.short_bio"
          placeholder="Brief description about this person..."
          rows="4"
          @update:value="newMember.short_bio = $event"
        />

        <div class="form-actions">
          <Button
            type="submit"
            variant="primary"
            :loading="loading"
          >
            {{ loading ? 'Creating...' : 'Create Member' }}
          </Button>
          <Button
            type="button"
            variant="secondary"
            @click="showMemberForm = false"
          >
            Cancel
          </Button>
        </div>
      </form>

      <!-- Members List -->
      <LoadingSpinner
        v-if="loading && !showMemberForm"
        message="Loading members..."
        size="medium"
      />

      <div v-else-if="familyMembers.length > 0" class="members-list">
        <div v-for="member in familyMembers" :key="member.id" class="member-card">
          <div class="member-header">
            <h3>{{ member.name }}</h3>
            <span v-if="member.birth_year" class="years">
              {{ member.death_year ? `${member.birth_year} - ${member.death_year}` : `b. ${member.birth_year}` }}
            </span>
          </div>

          <div v-if="member.occupation" class="member-occupation">
            {{ member.occupation }}
          </div>

          <div v-if="member.short_bio" class="member-bio">
            {{ member.short_bio }}
          </div>

          <div class="member-actions">
            <Button
              variant="danger"
              size="small"
              @click="deleteFamilyMember(member.id, member.name)"
            >
              Delete
            </Button>
          </div>
        </div>
      </div>

      <div v-else class="empty-state">
        No family members yet. Create your first member to get started!
      </div>
    </div>

    <!-- Relationships Section -->
    <div v-if="activeTab === 'relationships'" class="section">
      <div class="section-header">
        <h2>Create Relationships</h2>
        <Button
          variant="primary"
          @click="showRelationshipForm = !showRelationshipForm"
        >
          {{ showRelationshipForm ? 'Hide Form' : '+ Add Relationship' }}
        </Button>
      </div>

      <!-- Add Relationship Form -->
      <form v-if="showRelationshipForm" @submit.prevent="createFamilyRelationship" class="form">
        <div class="relationship-info">
          <p>
            Define how family members are related. For example:<br>
            • If <strong>Hamza</strong> is the <strong>father</strong> of <strong>Abid</strong>, create a relationship<br>
            • If <strong>Hamza</strong> is the <strong>brother</strong> of <strong>Nejra</strong>, define that relationship
          </p>
        </div>

        <FormSelect
          id="member"
          label="Person *"
          :value="newRelationship.member_id"
          :options="familyMembers.map(m => ({ value: m.id, label: m.name }))"
          placeholder="Select a family member"
          required
          @update:value="newRelationship.member_id = $event"
        />

        <FormSelect
          id="relationship_type"
          label="Relationship Type *"
          :value="newRelationship.relationship_type"
          :options="relationshipTypes"
          required
          @update:value="newRelationship.relationship_type = $event"
        />

        <FormSelect
          id="related_member"
          label="Related To *"
          :value="newRelationship.related_member_id"
          :options="familyMembers.map(m => ({ value: m.id, label: m.name }))"
          placeholder="Select the related family member"
          required
          @update:value="newRelationship.related_member_id = $event"
        />

        <div class="form-actions">
          <Button
            type="submit"
            variant="primary"
            :loading="loading"
          >
            {{ loading ? 'Creating...' : 'Create Relationship' }}
          </Button>
          <Button
            type="button"
            variant="secondary"
            @click="showRelationshipForm = false"
          >
            Cancel
          </Button>
        </div>
      </form>

      <div v-if="!showRelationshipForm && familyMembers.length < 2" class="empty-state">
        You need at least 2 family members to create relationships. Go to the Family Members tab and create some first!
      </div>
    </div>
  </div>

  <div v-else class="access-denied">
    <h2>Access Denied</h2>
    <p>You don't have permission to manage family members.</p>
    <p>Only editors and administrators can manage the family tree.</p>
  </div>
</template>

<style scoped src="@/styles/pages/FamilyManagementPage.css"></style>
