/**
 * Database Schema Initialization
 * 
 * This script creates all necessary tables for the family encyclopedia:
 * - users: Store user accounts with authentication
 * - family_members: Core family data with relationships
 * - articles: Article content for each family member
 * - article_translations: Translated article content
 * - audit_logs: Track all edits for accountability
 */

import { query } from './db.js'

const initializeSchema = async () => {
  try {
    console.log('Creating database tables...')

    // Users table - for authentication and access control
    await query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        name VARCHAR(255) NOT NULL,
        role VARCHAR(50) DEFAULT 'viewer',
        active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
      
      CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
    `)

    // Family members table - core family tree data
    await query(`
      CREATE TABLE IF NOT EXISTS family_members (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        birth_year INTEGER,
        death_year INTEGER,
        birth_place VARCHAR(255),
        occupation VARCHAR(255),
        short_bio TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
      
      CREATE INDEX IF NOT EXISTS idx_family_members_name ON family_members(name);
    `)

    // Family relationships table - define connections between family members
    await query(`
      CREATE TABLE IF NOT EXISTS family_relationships (
        id SERIAL PRIMARY KEY,
        member_id INTEGER NOT NULL REFERENCES family_members(id) ON DELETE CASCADE,
        related_member_id INTEGER NOT NULL REFERENCES family_members(id) ON DELETE CASCADE,
        relationship_type VARCHAR(50) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
      
      CREATE INDEX IF NOT EXISTS idx_family_relationships_member ON family_relationships(member_id);
      CREATE INDEX IF NOT EXISTS idx_family_relationships_related ON family_relationships(related_member_id);
    `)

    // Articles table - content for each family member
    await query(`
      CREATE TABLE IF NOT EXISTS articles (
        id SERIAL PRIMARY KEY,
        family_member_id INTEGER NOT NULL UNIQUE REFERENCES family_members(id) ON DELETE CASCADE,
        language VARCHAR(10) NOT NULL DEFAULT 'sr',
        content TEXT,
        created_by INTEGER REFERENCES users(id),
        updated_by INTEGER REFERENCES users(id),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
      
      CREATE UNIQUE INDEX IF NOT EXISTS idx_articles_member_lang ON articles(family_member_id, language);
    `)

    // Article translations table - manage multiple language versions
    await query(`
      CREATE TABLE IF NOT EXISTS article_translations (
        id SERIAL PRIMARY KEY,
        article_id INTEGER NOT NULL REFERENCES articles(id) ON DELETE CASCADE,
        language VARCHAR(10) NOT NULL,
        title VARCHAR(255),
        content TEXT,
        is_auto_translated BOOLEAN DEFAULT false,
        created_by INTEGER REFERENCES users(id),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
      
      CREATE UNIQUE INDEX IF NOT EXISTS idx_translations_article_lang ON article_translations(article_id, language);
    `)

    // Audit logs table - track all changes for accountability
    await query(`
      CREATE TABLE IF NOT EXISTS audit_logs (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id),
        table_name VARCHAR(100) NOT NULL,
        record_id INTEGER NOT NULL,
        action VARCHAR(50) NOT NULL,
        old_values JSONB,
        new_values JSONB,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
      
      CREATE INDEX IF NOT EXISTS idx_audit_logs_user ON audit_logs(user_id);
      CREATE INDEX IF NOT EXISTS idx_audit_logs_table_record ON audit_logs(table_name, record_id);
      CREATE INDEX IF NOT EXISTS idx_audit_logs_created ON audit_logs(created_at);
    `)

    // Images table - store media files for articles
    await query(`
      CREATE TABLE IF NOT EXISTS images (
        id SERIAL PRIMARY KEY,
        family_member_id INTEGER REFERENCES family_members(id) ON DELETE CASCADE,
        article_id INTEGER REFERENCES general_articles(id) ON DELETE CASCADE,
        filename VARCHAR(255) NOT NULL,
        file_path VARCHAR(255) NOT NULL,
        file_size INTEGER,
        mime_type VARCHAR(100),
        uploaded_by INTEGER REFERENCES users(id),
        description TEXT,
        caption TEXT,
        width INTEGER,
        height INTEGER,
        display_width VARCHAR(50) DEFAULT '100%',
        alt_text VARCHAR(255),
        is_primary BOOLEAN DEFAULT false,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
      
      CREATE INDEX IF NOT EXISTS idx_images_member ON images(family_member_id);
      CREATE INDEX IF NOT EXISTS idx_images_article ON images(article_id);
      CREATE INDEX IF NOT EXISTS idx_images_filename ON images(filename);
    `)

    // General articles table - for standalone articles not tied to family members
    await query(`
      CREATE TABLE IF NOT EXISTS general_articles (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        category VARCHAR(100),
        content TEXT NOT NULL,
        created_by INTEGER NOT NULL REFERENCES users(id),
        updated_by INTEGER REFERENCES users(id),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
      
      CREATE INDEX IF NOT EXISTS idx_general_articles_title ON general_articles(title);
      CREATE INDEX IF NOT EXISTS idx_general_articles_category ON general_articles(category);
      CREATE INDEX IF NOT EXISTS idx_general_articles_created ON general_articles(created_at);
    `)

    console.log('✓ Database schema created successfully')
  } catch (error) {
    console.error('Error initializing database schema:', error)
    throw error
  }
}

export default initializeSchema
