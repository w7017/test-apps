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
    const uploadPath = `uploads/buildings/${new Date().getFullYear()}/${String(new Date().getMonth() + 1).padStart(2, '0')}`;
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

// Get all buildings with their primary images
router.get('/', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        b.*,
        s.name as site_name,
        c.name as client_name,
        COUNT(DISTINCT l.id) as floors,
        COUNT(DISTINCT e.id) as equipments,
        fa.file_path as image_path,
        fa.original_name as image_name
      FROM buildings b
      JOIN sites s ON b.site_id = s.id
      JOIN clients c ON s.client_id = c.id
      LEFT JOIN levels l ON b.id = l.building_id
      LEFT JOIN locals loc ON l.id = loc.level_id
      LEFT JOIN equipment e ON loc.id = e.local_id
      LEFT JOIN file_attachments fa ON fa.entity_type = 'building' 
        AND fa.entity_id = b.id 
        AND fa.is_primary = true 
        AND fa.file_type = 'image'
      GROUP BY b.id, s.name, c.name, fa.file_path, fa.original_name
      ORDER BY b.name
    `, []);

    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching buildings:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get building by ID with images
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

    // Get all images for this building
    const imagesResult = await pool.query(`
      SELECT * FROM file_attachments 
      WHERE entity_type = 'building' AND entity_id = $1 AND file_type = 'image'
      ORDER BY is_primary DESC, created_at ASC
    `, [id]);

    const building = {
      ...result.rows[0],
      images: imagesResult.rows
    };

    res.json(building);
  } catch (error) {
    console.error('Error fetching building:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get building images
router.get('/:id/images', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await pool.query(`
      SELECT fa.*, u.first_name, u.last_name
      FROM file_attachments fa
      LEFT JOIN users u ON fa.uploaded_by = u.id
      WHERE fa.entity_type = 'building' AND fa.entity_id = $1 AND fa.file_type = 'image'
      ORDER BY fa.is_primary DESC, fa.created_at ASC
    `, [id]);
    
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching building images:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Upload building image
router.post('/:id/upload-image', authenticateToken, upload.single('image'), async (req, res) => {
  try {
    const { id } = req.params;
    const { is_primary = false, description } = req.body;
    const file = req.file;
    
    if (!file) {
      return res.status(400).json({ error: 'No image uploaded' });
    }

    // Check if building exists
    const buildingCheck = await pool.query('SELECT id FROM buildings WHERE id = $1', [id]);
    if (buildingCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Building not found' });
    }

    // If this is marked as primary, unset other primary images for this building
    if (is_primary === 'true') {
      await pool.query(
        'UPDATE file_attachments SET is_primary = false WHERE entity_type = $1 AND entity_id = $2 AND file_type = $3',
        ['building', id, 'image']
      );
    }

    // Insert file record
    const result = await pool.query(`
      INSERT INTO file_attachments (entity_type, entity_id, file_path, original_name, file_size, mime_type, file_type, is_primary, description, uploaded_by)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING *
    `, [
      'building',
      id,
      '/' + file.path.replace(/\\/g, '/'), // Normalize path separators
      file.originalname,
      file.size,
      file.mimetype,
      'image',
      is_primary === 'true',
      description,
      req.user.id
    ]);

    // Log activity
    await logActivity(req.user.id, 'UPLOAD_BUILDING_IMAGE', 'building', id, {
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

// Delete building image
router.delete('/:id/images/:imageId', authenticateToken, requireRole(['administrator', 'supervisor']), async (req, res) => {
  try {
    const { id, imageId } = req.params;

    // Get file info before deletion
    const fileResult = await pool.query(
      'SELECT * FROM file_attachments WHERE id = $1 AND entity_type = $2 AND entity_id = $3',
      [imageId, 'building', id]
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
    await pool.query('DELETE FROM file_attachments WHERE id = $1', [imageId]);

    // Log activity
    await logActivity(req.user.id, 'DELETE_BUILDING_IMAGE', 'building', id, {
      file_name: fileRecord.original_name
    }, req.ip, req.get('User-Agent'));

    res.json({ message: 'Image deleted successfully' });
  } catch (error) {
    console.error('Error deleting image:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Set primary image
router.put('/:id/images/:imageId/primary', authenticateToken, requireRole(['administrator', 'supervisor']), async (req, res) => {
  try {
    const { id, imageId } = req.params;

    // Unset all primary images for this building
    await pool.query(
      'UPDATE file_attachments SET is_primary = false WHERE entity_type = $1 AND entity_id = $2 AND file_type = $3',
      ['building', id, 'image']
    );

    // Set this image as primary
    const result = await pool.query(
      'UPDATE file_attachments SET is_primary = true WHERE id = $1 AND entity_type = $2 AND entity_id = $3 RETURNING *',
      [imageId, 'building', id]
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

// Create new building (remove image field from body)
router.post('/', authenticateToken, requireRole(['administrator', 'supervisor']), async (req, res) => {
  try {
    const { site_id, name, address, city, postal_code, country, description, floors } = req.body;

    // Check if site exists
    const siteResult = await pool.query('SELECT id FROM sites WHERE id = $1', [site_id]);
    if (siteResult.rows.length === 0) {
      return res.status(404).json({ error: 'Site not found' });
    }

    const result = await pool.query(`
      INSERT INTO buildings (site_id, name, address, city, postal_code, country, description, floors)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *
    `, [site_id, name, address, city, postal_code, country, description, floors]);

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

// Update building (remove image field from update)
router.put('/:id', authenticateToken, requireRole(['administrator', 'supervisor']), async (req, res) => {
  try {
    const { id } = req.params;
    const { name, address, city, postal_code, country, description, floors } = req.body;

    const result = await pool.query(`
      UPDATE buildings 
      SET name = $1, address = $2, city = $3, postal_code = $4, country = $5, description = $6, floors = $7, updated_at = CURRENT_TIMESTAMP
      WHERE id = $8
      RETURNING *
    `, [name, address, city, postal_code, country, description, floors, id]);

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

    // Get building info before deletion
    const buildingResult = await pool.query('SELECT name FROM buildings WHERE id = $1', [id]);
    if (buildingResult.rows.length === 0) {
      return res.status(404).json({ error: 'Building not found' });
    }

    // Get all images for this building to delete files
    const imagesResult = await pool.query(
      'SELECT file_path FROM file_attachments WHERE entity_type = $1 AND entity_id = $2',
      ['building', id]
    );

    // Delete image files from filesystem
    for (const image of imagesResult.rows) {
      try {
        await fs.unlink(image.file_path.substring(1)); // Remove leading slash
      } catch (fsError) {
        console.warn('Could not delete image file:', fsError);
      }
    }

    // The database cascading deletes will automatically handle:
    // - levels (ON DELETE CASCADE)
    // - locals (through levels cascade)
    // - equipment (through building_id FK and local_id cascade)
    // - audits (through equipment cascade)
    // - audit_items and audit_photos (through audits cascade)
    // - file_attachments (manual cleanup above)
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

// Get building with detailed hierarchy (levels, locals, equipment)
router.get('/:id/detailed', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    // Get building info with images
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

    // Get images
    const imagesResult = await pool.query(`
      SELECT * FROM file_attachments 
      WHERE entity_type = 'building' AND entity_id = $1 AND file_type = 'image'
      ORDER BY is_primary DESC, created_at ASC
    `, [id]);

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

    building.images = imagesResult.rows;
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

module.exports = router;