/**
 * Family Member Routes
 * 
 * Public read endpoints and protected write endpoints for family member management.
 */

import express from 'express'
import * as familyController from '../controllers/familyController.js'
import { authenticateToken, requireEditor } from '../middleware/auth.js'
import { validate } from '../validators/schemas.js'
import { createFamilyMemberSchema, updateFamilyMemberSchema } from '../validators/schemas.js'

const router = express.Router()

/**
 * GET /family-members
 * Public endpoint to get all family members with optional filters
 * Query params: name, birth_year
 */
router.get('/', familyController.getAllFamilyMembers)

/**
 * GET /family-members/search
 * Public endpoint to search family members by name or biography
 * Query params: q (search term)
 */
router.get('/search', familyController.searchFamilyMembers)

/**
 * GET /family-members/:id
 * Public endpoint to get specific family member details
 */
router.get('/:id', familyController.getFamilyMember)

/**
 * GET /family-members/:id/tree
 * Public endpoint to get family tree for a member
 * Returns: parents, spouse, children, siblings, and relatives
 */
router.get('/:id/tree', familyController.getFamilyTree)

/**
 * POST /family-members
 * Protected endpoint to create new family member
 * Requires: authenticateToken, editor+ role
 */
router.post('/', authenticateToken, requireEditor, validate(createFamilyMemberSchema), familyController.createFamilyMember)

/**
 * PUT /family-members/:id
 * Protected endpoint to update family member
 * Requires: authenticateToken, editor+ role
 */
router.put('/:id', authenticateToken, requireEditor, validate(updateFamilyMemberSchema), familyController.updateFamilyMember)

/**
 * POST /family-members/:id/relationships
 * Protected endpoint to create family relationship
 * Requires: authenticateToken, editor+ role
 * Body: related_member_id, relationship_type
 */
router.post('/:id/relationships', authenticateToken, requireEditor, familyController.createFamilyRelationship)

/**
 * DELETE /family-members/:id
 * Protected endpoint to delete family member
 * Requires: authenticateToken, editor+ role
 */
router.delete('/:id', authenticateToken, requireEditor, familyController.deleteFamilyMember)

export default router
