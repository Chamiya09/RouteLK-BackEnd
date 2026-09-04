const express = require('express');
const { body } = require('express-validator');
const {
  createBooking,
  getMyBookings,
  getBookingById,
  cancelBooking,
  getBookingsByBus,
  getAllBookings,
} = require('../controllers/bookingController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

const router = express.Router();

// Validation for creating booking
const bookingValidation = [
  body('busId').notEmpty().withMessage('Bus ID is required'),
  body('travelDate')
    .notEmpty()
    .withMessage('Travel date is required')
    .matches(/^\d{4}-\d{2}-\d{2}$/)
    .withMessage('Travel date must be in YYYY-MM-DD format'),
  body('seats')
    .isArray({ min: 1 })
    .withMessage('Seats must be a non-empty array'),
];

// All booking routes require authentication
router.use(protect);

router.post('/', bookingValidation, createBooking);
router.get('/my', getMyBookings);
router.get('/bus/:busId', authorize('owner', 'admin'), getBookingsByBus);
router.get('/', authorize('admin'), getAllBookings);

router.get('/:id', getBookingById);
router.put('/:id/cancel', cancelBooking);

module.exports = router;

