const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
require('dotenv').config();

const { connectDB } = require('./config/db');
const { seedDatabase } = require('./seed');

// Import routes
const authRoutes = require('./routes/authRoutes');
const protocolRoutes = require('./routes/protocolRoutes');
const riskRoutes = require('./routes/riskRoutes');
const optimizerRoutes = require('./routes/optimizerRoutes');
const portfolioRoutes = require('./routes/portfolioRoutes');
const analyticsRoutes = require('./routes/analyticsRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/protocols', protocolRoutes);
app.use('/api/risk', riskRoutes);
app.use('/api/optimizer', optimizerRoutes);
app.use('/api/portfolio', portfolioRoutes);
app.use('/api/analytics', analyticsRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'DeFi Yield Optimizer & Risk-Scoring Engine API',
    version: '1.0.0',
    documentation: '/api/protocols, /api/risk/overview, /api/optimizer/optimize, /api/portfolio, /api/analytics',
  });
});

// Root route
app.get('/', (req, res) => {
  res.json({
    message: 'Welcome to DeFi Yield Optimizer & Risk-Scoring Backend API',
    health: '/api/health',
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ success: false, message: `Route not found: ${req.method} ${req.url}` });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('[SERVER ERROR]', err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
});

// Start Server and connect database
const startServer = async () => {
  try {
    await connectDB();
    await seedDatabase();

    const server = app.listen(PORT, '0.0.0.0', () => {
      console.log(`🚀 [BACKEND] DeFi Risk Engine running at http://127.0.0.1:${PORT}`);
      console.log(`📊 [API HEALTH] Test endpoint at http://127.0.0.1:${PORT}/api/health`);
    });

    return server;
  } catch (err) {
    console.error('Failed to initialize backend server:', err);
    process.exit(1);
  }
};

startServer();

module.exports = app;
