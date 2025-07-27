const pool = require('../database/connection');

const logActivity = async (userId, action, entityType, entityId, details, ipAddress, userAgent) => {
  try {
    await pool.query(`
      INSERT INTO activity_log (user_id, action, entity_type, entity_id, details, ip_address, user_agent)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
    `, [userId, action, entityType, entityId, JSON.stringify(details), ipAddress, userAgent]);
  } catch (error) {
    console.error('Error logging activity:', error);
    // Don't throw error to avoid breaking main functionality
  }
};

module.exports = { logActivity };