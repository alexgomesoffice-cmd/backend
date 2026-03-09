/**
 * FILE: src/modules/hotels/hotels.controller.ts
 * PURPOSE: HTTP request/response handlers for hotel operations
 *
 * WHAT IT DOES:
 * - Handles POST /create to create new hotels
 * - Handles GET /:id to retrieve hotel details
 * - Handles GET / to list hotels with filters
 * - Handles PUT /:id to update hotel info
 * - Handles PUT /:id/approval to change approval status
 * - Handles DELETE /:id to soft delete hotel
 *
 * USAGE:
 * import { createHotelController, getHotelController } from './hotels.controller';
 * router.post('/create', authenticate, createHotelController);
 * router.get('/:id', getHotelController);
 */

import type { Request, Response, NextFunction } from "express";
import {
  createHotel,
  createHotelWithDetails,
  getHotel,
  listHotels,
  updateHotel,
  updateHotelApprovalStatus,
  deleteHotel,
} from "./hotels.service";
import {
  validateCreateHotelInput,
  validateUpdateHotelInput,
  validateHotelId,
  validateApprovalStatus,
} from "./hotels.validation";

/**
 * Handles POST /api/hotels/create request
 *
 * REQUIRES: Authentication (system admin only)
 *
 * REQUEST BODY:
 * {
 *   "name": "Grand Hotel",
 *   "email": "info@grandhotel.com",
 *   "city": "Dhaka",
 *   "address": "123 Main St",
 *   "star_rating": 4.5
 * }
 *
 * @async
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 * @param {NextFunction} next - Express next middleware function
 * @returns {void}
 */
