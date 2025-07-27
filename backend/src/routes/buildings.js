const express = require('express');
const pool = require('../database/connection');
const { authenticateToken, requireRole } = require('../middleware/auth');
const { logActivity } = require('../utils/activityLogger');

const router = express.Router();

// Get all buildings
router.get('/', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        b.*,
        s.name as site_name,
        c.name as client_name,
        COUNT(DISTINCT l.id) as floors,
        COUNT(DISTINCT e.id) as equipments
      FROM buildings b
      JOIN sites s ON b.site_id = s.id
      JOIN clients c ON s.client_id = c.id
      LEFT JOIN levels l ON b.id = l.building_id
      LEFT JOIN locals loc ON l.id = loc.level_id
      LEFT JOIN equipment e ON loc.id = e.local_id
      GROUP BY b.id, s.name, c.name
      ORDER BY b.name
    `, []);

    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching buildings:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get building by ID
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(`
      SELECT 
        b.*,
        s.name as site_name,
        c.name as client_name,
        COUNT(DISTINCT l.id) as floors,
        COUNT(DISTINCT e.id) as equipments
      FROM buildings b
      JOIN sites s ON b.site_id = s.id
      JOIN clients c ON s.client_id = c.id
      LEFT JOIN levels l ON b.id = l.building_id
      LEFT JOIN locals loc ON l.id = loc.level_id
      LEFT JOIN equipment e ON loc.id = e.local_id
      WHERE b.id = $1
      GROUP BY b.id, s.name, c.name
    `, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Building not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching building:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get building with detailed hierarchy (levels, locals, equipment)
router.get('/:id/detailed', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    // Get building info
    const buildingResult = await pool.query(`
      SELECT 
        b.*,
        s.name as site_name,
        c.name as client_name
      FROM buildings b
      JOIN sites s ON b.site_id = s.id
      JOIN clients c ON s.client_id = c.id
      WHERE b.id = $1
    `, [id]);

    if (buildingResult.rows.length === 0) {
      return res.status(404).json({ error: 'Building not found' });
    }

    const building = buildingResult.rows[0];

    // Get levels with their locals and equipment
    const levelsResult = await pool.query(`
      SELECT 
        l.*,
        COUNT(DISTINCT loc.id) as locals_count,
        COUNT(DISTINCT e.id) as equipment_count,
        json_agg(
          DISTINCT jsonb_build_object(
            'id', loc.id,
            'name', loc.name,
            'type', loc.type,
            'surface', loc.surface,
            'description', loc.description,
            'equipment_count', (
              SELECT COUNT(*) FROM equipment WHERE local_id = loc.id
            ),
            'equipment', (
              SELECT COALESCE(json_agg(
                jsonb_build_object(
                  'id', e.id,
                  'reference', e.reference,
                  'type', e.type,
                  'brand', e.brand,
                  'model', e.model,
                  'status', e.status,
                  'domain_name', td.name
                )
              ), '[]'::json)
              FROM equipment e
              LEFT JOIN technical_domains td ON e.domain_id = td.id
              WHERE e.local_id = loc.id
            )
          )
        ) FILTER (WHERE loc.id IS NOT NULL) as locals
      FROM levels l
      LEFT JOIN locals loc ON l.id = loc.level_id
      LEFT JOIN equipment e ON loc.id = e.local_id
      WHERE l.building_id = $1
      GROUP BY l.id
      ORDER BY l.number ASC
    `, [id]);

    building.levels = levelsResult.rows.map(level => ({
      ...level,
      locals: level.locals || []
    }));

    res.json(building);
  } catch (error) {
    console.error('Error fetching detailed building:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create new building
router.post('/', authenticateToken, requireRole(['administrator', 'supervisor']), async (req, res) => {
  try {
    const { site_id, name, address, description, image } = req.body;

    // Check if site exists
    const siteResult = await pool.query('SELECT id FROM sites WHERE id = $1', [site_id]);
    if (siteResult.rows.length === 0) {
      return res.status(404).json({ error: 'Site not found' });
    }

    const result = await pool.query(`
      INSERT INTO buildings (site_id, name, address, description, image)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `, [site_id, name, address, description, image]);

    const building = result.rows[0];

    // Log activity
    await logActivity(req.user.id, 'CREATE_BUILDING', 'building', building.id, {
      site_id,
      name,
      address
    }, req.ip, req.get('User-Agent'));

    res.status(201).json(building);
  } catch (error) {
    console.error('Error creating building:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update building
router.put('/:id', authenticateToken, requireRole(['administrator', 'supervisor']), async (req, res) => {
  try {
    const { id } = req.params;
    const { name, address, description, image } = req.body;

    const result = await pool.query(`
      UPDATE buildings 
      SET name = $1, address = $2, description = $3, image = $4, updated_at = CURRENT_TIMESTAMP
      WHERE id = $5
      RETURNING *
    `, [name, address, description, image, id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Building not found' });
    }

    // Log activity
    await logActivity(req.user.id, 'UPDATE_BUILDING', 'building', id, {
      name,
      changes: req.body
    }, req.ip, req.get('User-Agent'));

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating building:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete building
router.delete('/:id', authenticateToken, requireRole(['administrator']), async (req, res) => {
  try {
    const { id } = req.params;

    // Check if building has equipment
    const equipmentResult = await pool.query(`
      SELECT COUNT(*) 
      FROM equipment e
      JOIN locals loc ON e.local_id = loc.id
      JOIN levels l ON loc.level_id = l.id
      WHERE l.building_id = $1
    `, [id]);

    if (parseInt(equipmentResult.rows[0].count) > 0) {
      return res.status(400).json({ error: 'Cannot delete building with existing equipment' });
    }

    // Get building info before deletion
    const buildingResult = await pool.query('SELECT name FROM buildings WHERE id = $1', [id]);
    if (buildingResult.rows.length === 0) {
      return res.status(404).json({ error: 'Building not found' });
    }

    await pool.query('DELETE FROM buildings WHERE id = $1', [id]);

    // Log activity
    await logActivity(req.user.id, 'DELETE_BUILDING', 'building', id, {
      name: buildingResult.rows[0].name
    }, req.ip, req.get('User-Agent'));

    res.json({ message: 'Building deleted successfully' });
  } catch (error) {
    console.error('Error deleting building:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;