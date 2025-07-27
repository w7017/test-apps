const express = require('express');
const pool = require('../database/connection');
const { authenticateToken, requireRole } = require('../middleware/auth');
const { logActivity } = require('../utils/activityLogger');

const router = express.Router();

// Get levels for a building
router.get('/building/:buildingId', authenticateToken, async (req, res) => {
  try {
    const { buildingId } = req.params;

    const result = await pool.query(`
      SELECT 
        l.*,
        COUNT(DISTINCT loc.id) as locals_count,
        COUNT(DISTINCT e.id) as equipment_count
      FROM levels l
      LEFT JOIN locals loc ON l.id = loc.level_id
      LEFT JOIN equipment e ON loc.id = e.local_id
      WHERE l.building_id = $1
      GROUP BY l.id
      ORDER BY l.number ASC
    `, [buildingId]);

    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching levels:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get level by ID with locals
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    // Get level details
    const levelResult = await pool.query(`
      SELECT 
        l.*,
        b.name as building_name,
        s.name as site_name,
        c.name as client_name
      FROM levels l
      JOIN buildings b ON l.building_id = b.id
      JOIN sites s ON b.site_id = s.id
      JOIN clients c ON s.client_id = c.id
      WHERE l.id = $1
    `, [id]);

    if (levelResult.rows.length === 0) {
      return res.status(404).json({ error: 'Level not found' });
    }

    // Get locals for this level
    const localsResult = await pool.query(`
      SELECT 
        loc.*,
        COUNT(e.id) as equipment_count
      FROM locals loc
      LEFT JOIN equipment e ON loc.id = e.local_id
      WHERE loc.level_id = $1
      GROUP BY loc.id
      ORDER BY loc.name
    `, [id]);

    const level = levelResult.rows[0];
    level.locals = localsResult.rows;

    res.json(level);
  } catch (error) {
    console.error('Error fetching level:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create new level
router.post('/', authenticateToken, requireRole(['administrator', 'supervisor']), async (req, res) => {
  try {
    const { building_id, name, number, description } = req.body;

    // Check if building exists
    const buildingResult = await pool.query('SELECT id FROM buildings WHERE id = $1', [building_id]);
    if (buildingResult.rows.length === 0) {
      return res.status(404).json({ error: 'Building not found' });
    }

    const result = await pool.query(`
      INSERT INTO levels (building_id, name, number, description)
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `, [building_id, name, number, description]);

    const level = result.rows[0];

    // Log activity
    await logActivity(req.user.id, 'CREATE_LEVEL', 'level', level.id, {
      building_id,
      name,
      number
    }, req.ip, req.get('User-Agent'));

    res.status(201).json(level);
  } catch (error) {
    console.error('Error creating level:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update level
router.put('/:id', authenticateToken, requireRole(['administrator', 'supervisor']), async (req, res) => {
  try {
    const { id } = req.params;
    const { name, number, description } = req.body;

    const result = await pool.query(`
      UPDATE levels 
      SET name = $1, number = $2, description = $3, updated_at = CURRENT_TIMESTAMP
      WHERE id = $4
      RETURNING *
    `, [name, number, description, id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Level not found' });
    }

    // Log activity
    await logActivity(req.user.id, 'UPDATE_LEVEL', 'level', id, {
      name,
      number,
      changes: req.body
    }, req.ip, req.get('User-Agent'));

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating level:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete level
router.delete('/:id', authenticateToken, requireRole(['administrator']), async (req, res) => {
  try {
    const { id } = req.params;

    // Check if level has locals with equipment
    const equipmentResult = await pool.query(`
      SELECT COUNT(*) 
      FROM equipment e
      JOIN locals loc ON e.local_id = loc.id
      WHERE loc.level_id = $1
    `, [id]);

    if (parseInt(equipmentResult.rows[0].count) > 0) {
      return res.status(400).json({ error: 'Cannot delete level with existing equipment' });
    }

    // Get level info before deletion
    const levelResult = await pool.query('SELECT name FROM levels WHERE id = $1', [id]);
    if (levelResult.rows.length === 0) {
      return res.status(404).json({ error: 'Level not found' });
    }

    await pool.query('DELETE FROM levels WHERE id = $1', [id]);

    // Log activity
    await logActivity(req.user.id, 'DELETE_LEVEL', 'level', id, {
      name: levelResult.rows[0].name
    }, req.ip, req.get('User-Agent'));

    res.json({ message: 'Level deleted successfully' });
  } catch (error) {
    console.error('Error deleting level:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;