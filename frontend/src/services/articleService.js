import api from './api'

export const articleService = {
  /**
   * Get article by ID in specified language
   * @param {number} id - Family member ID
   * @param {string} language - Language code (default: 'sr')
   * @returns {Promise<Object>} Article data with content
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
   * Get article version history
   */
  async getArticleHistory(id) {
    const response = await api.get(`/articles/${id}/history`)
    return response.data
  },

  /**
   * Create a new article
   */
  async createArticle(familyMemberId, data) {
    const response = await api.post(`/articles`, {
      familyMemberId,
      ...data,
    })
    return response.data
  },

  /**
   * Update article content
   */
  async updateArticle(id, data) {
    const response = await api.put(`/articles/${id}`, data)
    return response.data
  },

  /**
   * Translate article to target language
   */
  async translateArticle(id, targetLanguage) {
    const response = await api.post(`/articles/${id}/translate`, {
      targetLanguage,
    })
    return response.data
  },

  /**
   * Get supported languages
   */
  async getAvailableLanguages() {
    const response = await api.get('/articles/languages')
    return response.data
  },
}