export async function createHotelController(
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

    const hotelData = req.body;

    // Validate input
    const validation = validateCreateHotelInput(hotelData);
    if (!validation.isValid) {
      res.status(400).json({
        success: false,
        message: "Validation failed",
        error: { code: "VALIDATION_ERROR", details: validation.errors },
      });
      return;
    }

    // Call service with amenities and images
    const hotel = hotelData.amenities || hotelData.images 
      ? await createHotelWithDetails(hotelData, req.actor.id)
      : await createHotel(hotelData, req.actor.id);

    // Return success
    res.status(201).json({
      success: true,
      message: "Hotel created successfully",
      data: hotel,
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
 * Handles GET /api/hotels/:id request
 *
 * URL PARAMS:
 * id - Hotel ID
 *
 * @async
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 * @param {NextFunction} next - Express next middleware function
 * @returns {void}
 */
export async function getHotelController(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const hotelId = parseInt((req.params.id as string) || "0", 10);

    // Validate hotel ID
    const validation = validateHotelId(hotelId);
    if (!validation.isValid) {
      res.status(400).json({
        success: false,
        message: "Validation failed",
        error: { code: "VALIDATION_ERROR", details: validation.errors },
      });
      return;
    }

    // Call service
    const hotel = await getHotel(hotelId);

    // Return success
    res.status(200).json({
      success: true,
      message: "Hotel retrieved successfully",
      data: hotel,
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

    // Unexpected error
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: { code: "SERVER_ERROR" },
    });
  }
}

/**
 * Handles GET /api/hotels request
 *
 * QUERY PARAMS:
 * skip - Records to skip (default: 0)
 * take - Records to return (default: 10, max: 100)
 * approval_status - Filter by status (DRAFT, PENDING_APPROVAL, PUBLISHED, REJECTED)
 * city - Filter by city name
 * hotel_type - Filter by hotel type
 *
 * @async
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 * @param {NextFunction} next - Express next middleware function
 * @returns {void}
 */
export async function listHotelsController(
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
    if (req.query.approval_status) filters.approval_status = req.query.approval_status;
    if (req.query.city) filters.city = req.query.city;
    if (req.query.hotel_type) filters.hotel_type = req.query.hotel_type;

    // Call service
    const result = await listHotels(filters, skip, take);

    // Return success
    res.status(200).json({
      success: true,
      message: "Hotels retrieved successfully",
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
 * Handles PUT /api/hotels/:id request
 *
 * REQUIRES: Authentication (system admin only)
 *
 * URL PARAMS:
 * id - Hotel ID
 *
 * REQUEST BODY:
 * {
 *   "name": "Updated Hotel Name",
 *   "star_rating": 4.8
 * }
 *
 * @async
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 * @param {NextFunction} next - Express next middleware function
 * @returns {void}
 */
export async function updateHotelController(
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

    const hotelId = parseInt((req.params.id as string) || "0", 10);

    // Validate hotel ID
    const idValidation = validateHotelId(hotelId);
    if (!idValidation.isValid) {
      res.status(400).json({
        success: false,
        message: "Validation failed",
        error: { code: "VALIDATION_ERROR", details: idValidation.errors },
      });
      return;
    }

    // Validate update data
    const dataValidation = validateUpdateHotelInput(req.body);
    if (!dataValidation.isValid) {
      res.status(400).json({
        success: false,
        message: "Validation failed",
        error: { code: "VALIDATION_ERROR", details: dataValidation.errors },
      });
      return;
    }

    // Call service
    const updated = await updateHotel(hotelId, req.body);

    // Return success
    res.status(200).json({
      success: true,
      message: "Hotel updated successfully",
      data: updated,
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

    // Unexpected error
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: { code: "SERVER_ERROR" },
    });
  }
}

/**
 * Handles PUT /api/hotels/:id/approval request
 *
 * REQUIRES: Authentication (system admin only)
 *
 * URL PARAMS:
 * id - Hotel ID
 *
 * REQUEST BODY:
 * {
 *   "approval_status": "PUBLISHED"
 * }
 *
 * @async
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 * @param {NextFunction} next - Express next middleware function
 * @returns {void}
 */
export async function updateApprovalStatusController(
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

    const hotelId = parseInt((req.params.id as string) || "0", 10);
    const { approval_status } = req.body;

    // Validate hotel ID
    const idValidation = validateHotelId(hotelId);
    if (!idValidation.isValid) {
      res.status(400).json({
        success: false,
        message: "Validation failed",
        error: { code: "VALIDATION_ERROR", details: idValidation.errors },
      });
      return;
    }

    // Validate approval status
    const statusValidation = validateApprovalStatus(approval_status);
    if (!statusValidation.isValid) {
      res.status(400).json({
        success: false,
        message: "Validation failed",
        error: { code: "VALIDATION_ERROR", details: statusValidation.errors },
      });
      return;
    }

    // Call service
    const updated = await updateHotelApprovalStatus(hotelId, approval_status, req.actor.id);

    // Return success
    res.status(200).json({
      success: true,
      message: "Hotel approval status updated successfully",
      data: updated,
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

    // Unexpected error
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: { code: "SERVER_ERROR" },
    });
  }
}

/**
 * Handles DELETE /api/hotels/:id request
 *
 * REQUIRES: Authentication (system admin only)
 *
 * URL PARAMS:
 * id - Hotel ID to delete
 *
 * @async
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 * @param {NextFunction} next - Express next middleware function
 * @returns {void}
 */
export async function deleteHotelController(
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

    const hotelId = parseInt((req.params.id as string) || "0", 10);

    // Validate hotel ID
    const validation = validateHotelId(hotelId);
    if (!validation.isValid) {
      res.status(400).json({
        success: false,
        message: "Validation failed",
        error: { code: "VALIDATION_ERROR", details: validation.errors },
      });
      return;
    }

    // Call service
    const result = await deleteHotel(hotelId);

    // Return success
    res.status(200).json({
      success: true,
      message: result.message,
      data: { hotel_id: result.hotel_id },
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

    // Unexpected error
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: { code: "SERVER_ERROR" },
    });
  }
}
