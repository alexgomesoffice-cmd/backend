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
import {
  createHotelAdminController,
  getHotelAdminController,
  updateHotelAdminDetailsController,
} from "./hotelAdmin.controller";

const router = Router();

/**
 * POST /create
 * Create a new hotel (optionally with details, amenities, images, and admin)
 * @requires Authentication
 * @body {
 *   name,
 *   email?,
 *   city?,
 *   address?,
 *   hotel_type?,
 *   owner_name?,
 *   zip_code?,
 *   details?: { description?, reception_no1?, reception_no2?, star_rating?, guest_rating? },
 *   amenities?: string[],
 *   images?: string[],
 *   admin?: { name, email, password, phone?, nid_no?, manager_name?, manager_phone? }
 * }
 * @returns {hotel_id, name, email, city, approval_status, created_at, hotel_details?, hotel_amenities?, hotel_images?, hotel_admins?}
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

/**
 * Hotel Admin Routes
 * ─────────────────────────────────────────────
 */

/**
 * POST /admin/create
 * Create a new hotel admin account
 * @requires Authentication (system admin)
 * @body {hotel_id, name, email, password, phone?, nid_no?, manager_name?, manager_phone?}
 * @returns {hotel_admin_id, name, email, hotel_id, hotel_admin_details}
 */
router.post("/admin/create", authenticate, createHotelAdminController);

/**
 * GET /admin/:id
 * Get hotel admin details by ID
 * @param {id} Hotel admin ID
 * @returns {hotel_admin_id, name, email, hotel_id, hotel_admin_details}
 */
router.get("/admin/:id", getHotelAdminController);

/**
 * PUT /admin/:id
 * Update hotel admin details
 * @requires Authentication
 * @param {id} Hotel admin ID
 * @body {phone?, nid_no?, manager_name?, manager_phone?, address?, image_url?}
 * @returns {updated details}
 */
router.put("/admin/:id", authenticate, updateHotelAdminDetailsController);

export default router;
