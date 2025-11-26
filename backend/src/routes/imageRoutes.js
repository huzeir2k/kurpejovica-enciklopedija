/**
 * Image Routes
 * 
 * Handle file uploads and image management for family members and articles.
 * Supports image metadata (captions, alt text, display sizing).
 * Limits gallery to 10 images per content box.
 */

import express from 'express'
import { authenticateToken, requireAdmin } from '../middleware/auth.js'
import multer from 'multer'
import path from 'path'
import fs from 'fs'
import * as Image from '../models/Image.js'

const router = express.Router()

// Configure multer for image uploads
const uploadDir = 'uploads/images'
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true })
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir)
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
    cb(null, uniqueSuffix + path.extname(file.originalname))
  }
})

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB max
  fileFilter: (req, file, cb) => {
    const allowedMimes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true)
    } else {
      cb(new Error('Only image files are allowed'))
    }
  }
})

/**
 * Upload image for a family member or article
 * POST /images/upload
 * 
 * Body:
 * - file: Image file (multipart form data)
 * - family_member_id: (optional) Family member ID
 * - article_id: (optional) General article ID
 * - caption: (optional) Image caption text
 * - alt_text: (optional) Alt text for accessibility
 * - description: (optional) Detailed description
 * - display_width: (optional) CSS width (default: 100%)
 * 
 * Note: Either family_member_id or article_id required
 */
router.post('/upload', authenticateToken, requireAdmin, upload.single('file'), async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' })
    }

    const { 
      family_member_id, 
      article_id,
      caption, 
      alt_text, 
      description, 
      display_width 
    } = req.body

    // Require at least one parent (family member or article)
    if (!family_member_id && !article_id) {
      fs.unlinkSync(req.file.path)
      return res.status(400).json({ error: 'Either family_member_id or article_id is required' })
    }

    const imageData = {
      family_member_id: family_member_id ? parseInt(family_member_id) : null,
      article_id: article_id ? parseInt(article_id) : null,
      filename: req.file.filename,
      file_path: req.file.path,
      file_size: req.file.size,
      mime_type: req.file.mimetype,
      uploaded_by: req.user.id,
      caption: caption || null,
      alt_text: alt_text || null,
      description: description || null,
      display_width: display_width || '100%',
    }

    const image = await Image.createImage(imageData)

    res.status(201).json({
      message: 'Image uploaded successfully',
      image: {
        ...image,
        url: `/images/${image.filename}`,
      },
    })
  } catch (error) {
    // Clean up uploaded file on error
    if (req.file) {
      fs.unlinkSync(req.file.path)
    }
    next(error)
  }
})

/**
 * Get images for a family member
 * GET /images/member/:memberId
 * 
 * Returns all images for a family member (limited to 10 for gallery display)
 */
router.get('/member/:memberId', async (req, res, next) => {
  try {
    const { memberId } = req.params

    const images = await Image.getImagesByMember(parseInt(memberId))

    res.json({
      family_member_id: parseInt(memberId),
      count: images.length,
      images: images.slice(0, 10).map(img => ({
        ...img,
        url: `/images/${img.filename}`,
      })),
    })
  } catch (error) {
    next(error)
  }
})

/**
 * Get images for an article
 * GET /images/article/:articleId
 * 
 * Returns all images for an article (limited to 10 for gallery display)
 */
router.get('/article/:articleId', async (req, res, next) => {
  try {
    const { articleId } = req.params

    const images = await Image.getImagesByArticle(parseInt(articleId))

    res.json({
      article_id: parseInt(articleId),
      count: images.length,
      images: images.map(img => ({
        ...img,
        url: `/images/${img.filename}`,
      })),
    })
  } catch (error) {
    next(error)
  }
})

/**
 * Get primary image for a family member
 * GET /images/member/:memberId/primary
 */
router.get('/member/:memberId/primary', async (req, res, next) => {
  try {
    const { memberId } = req.params

    const image = await Image.getPrimaryImage(parseInt(memberId))

    if (!image) {
      return res.status(404).json({ error: 'No primary image found' })
    }

    res.json({
      ...image,
      url: `/images/${image.filename}`,
    })
  } catch (error) {
    next(error)
  }
})

/**
 * Update image metadata
 * PUT /images/:imageId
 * 
 * Body:
 * - caption: Image caption text
 * - alt_text: Alt text for accessibility
 * - description: Detailed description
 * - display_width: CSS width (e.g., "50%", "300px")
 * - is_primary: Whether this is primary image
 * - family_member_id: (required if setting as primary)
 */
router.put('/:imageId', authenticateToken, requireAdmin, async (req, res, next) => {
  try {
    const { imageId } = req.params
    const { caption, alt_text, description, display_width, is_primary, family_member_id } = req.body

    const image = await Image.getImageById(parseInt(imageId))
    if (!image) {
      return res.status(404).json({ error: 'Image not found' })
    }

    // If setting as primary, need family_member_id
    if (is_primary && family_member_id) {
      const updated = await Image.setPrimaryImage(family_member_id, parseInt(imageId))
      return res.json({
        message: 'Image set as primary',
        image: {
          ...updated,
          url: `/images/${updated.filename}`,
        },
      })
    }

    // Update image metadata
    const updated = await Image.updateImage(parseInt(imageId), { 
      caption, 
      alt_text, 
      description, 
      display_width,
    })

    res.json({
      ...updated,
      url: `/images/${updated.filename}`,
    })
  } catch (error) {
    next(error)
  }
})

/**
 * Delete image
 * DELETE /images/:imageId
 */
router.delete('/:imageId', authenticateToken, requireAdmin, async (req, res, next) => {
  try {
    const { imageId } = req.params

    const image = await Image.getImageById(parseInt(imageId))
    if (!image) {
      return res.status(404).json({ error: 'Image not found' })
    }

    // Delete file from disk
    if (fs.existsSync(image.file_path)) {
      fs.unlinkSync(image.file_path)
    }

    // Delete from database
    await Image.deleteImage(parseInt(imageId))

    res.json({ message: 'Image deleted successfully' })
  } catch (error) {
    next(error)
  }
})

export default router
