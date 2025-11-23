/**
 * Audit Service
 * 
 * Logs all changes to the database for accountability and history tracking.
 */

import { query } from '../database/db.js'

/**
 * Log a change to the audit log
 * @param {number} userId - ID of user making the change
 * @param {string} tableName - Name of table being modified
 * @param {number} recordId - ID of record being modified
 * @param {string} action - Type of action (INSERT, UPDATE, DELETE)
 * @param {Object} oldValues - Previous values (for updates)
 * @param {Object} newValues - New values
 */
export const logAudit = async (userId, tableName, recordId, action, oldValues, newValues) => {
  try {
    await query(
      `INSERT INTO audit_logs (user_id, table_name, record_id, action, old_values, new_values)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [userId, tableName, recordId, action, JSON.stringify(oldValues), JSON.stringify(newValues)]
    )
  } catch (error) {
    // Log audit errors but don't throw - don't let audit failures break the main operation
    console.error('Failed to log audit:', error)
  }
}

/**
 * Get audit history for a record
 * @param {string} tableName - Name of table
 * @param {number} recordId - ID of record
 * @returns {Promise<Array>} Array of audit log entries
 */
export const getAuditHistory = async (tableName, recordId) => {
  const result = await query(
    `SELECT 
       al.id, al.user_id, u.name as user_name, al.action, 
       al.old_values, al.new_values, al.created_at
     FROM audit_logs al
     LEFT JOIN users u ON al.user_id = u.id
     WHERE al.table_name = $1 AND al.record_id = $2
     ORDER BY al.created_at DESC`,
    [tableName, recordId]
  )
  return result.rows
}
