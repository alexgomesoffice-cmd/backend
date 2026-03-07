/**
 * FILE: src/modules/bookings/bookings.validation.ts
 * PURPOSE: Input validation for all booking operations
 *
 * WHAT IT DOES:
 * - validateCreateBookingInput() - Validates booking creation data
 * - validateUpdateBookingStatusInput() - Validates status change
 * - validateBookingId() - Validates booking ID format
 * - validateBookingStatus() - Validates booking status value
 * - validateRoomLineItem() - Validates a room line item in booking
 *
 * USAGE:
 * import { validateCreateBookingInput } from './bookings.validation';
 * const { isValid, errors } = validateCreateBookingInput(bookingData);
 */

/**
 * Validates booking creation input
 *
 * REQUIRED FIELDS:
 * - hotel_id (number, > 0)
 * - check_in (ISO date string, must be today or future)
 * - check_out (ISO date string, must be after check_in)
 * - rooms (array of room line items, at least 1)
 *
 * OPTIONAL FIELDS:
 * - special_request (string, max 5000 chars)
 *
 * ROOMS ARRAY FORMAT:
 * [
 *   {
 *     hotel_room_id: number,
 *     quantity: number (>= 1)
 *   }
 * ]
 *
 * @param {any} bookingData - Booking data object
 * @returns {object} { isValid: boolean, errors: string[] }
 *
 * @example
 * const result = validateCreateBookingInput({
 *   hotel_id: 5,
 *   check_in: "2026-03-15",
 *   check_out: "2026-03-20",
 *   rooms: [
 *     { hotel_room_id: 12, quantity: 2 },
 *     { hotel_room_id: 15, quantity: 1 }
 *   ]
 * });
 */
