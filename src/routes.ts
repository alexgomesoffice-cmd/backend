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
import roomsRouter from "@/modules/rooms/rooms.routes";
import bookingsRouter from "@/modules/bookings/bookings.routes";
import endUsersRouter from "@/modules/endUsers/endUsers.routes";

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
 * Phase 8: Rooms Module
 * Mounted at /api/rooms
 * POST /api/rooms/create - Create new room type (protected)
 * GET /api/rooms - List rooms with filters/pagination (public)
 * GET /api/rooms/:id - Get room details (public)
 * PUT /api/rooms/:id - Update room information (protected)
 * PUT /api/rooms/:id/approval - Update approval status (protected)
 * DELETE /api/rooms/:id - Delete room (protected)
 */
router.use("/rooms", roomsRouter);

/**
 * Phase 9: Bookings Module
 * Mounted at /api/bookings
 * POST /api/bookings/create - Create new booking (protected)
 * GET /api/bookings - List bookings with filters/pagination (public)
 * GET /api/bookings/:id - Get booking details (public)
 * GET /api/bookings/availability/:hotelId - Check room availability (public)
 * PUT /api/bookings/:id/status - Update booking status (protected)
 * POST /api/bookings/:id/cancel - Cancel booking (protected)
 */
router.use("/bookings", bookingsRouter);

/**
 * End Users Management
 * Mounted at /api/end-users
 * GET /api/end-users - List end users with filters/pagination (public)
 * GET /api/end-users/:id - Get end user details (public)
 * PUT /api/end-users/:id/block - Block/unblock end user (protected)
 */
router.use("/end-users", endUsersRouter);

/**
 * TODO: Add more module routers as built
 * 
 * EXAMPLE (Phase 10):
 * import profilesRouter from "@/modules/profiles/profiles.routes';
 * router.use("/profiles", profilesRouter);
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
