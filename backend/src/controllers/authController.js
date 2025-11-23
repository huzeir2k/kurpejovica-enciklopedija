/**
 * Authentication Controller
 * 
 * Handles user login, registration, and authentication endpoints.
 */

import * as User from '../models/User.js'
import { generateToken } from '../utils/jwt.js'
import { verifyPassword } from '../utils/password.js'

/**
 * User login endpoint
 * POST /auth/login
 */
export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body

    // Find user by email
    const user = await User.findUserByEmail(email)
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' })
    }

    // Verify password
    const isValidPassword = await verifyPassword(password, user.password_hash)
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid email or password' })
    }

    // Check if user is active
    if (!user.active) {
      return res.status(403).json({ error: 'User account is deactivated' })
    }

    // Generate JWT token
    const token = generateToken(user)

    // Return token and user info (without password)
    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    })
  } catch (error) {
    next(error)
  }
}

/**
 * Get current user info
 * GET /auth/me (requires authentication)
 */
export const getCurrentUser = async (req, res, next) => {
  try {
    const user = await User.findUserById(req.user.id)
    if (!user) {
      return res.status(404).json({ error: 'User not found' })
    }

    res.json(user)
  } catch (error) {
    next(error)
  }
}

/**
 * Register new user (admin only)
 * POST /auth/register
 */
export const register = async (req, res, next) => {
  try {
    const { email, password, name, role } = req.body

    // Check if user already exists
    const existingUser = await User.findUserByEmail(email)
    if (existingUser) {
      return res.status(409).json({ error: 'Email already registered' })
    }

    // Create new user
    const newUser = await User.createUser({
      email,
      password,
      name,
      role: role || 'viewer',
    })

    res.status(201).json({
      message: 'User registered successfully',
      user: newUser,
    })
  } catch (error) {
    next(error)
  }
}
