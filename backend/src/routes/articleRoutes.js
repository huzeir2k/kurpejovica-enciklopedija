/**
 * Article Routes
 * 
 * Public read endpoints and protected write endpoints for article management.
 * Includes translation and version history endpoints with full admin CRUD.
 */

import express from 'express'
import * as articleController from '../controllers/articleController.js'
import { authenticateToken, requireAdmin } from '../middleware/auth.js'
import { validate } from '../validators/schemas.js'
import { createArticleSchema, updateArticleSchema, translateArticleSchema } from '../validators/schemas.js'

const router = express.Router()

/**
 * GET /articles/languages
 * Public endpoint to get list of supported languages
 */
router.get('/languages', articleController.getSupportedLanguagesEndpoint)

/**
 * GET /articles/:id
 * Public endpoint to get article by ID with specific language
 * Query params: lang (language code, defaults to 'sr')
 */
router.get('/:id', articleController.getArticle)

/**
 * GET /articles/:id/history
 * Public endpoint to view article version history
 * Shows all past versions of the article with editor information
 */
router.get('/:id/history', articleController.getArticleHistory)

/**
 * GET /articles/:id/translations
 * Public endpoint to get all translations for an article
 */
router.get('/:id/translations', articleController.getArticleTranslations)

/**
 * GET /articles/member/:memberId
 * Public endpoint to get all articles for a family member
 */
router.get('/member/:memberId', articleController.getArticlesByMember)

/**
 * POST /articles
 * Protected admin endpoint to create new article
 * Requires: authenticateToken, admin role
 * Body: family_member_id, language, content, template_type (optional)
 */
router.post('/', authenticateToken, requireAdmin, articleController.createArticle)

/**
 * PUT /articles/:id
 * Protected admin endpoint to update article content
 * Requires: authenticateToken, admin role
 * Body: content
 */
router.put('/:id', authenticateToken, requireAdmin, articleController.updateArticle)

/**
 * DELETE /articles/:id
 * Protected admin endpoint to delete article
 * Requires: authenticateToken, admin role
 */
router.delete('/:id', authenticateToken, requireAdmin, articleController.deleteArticle)

/**
 * POST /articles/:id/translate
 * Protected admin endpoint to translate article to another language using Google Translate
 * Requires: authenticateToken, admin role
 * Body: targetLanguage
 */
router.post('/:id/translate', authenticateToken, requireAdmin, articleController.translateArticle)

export default router
