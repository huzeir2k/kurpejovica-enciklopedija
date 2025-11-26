/**
 * General Article Controller
 * 
 * Handles CRUD operations for standalone articles.
 * Public read endpoints and admin-protected write endpoints.
 */

import * as GeneralArticle from '../models/GeneralArticle.js'
import { logAudit } from '../services/auditService.js'

/**
 * Get all general articles
 * GET /general-articles
 * Public endpoint
 */
export const getAllArticles = async (req, res, next) => {
  try {
    const { category, sortBy, order } = req.query
    const options = {}

    if (category) options.category = category
    if (sortBy) options.sortBy = sortBy
    if (order) options.order = order.toUpperCase()

    const articles = await GeneralArticle.getAllGeneralArticles(options)
    res.json({ articles })
  } catch (error) {
    next(error)
  }
}

/**
 * Get single general article
 * GET /general-articles/:id
 * Public endpoint
 */
export const getArticle = async (req, res, next) => {
  try {
    const { id } = req.params
    const article = await GeneralArticle.getGeneralArticleById(id)

    if (!article) {
      return res.status(404).json({ error: 'Article not found' })
    }

    res.json(article)
  } catch (error) {
    next(error)
  }
}

/**
 * Create new general article
 * POST /general-articles
 * Protected - requires admin role
 */
export const createArticle = async (req, res, next) => {
  try {
    const { title, category, content } = req.body
    const user_id = req.user.id

    if (!title || !content) {
      return res.status(400).json({ error: 'Title and content are required' })
    }

    const articleData = {
      title,
      category: category || null,
      content,
      created_by: user_id,
    }

    const article = await GeneralArticle.createGeneralArticle(articleData)

    // Log the audit
    await logAudit(user_id, 'general_articles', article.id, 'CREATE', null, articleData)

    res.status(201).json(article)
  } catch (error) {
    next(error)
  }
}

/**
 * Update general article
 * PUT /general-articles/:id
 * Protected - requires admin role
 */
export const updateArticle = async (req, res, next) => {
  try {
    const { id } = req.params
    const { title, category, content } = req.body
    const user_id = req.user.id

    // Get existing article
    const article = await GeneralArticle.getGeneralArticleById(id)
    if (!article) {
      return res.status(404).json({ error: 'Article not found' })
    }

    const updateData = {}
    if (title !== undefined) updateData.title = title
    if (category !== undefined) updateData.category = category
    if (content !== undefined) updateData.content = content

    // Update article
    const updated = await GeneralArticle.updateGeneralArticle(id, updateData, user_id)

    // Log the audit
    await logAudit(user_id, 'general_articles', id, 'UPDATE', article, updateData)

    res.json(updated)
  } catch (error) {
    next(error)
  }
}

/**
 * Delete general article
 * DELETE /general-articles/:id
 * Protected - requires admin role
 */
export const deleteArticle = async (req, res, next) => {
  try {
    const { id } = req.params
    const user_id = req.user.id

    const article = await GeneralArticle.getGeneralArticleById(id)
    if (!article) {
      return res.status(404).json({ error: 'Article not found' })
    }

    await GeneralArticle.deleteGeneralArticle(id)

    // Log the audit
    await logAudit(user_id, 'general_articles', id, 'DELETE', article, null)

    res.json({ message: 'Article deleted successfully' })
  } catch (error) {
    next(error)
  }
}

/**
 * Get all categories
 * GET /general-articles/categories
 * Public endpoint
 */
export const getCategories = async (req, res, next) => {
  try {
    const categories = await GeneralArticle.getCategories()
    res.json({ categories })
  } catch (error) {
    next(error)
  }
}
