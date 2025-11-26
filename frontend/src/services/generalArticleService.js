/**
 * General Article Service
 * 
 * Handles standalone articles (not tied to family members):
 * - Retrieving articles with filtering and search
 * - Creating, updating, and deleting articles
 * - Managing article categories
 * 
 * Different from articleService which handles family member biographies
 */

import api from './api'

/**
 * Get all articles with optional filtering
 * 
 * @async
 * @param {Object} [options={}] - Filter options
 * @param {string} [options.category] - Filter by specific category
 * @param {string} [options.sortBy='created_at'] - Sort field (title, created_at, updated_at)
 * @param {string} [options.order='DESC'] - Sort order (ASC or DESC)
 * @returns {Promise<Object>} Object containing:
 *   - articles: Array of article objects
 *   - total: Total count of articles
 * 
 * @example
 * // Get all articles
 * const result = await generalArticleService.getArticles()
 * console.log(result.articles.length)
 * 
 * @example
 * // Get articles in a specific category
 * const history = await generalArticleService.getArticles({ category: 'History' })
 * 
 * @example
 * // Get articles sorted by title
 * const sorted = await generalArticleService.getArticles({ 
 *   sortBy: 'title', 
 *   order: 'ASC' 
 * })
 */
export const getArticles = async (options = {}) => {
  try {
    const response = await api.get('/general-articles', { params: options })
    return response.data
  } catch (error) {
    console.error('Failed to get articles:', error)
    throw error
  }
}

/**
 * Get single article by ID
 * 
 * Retrieves full article with title, category, and content
 * Public endpoint - no authentication required
 * 
 * @async
 * @param {number} id - Article ID
 * @returns {Promise<Object>} Article object containing:
 *   - id: Article ID
 *   - title: Article title
 *   - category: Article category
 *   - content: Article text content
 *   - created_at: Creation date
 *   - updated_at: Last update date
 *   - created_by: ID of user who created it
 * 
 * @example
 * const article = await generalArticleService.getArticleById(1)
 * console.log(article.title)
 * console.log(article.content)
 */
export const getArticleById = async (id) => {
  try {
    const response = await api.get(`/general-articles/${id}`)
    return response.data
  } catch (error) {
    console.error('Failed to get article:', error)
    throw error
  }
}

/**
 * Create new general article
 * 
 * Requires authentication with "admin" role
 * 
 * @async
 * @param {Object} articleData - Article data
 * @param {string} articleData.title - Article title (required)
 * @param {string} [articleData.category] - Article category (optional)
 * @param {string} articleData.content - Article content/text (required)
 * @returns {Promise<Object>} Created article object with assigned ID
 * 
 * @example
 * const newArticle = await generalArticleService.createArticle({
 *   title: "Family History Overview",
 *   category: "History",
 *   content: "The Kurpejovic family has a rich history..."
 * })
 * console.log(newArticle.id) // Newly assigned ID
 */
export const createArticle = async (articleData) => {
  try {
    const response = await api.post('/general-articles', articleData)
    return response.data
  } catch (error) {
    console.error('Failed to create article:', error)
    throw error
  }
}

/**
 * Update existing general article
 * 
 * Requires authentication with "admin" role
 * Only provided fields are updated; others remain unchanged
 * 
 * @async
 * @param {number} id - Article ID
 * @param {Object} articleData - Fields to update
 * @param {string} [articleData.title] - Updated title
 * @param {string} [articleData.category] - Updated category
 * @param {string} [articleData.content] - Updated content
 * @returns {Promise<Object>} Updated article object
 * 
 * @example
 * const updated = await generalArticleService.updateArticle(1, {
 *   content: "Updated family history information..."
 * })
 */
export const updateArticle = async (id, articleData) => {
  try {
    const response = await api.put(`/general-articles/${id}`, articleData)
    return response.data
  } catch (error) {
    console.error('Failed to update article:', error)
    throw error
  }
}

/**
 * Delete general article
 * 
 * Requires authentication with "admin" role
 * Warning: This action cannot be undone
 * 
 * @async
 * @param {number} id - Article ID to delete
 * @returns {Promise<Object>} Deletion confirmation object
 * 
 * @example
 * await generalArticleService.deleteArticle(1)
 * console.log("Article deleted successfully")
 */
export const deleteArticle = async (id) => {
  try {
    const response = await api.delete(`/general-articles/${id}`)
    return response.data
  } catch (error) {
    console.error('Failed to delete article:', error)
    throw error
  }
}

/**
 * Get all unique categories
 * 
 * Returns list of all categories currently used by articles
 * Useful for filtering and category selection dropdowns
 * 
 * @async
 * @returns {Promise<Object>} Object containing:
 *   - categories: Array of category names
 * 
 * @example
 * const result = await generalArticleService.getCategories()
 * result.categories.forEach(cat => console.log(cat))
 * // Output: History, Traditions, Events, etc.
 */
export const getCategories = async () => {
  try {
    const response = await api.get('/general-articles/categories')
    return response.data
  } catch (error) {
    console.error('Failed to get categories:', error)
    throw error
  }
}

export default {
  getArticles,
  getArticleById,
  createArticle,
  updateArticle,
  deleteArticle,
  getCategories,
}
