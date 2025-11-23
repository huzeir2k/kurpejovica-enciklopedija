/**
 * Password Utility Functions
 * 
 * Handles password hashing and verification using bcryptjs.
 */

import bcrypt from 'bcryptjs'

/**
 * Hash a password for storage
 * @param {string} password - Plain text password
 * @returns {Promise<string>} Hashed password
 */
export const hashPassword = async (password) => {
  const salt = await bcrypt.genSalt(10)
  return bcrypt.hash(password, salt)
}

/**
 * Verify a password against its hash
 * @param {string} password - Plain text password
 * @param {string} hash - Hashed password from database
 * @returns {Promise<boolean>} True if password matches
 */
export const verifyPassword = async (password, hash) => {
  return bcrypt.compare(password, hash)
}
