const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const deliveryController = require('../controllers/deliveryController');
const { authenticate } = require('../middleware/auth');

// Configure multer for image uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'delivery-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: parseInt(process.env.MAX_FILE_SIZE) || 5242880 }, // 5MB default
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only JPEG, JPG, and PNG images are allowed'));
    }
  }
});

// All delivery routes require authentication
router.use(authenticate);

router.get('/', deliveryController.getDeliveries);
router.post('/', deliveryController.createDelivery);
router.get('/:id', deliveryController.getDeliveryById);
router.patch('/:id/pay', deliveryController.markAsPaid);
router.post('/:id/image', upload.single('image'), deliveryController.uploadImage);

module.exports = router;
