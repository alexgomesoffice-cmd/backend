/**
 * FILE: src/modules/admin/systemAdmin/systemAdmin.features.controller.ts
 * PURPOSE: HTTP request/response handlers for system admin features
 *
 * WHAT IT DOES:
 * - Handles POST /create request to create new system admin
 * - Handles GET /:id request to retrieve admin details
 * - Handles GET / request to list all admins
 * - Handles PUT /:id/status request to update admin status
 * - Handles DELETE /:id request to soft delete admin
 *
 * USAGE:
 * import { createAdminController, getAdminController } from './systemAdmin.features.controller';
 * router.post('/create', authenticate, createAdminController);
 * router.get('/:id', authenticate, getAdminController);
 *
 * HTTP STATUS CODES:
 * 200 - Success
 * 400 - Validation error or bad request
 * 401 - Unauthorized
 * 404 - Resource not found
 * 500 - Server error
 */

import type { Request, Response, NextFunction } from "express";
import {
  createSystemAdmin,
  getSystemAdmin,
  listSystemAdmins,
  updateAdminStatus,
  deleteSystemAdmin,
} from "./systemAdmin.features.service";
import {
  validateCreateAdminInput,
  validateAdminId,
  validateStatusUpdate,
} from "./systemAdmin.features.validation";

/**
 * Handles POST /api/system-admin/create request
 *
 * REQUIRES: Authentication (only system admins)
 *
 * REQUEST BODY:
 * {
 *   "name": "New Admin",
 *   "email": "admin@myhotels.com",
 *   "password": "password123"
 * }
 *
 * WORKFLOW:
 * 1. Check if req.actor exists (authentication)
 * 2. Validate input using validateCreateAdminInput()
 * 3. If validation fails → Return 400
 * 4. Call createSystemAdmin()
 * 5. Return 201 with created admin
 *
 * @async
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 * @param {NextFunction} next - Express next middleware function
 * @returns {void}
 */
