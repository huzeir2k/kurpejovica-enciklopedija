/**
 * Language Store (Pinia)
 * 
 * Global state management for language/localization
 * Handles user language selection and auto-detection
 * Persists preference in localStorage across sessions
 * 
 * Supports 9 languages:
 * - sr: Serbo-Croatian (default)
 * - en: English
 * - fr: French
 * - de: German
 * - sv: Swedish
 * - it: Italian
 * - es: Spanish
 * - sq: Albanian
 * - tr: Turkish
 */

import { defineStore } from 'pinia'
import { ref } from 'vue'
import { autoDetectLanguage } from '@/utils/languageDetection'

/**
 * LANGUAGE DEFINITIONS
 * Maps language codes to display names
 */
const LANGUAGES = {
  sr: { name: 'Serbo-Croatian', nativeName: 'Srpski/Hrvatski' },
  en: { name: 'English', nativeName: 'English' },
  fr: { name: 'French', nativeName: 'Français' },
  de: { name: 'German', nativeName: 'Deutsch' },
  sv: { name: 'Swedish', nativeName: 'Svenska' },
  it: { name: 'Italian', nativeName: 'Italiano' },
  es: { name: 'Spanish', nativeName: 'Español' },
  sq: { name: 'Albanian', nativeName: 'Shqip' },
  tr: { name: 'Turkish', nativeName: 'Türkçe' },
}

export const useLanguageStore = defineStore('language', () => {
  /**
   * REACTIVE STATE
   */

  /**
   * currentLanguage: Currently active language code
   * Initially set from localStorage or 'sr' default
   * Updated when user changes language or auto-detection runs
   * 
   * Used to:
   * - Display UI in selected language
   * - Fetch articles in selected language
   * - Display family member info in selected language
   */
  const currentLanguage = ref(localStorage.getItem('language') || 'sr')

  /**
   * isAutoDetected: Whether current language was auto-detected
   * true when language was automatically selected on first visit
   * false when user manually selected a language
   * 
   * Visual indicator: 🌍 emoji appears in language selector when true
   * Allows user to know system detected their location/browser language
   */
  const isAutoDetected = ref(!localStorage.getItem('language'))

  /**
   * detectionAttempted: Flag to prevent duplicate detection
   * Ensures auto-detection only runs once per session
   * Prevents infinite loops or multiple API calls
   */
  const detectionAttempted = ref(false)

  /**
   * METHODS
   */

  /**
   * Initialize language on app startup
   * 
   * Process:
   * 1. Checks if already attempted (skips if true)
   * 2. If user has no saved preference:
   *    - Calls autoDetectLanguage() from languageDetection.js
   *    - Sets currentLanguage to detected value
   *    - Sets isAutoDetected flag to true
   *    - Does NOT save to localStorage (respects user choice)
   * 3. If user has saved preference: skips auto-detection
   * 
   * Called in App.vue onMounted hook with authService.fetchCurrentUser()
   * 
   * Auto-detection priority:
   * 1. Browser language (navigator.language)
   * 2. IP-based country detection
   * 3. Fallback to Serbian ('sr')
   * 
   * @async
   * @returns {Promise<void>}
   * 
   * @example
   * const lang = useLanguageStore()
   * await lang.initializeLanguage()
   * console.log(lang.currentLanguage) // 'sv' if user in Sweden
   * console.log(lang.isAutoDetected) // true if auto-detected
   */
  async function initializeLanguage() {
    if (detectionAttempted.value) return

    detectionAttempted.value = true

    // Only auto-detect if no saved preference exists
    if (!localStorage.getItem('language')) {
      try {
        const detectedLang = await autoDetectLanguage()
        currentLanguage.value = detectedLang
        isAutoDetected.value = true
        // Don't save to localStorage yet - let user change if they want
      } catch (error) {
        console.warn('Language auto-detection failed:', error)
      }
    }
  }

  /**
   * Change current language
   * 
   * Process:
   * 1. Validates language code exists in LANGUAGES
   * 2. Updates currentLanguage ref
   * 3. Sets isAutoDetected to false (marks as user choice)
   * 4. If savePreference=true: saves to localStorage for future sessions
   * 5. All API calls using currentLanguage will fetch content in new language
   * 
   * Reactivity: All components watching currentLanguage will update
   * This triggers re-fetching of articles in new language
   * 
   * @param {string} lang - Language code to set (sr, en, fr, de, etc.)
   * @param {boolean} [savePreference=true] - Whether to save to localStorage
   * 
   * @example
   * const lang = useLanguageStore()
   * 
   * // User selects English from dropdown
   * lang.setLanguage('en')
   * // Language changes immediately and is saved for next visit
   * 
   * @example
   * // Change language without saving (temporary)
   * lang.setLanguage('de', false)
   */
  function setLanguage(lang, savePreference = true) {
    if (LANGUAGES[lang]) {
      currentLanguage.value = lang
      isAutoDetected.value = false

      // Save preference to localStorage for future visits
      if (savePreference) {
        localStorage.setItem('language', lang)
      }
    }
  }

  /**
   * Get native name for language code
   * 
   * Used for displaying language names in UI
   * Shows native name (e.g., "Deutsch" for German) instead of English name
   * 
   * @param {string} code - Language code
   * @returns {string} Native name or code if not found
   * 
   * @example
   * const lang = useLanguageStore()
   * console.log(lang.getLanguageName('sv')) // "Svenska"
   * console.log(lang.getLanguageName('de')) // "Deutsch"
   */
  function getLanguageName(code) {
    return LANGUAGES[code]?.nativeName || code
  }

  /**
   * Get list of all available languages
   * 
   * Returns array of language objects for populating dropdowns
   * Each object contains: code, name (English), nativeName
   * 
   * @returns {Array<Object>} Array of language objects
   *   Each object: { code: 'de', name: 'German', nativeName: 'Deutsch' }
   * 
   * @example
   * const lang = useLanguageStore()
   * const languages = lang.getAvailableLanguages()
   * languages.forEach(l => {
   *   console.log(`${l.code}: ${l.nativeName}`)
   * })
   * // Output:
   * // sr: Srpski/Hrvatski
   * // en: English
   * // fr: Français
   * // ...
   */
  function getAvailableLanguages() {
    return Object.entries(LANGUAGES).map(([code, data]) => ({
      code,
      ...data,
    }))
  }

  /**
   * RETURN PUBLIC API
   */
  return {
    // State
    currentLanguage,
    isAutoDetected,
    detectionAttempted,
    // Methods
    initializeLanguage,
    setLanguage,
    getLanguageName,
    getAvailableLanguages,
  }
})
