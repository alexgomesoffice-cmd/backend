/**
 * FILE: src/modules/admin/systemAdmin/systemAdmin.features.validation.ts
 * PURPOSE: Input validation for system admin feature operations
 *
 * WHAT IT DOES:
 * - Validates email and password for creating new system admin accounts
 * - Validates admin ID for status update operations
 * - Validates input data for all admin management endpoints
 *
 * USAGE:
 * import { validateCreateAdminInput } from './systemAdmin.features.validation';
 * const result = validateCreateAdminInput(name, email, password);
 * if (!result.isValid) console.log(result.errors);
 */

/**
 * Validates input for creating a new system admin account
 *
 * CHECKS:
 * - Name exists and is a string, non-empty, length >= 3
 * - Email exists and is a string, non-empty, matches regex
 * - Password exists and is a string, non-empty, length >= 6
 *
 * @param {string} name - System admin name
 * @param {string} email - System admin email address
 * @param {string} password - Plain text password
 * @returns {{isValid: boolean, errors: string[]}} Validation result with error messages
 *
 * @example
 * const result = validateCreateAdminInput("Admin Name", "admin@myhotels.com", "password123");
 * if (!result.isValid) {
 *   console.log(result.errors); // Error messages
 * }
 */
export function validateCreateAdminInput(
  name: unknown,
  email: unknown,
  password: unknown
): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];

  // Name validation
  if (!name || typeof name !== "string") {
    errors.push("Name is required and must be a string");
  } else if (name.trim() === "") {
    errors.push("Name cannot be empty");
  } else if (name.trim().length < 3) {
    errors.push("Name must be at least 3 characters");
  }

  // Email validation
  if (!email || typeof email !== "string") {
    errors.push("Email is required and must be a string");
  } else if (email.trim() === "") {
    errors.push("Email cannot be empty");
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    errors.push("Email is invalid");
  }

  // Password validation
  if (!password || typeof password !== "string") {
    errors.push("Password is required and must be a string");
  } else if (password === "") {
    errors.push("Password cannot be empty");
  } else if (password.length < 6) {
    errors.push("Password must be at least 6 characters");
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Validates admin ID parameter for update operations
 *
 * CHECKS:
 * - ID exists and is a valid number
 * - ID is greater than 0
 *
 * @param {unknown} adminId - System admin ID to validate
 * @returns {{isValid: boolean, errors: string[]}} Validation result with error messages
 *
 * @example
 * const result = validateAdminId(5);
 * if (!result.isValid) {
 *   console.log(result.errors); // ["Invalid admin ID"]
 * }
 */
export function validateAdminId(adminId: unknown): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  // Check if ID is provided and is a number
  if (adminId === null || adminId === undefined) {
    errors.push("Admin ID is required");
  } else if (typeof adminId !== "number") {
    // Try to parse as number if string
    const parsed = Number(adminId);
    if (isNaN(parsed)) {
      errors.push("Admin ID must be a valid number");
    } else if (parsed <= 0) {
      errors.push("Admin ID must be greater than 0");
    }
  } else if (adminId <= 0) {
    errors.push("Admin ID must be greater than 0");
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Validates status update input for system admin account
 *
 * CHECKS:
 * - is_active exists and is a boolean
 * - is_blocked exists and is a boolean
 *
 * @param {unknown} is_active - Account active status
 * @param {unknown} is_blocked - Account blocked status
 * @returns {{isValid: boolean, errors: string[]}} Validation result with error messages
 *
 * @example
 * const result = validateStatusUpdate(true, false);
 * if (!result.isValid) {
 *   console.log(result.errors); // Error messages
 * }
 */
export function validateStatusUpdate(
  is_active: unknown,
  is_blocked: unknown
): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];

  // Check is_active
  if (is_active !== undefined && typeof is_active !== "boolean") {
    errors.push("is_active must be a boolean");
  }

  // Check is_blocked
  if (is_blocked !== undefined && typeof is_blocked !== "boolean") {
    errors.push("is_blocked must be a boolean");
  }

  // At least one field should be provided
  if (is_active === undefined && is_blocked === undefined) {
    errors.push("At least one status field (is_active or is_blocked) must be provided");
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}
