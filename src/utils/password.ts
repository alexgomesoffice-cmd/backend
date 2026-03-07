/**
 * FILE: src/utils/password.ts
 * PURPOSE: Password hashing and comparison utilities
 *
 * CURRENT STATUS: STUB IMPLEMENTATION (no actual hashing)
 * WHY STUBS?
 * - You mentioned skipping password hashing for now
 * - These stubs allow all login/auth code to work without bcryptjs
 * - In Phase 11, we replace these with real bcryptjs code
 * - No other files need to change when we add real hashing
 *
 * IMPORTANT:
 * - This is the ONLY file that will import bcryptjs
 * - All services use these functions instead of bcryptjs directly
 * - When we enable hashing in Phase 11, only this file changes
 *
 * STUBS:
 * - hashPassword(plain) → returns plain text (no hashing)
 * - comparePassword(plain, stored) → plain === stored
 *
 * When we add real hashing in Phase 11:
 * - hashPassword(plain) → bcrypt.hash(plain, 10)
 * - comparePassword(plain, stored) → bcrypt.compare(plain, stored)
 */

/**
 * Hash a plain text password
 *
 * CURRENT: Returns plain text (stub)
 * PHASE 11: Will use bcrypt.hash(plain, 10)
 *
 * @param plainPassword - The password as user typed it
 * @returns Hashed password (currently returns plain text)
 *
 * EXAMPLE:
 * const plain = "user123";
 * const hashed = await hashPassword(plain);
 * // Returns: "user123" (stub) or "$2b$10$..." (real bcrypt)
 */
export async function hashPassword(plainPassword: string): Promise<string> {
  // STUB: Just return the plain password
  // TODO [PHASE 11]: Replace with bcrypt.hash(plainPassword, 10)
  return plainPassword;
}

/**
 * Compare a plain text password with a stored hash
 *
 * CURRENT: Direct comparison (stub)
 * PHASE 11: Will use bcrypt.compare(plain, stored)
 *
 * @param plainPassword - Password as user typed it
 * @param storedHash - Password stored in database
 * @returns true if passwords match, false otherwise
 *
 * EXAMPLE:
 * const userInput = "user123";
 * const dbPassword = "user123"; (or "$2b$10$..." after Phase 11)
 * const isMatch = await comparePassword(userInput, dbPassword);
 * // Returns: true (stub) or bcrypt comparison result (real)
 */
export async function comparePassword(
  plainPassword: string,
  storedHash: string
): Promise<boolean> {
  // STUB: Simple string comparison
  // TODO [PHASE 11]: Replace with bcrypt.compare(plainPassword, storedHash)
  return plainPassword === storedHash;
}
