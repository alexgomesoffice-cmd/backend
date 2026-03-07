/**
 * FILE: src/middlewares/auth.middleware.ts
 * PURPOSE: JWT authentication middleware
 *
 * WORKFLOW:
 * 1. Extract Authorization header
 * 2. Extract token from "Bearer <token>" format
 * 3. Verify JWT signature and expiration
 * 4. Check if token is in blacklist (user logged out)
 * 5. Set req.actor with decoded JWT payload
 * 6. Allow request to continue
 *
 * If any step fails → return 401 Unauthorized
 *
 * USAGE:
 * import { authenticate } from '@/middlewares/auth.middleware';
 * router.get('/protected', authenticate, (req, res) => {
 *   console.log(req.actor.id, req.actor.role);
 * });
 */

import type { Request, Response, NextFunction } from "express";
import { extractToken, verifyToken } from "@/utils/token";
import { prisma } from "@/config/prisma";
import { logger } from "@/utils/logger";
import crypto from "crypto";

/**
 * Hash a token string for safe storage in blacklist table
 * We don't store the full token (security risk)
 * Instead we store a hash
 *
 * @param token - JWT token string
 * @returns SHA256 hash of the token
 */
function hashToken(token: string): string {
  return crypto.createHash("sha256").update(token).digest("hex");
}

/**
 * Authenticate middleware
 * Verifies JWT and sets req.actor
 *
 * RETURNS:
 * - 401: Missing or invalid token
 * - 401: Token is blacklisted (user logged out)
 * - 401: Token expired
 * - Next: Valid token, req.actor is set
 *
 * EXAMPLE ERROR RESPONSES:
 * { success: false, message: "No authorization header", error: { code: "NO_AUTH_HEADER" } }
 * { success: false, message: "Invalid bearer format", error: { code: "INVALID_BEARER" } }
 * { success: false, message: "Invalid or expired token", error: { code: "INVALID_TOKEN" } }
 * { success: false, message: "Token has been revoked", error: { code: "TOKEN_REVOKED" } }
 */
export async function authenticate(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    // Step 1: Get Authorization header
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      logger.warn("Missing authorization header", { ip: req.ip });
      res.status(401).json({
        success: false,
        message: "No authorization header provided",
        error: { code: "NO_AUTH_HEADER" },
        data: null,
      });
      return;
    }

    // Step 2: Extract token from "Bearer <token>" format
    const token = extractToken(authHeader);

    if (!token) {
      logger.warn("Invalid bearer format", { authHeader, ip: req.ip });
      res.status(401).json({
        success: false,
        message: "Invalid authorization format (expected 'Bearer <token>')",
        error: { code: "INVALID_BEARER" },
        data: null,
      });
      return;
    }

    // Step 3: Verify JWT signature and expiration
    let payload;
    try {
      payload = verifyToken(token);
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : "Unknown error";
      logger.warn("Token verification failed", { error: errorMsg, ip: req.ip });
      res.status(401).json({
        success: false,
        message: "Invalid or expired token",
        error: { code: "INVALID_TOKEN" },
        data: null,
      });
      return;
    }

    // Step 4: Check if token is blacklisted
    // User could have logged out, or been blocked by admin
    const tokenHash = hashToken(token);
    const blacklistedToken = await prisma.blacklisted_tokens.findUnique({
      where: { token_hash: tokenHash },
    });

    if (blacklistedToken) {
      logger.warn("Using revoked token", { actor: payload.id, ip: req.ip });
      res.status(401).json({
        success: false,
        message: "This token has been revoked (you may have logged out)",
        error: { code: "TOKEN_REVOKED" },
        data: null,
      });
      return;
    }

    // Step 5: All checks passed!
    // Set req.actor with the decoded JWT payload
    req.actor = payload;

    logger.debug("Authentication successful", {
      actor_id: payload.id,
      actor_role: payload.role,
      ip: req.ip,
    });

    // Step 6: Continue to next middleware/route
    next();
  } catch (error) {
    logger.error("Unexpected error in auth middleware", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: { code: "INTERNAL_ERROR" },
      data: null,
    });
  }
}
