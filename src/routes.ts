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
 * TODO: Add more module routers as built
 * 
 * EXAMPLE (Phase 3):
 * import hotelAdminAuthRouter from "@/modules/auth/hotelAdmin/hotelAdmin.auth.routes';
 * router.use("/auth/hotel-admin", hotelAdminAuthRouter);
 *
 * EXAMPLE (Phase 4):
 * import hotelSubAdminAuthRouter from "@/modules/auth/hotelSubAdmin/hotelSubAdmin.auth.routes';
 * router.use("/auth/hotel-sub-admin", hotelSubAdminAuthRouter);
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
