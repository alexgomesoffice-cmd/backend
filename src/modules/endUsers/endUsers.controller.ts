/**
 * FILE: src/modules/endUsers/endUsers.controller.ts
 * PURPOSE: HTTP request/response handlers for end user operations
 *
 * ROUTES:
 * GET / - List all end users with pagination
 * GET /:id - Get single end user details
 * PUT /:id/block - Block/unblock end user
 *
 * USAGE:
 * import { listEndUsersController } from './endUsers.controller';
 * router.get('/', listEndUsersController);
 */

import type { Request, Response, NextFunction } from "express";
import {
  listEndUsers,
  getEndUser,
  blockEndUser,
  deleteEndUser,
} from "./endUsers.service";
import {
  validateEndUserId,
  validateBlockToggle,
} from "./endUsers.validation";

/**
 * Handles GET /api/end-users request
 *
 * QUERY PARAMS:
 * skip - Records to skip (default: 0)
 * take - Records to return (default: 10, max: 100)
 * is_blocked - Filter by block status (optional: true/false)
 * search - Search by email or name (optional)
 *
 * @async
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 * @param {NextFunction} next - Express next middleware function
 * @returns {void}
 */
export async function listEndUsersController(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    // Parse pagination
    const skip = Math.max(0, parseInt(req.query.skip as string) || 0);
    const take = Math.min(100, Math.max(1, parseInt(req.query.take as string) || 10));

    // Parse filters
    const filters: any = {};
    if (req.query.is_blocked) {
      filters.is_blocked = req.query.is_blocked === "true";
    }
    if (req.query.search) {
      filters.search = req.query.search;
    }

    // Call service
    const result = await listEndUsers(filters, skip, take);

    // Return success
    res.status(200).json({
      success: true,
      message: "End users retrieved successfully",
      data: result,
    });
  } catch (error: any) {
    console.error("listEndUsersController error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: { code: "SERVER_ERROR" },
    });
  }
}

/**
 * Handles GET /api/end-users/:id request
 *
 * URL PARAMS:
 * id - End user ID
 *
 * @async
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 * @param {NextFunction} next - Express next middleware function
 * @returns {void}
 */
export async function getEndUserController(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { id } = req.params as { id: string };

    // Validate ID
    const validation = validateEndUserId(id);
    if (!validation.isValid) {
      res.status(400).json({
        success: false,
        message: "Validation failed",
        error: { code: "VALIDATION_ERROR", details: validation.errors },
      });
      return;
    }

    // Call service
    const endUser = await getEndUser(parseInt(id));

    // Return success
    res.status(200).json({
      success: true,
      message: "End user retrieved successfully",
      data: endUser,
    });
  } catch (error: any) {
    if (error.message === "END_USER_NOT_FOUND") {
      res.status(404).json({
        success: false,
        message: "End user not found",
        error: { code: "END_USER_NOT_FOUND" },
      });
      return;
    }

    console.error("getEndUserController error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: { code: "SERVER_ERROR" },
    });
  }
}

/**
 * Handles PUT /api/end-users/:id/block request
 *
 * REQUIRES: Authentication (system admin)
 *
 * URL PARAMS:
 * id - End user ID
 *
 * REQUEST BODY:
 * {
 *   "is_blocked": true/false
 * }
 *
 * @async
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 * @param {NextFunction} next - Express next middleware function
 * @returns {void}
 */
export async function blockEndUserController(
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

    const { id } = req.params as { id: string };
    const { is_blocked } = req.body;

    // Validate ID
    const idValidation = validateEndUserId(id);
    if (!idValidation.isValid) {
      res.status(400).json({
        success: false,
        message: "Validation failed",
        error: { code: "VALIDATION_ERROR", details: idValidation.errors },
      });
      return;
    }

    // Validate body
    const bodyValidation = validateBlockToggle({ is_blocked });
    if (!bodyValidation.isValid) {
      res.status(400).json({
        success: false,
        message: "Validation failed",
        error: { code: "VALIDATION_ERROR", details: bodyValidation.errors },
      });
      return;
    }

    // Call service
    const updated = await blockEndUser(parseInt(id), is_blocked);

    // Return success
    res.status(200).json({
      success: true,
      message: `End user ${is_blocked ? "blocked" : "unblocked"} successfully`,
      data: updated,
    });
  } catch (error: any) {
    if (error.message === "END_USER_NOT_FOUND") {
      res.status(404).json({
        success: false,
        message: "End user not found",
        error: { code: "END_USER_NOT_FOUND" },
      });
      return;
    }

    console.error("blockEndUserController error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: { code: "SERVER_ERROR" },
    });
  }
}

/**
 * Handles DELETE /api/end-users/:id request
 *
 * REQUIRES: Authentication (system admin)
 *
 * URL PARAMS:
 * id - End user ID
 *
 * @async
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 * @param {NextFunction} next - Express next middleware function
 * @returns {void}
 */
export async function deleteEndUserController(
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

    const { id } = req.params as { id: string };

    // Validate ID
    const validation = validateEndUserId(id);
    if (!validation.isValid) {
      res.status(400).json({
        success: false,
        message: "Validation failed",
        error: { code: "VALIDATION_ERROR", details: validation.errors },
      });
      return;
    }

    // Call service
    const result = await deleteEndUser(parseInt(id));

    // Return success
    res.status(200).json({
      success: true,
      message: result.message,
      data: { end_user_id: result.end_user_id },
    });
  } catch (error: any) {
    if (error.message === "END_USER_NOT_FOUND") {
      res.status(404).json({
        success: false,
        message: "End user not found",
        error: { code: "END_USER_NOT_FOUND" },
      });
      return;
    }

    console.error("deleteEndUserController error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: { code: "SERVER_ERROR" },
    });
  }
}
