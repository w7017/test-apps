const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;
const { v4: uuidv4 } = require('uuid');
const pool = require('../database/connection');
const { authenticateToken, requireRole } = require('../middleware/auth');
const { logActivity } = require('../utils/activityLogger');

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    const uploadPath = `uploads/sites/${new Date().getFullYear()}/${String(new Date().getMonth() + 1).padStart(2, '0')}`;
    try {
      await fs.mkdir(uploadPath, { recursive: true });
      cb(null, uploadPath);
    } catch (error) {
      cb(error, null);
    }
  },
  filename: (req, file, cb) => {
    const uniqueName = `${uuidv4()}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  }
});

const upload = multer({ 
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only image files allowed!'));
    }
  }
});

// Get all sites
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { client_id, search, page = 1, limit = 50 } = req.query;

    let query = `
      SELECT 
        s.*,
        c.name as client_name,
        COUNT(DISTINCT b.id) as building_count,
        COUNT(DISTINCT e.id) as equipment_count,
        si.file_path as image_path,
        si.original_name as image_name
      FROM sites s
      JOIN clients c ON s.client_id = c.id
      LEFT JOIN buildings b ON s.id = b.site_id
      LEFT JOIN equipment e ON b.id = e.building_id
      LEFT JOIN site_images si ON si.site_id = s.id 
        AND si.is_primary = true
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

    query += ` GROUP BY s.id, c.name, si.file_path, si.original_name ORDER BY s.created_at DESC LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}`;
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

    // Get all images for this site
    const imagesResult = await pool.query(`
      SELECT * FROM site_images 
      WHERE site_id = $1
      ORDER BY is_primary DESC, created_at ASC
    `, [id]);

    const site = siteResult.rows[0];
    site.buildings = buildingsResult.rows;
    site.images = imagesResult.rows;

    res.json(site);
  } catch (error) {
    console.error('Error fetching site:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get site images
router.get('/:id/images', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await pool.query(`
      SELECT si.*, u.first_name, u.last_name
      FROM site_images si
      LEFT JOIN users u ON si.uploaded_by = u.id
      WHERE si.site_id = $1
      ORDER BY si.is_primary DESC, si.created_at ASC
    `, [id]);
    
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching site images:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Upload site image
router.post('/:id/upload-image', authenticateToken, upload.single('image'), async (req, res) => {
  try {
    const { id } = req.params;
    const { is_primary = false, description } = req.body;
    const file = req.file;
    
    if (!file) {
      return res.status(400).json({ error: 'No image uploaded' });
    }

    // Check if site exists
    const siteCheck = await pool.query('SELECT id FROM sites WHERE id = $1', [id]);
    if (siteCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Site not found' });
    }

    // If this is marked as primary, unset other primary images for this site
    if (is_primary === 'true') {
      await pool.query(
        'UPDATE site_images SET is_primary = false WHERE site_id = $1',
        [id]
      );
    }

    // Insert file record
    const result = await pool.query(`
      INSERT INTO site_images (site_id, file_path, original_name, file_size, mime_type, is_primary, description, uploaded_by)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *
    `, [
      id,
      '/' + file.path.replace(/\\/g, '/'), // Normalize path separators
      file.originalname,
      file.size,
      file.mimetype,
      is_primary === 'true',
      description,
      req.user.id
    ]);

    // Log activity
    await logActivity(req.user.id, 'UPLOAD_SITE_IMAGE', 'site', id, {
      file_name: file.originalname,
      is_primary: is_primary === 'true'
    }, req.ip, req.get('User-Agent'));

    res.json({ 
      message: 'Image uploaded successfully',
      file: result.rows[0]
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: 'Upload failed' });
  }
});

// Delete site image
router.delete('/:id/images/:imageId', authenticateToken, requireRole(['administrator', 'supervisor']), async (req, res) => {
  try {
    const { id, imageId } = req.params;

    // Get file info before deletion
    const fileResult = await pool.query(
      'SELECT * FROM site_images WHERE id = $1 AND site_id = $2',
      [imageId, id]
    );

    if (fileResult.rows.length === 0) {
      return res.status(404).json({ error: 'Image not found' });
    }

    const fileRecord = fileResult.rows[0];

    // Delete file from filesystem
    try {
      await fs.unlink(fileRecord.file_path.substring(1)); // Remove leading slash
    } catch (fsError) {
      console.warn('Could not delete file from filesystem:', fsError);
    }

    // Delete from database
    await pool.query('DELETE FROM site_images WHERE id = $1', [imageId]);

    // Log activity
    await logActivity(req.user.id, 'DELETE_SITE_IMAGE', 'site', id, {
      file_name: fileRecord.original_name
    }, req.ip, req.get('User-Agent'));

    res.json({ message: 'Image deleted successfully' });
  } catch (error) {
    console.error('Error deleting image:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Set primary site image
router.put('/:id/images/:imageId/primary', authenticateToken, requireRole(['administrator', 'supervisor']), async (req, res) => {
  try {
    const { id, imageId } = req.params;

    // Unset all primary images for this site
    await pool.query(
      'UPDATE site_images SET is_primary = false WHERE site_id = $1',
      [id]
    );

    // Set this image as primary
    const result = await pool.query(
      'UPDATE site_images SET is_primary = true WHERE id = $1 AND site_id = $2 RETURNING *',
      [imageId, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Image not found' });
    }

    res.json({ message: 'Primary image updated successfully' });
  } catch (error) {
    console.error('Error setting primary image:', error);
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
        c.name as client_name,
        COUNT(DISTINCT b.id) as building_count,
        COUNT(DISTINCT e.id) as equipment_count
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
      LEFT JOIN buildings b ON s.id = b.site_id
      LEFT JOIN equipment e ON b.id = e.building_id
      RETURNING *
      GROUP BY s.id, c.name
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