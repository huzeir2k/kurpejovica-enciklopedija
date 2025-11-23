<script setup>
import { useAuth } from '@/composables/useAuth'

const { canEdit } = useAuth()
</script>

<template>
  <div class="edit-member-page" v-if="canEdit">
    <h1>Edit Family Member</h1>
    <p>Edit functionality coming soon...</p>
  </div>
  <div v-else class="access-denied">
    <p>You don't have permission to edit family members.</p>
  </div>
</template>

<style scoped>
.edit-member-page,
.access-denied {
  text-align: center;
  padding: 2rem 1rem;
}

.edit-member-page {
  background: white;
  border-radius: 3px;
  border: 1px solid #d0d0d0;
}

.edit-member-page h1 {
  color: var(--text-color);
  margin-top: 0;
}

.edit-member-page p {
  color: var(--text-muted);
}

.access-denied {
  color: var(--error-color);
  background: #fee;
  border-left: 4px solid var(--error-color);
  border-radius: 3px;
}
</style>
