const express = require('express');
const pool = require('../database/connection');
const { authenticateToken, requireRole } = require('../middleware/auth');
const { logActivity } = require('../utils/activityLogger');

const router = express.Router();

// Get all settings
router.get('/', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT key, value, description, updated_at
      FROM settings 
      ORDER BY key
    `);

    // Convert to key-value object for easier frontend consumption
    const settings = {};
    result.rows.forEach(row => {
      settings[row.key] = {
        value: row.value,
        description: row.description,
        updated_at: row.updated_at
      };
    });

    res.json(settings);
  } catch (error) {
    console.error('Error fetching settings:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get setting by key
router.get('/:key', authenticateToken, async (req, res) => {
  try {
    const { key } = req.params;

    const result = await pool.query(
      'SELECT key, value, description, updated_at FROM settings WHERE key = $1',
      [key]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Setting not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching setting:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update setting
router.put('/:key', authenticateToken, requireRole(['administrator']), async (req, res) => {
  try {
    const { key } = req.params;
    const { value } = req.body;

    const result = await pool.query(`
      UPDATE settings 
      SET value = $1, updated_by = $2, updated_at = CURRENT_TIMESTAMP
      WHERE key = $3
      RETURNING *
    `, [value, req.user.id, key]);

    if (result.rows.length === 0) {
      // Create new setting if it doesn't exist
      const createResult = await pool.query(`
        INSERT INTO settings (key, value, updated_by)
        VALUES ($1, $2, $3)
        RETURNING *
      `, [key, value, req.user.id]);

      // Log activity
      await logActivity(req.user.id, 'CREATE_SETTING', 'setting', key, {
        key,
        value
      }, req.ip, req.get('User-Agent'));

      return res.status(201).json(createResult.rows[0]);
    }

    // Log activity
    await logActivity(req.user.id, 'UPDATE_SETTING', 'setting', key, {
      key,
      new_value: value
    }, req.ip, req.get('User-Agent'));

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating setting:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update multiple settings
router.put('/', authenticateToken, requireRole(['administrator']), async (req, res) => {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');

    const settings = req.body;
    const updatedSettings = [];

    for (const [key, value] of Object.entries(settings)) {
      const result = await client.query(`
        UPDATE settings 
        SET value = $1, updated_by = $2, updated_at = CURRENT_TIMESTAMP
        WHERE key = $3
        RETURNING *
      `, [value, req.user.id, key]);

      if (result.rows.length === 0) {
        // Create new setting if it doesn't exist
        const createResult = await client.query(`
          INSERT INTO settings (key, value, updated_by)
          VALUES ($1, $2, $3)
          RETURNING *
        `, [key, value, req.user.id]);
        updatedSettings.push(createResult.rows[0]);
      } else {
        updatedSettings.push(result.rows[0]);
      }
    }

    await client.query('COMMIT');

    // Log activity
    await logActivity(req.user.id, 'UPDATE_MULTIPLE_SETTINGS', 'settings', null, {
      updated_keys: Object.keys(settings),
      count: Object.keys(settings).length
    }, req.ip, req.get('User-Agent'));

    res.json(updatedSettings);
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error updating settings:', error);
    res.status(500).json({ error: 'Internal server error' });
  } finally {
    client.release();
  }
});

// Delete setting
router.delete('/:key', authenticateToken, requireRole(['administrator']), async (req, res) => {
  try {
    const { key } = req.params;

    const result = await pool.query('DELETE FROM settings WHERE key = $1 RETURNING *', [key]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Setting not found' });
    }

    // Log activity
    await logActivity(req.user.id, 'DELETE_SETTING', 'setting', key, {
      key,
      deleted_value: result.rows[0].value
    }, req.ip, req.get('User-Agent'));

    res.json({ message: 'Setting deleted successfully' });
  } catch (error) {
    console.error('Error deleting setting:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get technical domains
router.get('/domains/technical', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT id, name, code, description, color, is_active
      FROM technical_domains 
      WHERE is_active = true
      ORDER BY name
    `);

    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching technical domains:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create technical domain
