const express = require('express');
const pool = require('../database/connection');
const { authenticateToken, requireRole } = require('../middleware/auth');
const { logActivity } = require('../utils/activityLogger');
const { generatePDFReport, generateExcelReport } = require('../utils/reportGenerator');

const router = express.Router();

// Get all deliverables
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { 
      site_id, 
      client_id,
      status,
      start_date,
      end_date,
      page = 1, 
      limit = 50 
    } = req.query;

    let query = `
      SELECT 
        d.*,
        s.name as site_name,
        c.name as client_name,
        u.first_name || ' ' || u.last_name as generated_by_name
      FROM deliverables d
      JOIN sites s ON d.site_id = s.id
      JOIN clients c ON s.client_id = c.id
      LEFT JOIN users u ON d.generated_by = u.id
      WHERE 1=1
    `;

    const params = [];
    let paramCount = 0;

    if (site_id) {
      paramCount++;
      query += ` AND d.site_id = $${paramCount}`;
      params.push(site_id);
    }

    if (client_id) {
      paramCount++;
      query += ` AND c.id = $${paramCount}`;
      params.push(client_id);
    }

    if (status) {
      paramCount++;
      query += ` AND d.status = $${paramCount}`;
      params.push(status);
    }

    if (start_date) {
      paramCount++;
      query += ` AND d.period_start >= $${paramCount}`;
      params.push(start_date);
    }

    if (end_date) {
      paramCount++;
      query += ` AND d.period_end <= $${paramCount}`;
      params.push(end_date);
    }

    query += ` ORDER BY d.created_at DESC LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}`;
    params.push(limit, (page - 1) * limit);

    const result = await pool.query(query, params);

    res.json({
      deliverables: result.rows,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit)
      }
    });
  } catch (error) {
    console.error('Error fetching deliverables:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get deliverable by ID
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(`
      SELECT 
        d.*,
        s.name as site_name,
        c.name as client_name,
        u.first_name || ' ' || u.last_name as generated_by_name
      FROM deliverables d
      JOIN sites s ON d.site_id = s.id
      JOIN clients c ON s.client_id = c.id
      LEFT JOIN users u ON d.generated_by = u.id
      WHERE d.id = $1
    `, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Deliverable not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching deliverable:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Generate new deliverable
router.post('/generate', authenticateToken, requireRole(['administrator', 'supervisor']), async (req, res) => {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');

    const {
      site_id,
      period_start,
      period_end,
      title
    } = req.body;

    // Get audit data for the period
    const auditData = await client.query(`
      SELECT 
        a.*,
        e.reference as equipment_reference,
        e.type as equipment_type,
        e.location as equipment_location,
        b.name as building_name,
        td.name as domain_name
      FROM audits a
      JOIN equipment e ON a.equipment_id = e.id
      JOIN buildings b ON e.building_id = b.id
      JOIN sites s ON b.site_id = s.id
      LEFT JOIN technical_domains td ON e.domain_id = td.id
      WHERE s.id = $1 
        AND a.audit_date >= $2 
        AND a.audit_date <= $3
      ORDER BY a.audit_date DESC
    `, [site_id, period_start, period_end]);

    const audits = auditData.rows;
    const equipmentCount = new Set(audits.map(a => a.equipment_id)).size;
    const anomalyCount = audits.filter(a => a.overall_status !== 'ok').length;

    // Create deliverable record
    const deliverableResult = await client.query(`
      INSERT INTO deliverables (
        site_id, title, period_start, period_end, 
        equipment_count, anomaly_count, generated_by, status
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, 'in_progress')
      RETURNING *
    `, [site_id, title, period_start, period_end, equipmentCount, anomalyCount, req.user.id]);

    const deliverable = deliverableResult.rows[0];

    // Generate PDF report (async)
    const pdfPath = await generatePDFReport(deliverable.id, audits);
    
    // Generate Excel report (async)
    const excelPath = await generateExcelReport(deliverable.id, audits);

    // Update deliverable with file paths
    await client.query(`
      UPDATE deliverables 
      SET pdf_path = $1, excel_path = $2, status = 'generated', generated_at = CURRENT_TIMESTAMP
      WHERE id = $3
    `, [pdfPath, excelPath, deliverable.id]);

    await client.query('COMMIT');

    // Log activity
    await logActivity(req.user.id, 'GENERATE_DELIVERABLE', 'deliverable', deliverable.id, {
      site_id,
      period_start,
      period_end,
      equipment_count: equipmentCount,
      anomaly_count: anomalyCount
    }, req.ip, req.get('User-Agent'));

    res.status(201).json({
      ...deliverable,
      pdf_path: pdfPath,
      excel_path: excelPath,
      status: 'generated'
    });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error generating deliverable:', error);
    res.status(500).json({ error: 'Internal server error' });
  } finally {
    client.release();
  }
});

// Download deliverable file
router.get('/:id/download/:type', authenticateToken, async (req, res) => {
  try {
    const { id, type } = req.params;

    const result = await pool.query('SELECT pdf_path, excel_path FROM deliverables WHERE id = $1', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Deliverable not found' });
    }

    const deliverable = result.rows[0];
    let filePath;
    let contentType;
    let filename;

    switch (type) {
      case 'pdf':
        filePath = deliverable.pdf_path;
        contentType = 'application/pdf';
        filename = `rapport-audit-${id}.pdf`;
        break;
      case 'excel':
        filePath = deliverable.excel_path;
        contentType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
        filename = `equipements-audit-${id}.xlsx`;
        break;
      default:
        return res.status(400).json({ error: 'Invalid file type' });
    }

    if (!filePath) {
      return res.status(404).json({ error: 'File not found' });
    }

    // Log activity
    await logActivity(req.user.id, 'DOWNLOAD_DELIVERABLE', 'deliverable', id, {
      file_type: type
    }, req.ip, req.get('User-Agent'));

    res.setHeader('Content-Type', contentType);
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    
    // In a real implementation, you would stream the file from storage
    res.json({ 
      message: 'File download would start here',
      file_path: filePath,
      filename 
    });
  } catch (error) {
    console.error('Error downloading deliverable:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Mark deliverable as sent
router.put('/:id/send', authenticateToken, requireRole(['administrator', 'supervisor']), async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(`
      UPDATE deliverables 
      SET status = 'sent', sent_at = CURRENT_TIMESTAMP
      WHERE id = $1
      RETURNING *
    `, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Deliverable not found' });
    }

    // Log activity
    await logActivity(req.user.id, 'SEND_DELIVERABLE', 'deliverable', id, {}, req.ip, req.get('User-Agent'));

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error marking deliverable as sent:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete deliverable
router.delete('/:id', authenticateToken, requireRole(['administrator']), async (req, res) => {
  try {
    const { id } = req.params;

    // Get deliverable info before deletion
    const deliverableResult = await pool.query('SELECT title FROM deliverables WHERE id = $1', [id]);
    if (deliverableResult.rows.length === 0) {
      return res.status(404).json({ error: 'Deliverable not found' });
    }

    await pool.query('DELETE FROM deliverables WHERE id = $1', [id]);

    // Log activity
    await logActivity(req.user.id, 'DELETE_DELIVERABLE', 'deliverable', id, {
      title: deliverableResult.rows[0].title
    }, req.ip, req.get('User-Agent'));

    res.json({ message: 'Deliverable deleted successfully' });
  } catch (error) {
    console.error('Error deleting deliverable:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;