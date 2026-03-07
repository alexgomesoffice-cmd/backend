/**
 * FILE: src/modules/auth/hotelAdmin/hotelAdmin.auth.routes.ts
 * PURPOSE: HTTP routes for hotel admin authentication
 *
 * WHAT IT DOES:
 * - Defines POST /login endpoint (no auth required)
 * - Defines POST /logout endpoint (auth required)
 * - Attaches controllers to routes
 *
 * USAGE:
 * In src/routes.ts, add:
 * import hotelAdminAuthRouter from '@/modules/auth/hotelAdmin/hotelAdmin.auth.routes';
 * router.use('/api/auth/hotel-admin', hotelAdminAuthRouter);
 *
 * ENDPOINTS:
 * - POST /api/auth/hotel-admin/login (public)
 * - POST /api/auth/hotel-admin/logout (protected by auth middleware)
 */

import express from "express";
import { loginController, logoutController } from "./hotelAdmin.auth.controller";
import { authenticate } from "@/middlewares/auth.middleware";

const router = express.Router();

/**
 * POST /api/auth/hotel-admin/login
 * Login endpoint (public, no authentication required)
 *
 * REQUEST BODY:
 * { "email": "admin@grandhotel.com", "password": "admin123" }
 *
 * RESPONSE:
 * { "success": true, "message": "Login successful", "data": { "token": "...", "admin": {...} } }
 */
router.post("/login", loginController);

/**
 * POST /api/auth/hotel-admin/logout
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
