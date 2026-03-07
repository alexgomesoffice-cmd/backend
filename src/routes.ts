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

/**
 * Create main router
 * All module routers will be mounted here
 */
export const router = Router();

/**
 * TODO: Add module routers as built
 * 
 * EXAMPLE (Phase 2):
 * import { router as systemAdminAuthRouter } from "@/modules/auth/systemAdmin/systemAdmin.auth.routes';
 * router.use("/auth/system-admin", systemAdminAuthRouter);
 *
 * EXAMPLE (Phase 3):
 * import { router as hotelAdminAuthRouter } from "@/modules/auth/hotelAdmin/hotelAdmin.auth.routes';
 * router.use("/auth/hotel-admin", hotelAdminAuthRouter);
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
