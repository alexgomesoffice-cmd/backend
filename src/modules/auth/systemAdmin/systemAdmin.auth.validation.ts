/**
 * FILE: src/modules/auth/systemAdmin/systemAdmin.auth.validation.ts
 * PURPOSE: Input validation for system admin authentication requests
 *
 * WHAT IT DOES:
 * - Validates login request body (email, password)
 * - Validates logout request headers (Authorization token)
 * - Ensures data types and formats are correct before database operations
 * - Prevents bad data from reaching the service layer
 *
 * WHY SEPARATE VALIDATION:
 * - Controller should focus on HTTP handling
 * - Service should focus on business logic
 * - Validation is its own concern (can be reused, tested separately)
 * - Makes code more maintainable and modular
 */

/**
 * Login Request Body Validation
 *
 * CHECKS:
 * - email: Must be a non-empty string that looks like an email
 * - password: Must be a non-empty string (at least 1 character)
 *
 * @param email - Email from request body
 * @param password - Password from request body
 * @returns Object with { isValid: boolean, errors: string[] }
 *
 * EXAMPLE:
 * const result = validateLoginInput("admin@myhotels.com", "admin123");
 * // { isValid: true, errors: [] }
 *
 * const result = validateLoginInput("", "pass");
 * // { isValid: false, errors: ["Email is required", "Email must be valid format"] }
 */
export function validateLoginInput(
  email: unknown,
  password: unknown
): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];

  // Check email exists and is string
  if (!email || typeof email !== "string") {
    errors.push("Email is required and must be a string");
  }

  // Check email is not empty
  if (typeof email === "string" && email.trim() === "") {
    errors.push("Email cannot be empty");
  }

  // Check email format (simple check: must have @ and .)
  if (typeof email === "string" && email.trim()) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      errors.push("Email must be valid format (example@domain.com)");
    }
  }

  // Check password exists and is string
  if (!password || typeof password !== "string") {
    errors.push("Password is required and must be a string");
  }

  // Check password is not empty
  if (typeof password === "string" && password.trim() === "") {
    errors.push("Password cannot be empty");
  }

  // Check password minimum length (at least 1 character for now, Phase 11 will enforce bcrypt)
  if (typeof password === "string" && password.length < 1) {
    errors.push("Password must be at least 1 character");
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Logout Request Validation
 *
 * CHECKS:
 * - Authorization header exists
 * - Authorization header has "Bearer " prefix
 * - Token is not empty after "Bearer "
 *
 * @param authHeader - Authorization header value (e.g., "Bearer eyJhb...")
 * @returns Object with { isValid: boolean, errors: string[] }
 *
 * EXAMPLE:
 * const result = validateLogoutInput("Bearer eyJhbGc...");
 * // { isValid: true, errors: [] }
 *
 * const result = validateLogoutInput("Invalid");
 * // { isValid: false, errors: ["Authorization header must start with 'Bearer '"] }
 */
export function validateLogoutInput(authHeader: unknown): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  // Check header exists
  if (!authHeader || typeof authHeader !== "string") {
    errors.push("Authorization header is required");
    return { isValid: false, errors };
  }

  // Check header starts with "Bearer "
  if (!authHeader.startsWith("Bearer ")) {
    errors.push('Authorization header must start with "Bearer "');
    return { isValid: false, errors };
  }

  // Check token part is not empty
  const token = authHeader.substring(7); // Remove "Bearer "
  if (!token || token.trim() === "") {
    errors.push("Token cannot be empty");
    return { isValid: false, errors };
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}