export async function createAdminController(
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

    const { name, email, password } = req.body;

    // Validate input
    const validation = validateCreateAdminInput(name, email, password);
    if (!validation.isValid) {
      res.status(400).json({
        success: false,
        message: "Validation failed",
        error: { code: "VALIDATION_ERROR", details: validation.errors },
      });
      return;
    }

    // Call service
    const admin = await createSystemAdmin(
      name,
      email,
      password,
      req.actor.id
    );

    // Return success with 201 Created
    res.status(201).json({
      success: true,
      message: "System admin created successfully",
      data: admin,
    });
  } catch (error: any) {
    // Handle service errors
    if (error.message === "EMAIL_ALREADY_EXISTS") {
      res.status(400).json({
        success: false,
        message: "Email already exists",
        error: { code: "EMAIL_ALREADY_EXISTS" },
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
 * Handles GET /api/system-admin/:id request
 *
 * REQUIRES: Authentication (only system admins)
 *
 * URL PARAMS:
 * id - System admin ID
 *
 * WORKFLOW:
 * 1. Check authentication
 * 2. Validate admin ID parameter
 * 3. Call getSystemAdmin()
 * 4. Return 200 with admin details
 *
 * @async
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 * @param {NextFunction} next - Express next middleware function
 * @returns {void}
 */
export async function getAdminController(
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

    const adminId = parseInt((req.params.id as string) || "0", 10);

    // Validate admin ID
    const validation = validateAdminId(adminId);
    if (!validation.isValid) {
      res.status(400).json({
        success: false,
        message: "Validation failed",
        error: { code: "VALIDATION_ERROR", details: validation.errors },
      });
      return;
    }

    // Call service
    const admin = await getSystemAdmin(adminId);

    // Return success
    res.status(200).json({
      success: true,
      message: "System admin retrieved successfully",
      data: admin,
    });
  } catch (error: any) {
    // Handle service errors
    if (error.message === "ADMIN_NOT_FOUND") {
      res.status(404).json({
        success: false,
        message: "System admin not found",
        error: { code: "ADMIN_NOT_FOUND" },
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
 * Handles GET /api/system-admin request
 *
 * REQUIRES: Authentication (only system admins)
 *
 * QUERY PARAMS:
 * skip - Number of records to skip (default: 0)
 * take - Number of records to return (default: 10)
 *
 * WORKFLOW:
 * 1. Check authentication
 * 2. Parse pagination parameters
 * 3. Call listSystemAdmins()
 * 4. Return 200 with list of admins
 *
 * @async
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 * @param {NextFunction} next - Express next middleware function
 * @returns {void}
 */
export async function listAdminsController(
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

    // Parse pagination parameters
    const skip = Math.max(0, parseInt(req.query.skip as string) || 0);
    const take = Math.min(100, Math.max(1, parseInt(req.query.take as string) || 10));

    // Call service
    const result = await listSystemAdmins(skip, take);

    // Return success
    res.status(200).json({
      success: true,
      message: "System admins retrieved successfully",
      data: result,
    });
  } catch (error: any) {
    // Unexpected error
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: { code: "SERVER_ERROR" },
    });
  }
}

/**
 * Handles PUT /api/system-admin/:id/status request
 *
 * REQUIRES: Authentication (only system admins)
 *
 * URL PARAMS:
 * id - System admin ID
 *
 * REQUEST BODY:
 * {
 *   "is_active": true,
 *   "is_blocked": false
 * }
 *
 * WORKFLOW:
 * 1. Check authentication
 * 2. Validate admin ID
 * 3. Validate status update input
 * 4. Call updateAdminStatus()
 * 5. Return 200 with updated admin
 *
 * @async
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 * @param {NextFunction} next - Express next middleware function
 * @returns {void}
 */
export async function updateStatusController(
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

    const adminId = parseInt((req.params.id as string) || "0", 10);
    const { is_active, is_blocked } = req.body;

    // Validate admin ID
    const idValidation = validateAdminId(adminId);
    if (!idValidation.isValid) {
      res.status(400).json({
        success: false,
        message: "Validation failed",
        error: { code: "VALIDATION_ERROR", details: idValidation.errors },
      });
      return;
    }

    // Validate status update
    const statusValidation = validateStatusUpdate(is_active, is_blocked);
    if (!statusValidation.isValid) {
      res.status(400).json({
        success: false,
        message: "Validation failed",
        error: { code: "VALIDATION_ERROR", details: statusValidation.errors },
      });
      return;
    }

    // Call service
    const updated = await updateAdminStatus(adminId, is_active, is_blocked);

    // Return success
    res.status(200).json({
      success: true,
      message: "System admin status updated successfully",
      data: updated,
    });
  } catch (error: any) {
    // Handle service errors
    if (error.message === "ADMIN_NOT_FOUND") {
      res.status(404).json({
        success: false,
        message: "System admin not found",
        error: { code: "ADMIN_NOT_FOUND" },
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
 * Handles DELETE /api/system-admin/:id request
 *
 * REQUIRES: Authentication (only system admins)
 *
 * URL PARAMS:
 * id - System admin ID to delete
 *
 * WORKFLOW:
 * 1. Check authentication
 * 2. Validate admin ID
 * 3. Call deleteSystemAdmin()
 * 4. Return 200 with confirmation
 *
 * @async
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 * @param {NextFunction} next - Express next middleware function
 * @returns {void}
 */
export async function deleteAdminController(
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

    const adminId = parseInt((req.params.id as string) || "0", 10);

    // Validate admin ID
    const validation = validateAdminId(adminId);
    if (!validation.isValid) {
      res.status(400).json({
        success: false,
        message: "Validation failed",
        error: { code: "VALIDATION_ERROR", details: validation.errors },
      });
      return;
    }

    // Call service
    const result = await deleteSystemAdmin(adminId);

    // Return success
    res.status(200).json({
      success: true,
      message: result.message,
      data: { system_admin_id: result.system_admin_id },
    });
  } catch (error: any) {
    // Handle service errors
    if (error.message === "ADMIN_NOT_FOUND") {
      res.status(404).json({
        success: false,
        message: "System admin not found",
        error: { code: "ADMIN_NOT_FOUND" },
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
