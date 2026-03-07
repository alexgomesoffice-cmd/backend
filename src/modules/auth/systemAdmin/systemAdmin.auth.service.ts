/**
 * FILE: src/modules/auth/systemAdmin/systemAdmin.auth.service.ts
 * PURPOSE: Business logic for system admin authentication
 *
 * WHAT IT DOES:
 * - Login: Find user by email, verify password, generate JWT token
 * - Logout: Add JWT token to blacklist so it can't be used again
 *
 * WHY SEPARATE SERVICE:
 * - Controller handles HTTP (requests/responses)
 * - Service handles business logic (users, database, tokens)
 * - If we need this logic in another place (CLI, scheduled job, etc.), we can reuse it
 *
 * DEPENDENCIES:
 * - prisma: Database access
 * - password utils: Hash comparison
 * - token utils: JWT generation
 * - crypto: Hash token for blacklist
 */

import { prisma } from "@/config/prisma";
import { generateToken, verifyToken } from "@/utils/token";
import { comparePassword } from "@/utils/password";
import crypto from "crypto";

/**
 * Login a system admin user
 *
 * WORKFLOW:
 * 1. Look up user by email in system_admins table
 * 2. If not found, throw error
 * 3. Compare provided password with stored password
 * 4. If doesn't match, throw error
 * 5. Check user is_active is true (not blocked or deleted)
 * 6. Generate new JWT token with { id, role: 'SYSTEM_ADMIN' }
 * 7. Return token and user info
 *
 * @param email - System admin email address
 * @param password - System admin password (will be plain text in Phase 1-10, bcrypt in Phase 11+)
 * @returns Object with { token, admin: { system_admin_id, email, role, is_active } }
 * @throws Error if email not found, password wrong, or user inactive
 *
 * ERROR CASES:
 * - EMAIL_NOT_FOUND: No system admin with this email
 * - INVALID_PASSWORD: Password doesn't match
 * - ACCOUNT_INACTIVE: Admin is_active is false or is_blocked is true
 * - ACCOUNT_DELETED: Admin has deleted_at timestamp (soft delete)
 *
 * EXAMPLE:
 * const result = await loginSystemAdmin("admin@myhotels.com", "admin123");
 * // {
 * //   token: "eyJhbGciOiJIUzI1NiIs...",
 * //   admin: { system_admin_id: 1, email: "admin@myhotels.com", role: "SYSTEM_ADMIN", is_active: true }
 * // }
 */
export async function loginSystemAdmin(
  email: string,
  password: string
): Promise<{
  token: string;
  admin: {
    system_admin_id: number;
    email: string;
    role: string;
    is_active: boolean;
  };
}> {
  // Step 1: Find user by email
  const admin = await prisma.system_admins.findUnique({
    where: { email },
  });

  // Step 2: If not found, throw error
  if (!admin) {
    throw new Error("EMAIL_NOT_FOUND");
  }

  // Step 3: Verify password
  const isPasswordValid = await comparePassword(password, admin.password);

  // Step 4: If doesn't match, throw error
  if (!isPasswordValid) {
    throw new Error("INVALID_PASSWORD");
  }

  // Step 5: Check user is active
  if (!admin.is_active || admin.is_blocked) {
    throw new Error("ACCOUNT_INACTIVE");
  }

  // Check if soft deleted
  if (admin.deleted_at !== null) {
    throw new Error("ACCOUNT_DELETED");
  }

  // Step 6: Generate JWT token
  const token = generateToken({
    id: admin.system_admin_id,
    role: "SYSTEM_ADMIN",
  });

  // Step 7: Return token and user info
  return {
    token,
    admin: {
      system_admin_id: admin.system_admin_id,
      email: admin.email,
      role: "SYSTEM_ADMIN",
      is_active: admin.is_active,
    },
  };
}

/**
 * Logout a system admin user
 *
 * WORKFLOW:
 * 1. Verify the JWT token is valid (not expired, not tampered)
 * 2. Extract token from "Bearer <token>" format
 * 3. Hash token with SHA256 (don't store raw tokens in database)
 * 4. Add token hash to blacklisted_tokens table with timestamp
 * 5. Return success message
 *
 * @param token - JWT token from Authorization header (without "Bearer " prefix)
 * @returns Object with { message: "Logout successful", token_hash: string }
 * @throws Error if token is invalid, expired, or already blacklisted
 *
 * ERROR CASES:
 * - TOKEN_INVALID: JWT signature doesn't match or token malformed
 * - TOKEN_EXPIRED: Token expiration time has passed
 * - TOKEN_ALREADY_BLACKLISTED: This token is already in blacklist
 *
 * EXAMPLE:
 * const result = await logoutSystemAdmin("eyJhbGciOiJIUzI1NiIs...");
 * // { message: "Logout successful", token_hash: "abc123..." }
 *
 * SECURITY NOTE:
 * - We hash the token before storing (don't store raw tokens)
 * - If database is breached, attacker doesn't get raw tokens
 * - When verifying auth, we hash the token and look it up in blacklist
 */
export async function logoutSystemAdmin(
  token: string,
  adminId: number
): Promise<{
  message: string;
  token_hash: string;
}> {
  // Step 1: Verify token is valid
  let decodedToken;
  try {
    decodedToken = verifyToken(token);
  } catch (error) {
    // Token is invalid or expired
    throw new Error("TOKEN_INVALID");
  }

  // Step 2: Hash the token
  const tokenHash = crypto.createHash("sha256").update(token).digest("hex");

  // Step 3: Check if already blacklisted
  const isBlacklisted = await prisma.blacklisted_tokens.findUnique({
    where: { token_hash: tokenHash },
  });

  if (isBlacklisted) {
    throw new Error("TOKEN_ALREADY_BLACKLISTED");
  }

  // Step 4: Get expiration date from token
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const exp = (decodedToken as any).exp;
  const expiresAt = exp
    ? new Date(exp * 1000) // JWT exp is in seconds, convert to milliseconds
    : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // Default 7 days from now

  // Step 5: Add to blacklist
  await prisma.blacklisted_tokens.create({
    data: {
      token_hash: tokenHash,
      actor_id: adminId,
      actor_type: "SYSTEM_ADMIN",
      expires_at: expiresAt,
    },
  });

  // Step 6: Return success
  return {
    message: "Logout successful",
    token_hash: tokenHash,
  };
}
