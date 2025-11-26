<script setup>
/**
 * FORM INPUT COMPONENT
 * 
 * Reusable text input field for forms
 * Provides consistent styling and behavior across application
 * 
 * Features:
 * - Support for multiple input types (text, email, password, number, etc.)
 * - Customizable placeholder and label
 * - Optional required and disabled states
 * - Two-way value binding via v-model
 * - Consistent styling with design system
 * 
 * Usage:
 * <FormInput
 *   id="email"
 *   label="Email"
 *   type="email"
 *   :value="email"
 *   placeholder="your@email.com"
 *   required
 *   @update:value="email = $event"
 * />
 * 
 * Props:
 * - id: HTML id attribute (required, used for label association)
 * - label: Input label text
 * - type: HTML input type (default: 'text')
 * - placeholder: Placeholder text inside input
 * - value: Current input value
 * - required: Whether field is required
 * - disabled: Whether field is disabled
 * 
 * Emits:
 * - update:value: Emitted when input changes (v-model binding)
 * 
 * @component FormInput
 * @example
 * // Basic usage
 * <FormInput
 *   id="name"
 *   label="Full Name"
 *   placeholder="John Doe"
 *   :value="name"
 *   @update:value="name = $event"
 * />
 * 
 * @example
 * // Email field with validation
 * <FormInput
 *   id="email"
 *   label="Email Address"
 *   type="email"
 *   :value="email"
 *   placeholder="example@domain.com"
 *   required
 *   @update:value="email = $event"
 * />
 * 
 * @example
 * // Password field
 * <FormInput
 *   id="password"
 *   label="Password"
 *   type="password"
 *   :value="password"
 *   placeholder="••••••••"
 *   required
 *   @update:value="password = $event"
 * />
 * 
 * @example
 * // Disabled field
 * <FormInput
 *   id="readonly"
 *   label="Member ID"
 *   :value="memberId"
 *   disabled
 * />
 */

/**
 * COMPONENT PROPS
 * 
 * All props passed to this component control input behavior and display
 */
defineProps({
  /**
   * id: HTML id attribute for input element
   * 
   * Required to properly associate label with input
   * HTML: <label for="id"> links to <input id="id">
   * Used for accessibility and styling
   * 
   * @type {String}
   * @required
   * 
   * @example
   * id="email" // Creates <input id="email"> and <label for="email">
   */
  id: {
    type: String,
    required: true,
  },

  /**
   * label: Text to display above input field
   * 
   * Displayed in <label> element
   * Associated with input via id prop
   * Clicking label focuses the input field (accessibility)
   * Can be empty string '' to hide label
   * 
   * @type {String}
   * @required
   * 
   * @example
   * label="Email Address" // Shows "Email Address" above field
   * label="" // Hides label (but component rendered)
   */
  label: {
    type: String,
    required: true,
  },

  /**
   * type: HTML input type attribute
   * 
   * Controls input behavior and validation
   * Supported types:
   * - 'text': Standard text input (default)
   * - 'email': Email validation, mobile keyboard
   * - 'password': Hides input as dots
   * - 'number': Number input with spinner controls
   * - 'tel': Telephone number input
   * - 'url': URL input with validation
   * - 'date': Date picker
   * 
   * @type {String}
   * @default 'text'
   * 
   * @example
   * type="email" // Email input with @domain validation
   * type="password" // Hides password input
   * type="number" // Shows +/- spinners
   */
  type: {
    type: String,
    default: 'text',
  },

  /**
   * placeholder: Placeholder text inside input field
   * 
   * Displayed when input is empty
   * Disappears when user starts typing
   * Provides hint about expected input format
   * 
   * @type {String}
   * @default ''
   * 
   * @example
   * placeholder="john.doe@example.com" // Shows placeholder
   * placeholder="••••••••" // Password placeholder
   */
  placeholder: {
    type: String,
    default: '',
  },

  /**
   * value: Current input field value
   * 
   * Bound to parent component via v-model
   * Updated by parent when parent data changes
   * Emits 'update:value' event when user types
   * Can be String or Number
   * 
   * @type {String|Number}
   * @default ''
   * 
   * @example
   * :value="email" // Displays parent's email ref
   * :value="age" // Can be number for number inputs
   */
  value: {
    type: [String, Number],
    default: '',
  },

  /**
   * required: Whether field is required for form submission
   * 
   * true: HTML5 validation prevents empty submission
   * false: Field is optional
   * Shows red asterisk (*) in label via CSS
   * Browser shows "Please fill out this field" error
   * 
   * @type {Boolean}
   * @default false
   * 
   * @example
   * required // Field is required for form submission
   * :required="false" // Field is optional
   */
  required: {
    type: Boolean,
    default: false,
  },

  /**
   * disabled: Whether field is disabled
   * 
   * true: Field cannot be edited by user
   * false: Field is editable
   * Disabled fields appear grayed out
   * Disabled field values not submitted in forms
   * Useful for read-only fields (e.g., auto-populated IDs)
   * 
   * @type {Boolean}
   * @default false
   * 
   * @example
   * disabled // Field cannot be edited
   * :disabled="!isAdmin" // Conditionally disable
   */
  disabled: {
    type: Boolean,
    default: false,
  },
})

/**
 * EMITTED EVENTS
 * 
 * Emits Vue events to communicate with parent component
 */
const emit = defineEmits([
  /**
   * update:value: Emitted when input value changes
   * 
   * Vue uses this special event name for v-model binding
   * Emitted on every keystroke
   * Parent should update its data with emitted value
   * 
   * Equivalent to:
   * v-model="inputValue" (shorthand)
   * :value="inputValue" @update:value="inputValue = $event" (explicit)
   * 
   * @event update:value
   * @param {String|Number} newValue - New input value
   * 
   * @example
   * @update:value="email = $event" // Parent updates email ref
   */
  'update:value'
])

/**
 * Handle input event from native HTML input element
 * 
 * Called on every keystroke in input field
 * Extracts value from event.target.value
 * Emits 'update:value' event with new value
 * Parent component listens for this event and updates its data
 * 
 * @param {Event} event - Native input event
 * @param {String} event.target.value - Current input value
 * 
 * Flow:
 * 1. User types in input field
 * 2. Browser fires 'input' event
 * 3. @input handler (handleInput) executes
 * 4. Emits 'update:value' with new value
 * 5. Parent's @update:value handler updates parent data
 * 
 * @private
 */
function handleInput(event) {
  emit('update:value', event.target.value)
}
</script>

<template>
  <!-- Form Group Container: Wrapper for label + input -->
  <div class="form-group">
    <!-- Input Label: Associated with input via :for attribute -->
    <label :for="id">{{ label }}</label>
    <!-- Input Element: Text, email, password, etc. -->
    <input
      :id="id"
      :type="type"
      :placeholder="placeholder"
      :value="value"
      :required="required"
      :disabled="disabled"
      @input="handleInput"
      class="form-input"
    />
  </div>
</template>

<style scoped src="@/styles/components/FormInput.css"></style>
