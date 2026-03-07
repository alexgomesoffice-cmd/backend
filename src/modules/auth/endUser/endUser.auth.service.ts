/**
 * FILE: src/modules/auth/endUser/endUser.auth.service.ts
 * PURPOSE: Business logic for end user authentication
 *
 * WHAT IT DOES:
 * - Authenticates end user by email/password
 * - Generates JWT token on successful login
 * - Validates tokens and adds them to blacklist on logout
 * - Checks end user account status (is_blocked, email_verified, deleted_at)
 *
 * USAGE:
 * import { loginEndUser, logoutEndUser } from './endUser.auth.service';
 * const result = await loginEndUser(email, password);
 * const logout = await logoutEndUser(token, userId);
 *
 * DATABASE TABLES:
 * - end_users: End user accounts (email, password, is_blocked, email_verified, deleted_at)
 * - blacklisted_tokens: Stores hashed tokens for invalidation on logout
 */

import { prisma } from "@/config/prisma";
import { generateToken, verifyToken } from "@/utils/token";
import { comparePassword } from "@/utils/password";
import crypto from "crypto";

/**
 * Authenticates end user by email and password
 *
 * WORKFLOW:
 * 1. Find end user in database by email
 * 2. Compare provided password with stored password hash
 * 3. Check account is not blocked (is_blocked === false)
 * 4. Check account is not soft-deleted (deleted_at === null)
 * 5. Generate JWT token with payload {id: end_user_id, role: 'END_USER'}
 * 6. Return token and user object
 *
 * NOTE: End users do NOT require email verification to login (email_verified check is skipped)
 * Email verification is optional and used for trust/privileges, not authentication
 *
 * @param {string} email - End user email address
 * @param {string} password - Plain text password
 * @returns {{token: string, user: {end_user_id, email, name, role, is_blocked}}} Login result
 * @throws {Error} EMAIL_NOT_FOUND, INVALID_PASSWORD, ACCOUNT_BLOCKED, ACCOUNT_DELETED
 *
 * @example
 * try {
 *   const result = await loginEndUser("user@example.com", "password123");
 *   console.log("Token:", result.token);
 *   console.log("User ID:", result.user.end_user_id);
 * } catch (error) {
 *   if (error.message === "EMAIL_NOT_FOUND") {
 *     // Email not registered
 *   }
 * }
 */
export async function loginEndUser(email: string, password: string) {
  // Find end user by email
  const user = await prisma.end_users.findUnique({
    where: { email },
  });

  if (!user) {
    throw new Error("EMAIL_NOT_FOUND");
  }

  // Compare password
  const isPasswordValid = await comparePassword(password, user.password);
  if (!isPasswordValid) {
    throw new Error("INVALID_PASSWORD");
  }

  // Check account status
  if (user.is_blocked) {
    throw new Error("ACCOUNT_BLOCKED");
  }

  // Check soft delete
  if (user.deleted_at !== null) {
    throw new Error("ACCOUNT_DELETED");
  }

  // Generate JWT token
  const token = generateToken({
    id: user.end_user_id,
    role: "END_USER",
  });

  // Return token and user object
  return {
    token,
    user: {
      end_user_id: user.end_user_id,
      email: user.email,
      name: user.name,
      role: "END_USER",
      is_blocked: user.is_blocked,
    },
  };
}

/**
 * Validates JWT token and blacklists it to invalidate for future requests
 *
 * WORKFLOW:
 * 1. Verify JWT token signature and expiration using verifyToken()
 * 2. Decode token to extract exp (expiration time in seconds)
 * 3. Check if token is already blacklisted (prevent duplicate entries)
 * 4. Hash token using SHA256
 * 5. Create blacklist entry in database with:
 *    - token_hash: SHA256 hash of token
 *    - actor_id: end_user_id provided
 *    - actor_type: 'END_USER'
 *    - expires_at: Converted from JWT exp timestamp (exp * 1000 as milliseconds)
 * 6. Return confirmation message
 *
 * @param {string} token - JWT token to blacklist
 * @param {number} userId - End user ID (for audit trail)
 * @returns {{message: string, token_hash: string}} Logout result
 * @throws {Error} TOKEN_INVALID, TOKEN_ALREADY_BLACKLISTED
 *
 * @example
 * try {
 *   const result = await logoutEndUser(jwtToken, 5); // userId = 5
 *   console.log("Blacklist entry created at:", result.token_hash);
 * } catch (error) {
 *   if (error.message === "TOKEN_INVALID") {
 *     // Token cannot be verified
 *   }
 * }
 */
export async function logoutEndUser(token: string, userId: number) {
  // Verify token
  const decodedToken = verifyToken(token);
  if (!decodedToken) {
    throw new Error("TOKEN_INVALID");
  }

  // Extract exp (in seconds) and convert to milliseconds
  const exp = (decodedToken as any).exp;
  if (!exp) {
    throw new Error("TOKEN_INVALID");
  }

  // Hash token
  const tokenHash = crypto.createHash("sha256").update(token).digest("hex");

  // Check if already blacklisted
  const existingEntry = await prisma.blacklisted_tokens.findUnique({
    where: { token_hash: tokenHash },
  });

  if (existingEntry) {
    throw new Error("TOKEN_ALREADY_BLACKLISTED");
  }

  // Create blacklist entry
  await prisma.blacklisted_tokens.create({
    data: {
      token_hash: tokenHash,
      actor_id: userId,
      actor_type: "END_USER",
      expires_at: new Date(exp * 1000), // Convert from seconds to milliseconds
    },
  });

  return {
    message: "Token blacklisted successfully",
    token_hash: tokenHash,
  };
}
