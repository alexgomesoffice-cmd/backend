/**
 * FILE: src/modules/auth/hotelAdmin/hotelAdmin.auth.service.ts
 * PURPOSE: Business logic for hotel admin authentication
 *
 * WHAT IT DOES:
 * - Authenticates hotel admin by email/password
 * - Generates JWT token on successful login
 * - Validates tokens and adds them to blacklist on logout
 * - Checks hotel admin account status (is_active, is_blocked, deleted_at)
 *
 * USAGE:
 * import { loginHotelAdmin, logoutHotelAdmin } from './hotelAdmin.auth.service';
 * const result = await loginHotelAdmin(email, password);
 * const logout = await logoutHotelAdmin(token, adminId);
 *
 * DATABASE TABLES:
 * - hotel_admins: Hotel admin accounts (email, password, is_active, is_blocked, deleted_at)
 * - blacklisted_tokens: Stores hashed tokens for invalidation on logout
 */

import { prisma } from "@/config/prisma";
import { generateToken, verifyToken } from "@/utils/token";
import { comparePassword } from "@/utils/password";
import crypto from "crypto";

/**
 * Authenticates hotel admin by email and password
 *
 * WORKFLOW:
 * 1. Find hotel admin in database by email
 * 2. Compare provided password with stored password hash
 * 3. Check account is active (is_active === true)
 * 4. Check account is not blocked (is_blocked === false)
 * 5. Check account is not soft-deleted (deleted_at === null)
 * 6. Generate JWT token with payload {id: hotel_admin_id, role: 'HOTEL_ADMIN'}
 * 7. Return token and admin object
 *
 * @param {string} email - Hotel admin email address
 * @param {string} password - Plain text password
 * @returns {{token: string, admin: {hotel_admin_id, email, role, is_active, hotel_id}}} Login result
 * @throws {Error} EMAIL_NOT_FOUND, INVALID_PASSWORD, ACCOUNT_INACTIVE, ACCOUNT_DELETED
 *
 * @example
 * try {
 *   const result = await loginHotelAdmin("admin@grandhotel.com", "password123");
 *   console.log("Token:", result.token);
 *   console.log("Admin ID:", result.admin.hotel_admin_id);
 * } catch (error) {
 *   if (error.message === "EMAIL_NOT_FOUND") {
 *     // Email not registered
 *   }
 * }
 */
export async function loginHotelAdmin(email: string, password: string) {
  // Find hotel admin by email
  const admin = await prisma.hotel_admins.findUnique({
    where: { email },
    include: { hotel: { select: { hotel_id: true } } },
  });

  if (!admin) {
    throw new Error("EMAIL_NOT_FOUND");
  }

  // Compare password
  const isPasswordValid = await comparePassword(password, admin.password);
  if (!isPasswordValid) {
    throw new Error("INVALID_PASSWORD");
  }

  // Check account status
  if (!admin.is_active || admin.is_blocked) {
    throw new Error("ACCOUNT_INACTIVE");
  }

  // Check soft delete
  if (admin.deleted_at !== null) {
    throw new Error("ACCOUNT_DELETED");
  }

  // Generate JWT token
  const token = generateToken({
    id: admin.hotel_admin_id,
    role: "HOTEL_ADMIN",
  });

  // Return token and admin object
  return {
    token,
    admin: {
      hotel_admin_id: admin.hotel_admin_id,
      email: admin.email,
      name: admin.name,
      role: "HOTEL_ADMIN",
      is_active: admin.is_active,
      hotel_id: admin.hotel_id,
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
 *    - actor_id: hotel_admin_id provided
 *    - actor_type: 'HOTEL_ADMIN'
 *    - expires_at: Converted from JWT exp timestamp (exp * 1000 as milliseconds)
 * 6. Return confirmation message
 *
 * @param {string} token - JWT token to blacklist
 * @param {number} adminId - Hotel admin ID (for audit trail)
 * @returns {{message: string, token_hash: string}} Logout result
 * @throws {Error} TOKEN_INVALID, TOKEN_ALREADY_BLACKLISTED
 *
 * @example
 * try {
 *   const result = await logoutHotelAdmin(jwtToken, 5); // adminId = 5
 *   console.log("Blacklist entry created at:", result.token_hash);
 * } catch (error) {
 *   if (error.message === "TOKEN_INVALID") {
 *     // Token cannot be verified
 *   }
 * }
 */
export async function logoutHotelAdmin(token: string, adminId: number) {
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
      actor_id: adminId,
      actor_type: "HOTEL_ADMIN",
      expires_at: new Date(exp * 1000), // Convert from seconds to milliseconds
    },
  });

  return {
    message: "Token blacklisted successfully",
    token_hash: tokenHash,
  };
}
