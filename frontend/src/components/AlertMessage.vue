<script setup>
/**
 * ALERT MESSAGE COMPONENT
 * 
 * Displays status messages to the user with different severity levels
 * Provides visual feedback for errors, successes, warnings, and info
 * 
 * Features:
 * - Multiple message types: error, success, warning, info
 * - Dismissible alerts with close button (optional)
 * - Auto-hide when empty message
 * - Colored styling based on message type
 * - Accessibility support (aria-label)
 * 
 * Message Types:
 * - 'error': Red alert for errors (login failed, validation errors)
 * - 'success': Green alert for successful actions (saved, created)
 * - 'warning': Yellow alert for warnings (pending action, confirmation)
 * - 'info': Blue alert for information (tips, updates)
 * 
 * Usage:
 * <AlertMessage
 *   type="error"
 *   message="Login failed: invalid credentials"
 *   @dismiss="error = ''"
 * />
 * 
 * @component AlertMessage
 * @example
 * // Error message with dismiss button
 * <AlertMessage
 *   type="error"
 *   message="Error: Could not save changes"
 *   dismissible
 *   @dismiss="errorMessage = ''"
 * />
 * 
 * @example
 * // Success message
 * <AlertMessage
 *   type="success"
 *   message="Changes saved successfully!"
 * />
 * 
 * @example
 * // Info message, non-dismissible
 * <AlertMessage
 *   type="info"
 *   message="New features available"
 *   :dismissible="false"
 * />
 */

/**
 * COMPONENT PROPS
 */
defineProps({
  /**
   * type: Alert message type/severity level
   * 
   * Controls alert styling and color
   * Possible values: 'error', 'success', 'warning', 'info'
   * validator() ensures only valid values are accepted
   * 
   * - 'error' (red): Shows failures, errors, validation errors
   *   Background: Light red (#fff5f5)
   *   Text: Dark red
   *   Usage: Login failed, validation errors, API errors
   * 
   * - 'success' (green): Shows successful actions
   *   Background: Light green (#f0fdf4)
   *   Text: Dark green
   *   Usage: Saved successfully, created, published
   * 
   * - 'warning' (yellow): Shows warnings and cautions
   *   Background: Light yellow (#fffbeb)
   *   Text: Dark yellow/orange
   *   Usage: Pending confirmation, unsaved changes, risky action
   * 
   * - 'info' (blue): Shows informational messages
   *   Background: Light blue (#eff6ff)
   *   Text: Dark blue
   *   Usage: Tips, new features, general information
   * 
   * @type {String}
   * @default 'info'
   * @validator Only accepts: 'error', 'success', 'warning', 'info'
   * 
   * @example
   * type="error" // Red alert for errors
   * type="success" // Green alert for success
   */
  type: {
    type: String,
    default: 'info',
    validator: (value) => ['error', 'success', 'warning', 'info'].includes(value),
  },

  /**
   * message: Alert message text to display
   * 
   * Text content of the alert
   * Alert hides when message is empty string
   * Parent controls visibility by setting/clearing message
   * Supports plain text (not HTML - sanitized)
   * 
   * @type {String}
   * @required
   * 
   * @example
   * message="Error: Login failed" // Shows error alert
   * message="" // Alert disappears (hides with v-if)
   */
  message: {
    type: String,
    required: true,
  },

  /**
   * dismissible: Whether alert can be dismissed by user
   * 
   * true (default): Shows close button (×) to dismiss
   * false: No close button, user cannot dismiss
   * 
   * When user clicks close button:
   * - Emits 'dismiss' event to parent
   * - Parent should set message = '' to hide alert
   * 
   * @type {Boolean}
   * @default true
   * 
   * @example
   * dismissible // User can dismiss alert
   * :dismissible="false" // Alert cannot be dismissed
   */
  dismissible: {
    type: Boolean,
    default: true,
  },
})

/**
 * EMITTED EVENTS
 */
const emit = defineEmits([
  /**
   * dismiss: Emitted when user clicks close button
   * 
   * Only emitted if dismissible=true
   * Parent should listen with @dismiss handler
   * Parent typically clears message to hide alert
   * 
   * @event dismiss
   * 
   * @example
   * <AlertMessage
   *   :message="errorMsg"
   *   @dismiss="errorMsg = ''"
   * />
   * // When user clicks ×, errorMsg set to ''
   * // Alert disappears due to v-if="message"
   */
  'dismiss'
])
</script>

<template>
  <!-- Alert Container: Shows only when message is not empty -->
  <!-- Dynamic CSS class for styling based on alert type -->
  <div :class="['alert', `alert-${type}`]" v-if="message">
    <!-- Alert Content and Close Button -->
    <div class="alert-content">
      <!-- Alert Message Text -->
      {{ message }}
      <!-- Close Button: Only shows if dismissible=true -->
      <!-- Emits 'dismiss' event when clicked -->
      <!-- aria-label for accessibility (screen readers) -->
      <button
        v-if="dismissible"
        @click="emit('dismiss')"
        class="alert-close"
        aria-label="Close alert"
      >
        ×
      </button>
    </div>
  </div>
</template>

<style scoped src="@/styles/components/AlertMessage.css"></style>
