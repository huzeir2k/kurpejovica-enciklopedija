/**
 * General Article Model
 * 
 * Database operations for standalone articles (not tied to family members).
 * Supports title, category, and text content.
 */

import { query } from '../database/db.js'

/**
 * Create a general article
 * @param {Object} articleData - Article data
 * @returns {Promise<Object>} Created article
 */
export const createGeneralArticle = async (articleData) => {
  const { title, category, content, created_by } = articleData

  const result = await query(
    `INSERT INTO general_articles (title, category, content, created_by)
     VALUES ($1, $2, $3, $4)
     RETURNING *`,
    [title, category, content, created_by]
  )

  return result.rows[0]
}

/**
 * Get all general articles
 * @param {Object} options - Query options
 * @returns {Promise<Array>} All articles
 */
export const getAllGeneralArticles = async (options = {}) => {
  const { category, sortBy = 'created_at', order = 'DESC' } = options

  let query_str = `SELECT * FROM general_articles`
  const params = []

  if (category) {
    query_str += ` WHERE category = $1`
    params.push(category)
  }

  query_str += ` ORDER BY ${sortBy} ${order}`

  const result = await query(query_str, params)
  return result.rows
}

/**
 * Get general article by ID
 * @param {number} id - Article ID
 * @returns {Promise<Object>} Article object
 */
export const getGeneralArticleById = async (id) => {
  const result = await query(
    `SELECT * FROM general_articles WHERE id = $1`,
    [id]
  )

  return result.rows[0] || null
}

/**
 * Update general article
 * @param {number} id - Article ID
 * @param {Object} updateData - Data to update
 * @param {number} userId - User ID making the update
 * @returns {Promise<Object>} Updated article
 */
export const updateGeneralArticle = async (id, updateData, userId) => {
  const { title, category, content } = updateData

  const result = await query(
    `UPDATE general_articles
     SET title = COALESCE($1, title),
         category = COALESCE($2, category),
         content = COALESCE($3, content),
         updated_by = $4,
         updated_at = CURRENT_TIMESTAMP
     WHERE id = $5
     RETURNING *`,
    [title, category, content, userId, id]
  )

  return result.rows[0]
}

/**
 * Delete general article
 * @param {number} id - Article ID
 * @returns {Promise<boolean>} Success status
 */
export const deleteGeneralArticle = async (id) => {
  const result = await query(
    `DELETE FROM general_articles WHERE id = $1 RETURNING id`,
    [id]
  )

  return result.rows.length > 0
}

/**
 * Get all unique categories
 * @returns {Promise<Array>} List of categories
 */
export const getCategories = async () => {
  const result = await query(
    `SELECT DISTINCT category FROM general_articles WHERE category IS NOT NULL ORDER BY category ASC`
  )

  return result.rows.map(row => row.category)
}
