/**
 * FILE: src/modules/auth/systemAdmin/systemAdmin.auth.controller.ts
 * PURPOSE: HTTP request/response handling for system admin authentication
 *
 * WHAT IT DOES:
 * - Handles POST /login requests (login endpoint)
 * - Handles POST /logout requests (logout endpoint)
 * - Validates input, calls service, returns HTTP response
 *
 * WHY SEPARATE CONTROLLER:
 * - Service handles business logic
 * - Controller handles HTTP protocol (request/response)
 * - Separation makes testing easier (can test service without Express)
 *
 * DEPENDENCIES:
 * - validation: Input validation
 * - service: Business logic
 * - Express types: Request, Response, NextFunction
 */

import type { Request, Response, NextFunction } from "express";
import { validateLoginInput, validateLogoutInput } from "./systemAdmin.auth.validation";
import { loginSystemAdmin, logoutSystemAdmin } from "./systemAdmin.auth.service";
import { extractToken } from "@/utils/token";
import { logger } from "@/utils/logger";

/**
 * POST /api/auth/system-admin/login
 *
 * Login a system admin with email and password
 *
 * REQUEST BODY:
 * {
 *   "email": "admin@myhotels.com",
 *   "password": "admin123"
 * }
 *
 * RESPONSE (200 OK):
 * {
 *   "success": true,
 *   "message": "Login successful",
 *   "data": {
 *     "token": "eyJhbGciOiJIUzI1NiIs...",
 *     "admin": {
 *       "system_admin_id": 1,
 *       "email": "admin@myhotels.com",
 *       "role": "SYSTEM_ADMIN",
 *       "is_active": true
 *     }
 *   }
 * }
 *
 * RESPONSE (400 BAD REQUEST):
 * {
 *   "success": false,
 *   "message": "Validation failed",
 *   "error": { "code": "VALIDATION_ERROR" },
 *   "data": { "errors": ["Email is required", "Password is required"] }
 * }
 *
 * RESPONSE (401 UNAUTHORIZED):
 * {
 *   "success": false,
 *   "message": "Invalid credentials",
 *   "error": { "code": "INVALID_CREDENTIALS" },
 *   "data": null
 * }
 *
 * ERROR CODES:
 * - EMAIL_NOT_FOUND (401): No admin with this email
 * - INVALID_PASSWORD (401): Password doesn't match
 * - ACCOUNT_INACTIVE (401): Admin is blocked or inactive
 * - ACCOUNT_DELETED (401): Admin account is soft-deleted
 */
export async function loginController(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { email, password } = req.body;

    // Step 1: Validate input
    const validation = validateLoginInput(email, password);
    if (!validation.isValid) {
      logger.warn("Login validation failed", { email, errors: validation.errors });
      res.status(400).json({
        success: false,
        message: "Validation failed",
        error: { code: "VALIDATION_ERROR" },
        data: { errors: validation.errors },
      });
      return;
    }

    // Step 2: Call service to authenticate
    logger.debug("Attempting login", { email });
    const result = await loginSystemAdmin(email, password);

    // Step 3: Return success response
    logger.info("✅ System admin logged in", { admin_id: result.admin.system_admin_id });
    res.status(200).json({
      success: true,
      message: "Login successful",
      data: result,
    });
  } catch (error) {
    // Handle service errors
    const errorMessage = error instanceof Error ? error.message : "Unknown error";

    if (errorMessage === "EMAIL_NOT_FOUND" || errorMessage === "INVALID_PASSWORD") {
      logger.warn("Login failed: invalid credentials", { email: req.body.email });
      res.status(401).json({
        success: false,
        message: "Invalid credentials",
        error: { code: "INVALID_CREDENTIALS" },
        data: null,
      });
      return;
    }

    if (errorMessage === "ACCOUNT_INACTIVE") {
      logger.warn("Login failed: account inactive", { email: req.body.email });
      res.status(401).json({
        success: false,
        message: "Account is inactive or blocked",
        error: { code: "ACCOUNT_INACTIVE" },
        data: null,
      });
      return;
    }

    if (errorMessage === "ACCOUNT_DELETED") {
      logger.warn("Login failed: account deleted", { email: req.body.email });
      res.status(401).json({
        success: false,
        message: "Account has been deleted",
        error: { code: "ACCOUNT_DELETED" },
        data: null,
      });
      return;
    }

    // Pass unknown errors to error middleware
    next(error);
  }
}

/**
 * POST /api/auth/system-admin/logout
 *
 * Logout a system admin (blacklist their token)
 *
 * HEADERS:
 * {
 *   "Authorization": "Bearer eyJhbGciOiJIUzI1NiIs..."
 * }
 *
 * RESPONSE (200 OK):
 * {
 *   "success": true,
 *   "message": "Logout successful",
 *   "data": {
 *     "message": "Logout successful",
 *     "token_hash": "abc123def456..."
 *   }
 * }
 *
 * RESPONSE (401 UNAUTHORIZED):
 * {
 *   "success": false,
 *   "message": "Unauthorized",
 *   "error": { "code": "NO_AUTH_HEADER" or "INVALID_TOKEN" },
 *   "data": null
 * }
 *
 * NOTE:
 * - This endpoint uses auth middleware to verify JWT
 * - req.actor is set by auth middleware
 * - No need to re-verify token here (already done)
 */
export async function logoutController(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    // Step 1: Get token from Authorization header
    const authHeader = req.headers.authorization;
    const token = extractToken(authHeader);

    // Step 2: Validate token format
    const validation = validateLogoutInput(authHeader);
    if (!validation.isValid) {
      logger.warn("Logout validation failed", { errors: validation.errors });
      res.status(401).json({
        success: false,
        message: "Unauthorized",
        error: { code: "INVALID_TOKEN" },
        data: null,
      });
      return;
    }

    // Step 3: Get admin ID from req.actor (set by auth middleware)
    const adminId = req.actor?.id;
    if (!adminId) {
      logger.warn("Logout failed: no actor in request");
      res.status(401).json({
        success: false,
        message: "Unauthorized",
        error: { code: "INVALID_TOKEN" },
        data: null,
      });
      return;
    }

    // Step 4: Call service to logout
    logger.debug("Attempting logout", { admin_id: adminId });
    const result = await logoutSystemAdmin(token!, adminId);

    // Step 5: Return success response
    logger.info("✅ System admin logged out", { admin_id: adminId });
    res.status(200).json({
      success: true,
      message: "Logout successful",
      data: result,
    });
  } catch (error) {
    // Handle service errors
    const errorMessage = error instanceof Error ? error.message : "Unknown error";

    if (errorMessage === "TOKEN_INVALID") {
      logger.warn("Logout failed: invalid token");
      res.status(401).json({
        success: false,
        message: "Unauthorized",
        error: { code: "INVALID_TOKEN" },
        data: null,
      });
      return;
    }

    if (errorMessage === "TOKEN_ALREADY_BLACKLISTED") {
      logger.warn("Logout failed: token already blacklisted");
      res.status(400).json({
        success: false,
        message: "Token already blacklisted",
        error: { code: "TOKEN_ALREADY_BLACKLISTED" },
        data: null,
      });
      return;
    }

    // Pass unknown errors to error middleware
    next(error);
  }
}
