/**
 * FILE: src/modules/bookings/bookings.controller.ts
 * PURPOSE: HTTP request/response handlers for booking operations
 *
 * WHAT IT DOES:
 * - Handles POST /create to create new booking
 * - Handles GET /:id to retrieve booking details
 * - Handles GET / to list bookings with filters
 * - Handles PUT /:id/status to change booking status
 * - Handles POST /:id/cancel to cancel booking
 * - Handles GET /availability/:hotelId to check room availability
 *
 * USAGE:
 * import { createBookingController, getBookingController } from './bookings.controller';
 * router.post('/create', authenticate, createBookingController);
 * router.get('/:id', getBookingController);
 */

import type { Request, Response, NextFunction } from "express";
import {
  createBooking,
  getBooking,
  listBookings,
  updateBookingStatus,
  cancelBooking,
  getAvailability,
} from "./bookings.service";
import {
  validateCreateBookingInput,
  validateUpdateBookingStatusInput,
  validateBookingId,
} from "./bookings.validation";

/**
 * Handles POST /api/bookings/create request
 *
 * REQUIRES: Authentication (end user)
 *
 * REQUEST BODY:
 * {
 *   "hotel_id": 5,
 *   "check_in": "2026-03-15",
 *   "check_out": "2026-03-20",
 *   "rooms": [
 *     { "hotel_room_id": 12, "quantity": 2 },
 *     { "hotel_room_id": 15, "quantity": 1 }
 *   ],
 *   "special_request": "High floor preferred"
 * }
 *
 * @async
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 * @param {NextFunction} next - Express next middleware function
 * @returns {void}
 */
export async function createBookingController(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    // Check authentication
    if (!req.actor) {
      res.status(401).json({
        success: false,
        message: "Unauthorized",
        error: { code: "UNAUTHORIZED" },
      });
      return;
    }

    const bookingData = req.body;

    // Validate input
    const validation = validateCreateBookingInput(bookingData);
    if (!validation.isValid) {
      res.status(400).json({
        success: false,
        message: "Validation failed",
        error: { code: "VALIDATION_ERROR", details: validation.errors },
      });
      return;
    }

    // Call service
    const booking = await createBooking(bookingData, req.actor.id);

    // Return success
    res.status(201).json({
      success: true,
      message: "Booking created successfully",
      data: booking,
    });
  } catch (error: any) {
    // Handle service errors
    if (error.message === "HOTEL_NOT_FOUND") {
      res.status(404).json({
        success: false,
        message: "Hotel not found",
        error: { code: "HOTEL_NOT_FOUND" },
      });
      return;
    }

    if (error.message === "ROOM_NOT_FOUND") {
      res.status(404).json({
        success: false,
        message: "Room not found",
        error: { code: "ROOM_NOT_FOUND" },
      });
      return;
    }

    if (error.message === "BOOKING_NOT_AVAILABLE") {
      res.status(400).json({
        success: false,
        message: "Room not available for selected dates",
        error: { code: "BOOKING_NOT_AVAILABLE" },
      });
      return;
    }

    if (error.message === "SPAM_LIMIT_EXCEEDED") {
      res.status(400).json({
        success: false,
        message: "You have too many active bookings. Cancel some bookings first.",
        error: { code: "SPAM_LIMIT_EXCEEDED" },
      });
      return;
    }

    // Unexpected error
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: { code: "SERVER_ERROR" },
    });
  }
}

/**
 * Handles GET /api/bookings/:id request
 *
 * URL PARAMS:
 * id - Booking ID
 *
 * @async
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 * @param {NextFunction} next - Express next middleware function
 * @returns {void}
 */
