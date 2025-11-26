/**
 * Family Service
 * 
 * Provides all family member related API operations:
 * - Retrieving family member information
 * - Creating new family members
 * - Updating family member data
 * - Searching for family members
 * - Getting family tree relationships
 * 
 * All methods return promises that resolve with response data
 */

import api from './api'

export const familyService = {
  /**
   * Retrieve a single family member by ID
   * 
   * @async
   * @param {number} id - Family member ID
   * @returns {Promise<Object>} Family member data including:
   *   - id: Unique identifier
   *   - name: Family member's full name
   *   - birth_year: Year of birth
   *   - death_year: Year of death (null if living)
   *   - birth_place: Location of birth
   *   - occupation: Professional occupation
   *   - short_bio: Brief biography
   *   - relationships: Array of family relationships
   * 
   * @example
   * const member = await familyService.getFamilyMember(1)
   * console.log(member.name) // "John Kurpejovic"
   */
  async getFamilyMember(id) {
    const response = await api.get(`/family-members/${id}`)
    return response.data
  },

  /**
   * Retrieve all family members with optional filtering
   * 
   * @async
   * @param {Object} [filters={}] - Optional filtering parameters
   * @param {string} [filters.name] - Filter by family member name
   * @param {number} [filters.birth_year] - Filter by birth year
   * @returns {Promise<Object>} Object containing:
   *   - members: Array of family member objects
   *   - total: Total count of members matching filters
   * 
   * @example
   * const result = await familyService.getAllFamilyMembers()
   * const members = result.members // Array of all family members
   * 
   * @example
   * // Get family members born in 1950
   * const filtered = await familyService.getAllFamilyMembers({ birth_year: 1950 })
   */
  async getAllFamilyMembers(filters = {}) {
    const response = await api.get('/family-members', { params: filters })
    return response.data
  },

  /**
   * Search for family members by name or biography
   * 
   * @async
   * @param {string} query - Search term (name, place, occupation, etc.)
   * @returns {Promise<Object>} Object containing:
   *   - members: Array of matching family members
   *   - query: The search query used
   * 
   * @example
   * const results = await familyService.searchFamilyMembers("Kurpejovic")
   * results.members.forEach(m => console.log(m.name))
   */
  async searchFamilyMembers(query) {
    const response = await api.get('/family-members/search', { params: { q: query } })
    return response.data
  },

  /**
   * Create a new family member
   * 
   * Requires authentication with "editor" or "admin" role
   * 
   * @async
   * @param {Object} data - Family member data
   * @param {string} data.name - Family member's full name (required)
   * @param {number} [data.birth_year] - Year of birth
   * @param {number} [data.death_year] - Year of death (null for living members)
   * @param {string} [data.birth_place] - Location of birth
   * @param {string} [data.occupation] - Professional occupation
   * @param {string} [data.short_bio] - Brief biography (max 1000 chars)
   * @returns {Promise<Object>} Created family member object with assigned ID
   * 
   * @example
   * const newMember = await familyService.createFamilyMember({
   *   name: "Jane Kurpejovic",
   *   birth_year: 1985,
   *   occupation: "Teacher",
   *   short_bio: "A dedicated educator..."
   * })
   * console.log(newMember.id) // Newly assigned ID
   */
  async createFamilyMember(data) {
    const response = await api.post('/family-members', data)
    return response.data
  },

  /**
   * Update an existing family member
   * 
   * Requires authentication with "editor" or "admin" role
   * Only the provided fields are updated; other fields remain unchanged
   * 
   * @async
   * @param {number} id - Family member ID to update
   * @param {Object} data - Fields to update (any combination of)
   * @param {string} [data.name] - Updated name
   * @param {number} [data.birth_year] - Updated birth year
   * @param {number} [data.death_year] - Updated death year
   * @param {string} [data.birth_place] - Updated birth place
   * @param {string} [data.occupation] - Updated occupation
   * @param {string} [data.short_bio] - Updated biography
   * @returns {Promise<Object>} Updated family member object
   * 
   * @example
   * const updated = await familyService.updateFamilyMember(1, {
   *   occupation: "Retired Teacher",
   *   short_bio: "A dedicated educator who has retired..."
   * })
   */
  async updateFamilyMember(id, data) {
    const response = await api.put(`/family-members/${id}`, data)
    return response.data
  },

  /**
   * Get family tree and relationships for a member
   * 
   * Returns all relatives of the specified family member
   * including parents, siblings, children, and spouses
   * 
   * @async
   * @param {number} memberId - Family member ID
   * @returns {Promise<Object>} Object containing:
   *   - relatives: Array of related family members
   *   - relationships: Array of relationship details
   * 
   * @example
   * const tree = await familyService.getFamilyTree(1)
   * tree.relatives.forEach(relative => {
   *   console.log(relative.name, "is a", relative.relationship_type)
   * })
   */
  async getFamilyTree(memberId) {
    const response = await api.get(`/family-members/${memberId}/tree`)
    return response.data
  },

  /**
   * Delete a family member
   * 
   * Requires authentication with "editor" or "admin" role
   * Warning: This will also delete all articles and images associated with the member
   * 
   * @async
   * @param {number} id - Family member ID to delete
   * @returns {Promise<Object>} Deletion confirmation object
   * 
   * @example
   * await familyService.deleteFamilyMember(1)
   * console.log("Member deleted")
   */
  async deleteFamilyMember(id) {
    const response = await api.delete(`/family-members/${id}`)
    return response.data
  },

  /**
   * Create a family relationship between two members
   * 
   * Requires authentication with "editor" or "admin" role
   * 
   * @async
   * @param {number} memberId - Primary family member ID
   * @param {number} relatedMemberId - Related family member ID
   * @param {string} relationshipType - Type of relationship
   *   Valid types: parent, child, spouse, sibling, grandparent, grandchild,
   *               uncle, aunt, cousin, nephew, niece, brother_in_law, 
   *               sister_in_law, father_in_law, mother_in_law
   * @returns {Promise<Object>} Created relationship object
   * 
   * @example
   * await familyService.createFamilyRelationship(1, 2, "parent")
   * // Now member 2 is shown as parent of member 1
   */
  async createFamilyRelationship(memberId, relatedMemberId, relationshipType) {
    const response = await api.post(`/family-members/${memberId}/relationships`, {
      related_member_id: relatedMemberId,
      relationship_type: relationshipType,
    })
    return response.data
  },
}
