/**
 * Google Translate API Service
 * 
 * Integrates with Google Translate API for automatic text translation.
 * Supports 9 languages for the family encyclopedia.
 * 
 * Uses Google Cloud Translation API
 */

import axios from 'axios'

const GOOGLE_TRANSLATE_URL = 'https://translation.googleapis.com/language/translate/v2'

// Mapping of internal language codes to Google Translate language codes
const LANGUAGE_MAP = {
  sr: 'hr', // Serbo-Croatian (using Croatian)
  en: 'en', // English
  fr: 'fr', // French
  de: 'de', // German
  sv: 'sv', // Swedish
  it: 'it', // Italian
  es: 'es', // Spanish
  sq: 'sq', // Albanian
  tr: 'tr', // Turkish
}

/**
 * Translate text using Google Translate API
 * @param {string} text - Text to translate
 * @param {string} sourceLanguage - Source language code
 * @param {string} targetLanguage - Target language code
 * @returns {Promise<string>} Translated text
 */
export const translateText = async (text, sourceLanguage, targetLanguage) => {
  if (!process.env.GOOGLE_TRANSLATE_API_KEY) {
    throw new Error('Google Translate API key not configured')
  }

  if (!text || !text.trim()) {
    return text
  }

  const targetLangCode = LANGUAGE_MAP[targetLanguage]
  if (!targetLangCode) {
    throw new Error(`Unsupported target language: ${targetLanguage}`)
  }

  try {
    const response = await axios.post(
      `${GOOGLE_TRANSLATE_URL}?key=${process.env.GOOGLE_TRANSLATE_API_KEY}`,
      {
        q: text,
        target_language_code: targetLangCode,
        source_language_code: LANGUAGE_MAP[sourceLanguage] || 'hr',
      }
    )

    return response.data.data.translations[0].translatedText
  } catch (error) {
    console.error('Google Translate API error:', error.response?.data || error.message)
    throw new Error('Translation service unavailable')
  }
}

/**
 * Get list of supported languages
 * @returns {Array} Array of language objects
 */
export const getSupportedLanguages = () => {
  return [
    { code: 'sr', name: 'Serbo-Croatian', nativeName: 'Srpski/Hrvatski' },
    { code: 'en', name: 'English', nativeName: 'English' },
    { code: 'fr', name: 'French', nativeName: 'Français' },
    { code: 'de', name: 'German', nativeName: 'Deutsch' },
    { code: 'sv', name: 'Swedish', nativeName: 'Svenska' },
    { code: 'it', name: 'Italian', nativeName: 'Italiano' },
    { code: 'es', name: 'Spanish', nativeName: 'Español' },
    { code: 'sq', name: 'Albanian', nativeName: 'Shqip' },
    { code: 'tr', name: 'Turkish', nativeName: 'Türkçe' },
  ]
}
