const express = require('express');
const multer = require('multer');
const path = require('path');
const pool = require('../database/connection');
const { authenticateToken } = require('../middleware/auth');
const { logActivity } = require('../utils/activityLogger');
const { simulateOCR } = require('../utils/ocrSimulator');

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/audit-photos/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  }
});

// Get all audits with filters
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { 
      equipment_id, 
      site_id, 
      building_id, 
      status,
      start_date,
      end_date,
      page = 1, 
      limit = 50 
    } = req.query;

    let query = `
      SELECT 
        a.*,
        e.reference as equipment_reference,
        e.type as equipment_type,
        e.location as equipment_location,
        b.name as building_name,
        s.name as site_name,
        c.name as client_name,
        u.first_name || ' ' || u.last_name as auditor_name,
        (
          SELECT COUNT(*) 
          FROM audit_photos ap 
          WHERE ap.audit_id = a.id
        ) as photo_count
      FROM audits a
      JOIN equipment e ON a.equipment_id = e.id
      JOIN buildings b ON e.building_id = b.id
      JOIN sites s ON b.site_id = s.id
      JOIN clients c ON s.client_id = c.id
      LEFT JOIN users u ON a.auditor_id = u.id
      WHERE 1=1
    `;

    const params = [];
    let paramCount = 0;

    if (equipment_id) {
      paramCount++;
      query += ` AND a.equipment_id = $${paramCount}`;
      params.push(equipment_id);
    }

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

    if (status) {
      paramCount++;
      query += ` AND a.status = $${paramCount}`;
      params.push(status);
    }

    if (start_date) {
      paramCount++;
      query += ` AND a.audit_date >= $${paramCount}`;
      params.push(start_date);
    }

    if (end_date) {
      paramCount++;
      query += ` AND a.audit_date <= $${paramCount}`;
      params.push(end_date);
    }

    query += ` ORDER BY a.audit_date DESC LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}`;
    params.push(limit, (page - 1) * limit);

    const result = await pool.query(query, params);

    res.json({
      audits: result.rows,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: result.rows.length
      }
    });
  } catch (error) {
    console.error('Error fetching audits:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get audit by ID with items and photos
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    // Get audit details
    const auditResult = await pool.query(`
      SELECT 
        a.*,
        e.reference as equipment_reference,
        e.type as equipment_type,
        e.location as equipment_location,
        b.name as building_name,
        s.name as site_name,
        c.name as client_name,
        u.first_name || ' ' || u.last_name as auditor_name
      FROM audits a
      JOIN equipment e ON a.equipment_id = e.id
      JOIN buildings b ON e.building_id = b.id
      JOIN sites s ON b.site_id = s.id
      JOIN clients c ON s.client_id = c.id
      LEFT JOIN users u ON a.auditor_id = u.id
      WHERE a.id = $1
    `, [id]);

    if (auditResult.rows.length === 0) {
      return res.status(404).json({ error: 'Audit not found' });
    }

    // Get audit items
    const itemsResult = await pool.query(
      'SELECT * FROM audit_items WHERE audit_id = $1 ORDER BY created_at',
      [id]
    );

    // Get audit photos
    const photosResult = await pool.query(
      'SELECT * FROM audit_photos WHERE audit_id = $1 ORDER BY created_at',
      [id]
    );

    const audit = auditResult.rows[0];
    audit.items = itemsResult.rows;
    audit.photos = photosResult.rows;

    res.json(audit);
  } catch (error) {
    console.error('Error fetching audit:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create new audit
router.post('/', authenticateToken, async (req, res) => {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');

    const {
      equipment_id,
      overall_status,
      notes,
      items = []
    } = req.body;

    // Create audit
    const auditResult = await client.query(`
      INSERT INTO audits (equipment_id, auditor_id, overall_status, notes)
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `, [equipment_id, req.user.id, overall_status, notes]);

    const audit = auditResult.rows[0];

    // Create audit items
    for (const item of items) {
      await client.query(`
        INSERT INTO audit_items (audit_id, item_name, status, notes)
        VALUES ($1, $2, $3, $4)
      `, [audit.id, item.item_name, item.status, item.notes]);
    }

    // Update equipment last maintenance date
    await client.query(`
      UPDATE equipment 
      SET last_maintenance_date = CURRENT_DATE,
          next_maintenance_date = CURRENT_DATE + INTERVAL '1 day' * maintenance_frequency
      WHERE id = $1
    `, [equipment_id]);

    await client.query('COMMIT');

    // Log activity
    await logActivity(req.user.id, 'CREATE_AUDIT', 'audit', audit.id, {
      equipment_id,
      overall_status,
      items_count: items.length
    }, req.ip, req.get('User-Agent'));

    res.status(201).json(audit);
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error creating audit:', error);
    res.status(500).json({ error: 'Internal server error' });
  } finally {
    client.release();
  }
});

// Upload audit photos
router.post('/:id/photos', authenticateToken, upload.array('photos', 10), async (req, res) => {
  try {
    const { id } = req.params;
    const files = req.files;

    if (!files || files.length === 0) {
      return res.status(400).json({ error: 'No files uploaded' });
    }

    // Check if audit exists
    const auditResult = await pool.query('SELECT id FROM audits WHERE id = $1', [id]);
    if (auditResult.rows.length === 0) {
      return res.status(404).json({ error: 'Audit not found' });
    }

    const uploadedPhotos = [];

    for (const file of files) {
      const result = await pool.query(`
        INSERT INTO audit_photos (audit_id, file_path, file_name, file_size, mime_type, description)
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING *
      `, [
        id,
        file.path,
        file.originalname,
        file.size,
        file.mimetype,
        req.body.description || ''
      ]);

      uploadedPhotos.push(result.rows[0]);
    }

    // Log activity
    await logActivity(req.user.id, 'UPLOAD_AUDIT_PHOTOS', 'audit', id, {
      photo_count: files.length
    }, req.ip, req.get('User-Agent'));

    res.json({ photos: uploadedPhotos });
  } catch (error) {
    console.error('Error uploading photos:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// OCR endpoint for nameplate recognition
router.post('/ocr', authenticateToken, upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No image file uploaded' });
    }

    // Simulate OCR processing
    const ocrResult = await simulateOCR(req.file.path);

    // Log activity
    await logActivity(req.user.id, 'OCR_PROCESSING', 'ocr', null, {
      filename: req.file.originalname,
      extracted_data: ocrResult
    }, req.ip, req.get('User-Agent'));

    res.json(ocrResult);
  } catch (error) {
    console.error('Error processing OCR:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get audit statistics
router.get('/stats/overview', authenticateToken, async (req, res) => {
  try {
    const { site_id, start_date, end_date } = req.query;

    let whereClause = 'WHERE 1=1';
    const params = [];
    let paramCount = 0;

    if (site_id) {
      paramCount++;
      whereClause += ` AND s.id = $${paramCount}`;
      params.push(site_id);
    }

    if (start_date) {
      paramCount++;
      whereClause += ` AND a.audit_date >= $${paramCount}`;
      params.push(start_date);
    }

    if (end_date) {
      paramCount++;
      whereClause += ` AND a.audit_date <= $${paramCount}`;
      params.push(end_date);
    }

    const statsQuery = `
      SELECT 
        COUNT(*) as total_audits,
        COUNT(CASE WHEN a.overall_status = 'ok' THEN 1 END) as ok_count,
        COUNT(CASE WHEN a.overall_status = 'warning' THEN 1 END) as warning_count,
        COUNT(CASE WHEN a.overall_status = 'critical' THEN 1 END) as critical_count,
        COUNT(DISTINCT a.equipment_id) as equipment_audited,
        COUNT(DISTINCT s.id) as sites_covered
      FROM audits a
      JOIN equipment e ON a.equipment_id = e.id
      JOIN buildings b ON e.building_id = b.id
      JOIN sites s ON b.site_id = s.id
      ${whereClause}
    `;

    const result = await pool.query(statsQuery, params);

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching audit stats:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;