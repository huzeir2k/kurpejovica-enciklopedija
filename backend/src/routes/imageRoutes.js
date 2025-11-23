/**
 * Image Routes
 * 
 * Handle file uploads and image management for family members.
 */

import express from 'express'
import { requireAuth, requireAdmin } from '../middleware/auth.js'
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
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB max
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
 * Upload image for a family member
 * POST /images/upload
 * Requires: family_member_id, image file
 */
router.post('/upload', requireAuth, requireAdmin, upload.single('file'), async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' })
    }

    const { family_member_id, description, is_primary } = req.body

    if (!family_member_id) {
      // Clean up uploaded file
      fs.unlinkSync(req.file.path)
      return res.status(400).json({ error: 'family_member_id is required' })
    }

    const imageData = {
      family_member_id: parseInt(family_member_id),
      filename: req.file.filename,
      file_path: req.file.path,
      file_size: req.file.size,
      mime_type: req.file.mimetype,
      uploaded_by: req.user.id,
      description: description || null,
      is_primary: is_primary === 'true' || is_primary === true,
    }

    const image = await Image.createImage(imageData)

    res.status(201).json({
      message: 'Image uploaded successfully',
      image,
      url: `/images/${image.filename}`,
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
 */
router.get('/member/:memberId', async (req, res, next) => {
  try {
    const { memberId } = req.params

    const images = await Image.getImagesByMember(parseInt(memberId))

    res.json({
      family_member_id: parseInt(memberId),
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
 */
router.put('/:imageId', requireAuth, requireAdmin, async (req, res, next) => {
  try {
    const { imageId } = req.params
    const { description, is_primary, family_member_id } = req.body

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

    // Otherwise just update description
    const updated = await Image.updateImage(parseInt(imageId), { description })

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
router.delete('/:imageId', requireAuth, requireAdmin, async (req, res, next) => {
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
