/**
 * Kurpejovica Enciklopedija Backend Server
 * 
 * Main entry point for the Express.js REST API server.
 * Configures middleware, routes, and error handling.
 * 
 * Environment variables required:
 * - PORT: Server port (default: 3000)
 * - DB_HOST, DB_PORT, DB_NAME, DB_USER, DB_PASSWORD: Database configuration
 * - JWT_SECRET: Secret key for JWT token signing
 * - DEEPL_API_KEY: API key for DeepL translation service
 * - CORS_ORIGIN: Allowed CORS origin (default: http://localhost:5173)
 */

import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import 'express-async-errors'

// Import routes
import authRoutes from './routes/authRoutes.js'
import familyRoutes from './routes/familyRoutes.js'
import articleRoutes from './routes/articleRoutes.js'
import imageRoutes from './routes/imageRoutes.js'

// Import middleware
import { errorHandler } from './middleware/errorHandler.js'

// Load environment variables
dotenv.config()

// Initialize Express app
const app = express()
const PORT = process.env.PORT || 3000

// ============================================
// MIDDLEWARE
// ============================================

/**
 * CORS Middleware - Allow requests from frontend
 * Configured to allow credentials (cookies, auth headers)
 */
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  credentials: true,
  optionsSuccessStatus: 200,
}))

/**
 * Body Parser Middleware - Parse incoming JSON requests
 */
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ limit: '10mb', extended: true }))

/**
 * Request Logging Middleware - Log all incoming requests
 */
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} ${req.method} ${req.path}`)
  next()
})

/**
 * Static Files - Serve uploaded images
 */
app.use('/images', express.static('uploads/images'))

// ============================================
// HEALTH CHECK ENDPOINT
// ============================================

/**
 * GET /health
 * Simple health check endpoint to verify server is running
 */
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
  })
})

// ============================================
// API ROUTES
// ============================================

/**
 * API Routes - Mounted at /api path for better organization
 */
app.use('/api/auth', authRoutes)
app.use('/api/family-members', familyRoutes)
app.use('/api/articles', articleRoutes)
app.use('/api/images', imageRoutes)

// ============================================
// 404 HANDLER
// ============================================

/**
 * Catch-all route for undefined endpoints
 */
app.use((req, res) => {
  res.status(404).json({
    error: 'Endpoint not found',
    path: req.path,
    method: req.method,
  })
})

// ============================================
// ERROR HANDLING MIDDLEWARE
// ============================================

/**
 * Global error handler - Must be last middleware
 */
app.use(errorHandler)

// ============================================
// SERVER STARTUP
// ============================================

/**
 * Start the Express server
 */
const server = app.listen(PORT, () => {
  console.log(`
╔════════════════════════════════════════════════════════════╗
║                                                            ║
║   Kurpejovica Enciklopedija Backend Server                ║
║                                                            ║
║   Server running on port: ${PORT}                               ║
║   Environment: ${process.env.NODE_ENV || 'development'}${' '.repeat(35 - (process.env.NODE_ENV || 'development').length)}║
║   Frontend: ${process.env.CORS_ORIGIN || 'http://localhost:5173'}                 ║
║                                                            ║
║   API Endpoints:                                           ║
║   - /api/auth        - Authentication                     ║
║   - /api/family-members - Family management              ║
║   - /api/articles    - Article management                ║
║                                                            ║
╚════════════════════════════════════════════════════════════╝
  `)
})

// ============================================
// GRACEFUL SHUTDOWN
// ============================================

/**
 * Handle graceful shutdown on SIGTERM or SIGINT
 */
process.on('SIGTERM', () => {
  console.log('SIGTERM received. Shutting down gracefully...')
  server.close(() => {
    console.log('Server closed')
    process.exit(0)
  })
})

process.on('SIGINT', () => {
  console.log('SIGINT received. Shutting down gracefully...')
  server.close(() => {
    console.log('Server closed')
    process.exit(0)
  })
})

export default app
