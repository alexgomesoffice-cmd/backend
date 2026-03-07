/**
 * FILE: src/modules/auth/hotelSubAdmin/hotelSubAdmin.auth.controller.ts
 * PURPOSE: HTTP request/response handlers for hotel sub-admin authentication
 *
 * WHAT IT DOES:
 * - Handles POST /login request with email/password validation and response
 * - Handles POST /logout request with token validation and response
 * - Maps service layer errors to appropriate HTTP status codes
 * - Validates all inputs before processing
 *
 * USAGE:
 * import { loginController, logoutController } from './hotelSubAdmin.auth.controller';
 * router.post('/login', loginController);
 * router.post('/logout', authenticate, logoutController);
 *
 * HTTP STATUS CODES:
 * 200 - Success
 * 400 - Validation error or bad request
 * 401 - Authentication failed or unauthorized
 * 500 - Server error
 */

import type { Request, Response, NextFunction } from "express";
import { loginHotelSubAdmin, logoutHotelSubAdmin } from "./hotelSubAdmin.auth.service";
import {
  validateLoginInput,
  validateLogoutInput,
} from "./hotelSubAdmin.auth.validation";
import { extractToken } from "@/utils/token";

/**
 * Handles POST /api/auth/hotel-sub-admin/login request
 *
 * REQUEST BODY:
 * {
 *   "email": "subadmin@grandhotel.com",
 *   "password": "password123"
 * }
 *
 * WORKFLOW:
 * 1. Extract email and password from request body
 * 2. Validate input using validateLoginInput()
 * 3. If validation fails → Return 400 Bad Request
 * 4. Call loginHotelSubAdmin(email, password)
 * 5. If success → Return 200 with token and admin object
 * 6. If error:
 *    - EMAIL_NOT_FOUND or INVALID_PASSWORD → 401 "Invalid email or password"
 *    - ACCOUNT_INACTIVE → 401 "Account is inactive or blocked"
 *    - ACCOUNT_DELETED → 401 "Account has been deleted"
 *    - Any other error → 500 Internal Server Error
 *
 * RESPONSE SUCCESS (200):
 * {
 *   "success": true,
 *   "message": "Login successful",
 *   "data": {
 *     "token": "eyJhbGc...",
 *     "admin": {
 *       "hotel_sub_admin_id": 7,
 *       "email": "subadmin@grandhotel.com",
 *       "name": "Jane Smith",
 *       "role": "HOTEL_SUB_ADMIN",
 *       "is_active": true,
 *       "role_id": 2,
 *       "hotel_id": 1
 *     }
 *   }
 * }
 *
 * RESPONSE ERROR - VALIDATION (400):
 * {
 *   "success": false,
 *   "message": "Validation failed",
 *   "error": {
 *     "code": "VALIDATION_ERROR"
 *   }
 * }
 *
 * RESPONSE ERROR - AUTHENTICATION (401):
 * {
 *   "success": false,
 *   "message": "Invalid email or password",
 *   "error": {
 *     "code": "INVALID_CREDENTIALS"
 *   }
 * }
 *
 * @async
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 * @param {NextFunction} next - Express next middleware function
 * @returns {void}
 */
export async function loginController(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { email, password } = req.body;

    // Validate input
    const validation = validateLoginInput(email, password);
    if (!validation.isValid) {
      res.status(400).json({
        success: false,
        message: "Validation failed",
        error: { code: "VALIDATION_ERROR" },
      });
      return;
    }

    // Call service
    const result = await loginHotelSubAdmin(email, password);

    // Return success
    res.status(200).json({
      success: true,
      message: "Login successful",
      data: result,
    });
  } catch (error: any) {
    // Handle service errors
    if (error.message === "EMAIL_NOT_FOUND") {
      res.status(401).json({
        success: false,
        message: "Invalid email or password",
        error: { code: "INVALID_CREDENTIALS" },
      });
      return;
    }

    if (error.message === "INVALID_PASSWORD") {
      res.status(401).json({
        success: false,
        message: "Invalid email or password",
        error: { code: "INVALID_CREDENTIALS" },
      });
      return;
    }

    if (error.message === "ACCOUNT_INACTIVE") {
      res.status(401).json({
        success: false,
        message: "Account is inactive or blocked",
        error: { code: "ACCOUNT_INACTIVE" },
      });
      return;
    }

    if (error.message === "ACCOUNT_DELETED") {
      res.status(401).json({
        success: false,
        message: "Account has been deleted",
        error: { code: "ACCOUNT_DELETED" },
      });
      return;
    }

    // Unexpected error
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: { code: "SERVER_ERROR" },
    });
  }
}

