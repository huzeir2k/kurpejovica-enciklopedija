/**
 * Authentication Routes
 * 
 * Public and protected endpoints for user authentication and authorization.
 */

import express from 'express'
import * as authController from '../controllers/authController.js'
import { authenticateToken } from '../middleware/auth.js'
import { validate } from '../validators/schemas.js'
import { loginSchema, registerSchema } from '../validators/schemas.js'

const router = express.Router()

/**
 * POST /auth/login
 * Public endpoint for user login
 * Returns JWT token if credentials are valid
 */
router.post('/login', validate(loginSchema), authController.login)

/**
 * GET /auth/me
 * Protected endpoint to get current authenticated user's info
 * Requires: Valid JWT token
 */
router.get('/me', authenticateToken, authController.getCurrentUser)

/**
 * POST /auth/register
 * Endpoint to register a new user (typically used by admin to create users)
 * Returns created user information
 */
router.post('/register', validate(registerSchema), authController.register)

export default router
