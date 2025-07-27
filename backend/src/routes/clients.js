const express = require('express');
const pool = require('../database/connection');
const { authenticateToken, requireRole } = require('../middleware/auth');
const { logActivity } = require('../utils/activityLogger');

const router = express.Router();

// Get all clients
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { search, page = 1, limit = 50 } = req.query;

    let query = `
      SELECT 
        c.*,
        COUNT(DISTINCT s.id) as site_count,
        COUNT(DISTINCT b.id) as building_count,
        COUNT(DISTINCT e.id) as equipment_count
      FROM clients c
      LEFT JOIN sites s ON c.id = s.client_id
      LEFT JOIN buildings b ON s.id = b.site_id
      LEFT JOIN equipment e ON b.id = e.building_id
      WHERE 1=1
    `;

    const params = [];
    let paramCount = 0;

    if (search) {
      paramCount++;
      query += ` AND (c.name ILIKE $${paramCount} OR c.contact_name ILIKE $${paramCount} OR c.contact_email ILIKE $${paramCount})`;
      params.push(`%${search}%`);
    }

    query += ` GROUP BY c.id ORDER BY c.created_at DESC LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}`;
    params.push(limit, (page - 1) * limit);

    const result = await pool.query(query, params);

    res.json({
      clients: result.rows,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit)
      }
    });
  } catch (error) {
    console.error('Error fetching clients:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get client by ID with sites and buildings
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    // Get client details
    const clientResult = await pool.query('SELECT * FROM clients WHERE id = $1', [id]);
    if (clientResult.rows.length === 0) {
      return res.status(404).json({ error: 'Client not found' });
    }

    // Get sites with buildings
    const sitesResult = await pool.query(`
      SELECT 
        s.*,
        COUNT(DISTINCT b.id) as building_count,
        COUNT(DISTINCT e.id) as equipment_count
      FROM sites s
      LEFT JOIN buildings b ON s.id = b.site_id
      LEFT JOIN equipment e ON b.id = e.building_id
      WHERE s.client_id = $1
      GROUP BY s.id
      ORDER BY s.created_at
    `, [id]);

    // Get buildings for each site
    for (let site of sitesResult.rows) {
      const buildingsResult = await pool.query(`
        SELECT 
          b.*,
          COUNT(e.id) as equipment_count
        FROM buildings b
        LEFT JOIN equipment e ON b.id = e.building_id
        WHERE b.site_id = $1
        GROUP BY b.id
        ORDER BY b.created_at
      `, [site.id]);
      
      site.buildings = buildingsResult.rows;
    }

    const client = clientResult.rows[0];
    client.sites = sitesResult.rows;

    res.json(client);
  } catch (error) {
    console.error('Error fetching client:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create new client
router.post('/', authenticateToken, requireRole(['administrator', 'supervisor']), async (req, res) => {
  try {
    const {
      name,
      contact_name,
      contact_email,
      contact_phone,
      address,
      city,
      postal_code,
      country = 'France'
    } = req.body;

    const result = await pool.query(`
      INSERT INTO clients (name, contact_name, contact_email, contact_phone, address, city, postal_code, country)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *
    `, [name, contact_name, contact_email, contact_phone, address, city, postal_code, country]);

    const client = result.rows[0];

    // Log activity
    await logActivity(req.user.id, 'CREATE_CLIENT', 'client', client.id, {
      name,
      contact_email
    }, req.ip, req.get('User-Agent'));

    res.status(201).json(client);
  } catch (error) {
    console.error('Error creating client:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update client
router.put('/:id', authenticateToken, requireRole(['administrator', 'supervisor']), async (req, res) => {
  try {
    const { id } = req.params;
    const {
      name,
      contact_name,
      contact_email,
      contact_phone,
      address,
      city,
      postal_code,
      country
    } = req.body;

    const result = await pool.query(`
      UPDATE clients SET
        name = $1,
        contact_name = $2,
        contact_email = $3,
        contact_phone = $4,
        address = $5,
        city = $6,
        postal_code = $7,
        country = $8,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $9
      RETURNING *
    `, [name, contact_name, contact_email, contact_phone, address, city, postal_code, country, id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Client not found' });
    }

    // Log activity
    await logActivity(req.user.id, 'UPDATE_CLIENT', 'client', id, {
      name,
      changes: req.body
    }, req.ip, req.get('User-Agent'));

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating client:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete client
router.delete('/:id', authenticateToken, requireRole(['administrator']), async (req, res) => {
  try {
    const { id } = req.params;

    // Get client name before deletion
    const clientResult = await pool.query('SELECT name FROM clients WHERE id = $1', [id]);
    if (clientResult.rows.length === 0) {
      return res.status(404).json({ error: 'Client not found' });
    }

    // Start a transaction to handle cascading deletes
    await pool.query('BEGIN');

    try {
      // Delete all equipment associated with buildings of this client
      await pool.query(`
        DELETE FROM equipment 
        WHERE building_id IN (
          SELECT b.id FROM buildings b 
          JOIN sites s ON b.site_id = s.id 
          WHERE s.client_id = $1
        )
      `, [id]);

      // Delete all buildings associated with sites of this client
      await pool.query(`
        DELETE FROM buildings 
        WHERE site_id IN (
          SELECT id FROM sites WHERE client_id = $1
        )
      `, [id]);

      // Delete all sites of this client
      await pool.query('DELETE FROM sites WHERE client_id = $1', [id]);

      // Finally delete the client
      await pool.query('DELETE FROM clients WHERE id = $1', [id]);

      // Commit the transaction
      await pool.query('COMMIT');

      // Log activity
      await logActivity(req.user.id, 'DELETE_CLIENT', 'client', id, {
        name: clientResult.rows[0].name
      }, req.ip, req.get('User-Agent'));

      res.json({ message: 'Client deleted successfully' });

    } catch (deleteError) {
      // Rollback on error
      await pool.query('ROLLBACK');
      throw deleteError;
    }

  } catch (error) {
    console.error('Error deleting client:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;