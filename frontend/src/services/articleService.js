/**
 * Article Service (Family Member Articles)
 * 
 * Handles family member biography articles:
 * - Retrieving articles in specific languages
 * - Creating and updating articles
 * - Managing article translations
 * - Viewing article history and versions
 * 
 * Note: This is for family member articles only
 * Use generalArticleService for standalone articles
 */

import api from './api'

export const articleService = {
  /**
   * Retrieve article for a family member in specified language
   * 
   * Searches for article in requested language
   * If not found in requested language, returns available article or null
   * 
   * @async
   * @param {number} id - Family member ID
   * @param {string} [language='sr'] - Language code (sr, en, fr, de, sv, it, es, sq, tr)
   * @returns {Promise<Object|null>} Article object containing:
   *   - id: Article ID
   *   - family_member_id: Associated family member ID
   *   - language: Language code
   *   - content: HTML formatted article content
   *   - created_at: Creation date
   *   - updated_at: Last update date
   * 
   * @example
   * const article = await articleService.getArticle(1, 'en')
   * console.log(article.content) // HTML formatted biography
   * 
   * @example
   * // Get article in Serbian
   * const article = await articleService.getArticle(1) // defaults to 'sr'
   */
  async getArticle(id, language = 'sr') {
    try {
      console.log(`[API] GET /articles/${id}?lang=${language}`)
      const response = await api.get(`/articles/${id}`, { params: { lang: language } })
      console.log('[API] Response:', response)
      return response.data
    } catch (error) {
      console.error(`[API] Error fetching article ${id} in language ${language}:`, error)
      throw error
    }
  },

  /**
   * Get all past versions of an article (edit history)
   * 
   * Useful for tracking changes and reverting to previous versions
   * Shows who edited the article and when
   * 
   * @async
   * @param {number} id - Article ID
   * @returns {Promise<Object>} Object containing:
   *   - article_id: The article ID
   *   - versions: Array of article versions with:
   *     - id: Version ID
   *     - content: Article content at that version
   *     - created_at: When this version was created
   *     - updated_at: When this version was updated
   *     - created_by_name: Name of editor who created this version
   * 
   * @example
   * const history = await articleService.getArticleHistory(1)
   * history.versions.forEach(v => {
   *   console.log(`Edited at ${v.updated_at} by ${v.created_by_name}`)
   * })
   */
  async getArticleHistory(id) {
    const response = await api.get(`/articles/${id}/history`)
    return response.data
  },

  /**
   * Create a new article for a family member
   * 
   * Requires authentication with "editor" or "admin" role
   * 
   * @async
   * @param {number} familyMemberId - Family member ID
   * @param {Object} data - Article data
   * @param {string} [data.language='sr'] - Language of article (defaults to Serbian)
   * @param {string} data.content - HTML formatted article content
   * @returns {Promise<Object>} Created article object with ID
   * 
   * @example
   * const article = await articleService.createArticle(1, {
   *   language: 'en',
   *   content: '<h2>Biography</h2><p>John was born...</p>'
   * })
   */
  async createArticle(familyMemberId, data) {
    const response = await api.post(`/articles`, {
      family_member_id: familyMemberId,
      ...data,
    })
    return response.data
  },

  /**
   * Update existing article content
   * 
   * Requires authentication with "editor" or "admin" role
   * Creates a new version in the edit history
   * 
   * @async
   * @param {number} id - Article ID to update
   * @param {Object} data - Updated content
   * @param {string} data.content - New HTML formatted content
   * @returns {Promise<Object>} Updated article object
   * 
   * @example
   * const updated = await articleService.updateArticle(1, {
   *   content: '<h2>Biography</h2><p>Updated biography...</p>'
   * })
   */
  async updateArticle(id, data) {
    const response = await api.put(`/articles/${id}`, data)
    return response.data
  },

  /**
   * Automatically translate article to target language using Google Translate
   * 
   * Requires authentication with "editor" or "admin" role
   * Creates a new translated article in the target language
   * Marked as "auto_translated" in the system
   * 
   * @async
   * @param {number} id - Article ID to translate
   * @param {string} targetLanguage - Target language code
   * @returns {Promise<Object>} Created translation object with:
   *   - id: Translation ID
   *   - article_id: Source article ID
   *   - language: Target language code
   *   - content: Translated content
   *   - is_auto_translated: true (indicates automatic translation)
   * 
   * @example
   * const translation = await articleService.translateArticle(1, 'fr')
   * console.log(translation.language) // "fr"
   * console.log(translation.is_auto_translated) // true
   */
  async translateArticle(id, targetLanguage) {
    const response = await api.post(`/articles/${id}/translate`, {
      targetLanguage,
    })
    return response.data
  },

  /**
   * Get list of supported languages
   * 
   * Returns all languages articles can be written or translated into
   * 
   * @async
   * @returns {Promise<Object>} Object containing:
   *   - languages: Array of language objects with code and name
   * 
   * @example
   * const langs = await articleService.getAvailableLanguages()
   * langs.languages.forEach(l => console.log(`${l.code}: ${l.name}`))
   */
  async getAvailableLanguages() {
    const response = await api.get('/articles/languages')
    return response.data
  },

  /**
   * Get all translations of an article
   * 
   * Shows all available language versions of an article
   * 
   * @async
   * @param {number} id - Article ID
   * @returns {Promise<Array>} Array of translation objects with:
   *   - id: Translation ID
   *   - language: Language code
   *   - content: Translated content
   *   - is_auto_translated: Whether translation was automatic
   * 
   * @example
   * const translations = await articleService.getArticleTranslations(1)
   * translations.forEach(t => {
   *   console.log(`${t.language}: ${t.is_auto_translated ? 'Auto' : 'Manual'}`)
   * })
   */
  async getArticleTranslations(id) {
    const response = await api.get(`/articles/${id}/translations`)
    return response.data
  },
}
