const pool = require('./connection');
const bcrypt = require('bcryptjs');

async function seed() {
  try {
    console.log('🌱 Starting database seeding...');

    // Create default admin user
    const hashedPassword = await bcrypt.hash('admin123', 12);
    await pool.query(`
      INSERT INTO users (email, password_hash, first_name, last_name, role)
      VALUES ($1, $2, $3, $4, $5)
      ON CONFLICT (email) DO NOTHING
    `, ['admin@gmao.com', hashedPassword, 'Admin', 'User', 'administrator']);

    // Create technical domains
    const domains = [
      { name: 'CVC', code: 'CVC', description: 'Chauffage, Ventilation, Climatisation', color: '#3B82F6' },
      { name: 'CFO/CFA', code: 'CFO', description: 'Courants Forts/Courants Faibles', color: '#10B981' },
      { name: 'Électricité', code: 'ELEC', description: 'Installations électriques', color: '#F59E0B' },
      { name: 'Plomberie', code: 'PLOMB', description: 'Installations sanitaires', color: '#8B5CF6' },
      { name: 'Sécurité Incendie', code: 'SI', description: 'Systèmes de sécurité incendie', color: '#EF4444' }
    ];

    for (const domain of domains) {
      await pool.query(`
        INSERT INTO technical_domains (name, code, description, color)
        VALUES ($1, $2, $3, $4)
        ON CONFLICT (code) DO NOTHING
      `, [domain.name, domain.code, domain.description, domain.color]);
    }

    // Create default settings
    const defaultSettings = [
      { key: 'company_name', value: 'GMAO Pro', description: 'Nom de l\'entreprise' },
      { key: 'audit_reminder_days', value: '7', description: 'Délai d\'alerte avant audit (jours)' },
      { key: 'audit_frequency', value: 'monthly', description: 'Fréquence des rappels d\'audit' },
      { key: 'pdf_header', value: 'GMAO Pro - Rapport d\'audit technique', description: 'En-tête des rapports PDF' }
    ];

    for (const setting of defaultSettings) {
      await pool.query(`
        INSERT INTO settings (key, value, description)
        VALUES ($1, $2, $3)
        ON CONFLICT (key) DO NOTHING
      `, [setting.key, setting.value, setting.description]);
    }

    console.log('✅ Database seeding completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  }
}

seed();