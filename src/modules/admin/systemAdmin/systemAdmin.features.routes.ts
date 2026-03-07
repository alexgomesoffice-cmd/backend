/**
 * FILE: src/modules/admin/systemAdmin/systemAdmin.features.routes.ts
 * PURPOSE: HTTP routes for system admin feature operations
 *
 * WHAT IT DOES:
 * - Defines POST /create endpoint to create new system admin
 * - Defines GET / endpoint to list all system admins
 * - Defines GET /:id endpoint to retrieve admin details
 * - Defines PUT /:id/status endpoint to update admin status
 * - Defines DELETE /:id endpoint to soft delete admin
 *
 * USAGE:
 * In src/routes.ts, add:
 * import systemAdminFeaturesRouter from '@/modules/admin/systemAdmin/systemAdmin.features.routes';
 * router.use('/api/system-admin', systemAdminFeaturesRouter);
 *
 * ENDPOINTS:
 * - POST /api/system-admin/create (protected)
 * - GET /api/system-admin (protected)
 * - GET /api/system-admin/:id (protected)
 * - PUT /api/system-admin/:id/status (protected)
 * - DELETE /api/system-admin/:id (protected)
 */

import express from "express";
import {
  createAdminController,
  listAdminsController,
  getAdminController,
  updateStatusController,
  deleteAdminController,
} from "./systemAdmin.features.controller";
import { authenticate } from "@/middlewares/auth.middleware";

const router = express.Router();

// All routes require authentication
router.use(authenticate);

/**
 * POST /api/system-admin/create
 * Create a new system admin account
 *
 * REQUIRES: Authentication (system admin only)
 *
 * REQUEST BODY:
 * {
 *   "name": "New Admin",
 *   "email": "admin@myhotels.com",
 *   "password": "password123"
 * }
 *
 * RESPONSE (201):
 * {
 *   "success": true,
 *   "message": "System admin created successfully",
 *   "data": { "system_admin_id": 5, "email": "...", "name": "...", ... }
 * }
 */
router.post("/create", createAdminController);

/**
 * GET /api/system-admin
 * List all system admins with pagination
 *
 * REQUIRES: Authentication (system admin only)
 *
 * QUERY PARAMS:
 * skip - Number of records to skip (default: 0)
 * take - Number of records to return (default: 10, max: 100)
 *
 * RESPONSE (200):
 * {
 *   "success": true,
 *   "message": "System admins retrieved successfully",
 *   "data": { "admins": [...], "total": 15, "skip": 0, "take": 10 }
 * }
 */
router.get("/", listAdminsController);

/**
 * GET /api/system-admin/:id
 * Retrieve system admin details by ID
 *
 * REQUIRES: Authentication (system admin only)
 *
 * URL PARAMS:
 * id - System admin ID
 *
 * RESPONSE (200):
 * {
 *   "success": true,
 *   "message": "System admin retrieved successfully",
 *   "data": { "system_admin_id": 5, "email": "...", "name": "...", ... }
 * }
 */
router.get("/:id", getAdminController);

/**
 * PUT /api/system-admin/:id/status
 * Update system admin status (is_active, is_blocked)
 *
 * REQUIRES: Authentication (system admin only)
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
 * RESPONSE (200):
 * {
 *   "success": true,
 *   "message": "System admin status updated successfully",
 *   "data": { "system_admin_id": 5, "is_active": true, "is_blocked": false, ... }
 * }
 */
router.put("/:id/status", updateStatusController);

/**
 * DELETE /api/system-admin/:id
 * Soft delete a system admin account
 *
 * REQUIRES: Authentication (system admin only)
 *
 * URL PARAMS:
 * id - System admin ID to delete
 *
 * RESPONSE (200):
 * {
 *   "success": true,
 *   "message": "Admin deleted successfully",
 *   "data": { "system_admin_id": 5 }
 * }
 */
router.delete("/:id", deleteAdminController);

export default router;
