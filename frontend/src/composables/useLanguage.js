import { computed } from 'vue'
import { useLanguageStore } from '@/stores/language'

export function useLanguage() {
  const languageStore = useLanguageStore()

  const currentLanguage = computed(() => languageStore.currentLanguage)
  const availableLanguages = computed(() => languageStore.getAvailableLanguages())

  const setLanguage = (lang) => {
    languageStore.setLanguage(lang)
  }

  const getLanguageName = (code) => {
    return languageStore.getLanguageName(code)
  }

  return {
    currentLanguage,
    availableLanguages,
    setLanguage,
    getLanguageName,
  }
}
