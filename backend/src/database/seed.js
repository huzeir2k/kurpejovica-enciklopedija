/**
 * Database Seed Script
 * 
 * Populates the database with sample family member data for testing.
 * Run this script after migration:
 * npm run seed
 */

import { query } from './db.js'
import bcrypt from 'bcryptjs'

const seedDatabase = async () => {
  try {
    console.log('Seeding database with sample data...')

    // Create sample user (admin)
    const hashedPassword = await bcrypt.hash('admin123', 10)
    await query(
      `INSERT INTO users (email, password_hash, name, role) 
       VALUES ($1, $2, $3, $4)
       ON CONFLICT DO NOTHING`,
      ['admin@family.local', hashedPassword, 'Administrator', 'admin']
    )

    // Create sample family members
    const members = [
      { name: 'Marko Kurpejović', birth_year: 1920, death_year: 1995, occupation: 'Farmer' },
      { name: 'Milica Kurpejović', birth_year: 1925, death_year: 2000, occupation: 'Housewife' },
      { name: 'Jovan Kurpejović', birth_year: 1950, death_year: null, occupation: 'Teacher' },
      { name: 'Dragana Kurpejović', birth_year: 1952, death_year: null, occupation: 'Doctor' },
    ]

    const memberResults = []
    for (const member of members) {
      const result = await query(
        `INSERT INTO family_members (name, birth_year, death_year, occupation, short_bio) 
         VALUES ($1, $2, $3, $4, $5)
         RETURNING id`,
        [member.name, member.birth_year, member.death_year, member.occupation, `A member of the Kurpejović family`]
      )
      memberResults.push(result.rows[0])
    }

    // Create sample relationships
    if (memberResults.length >= 2) {
      await query(
        `INSERT INTO family_relationships (member_id, related_member_id, relationship_type) 
         VALUES ($1, $2, $3)`,
        [memberResults[0].id, memberResults[1].id, 'spouse']
      )
    }

    console.log('✓ Database seeded successfully')
  } catch (error) {
    console.error('Error seeding database:', error)
    throw error
  }
}

seedDatabase()
