/**
 * Authentication Service
 * 
 * Handles all authentication-related operations:
 * - User login and logout
 * - User registration
 * - Token management
 * - User session verification
 * 
 * JWT tokens are stored in localStorage and automatically attached
 * to all API requests by the api.js interceptor
 */

import api from './api'

export const authService = {
  /**
   * Authenticate user with email and password
   * 
   * On successful login:
   * 1. Backend validates credentials against user database
   * 2. JWT token is generated with user info and expiration (default: 7 days)
   * 3. Token is stored in localStorage for automatic inclusion in requests
   * 4. User object with name and role is returned
   * 
   * @async
   * @param {string} email - User's email address
   * @param {string} password - User's password (hashed by backend)
   * @returns {Promise<Object>} Authentication response containing:
   *   - token: JWT token for subsequent requests
   *   - user: Object with id, name, email, role (viewer/editor/admin)
   *   - message: Success message
   * 
   * @throws {Error} If credentials are invalid or user doesn't exist
   * 
   * @example
   * try {
   *   const result = await authService.login("user@example.com", "password123")
   *   console.log(result.user.name) // "John Doe"
   *   console.log(result.user.role) // "editor"
   * } catch (error) {
   *   console.error("Login failed:", error.response.data.error)
   * }
   */
  async login(email, password) {
    const response = await api.post('/auth/login', { email, password })
    if (response.data.token) {
      localStorage.setItem('authToken', response.data.token)
    }
    return response.data
  },

  /**
   * Logout current user
   * 
   * Clears the JWT token from localStorage
   * Frontend automatically redirects to login on next API 401 error
   * 
   * @returns {void}
   * 
   * @example
   * await authService.logout()
   * // Token is now removed and user needs to login again
   */
  async logout() {
    localStorage.removeItem('authToken')
  },

  /**
   * Register a new user account
   * 
   * Creates a new user in the system
   * New users default to "viewer" role and must be promoted to "editor" or "admin"
   * by an existing admin
   * 
   * @async
   * @param {Object} data - Registration data
   * @param {string} data.email - Email address (must be unique)
   * @param {string} data.password - Password (minimum 6 characters)
   * @param {string} data.name - User's full name
   * @returns {Promise<Object>} Registration response containing:
   *   - user: Created user object with id, email, name, role
   *   - message: Success message
   * 
   * @throws {Error} If email already exists or validation fails
   * 
   * @example
   * try {
   *   const result = await authService.register({
   *     email: "newuser@example.com",
   *     password: "securePassword123",
   *     name: "Jane Doe"
   *   })
   *   console.log(result.user.id) // Newly created user ID
   * } catch (error) {
   *   console.error("Registration failed:", error.response.data.error)
   * }
   */
  async register(data) {
    const response = await api.post('/auth/register', data)
    return response.data
  },

  /**
   * Fetch current authenticated user's information
   * 
   * Requires a valid JWT token in localStorage
   * Used to restore user session on page refresh
   * 
   * @async
   * @returns {Promise<Object|null>} Current user object with id, name, email, role
   *                                  or null if not authenticated
   * 
   * @example
   * const user = await authService.getCurrentUser()
   * if (user) {
   *   console.log("Logged in as:", user.name)
   *   console.log("Role:", user.role)
   * } else {
   *   console.log("No active session")
   * }
   */
  async getCurrentUser() {
    try {
      const response = await api.get('/auth/me')
      return response.data
    } catch (error) {
      return null
    }
  },

  /**
   * Retrieve JWT token from storage
   * 
   * Returns the token without validation
   * Token format: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   * 
   * @returns {string|null} JWT token or null if not logged in
   * 
   * @example
   * const token = authService.getToken()
   * if (token) {
   *   console.log("User has valid token")
   * }
   */
  getToken() {
    return localStorage.getItem('authToken')
  },

  /**
   * Check if a user is currently authenticated
   * 
   * Simple check: returns true if authToken exists in localStorage
   * Does not validate token expiration (backend will reject if expired)
   * 
   * @returns {boolean} true if authToken exists, false otherwise
   * 
   * @example
   * if (authService.isAuthenticated()) {
   *   // Show protected routes
   * } else {
   *   // Redirect to login
   * }
   */
  isAuthenticated() {
    return !!this.getToken()
  },
}
