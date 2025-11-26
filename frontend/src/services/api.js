/**
 * API Service Configuration
 * 
 * This module sets up Axios with:
 * - Base URL configuration from environment variables
 * - Automatic JWT token injection in request headers
 * - Global 401 error handling (redirects to login)
 * - JSON content type as default
 */

import axios from 'axios'

/**
 * API_BASE_URL: Configured from VITE_API_URL environment variable
 * Defaults to http://localhost:3000/api for development
 * Should be set to backend URL in production via .env.production
 */
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api'

/**
 * Create Axios instance with default configuration
 * - baseURL: All requests are prefixed with /api
 * - Content-Type: application/json for all requests
 */
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

/**
 * Request Interceptor: Automatically attach JWT token to all requests
 * 
 * How it works:
 * 1. Retrieves authToken from localStorage (set during login)
 * 2. If token exists, adds it to Authorization header: "Bearer {token}"
 * 3. Token is validated by backend middleware on protected routes
 * 
 * Routes that require authentication:
 * - POST /family-members (create)
 * - PUT /family-members/:id (update)
 * - DELETE /family-members/:id (delete)
 * - POST /general-articles (create)
 * - PUT /general-articles/:id (update)
 * - DELETE /general-articles/:id (delete)
 */
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('authToken')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

/**
 * Response Interceptor: Handle global errors
 * 
 * Behavior:
 * - On success: Pass response through unchanged
 * - On 401 (Unauthorized): 
 *   1. Remove stored token from localStorage
 *   2. Redirect user to login page
 *   3. This happens when token expires or is invalid
 * - On other errors: Pass error to caller for specific handling
 */
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token is invalid or expired - clear it and redirect
      localStorage.removeItem('authToken')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export default api
