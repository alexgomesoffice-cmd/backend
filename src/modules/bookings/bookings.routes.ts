/**
 * FILE: src/modules/bookings/bookings.routes.ts
 * PURPOSE: HTTP route definitions for booking operations
 *
 * ROUTES:
 * POST /create - Create new booking (protected)
 * GET / - List bookings with filters and pagination (public)
 * GET /:id - Get single booking details (public)
 * GET /availability/:hotelId - Check room availability (public)
 * PUT /:id/status - Update booking status (protected)
 * POST /:id/cancel - Cancel booking (protected)
 *
 * USAGE:
 * import bookingsRouter from '@/modules/bookings/bookings.routes';
 * router.use('/bookings', bookingsRouter);
 */

import { Router } from "express";
import { authenticate } from "@/middlewares/auth.middleware";
import {
  createBookingController,
  getBookingController,
  listBookingsController,
  updateBookingStatusController,
  cancelBookingController,
  getAvailabilityController,
} from "./bookings.controller";

const router = Router();

/**
 * POST /create
 * Create a new booking
 * @requires Authentication
 * @body {hotel_id, check_in, check_out, rooms: [{hotel_room_id, quantity}], special_request?}
 * @returns {booking_id, booking_reference, hotel_id, check_in, check_out, status, reserved_until, total_price, created_at}
 */
router.post("/create", authenticate, createBookingController);

/**
 * GET /
 * List all bookings with filtering and pagination
 * @query {skip?, take?, hotel_id?, end_user_id?, status?}
 * @returns {bookings: [], total, skip, take}
 */
router.get("/", listBookingsController);

/**
 * GET /:id
 * Get booking details by ID
 * @param {id} Booking ID
 * @returns {booking_id, booking_reference, hotel_id, end_user_id, check_in, check_out, status, total_price, locked_price, created_at, updated_at, booking_rooms: []}
 */
router.get("/:id", getBookingController);

/**
 * GET /availability/:hotelId
 * Check room availability for dates
 * @param {hotelId} Hotel ID
 * @query {check_in, check_out}
 * @returns {hotel_id, check_in, check_out, rooms: [{hotel_room_id, room_type, total_inventory, available, reserved, booked, base_price}]}
 */
router.get("/availability/:hotelId", getAvailabilityController);

/**
 * PUT /:id/status
 * Update booking status
 * @requires Authentication
 * @param {id} Booking ID
 * @body {status: RESERVED|BOOKED|CANCELLED|EXPIRED|CHECKED_IN|CHECKED_OUT|NO_SHOW}
 * @returns {booking_id, status, locked_price, updated_at}
 */
router.put("/:id/status", authenticate, updateBookingStatusController);

/**
 * POST /:id/cancel
 * Cancel a booking
 * @requires Authentication
 * @param {id} Booking ID
 * @returns {booking_id, status, locked_price, updated_at}
 */
router.post("/:id/cancel", authenticate, cancelBookingController);

export default router;
