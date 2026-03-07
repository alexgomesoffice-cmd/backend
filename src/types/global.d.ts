/**
 * FILE: src/types/global.d.ts
 * PURPOSE: Global TypeScript type definitions
 *
 * This file extends Express types and defines custom types used throughout the app
 * The .d.ts extension makes TypeScript load this automatically
 *
 * WHAT WE'RE DOING:
 * 1. Defining JwtPayload type (what's inside a JWT token)
 * 2. Defining ActorRole type (the 4 user types in the system)
 * 3. Extending Express Request to add req.actor property
 *
 * WHY THIS MATTERS:
 * - Every middleware and controller needs to know what req.actor contains
 * - TypeScript won't let us access req.actor unless we declare it here
 * - Without this, every req.actor access would show a TypeScript error
 */

/**
 * ActorRole: The 4 types of authenticated actors in the system
 *
 * SYSTEM_ADMIN: Can manage everything (system-wide)
 * HOTEL_ADMIN: Can manage ONE hotel (scoped to hotel_id)
 * HOTEL_SUB_ADMIN: Can manage ONE hotel's bookings only (scoped to hotel_id)
 * END_USER: Guest/customer who makes bookings (no hotel_id)
 */
export type ActorRole = "SYSTEM_ADMIN" | "HOTEL_ADMIN" | "HOTEL_SUB_ADMIN" | "END_USER";

/**
 * JwtPayload: What's inside every JWT token
 *
 * FIELDS:
 * - id: User's database ID (system_admin_id, hotel_admin_id, etc.)
 * - role: One of the ActorRole values
 * - hotel_id?: Only present for HOTEL_ADMIN and HOTEL_SUB_ADMIN
 *   - Used to scope database queries to the user's hotel
 *   - Example: "Show me bookings for THIS hotel only"
 * - iat: Issued at timestamp (added by JWT library)
 * - exp: Expiration timestamp (added by JWT library)
 *
 * EXAMPLE PAYLOADS:
 * System Admin:
 * { id: 1, role: 'SYSTEM_ADMIN', iat: 1234567890, exp: 1234654290 }
 *
 * Hotel Admin:
 * { id: 5, role: 'HOTEL_ADMIN', hotel_id: 10, iat: 1234567890, exp: 1234654290 }
 *
 * End User:
 * { id: 42, role: 'END_USER', iat: 1234567890, exp: 1234654290 }
 */
export interface JwtPayload {
  id: number; // User ID from respective table
  role: ActorRole; // What type of user
  hotel_id?: number; // Optional: only for hotel staff
}

/**
 * Extend Express Request to include our custom req.actor property
 *
 * WHAT THIS DOES:
 * - After authentication middleware runs, req.actor will contain the decoded JWT
 * - TypeScript now knows about this property
 * - We can access req.actor.id, req.actor.role, req.actor.hotel_id without errors
 *
 * USAGE IN CONTROLLERS:
 * export const getProfile = (req: Request, res: Response) => {
 *   const userId = req.actor.id;  // ✅ TypeScript knows req.actor exists
 *   const userRole = req.actor.role;  // ✅ No errors
 * };
 */
declare global {
  namespace Express {
    interface Request {
      /**
       * The decoded JWT payload of the authenticated user
       * Only set after auth middleware runs successfully
       * Will be undefined on public routes
       */
      actor?: JwtPayload;
    }
  }
}

export {};
