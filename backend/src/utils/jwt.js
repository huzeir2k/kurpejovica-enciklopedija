/**
 * JWT Utility Functions
 * 
 * Handles token generation and verification.
 */

import jwt from 'jsonwebtoken'

/**
 * Generate a JWT token for a user
 * @param {Object} user - User object with id, email, role
 * @returns {string} JWT token
 */
export const generateToken = (user) => {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRE || '7d' }
  )
}

/**
 * Verify a JWT token
 * @param {string} token - JWT token to verify
 * @returns {Object} Decoded token data
 */
export const verifyToken = (token) => {
  return jwt.verify(token, process.env.JWT_SECRET)
}
