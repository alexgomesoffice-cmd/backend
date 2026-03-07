/**
 * FILE: src/modules/hotels/hotels.routes.ts
 * PURPOSE: HTTP route definitions for hotel operations
 *
 * ROUTES:
 * POST /create - Create new hotel
 * GET / - List hotels with filters and pagination
 * GET /:id - Get single hotel details
 * PUT /:id - Update hotel information
 * PUT /:id/approval - Update approval status
 * DELETE /:id - Delete hotel (soft delete)
 *
 * USAGE:
 * import hotelsRouter from '@/modules/hotels/hotels.routes';
 * router.use('/hotels', hotelsRouter);
 */

import { Router } from "express";
import { authenticate } from "@/middlewares/auth.middleware";
import {
  createHotelController,
  getHotelController,
  listHotelsController,
  updateHotelController,
  updateApprovalStatusController,
  deleteHotelController,
} from "./hotels.controller";

const router = Router();

/**
 * POST /create
 * Create a new hotel
 * @requires Authentication
 * @body {name, email?, city?, address?, hotel_type?, owner_name?, description?, star_rating?}
 * @returns {hotel_id, name, email, city, approval_status, created_at}
 */
router.post("/create", authenticate, createHotelController);

/**
 * GET /
 * List all hotels with filtering and pagination
 * @query {skip?, take?, approval_status?, city?, hotel_type?}
 * @returns {hotels: [], total, skip, take}
 */
router.get("/", listHotelsController);

/**
 * GET /:id
 * Get hotel details by ID
 * @param {id} Hotel ID
 * @returns {hotel_id, name, email, address, city, hotel_type, owner_name, description, star_rating, guest_rating, approval_status, published_at, created_at, updated_at}
 */
router.get("/:id", getHotelController);

/**
 * PUT /:id
 * Update hotel information
 * @requires Authentication
 * @param {id} Hotel ID
 * @body {name?, email?, city?, address?, hotel_type?, owner_name?, description?, star_rating?}
 * @returns {hotel_id, name, email, city, approval_status, updated_at}
 */
router.put("/:id", authenticate, updateHotelController);

/**
 * PUT /:id/approval
 * Update hotel approval status
 * @requires Authentication
 * @param {id} Hotel ID
 * @body {approval_status: DRAFT|PENDING_APPROVAL|PUBLISHED|REJECTED}
 * @returns {hotel_id, approval_status, published_at, updated_at}
 */
router.put("/:id/approval", authenticate, updateApprovalStatusController);

/**
 * DELETE /:id
 * Delete hotel (soft delete)
 * @requires Authentication
 * @param {id} Hotel ID
 * @returns {message, hotel_id}
 */
router.delete("/:id", authenticate, deleteHotelController);

export default router;
