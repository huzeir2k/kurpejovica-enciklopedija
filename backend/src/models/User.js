/**
 * User Model
 * 
 * Database operations for user management.
 */

import { query } from '../database/db.js'
import { hashPassword } from '../utils/password.js'

/**
 * Create a new user
 * @param {Object} userData - User data
 * @returns {Promise<Object>} Created user
 */
export const createUser = async (userData) => {
  const { email, password, name, role } = userData
  const hashedPassword = await hashPassword(password)

  const result = await query(
    `INSERT INTO users (email, password_hash, name, role)
     VALUES ($1, $2, $3, $4)
     RETURNING id, email, name, role, created_at`,
    [email, hashedPassword, name, role || 'viewer']
  )

  return result.rows[0]
}

/**
 * Find user by email
 * @param {string} email - User email
 * @returns {Promise<Object>} User object
 */
export const findUserByEmail = async (email) => {
  const result = await query(
    `SELECT * FROM users WHERE email = $1`,
    [email]
  )
  return result.rows[0]
}

/**
 * Find user by ID
 * @param {number} id - User ID
 * @returns {Promise<Object>} User object
 */
export const findUserById = async (id) => {
  const result = await query(
    `SELECT id, email, name, role, active, created_at FROM users WHERE id = $1`,
    [id]
  )
  return result.rows[0]
}

/**
 * Get all users (admin only)
 * @returns {Promise<Array>} List of users
 */
export const getAllUsers = async () => {
  const result = await query(
    `SELECT id, email, name, role, active, created_at FROM users ORDER BY created_at DESC`
  )
  return result.rows
}

/**
 * Update user role (admin only)
 * @param {number} userId - User ID
 * @param {string} role - New role
 * @returns {Promise<Object>} Updated user
 */
export const updateUserRole = async (userId, role) => {
  const result = await query(
    `UPDATE users SET role = $1, updated_at = CURRENT_TIMESTAMP
     WHERE id = $2
     RETURNING id, email, name, role, active, created_at`,
    [role, userId]
  )
  return result.rows[0]
}

/**
 * Deactivate user (admin only)
 * @param {number} userId - User ID
 * @returns {Promise<Object>} Updated user
 */
export const deactivateUser = async (userId) => {
  const result = await query(
    `UPDATE users SET active = false, updated_at = CURRENT_TIMESTAMP
     WHERE id = $1
     RETURNING id, email, name, role, active, created_at`,
    [userId]
  )
  return result.rows[0]
}