export async function getBookingController(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const bookingId = parseInt((req.params.id as string) || "0", 10);

    // Validate booking ID
    const validation = validateBookingId(bookingId);
    if (!validation.isValid) {
      res.status(400).json({
        success: false,
        message: "Validation failed",
        error: { code: "VALIDATION_ERROR", details: validation.errors },
      });
      return;
    }

    // Call service
    const booking = await getBooking(bookingId);

    // Return success
    res.status(200).json({
      success: true,
      message: "Booking retrieved successfully",
      data: booking,
    });
  } catch (error: any) {
    // Handle service errors
    if (error.message === "BOOKING_NOT_FOUND") {
      res.status(404).json({
        success: false,
        message: "Booking not found",
        error: { code: "BOOKING_NOT_FOUND" },
      });
      return;
    }

    // Unexpected error
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: { code: "SERVER_ERROR" },
    });
  }
}

/**
 * Handles GET /api/bookings request
 *
 * QUERY PARAMS:
 * skip - Records to skip (default: 0)
 * take - Records to return (default: 10, max: 100)
 * hotel_id - Filter by hotel (optional)
 * end_user_id - Filter by end user (optional)
 * status - Filter by status (optional)
 *
 * @async
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 * @param {NextFunction} next - Express next middleware function
 * @returns {void}
 */
export async function listBookingsController(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    // Parse pagination
    const skip = Math.max(0, parseInt(req.query.skip as string) || 0);
    const take = Math.min(100, Math.max(1, parseInt(req.query.take as string) || 10));

    // Parse filters
    const filters: any = {};
    if (req.query.hotel_id) {
      filters.hotel_id = parseInt(req.query.hotel_id as string);
    }
    if (req.query.end_user_id) {
      filters.end_user_id = parseInt(req.query.end_user_id as string);
    }
    if (req.query.status) {
      filters.status = req.query.status;
    }

    // Call service
    const result = await listBookings(filters, skip, take);

    // Return success
    res.status(200).json({
      success: true,
      message: "Bookings retrieved successfully",
      data: result,
    });
  } catch (error: any) {
    // Unexpected error
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: { code: "SERVER_ERROR" },
    });
  }
}

/**
 * Handles PUT /api/bookings/:id/status request
 *
 * REQUIRES: Authentication (hotel admin or system admin)
 *
 * URL PARAMS:
 * id - Booking ID
 *
 * REQUEST BODY:
 * {
 *   "status": "BOOKED"
 * }
 *
 * @async
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 * @param {NextFunction} next - Express next middleware function
 * @returns {void}
 */
export async function updateBookingStatusController(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    // Check authentication
    if (!req.actor) {
      res.status(401).json({
        success: false,
        message: "Unauthorized",
        error: { code: "UNAUTHORIZED" },
      });
      return;
    }

    const bookingId = parseInt((req.params.id as string) || "0", 10);
    const { status } = req.body;

    // Validate booking ID
    const idValidation = validateBookingId(bookingId);
    if (!idValidation.isValid) {
      res.status(400).json({
        success: false,
        message: "Validation failed",
        error: { code: "VALIDATION_ERROR", details: idValidation.errors },
      });
      return;
    }

    // Validate status
    const statusValidation = validateUpdateBookingStatusInput({ status });
    if (!statusValidation.isValid) {
      res.status(400).json({
        success: false,
        message: "Validation failed",
        error: { code: "VALIDATION_ERROR", details: statusValidation.errors },
      });
      return;
    }

    // Call service
    const updated = await updateBookingStatus(bookingId, status);

    // Return success
    res.status(200).json({
      success: true,
      message: "Booking status updated successfully",
      data: updated,
    });
  } catch (error: any) {
    // Handle service errors
    if (error.message === "BOOKING_NOT_FOUND") {
      res.status(404).json({
        success: false,
        message: "Booking not found",
        error: { code: "BOOKING_NOT_FOUND" },
      });
      return;
    }

    // Unexpected error
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: { code: "SERVER_ERROR" },
    });
  }
}

/**
 * Handles POST /api/bookings/:id/cancel request
 *
 * REQUIRES: Authentication (end user or admin)
 *
 * URL PARAMS:
 * id - Booking ID to cancel
 *
 * @async
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 * @param {NextFunction} next - Express next middleware function
 * @returns {void}
 */
