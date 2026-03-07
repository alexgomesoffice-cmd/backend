/**
 * FILE: src/modules/auth/endUser/endUser.auth.routes.ts
 * PURPOSE: HTTP routes for end user authentication
 *
 * WHAT IT DOES:
 * - Defines POST /login endpoint (no auth required)
 * - Defines POST /logout endpoint (auth required)
 * - Attaches controllers to routes
 *
 * USAGE:
 * In src/routes.ts, add:
 * import endUserAuthRouter from '@/modules/auth/endUser/endUser.auth.routes';
 * router.use('/api/auth/end-user', endUserAuthRouter);
 *
 * ENDPOINTS:
 * - POST /api/auth/end-user/login (public)
 * - POST /api/auth/end-user/logout (protected by auth middleware)
 */

import express from "express";
import { loginController, logoutController } from "./endUser.auth.controller";
import { authenticate } from "@/middlewares/auth.middleware";

const router = express.Router();

/**
 * POST /api/auth/end-user/login
 * Login endpoint (public, no authentication required)
 *
 * REQUEST BODY:
 * { "email": "user@example.com", "password": "password123" }
 *
 * RESPONSE:
 * { "success": true, "message": "Login successful", "data": { "token": "...", "user": {...} } }
 */
router.post("/login", loginController);

/**
 * POST /api/auth/end-user/logout
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
