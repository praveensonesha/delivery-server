const bcrypt = require('bcryptjs');
const db = require('../config/database');

exports.getAllStaff = async (req, res) => {
  try {
    const [staff] = await db.query(
      'SELECT id, name, email, role, created_at FROM users WHERE role = ?',
      ['staff']
    );
    res.json(staff);
  } catch (error) {
    console.error('Get staff error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

exports.createStaff = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email, and password are required' });
    }

    // Check if email already exists
    const [existing] = await db.query('SELECT id FROM users WHERE email = ?', [email]);
    if (existing.length > 0) {
      return res.status(400).json({ error: 'Email already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert new staff
    const [result] = await db.query(
      'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
      [name, email, hashedPassword, 'staff']
    );

    res.status(201).json({
      id: result.insertId,
      name,
      email,
      role: 'staff'
    });
  } catch (error) {
    console.error('Create staff error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

exports.deleteStaff = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if user exists and is staff
    const [users] = await db.query('SELECT role FROM users WHERE id = ?', [id]);
    if (users.length === 0) {
      return res.status(404).json({ error: 'Staff not found' });
    }
    if (users[0].role !== 'staff') {
      return res.status(400).json({ error: 'Can only delete staff users' });
    }

    await db.query('DELETE FROM users WHERE id = ?', [id]);
    res.json({ message: 'Staff deleted successfully' });
  } catch (error) {
    console.error('Delete staff error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};
