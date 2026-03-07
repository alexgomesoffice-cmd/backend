/**
 * FILE: src/modules/rooms/rooms.routes.ts
 * PURPOSE: HTTP route definitions for room operations
 *
 * ROUTES:
 * POST /create - Create new room type (protected)
 * GET / - List rooms with filters and pagination (public)
 * GET /:id - Get single room details (public)
 * PUT /:id - Update room information (protected)
 * PUT /:id/approval - Update approval status (protected)
 * DELETE /:id - Delete room (protected)
 *
 * USAGE:
 * import roomsRouter from '@/modules/rooms/rooms.routes';
 * router.use('/rooms', roomsRouter);
 */

import { Router } from "express";
import { authenticate } from "@/middlewares/auth.middleware";
import {
  createRoomController,
  getRoomController,
  listRoomsController,
  updateRoomController,
  updateApprovalStatusController,
  deleteRoomController,
} from "./rooms.controller";

const router = Router();

/**
 * POST /create
 * Create a new room type
 * @requires Authentication
 * @query {hotel_id}
 * @body {room_type, base_price, description?, room_size?}
 * @returns {hotel_room_id, hotel_id, room_type, base_price, approval_status, created_at}
 */
router.post("/create", authenticate, createRoomController);

/**
 * GET /
 * List all room types for a hotel with filtering and pagination
 * @query {hotel_id, skip?, take?, approval_status?, room_type?}
 * @returns {rooms: [], total, skip, take}
 */
router.get("/", listRoomsController);

/**
 * GET /:id
 * Get room type details by ID
 * @param {id} Room ID
 * @returns {hotel_room_id, hotel_id, room_type, description, base_price, room_size, approval_status, created_at, updated_at}
 */
router.get("/:id", getRoomController);

/**
 * PUT /:id
 * Update room type information
 * @requires Authentication
 * @param {id} Room ID
 * @body {room_type?, base_price?, description?, room_size?}
 * @returns {hotel_room_id, room_type, base_price, approval_status, updated_at}
 */
router.put("/:id", authenticate, updateRoomController);

/**
 * PUT /:id/approval
 * Update room type approval status
 * @requires Authentication
 * @param {id} Room ID
 * @body {approval_status: PENDING|APPROVED|REJECTED}
 * @returns {hotel_room_id, approval_status, updated_at}
 */
router.put("/:id/approval", authenticate, updateApprovalStatusController);

/**
 * DELETE /:id
 * Delete room type
 * @requires Authentication
 * @param {id} Room ID
 * @returns {message, hotel_room_id}
 */
router.delete("/:id", authenticate, deleteRoomController);

export default router;
