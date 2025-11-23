/**
 * Family Member Controller
 * 
 * Handles family member CRUD operations and family tree queries.
 */

import * as FamilyMember from '../models/FamilyMember.js'
import { logAudit } from '../services/auditService.js'

/**
 * Get all family members
 * GET /family-members
 */
export const getAllFamilyMembers = async (req, res, next) => {
  try {
    const { name, birth_year } = req.query

    const filters = {}
    if (name) filters.name = name
    if (birth_year) filters.birth_year = parseInt(birth_year)

    const members = await FamilyMember.getAllFamilyMembers(filters)

    res.json({
      count: members.length,
      members,
    })
  } catch (error) {
    next(error)
  }
}

/**
 * Search family members
 * GET /family-members/search
 */
export const searchFamilyMembers = async (req, res, next) => {
  try {
    const { q } = req.query

    if (!q || q.trim().length < 2) {
      return res.status(400).json({ error: 'Search query must be at least 2 characters' })
    }

    const members = await FamilyMember.searchFamilyMembers(q)

    res.json({
      count: members.length,
      members,
    })
  } catch (error) {
    next(error)
  }
}

/**
 * Get specific family member
 * GET /family-members/:id
 */
export const getFamilyMember = async (req, res, next) => {
  try {
    const { id } = req.params

    const member = await FamilyMember.getFamilyMemberById(id)
    if (!member) {
      return res.status(404).json({ error: 'Family member not found' })
    }

    res.json(member)
  } catch (error) {
    next(error)
  }
}

/**
 * Get family tree for a member
 * GET /family-members/:id/tree
 */
export const getFamilyTree = async (req, res, next) => {
  try {
    const { id } = req.params

    // Verify member exists
    const member = await FamilyMember.getFamilyMemberById(id)
    if (!member) {
      return res.status(404).json({ error: 'Family member not found' })
    }

    const tree = await FamilyMember.getFamilyTree(id)

    res.json({
      member_id: id,
      member_name: member.name,
      ...tree,
    })
  } catch (error) {
    next(error)
  }
}

/**
 * Create family member (editor+ only)
 * POST /family-members
 */
export const createFamilyMember = async (req, res, next) => {
  try {
    const { name, birth_year, death_year, birth_place, occupation, short_bio } = req.body

    const member = await FamilyMember.createFamilyMember({
      name,
      birth_year,
      death_year,
      birth_place,
      occupation,
      short_bio,
    })

    // Log audit
    await logAudit(req.user.id, 'family_members', member.id, 'INSERT', null, member)

    res.status(201).json(member)
  } catch (error) {
    next(error)
  }
}

/**
 * Update family member (editor+ only)
 * PUT /family-members/:id
 */
export const updateFamilyMember = async (req, res, next) => {
  try {
    const { id } = req.params
    const updates = req.body

    // Get old values for audit
    const oldMember = await FamilyMember.getFamilyMemberById(id)
    if (!oldMember) {
      return res.status(404).json({ error: 'Family member not found' })
    }

    // Update member
    const updatedMember = await FamilyMember.updateFamilyMember(id, updates)

    // Log audit
    await logAudit(req.user.id, 'family_members', id, 'UPDATE', oldMember, updatedMember)

    res.json(updatedMember)
  } catch (error) {
    next(error)
  }
}

/**
 * Create family relationship (editor+ only)
 * POST /family-members/:id/relationships
 */
export const createFamilyRelationship = async (req, res, next) => {
  try {
    const { id } = req.params
    const { related_member_id, relationship_type } = req.body

    // Verify both members exist
    const member = await FamilyMember.getFamilyMemberById(id)
    const relatedMember = await FamilyMember.getFamilyMemberById(related_member_id)

    if (!member || !relatedMember) {
      return res.status(404).json({ error: 'One or both family members not found' })
    }

    const relationship = await FamilyMember.createFamilyRelationship(id, related_member_id, relationship_type)

    // Log audit
    await logAudit(req.user.id, 'family_relationships', relationship.id, 'INSERT', null, relationship)

    res.status(201).json(relationship)
  } catch (error) {
    next(error)
  }
}
