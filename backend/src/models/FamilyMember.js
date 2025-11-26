/**
 * Family Member Model
 * 
 * Database operations for family member management and relationships.
 */

import { query } from '../database/db.js'

/**
 * Create a new family member
 * @param {Object} memberData - Family member data
 * @returns {Promise<Object>} Created member
 */
export const createFamilyMember = async (memberData) => {
  const { name, birth_year, death_year, birth_place, occupation, short_bio } = memberData

  const result = await query(
    `INSERT INTO family_members (name, birth_year, death_year, birth_place, occupation, short_bio)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING *`,
    [name, birth_year, death_year, birth_place, occupation, short_bio]
  )

  return result.rows[0]
}

/**
 * Get family member by ID
 * @param {number} id - Member ID
 * @returns {Promise<Object>} Family member with relationships
 */
export const getFamilyMemberById = async (id) => {
  const result = await query(
    `SELECT * FROM family_members WHERE id = $1`,
    [id]
  )

  if (!result.rows[0]) {
    return null
  }

  const member = result.rows[0]

  // Get all relationships for this member
  const relationships = await query(
    `SELECT 
       fm.id, fm.name, fr.relationship_type
     FROM family_relationships fr
     JOIN family_members fm ON fr.related_member_id = fm.id
     WHERE fr.member_id = $1
     UNION
     SELECT 
       fm.id, fm.name, fr.relationship_type
     FROM family_relationships fr
     JOIN family_members fm ON fr.member_id = fm.id
     WHERE fr.related_member_id = $1`,
    [id]
  )

  member.relationships = relationships.rows
  return member
}

/**
 * Get all family members
 * @param {Object} filters - Filter options
 * @returns {Promise<Array>} List of family members
 */
export const getAllFamilyMembers = async (filters = {}) => {
  let sql = `SELECT * FROM family_members`
  const params = []
  let paramCount = 0

  // Add filters if provided
  const whereClauses = []
  if (filters.name) {
    whereClauses.push(`name ILIKE $${++paramCount}`)
    params.push(`%${filters.name}%`)
  }
  if (filters.birth_year) {
    whereClauses.push(`birth_year = $${++paramCount}`)
    params.push(filters.birth_year)
  }

  if (whereClauses.length > 0) {
    sql += ` WHERE ${whereClauses.join(' AND ')}`
  }

  sql += ` ORDER BY name ASC`

  const result = await query(sql, params)
  return result.rows
}

/**
 * Search family members by name or bio
 * @param {string} searchTerm - Search term
 * @returns {Promise<Array>} Matching family members
 */
export const searchFamilyMembers = async (searchTerm) => {
  const result = await query(
    `SELECT * FROM family_members 
     WHERE name ILIKE $1 OR short_bio ILIKE $1
     ORDER BY name ASC`,
    [`%${searchTerm}%`]
  )
  return result.rows
}

/**
 * Update family member
 * @param {number} id - Member ID
 * @param {Object} updates - Fields to update
 * @returns {Promise<Object>} Updated member
 */
export const updateFamilyMember = async (id, updates) => {
  const updateFields = []
  const values = []
  let paramCount = 1

  Object.entries(updates).forEach(([key, value]) => {
    updateFields.push(`${key} = $${paramCount++}`)
    values.push(value)
  })

  values.push(id)

  const result = await query(
    `UPDATE family_members
     SET ${updateFields.join(', ')}, updated_at = CURRENT_TIMESTAMP
     WHERE id = $${paramCount}
     RETURNING *`,
    values
  )

  return result.rows[0]
}

/**
 * Get family tree for a member (parents, spouse, children, siblings)
 * @param {number} memberId - Member ID
 * @returns {Promise<Object>} Family tree structure
 */
export const getFamilyTree = async (memberId) => {
  const result = await query(
    `SELECT 
       fm.id, fm.name, fm.birth_year, fm.death_year,
       fr.relationship_type
     FROM family_members fm
     LEFT JOIN family_relationships fr ON (
       (fr.member_id = $1 AND fr.related_member_id = fm.id) OR
       (fr.related_member_id = $1 AND fr.member_id = fm.id)
     )
     WHERE fm.id != $1
     ORDER BY fm.name ASC`,
    [memberId]
  )

  const tree = {
    parents: [],
    spouse: null,
    children: [],
    siblings: [],
    relatives: [],
  }

  result.rows.forEach(row => {
    const member = { id: row.id, name: row.name, birth_year: row.birth_year, death_year: row.death_year }
    
    switch (row.relationship_type) {
      case 'parent':
        tree.parents.push(member)
        break
      case 'spouse':
        tree.spouse = member
        break
      case 'child':
        tree.children.push(member)
        break
      case 'sibling':
        tree.siblings.push(member)
        break
      default:
        tree.relatives.push(member)
    }
  })

  return tree
}

/**
 * Create a family relationship
 * @param {number} memberId - Member ID
 * @param {number} relatedMemberId - Related member ID
 * @param {string} relationshipType - Type of relationship
 * @returns {Promise<Object>} Created relationship
 */
export const createFamilyRelationship = async (memberId, relatedMemberId, relationshipType) => {
  const result = await query(
    `INSERT INTO family_relationships (member_id, related_member_id, relationship_type)
     VALUES ($1, $2, $3)
     RETURNING *`,
    [memberId, relatedMemberId, relationshipType]
  )
  return result.rows[0]
}

/**
 * Delete a family member
 * @param {number} id - Member ID
 * @returns {Promise<void>}
 */
export const deleteFamilyMember = async (id) => {
  try {
    // Delete all relationships involving this member
    await query(
      `DELETE FROM family_relationships 
       WHERE member_id = $1 OR related_member_id = $1`,
      [id]
    )
  } catch (err) {
    // Table may not exist yet, continue
  }

  // Delete all articles for this member (and article translations cascade)
  await query(
    `DELETE FROM articles WHERE family_member_id = $1`,
    [id]
  )

  // Delete the family member
  await query(
    `DELETE FROM family_members WHERE id = $1`,
    [id]
  )
}
