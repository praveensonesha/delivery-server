const express = require('express');
const router = express.Router();
const staffController = require('../controllers/staffController');
const { authenticate, isAdmin } = require('../middleware/auth');

// All staff routes require admin authentication
router.use(authenticate, isAdmin);

router.get('/', staffController.getAllStaff);
router.post('/', staffController.createStaff);
router.delete('/:id', staffController.deleteStaff);

module.exports = router;
