const db = require('../config/database');

exports.getDeliveries = async (req, res) => {
  try {
    const { status, date_from, date_to, staff_id, keyword, page = 0, size = 20 } = req.query;

    const pageNum = parseInt(page) || 0;
    const sizeNum = parseInt(size) || 20;
    const offset  = pageNum * sizeNum;

    let whereClause = 'WHERE 1=1';
    const filterParams = [];

    if (staff_id) {
      whereClause += ' AND d.staff_id = ?';
      filterParams.push(staff_id);
    }

    if (status) {
      whereClause += ' AND d.status = ?';
      filterParams.push(status);
    }

    if (date_from) {
      whereClause += ' AND DATE(d.created_at) >= ?';
      filterParams.push(date_from);
    }

    if (date_to) {
      whereClause += ' AND DATE(d.created_at) <= ?';
      filterParams.push(date_to);
    }

    if (keyword && keyword.trim()) {
      whereClause += ` AND (
        d.building_name   LIKE ? OR
        d.room_no         LIKE ? OR
        d.customer_name   LIKE ? OR
        d.customer_phone  LIKE ? OR
        d.description     LIKE ? OR
        u.name            LIKE ?
      )`;
      const kw = `%${keyword.trim()}%`;
      filterParams.push(kw, kw, kw, kw, kw, kw);
    }

    // Paginated rows
    const [deliveries] = await db.query(
      `SELECT SQL_CALC_FOUND_ROWS
         d.*,
         u.name as staff_name
       FROM deliveries d
       JOIN users u ON d.staff_id = u.id
       ${whereClause}
       ORDER BY d.created_at DESC
       LIMIT ?, ?`,
      [...filterParams, offset, sizeNum]
    );

    // Total matching rows (ignores LIMIT)
    const [[{ total }]] = await db.query('SELECT FOUND_ROWS() as total');

    // Total amount across ALL matching rows (not just this page)
    const [[{ total_amount }]] = await db.query(
      `SELECT COALESCE(SUM(d.amount), 0) as total_amount
       FROM deliveries d
       JOIN users u ON d.staff_id = u.id
       ${whereClause}`,
      filterParams
    );

    res.json({
      data:         deliveries,
      total:        parseInt(total),
      total_amount: parseFloat(total_amount),
      page:         pageNum,
      size:         sizeNum,
      totalPages:   Math.ceil(total / sizeNum),
    });
  } catch (error) {
    console.error('Get deliveries error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

exports.createDelivery = async (req, res) => {
  try {
    const {
      building_name,
      room_no,
      customer_name,
      customer_phone,
      amount,
      description,
      staff_id
    } = req.body;

    if (!building_name || !room_no || !amount) {
      return res.status(400).json({
        error: 'Building name, room number, and amount are required'
      });
    }

    // Determine staff_id: admin can assign, staff uses their own id
    let assignedStaffId;
    if (req.user.role === 'admin' && staff_id) {
      assignedStaffId = staff_id;
    } else {
      assignedStaffId = req.user.id;
    }

    const [result] = await db.query(
      `INSERT INTO deliveries
       (staff_id, building_name, room_no, customer_name, customer_phone, amount, description)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [assignedStaffId, building_name, room_no, customer_name, customer_phone, amount, description]
    );

    // Get the created delivery with staff info
    const [delivery] = await db.query(
      `SELECT d.*, u.name as staff_name
       FROM deliveries d
       JOIN users u ON d.staff_id = u.id
       WHERE d.id = ?`,
      [result.insertId]
    );

    res.status(201).json(delivery[0]);
  } catch (error) {
    console.error('Create delivery error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

exports.getDeliveryById = async (req, res) => {
  try {
    const { id } = req.params;

    const [deliveries] = await db.query(
      `SELECT
        d.*,
        u.name as staff_name,
        u.email as staff_email
       FROM deliveries d
       JOIN users u ON d.staff_id = u.id
       WHERE d.id = ?`,
      [id]
    );

    if (deliveries.length === 0) {
      return res.status(404).json({ error: 'Delivery not found' });
    }

    const delivery = deliveries[0];

    // Get payment info if exists
    const [payments] = await db.query(
      `SELECT p.*, u.name as collected_by_name
       FROM payments p
       JOIN users u ON p.collected_by = u.id
       WHERE p.delivery_id = ?`,
      [id]
    );

    res.json({
      ...delivery,
      payment: payments.length > 0 ? payments[0] : null
    });
  } catch (error) {
    console.error('Get delivery error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

exports.markAsPaid = async (req, res) => {
  try {
    const { id } = req.params;
    const { payment_mode = 'cash', note } = req.body;

    // Get delivery
    const [deliveries] = await db.query(
      'SELECT * FROM deliveries WHERE id = ?',
      [id]
    );

    if (deliveries.length === 0) {
      return res.status(404).json({ error: 'Delivery not found' });
    }

    const delivery = deliveries[0];

    if (delivery.status === 'paid') {
      return res.status(400).json({ error: 'Delivery already marked as paid' });
    }

    // Start transaction
    const connection = await db.getConnection();
    await connection.beginTransaction();

    try {
      // Update delivery status
      await connection.query(
        'UPDATE deliveries SET status = ? WHERE id = ?',
        ['paid', id]
      );

      // Create payment record
      await connection.query(
        `INSERT INTO payments
         (delivery_id, amount_paid, payment_mode, collected_by, note)
         VALUES (?, ?, ?, ?, ?)`,
        [id, delivery.amount, payment_mode, req.user.id, note]
      );

      await connection.commit();
      connection.release();

      // Get updated delivery
      const [updated] = await db.query(
        `SELECT d.*, u.name as staff_name
         FROM deliveries d
         JOIN users u ON d.staff_id = u.id
         WHERE d.id = ?`,
        [id]
      );

      res.json(updated[0]);
    } catch (error) {
      await connection.rollback();
      connection.release();
      throw error;
    }
  } catch (error) {
    console.error('Mark as paid error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

exports.uploadImage = async (req, res) => {
  try {
    const { id } = req.params;

    if (!req.file) {
      return res.status(400).json({ error: 'No image file provided' });
    }

    const imageUrl = `/uploads/${req.file.filename}`;

    // Update delivery with image URL
    await db.query(
      'UPDATE deliveries SET image_url = ? WHERE id = ?',
      [imageUrl, id]
    );

    res.json({ image_url: imageUrl });
  } catch (error) {
    console.error('Upload image error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};