export async function cancelBookingController(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    // Check authentication
    if (!req.actor) {
      res.status(401).json({
        success: false,
        message: "Unauthorized",
        error: { code: "UNAUTHORIZED" },
      });
      return;
    }

    const bookingId = parseInt((req.params.id as string) || "0", 10);

    // Validate booking ID
    const validation = validateBookingId(bookingId);
    if (!validation.isValid) {
      res.status(400).json({
        success: false,
        message: "Validation failed",
        error: { code: "VALIDATION_ERROR", details: validation.errors },
      });
      return;
    }

    // Call service
    const result = await cancelBooking(bookingId);

    // Return success
    res.status(200).json({
      success: true,
      message: "Booking cancelled successfully",
      data: result,
    });
  } catch (error: any) {
    // Handle service errors
    if (error.message === "BOOKING_NOT_FOUND") {
      res.status(404).json({
        success: false,
        message: "Booking not found",
        error: { code: "BOOKING_NOT_FOUND" },
      });
      return;
    }

    // Unexpected error
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: { code: "SERVER_ERROR" },
    });
  }
}

/**
 * Handles GET /api/bookings/availability/:hotelId request
 *
 * QUERY PARAMS:
 * check_in - Check-in date (ISO format) (required)
 * check_out - Check-out date (ISO format) (required)
 *
 * URL PARAMS:
 * hotelId - Hotel ID
 *
 * @async
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 * @param {NextFunction} next - Express next middleware function
 * @returns {void}
 */
export async function getAvailabilityController(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const hotelId = parseInt((req.params.hotelId as string) || "0", 10);
    const checkIn = req.query.check_in as string;
    const checkOut = req.query.check_out as string;

    // Validate inputs
    if (!hotelId || hotelId <= 0) {
      res.status(400).json({
        success: false,
        message: "Validation failed",
        error: { code: "VALIDATION_ERROR", details: ["hotelId is required and must be > 0"] },
      });
      return;
    }

    if (!checkIn) {
      res.status(400).json({
        success: false,
        message: "Validation failed",
        error: { code: "VALIDATION_ERROR", details: ["check_in is required"] },
      });
      return;
    }

    if (!checkOut) {
      res.status(400).json({
        success: false,
        message: "Validation failed",
        error: { code: "VALIDATION_ERROR", details: ["check_out is required"] },
      });
      return;
    }

    // Validate dates
    const checkInDate = new Date(checkIn);
    const checkOutDate = new Date(checkOut);

    if (isNaN(checkInDate.getTime())) {
      res.status(400).json({
        success: false,
        message: "Validation failed",
        error: { code: "VALIDATION_ERROR", details: ["check_in must be a valid ISO date"] },
      });
      return;
    }

    if (isNaN(checkOutDate.getTime())) {
      res.status(400).json({
        success: false,
        message: "Validation failed",
        error: { code: "VALIDATION_ERROR", details: ["check_out must be a valid ISO date"] },
      });
      return;
    }

    if (checkOutDate <= checkInDate) {
      res.status(400).json({
        success: false,
        message: "Validation failed",
        error: { code: "VALIDATION_ERROR", details: ["check_out must be after check_in"] },
      });
      return;
    }

    // Call service
    const availability = await getAvailability(hotelId, checkIn, checkOut);

    // Return success
    res.status(200).json({
      success: true,
      message: "Availability retrieved successfully",
      data: availability,
    });
  } catch (error: any) {
    // Handle service errors
    if (error.message === "HOTEL_NOT_FOUND") {
      res.status(404).json({
        success: false,
        message: "Hotel not found",
        error: { code: "HOTEL_NOT_FOUND" },
      });
      return;
    }

    // Unexpected error
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: { code: "SERVER_ERROR" },
    });
  }
}
