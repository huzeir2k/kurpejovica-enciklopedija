<script setup>
import { ref, onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import api from '@/services/api'

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
    <div class="page-header">
      <h1>Admin Panel</h1>
      <p>Manage users and system settings</p>
    </div>

    <!-- Messages -->
    <div v-if="error" class="alert alert-error">
      {{ error }}
    </div>
    <div v-if="success" class="alert alert-success">
      {{ success }}
    </div>

    <!-- Create User Section -->
    <div class="section">
      <div class="section-header">
        <h2>Create New User</h2>
        <button
          @click="showForm = !showForm"
          class="btn-toggle"
        >
          {{ showForm ? 'Hide Form' : 'Show Form' }}
        </button>
      </div>

      <form v-if="showForm" @submit.prevent="createUser" class="form">
        <div class="form-group">
          <label for="email">Email</label>
          <input
            id="email"
            v-model="newUser.email"
            type="email"
            placeholder="user@example.com"
            required
          />
        </div>

        <div class="form-group">
          <label for="name">Full Name</label>
          <input
            id="name"
            v-model="newUser.name"
            type="text"
            placeholder="John Doe"
            required
          />
        </div>

        <div class="form-group">
          <label for="password">Password</label>
          <input
            id="password"
            v-model="newUser.password"
            type="password"
            placeholder="••••••••"
            required
          />
        </div>

        <div class="form-group">
          <label for="role">Role</label>
          <select id="role" v-model="newUser.role" required>
            <option v-for="role in roles" :key="role.value" :value="role.value">
              {{ role.label }}
            </option>
          </select>
        </div>

        <button type="submit" class="btn btn-primary" :disabled="loading">
          {{ loading ? 'Creating...' : 'Create User' }}
        </button>
      </form>
    </div>

    <!-- Users List Section -->
    <div class="section">
      <h2>All Users ({{ users.length }})</h2>

      <div v-if="loading" class="loading">
        Loading users...
      </div>

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
            <button
              @click="deleteUser(user.id, user.name)"
              class="btn btn-danger btn-small"
              :disabled="loading"
            >
              Delete
            </button>
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

<style scoped>
.admin-page {
  padding: 0;
}

.page-header {
  background-color: var(--primary-light);
  border-left: 4px solid var(--primary-color);
  padding: 2rem;
  margin-bottom: 2rem;
  border-radius: 3px;
}

.page-header h1 {
  margin: 0 0 0.5rem 0;
  color: var(--text-color);
}

.page-header p {
  margin: 0;
  color: var(--text-muted);
}

.section {
  background: white;
  padding: 1.5rem;
  margin-bottom: 2rem;
  border-radius: 3px;
  border: 1px solid #d0d0d0;
  box-shadow: 0 1px 1px rgba(0, 0, 0, 0.1);
}

.section h2 {
  margin-top: 0;
  margin-bottom: 1.5rem;
  color: var(--text-color);
  border-bottom: none;
  padding-bottom: 0;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.section-header h2 {
  margin: 0;
}

.btn-toggle {
  background: var(--primary-light);
  color: var(--primary-color);
  border: 1px solid var(--border-color);
  padding: 0.5rem 1rem;
  border-radius: 3px;
  cursor: pointer;
  font-size: 0.9rem;
  transition: all 0.2s;
}

.btn-toggle:hover {
  background: var(--primary-color);
  color: white;
}

/* Form Styles */
.form {
  background: var(--bg-secondary);
  padding: 1.5rem;
  border-radius: 3px;
  margin-bottom: 1rem;
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.4rem;
  font-weight: 600;
  color: var(--text-color);
  font-size: 0.95rem;
}

.form-group input,
.form-group select {
  width: 100%;
  padding: 0.6rem 0.8rem;
  border: 1px solid var(--border-color);
  border-radius: 3px;
  font-size: 1rem;
  background: white;
  color: var(--text-color);
  font-family: inherit;
}

.form-group input:focus,
.form-group select:focus {
  outline: none;
  border-color: var(--primary-color);
  box-shadow: 0 0 0 2px rgba(51, 102, 204, 0.15);
}

/* Alert Styles */
.alert {
  padding: 1rem;
  margin-bottom: 1.5rem;
  border-radius: 3px;
  border-left: 4px solid;
}

.alert-error {
  background: #fee;
  border-left-color: var(--error-color);
  color: var(--error-color);
}

.alert-success {
  background: #efe;
  border-left-color: var(--success-color);
  color: var(--success-color);
}

/* Button Styles */
.btn {
  padding: 0.6rem 1rem;
  border: 1px solid;
  border-radius: 3px;
  cursor: pointer;
  font-size: 0.95rem;
  transition: all 0.2s;
  font-family: inherit;
}

.btn-primary {
  background: var(--primary-color);
  color: white;
  border-color: var(--primary-dark);
}

.btn-primary:hover:not(:disabled) {
  background: var(--primary-dark);
}

.btn-danger {
  background: var(--error-color);
  color: white;
  border-color: #c82333;
}

.btn-danger:hover:not(:disabled) {
  opacity: 0.8;
}

.btn-small {
  padding: 0.4rem 0.8rem;
  font-size: 0.85rem;
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* Table Styles */
.users-table {
  overflow-x: auto;
}

.table-header {
  display: grid;
  grid-template-columns: 2fr 2fr 1.5fr 1fr 1fr;
  gap: 1rem;
  padding: 1rem;
  background: var(--bg-secondary);
  border-radius: 3px 3px 0 0;
  font-weight: 600;
  font-size: 0.9rem;
  color: var(--text-color);
  border-bottom: 2px solid var(--border-color);
}

.table-row {
  display: grid;
  grid-template-columns: 2fr 2fr 1.5fr 1fr 1fr;
  gap: 1rem;
  padding: 1rem;
  border-bottom: 1px solid #f0f0f0;
  align-items: center;
}

.table-row:last-child {
  border-bottom: none;
}

.table-row:hover {
  background: var(--bg-secondary);
}

.col-email,
.col-name {
  color: var(--text-color);
  font-size: 0.95rem;
}

.col-role select {
  width: 100%;
  padding: 0.4rem;
  border: 1px solid var(--border-color);
  border-radius: 3px;
  background: white;
  color: var(--text-color);
  font-size: 0.85rem;
}

.status {
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.85rem;
  font-weight: 600;
}

.status.active {
  background: #e8f5e9;
  color: var(--success-color);
}

.status.inactive {
  background: #ffebee;
  color: var(--error-color);
}

.loading {
  text-align: center;
  padding: 2rem;
  color: var(--text-muted);
}

.empty-state {
  text-align: center;
  padding: 2rem;
  color: var(--text-muted);
  font-style: italic;
}

.access-denied {
  background: white;
  border: 1px solid #d0d0d0;
  padding: 3rem 1rem;
  border-radius: 3px;
  text-align: center;
}

.access-denied h2 {
  color: var(--error-color);
  margin-bottom: 0.5rem;
}

.access-denied p {
  color: var(--text-muted);
  margin: 0.5rem 0;
}

@media (max-width: 768px) {
  .table-header,
  .table-row {
    grid-template-columns: 1fr;
  }

  .col-email::before {
    content: 'Email: ';
    font-weight: 600;
  }

  .col-name::before {
    content: 'Name: ';
    font-weight: 600;
  }

  .col-role::before {
    content: 'Role: ';
    font-weight: 600;
  }

  .col-status::before {
    content: 'Status: ';
    font-weight: 600;
  }

  .col-actions::before {
    content: 'Actions: ';
    font-weight: 600;
  }

  .section-header {
    flex-direction: column;
    gap: 1rem;
    align-items: flex-start;
  }

  .btn-toggle {
    width: 100%;
  }
}
</style>

