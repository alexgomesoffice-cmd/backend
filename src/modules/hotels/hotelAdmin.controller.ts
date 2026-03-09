/**
 * FILE: src/modules/hotels/hotelAdmin.controller.ts
 * PURPOSE: HTTP request/response handlers for hotel admin operations
 *
 * WHAT IT DOES:
 * - Handles POST /create to create new hotel admin accounts
 * - Handles GET /:id to retrieve admin details
 * - Handles PUT /:id to update admin details
 *
 * USAGE:
 * import { createHotelAdminController } from './hotelAdmin.controller';
 * router.post('/create', authenticate, createHotelAdminController);
 */

import type { Request, Response, NextFunction } from "express";
import {
  createHotelAdmin,
  getHotelAdmin,
  updateHotelAdminDetails,
} from "./hotelAdmin.service";

/**
 * Handles POST /api/hotel-admin/create request
 *
 * REQUIRES: Authentication (system admin only)
 *
 * REQUEST BODY:
 * {
 *   "hotel_id": 5,
 *   "name": "Hotel Admin",
 *   "email": "admin@hotel.com",
 *   "password": "SecurePass123!",
 *   "phone": "+880-1234-567890",
 *   "nid_no": "1234567890123",
 *   "manager_name": "Manager Name",
 *   "manager_phone": "+880-9876-543210"
 * }
 *
 * @async
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 * @param {NextFunction} next - Express next middleware function
 * @returns {void}
 */
export async function createHotelAdminController(
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

    const {
      hotel_id,
      name,
      email,
      password,
      phone,
      nid_no,
      manager_name,
      manager_phone,
    } = req.body;

    // Basic validation
    if (!hotel_id || !name || !email || !password) {
      res.status(400).json({
        success: false,
        message: "Missing required fields: hotel_id, name, email, password",
        error: { code: "VALIDATION_ERROR" },
      });
      return;
    }

    // Call service
    const admin = await createHotelAdmin(
      hotel_id,
      {
        name,
        email,
        password,
        phone,
        nid_no,
        manager_name,
        manager_phone,
      },
      req.actor.id
    );

    // Return success
    res.status(201).json({
      success: true,
      message: "Hotel admin created successfully",
      data: admin,
    });
  } catch (error: any) {
    // Handle service errors
    if (error.message === "HOTEL_NOT_FOUND") {
      res.status(404).json({
        success: false,
        message: "Hotel not found",
        error: { code: "HOTEL_NOT_FOUND" },
      });
      return;
    }

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
 * Handles GET /api/hotel-admin/:id request
 *
 * @async
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 * @param {NextFunction} next - Express next middleware function
 * @returns {void}
 */
export async function getHotelAdminController(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { id } = req.params;
    const adminId = Array.isArray(id) ? parseInt(id[0] || "0") : parseInt(id || "0");

    if (!adminId || isNaN(adminId)) {
      res.status(400).json({
        success: false,
        message: "Valid Admin ID is required",
        error: { code: "VALIDATION_ERROR" },
      });
      return;
    }

    const admin = await getHotelAdmin(adminId);

    res.status(200).json({
      success: true,
      message: "Hotel admin retrieved successfully",
      data: admin,
    });
  } catch (error: any) {
    if (error.message === "ADMIN_NOT_FOUND") {
      res.status(404).json({
        success: false,
        message: "Admin not found",
        error: { code: "ADMIN_NOT_FOUND" },
      });
      return;
    }

    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: { code: "SERVER_ERROR" },
    });
  }
}

/**
 * Handles PUT /api/hotel-admin/:id request
 *
 * @async
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 * @param {NextFunction} next - Express next middleware function
 * @returns {void}
 */
export async function updateHotelAdminDetailsController(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { id } = req.params;
    const adminId = Array.isArray(id) ? parseInt(id[0] || "0") : parseInt(id || "0");

    if (!adminId || isNaN(adminId)) {
      res.status(400).json({
        success: false,
        message: "Valid Admin ID is required",
        error: { code: "VALIDATION_ERROR" },
      });
      return;
    }

    const updated = await updateHotelAdminDetails(adminId, req.body);

    res.status(200).json({
      success: true,
      message: "Hotel admin details updated successfully",
      data: updated,
    });
  } catch (error: any) {
    if (error.message === "ADMIN_NOT_FOUND") {
      res.status(404).json({
        success: false,
        message: "Admin not found",
        error: { code: "ADMIN_NOT_FOUND" },
      });
      return;
    }

    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: { code: "SERVER_ERROR" },
    });
  }
}
