/**
 * General Article Routes
 * 
 * Public read endpoints and protected admin write endpoints for standalone articles.
 */

import express from 'express'
import * as generalArticleController from '../controllers/generalArticleController.js'
import { authenticateToken, requireAdmin } from '../middleware/auth.js'

const router = express.Router()

/**
 * GET /general-articles
 * Public endpoint to get all articles with optional filtering
 * Query params: category, sortBy, order
 */
router.get('/', generalArticleController.getAllArticles)

/**
 * GET /general-articles/categories
 * Public endpoint to get all unique categories
 */
router.get('/categories', generalArticleController.getCategories)

/**
 * GET /general-articles/:id
 * Public endpoint to get single article by ID
 */
router.get('/:id', generalArticleController.getArticle)

/**
 * POST /general-articles
 * Protected admin endpoint to create new article
 * Body: title, category (optional), content
 */
router.post('/', authenticateToken, requireAdmin, generalArticleController.createArticle)

/**
 * PUT /general-articles/:id
 * Protected admin endpoint to update article
 * Body: title (optional), category (optional), content (optional)
 */
router.put('/:id', authenticateToken, requireAdmin, generalArticleController.updateArticle)

/**
 * DELETE /general-articles/:id
 * Protected admin endpoint to delete article
 */
router.delete('/:id', authenticateToken, requireAdmin, generalArticleController.deleteArticle)

export default router
