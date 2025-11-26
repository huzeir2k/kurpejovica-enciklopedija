<script setup>
import { ref, onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import api from '@/services/api'
import PageHeader from '@/components/PageHeader.vue'
import AlertMessage from '@/components/AlertMessage.vue'
import LoadingSpinner from '@/components/LoadingSpinner.vue'
import FormInput from '@/components/FormInput.vue'
import FormSelect from '@/components/FormSelect.vue'
import Button from '@/components/Button.vue'

const authStore = useAuthStore()

// State
const users = ref([])
const loading = ref(false)
const error = ref('')
const success = ref('')

// Form state
const showForm = ref(false)
const newUser = ref({
  email: '',
  name: '',
  password: '',
  role: 'viewer',
})

const roles = [
  { value: 'viewer', label: 'Viewer (Read-only)' },
  { value: 'editor', label: 'Editor (Can edit content)' },
  { value: 'admin', label: 'Admin (Full access)' },
]

/**
 * Load all users
 */
async function loadUsers() {
  loading.value = true
  error.value = ''
  try {
    const response = await api.get('/auth/users')
    users.value = response.data.users || []
  } catch (err) {
    error.value = err.response?.data?.message || 'Failed to load users'
  } finally {
    loading.value = false
  }
}

/**
 * Create new user
 */
async function createUser() {
  if (!newUser.value.email || !newUser.value.name || !newUser.value.password) {
    error.value = 'Please fill in all fields'
    return
  }

  error.value = ''
  success.value = ''
  loading.value = true

  try {
    await api.post('/auth/register', {
      email: newUser.value.email,
      name: newUser.value.name,
      password: newUser.value.password,
      role: newUser.value.role,
    })

    success.value = `User "${newUser.value.name}" created successfully`
    newUser.value = { email: '', name: '', password: '', role: 'viewer' }
    showForm.value = false
    await loadUsers()

    // Clear success message after 3 seconds
    setTimeout(() => {
      success.value = ''
    }, 3000)
  } catch (err) {
    error.value = err.response?.data?.message || 'Failed to create user'
  } finally {
    loading.value = false
  }
}

/**
 * Delete user
 */
async function deleteUser(userId, userName) {
  if (!confirm(`Are you sure you want to delete "${userName}"?`)) {
    return
  }

  error.value = ''
  try {
    await api.delete(`/auth/users/${userId}`)
    success.value = `User "${userName}" deleted successfully`
    await loadUsers()

    setTimeout(() => {
      success.value = ''
    }, 3000)
  } catch (err) {
    error.value = err.response?.data?.message || 'Failed to delete user'
  }
}

/**
 * Update user role
 */
async function updateUserRole(userId, newRole) {
  error.value = ''
  try {
    await api.put(`/auth/users/${userId}/role`, { role: newRole })
    success.value = 'User role updated successfully'
    await loadUsers()

    setTimeout(() => {
      success.value = ''
    }, 3000)
  } catch (err) {
    error.value = err.response?.data?.message || 'Failed to update user role'
  }
}

// Load users on mount
onMounted(loadUsers)
</script>

<template>
  <div class="admin-page" v-if="authStore.isAdmin">
    <PageHeader
      title="Admin Panel"
      subtitle="Manage users and system settings"
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

    <!-- Create User Section -->
    <div class="section">
      <div class="section-header">
        <h2>Create New User</h2>
        <Button
          variant="secondary"
          @click="showForm = !showForm"
        >
          {{ showForm ? 'Hide Form' : 'Show Form' }}
        </Button>
      </div>

      <form v-if="showForm" @submit.prevent="createUser" class="form">
        <FormInput
          id="email"
          label="Email"
          type="email"
          :value="newUser.email"
          placeholder="user@example.com"
          required
          @update:value="newUser.email = $event"
        />

        <FormInput
          id="name"
          label="Full Name"
          type="text"
          :value="newUser.name"
          placeholder="John Doe"
          required
          @update:value="newUser.name = $event"
        />

        <FormInput
          id="password"
          label="Password"
          type="password"
          :value="newUser.password"
          placeholder="••••••••"
          required
          @update:value="newUser.password = $event"
        />

        <FormSelect
          id="role"
          label="Role"
          :value="newUser.role"
          :options="roles"
          required
          @update:value="newUser.role = $event"
        />

        <Button
          type="submit"
          variant="primary"
          :loading="loading"
        >
          {{ loading ? 'Creating...' : 'Create User' }}
        </Button>
      </form>
    </div>

    <!-- Users List Section -->
    <div class="section">
      <h2>All Users ({{ users.length }})</h2>

      <LoadingSpinner
        v-if="loading"
        message="Loading users..."
        size="medium"
      />

      <div v-else-if="users.length > 0" class="users-table">
        <div class="table-header">
          <div class="col-email">Email</div>
          <div class="col-name">Name</div>
          <div class="col-role">Role</div>
          <div class="col-status">Status</div>
          <div class="col-actions">Actions</div>
        </div>

        <div v-for="user in users" :key="user.id" class="table-row">
          <div class="col-email">{{ user.email }}</div>
          <div class="col-name">{{ user.name }}</div>
          <div class="col-role">
            <select
              :value="user.role"
              @change="updateUserRole(user.id, $event.target.value)"
              class="role-select"
            >
              <option v-for="role in roles" :key="role.value" :value="role.value">
                {{ role.label }}
              </option>
            </select>
          </div>
          <div class="col-status">
            <span :class="['status', user.active ? 'active' : 'inactive']">
              {{ user.active ? 'Active' : 'Inactive' }}
            </span>
          </div>
          <div class="col-actions">
            <Button
              variant="danger"
              size="small"
              :loading="loading"
              @click="deleteUser(user.id, user.name)"
            >
              Delete
            </Button>
          </div>
        </div>
      </div>

      <div v-else class="empty-state">
        No users found
      </div>
    </div>
  </div>

  <div v-else class="access-denied">
    <h2>Access Denied</h2>
    <p>You don't have permission to access the admin panel.</p>
    <p>Only administrators can manage users and system settings.</p>
  </div>
</template>

<style scoped src="@/styles/pages/AdminPage.css"></style>

