const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const setupDatabase = async () => {
  let connection;

  try {
    console.log('🚀 Setting up DeliveryTrack database...\n');

    // Connect without database to create it
    connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      multipleStatements: true
    });

    console.log('✓ Connected to MySQL server');

    // Read and execute schema
    const schemaPath = path.join(__dirname, 'src/config/schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');

    await connection.query(schema);
    console.log('✓ Database and tables created');

    await connection.end();

    // Now connect to the created database and seed
    const db = require('./src/config/database');
    const { seedUsers } = require('./src/utils/seed');

    await seedUsers();

    console.log('\n✅ Setup completed successfully!\n');
    console.log('You can now start the server with: npm start\n');

    process.exit(0);
  } catch (error) {
    console.error('\n❌ Setup failed:', error.message);
    if (connection) await connection.end();
    process.exit(1);
  }
};

setupDatabase();
