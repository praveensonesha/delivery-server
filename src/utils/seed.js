const bcrypt = require('bcryptjs');
const db = require('../config/database');

const seedUsers = async () => {
  try {
    // Check if users already exist
    const [existing] = await db.query('SELECT COUNT(*) as count FROM users');
    if (existing[0].count > 0) {
      console.log('⚠ Users already exist. Skipping seed.');
      return;
    }

    // Hash passwords
    const adminPassword = await bcrypt.hash('admin123', 10);
    const staffPassword = await bcrypt.hash('staff123', 10);

    // Insert seed users
    await db.query(`
      INSERT INTO users (name, email, password, role) VALUES
      ('Admin User', 'admin@delivery.com', ?, 'admin'),
      ('Ramesh Kumar', 'ramesh@delivery.com', ?, 'staff'),
      ('Suresh Patel', 'suresh@delivery.com', ?, 'staff')
    `, [adminPassword, staffPassword, staffPassword]);

    console.log('✓ Seed users created successfully');
    console.log('\nLogin credentials:');
    console.log('  Admin: admin@delivery.com / admin123');
    console.log('  Staff: ramesh@delivery.com / staff123');
    console.log('         suresh@delivery.com / staff123');
  } catch (error) {
    console.error('✗ Seed failed:', error.message);
  }
};

module.exports = { seedUsers };