router.post('/domains/technical', authenticateToken, requireRole(['administrator']), async (req, res) => {
  try {
    const { name, code, description, color = '#3B82F6' } = req.body;

    // Check if code already exists
    const existingResult = await pool.query('SELECT id FROM technical_domains WHERE code = $1', [code]);
    if (existingResult.rows.length > 0) {
      return res.status(400).json({ error: 'Domain code already exists' });
    }

    const result = await pool.query(`
      INSERT INTO technical_domains (name, code, description, color)
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `, [name, code, description, color]);

    // Log activity
    await logActivity(req.user.id, 'CREATE_TECHNICAL_DOMAIN', 'technical_domain', result.rows[0].id, {
      name,
      code
    }, req.ip, req.get('User-Agent'));

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating technical domain:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update technical domain
router.put('/domains/technical/:id', authenticateToken, requireRole(['administrator']), async (req, res) => {
  try {
    const { id } = req.params;
    const { name, code, description, color, is_active } = req.body;

    const result = await pool.query(`
      UPDATE technical_domains 
      SET name = $1, code = $2, description = $3, color = $4, is_active = $5
      WHERE id = $6
      RETURNING *
    `, [name, code, description, color, is_active, id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Technical domain not found' });
    }

    // Log activity
    await logActivity(req.user.id, 'UPDATE_TECHNICAL_DOMAIN', 'technical_domain', id, {
      name,
      code,
      changes: req.body
    }, req.ip, req.get('User-Agent'));

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating technical domain:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete technical domain
router.delete('/domains/technical/:id', authenticateToken, requireRole(['administrator']), async (req, res) => {
  try {
    const { id } = req.params;

    // Check if domain is used by equipment
    const equipmentResult = await pool.query('SELECT COUNT(*) FROM equipment WHERE domain_id = $1', [id]);
    if (parseInt(equipmentResult.rows[0].count) > 0) {
      return res.status(400).json({ error: 'Cannot delete domain with existing equipment' });
    }

    // Get domain info before deletion
    const domainResult = await pool.query('SELECT name, code FROM technical_domains WHERE id = $1', [id]);
    if (domainResult.rows.length === 0) {
      return res.status(404).json({ error: 'Technical domain not found' });
    }

    await pool.query('DELETE FROM technical_domains WHERE id = $1', [id]);

    // Log activity
    await logActivity(req.user.id, 'DELETE_TECHNICAL_DOMAIN', 'technical_domain', id, {
      name: domainResult.rows[0].name,
      code: domainResult.rows[0].code
    }, req.ip, req.get('User-Agent'));

    res.json({ message: 'Technical domain deleted successfully' });
  } catch (error) {
    console.error('Error deleting technical domain:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get defect types
router.get('/defects/types', authenticateToken, async (req, res) => {
  try {
    const { domain_id } = req.query;

    let query = `
      SELECT 
        dt.*,
        td.name as domain_name
      FROM defect_types dt
      LEFT JOIN technical_domains td ON dt.domain_id = td.id
      WHERE dt.is_active = true
    `;

    const params = [];
    if (domain_id) {
      query += ' AND dt.domain_id = $1';
      params.push(domain_id);
    }

    query += ' ORDER BY dt.name';

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching defect types:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create defect type
router.post('/defects/types', authenticateToken, requireRole(['administrator']), async (req, res) => {
  try {
    const { name, domain_id, severity, description } = req.body;

    const result = await pool.query(`
      INSERT INTO defect_types (name, domain_id, severity, description)
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `, [name, domain_id, severity, description]);

    // Log activity
    await logActivity(req.user.id, 'CREATE_DEFECT_TYPE', 'defect_type', result.rows[0].id, {
      name,
      severity
    }, req.ip, req.get('User-Agent'));

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating defect type:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;