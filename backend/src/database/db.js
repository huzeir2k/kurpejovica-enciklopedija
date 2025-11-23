/**
 * Database Connection Configuration
 * 
 * This module handles PostgreSQL connection using the pg library.
 * It exports a query function for executing SQL and a pool for transactions.
 */

import pkg from 'pg'
import dotenv from 'dotenv'

dotenv.config()

const { Pool } = pkg

// Create connection pool for managing multiple database connections
const pool = new Pool({
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
})

// Handle connection errors
pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err)
})

/**
 * Execute a query on the database
 * @param {string} text - SQL query string
 * @param {array} params - Query parameters for prepared statements
 * @returns {Promise} Query result
 */
export const query = (text, params) => {
  return pool.query(text, params)
}

/**
 * Get a client from the pool for transaction management
 * @returns {Promise} Database client
 */
export const getClient = () => {
  return pool.connect()
}

export default pool
