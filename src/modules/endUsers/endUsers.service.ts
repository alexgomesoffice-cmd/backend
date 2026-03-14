/**
 * FILE: src/modules/endUsers/endUsers.service.ts
 * PURPOSE: Business logic for end user operations
 *
 * WHAT IT DOES:
 * - listEndUsers(filters, skip, take) - List all end users with pagination
 * - getEndUser(endUserId) - Get single end user details
 * - blockEndUser(endUserId) - Block/unblock end user
 *
 * USAGE:
 * import { listEndUsers, getEndUser } from './endUsers.service';
 * const users = await listEndUsers({}, 0, 10);
 */

import { prisma } from "@/config/prisma";

/**
 * List all end users with pagination and filtering
 *
 * @param {object} filters - Filtering options (is_blocked, search)
 * @param {number} skip - Records to skip (pagination)
 * @param {number} take - Records to return (pagination)
 * @returns {Promise<object>} { users: [], total, skip, take }
 *
 * @example
 * const result = await listEndUsers({ is_blocked: false }, 0, 20);
 */
export async function listEndUsers(filters: any = {}, skip: number = 0, take: number = 10) {
  // Build where clause
  const where: any = {};

  // Exclude soft-deleted users (deleted_at IS NULL)
  where.deleted_at = null;

  if (filters.is_blocked !== undefined) {
    where.is_blocked = filters.is_blocked === true || filters.is_blocked === "true";
  }

  if (filters.search) {
    where.OR = [
      { email: { contains: filters.search } },
      { name: { contains: filters.search } },
    ];
  }

  // Fetch end users and total count in parallel
  const [endUsers, total] = await Promise.all([
    prisma.end_users.findMany({
      where,
      select: {
        end_user_id: true,
        email: true,
        name: true,
        is_blocked: true,
        email_verified: true,
        last_login_at: true,
        created_at: true,
      },
      skip,
      take,
      orderBy: { created_at: "desc" },
    }),
    prisma.end_users.count({ where }),
  ]);

  return {
    end_users: endUsers,
    total,
    skip,
    take,
  };
}

/**
 * Get single end user by ID
 *
 * @param {number} endUserId - End user ID
 * @returns {Promise<object>} End user with details
 * @throws Error if user not found
 *
 * @example
 * const user = await getEndUser(42);
 */
export async function getEndUser(endUserId: number) {
  const endUser = await prisma.end_users.findUnique({
    where: { end_user_id: endUserId },
    select: {
      end_user_id: true,
      email: true,
      name: true,
      is_blocked: true,
      email_verified: true,
      last_login_at: true,
      login_attempts: true,
      created_at: true,
      updated_at: true,
      end_user_details: true,
    },
  });

  if (!endUser) {
    throw new Error("END_USER_NOT_FOUND");
  }

  return endUser;
}

/**
 * Block or unblock an end user
 *
 * @param {number} endUserId - End user ID
 * @param {boolean} isBlocked - Block status (true = blocked, false = unblocked)
 * @returns {Promise<object>} Updated end user
 * @throws Error if user not found
 *
 * @example
 * await blockEndUser(42, true); // Block user
 * await blockEndUser(42, false); // Unblock user
 */
export async function blockEndUser(endUserId: number, isBlocked: boolean) {
  const endUser = await prisma.end_users.findUnique({
    where: { end_user_id: endUserId },
    select: { end_user_id: true },
  });

  if (!endUser) {
    throw new Error("END_USER_NOT_FOUND");
  }

  const updated = await prisma.end_users.update({
    where: { end_user_id: endUserId },
    data: { is_blocked: isBlocked },
    select: {
      end_user_id: true,
      email: true,
      name: true,
      is_blocked: true,
      updated_at: true,
    },
  });

  return updated;
}

/**
 * Delete an end user (soft delete)
 *
 * @param {number} endUserId - End user ID
 * @returns {Promise<object>} Deletion confirmation
 * @throws Error if user not found
 *
 * @example
 * await deleteEndUser(42); // Soft delete user
 */
export async function deleteEndUser(endUserId: number) {
  const endUser = await prisma.end_users.findUnique({
    where: { end_user_id: endUserId },
    select: { end_user_id: true },
  });

  if (!endUser) {
    throw new Error("END_USER_NOT_FOUND");
  }

  await prisma.end_users.update({
    where: { end_user_id: endUserId },
    data: { deleted_at: new Date() },
  });

  return {
    message: "End user deleted successfully",
    end_user_id: endUserId,
  };
}
