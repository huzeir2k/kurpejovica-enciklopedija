<script setup>
/**
 * BUTTON COMPONENT
 * 
 * Reusable button with multiple variants and states
 * Provides consistent styling and behavior across application
 * 
 * Features:
 * - Multiple variants: primary, secondary, danger, success
 * - Multiple sizes: small, medium, large
 * - Loading state with spinner indicator
 * - Disabled state support
 * - Support for different button types: button, submit, reset
 * - Click event emission for parent handling
 * 
 * Variants:
 * - 'primary' (default): Main action button (blue)
 * - 'secondary': Alternative action button (gray)
 * - 'danger': Destructive action (red) - e.g., delete, cancel
 * - 'success': Positive action (green) - e.g., save, confirm
 * 
 * Sizes:
 * - 'small': Compact button (smaller text, padding)
 * - 'medium' (default): Standard button
 * - 'large': Prominent button (larger text, padding)
 * 
 * Usage:
 * <Button variant="primary" size="large" @click="handleSubmit">
 *   Click me
 * </Button>
 * 
 * @component Button
 * @example
 * // Primary action button
 * <Button @click="handleSave">Save</Button>
 * 
 * @example
 * // Submit button with loading state
 * <Button type="submit" :loading="isLoading">
 *   {{ isLoading ? 'Saving...' : 'Save' }}
 * </Button>
 * 
 * @example
 * // Danger button (delete)
 * <Button variant="danger" size="small" @click="handleDelete">
 *   Delete
 * </Button>
 * 
 * @example
 * // Disabled button
 * <Button :disabled="!formValid">Submit</Button>
 */

/**
 * COMPONENT PROPS
 */
defineProps({
  /**
   * variant: Button style variant
   * 
   * Controls button color and styling via CSS class
   * Possible values: 'primary', 'secondary', 'danger', 'success'
   * validator() ensures only valid values are accepted
   * 
   * - 'primary' (default): Main action button (blue background)
   *   Usage: Save, Submit, Confirm
   * 
   * - 'secondary': Alternative action button (gray background)
   *   Usage: Cancel, Back, Skip
   * 
   * - 'danger': Destructive action button (red background)
   *   Usage: Delete, Logout, Discard
   * 
   * - 'success': Positive action button (green background)
   *   Usage: Approve, Publish, Confirm
   * 
   * @type {String}
   * @default 'primary'
   * @validator Only accepts: 'primary', 'secondary', 'danger', 'success'
   * 
   * @example
   * variant="primary" // Blue button
   * variant="danger" // Red button for delete
   */
  variant: {
    type: String,
    default: 'primary',
    validator: (value) => ['primary', 'secondary', 'danger', 'success'].includes(value),
  },

  /**
   * size: Button size
   * 
   * Controls button padding and text size via CSS class
   * Possible values: 'small', 'medium', 'large'
   * validator() ensures only valid values are accepted
   * 
   * - 'small': Compact button (12px text, tight padding)
   *   Usage: Inline actions, table rows, compact spaces
   * 
   * - 'medium' (default): Standard button (14px text)
   *   Usage: Most buttons, standard forms
   * 
   * - 'large': Prominent button (16px text, generous padding)
   *   Usage: Primary actions, hero section, main CTAs
   * 
   * @type {String}
   * @default 'medium'
   * @validator Only accepts: 'small', 'medium', 'large'
   * 
   * @example
   * size="small" // Compact button
   * size="large" // Prominent button
   */
  size: {
    type: String,
    default: 'medium',
    validator: (value) => ['small', 'medium', 'large'].includes(value),
  },

  /**
   * disabled: Whether button is disabled
   * 
   * true: Button appears disabled and cannot be clicked
   * false: Button is interactive
   * 
   * When disabled:
   * - Button HTML attribute :disabled="true"
   * - CSS styles make button appear grayed out
   * - Click events not fired
   * - Cursor shows "not-allowed"
   * 
   * Note: Also disabled when loading=true
   * Button is automatically disabled if loading prop is true
   * 
   * @type {Boolean}
   * @default false
   * 
   * @example
   * :disabled="!formValid" // Disable if form invalid
   * disabled // Unconditionally disabled
   */
  disabled: {
    type: Boolean,
    default: false,
  },

  /**
   * loading: Whether button is in loading state
   * 
   * true: Shows spinner and disables button
   * false: Normal button appearance
   * 
   * When loading:
   * - Spinner animation shown inside button
   * - Button automatically disabled (clicking prevented)
   * - Useful for async operations (API calls, saving)
   * - Parent typically updates button text: "Saving..." vs "Save"
   * 
   * Button disabled if loading OR disabled prop is true
   * 
   * @type {Boolean}
   * @default false
   * 
   * @example
   * :loading="isSaving" // Show spinner while saving
   * :loading="loading" // Show spinner during async operation
   */
  loading: {
    type: Boolean,
    default: false,
  },

  /**
   * type: HTML button type attribute
   * 
   * Controls button behavior in forms
   * Possible values: 'button', 'submit', 'reset'
   * 
   * - 'button' (default): Regular button, no form action
   *   Usage: Generic actions, not in forms
   * 
   * - 'submit': Submits form when clicked
   *   Usage: Form submit buttons, login forms
   *   Triggers form validation before submission
   * 
   * - 'reset': Resets form to initial values
   *   Usage: Form reset, clear form button
   * 
   * @type {String}
   * @default 'button'
   * 
   * @example
   * type="submit" // Submits form
   * type="reset" // Resets form
   * type="button" // Generic button
   */
  type: {
    type: String,
    default: 'button',
  },
})

/**
 * EMITTED EVENTS
 */
const emit = defineEmits([
  /**
   * click: Emitted when button is clicked
   * 
   * Not emitted if button is disabled or loading
   * Parent component should listen with @click handler
   * 
   * Allows parent to handle button action
   * 
   * @event click
   * 
   * @example
   * <Button @click="handleSubmit">Submit</Button>
   * // handleSubmit() called when button clicked
   */
  'click'
])
</script>

<template>
  <!-- HTML Button Element -->
  <button
    <!-- Dynamic CSS classes: btn + variant + size -->
    :class="['btn', `btn-${variant}`, `btn-${size}`]"
    <!-- Disabled if explicitly disabled OR loading -->
    :disabled="disabled || loading"
    <!-- HTML button type: button, submit, reset -->
    :type="type"
    <!-- Click event handler: emit 'click' event to parent -->
    @click="emit('click')"
  >
    <!-- Loading Spinner: Shows only when loading=true -->
    <!-- Spinner animation defined in Button.css -->
    <span v-if="loading" class="spinner"></span>
    <!-- Slot: Content inside button element -->
    <!-- Parent can put text or other elements here -->
    <slot></slot>
  </button>
</template>

<style scoped src="@/styles/components/Button.css"></style>
