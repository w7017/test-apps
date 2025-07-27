const express = require('express');
const bcrypt = require('bcryptjs');
const pool = require('../database/connection');
const { authenticateToken, requireRole } = require('../middleware/auth');
const { logActivity } = require('../utils/activityLogger');

const router = express.Router();

// Get all users (admin only)
router.get('/', authenticateToken, requireRole(['administrator']), async (req, res) => {
  try {
    const { page = 1, limit = 50, search, role, status } = req.query;

    let query = `
      SELECT 
        id, email, first_name, last_name, role, is_active, created_at,
        (SELECT COUNT(*) FROM audits WHERE auditor_id = users.id) as audit_count,
        (SELECT MAX(created_at) FROM activity_log WHERE user_id = users.id) as last_activity
      FROM users
      WHERE 1=1
    `;

    const params = [];
    let paramCount = 0;

    if (search) {
      paramCount++;
      query += ` AND (first_name ILIKE $${paramCount} OR last_name ILIKE $${paramCount} OR email ILIKE $${paramCount})`;
      params.push(`%${search}%`);
    }

    if (role) {
      paramCount++;
      query += ` AND role = $${paramCount}`;
      params.push(role);
    }

    if (status) {
      paramCount++;
      query += ` AND is_active = $${paramCount}`;
      params.push(status === 'active');
    }

    query += ` ORDER BY created_at DESC LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}`;
    params.push(limit, (page - 1) * limit);

    const result = await pool.query(query, params);

    // Get total count
    let countQuery = 'SELECT COUNT(*) FROM users WHERE 1=1';
    const countParams = [];
    let countParamCount = 0;

    if (search) {
      countParamCount++;
      countQuery += ` AND (first_name ILIKE $${countParamCount} OR last_name ILIKE $${countParamCount} OR email ILIKE $${countParamCount})`;
      countParams.push(`%${search}%`);
    }

    if (role) {
      countParamCount++;
      countQuery += ` AND role = $${countParamCount}`;
      countParams.push(role);
    }

    if (status) {
      countParamCount++;
      countQuery += ` AND is_active = $${countParamCount}`;
      countParams.push(status === 'active');
    }

    const countResult = await pool.query(countQuery, countParams);
    const total = parseInt(countResult.rows[0].count);

    res.json({
      users: result.rows,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get user by ID
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    // Users can only view their own profile unless they're admin
    if (req.user.role !== 'administrator' && req.user.id !== id) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const result = await pool.query(`
      SELECT 
        id, email, first_name, last_name, role, is_active, created_at,
        (SELECT COUNT(*) FROM audits WHERE auditor_id = $1) as audit_count,
        (SELECT MAX(created_at) FROM activity_log WHERE user_id = $1) as last_activity
      FROM users 
      WHERE id = $1
    `, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create new user (admin only)
router.post('/', authenticateToken, requireRole(['administrator']), async (req, res) => {
  try {
    const { email, password, first_name, last_name, role = 'technician' } = req.body;

    // Check if user already exists
    const existingUser = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
    if (existingUser.rows.length > 0) {
      return res.status(400).json({ error: 'User already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create user
    const result = await pool.query(`
      INSERT INTO users (email, password_hash, first_name, last_name, role)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING id, email, first_name, last_name, role, is_active, created_at
    `, [email, hashedPassword, first_name, last_name, role]);

    const user = result.rows[0];

    // Log activity
    await logActivity(req.user.id, 'CREATE_USER', 'user', user.id, {
      email,
      role,
      created_by: req.user.email
    }, req.ip, req.get('User-Agent'));

    res.status(201).json(user);
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update user
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { email, first_name, last_name, role, is_active } = req.body;

    // Users can only update their own profile unless they're admin
    if (req.user.role !== 'administrator' && req.user.id !== id) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Non-admin users cannot change role or is_active
    let updateFields = ['email', 'first_name', 'last_name'];
    let updateValues = [email, first_name, last_name];

    if (req.user.role === 'administrator') {
      updateFields.push('role', 'is_active');
      updateValues.push(role, is_active);
    }

    const setClause = updateFields.map((field, index) => `${field} = $${index + 1}`).join(', ');
    updateValues.push(id);

    const result = await pool.query(`
      UPDATE users 
      SET ${setClause}, updated_at = CURRENT_TIMESTAMP
      WHERE id = $${updateValues.length}
      RETURNING id, email, first_name, last_name, role, is_active, updated_at
    `, updateValues);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Log activity
    await logActivity(req.user.id, 'UPDATE_USER', 'user', id, {
      updated_fields: updateFields,
      updated_by: req.user.email
    }, req.ip, req.get('User-Agent'));

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Change password
router.put('/:id/password', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { current_password, new_password } = req.body;

    // Users can only change their own password unless they're admin
    if (req.user.role !== 'administrator' && req.user.id !== id) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Get current user
    const userResult = await pool.query('SELECT password_hash FROM users WHERE id = $1', [id]);
    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Verify current password (not required for admin changing other user's password)
    if (req.user.id === id) {
      const isValidPassword = await bcrypt.compare(current_password, userResult.rows[0].password_hash);
      if (!isValidPassword) {
        return res.status(400).json({ error: 'Current password is incorrect' });
      }
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(new_password, 12);

    // Update password
    await pool.query(
      'UPDATE users SET password_hash = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
      [hashedPassword, id]
    );

    // Log activity
    await logActivity(req.user.id, 'CHANGE_PASSWORD', 'user', id, {
      changed_by: req.user.email,
      target_user: id
    }, req.ip, req.get('User-Agent'));

    res.json({ message: 'Password updated successfully' });
  } catch (error) {
    console.error('Error changing password:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete user (admin only)
router.delete('/:id', authenticateToken, requireRole(['administrator']), async (req, res) => {
  try {
    const { id } = req.params;

    // Cannot delete self
    if (req.user.id === id) {
      return res.status(400).json({ error: 'Cannot delete your own account' });
    }

    // Get user info before deletion
    const userResult = await pool.query('SELECT email FROM users WHERE id = $1', [id]);
    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Soft delete by deactivating
    await pool.query('UPDATE users SET is_active = false WHERE id = $1', [id]);

    // Log activity
    await logActivity(req.user.id, 'DELETE_USER', 'user', id, {
      deleted_user_email: userResult.rows[0].email,
      deleted_by: req.user.email
    }, req.ip, req.get('User-Agent'));

    res.json({ message: 'User deactivated successfully' });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get user activity log
router.get('/:id/activity', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { page = 1, limit = 50 } = req.query;

    // Users can only view their own activity unless they're admin
    if (req.user.role !== 'administrator' && req.user.id !== id) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const result = await pool.query(`
      SELECT 
        action, entity_type, entity_id, details, ip_address, created_at
      FROM activity_log 
      WHERE user_id = $1 
      ORDER BY created_at DESC 
      LIMIT $2 OFFSET $3
    `, [id, limit, (page - 1) * limit]);

    res.json({
      activities: result.rows,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit)
      }
    });
  } catch (error) {
    console.error('Error fetching user activity:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;