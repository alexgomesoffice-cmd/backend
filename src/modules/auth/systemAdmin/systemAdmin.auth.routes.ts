/**
 * FILE: src/modules/auth/systemAdmin/systemAdmin.auth.routes.ts
 * PURPOSE: HTTP routes for system admin authentication
 *
 * WHAT IT DOES:
 * - Defines POST /login endpoint (no auth required)
 * - Defines POST /logout endpoint (auth required)
 * - Attaches controllers to routes
 *
 * USAGE:
 * In src/routes.ts, add:
 * import systemAdminAuthRouter from '@/modules/auth/systemAdmin/systemAdmin.auth.routes';
 * router.use('/api/auth/system-admin', systemAdminAuthRouter);
 *
 * ENDPOINTS:
 * - POST /api/auth/system-admin/login (public)
 * - POST /api/auth/system-admin/logout (protected by auth middleware)
 */

import express from "express";
import { loginController, logoutController } from "./systemAdmin.auth.controller";
import { authenticate } from "@/middlewares/auth.middleware";

const router = express.Router();

/**
 * POST /api/auth/system-admin/login
 * Login endpoint (public, no authentication required)
 *
 * REQUEST BODY:
 * { "email": "admin@myhotels.com", "password": "admin123" }
 *
 * RESPONSE:
 * { "success": true, "message": "Login successful", "data": { "token": "...", "admin": {...} } }
 */
router.post("/login", loginController);

/**
 * POST /api/auth/system-admin/logout
 * Logout endpoint (protected, requires valid JWT)
 *
 * HEADERS:
 * { "Authorization": "Bearer <token>" }
 *
 * RESPONSE:
 * { "success": true, "message": "Logout successful", "data": { "message": "...", "token_hash": "..." } }
 *
 * FLOW:
 * 1. authenticate middleware verifies JWT
 * 2. Sets req.actor with decoded payload
 * 3. logoutController processes logout
 */
router.post("/logout", authenticate, logoutController);

export default router;
