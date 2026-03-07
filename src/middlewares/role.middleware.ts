/**
 * FILE: src/middlewares/role.middleware.ts
 * PURPOSE: Role-based access control (RBAC) middleware
 *
 * WORKFLOW:
 * 1. Check if req.actor is set (auth middleware must run first!)
 * 2. Check if req.actor.role is in allowed list
 * 3. If yes, continue
 * 4. If no, return 403 Forbidden
 *
 * USAGE:
 * import { authenticate } from '@/middlewares/auth.middleware';
 * import { systemAdminOnly } from '@/middlewares/role.middleware';
 *
 * router.post('/admin/hotels', authenticate, systemAdminOnly, hotelController.create);
 * // Only system admins can create hotels
 *
 * router.get('/hotel-admin/rooms', authenticate, hotelAdminOnly, roomController.list);
 * // Only hotel admins can view rooms
 */

import type { Request, Response, NextFunction } from "express";
import type { ActorRole } from "@/types/global";
import { logger } from "@/utils/logger";

/**
 * Factory function: Create a middleware that requires certain roles
 *
 * @param allowedRoles - Array of roles that are allowed
 * @returns Middleware function
 *
 * EXAMPLE:
 * const systemAndHotelAdminOnly = requireRole('SYSTEM_ADMIN', 'HOTEL_ADMIN');
 * router.delete('/user/:id', authenticate, systemAndHotelAdminOnly, deleteUser);
 */
export function requireRole(...allowedRoles: ActorRole[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    // Check if authentication middleware ran
    if (!req.actor) {
      logger.warn("Role check attempted without authentication", { ip: req.ip });
      res.status(401).json({
        success: false,
        message: "Authentication required",
        error: { code: "NOT_AUTHENTICATED" },
        data: null,
      });
      return;
    }

    // Check if user's role is in the allowed list
    if (!allowedRoles.includes(req.actor.role)) {
      logger.warn("Unauthorized role access attempt", {
        actor_id: req.actor.id,
        actor_role: req.actor.role,
        required_roles: allowedRoles,
        ip: req.ip,
      });
      res.status(403).json({
        success: false,
        message: `Access denied. Required role: ${allowedRoles.join(" or ")}`,
        error: {
          code: "INSUFFICIENT_PERMISSION",
          required_roles: allowedRoles,
          actual_role: req.actor.role,
        },
        data: null,
      });
      return;
    }

    logger.debug("Role check passed", {
      actor_id: req.actor.id,
      actor_role: req.actor.role,
    });

    // Role is allowed, continue
    next();
  };
}

/**
 * Shortcut middlewares for common role combinations
 * These save typing for frequently used checks
 */

/**
 * Only system admins allowed
 * Used for: Creating hotels, approving hotels, managing system admins
 */
export const systemAdminOnly = requireRole("SYSTEM_ADMIN");

/**
 * Only hotel admins allowed
 * Used for: Managing rooms, viewing bookings for their hotel
 * Note: Can only access their own hotel_id (checked in service layer)
 */
export const hotelAdminOnly = requireRole("HOTEL_ADMIN");

/**
 * Only hotel sub-admins allowed
 * Used for: Checking in/out guests, viewing bookings
 * Note: Can only access their own hotel_id (checked in service layer)
 */
export const hotelSubAdminOnly = requireRole("HOTEL_SUB_ADMIN");

/**
 * Any hotel staff (admin or sub-admin)
 * Used for: Viewing bookings, checking in guests
 */
export const hotelStaffOnly = requireRole("HOTEL_ADMIN", "HOTEL_SUB_ADMIN");

/**
 * Only end users allowed
 * Used for: Making bookings, updating own profile
 */
export const endUserOnly = requireRole("END_USER");
