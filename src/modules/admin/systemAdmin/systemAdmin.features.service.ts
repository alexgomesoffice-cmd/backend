/**
 * FILE: src/modules/admin/systemAdmin/systemAdmin.features.service.ts
 * PURPOSE: Business logic for system admin management features
 *
 * WHAT IT DOES:
 * - Creates new system admin accounts
 * - Retrieves admin details and lists
 * - Updates admin status (is_active, is_blocked)
 * - Soft deletes admin accounts
 *
 * USAGE:
 * import { createSystemAdmin, getSystemAdmin, updateAdminStatus } from './systemAdmin.features.service';
 * const newAdmin = await createSystemAdmin(name, email, password, createdBy);
 * const admin = await getSystemAdmin(adminId);
 * await updateAdminStatus(adminId, is_active, is_blocked);
 *
 * DATABASE TABLES:
 * - system_admins: System admin accounts
 */

import { prisma } from "@/config/prisma";
import { hashPassword } from "@/utils/password";

/**
 * Creates a new system admin account
 *
 * WORKFLOW:
 * 1. Check if email already exists (must be unique)
 * 2. Hash the provided password
 * 3. Create new system admin in database
 * 4. Return created admin object (without password)
 *
 * @param {string} name - System admin name
 * @param {string} email - System admin email (must be unique)
 * @param {string} password - Plain text password (will be hashed)
 * @param {number} createdBy - System admin ID who is creating this admin
 * @returns {{system_admin_id, email, name, is_active, is_blocked, created_at}} Created admin object
 * @throws {Error} EMAIL_ALREADY_EXISTS, HASH_ERROR
 *
 * @example
 * try {
 *   const admin = await createSystemAdmin("New Admin", "new@myhotels.com", "password123", 1);
 *   console.log("Created admin ID:", admin.system_admin_id);
 * } catch (error) {
 *   if (error.message === "EMAIL_ALREADY_EXISTS") {
 *     // Email already registered
 *   }
 * }
 */
export async function createSystemAdmin(
  name: string,
  email: string,
  password: string,
  createdBy: number
) {
  // Check if email already exists
  const existingAdmin = await prisma.system_admins.findUnique({
    where: { email },
  });

  if (existingAdmin) {
    throw new Error("EMAIL_ALREADY_EXISTS");
  }

  // Hash password
  const hashedPassword = await hashPassword(password);

  // Create system admin
  const admin = await prisma.system_admins.create({
    data: {
      name,
      email,
      password: hashedPassword,
      created_by: createdBy,
      is_active: true,
      is_blocked: false,
    },
    select: {
      system_admin_id: true,
      email: true,
      name: true,
      is_active: true,
      is_blocked: true,
      created_at: true,
    },
  });

  return admin;
}

/**
 * Retrieves a system admin by ID
 *
 * WORKFLOW:
 * 1. Find system admin in database by ID
 * 2. Return admin object (without password)
 *
 * @param {number} adminId - System admin ID
 * @returns {{system_admin_id, email, name, is_active, is_blocked, last_login_at, created_at}} Admin object
 * @throws {Error} ADMIN_NOT_FOUND
 *
 * @example
 * try {
 *   const admin = await getSystemAdmin(5);
 *   console.log("Admin:", admin);
 * } catch (error) {
 *   if (error.message === "ADMIN_NOT_FOUND") {
 *     // Admin does not exist
 *   }
 * }
 */
export async function getSystemAdmin(adminId: number) {
  const admin = await prisma.system_admins.findUnique({
    where: { system_admin_id: adminId },
    select: {
      system_admin_id: true,
      email: true,
      name: true,
      is_active: true,
      is_blocked: true,
      last_login_at: true,
      created_at: true,
    },
  });

  if (!admin) {
    throw new Error("ADMIN_NOT_FOUND");
  }

  return admin;
}

