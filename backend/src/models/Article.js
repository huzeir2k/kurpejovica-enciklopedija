/**
 * Article Model
 * 
 * Database operations for article and translation management.
 */

import { query } from '../database/db.js'

/**
 * Create an article
 * @param {Object} articleData - Article data
 * @returns {Promise<Object>} Created article
 */
export const createArticle = async (articleData) => {
  const { family_member_id, language, content, created_by } = articleData

  const result = await query(
    `INSERT INTO articles (family_member_id, language, content, created_by)
     VALUES ($1, $2, $3, $4)
     RETURNING *`,
    [family_member_id, language, content, created_by]
  )

  return result.rows[0]
}

/**
 * Get article by family member and language
 * @param {number} familyMemberId - Family member ID
 * @param {string} language - Language code
 * @returns {Promise<Object>} Article with member info
 */
export const getArticleByMemberAndLanguage = async (familyMemberId, language = 'sr') => {
  const result = await query(
    `SELECT 
       a.id, a.family_member_id, a.language, a.content, a.created_by, a.created_at, a.updated_at,
       fm.name, fm.birth_year, fm.death_year
     FROM articles a
     JOIN family_members fm ON a.family_member_id = fm.id
     WHERE a.family_member_id = $1 AND a.language = $2`,
    [familyMemberId, language]
  )

  if (result.rows.length > 0) {
    return result.rows[0]
  }

  // If exact language not found, return any available article for this member
  const fallback = await query(
    `SELECT 
       a.id, a.family_member_id, a.language, a.content, a.created_by, a.created_at, a.updated_at,
       fm.name, fm.birth_year, fm.death_year
     FROM articles a
     JOIN family_members fm ON a.family_member_id = fm.id
     WHERE a.family_member_id = $1
     LIMIT 1`,
    [familyMemberId]
  )

  return fallback.rows[0] || null
}

/**
 * Update article
 * @param {number} id - Article ID
 * @param {string} content - New content
 * @param {number} userId - User ID making the update
 * @returns {Promise<Object>} Updated article
 */
export const updateArticle = async (id, content, userId) => {
  const result = await query(
    `UPDATE articles
     SET content = $1, updated_by = $2, updated_at = CURRENT_TIMESTAMP
     WHERE id = $3
     RETURNING *`,
    [content, userId, id]
  )

  return result.rows[0]
}

/**
 * Get article history/versions
 * @param {number} articleId - Article ID
 * @returns {Promise<Array>} Article versions with edit history
 */
export const getArticleHistory = async (articleId) => {
  const result = await query(
    `SELECT 
       a.id, a.language, a.content, a.created_by, u.name as created_by_name,
       a.created_at, a.updated_at
     FROM articles a
     LEFT JOIN users u ON a.created_by = u.id
     WHERE a.id = $1
     ORDER BY a.updated_at DESC`,
    [articleId]
  )

  return result.rows
}

/**
 * Add article translation
 * @param {number} articleId - Article ID
 * @param {string} language - Language code
 * @param {string} content - Translated content
 * @param {boolean} isAutoTranslated - Whether translation is automatic
 * @param {number} userId - User ID
 * @returns {Promise<Object>} Created translation
 */
export const addArticleTranslation = async (articleId, language, content, isAutoTranslated, userId) => {
  const result = await query(
    `INSERT INTO article_translations (article_id, language, content, is_auto_translated, created_by)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING *`,
    [articleId, language, content, isAutoTranslated, userId]
  )

  return result.rows[0]
}

/**
 * Get all translations for an article
 * @param {number} articleId - Article ID
 * @returns {Promise<Array>} All translations
 */
export const getArticleTranslations = async (articleId) => {
  const result = await query(
    `SELECT * FROM article_translations
     WHERE article_id = $1
     ORDER BY language ASC`,
    [articleId]
  )

  return result.rows
}

/**
 * Get article by ID
 * @param {number} id - Article ID
 * @returns {Promise<Object>} Article object
 */
export const getArticleById = async (id) => {
  const result = await query(
    `SELECT * FROM articles WHERE id = $1`,
    [id]
  )

  return result.rows[0] || null
}

/**
 * Delete article
 * @param {number} id - Article ID
 * @returns {Promise<boolean>} Success status
 */
export const deleteArticle = async (id) => {
  const result = await query(
    `DELETE FROM articles WHERE id = $1 RETURNING id`,
    [id]
  )

  return result.rows.length > 0
}
