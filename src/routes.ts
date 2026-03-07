/**
 * FILE: src/routes.ts
 * PURPOSE: Central route aggregator
 *
 * WORKFLOW:
 * This file imports routers from all modules and mounts them
 * As we build each phase, we add more routers here
 *
 * STRUCTURE:
 * /api
 * ├── /auth
 * │   ├── /system-admin   → Phase 2
 * │   ├── /hotel-admin    → Phase 3
 * │   ├── /hotel-sub-admin → Phase 4
 * │   └── /end-user       → Phase 5
 * ├── /system-admin       → Phase 6 (admin features)
 * ├── /hotels             → Phase 7 (hotel module)
 * ├── /rooms              → Phase 8 (room module)
 * ├── /bookings           → Phase 9 (booking module)
 * └── (profiles, etc.)    → Phase 10
 *
 * CURRENTLY (Phase 1):
 * - No module routers yet
 * - This file is empty/minimal
 * - Will grow as we build each phase
 */

import { Router } from "express";
import systemAdminAuthRouter from "@/modules/auth/systemAdmin/systemAdmin.auth.routes";
import hotelAdminAuthRouter from "@/modules/auth/hotelAdmin/hotelAdmin.auth.routes";
import hotelSubAdminAuthRouter from "@/modules/auth/hotelSubAdmin/hotelSubAdmin.auth.routes";
import endUserAuthRouter from "@/modules/auth/endUser/endUser.auth.routes";
import systemAdminFeaturesRouter from "@/modules/admin/systemAdmin/systemAdmin.features.routes";
import hotelsRouter from "@/modules/hotels/hotels.routes";

/**
 * Create main router
 * All module routers will be mounted here
 */
export const router = Router();

/**
 * Phase 2: System Admin Authentication
 * Mounted at /api/auth/system-admin
 * POST /api/auth/system-admin/login - System admin login
 * POST /api/auth/system-admin/logout - System admin logout (protected)
 */
router.use("/auth/system-admin", systemAdminAuthRouter);

/**
 * Phase 3: Hotel Admin Authentication
 * Mounted at /api/auth/hotel-admin
 * POST /api/auth/hotel-admin/login - Hotel admin login
 * POST /api/auth/hotel-admin/logout - Hotel admin logout (protected)
 */
router.use("/auth/hotel-admin", hotelAdminAuthRouter);

/**
 * Phase 4: Hotel Sub-Admin Authentication
 * Mounted at /api/auth/hotel-sub-admin
 * POST /api/auth/hotel-sub-admin/login - Hotel sub-admin login
 * POST /api/auth/hotel-sub-admin/logout - Hotel sub-admin logout (protected)
 */
router.use("/auth/hotel-sub-admin", hotelSubAdminAuthRouter);

/**
 * Phase 5: End User Authentication
 * Mounted at /api/auth/end-user
 * POST /api/auth/end-user/login - End user login
 * POST /api/auth/end-user/logout - End user logout (protected)
 */
router.use("/auth/end-user", endUserAuthRouter);

/**
 * Phase 6: System Admin Features
 * Mounted at /api/system-admin
 * POST /api/system-admin/create - Create new system admin (protected)
 * GET /api/system-admin - List all system admins (protected)
 * GET /api/system-admin/:id - Get system admin details (protected)
 * PUT /api/system-admin/:id/status - Update admin status (protected)
 * DELETE /api/system-admin/:id - Soft delete admin (protected)
 */
router.use("/system-admin", systemAdminFeaturesRouter);

/**
 * Phase 7: Hotels Module
 * Mounted at /api/hotels
 * POST /api/hotels/create - Create new hotel (protected)
 * GET /api/hotels - List hotels with filters/pagination (public)
 * GET /api/hotels/:id - Get hotel details (public)
 * PUT /api/hotels/:id - Update hotel information (protected)
 * PUT /api/hotels/:id/approval - Update approval status (protected)
 * DELETE /api/hotels/:id - Soft delete hotel (protected)
 */
router.use("/hotels", hotelsRouter);

/**
 * TODO: Add more module routers as built
 * 
 * EXAMPLE (Phase 8):
 * import roomsRouter from "@/modules/rooms/rooms.routes';
 * router.use("/rooms", roomsRouter);
 *
 * EXAMPLE (Phase 9):
 * import bookingsRouter from "@/modules/bookings/bookings.routes';
 * router.use("/bookings", bookingsRouter);
 */

// Placeholder: Return a message that API is alive
router.get("/", (req, res) => {
  res.json({
    success: true,
    message: "MyHotels API - Phase 1 Foundation Complete",
    data: {
      status: "API is running",
      timestamp: new Date().toISOString(),
    },
  });
});
