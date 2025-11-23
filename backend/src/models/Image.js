/**
 * Image Model
 * 
 * Database operations for image/media file management.
 */

import { query } from '../database/db.js'

/**
 * Upload/create an image record
 * @param {Object} imageData - Image data
 * @returns {Promise<Object>} Created image record
 */
export const createImage = async (imageData) => {
  const { family_member_id, filename, file_path, file_size, mime_type, uploaded_by, description, is_primary } = imageData

  const result = await query(
    `INSERT INTO images (family_member_id, filename, file_path, file_size, mime_type, uploaded_by, description, is_primary)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
     RETURNING *`,
    [family_member_id, filename, file_path, file_size, mime_type, uploaded_by, description || null, is_primary || false]
  )

  return result.rows[0]
}

/**
 * Get image by ID
 * @param {number} id - Image ID
 * @returns {Promise<Object>} Image record
 */
export const getImageById = async (id) => {
  const result = await query(
    `SELECT * FROM images WHERE id = $1`,
    [id]
  )

  return result.rows[0] || null
}

/**
 * Get all images for a family member
 * @param {number} familyMemberId - Family member ID
 * @returns {Promise<Array>} Array of images
 */
export const getImagesByMember = async (familyMemberId) => {
  const result = await query(
    `SELECT * FROM images WHERE family_member_id = $1 ORDER BY is_primary DESC, created_at DESC`,
    [familyMemberId]
  )

  return result.rows
}

/**
 * Get primary image for a family member
 * @param {number} familyMemberId - Family member ID
 * @returns {Promise<Object>} Primary image or null
 */
export const getPrimaryImage = async (familyMemberId) => {
  const result = await query(
    `SELECT * FROM images WHERE family_member_id = $1 AND is_primary = true LIMIT 1`,
    [familyMemberId]
  )

  return result.rows[0] || null
}

/**
 * Update image record
 * @param {number} id - Image ID
 * @param {Object} updateData - Data to update
 * @returns {Promise<Object>} Updated image
 */
export const updateImage = async (id, updateData) => {
  const { description, is_primary } = updateData

  const result = await query(
    `UPDATE images
     SET description = COALESCE($1, description),
         is_primary = COALESCE($2, is_primary),
         updated_at = CURRENT_TIMESTAMP
     WHERE id = $3
     RETURNING *`,
    [description, is_primary, id]
  )

  return result.rows[0]
}

/**
 * Delete image
 * @param {number} id - Image ID
 * @returns {Promise<boolean>} Success status
 */
export const deleteImage = async (id) => {
  const result = await query(
    `DELETE FROM images WHERE id = $1 RETURNING id`,
    [id]
  )

  return result.rows.length > 0
}

/**
 * Set primary image for a family member
 * Unsets previous primary image
 * @param {number} familyMemberId - Family member ID
 * @param {number} imageId - Image ID to set as primary
 * @returns {Promise<Object>} Updated image
 */
export const setPrimaryImage = async (familyMemberId, imageId) => {
  // First, unset any previous primary images
  await query(
    `UPDATE images SET is_primary = false WHERE family_member_id = $1`,
    [familyMemberId]
  )

  // Then set the new primary image
  const result = await query(
    `UPDATE images SET is_primary = true WHERE id = $1 AND family_member_id = $2 RETURNING *`,
    [imageId, familyMemberId]
  )

  return result.rows[0]
}

/**
 * Get image by filename
 * @param {string} filename - Filename
 * @returns {Promise<Object>} Image record
 */
export const getImageByFilename = async (filename) => {
  const result = await query(
    `SELECT * FROM images WHERE filename = $1`,
    [filename]
  )

  return result.rows[0] || null
}
