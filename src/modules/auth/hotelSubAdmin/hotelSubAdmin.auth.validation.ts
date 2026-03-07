/**
 * FILE: src/modules/auth/hotelSubAdmin/hotelSubAdmin.auth.validation.ts
 * PURPOSE: Input validation for hotel sub-admin authentication
 *
 * WHAT IT DOES:
 * - Validates email and password format for login
 * - Validates Authorization header format for logout
 * - Returns validation errors if checks fail
 *
 * USAGE:
 * import { validateLoginInput, validateLogoutInput } from './hotelSubAdmin.auth.validation';
 * const result = validateLoginInput(email, password);
 * if (!result.isValid) console.log(result.errors);
 */

/**
 * Validates email and password input for hotel sub-admin login
 *
 * CHECKS:
 * - Email exists and is a string
 * - Email is non-empty
 * - Email matches valid email format regex
 * - Password exists and is a string
 * - Password is non-empty
 * - Password length >= 1
 *
 * @param {string} email - Hotel sub-admin email address
 * @param {string} password - Plain text password
 * @returns {{isValid: boolean, errors: string[]}} Validation result with error messages
 *
 * @example
 * const result = validateLoginInput("subadmin@grandhotel.com", "password123");
 * if (!result.isValid) {
 *   console.log(result.errors); // ["Email is invalid"]
 * }
 */
export function validateLoginInput(
  email: unknown,
  password: unknown
): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];

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
  } else if (password.length < 1) {
    errors.push("Password must be at least 1 character");
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Validates Authorization header format for hotel sub-admin logout
 *
 * CHECKS:
 * - Header exists and is a string
 * - Header starts with "Bearer " (case-sensitive)
 * - Token part after "Bearer " is non-empty
 *
 * @param {string} authHeader - Authorization header value
 * @returns {{isValid: boolean, errors: string[]}} Validation result with error messages
 *
 * @example
 * const result = validateLogoutInput("Bearer eyJhbGc...");
 * if (!result.isValid) {
 *   console.log(result.errors); // ["Invalid Bearer token format"]
 * }
 */
export function validateLogoutInput(authHeader: unknown): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  // Check header exists and is string
  if (!authHeader || typeof authHeader !== "string") {
    errors.push("Authorization header is required");
    return { isValid: false, errors };
  }

  // Check Bearer prefix
  if (!authHeader.startsWith("Bearer ")) {
    errors.push("Invalid Bearer token format");
    return { isValid: false, errors };
  }

  // Check token is not empty
  const token = authHeader.slice(7); // Remove "Bearer "
  if (!token || token.trim() === "") {
    errors.push("Token cannot be empty");
    return { isValid: false, errors };
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}
