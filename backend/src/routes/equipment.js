const express = require('express');
const pool = require('../database/connection');
const { authenticateToken } = require('../middleware/auth');
const { logActivity } = require('../utils/activityLogger');

const router = express.Router();

// Get all equipment with filters
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { 
      site_id, 
      building_id, 
      domain_id, 
      search, 
      status = 'active',
      page = 1, 
      limit = 50 
    } = req.query;

    let query = `
      SELECT 
        e.*,
        b.name as building_name,
        s.name as site_name,
        c.name as client_name,
        td.name as domain_name,
        td.color as domain_color,
        (
          SELECT COUNT(*) 
          FROM audits a 
          WHERE a.equipment_id = e.id
        ) as audit_count,
        (
          SELECT audit_date 
          FROM audits a 
          WHERE a.equipment_id = e.id 
          ORDER BY audit_date DESC 
          LIMIT 1
        ) as last_audit_date,
        (
          SELECT overall_status 
          FROM audits a 
          WHERE a.equipment_id = e.id 
          ORDER BY audit_date DESC 
          LIMIT 1
        ) as last_audit_status
      FROM equipment e
      JOIN buildings b ON e.building_id = b.id
      JOIN sites s ON b.site_id = s.id
      JOIN clients c ON s.client_id = c.id
      LEFT JOIN technical_domains td ON e.domain_id = td.id
      WHERE e.status = $1
      AND e.building_id IS NOT NULL
    `;

    const params = [status];
    let paramCount = 1;

    if (site_id) {
      paramCount++;
      query += ` AND s.id = $${paramCount}`;
      params.push(site_id);
    }

    if (building_id) {
      paramCount++;
      query += ` AND e.building_id = $${paramCount}`;
      params.push(building_id);
    }

    if (domain_id) {
      paramCount++;
      query += ` AND e.domain_id = $${paramCount}`;
      params.push(domain_id);
    }

    if (search) {
      paramCount++;
      query += ` AND (e.reference ILIKE $${paramCount} OR e.type ILIKE $${paramCount} OR e.location ILIKE $${paramCount})`;
      params.push(`%${search}%`);
    }

    query += ` ORDER BY e.created_at DESC LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}`;
    params.push(limit, (page - 1) * limit);

    const result = await pool.query(query, params);

    // Get total count
    let countQuery = `
      SELECT COUNT(*) 
      FROM equipment e
      JOIN buildings b ON e.building_id = b.id
      JOIN sites s ON b.site_id = s.id
      WHERE e.status = $1
      AND e.building_id IS NOT NULL
    `;
    const countParams = [status];
    let countParamCount = 1;

    if (site_id) {
      countParamCount++;
      countQuery += ` AND s.id = $${countParamCount}`;
      countParams.push(site_id);
    }

    if (building_id) {
      countParamCount++;
      countQuery += ` AND e.building_id = $${countParamCount}`;
      countParams.push(building_id);
    }

    if (domain_id) {
      countParamCount++;
      countQuery += ` AND e.domain_id = $${countParamCount}`;
      countParams.push(domain_id);
    }

    if (search) {
      countParamCount++;
      countQuery += ` AND (e.reference ILIKE $${countParamCount} OR e.type ILIKE $${countParamCount} OR e.location ILIKE $${countParamCount})`;
      countParams.push(`%${search}%`);
    }

    const countResult = await pool.query(countQuery, countParams);
    const total = parseInt(countResult.rows[0].count);

    res.json({
      equipment: result.rows,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching equipment:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get equipment by ID
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(`
      SELECT 
        e.*,
        b.name as building_name,
        s.name as site_name,
        c.name as client_name,
        td.name as domain_name,
        td.color as domain_color
      FROM equipment e
      JOIN buildings b ON e.building_id = b.id
      JOIN sites s ON b.site_id = s.id
      JOIN clients c ON s.client_id = c.id
      LEFT JOIN technical_domains td ON e.domain_id = td.id
      WHERE e.id = $1
    `, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Equipment not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching equipment:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create new equipment
router.post('/', authenticateToken, async (req, res) => {
  try {
    const {
      reference,
      building_id,
      domain_id,
      type,
      brand,
      model,
      serial_number,
      location,
      installation_date,
      warranty_end_date,
      maintenance_frequency,
      notes,
      local_id
    } = req.body;

    // Check if reference already exists
    const existingResult = await pool.query(
      'SELECT id FROM equipment WHERE reference = $1',
      [reference]
    );

    if (existingResult.rows.length > 0) {
      return res.status(400).json({ error: 'Equipment reference already exists' });
    }

    const result = await pool.query(`
      INSERT INTO equipment (
        reference, building_id, local_id, domain_id, type, brand, model, 
        serial_number, location, installation_date, warranty_end_date,
        maintenance_frequency, notes, created_by
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
      RETURNING *
    `, [
      reference, building_id, local_id, domain_id, type, brand, model,
      serial_number, location, installation_date, warranty_end_date,
      maintenance_frequency, notes, req.user.id
    ]);

    // Log activity
    await logActivity(req.user.id, 'CREATE_EQUIPMENT', 'equipment', result.rows[0].id, {
      reference,
      type,
      location
    }, req.ip, req.get('User-Agent'));

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating equipment:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update equipment
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const {
      reference,
      building_id,
      domain_id,
      type,
      brand,
      model,
      serial_number,
      location,
      installation_date,
      warranty_end_date,
      maintenance_frequency,
      notes,
      status
    } = req.body;

    // Check if equipment exists
    const existingResult = await pool.query('SELECT * FROM equipment WHERE id = $1', [id]);
    if (existingResult.rows.length === 0) {
      return res.status(404).json({ error: 'Equipment not found' });
    }

    const result = await pool.query(`
      UPDATE equipment SET
        reference = $1,
        building_id = $2,
        domain_id = $3,
        type = $4,
        brand = $5,
        model = $6,
        serial_number = $7,
        location = $8,
        installation_date = $9,
        warranty_end_date = $10,
        maintenance_frequency = $11,
        notes = $12,
        status = $13,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $14
      RETURNING *
    `, [
      reference, building_id, domain_id, type, brand, model,
      serial_number, location, installation_date, warranty_end_date,
      maintenance_frequency, notes, status, id
    ]);

    // Log activity
    await logActivity(req.user.id, 'UPDATE_EQUIPMENT', 'equipment', id, {
      reference,
      changes: req.body
    }, req.ip, req.get('User-Agent'));

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating equipment:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete equipment
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    // Check if equipment exists
    const existingResult = await pool.query('SELECT reference FROM equipment WHERE id = $1', [id]);
    if (existingResult.rows.length === 0) {
      return res.status(404).json({ error: 'Equipment not found' });
    }

    await pool.query('DELETE FROM equipment WHERE id = $1', [id]);

    // Log activity
    await logActivity(req.user.id, 'DELETE_EQUIPMENT', 'equipment', id, {
      reference: existingResult.rows[0].reference
    }, req.ip, req.get('User-Agent'));

    res.json({ message: 'Equipment deleted successfully' });
  } catch (error) {
    console.error('Error deleting equipment:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Duplicate equipment
router.post('/:id/duplicate', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { new_reference, new_location } = req.body;

    // Get original equipment
    const originalResult = await pool.query('SELECT * FROM equipment WHERE id = $1', [id]);
    if (originalResult.rows.length === 0) {
      return res.status(404).json({ error: 'Equipment not found' });
    }

    const original = originalResult.rows[0];

    // Check if new reference already exists
    const existingResult = await pool.query(
      'SELECT id FROM equipment WHERE reference = $1',
      [new_reference]
    );

    if (existingResult.rows.length > 0) {
      return res.status(400).json({ error: 'New equipment reference already exists' });
    }

    // Create duplicate
    const result = await pool.query(`
      INSERT INTO equipment (
        reference, building_id, domain_id, type, brand, model, 
        serial_number, location, maintenance_frequency, notes, created_by
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      RETURNING *
    `, [
      new_reference,
      original.building_id,
      original.domain_id,
      original.type,
      original.brand,
      original.model,
      null, // Clear serial number for duplicate
      new_location,
      original.maintenance_frequency,
      original.notes,
      req.user.id
    ]);

    // Log activity
    await logActivity(req.user.id, 'DUPLICATE_EQUIPMENT', 'equipment', result.rows[0].id, {
      original_reference: original.reference,
      new_reference,
      new_location
    }, req.ip, req.get('User-Agent'));

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error duplicating equipment:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;