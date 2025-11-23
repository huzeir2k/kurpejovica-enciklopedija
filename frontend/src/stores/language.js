import { defineStore } from 'pinia'
import { ref } from 'vue'

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
  const currentLanguage = ref(localStorage.getItem('language') || 'sr')

  function setLanguage(lang) {
    if (LANGUAGES[lang]) {
      currentLanguage.value = lang
      localStorage.setItem('language', lang)
    }
  }

  function getLanguageName(code) {
    return LANGUAGES[code]?.nativeName || code
  }

  function getAvailableLanguages() {
    return Object.entries(LANGUAGES).map(([code, data]) => ({
      code,
      ...data,
    }))
  }

  return {
    currentLanguage,
    setLanguage,
    getLanguageName,
    getAvailableLanguages,
  }
})