/**
 * Handles POST /api/auth/hotel-sub-admin/logout request
 *
 * REQUIRES: Authentication middleware (req.actor must exist)
 *
 * HEADERS:
 * {
 *   "Authorization": "Bearer eyJhbGc..."
 * }
 *
 * WORKFLOW:
 * 1. Check if req.actor exists (set by authenticate middleware)
 *    - If missing → Return 401 Unauthorized
 * 2. Extract Authorization header and validate format
 * 3. If validation fails → Return 400 Bad Request
 * 4. Extract JWT token from "Bearer " prefix
 * 5. Get admin ID from req.actor.id
 * 6. Call logoutHotelSubAdmin(token, adminId)
 * 7. If success → Return 200 with blacklist confirmation
 * 8. If error:
 *    - TOKEN_INVALID → 401 Unauthorized
 *    - TOKEN_ALREADY_BLACKLISTED → 400 Bad Request
 *    - Any other error → 500 Internal Server Error
 *
 * RESPONSE SUCCESS (200):
 * {
 *   "success": true,
 *   "message": "Logout successful",
 *   "data": {
 *     "message": "Token blacklisted successfully",
 *     "token_hash": "a1b2c3d4e5f6..."
 *   }
 * }
 *
 * RESPONSE ERROR - UNAUTHORIZED (401):
 * {
 *   "success": false,
 *   "message": "Unauthorized",
 *   "error": {
 *     "code": "UNAUTHORIZED"
 *   }
 * }
 *
 * RESPONSE ERROR - ALREADY BLACKLISTED (400):
 * {
 *   "success": false,
 *   "message": "Token already blacklisted",
 *   "error": {
 *     "code": "TOKEN_ALREADY_BLACKLISTED"
 *   }
 * }
 *
 * @async
 * @param {Request} req - Express request object with req.actor set by auth middleware
 * @param {Response} res - Express response object
 * @param {NextFunction} next - Express next middleware function
 * @returns {void}
 */
export async function logoutController(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    // Check authentication
    if (!req.actor) {
      res.status(401).json({
        success: false,
        message: "Unauthorized",
        error: { code: "UNAUTHORIZED" },
      });
      return;
    }

    // Get authorization header
    const authHeader = req.headers.authorization;

    // Validate header format
    const validation = validateLogoutInput(authHeader);
    if (!validation.isValid) {
      res.status(400).json({
        success: false,
        message: "Validation failed",
        error: { code: "VALIDATION_ERROR" },
      });
      return;
    }

    // Extract token
    const token = extractToken(authHeader as string);
    if (!token) {
      res.status(401).json({
        success: false,
        message: "Unauthorized",
        error: { code: "UNAUTHORIZED" },
      });
      return;
    }

    // Get admin ID from actor
    const adminId = req.actor.id;

    // Call service
    const result = await logoutHotelSubAdmin(token, adminId);

    // Return success
    res.status(200).json({
      success: true,
      message: "Logout successful",
      data: result,
    });
  } catch (error: any) {
    // Handle service errors
    if (error.message === "TOKEN_INVALID") {
      res.status(401).json({
        success: false,
        message: "Unauthorized",
        error: { code: "UNAUTHORIZED" },
      });
      return;
    }

    if (error.message === "TOKEN_ALREADY_BLACKLISTED") {
      res.status(400).json({
        success: false,
        message: "Token already blacklisted",
        error: { code: "TOKEN_ALREADY_BLACKLISTED" },
      });
      return;
    }

    // Unexpected error
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: { code: "SERVER_ERROR" },
    });
  }
}