/**
 * Lists all system admins with optional filtering
 *
 * WORKFLOW:
 * 1. Query system_admins table with filters
 * 2. Apply pagination if needed
 * 3. Return list of admin objects (without passwords)
 *
 * @param {number} skip - Number of records to skip (pagination)
 * @param {number} take - Number of records to return (pagination)
 * @returns {{admins: Array, total: number}} List of admins and total count
 *
 * @example
 * const result = await listSystemAdmins(0, 10); // First 10 records
 * console.log("Admins:", result.admins);
 * console.log("Total:", result.total);
 */
export async function listSystemAdmins(skip: number = 0, take: number = 10) {
  const [admins, total] = await Promise.all([
    prisma.system_admins.findMany({
      skip,
      take,
      select: {
        system_admin_id: true,
        email: true,
        name: true,
        is_active: true,
        is_blocked: true,
        last_login_at: true,
        created_at: true,
      },
      orderBy: { created_at: "desc" },
    }),
    prisma.system_admins.count(),
  ]);

  return {
    admins,
    total,
    skip,
    take,
  };
}

/**
 * Updates system admin status (is_active, is_blocked)
 *
 * WORKFLOW:
 * 1. Find system admin by ID
 * 2. Check if admin exists
 * 3. Update specified fields
 * 4. Return updated admin object
 *
 * @param {number} adminId - System admin ID
 * @param {boolean} is_active - Account active status (optional)
 * @param {boolean} is_blocked - Account blocked status (optional)
 * @returns {{system_admin_id, email, name, is_active, is_blocked}} Updated admin object
 * @throws {Error} ADMIN_NOT_FOUND
 *
 * @example
 * try {
 *   const updated = await updateAdminStatus(5, false, true); // Deactivate and block
 *   console.log("Updated:", updated);
 * } catch (error) {
 *   if (error.message === "ADMIN_NOT_FOUND") {
 *     // Admin does not exist
 *   }
 * }
 */
export async function updateAdminStatus(
  adminId: number,
  is_active?: boolean,
  is_blocked?: boolean
) {
  // Check if admin exists
  const existingAdmin = await prisma.system_admins.findUnique({
    where: { system_admin_id: adminId },
  });

  if (!existingAdmin) {
    throw new Error("ADMIN_NOT_FOUND");
  }

  // Build update data
  const updateData: any = {};
  if (is_active !== undefined) {
    updateData.is_active = is_active;
  }
  if (is_blocked !== undefined) {
    updateData.is_blocked = is_blocked;
  }

  // Update admin
  const updated = await prisma.system_admins.update({
    where: { system_admin_id: adminId },
    data: updateData,
    select: {
      system_admin_id: true,
      email: true,
      name: true,
      is_active: true,
      is_blocked: true,
    },
  });

  return updated;
}

/**
 * Soft deletes a system admin account
 *
 * WORKFLOW:
 * 1. Find system admin by ID
 * 2. Check if admin exists
 * 3. Set deleted_at timestamp (soft delete)
 * 4. Return confirmation
 *
 * @param {number} adminId - System admin ID to delete
 * @returns {{message: string, system_admin_id: number}} Deletion confirmation
 * @throws {Error} ADMIN_NOT_FOUND
 *
 * @example
 * try {
 *   const result = await deleteSystemAdmin(5);
 *   console.log(result.message); // "Admin deleted successfully"
 * } catch (error) {
 *   if (error.message === "ADMIN_NOT_FOUND") {
 *     // Admin does not exist
 *   }
 * }
 */
export async function deleteSystemAdmin(adminId: number) {
  // Check if admin exists
  const existingAdmin = await prisma.system_admins.findUnique({
    where: { system_admin_id: adminId },
  });

  if (!existingAdmin) {
    throw new Error("ADMIN_NOT_FOUND");
  }

  // Soft delete by setting deleted_at
  await prisma.system_admins.update({
    where: { system_admin_id: adminId },
    data: { deleted_at: new Date() },
  });

  return {
    message: "Admin deleted successfully",
    system_admin_id: adminId,
  };
}
