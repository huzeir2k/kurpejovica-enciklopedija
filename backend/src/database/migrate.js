/**
 * Database Migration Script
 * 
 * Run this script to initialize the database schema:
 * npm run migrate
 */

import initializeSchema from './schema.js'

const migrate = async () => {
  try {
    await initializeSchema()
    process.exit(0)
  } catch (error) {
    console.error('Migration failed:', error)
    process.exit(1)
  }
}

migrate()
