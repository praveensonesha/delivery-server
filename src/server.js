const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();
const serverActive = require('./cron/serverActive');
const packageJson = require('../package.json');

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

// Keep the server active
serverActive();

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/staff', staffRoutes);
app.use('/api/deliveries', deliveryRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'DeliveryTrack API is running' });
});

// Default route for any unmatched paths
app.get('*', (req, res) => {
   const currentTime = new Date().toISOString();
   const uptime = process.uptime();
   const uptimeFormatted = `${Math.floor(uptime / 3600)}h ${Math.floor((uptime % 3600) / 60)}m ${Math.floor(uptime % 60)}s`;
   
   const responseData = {
      success: true,
      message: "🚀 Welcome to DeliveryTrack API",
      status: "✅ Server is up and running",
      version: packageJson.version,
      data: {
         service: "DeliveryTrack API Server",
         version: packageJson.version,
         environment: process.env.NODE_ENV || 'STAGING',
         timestamp: currentTime,
         uptime: uptimeFormatted
      },
      meta: {
         author: "Praveen Development Team"
      }
   };

   // Set proper headers for formatted JSON
   res.set('Content-Type', 'application/json');
   
   // Send beautifully formatted JSON with 3-space indentation
   res.status(200).send(JSON.stringify(responseData, null, 3));
});

app.listen(PORT, () => {
  console.log(`🚀 Server is running on PORT ${PORT} and version: ${packageJson.version}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'STAGING'}`);
  console.log(`📡 Server Active at: http://localhost:${PORT}`);
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
// app.listen(PORT, () => {
//   console.log(`\n✓ Server running on http://localhost:${PORT}`);
//   console.log(`✓ Environment: ${process.env.NODE_ENV}`);
//   console.log(`\nAPI Endpoints:`);
//   console.log(`  POST   /api/auth/login`);
//   console.log(`  POST   /api/auth/logout`);
//   console.log(`  GET    /api/deliveries`);
//   console.log(`  POST   /api/deliveries`);
//   console.log(`  GET    /api/deliveries/:id`);
//   console.log(`  PATCH  /api/deliveries/:id/pay`);
//   console.log(`  POST   /api/deliveries/:id/image`);
//   console.log(`  GET    /api/staff`);
//   console.log(`  POST   /api/staff`);
//   console.log(`  DELETE /api/staff/:id\n`);
// });

module.exports = app;
