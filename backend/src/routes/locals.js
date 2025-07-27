const express = require('express');
const pool = require('../database/connection');
const { authenticateToken, requireRole } = require('../middleware/auth');
const { logActivity } = require('../utils/activityLogger');

const router = express.Router();

// Get locals for a level
router.get('/level/:levelId', authenticateToken, async (req, res) => {
  try {
    const { levelId } = req.params;

    const result = await pool.query(`
      SELECT 
        loc.*,
        COUNT(e.id) as equipment_count
      FROM locals loc
      LEFT JOIN equipment e ON loc.id = e.local_id
      WHERE loc.level_id = $1
      GROUP BY loc.id
      ORDER BY loc.name
    `, [levelId]);

    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching locals:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get local by ID with equipment
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    // Get local details
    const localResult = await pool.query(`
      SELECT 
        loc.*,
        l.name as level_name,
        b.name as building_name,
        s.name as site_name,
        c.name as client_name
      FROM locals loc
      JOIN levels l ON loc.level_id = l.id
      JOIN buildings b ON l.building_id = b.id
      JOIN sites s ON b.site_id = s.id
      JOIN clients c ON s.client_id = c.id
      WHERE loc.id = $1
    `, [id]);

    if (localResult.rows.length === 0) {
      return res.status(404).json({ error: 'Local not found' });
    }

    // Get equipment for this local
    const equipmentResult = await pool.query(`
      SELECT 
        e.*,
        td.name as domain_name
      FROM equipment e
      LEFT JOIN technical_domains td ON e.domain_id = td.id
      WHERE e.local_id = $1
      ORDER BY e.reference
    `, [id]);

    const local = localResult.rows[0];
    local.equipment = equipmentResult.rows;

    res.json(local);
  } catch (error) {
    console.error('Error fetching local:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get equipment for a local
router.get('/:id/equipment', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(`
      SELECT 
        e.*,
        td.name as domain_name
      FROM equipment e
      LEFT JOIN technical_domains td ON e.domain_id = td.id
      WHERE e.local_id = $1
      ORDER BY e.reference
    `, [id]);

    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching equipment:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Add equipment to local
router.post('/:id/equipment', authenticateToken, requireRole(['administrator', 'supervisor']), async (req, res) => {
  try {
    const { id } = req.params;
    const { equipments, building_id } = req.body;

    // Check if local exists
    const localResult = await pool.query('SELECT id FROM locals WHERE id = $1', [id]);
    if (localResult.rows.length === 0) {
      return res.status(404).json({ error: 'Local not found' });
    }

    // If equipments is an array, handle multiple equipment
    if (Array.isArray(equipments)) {
      const createdEquipment = [];
      
      for (const equipment of equipments) {
        const result = await pool.query(`
          INSERT INTO equipment (
            local_id, reference, type, brand, model, 
            description, domain_id, status, building_id
          )
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
          RETURNING *
        `, [
          id,
          equipment.reference,
          equipment.type,
          equipment.brand || null,
          equipment.model || null,
          equipment.description || null,
          equipment.domain_id || null,
          equipment.status || 'active',
          building_id
        ]);
        
        createdEquipment.push(result.rows[0]);
      }

      // Log activity
      await logActivity(req.user.id, 'ADD_EQUIPMENT_TO_LOCAL', 'local', id, {
        equipment_count: equipments.length,
        equipment_references: equipments.map(e => e.reference)
      }, req.ip, req.get('User-Agent'));

      res.status(201).json({ equipments: createdEquipment });
    } else {
      // Handle single equipment
      const result = await pool.query(`
        INSERT INTO equipment (
          local_id, reference, type, brand, model, 
          description, domain_id, status, building_id
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        RETURNING *
      `, [
        id,
        equipments.reference,
        equipments.type,
        equipments.brand || null,
        equipments.model || null,
        equipments.description || null,
        equipments.domain_id || null,
        equipments.status || 'active',
        building_id
      ]);

      // Log activity
      await logActivity(req.user.id, 'ADD_EQUIPMENT_TO_LOCAL', 'local', id, {
        equipment_reference: equipments.reference
      }, req.ip, req.get('User-Agent'));

      res.status(201).json(result.rows[0]);
    }
  } catch (error) {
    console.error('Error adding equipment to local:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create new local
router.post('/', authenticateToken, requireRole(['administrator', 'supervisor']), async (req, res) => {
  try {
    const { level_id, name, type, surface, description } = req.body;

    // Check if level exists
    const levelResult = await pool.query('SELECT id FROM levels WHERE id = $1', [level_id]);
    if (levelResult.rows.length === 0) {
      return res.status(404).json({ error: 'Level not found' });
    }

    const result = await pool.query(`
      INSERT INTO locals (level_id, name, type, surface, description)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `, [level_id, name, type, surface, description]);

    const local = result.rows[0];

    // Log activity
    await logActivity(req.user.id, 'CREATE_LOCAL', 'local', local.id, {
      level_id,
      name,
      type
    }, req.ip, req.get('User-Agent'));

    res.status(201).json(local);
  } catch (error) {
    console.error('Error creating local:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update local
router.put('/:id', authenticateToken, requireRole(['administrator', 'supervisor']), async (req, res) => {
  try {
    const { id } = req.params;
    const { name, type, surface, description } = req.body;

    const result = await pool.query(`
      UPDATE locals 
      SET name = $1, type = $2, surface = $3, description = $4, updated_at = CURRENT_TIMESTAMP
      WHERE id = $5
      RETURNING *
    `, [name, type, surface, description, id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Local not found' });
    }

    // Log activity
    await logActivity(req.user.id, 'UPDATE_LOCAL', 'local', id, {
      name,
      type,
      changes: req.body
    }, req.ip, req.get('User-Agent'));

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating local:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete local
router.delete('/:id', authenticateToken, requireRole(['administrator']), async (req, res) => {
  try {
    const { id } = req.params;

    // Check if local has equipment
    const equipmentResult = await pool.query('SELECT COUNT(*) FROM equipment WHERE local_id = $1', [id]);
    if (parseInt(equipmentResult.rows[0].count) > 0) {
      return res.status(400).json({ error: 'Cannot delete local with existing equipment' });
    }

    // Get local info before deletion
    const localResult = await pool.query('SELECT name FROM locals WHERE id = $1', [id]);
    if (localResult.rows.length === 0) {
      return res.status(404).json({ error: 'Local not found' });
    }

    await pool.query('DELETE FROM locals WHERE id = $1', [id]);

    // Log activity
    await logActivity(req.user.id, 'DELETE_LOCAL', 'local', id, {
      name: localResult.rows[0].name
    }, req.ip, req.get('User-Agent'));

    res.json({ message: 'Local deleted successfully' });
  } catch (error) {
    console.error('Error deleting local:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;