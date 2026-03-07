/**
 * FILE: src/modules/rooms/rooms.validation.ts
 * PURPOSE: Input validation for all room operations
 *
 * WHAT IT DOES:
 * - validateCreateRoomInput() - Validates room type creation
 * - validateUpdateRoomInput() - Validates room type updates
 * - validateRoomId() - Validates room ID format
 * - validateApprovalStatus() - Validates room approval status
 *
 * USAGE:
 * import { validateCreateRoomInput } from './rooms.validation';
 * const { isValid, errors } = validateCreateRoomInput(roomData);
 */

/**
 * Validates room type creation input
 *
 * REQUIRED FIELDS:
 * - room_type (string, 2+ chars, max 150)
 *
 * OPTIONAL FIELDS:
 * - description (string, max 5000 chars)
 * - base_price (number, required, must be > 0)
 * - room_size (string, max 50 chars)
 *
 * @param {any} roomData - Room data object
 * @returns {object} { isValid: boolean, errors: string[] }
 *
 * @example
 * const result = validateCreateRoomInput({
 *   room_type: "Deluxe Double",
 *   base_price: 150.50,
 *   description: "Spacious room with queen bed",
 *   room_size: "40m²"
 * });
 * if (!result.isValid) {
 *   console.log(result.errors);
 * }
 */
export function validateCreateRoomInput(roomData: any) {
  const errors: string[] = [];

  // Validate room_type (required)
  if (!roomData.room_type) {
    errors.push("room_type is required");
  } else if (typeof roomData.room_type !== "string") {
    errors.push("room_type must be a string");
  } else if (roomData.room_type.trim().length < 2) {
    errors.push("room_type must be at least 2 characters");
  } else if (roomData.room_type.length > 150) {
    errors.push("room_type cannot exceed 150 characters");
  }

  // Validate base_price (required)
  if (roomData.base_price === undefined || roomData.base_price === null) {
    errors.push("base_price is required");
  } else {
    const price = parseFloat(roomData.base_price);
    if (isNaN(price)) {
      errors.push("base_price must be a valid number");
    } else if (price <= 0) {
      errors.push("base_price must be greater than 0");
    } else if (price > 999999.99) {
      errors.push("base_price cannot exceed 999999.99");
    }
  }

  // Validate description (optional)
  if (roomData.description !== undefined && roomData.description !== null) {
    if (typeof roomData.description !== "string") {
      errors.push("description must be a string");
    } else if (roomData.description.length > 5000) {
      errors.push("description cannot exceed 5000 characters");
    }
  }

  // Validate room_size (optional)
  if (roomData.room_size !== undefined && roomData.room_size !== null) {
    if (typeof roomData.room_size !== "string") {
      errors.push("room_size must be a string");
    } else if (roomData.room_size.length > 50) {
      errors.push("room_size cannot exceed 50 characters");
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Validates room type update input
 *
 * CONSTRAINTS:
 * - All fields optional
 * - At least one field required for update
 * - Same validation rules as create for each field
 *
 * @param {any} roomData - Partial room data object
 * @returns {object} { isValid: boolean, errors: string[] }
 *
 * @example
 * const result = validateUpdateRoomInput({
 *   base_price: 175.00
 * });
 * if (!result.isValid) {
 *   console.log(result.errors);
 * }
 */
export function validateUpdateRoomInput(roomData: any) {
  const errors: string[] = [];

  // Check at least one field is provided
  const hasField =
    roomData.room_type !== undefined ||
    roomData.description !== undefined ||
    roomData.base_price !== undefined ||
    roomData.room_size !== undefined;

  if (!hasField) {
    errors.push("At least one field is required for update");
    return { isValid: false, errors };
  }

  // Validate room_type (optional)
  if (roomData.room_type !== undefined && roomData.room_type !== null) {
    if (typeof roomData.room_type !== "string") {
      errors.push("room_type must be a string");
    } else if (roomData.room_type.trim().length < 2) {
      errors.push("room_type must be at least 2 characters");
    } else if (roomData.room_type.length > 150) {
      errors.push("room_type cannot exceed 150 characters");
    }
  }

  // Validate base_price (optional)
  if (roomData.base_price !== undefined && roomData.base_price !== null) {
    const price = parseFloat(roomData.base_price);
    if (isNaN(price)) {
      errors.push("base_price must be a valid number");
    } else if (price <= 0) {
      errors.push("base_price must be greater than 0");
    } else if (price > 999999.99) {
      errors.push("base_price cannot exceed 999999.99");
    }
  }

  // Validate description (optional)
  if (roomData.description !== undefined && roomData.description !== null) {
    if (typeof roomData.description !== "string") {
      errors.push("description must be a string");
    } else if (roomData.description.length > 5000) {
      errors.push("description cannot exceed 5000 characters");
    }
  }

  // Validate room_size (optional)
  if (roomData.room_size !== undefined && roomData.room_size !== null) {
    if (typeof roomData.room_size !== "string") {
      errors.push("room_size must be a string");
    } else if (roomData.room_size.length > 50) {
      errors.push("room_size cannot exceed 50 characters");
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Validates room ID format
 *
 * CONSTRAINTS:
 * - Must be a number
 * - Must be greater than 0
 *
 * @param {any} roomId - Room ID value
 * @returns {object} { isValid: boolean, errors: string[] }
 *
 * @example
 * const result = validateRoomId(123);
 * if (!result.isValid) {
 *   console.log(result.errors);
 * }
 */
export function validateRoomId(roomId: any) {
  const errors: string[] = [];

  if (roomId === undefined || roomId === null) {
    errors.push("Room ID is required");
  } else if (typeof roomId !== "number" || !Number.isInteger(roomId)) {
    errors.push("Room ID must be an integer");
  } else if (roomId <= 0) {
    errors.push("Room ID must be greater than 0");
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Validates room approval status
 *
 * ALLOWED VALUES:
 * - PENDING
 * - APPROVED
 * - REJECTED
 *
 * @param {any} status - Approval status value
 * @returns {object} { isValid: boolean, errors: string[] }
 *
 * @example
 * const result = validateApprovalStatus("APPROVED");
 * if (!result.isValid) {
 *   console.log(result.errors);
 * }
 */
export function validateApprovalStatus(status: any) {
  const errors: string[] = [];
  const allowedStatuses = ["PENDING", "APPROVED", "REJECTED"];

  if (!status) {
    errors.push("Approval status is required");
  } else if (typeof status !== "string") {
    errors.push("Approval status must be a string");
  } else if (!allowedStatuses.includes(status.toUpperCase())) {
    errors.push(`Approval status must be one of: ${allowedStatuses.join(", ")}`);
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}
