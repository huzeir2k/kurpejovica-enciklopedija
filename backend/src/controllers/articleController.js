/**
 * Article Controller
 * 
 * Handles article CRUD operations with template support for Wikipedia-style content.
 * Supports translations and admin content management.
 */

import * as Article from '../models/Article.js'
import * as FamilyMember from '../models/FamilyMember.js'
import * as Image from '../models/Image.js'
import { translateText, getSupportedLanguages } from '../services/translationService.js'
import { logAudit } from '../services/auditService.js'

/**
 * Get article by family member and language
 * GET /articles/:id (query param: lang)
 */
export const getArticle = async (req, res, next) => {
  try {
    const { id } = req.params
    const lang = req.query?.lang || 'sr'

    const article = await Article.getArticleByMemberAndLanguage(id, lang)
    
    if (!article) {
      return res.status(404).json({ error: 'Article not found' })
    }

    res.json(article)
  } catch (error) {
    next(error)
  }
}

/**
 * Create new article (Admin only)
 * POST /articles
 */
export const createArticle = async (req, res, next) => {
  try {
    const { family_member_id, language = 'sr', content, template_type } = req.body
    const user_id = req.user.id

    // Validate family member exists
    const member = await FamilyMember.getFamilyMemberById(family_member_id)
    if (!member) {
      return res.status(404).json({ error: 'Family member not found' })
    }

    const articleData = {
      family_member_id,
      language,
      content: content || getDefaultTemplate(template_type),
      created_by: user_id,
    }

    const article = await Article.createArticle(articleData)
    
    // Log the audit
    await logAudit(user_id, 'articles', article.id, 'CREATE', null, articleData)

    res.status(201).json(article)
  } catch (error) {
    next(error)
  }
}

/**
 * Update article (Admin only)
 * PUT /articles/:id
 */
export const updateArticle = async (req, res, next) => {
  try {
    const { id } = req.params
    const { content } = req.body
    const user_id = req.user.id

    // Get existing article
    const article = await Article.getArticleById(id)
    if (!article) {
      return res.status(404).json({ error: 'Article not found' })
    }

    // Update article
    const updated = await Article.updateArticle(id, content, user_id)
    
    // Log the audit
    await logAudit(user_id, 'articles', id, 'UPDATE', { content: article.content }, { content })

    res.json(updated)
  } catch (error) {
    next(error)
  }
}

/**
 * Delete article (Admin only)
 * DELETE /articles/:id
 */
export const deleteArticle = async (req, res, next) => {
  try {
    const { id } = req.params
    const user_id = req.user.id

    const article = await Article.getArticleById(id)
    if (!article) {
      return res.status(404).json({ error: 'Article not found' })
    }

    await Article.deleteArticle(id)
    
    // Log the audit
    await logAudit(user_id, 'articles', id, 'DELETE', article, null)

    res.json({ message: 'Article deleted successfully' })
  } catch (error) {
    next(error)
  }
}

/**
 * Get article version history
 * GET /articles/:id/history
 */
export const getArticleHistory = async (req, res, next) => {
  try {
    const { id } = req.params

    const history = await Article.getArticleHistory(id)
    if (history.length === 0) {
      return res.status(404).json({ error: 'Article not found' })
    }

    res.json({
      article_id: id,
      versions: history,
    })
  } catch (error) {
    next(error)
  }
}

/**
 * Auto-translate article to target language
 * POST /articles/:id/translate
 */
export const translateArticle = async (req, res, next) => {
  try {
    const { id } = req.params
    const { targetLanguage } = req.body
    const user_id = req.user.id

    const article = await Article.getArticleById(id)
    if (!article) {
      return res.status(404).json({ error: 'Article not found' })
    }

    // Translate content
    const translatedContent = await translateText(article.content, article.language, targetLanguage)

    // Create translation entry
    const translation = await Article.addArticleTranslation(
      id,
      targetLanguage,
      translatedContent,
      true,
      user_id
    )

    await logAudit(user_id, 'article_translations', translation.id, 'CREATE', null, translation)

    res.status(201).json(translation)
  } catch (error) {
    next(error)
  }
}

/**
 * Get all translations for an article
 * GET /articles/:id/translations
 */
export const getArticleTranslations = async (req, res, next) => {
  try {
    const { id } = req.params

    const translations = await Article.getArticleTranslations(id)
    res.json(translations)
  } catch (error) {
    next(error)
  }
}

/**
 * Get all articles for a family member
 * GET /articles/member/:memberId
 */
export const getArticlesByMember = async (req, res, next) => {
  try {
    const { memberId } = req.params

    const articles = await Article.getArticlesByMember(memberId)
    res.json(articles)
  } catch (error) {
    next(error)
  }
}

/**
 * Get all supported languages
 * GET /articles/languages
 */
export const getSupportedLanguagesEndpoint = async (req, res) => {
  res.json(getSupportedLanguages())
}

/**
 * Get default template for new article
 * Supports Wikipedia-style templates
 */
function getDefaultTemplate(templateType = 'basic') {
  const templates = {
    basic: `<section class="wiki-section">
  <h2>Biography</h2>
  <p>Write article content here...</p>
</section>`,
    
    infobox: `<div class="wiki-infobox">
  <div class="infobox-title">Family Information</div>
  <table class="infobox-table">
    <tr><td class="label">Born:</td><td>Date and place</td></tr>
    <tr><td class="label">Died:</td><td>Date and place</td></tr>
    <tr><td class="label">Nationality:</td><td>Country</td></tr>
    <tr><td class="label">Occupation:</td><td>Profession</td></tr>
  </table>
</div>

<section class="wiki-section">
  <h2>Early Life</h2>
  <p>Write content here...</p>
</section>

<section class="wiki-section">
  <h2>Career</h2>
  <p>Write content here...</p>
</section>`,
    
    fullFeatured: `<div class="wiki-infobox">
  <div class="infobox-title">Infobox</div>
  <table class="infobox-table">
    <tr><td colspan="2" class="infobox-image">
      <img src="/images/photo.jpg" alt="Image" />
    </td></tr>
    <tr><td class="label">Name:</td><td>Full name</td></tr>
    <tr><td class="label">Born:</td><td>Date and place</td></tr>
    <tr><td class="label">Died:</td><td>Date and place</td></tr>
  </table>
</div>

<section class="wiki-section">
  <h2>Early Life</h2>
  <p>Paragraph 1...</p>
  <p>Paragraph 2...</p>
</section>

<section class="wiki-section">
  <h2>Career</h2>
  <h3>Early career</h3>
  <p>Content...</p>
  
  <h3>Middle period</h3>
  <p>Content...</p>
  
  <h3>Later years</h3>
  <p>Content...</p>
</section>

<section class="wiki-section">
  <h2>Family</h2>
  <p>Family information...</p>
</section>

<section class="wiki-section">
  <h2>Legacy</h2>
  <p>Impact and legacy...</p>
</section>

<section class="wiki-section">
  <h2>See also</h2>
  <ul>
    <li><a href="#">Related person</a></li>
    <li><a href="#">Related event</a></li>
  </ul>
</section>`,
  }

  return templates[templateType] || templates.basic
}
