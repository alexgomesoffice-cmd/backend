/**
 * FILE: src/modules/endUsers/endUsers.routes.ts
 * PURPOSE: HTTP route definitions for end user operations
 *
 * ROUTES:
 * GET / - List end users with filters and pagination
 * GET /:id - Get single end user details
 * PUT /:id/block - Block/unblock end user
 *
 * USAGE:
 * import endUsersRouter from '@/modules/endUsers/endUsers.routes';
 * router.use('/end-users', endUsersRouter);
 */

import { Router } from "express";
import { authenticate } from "@/middlewares/auth.middleware";
import {
  listEndUsersController,
  getEndUserController,
  blockEndUserController,
  deleteEndUserController,
} from "./endUsers.controller";

const router = Router();

/**
 * GET /
 * List all end users with filtering and pagination
 * @query {skip?, take?, is_blocked?, search?}
 * @returns {end_users: [], total, skip, take}
 */
router.get("/", listEndUsersController);

/**
 * GET /:id
 * Get end user details by ID
 * @param {id} End user ID
 * @returns {end_user_id, email, name, is_blocked, created_at, end_user_details}
 */
router.get("/:id", getEndUserController);

/**
 * PUT /:id/block
 * Block or unblock end user
 * @requires Authentication (system admin)
 * @param {id} End user ID
 * @body {is_blocked: boolean}
 * @returns {end_user_id, email, name, is_blocked, updated_at}
 */
router.put("/:id/block", authenticate, blockEndUserController);

/**
 * DELETE /:id
 * Delete (soft delete) end user
 * @requires Authentication (system admin)
 * @param {id} End user ID
 * @returns {end_user_id}
 */
router.delete("/:id", authenticate, deleteEndUserController);

export default router;
