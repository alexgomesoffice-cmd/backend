/**
 * FILE: src/utils/token.ts
 * PURPOSE: JWT token generation and verification
 *
 * DEPENDENCY: jsonwebtoken (npm install jsonwebtoken @types/jsonwebtoken)
 *
 * WORKFLOW:
 * 1. generateToken() - Create JWT after successful login
 * 2. verifyToken() - Decode JWT in auth middleware
 * 3. Both use env.JWT_SECRET and env.JWT_EXPIRES_IN
 *
 * SECURITY:
 * - JWT_SECRET should be very long (32+ characters)
 * - We use SUPER_SECRET_KEY_123 for development
 * - Production should use a cryptographically random secret
 *
 * TOKEN STRUCTURE:
 * JWT has 3 parts separated by dots: header.payload.signature
 * - Header: Algorithm info (HS256, etc.)
 * - Payload: Our JwtPayload data { id, role, hotel_id? }
 * - Signature: HMAC-SHA256 hash of header + payload + secret
 *
 * If anyone modifies the token, signature won't match = invalid token
 */

import jwt from "jsonwebtoken";
import type { JwtPayload } from "@/types/global";
import { env } from "@/config/env";

/**
 * Generate a new JWT token after successful login
 *
 * @param payload - The JWT payload containing { id, role, hotel_id? }
 * @returns Signed JWT token string
 * @throws Error if signing fails
 *
 * EXAMPLE:
 * const token = generateToken({ id: 1, role: 'SYSTEM_ADMIN' });
 * // Returns: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwicm9sZSI6IlNZU1RFTv..."
 *
 * EXPIRATION:
 * - Token expires in env.JWT_EXPIRES_IN time (default: "7d")
 * - After expiration, verifyToken() will fail
 * - User must log in again to get a new token
 */
export function generateToken(payload: JwtPayload): string {
  // Sign the payload with our secret
  // The signature proves the token wasn't tampered with
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const token = jwt.sign(payload, env.JWT_SECRET, {
    expiresIn: env.JWT_EXPIRES_IN,
  } as any);

  return token;
}

/**
 * Verify and decode a JWT token
 *
 * @param token - The JWT token string from Authorization header
 * @returns Decoded JwtPayload if valid
 * @throws Error if token is invalid, expired, or signature doesn't match
 *
 * ERRORS:
 * - "jwt malformed" - Token format is wrong
 * - "invalid signature" - Token was tampered with
 * - "jwt expired" - Token expiration time has passed
 * - "invalid token" - Other verification failures
 *
 * EXAMPLE:
 * try {
 *   const payload = verifyToken(token);
 *   console.log(payload.id, payload.role);
 * } catch (error) {
 *   // Token is invalid - return 401 Unauthorized
 * }
 */
export function verifyToken(token: string): JwtPayload {
  // Verify signature and expiration
  // If any check fails, jwt.verify() throws an error
  const payload = jwt.verify(token, env.JWT_SECRET) as JwtPayload;

  return payload;
}

/**
 * Helper: Extract token from "Bearer <token>" string
 *
 * @param authHeader - The Authorization header value
 * @returns Token string without "Bearer " prefix, or null
 *
 * FORMAT:
 * Authorization: "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *                 ^^^^^^ This part is stripped
 *
 * EXAMPLE:
 * const authHeader = "Bearer abc123def456";
 * const token = extractToken(authHeader);
 * // Returns: "abc123def456"
 */
export function extractToken(authHeader: string | undefined): string | null {
  if (!authHeader) {
    return null;
  }

  // Split "Bearer <token>" into ["Bearer", "<token>"]
  const parts = authHeader.split(" ");

  // Check if we have exactly 2 parts and first is "Bearer"
  if (parts.length !== 2 || parts[0] !== "Bearer") {
    return null;
  }

  // Return just the token part
  return parts[1] ?? null;
}
