const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const authRoutes = require('./routes/authRoutes');
const staffRoutes = require('./routes/staffRoutes');
const deliveryRoutes = require('./routes/deliveryRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/staff', staffRoutes);
app.use('/api/deliveries', deliveryRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'DeliveryTrack API is running' });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    error: err.message || 'Internal server error'
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`\n✓ Server running on http://localhost:${PORT}`);
  console.log(`✓ Environment: ${process.env.NODE_ENV}`);
  console.log(`\nAPI Endpoints:`);
  console.log(`  POST   /api/auth/login`);
  console.log(`  POST   /api/auth/logout`);
  console.log(`  GET    /api/deliveries`);
  console.log(`  POST   /api/deliveries`);
  console.log(`  GET    /api/deliveries/:id`);
  console.log(`  PATCH  /api/deliveries/:id/pay`);
  console.log(`  POST   /api/deliveries/:id/image`);
  console.log(`  GET    /api/staff`);
  console.log(`  POST   /api/staff`);
  console.log(`  DELETE /api/staff/:id\n`);
});

module.exports = app;
