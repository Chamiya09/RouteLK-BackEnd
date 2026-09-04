const { validationResult } = require('express-validator');
const Booking = require('../models/Booking');
const Bus = require('../models/Bus');
const generateBookingId = require('../utils/generateBookingId');

// @desc    Create a new booking
// @route   POST /api/bookings
// @access  Private (Passenger, Owner, Admin)
const createBooking = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: errors.array()[0].msg,
      });
    }

    const { busId, travelDate, seats } = req.body;

    // 1. Check if bus exists and is active
    const bus = await Bus.findById(busId);
    if (!bus) {
      return res.status(404).json({
        success: false,
        message: 'Bus not found',
      });
    }

    if (!bus.isActive) {
      return res.status(400).json({
        success: false,
        message: 'This bus is currently not in service',
      });
    }

    // 2. Validate seat numbers
    if (!Array.isArray(seats) || seats.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Seats must be a non-empty array of seat numbers',
      });
    }

    // Check for duplicates in requested seats
    const uniqueSeatSet = new Set(seats);
    if (uniqueSeatSet.size !== seats.length) {
      return res.status(400).json({
        success: false,
        message: 'Duplicate seat numbers are not allowed',
      });
    }

    // Verify seat numbers are within 1 and totalSeats
    for (const seat of seats) {
      if (!Number.isInteger(seat) || seat < 1 || seat > bus.totalSeats) {
        return res.status(400).json({
          success: false,
          message: `Selected seat ${seat} is invalid. Valid seat numbers are 1 to ${bus.totalSeats}.`,
        });
      }
    }

    // 3. Check for already booked seats on this travel date
    const existingBookings = await Booking.find({
      busId: bus._id,
      travelDate,
      status: 'CONFIRMED',
    });

    const bookedSeatSet = new Set();
    existingBookings.forEach((b) => {
      b.seats.forEach((seat) => bookedSeatSet.add(seat));
    });

    const conflictingSeats = seats.filter((seat) => bookedSeatSet.has(seat));
    if (conflictingSeats.length > 0) {
      return res.status(409).json({
        success: false,
        message: `Seat ${conflictingSeats.join(', ')} is already booked for this travel date.`,
      });
    }

    // 4. Backend-calculated fare & passenger count
    const passengerCount = seats.length;
    const farePerSeat = bus.fare;
    const totalFare = passengerCount * farePerSeat;

    // 5. Generate unique human-readable booking ID
    const bookingId = await generateBookingId();

    // 6. Save booking
    const booking = await Booking.create({
      bookingId,
      userId: req.user._id,
      busId: bus._id,
      travelDate,
      seats,
      passengerCount,
      farePerSeat,
      totalFare,
      passengerName: (req.body.passengerName || req.user.name || '').trim(),
      passengerPhone: (req.body.passengerPhone || req.user.phone || '').trim(),
      passengerEmail: (req.body.passengerEmail || req.user.email || '').trim(),
      status: 'CONFIRMED',
    });

    res.status(201).json({
      success: true,
      message: 'Booking confirmed successfully',
      booking: {
        id: booking._id,
        bookingId: booking.bookingId,
        bus: bus.busNumber,
        busNumber: bus.busNumber,
        operatorName: bus.operatorName,
        busType: bus.busType,
        departureTime: bus.departureTime,
        arrivalTime: bus.arrivalTime,
        from: bus.from,
        to: bus.to,
        travelDate: booking.travelDate,
        seats: booking.seats,
        passengerCount: booking.passengerCount,
        farePerSeat: booking.farePerSeat,
        totalFare: booking.totalFare,
        passengerName: booking.passengerName,
        passengerPhone: booking.passengerPhone,
        passengerEmail: booking.passengerEmail,
        status: booking.status,
        createdAt: booking.createdAt,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get current user's bookings
// @route   GET /api/bookings/my
// @access  Private
const getMyBookings = async (req, res, next) => {
  try {
    const bookings = await Booking.find({ userId: req.user._id })
      .populate('busId', 'busNumber operatorName from to departureTime arrivalTime busType')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: bookings.length,
      data: bookings,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single booking by ID (MongoDB _id or bookingId)
// @route   GET /api/bookings/:id
// @access  Private
const getBookingById = async (req, res, next) => {
  try {
    const query = req.params.id.startsWith('RLK-')
      ? { bookingId: req.params.id }
      : { _id: req.params.id };

    const booking = await Booking.findOne(query)
      .populate('userId', 'name email phone')
      .populate('busId', 'busNumber operatorName from to departureTime arrivalTime busType ownerId fare');

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found',
      });
    }

    // Check authorization: booking owner, bus owner, or admin
    const isBookingOwner = booking.userId && booking.userId._id.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';
    const isBusOwner =
      booking.busId &&
      booking.busId.ownerId &&
      booking.busId.ownerId.toString() === req.user._id.toString();

    if (!isBookingOwner && !isAdmin && !isBusOwner) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this booking',
      });
    }

    res.status(200).json({
      success: true,
      data: booking,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Cancel a booking
// @route   PUT /api/bookings/:id/cancel
// @access  Private (Booking creator or Admin)
const cancelBooking = async (req, res, next) => {
  try {
    const query = req.params.id.startsWith('RLK-')
      ? { bookingId: req.params.id }
      : { _id: req.params.id };

    const booking = await Booking.findOne(query);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found',
      });
    }

    // Check authorization: must be creator or admin
    if (
      booking.userId.toString() !== req.user._id.toString() &&
      req.user.role !== 'admin'
    ) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to cancel this booking',
      });
    }

    if (booking.status === 'CANCELLED') {
      return res.status(400).json({
        success: false,
        message: 'Booking is already cancelled',
      });
    }

    booking.status = 'CANCELLED';
    booking.cancelledAt = new Date();
    booking.cancellationReason = (req.body.reason || 'Requested by passenger').trim();
    await booking.save();

    res.status(200).json({
      success: true,
      message: 'Booking cancelled successfully',
      data: booking,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get bookings for a specific bus
// @route   GET /api/bookings/bus/:busId
// @access  Private (Owner of bus or Admin)
const getBookingsByBus = async (req, res, next) => {
  try {
    const bus = await Bus.findById(req.params.busId);

    if (!bus) {
      return res.status(404).json({
        success: false,
        message: 'Bus not found',
      });
    }

    // Verify owner of bus or admin
    if (
      req.user.role !== 'admin' &&
      bus.ownerId.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view bookings for this bus',
      });
    }

    const { travelDate } = req.query;
    const query = { busId: bus._id };
    if (travelDate) {
      query.travelDate = travelDate;
    }

    const bookings = await Booking.find(query)
      .populate('userId', 'name email phone')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: bookings.length,
      data: bookings,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all bookings
// @route   GET /api/bookings
// @access  Private (Admin only)
const getAllBookings = async (req, res, next) => {
  try {
    const bookings = await Booking.find()
      .populate('userId', 'name email phone')
      .populate('busId', 'busNumber operatorName from to departureTime arrivalTime')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: bookings.length,
      data: bookings,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createBooking,
  getMyBookings,
  getBookingById,
  cancelBooking,
  getBookingsByBus,
  getAllBookings,
};

