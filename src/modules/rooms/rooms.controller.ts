/**
 * FILE: src/modules/rooms/rooms.controller.ts
 * PURPOSE: HTTP request/response handlers for room operations
 *
 * WHAT IT DOES:
 * - Handles POST /create to create new room type
 * - Handles GET /:id to retrieve room details
 * - Handles GET / to list rooms with filters
 * - Handles PUT /:id to update room info
 * - Handles PUT /:id/approval to change approval status
 * - Handles DELETE /:id to delete room type
 *
 * USAGE:
 * import { createRoomController, getRoomController } from './rooms.controller';
 * router.post('/create', authenticate, createRoomController);
 * router.get('/:id', getRoomController);
 */

import type { Request, Response, NextFunction } from "express";
import {
  createRoom,
  getRoom,
  listRooms,
  updateRoom,
  updateApprovalStatus,
  deleteRoom,
} from "./rooms.service";
import {
  validateCreateRoomInput,
  validateUpdateRoomInput,
  validateRoomId,
  validateApprovalStatus,
} from "./rooms.validation";

/**
 * Handles POST /api/rooms/create request
 *
 * REQUIRES: Authentication (hotel admin or above)
 *
 * QUERY PARAMS:
 * hotel_id - Hotel ID to create room for
 *
 * REQUEST BODY:
 * {
 *   "room_type": "Deluxe Double",
 *   "base_price": 150.50,
 *   "description": "Spacious room with queen bed",
 *   "room_size": "40m²"
 * }
 *
 * @async
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 * @param {NextFunction} next - Express next middleware function
 * @returns {void}
 */
