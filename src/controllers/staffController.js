const bcrypt = require('bcryptjs');
const db = require('../config/database');

exports.getAllStaff = async (req, res) => {
  try {
    const [staff] = await db.query(
      'SELECT id, name, username, role, created_at FROM users WHERE role = ?',
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
    const { name, username, password } = req.body;

    if (!name || !username || !password) {
      return res.status(400).json({ error: 'Name, username, and password are required' });
    }

    // Check if username already exists
    const [existing] = await db.query('SELECT id FROM users WHERE username = ?', [username]);
    if (existing.length > 0) {
      return res.status(400).json({ error: 'Username already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const [result] = await db.query(
      'INSERT INTO users (name, username, password, role) VALUES (?, ?, ?, ?)',
      [name, username, hashedPassword, 'staff']
    );

    res.status(201).json({
      id: result.insertId,
      name,
      username,
      role: 'staff',
    });
  } catch (error) {
    console.error('Create staff error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

exports.updateStaff = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, username, password } = req.body;

    const [users] = await db.query('SELECT id, role FROM users WHERE id = ?', [id]);
    if (users.length === 0) return res.status(404).json({ error: 'Staff not found' });
    if (users[0].role !== 'staff') return res.status(400).json({ error: 'Can only edit staff users' });

    // Check username uniqueness if changing
    if (username) {
      const [dup] = await db.query('SELECT id FROM users WHERE username = ? AND id != ?', [username, id]);
      if (dup.length > 0) return res.status(400).json({ error: 'Username already taken' });
    }

    const fields = [];
    const params = [];
    if (name)     { fields.push('name = ?');     params.push(name); }
    if (username) { fields.push('username = ?'); params.push(username); }
    if (password) {
      const hashed = await bcrypt.hash(password, 10);
      fields.push('password = ?');
      params.push(hashed);
    }

    if (fields.length === 0) return res.status(400).json({ error: 'Nothing to update' });

    params.push(id);
    await db.query(`UPDATE users SET ${fields.join(', ')} WHERE id = ?`, params);

    const [[updated]] = await db.query('SELECT id, name, username, role, created_at FROM users WHERE id = ?', [id]);
    res.json(updated);
  } catch (error) {
    console.error('Update staff error:', error);
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
