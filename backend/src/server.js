const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config();

// Import middleware and routes
const logger = require('./middleware/logger');
const errorHandler = require('./middleware/errorHandler');
//const rateLimiter = require('./middleware/rateLimiter');
const authRoutes = require('./routes/auth');
const clientRoutes = require('./routes/clients');
const siteRoutes = require('./routes/sites');
const equipmentRoutes = require('./routes/equipment');
const auditRoutes = require('./routes/audits');
const deliverableRoutes = require('./routes/deliverables');
const userRoutes = require('./routes/users');
const settingsRoutes = require('./routes/settings');
const aiRoutes = require('./routes/ai');
const buildingRoutes = require('./routes/buildings');
const levelRoutes = require('./routes/levels');
const localRoutes = require('./routes/locals');

const app = express();
const PORT = process.env.PORT || 3001;

// Security middleware
app.use(helmet());
app.use(compression());
//app.use(rateLimiter);

// CORS configuration
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://your-domain.com'] 
    : ['http://localhost:3000', 'http://localhost:5173'],
  credentials: true
}));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Static files
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Logging middleware
app.use(logger);

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/clients', clientRoutes);
app.use('/api/sites', siteRoutes);
app.use('/api/equipment', equipmentRoutes);
app.use('/api/audits', auditRoutes);
app.use('/api/deliverables', deliverableRoutes);
app.use('/api/users', userRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/buildings', buildingRoutes);
app.use('/api/levels', levelRoutes);
app.use('/api/locals', localRoutes);

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Error handling middleware
app.use(errorHandler);

// Start server
app.listen(PORT, () => {
  console.log(`🚀 GMAO Backend server running on port ${PORT}`);
  console.log(`📊 Environment: ${process.env.NODE_ENV}`);
  console.log(`🔗 Health check: http://localhost:${PORT}/health`);
});

module.exports = app;