export function validateCreateBookingInput(bookingData: any) {
  const errors: string[] = [];

  // Validate hotel_id (required)
  if (bookingData.hotel_id === undefined || bookingData.hotel_id === null) {
    errors.push("hotel_id is required");
  } else if (typeof bookingData.hotel_id !== "number" || !Number.isInteger(bookingData.hotel_id)) {
    errors.push("hotel_id must be an integer");
  } else if (bookingData.hotel_id <= 0) {
    errors.push("hotel_id must be greater than 0");
  }

  // Validate check_in (required)
  if (!bookingData.check_in) {
    errors.push("check_in is required");
  } else {
    const checkInDate = new Date(bookingData.check_in);
    if (isNaN(checkInDate.getTime())) {
      errors.push("check_in must be a valid ISO date");
    } else {
      // Check if date is today or future (midnight comparison)
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (checkInDate < today) {
        errors.push("check_in must be today or in the future");
      }
    }
  }

  // Validate check_out (required)
  if (!bookingData.check_out) {
    errors.push("check_out is required");
  } else {
    const checkOutDate = new Date(bookingData.check_out);
    if (isNaN(checkOutDate.getTime())) {
      errors.push("check_out must be a valid ISO date");
    } else if (bookingData.check_in) {
      const checkInDate = new Date(bookingData.check_in);
      checkInDate.setHours(0, 0, 0, 0);
      checkOutDate.setHours(0, 0, 0, 0);
      if (checkOutDate <= checkInDate) {
        errors.push("check_out must be after check_in");
      } else {
        const maxDays = 365;
        const daysDiff = Math.floor((checkOutDate.getTime() - checkInDate.getTime()) / (1000 * 60 * 60 * 24));
        if (daysDiff > maxDays) {
          errors.push(`Maximum booking length is ${maxDays} days`);
        }
      }
    }
  }

  // Validate rooms (required, array with at least 1 item)
  if (!Array.isArray(bookingData.rooms)) {
    errors.push("rooms must be an array");
  } else if (bookingData.rooms.length === 0) {
    errors.push("At least one room must be selected");
  } else {
    // Validate each room
    bookingData.rooms.forEach((room: any, index: number) => {
      const roomErrors = validateRoomLineItem(room);
      if (!roomErrors.isValid) {
        errors.push(`Room ${index}: ${roomErrors.errors.join(", ")}`);
      }
    });
  }

  // Validate special_request (optional)
  if (bookingData.special_request !== undefined && bookingData.special_request !== null) {
    if (typeof bookingData.special_request !== "string") {
      errors.push("special_request must be a string");
    } else if (bookingData.special_request.length > 5000) {
      errors.push("special_request cannot exceed 5000 characters");
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Validates a room line item in a booking
 *
 * REQUIRED FIELDS:
 * - hotel_room_id (number, > 0)
 * - quantity (number, >= 1)
 *
 * @param {any} room - Room line item object
 * @returns {object} { isValid: boolean, errors: string[] }
 *
 * @example
 * const result = validateRoomLineItem({
 *   hotel_room_id: 12,
 *   quantity: 2
 * });
 */
export function validateRoomLineItem(room: any) {
  const errors: string[] = [];

  // Validate hotel_room_id (required)
  if (room.hotel_room_id === undefined || room.hotel_room_id === null) {
    errors.push("hotel_room_id is required");
  } else if (typeof room.hotel_room_id !== "number" || !Number.isInteger(room.hotel_room_id)) {
    errors.push("hotel_room_id must be an integer");
  } else if (room.hotel_room_id <= 0) {
    errors.push("hotel_room_id must be greater than 0");
  }

  // Validate quantity (required)
  if (room.quantity === undefined || room.quantity === null) {
    errors.push("quantity is required");
  } else if (typeof room.quantity !== "number" || !Number.isInteger(room.quantity)) {
    errors.push("quantity must be an integer");
  } else if (room.quantity < 1) {
    errors.push("quantity must be at least 1");
  } else if (room.quantity > 100) {
    errors.push("quantity cannot exceed 100");
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Validates booking status update input
 *
 * REQUIRED FIELDS:
 * - status (one of: RESERVED, BOOKED, CANCELLED, EXPIRED, CHECKED_IN, CHECKED_OUT, NO_SHOW)
 *
 * @param {any} statusData - Status update data
 * @returns {object} { isValid: boolean, errors: string[] }
 *
 * @example
 * const result = validateUpdateBookingStatusInput({
 *   status: "BOOKED"
 * });
 */
export function validateUpdateBookingStatusInput(statusData: any) {
  const errors: string[] = [];

  if (!statusData.status) {
    errors.push("status is required");
  } else if (typeof statusData.status !== "string") {
    errors.push("status must be a string");
  } else if (!["RESERVED", "BOOKED", "CANCELLED", "EXPIRED", "CHECKED_IN", "CHECKED_OUT", "NO_SHOW"].includes(statusData.status)) {
    errors.push("status must be one of: RESERVED, BOOKED, CANCELLED, EXPIRED, CHECKED_IN, CHECKED_OUT, NO_SHOW");
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Validates booking ID format
 *
 * CONSTRAINTS:
 * - Must be a number
 * - Must be greater than 0
 *
 * @param {any} bookingId - Booking ID value
 * @returns {object} { isValid: boolean, errors: string[] }
 *
 * @example
 * const result = validateBookingId(456);
 */
export function validateBookingId(bookingId: any) {
  const errors: string[] = [];

  if (bookingId === undefined || bookingId === null) {
    errors.push("Booking ID is required");
  } else if (typeof bookingId !== "number" || !Number.isInteger(bookingId)) {
    errors.push("Booking ID must be an integer");
  } else if (bookingId <= 0) {
    errors.push("Booking ID must be greater than 0");
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Validates booking status value
 *
 * ALLOWED VALUES:
 * - RESERVED
 * - BOOKED
 * - CANCELLED
 * - EXPIRED
 * - CHECKED_IN
 * - CHECKED_OUT
 * - NO_SHOW
 *
 * @param {any} status - Booking status value
 * @returns {object} { isValid: boolean, errors: string[] }
 *
 * @example
 * const result = validateBookingStatus("BOOKED");
 */
export function validateBookingStatus(status: any) {
  const errors: string[] = [];
  const allowedStatuses = ["RESERVED", "BOOKED", "CANCELLED", "EXPIRED", "CHECKED_IN", "CHECKED_OUT", "NO_SHOW"];

  if (!status) {
    errors.push("Booking status is required");
  } else if (typeof status !== "string") {
    errors.push("Booking status must be a string");
  } else if (!allowedStatuses.includes(status.toUpperCase())) {
    errors.push(`Booking status must be one of: ${allowedStatuses.join(", ")}`);
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}
