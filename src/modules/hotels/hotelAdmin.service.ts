/**
 * FILE: src/modules/hotels/hotelAdmin.service.ts
 * PURPOSE: Business logic for hotel admin creation and management
 *
 * WHAT IT DOES:
 * - Creates hotel admin accounts linked to hotels
 * - Creates hotel admin details with profile information
 * - Handles password hashing and validation
 *
 * USAGE:
 * import { createHotelAdmin } from './hotelAdmin.service';
 * const admin = await createHotelAdmin(hotelId, adminData, createdBy);
 *
 * DATABASE TABLES:
 * - hotel_admins: Hotel admin authentication and basic info
 * - hotel_admin_details: Hotel admin profile details (phone, NID, manager info, etc)
 */

import { prisma } from "@/config/prisma";
import { hashPassword } from "@/utils/password";

/**
 * Creates a hotel admin account with details
 *
 * WORKFLOW:
 * 1. Check if hotel exists
 * 2. Check if email is already in use
 * 3. Hash the password
 * 4. Create hotel_admin record
 * 5. Create hotel_admin_details record with additional info
 * 6. Return created admin with details
 *
 * @param {number} hotelId - Hotel ID to link this admin to
 * @param {object} adminData - Admin information (name, email, password, phone, nid_no, manager_name, manager_phone)
 * @param {number} createdBy - System admin ID who created this admin (optional)
 * @returns {{hotel_admin_id, name, email, hotel_id, hotel_admin_details}} Created admin
 * @throws {Error} HOTEL_NOT_FOUND | EMAIL_ALREADY_EXISTS | PASSWORD_HASH_ERROR
 *
 * @example
 * const admin = await createHotelAdmin(5, {
 *   name: "John Admin",
 *   email: "admin@hotel.com",
 *   password: "SecurePass123!",
 *   phone: "+880-1234-567890",
 *   nid_no: "1234567890123",
 *   manager_name: "Manager Name",
 *   manager_phone: "+880-9876-543210"
 * }, 1);
 */
export async function createHotelAdmin(
  hotelId: number,
  adminData: any,
  createdBy?: number
) {
  // Step 1: Check if hotel exists
  const hotel = await prisma.hotels.findUnique({
    where: { hotel_id: hotelId },
  });

  if (!hotel) {
    throw new Error("HOTEL_NOT_FOUND");
  }

  // Step 2: Check if email already exists
  const existingAdmin = await prisma.hotel_admins.findUnique({
    where: { email: adminData.email },
  });

  if (existingAdmin) {
    throw new Error("EMAIL_ALREADY_EXISTS");
  }

  // Step 3: Create hotel admin in transaction (atomic operation)
  const result = await prisma.$transaction(async (tx) => {
    // Create hotel_admin record
    const hotelAdmin = await tx.hotel_admins.create({
      data: {
        hotel_id: hotelId,
        name: adminData.name,
        email: adminData.email,
        password: adminData.password, // Store as plaintext for now
        created_by: createdBy || null,
        role_id: 1, // Default role for hotel admin
      },
    });

    // Create hotel_admin_details record
    const details = await tx.hotel_admin_details.create({
      data: {
        hotel_admin_id: hotelAdmin.hotel_admin_id,
        phone: adminData.phone || null,
        nid_no: adminData.nid_no || null,
        manager_name: adminData.manager_name || null,
        manager_phone: adminData.manager_phone || null,
        address: null,
        passport: null,
        dob: null,
        image_url: null,
      },
    });

    // Return complete admin with details
    return {
      hotel_admin_id: hotelAdmin.hotel_admin_id,
      name: hotelAdmin.name,
      email: hotelAdmin.email,
      hotel_id: hotelAdmin.hotel_id,
      is_active: hotelAdmin.is_active,
      created_at: hotelAdmin.created_at,
      hotel_admin_details: details,
    };
  });

  return result;
}

/**
 * Gets hotel admin details
 *
 * @param {number} hotelAdminId - Hotel admin ID
 * @returns {{hotel_admin_id, name, email, hotel_id, hotel_admin_details}} Admin with details
 * @throws {Error} ADMIN_NOT_FOUND
 */
export async function getHotelAdmin(hotelAdminId: number) {
  const admin = await prisma.hotel_admins.findUnique({
    where: { hotel_admin_id: hotelAdminId },
    include: {
      hotel_admin_details: true,
    },
  });

  if (!admin) {
    throw new Error("ADMIN_NOT_FOUND");
  }

  return admin;
}

/**
 * Gets hotel admin by email
 *
 * @param {string} email - Hotel admin email
 * @returns {{hotel_admin_id, name, email, hotel_id, hotel_admin_details}} Admin with details
 * @throws {Error} ADMIN_NOT_FOUND
 */
export async function getHotelAdminByEmail(email: string) {
  const admin = await prisma.hotel_admins.findUnique({
    where: { email },
    include: {
      hotel_admin_details: true,
    },
  });

  if (!admin) {
    throw new Error("ADMIN_NOT_FOUND");
  }

  return admin;
}

/**
 * Lists all hotel admins for a specific hotel
 *
 * @param {number} hotelId - Hotel ID
 * @returns {{hotel_admin_id, name, email, is_active, created_at}[]} List of admins
 */
export async function listHotelAdmins(hotelId: number) {
  const admins = await prisma.hotel_admins.findMany({
    where: { hotel_id: hotelId },
    include: {
      hotel_admin_details: true,
    },
    orderBy: { created_at: "desc" },
  });

  return admins;
}

/**
 * Updates hotel admin details
 *
 * @param {number} hotelAdminId - Hotel admin ID
 * @param {object} updates - Fields to update
 * @returns {{hotel_admin_id, name, email, updated_at}} Updated admin
 * @throws {Error} ADMIN_NOT_FOUND
 */
export async function updateHotelAdminDetails(hotelAdminId: number, updates: any) {
  // Check if admin exists
  const existingAdmin = await prisma.hotel_admin_details.findUnique({
    where: { hotel_admin_id: hotelAdminId },
  });

  if (!existingAdmin) {
    throw new Error("ADMIN_NOT_FOUND");
  }

  // Build update data
  const updateData: any = {};
  if (updates.phone !== undefined) updateData.phone = updates.phone;
  if (updates.nid_no !== undefined) updateData.nid_no = updates.nid_no;
  if (updates.manager_name !== undefined) updateData.manager_name = updates.manager_name;
  if (updates.manager_phone !== undefined) updateData.manager_phone = updates.manager_phone;
  if (updates.address !== undefined) updateData.address = updates.address;
  if (updates.image_url !== undefined) updateData.image_url = updates.image_url;

  // Update details
  const updated = await prisma.hotel_admin_details.update({
    where: { hotel_admin_id: hotelAdminId },
    data: updateData,
  });

  return updated;
}