export async function createRoomController(
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

    const hotelId = parseInt((req.query.hotel_id as string) || "0", 10);
    const roomData = req.body;

    // Validate hotel ID
    if (!hotelId || hotelId <= 0) {
      res.status(400).json({
        success: false,
        message: "Validation failed",
        error: { code: "VALIDATION_ERROR", details: ["hotel_id is required and must be > 0"] },
      });
      return;
    }

    // Validate input
    const validation = validateCreateRoomInput(roomData);
    if (!validation.isValid) {
      res.status(400).json({
        success: false,
        message: "Validation failed",
        error: { code: "VALIDATION_ERROR", details: validation.errors },
      });
      return;
    }

    // Call service
    const room = await createRoom(roomData, hotelId);

    // Return success
    res.status(201).json({
      success: true,
      message: "Room created successfully",
      data: room,
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
 * Handles GET /api/rooms/:id request
 *
 * URL PARAMS:
 * id - Room ID
 *
 * @async
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 * @param {NextFunction} next - Express next middleware function
 * @returns {void}
 */
export async function getRoomController(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const roomId = parseInt((req.params.id as string) || "0", 10);

    // Validate room ID
    const validation = validateRoomId(roomId);
    if (!validation.isValid) {
      res.status(400).json({
        success: false,
        message: "Validation failed",
        error: { code: "VALIDATION_ERROR", details: validation.errors },
      });
      return;
    }

    // Call service
    const room = await getRoom(roomId);

    // Return success
    res.status(200).json({
      success: true,
      message: "Room retrieved successfully",
      data: room,
    });
  } catch (error: any) {
    // Handle service errors
    if (error.message === "ROOM_NOT_FOUND") {
      res.status(404).json({
        success: false,
        message: "Room not found",
        error: { code: "ROOM_NOT_FOUND" },
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
 * Handles GET /api/rooms request
 *
 * QUERY PARAMS:
 * hotel_id - Hotel ID (required)
 * skip - Records to skip (default: 0)
 * take - Records to return (default: 10, max: 100)
 * approval_status - Filter by status (PENDING, APPROVED, REJECTED)
 * room_type - Filter by room type name (contains)
 *
 * @async
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 * @param {NextFunction} next - Express next middleware function
 * @returns {void}
 */
export async function listRoomsController(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const hotelId = parseInt((req.query.hotel_id as string) || "0", 10);

    // Validate hotel ID
    if (!hotelId || hotelId <= 0) {
      res.status(400).json({
        success: false,
        message: "Validation failed",
        error: { code: "VALIDATION_ERROR", details: ["hotel_id is required and must be > 0"] },
      });
      return;
    }

    // Parse pagination
    const skip = Math.max(0, parseInt(req.query.skip as string) || 0);
    const take = Math.min(100, Math.max(1, parseInt(req.query.take as string) || 10));

    // Parse filters
    const filters: any = {};
    if (req.query.approval_status) filters.approval_status = req.query.approval_status;
    if (req.query.room_type) filters.room_type = req.query.room_type;

    // Call service
    const result = await listRooms(hotelId, filters, skip, take);

    // Return success
    res.status(200).json({
      success: true,
      message: "Rooms retrieved successfully",
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
 * Handles PUT /api/rooms/:id request
 *
 * REQUIRES: Authentication (hotel admin or above)
 *
 * URL PARAMS:
 * id - Room ID
 *
 * REQUEST BODY:
 * {
 *   "base_price": 175.00,
 *   "description": "Updated description"
 * }
 *
 * @async
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 * @param {NextFunction} next - Express next middleware function
 * @returns {void}
 */
export async function updateRoomController(
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

    const roomId = parseInt((req.params.id as string) || "0", 10);

    // Validate room ID
    const idValidation = validateRoomId(roomId);
    if (!idValidation.isValid) {
      res.status(400).json({
        success: false,
        message: "Validation failed",
        error: { code: "VALIDATION_ERROR", details: idValidation.errors },
      });
      return;
    }

    // Validate update data
    const dataValidation = validateUpdateRoomInput(req.body);
    if (!dataValidation.isValid) {
      res.status(400).json({
        success: false,
        message: "Validation failed",
        error: { code: "VALIDATION_ERROR", details: dataValidation.errors },
      });
      return;
    }

    // Call service
    const updated = await updateRoom(roomId, req.body);

    // Return success
    res.status(200).json({
      success: true,
      message: "Room updated successfully",
      data: updated,
    });
  } catch (error: any) {
    // Handle service errors
    if (error.message === "ROOM_NOT_FOUND") {
      res.status(404).json({
        success: false,
        message: "Room not found",
        error: { code: "ROOM_NOT_FOUND" },
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
 * Handles PUT /api/rooms/:id/approval request
 *
 * REQUIRES: Authentication (system admin or above)
 *
 * URL PARAMS:
 * id - Room ID
 *
 * REQUEST BODY:
 * {
 *   "approval_status": "APPROVED"
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

    const roomId = parseInt((req.params.id as string) || "0", 10);
    const { approval_status } = req.body;

    // Validate room ID
    const idValidation = validateRoomId(roomId);
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
    const updated = await updateApprovalStatus(roomId, approval_status);

    // Return success
    res.status(200).json({
      success: true,
      message: "Room approval status updated successfully",
      data: updated,
    });
  } catch (error: any) {
    // Handle service errors
    if (error.message === "ROOM_NOT_FOUND") {
      res.status(404).json({
        success: false,
        message: "Room not found",
        error: { code: "ROOM_NOT_FOUND" },
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
 * Handles DELETE /api/rooms/:id request
 *
 * REQUIRES: Authentication (hotel admin or above)
 *
 * URL PARAMS:
 * id - Room ID to delete
 *
 * @async
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 * @param {NextFunction} next - Express next middleware function
 * @returns {void}
 */
export async function deleteRoomController(
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

    const roomId = parseInt((req.params.id as string) || "0", 10);

    // Validate room ID
    const validation = validateRoomId(roomId);
    if (!validation.isValid) {
      res.status(400).json({
        success: false,
        message: "Validation failed",
        error: { code: "VALIDATION_ERROR", details: validation.errors },
      });
      return;
    }

    // Call service
    const result = await deleteRoom(roomId);

    // Return success
    res.status(200).json({
      success: true,
      message: result.message,
      data: { hotel_room_id: result.hotel_room_id },
    });
  } catch (error: any) {
    // Handle service errors
    if (error.message === "ROOM_NOT_FOUND") {
      res.status(404).json({
        success: false,
        message: "Room not found",
        error: { code: "ROOM_NOT_FOUND" },
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
