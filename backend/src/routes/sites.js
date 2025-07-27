const express = require('express');
const pool = require('../database/connection');
const { authenticateToken, requireRole } = require('../middleware/auth');
const { logActivity } = require('../utils/activityLogger');

const router = express.Router();

// Get all sites
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { client_id, search, page = 1, limit = 50 } = req.query;

    let query = `
      SELECT 
        s.*,
        c.name as client_name,
        COUNT(DISTINCT b.id) as building_count,
        COUNT(DISTINCT e.id) as equipment_count
      FROM sites s
      JOIN clients c ON s.client_id = c.id
      LEFT JOIN buildings b ON s.id = b.site_id
      LEFT JOIN equipment e ON b.id = e.building_id
      WHERE 1=1
    `;

    const params = [];
    let paramCount = 0;

    if (client_id) {
      paramCount++;
      query += ` AND s.client_id = $${paramCount}`;
      params.push(client_id);
    }

    if (search) {
      paramCount++;
      query += ` AND (s.name ILIKE $${paramCount} OR s.code ILIKE $${paramCount} OR c.name ILIKE $${paramCount})`;
      params.push(`%${search}%`);
    }

    query += ` GROUP BY s.id, c.name ORDER BY s.created_at DESC LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}`;
    params.push(limit, (page - 1) * limit);

    const result = await pool.query(query, params);

    res.json({
      sites: result.rows,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit)
      }
    });
  } catch (error) {
    console.error('Error fetching sites:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get site by ID with buildings
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    // Get site details
    const siteResult = await pool.query(`
      SELECT s.*, c.name as client_name
      FROM sites s
      JOIN clients c ON s.client_id = c.id
      WHERE s.id = $1
    `, [id]);

    if (siteResult.rows.length === 0) {
      return res.status(404).json({ error: 'Site not found' });
    }

    // Get buildings
    const buildingsResult = await pool.query(`
      SELECT 
        b.*,
        COUNT(e.id) as equipment_count
      FROM buildings b
      LEFT JOIN equipment e ON b.id = e.building_id
      WHERE b.site_id = $1
      GROUP BY b.id
      ORDER BY b.created_at
    `, [id]);

    const site = siteResult.rows[0];
    site.buildings = buildingsResult.rows;

    res.json(site);
  } catch (error) {
    console.error('Error fetching site:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get buildings for a site
router.get('/:id/buildings', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(`
      SELECT 
        b.*,
        COUNT(e.id) as equipment_count
      FROM buildings b
      LEFT JOIN equipment e ON b.id = e.building_id
      WHERE b.site_id = $1
      GROUP BY b.id
      ORDER BY b.created_at
    `, [id]);

    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching buildings:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Add buildings to a site
router.post('/:id/buildings', authenticateToken, requireRole(['administrator', 'supervisor']), async (req, res) => {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');

    const { id: siteId } = req.params;
    const { buildings } = req.body;

    // Verify site exists
    const siteResult = await client.query('SELECT id FROM sites WHERE id = $1', [siteId]);
    if (siteResult.rows.length === 0) {
      throw new Error('Site not found');
    }

    // Create buildings
    const createdBuildings = [];
    for (const building of buildings) {
      const buildingResult = await client.query(`
        INSERT INTO buildings (site_id, name, floors, description)
        VALUES ($1, $2, $3, $4)
        RETURNING *
      `, [siteId, building.name, building.floors || 1, building.description || '']);
      
      createdBuildings.push(buildingResult.rows[0]);
    }

    await client.query('COMMIT');

    // Log activity
    await logActivity(req.user.id, 'ADD_BUILDINGS_TO_SITE', 'site', siteId, {
      buildings_count: buildings.length,
      building_names: buildings.map(b => b.name)
    }, req.ip, req.get('User-Agent'));

    res.status(201).json({ buildings: createdBuildings });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error adding buildings to site:', error);
    res.status(500).json({ error: error.message || 'Internal server error' });
  } finally {
    client.release();
  }
});

// Create new site with buildings
router.post('/', authenticateToken, requireRole(['administrator', 'supervisor']), async (req, res) => {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');

    const {
      client_id,
      name,
      code,
      address,
      city,
      postal_code,
      country = 'France',
      buildings = []
    } = req.body;

    // Check if site code already exists
    const existingResult = await client.query('SELECT id FROM sites WHERE code = $1', [code]);
    if (existingResult.rows.length > 0) {
      throw new Error('Site code already exists');
    }

    // Create site
    const siteResult = await client.query(`
      INSERT INTO sites (client_id, name, code, address, city, postal_code, country)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *
    `, [client_id, name, code, address, city, postal_code, country]);

    const site = siteResult.rows[0];

    // Create buildings
    const createdBuildings = [];
    for (const building of buildings) {
      const buildingResult = await client.query(`
        INSERT INTO buildings (site_id, name, floors, description)
        VALUES ($1, $2, $3, $4)
        RETURNING *
      `, [site.id, building.name, building.floors || 1, building.description || '']);
      
      createdBuildings.push(buildingResult.rows[0]);
    }

    await client.query('COMMIT');

    // Log activity
    await logActivity(req.user.id, 'CREATE_SITE', 'site', site.id, {
      name,
      code,
      buildings_count: buildings.length
    }, req.ip, req.get('User-Agent'));

    site.buildings = createdBuildings;
    res.status(201).json(site);
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error creating site:', error);
    res.status(500).json({ error: error.message || 'Internal server error' });
  } finally {
    client.release();
  }
});

// Update site
router.put('/:id', authenticateToken, requireRole(['administrator', 'supervisor']), async (req, res) => {
  try {
    const { id } = req.params;
    const {
      client_id,
      name,
      code,
      address,
      city,
      postal_code,
      country
    } = req.body;

    const result = await pool.query(`
      UPDATE sites SET
        client_id = $1,
        name = $2,
        code = $3,
        address = $4,
        city = $5,
        postal_code = $6,
        country = $7,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $8
      RETURNING *
    `, [client_id, name, code, address, city, postal_code, country, id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Site not found' });
    }

    // Log activity
    await logActivity(req.user.id, 'UPDATE_SITE', 'site', id, {
      name,
      code,
      changes: req.body
    }, req.ip, req.get('User-Agent'));

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating site:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete site
router.delete('/:id', authenticateToken, requireRole(['administrator']), async (req, res) => {
  try {
    const { id } = req.params;

    // Check if site has buildings with equipment
    const equipmentResult = await pool.query(`
      SELECT COUNT(*) 
      FROM equipment e
      JOIN buildings b ON e.building_id = b.id
      WHERE b.site_id = $1
    `, [id]);

    if (parseInt(equipmentResult.rows[0].count) > 0) {
      return res.status(400).json({ error: 'Cannot delete site with existing equipment' });
    }

    // Get site name before deletion
    const siteResult = await pool.query('SELECT name, code FROM sites WHERE id = $1', [id]);
    if (siteResult.rows.length === 0) {
      return res.status(404).json({ error: 'Site not found' });
    }

    await pool.query('DELETE FROM sites WHERE id = $1', [id]);

    // Log activity
    await logActivity(req.user.id, 'DELETE_SITE', 'site', id, {
      name: siteResult.rows[0].name,
      code: siteResult.rows[0].code
    }, req.ip, req.get('User-Agent'));

    res.json({ message: 'Site deleted successfully' });
  } catch (error) {
    console.error('Error deleting site:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;