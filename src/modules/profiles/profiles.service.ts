/**
 * FILE: src/modules/profiles/profiles.service.ts
 * PURPOSE: Business logic for profile operations (CRUD for all user types)
 *
 * WHAT IT DOES:
 * - getSystemAdminProfile(systemAdminId) - Get system admin profile details
 * - updateSystemAdminProfile(systemAdminId, updates) - Update system admin profile
 * - getHotelAdminProfile(hotelAdminId) - Get hotel admin profile details
 * - updateHotelAdminProfile(hotelAdminId, updates) - Update hotel admin profile
 * - getHotelSubAdminProfile(hotelSubAdminId) - Get hotel sub-admin profile details
 * - updateHotelSubAdminProfile(hotelSubAdminId, updates) - Update hotel sub-admin profile
 * - getEndUserProfile(endUserId) - Get end user profile details
 * - updateEndUserProfile(endUserId, updates) - Update end user profile
 *
 * KEY FEATURES:
 * - One-to-one profile relationships
 * - Create profile on first update if doesn't exist
 * - Selective field updates
 * - All profiles are optional (can be null)
 *
 * USAGE:
 * import { getEndUserProfile, updateEndUserProfile } from './profiles.service';
 * const profile = await getEndUserProfile(endUserId);
 * await updateEndUserProfile(endUserId, updates);
 */

import { prisma } from "@/config/prisma";

/**
 * Retrieves system admin profile details
 *
 * INPUTS:
 * - systemAdminId: System admin ID
 *
 * RETURNS:
 * {
 *   system_admin_details_id,
 *   system_admin_id,
 *   dob,
 *   gender,
 *   address,
 *   nid_no,
 *   phone,
 *   image_url,
 *   updated_at
 * } or null if no profile exists
 *
 * @throws SYSTEM_ADMIN_NOT_FOUND if system admin doesn't exist
 * @param {number} systemAdminId - System admin ID
 * @returns {Promise<object|null>} Profile details or null
 *
 * @example
 * const profile = await getSystemAdminProfile(1);
 */
export async function getSystemAdminProfile(systemAdminId: number) {
  // Verify system admin exists
  const admin = await prisma.system_admins.findUnique({
    where: { system_admin_id: systemAdminId },
    select: { system_admin_id: true },
  });

  if (!admin) {
    throw new Error("SYSTEM_ADMIN_NOT_FOUND");
  }

  // Get profile (may be null)
  const profile = await prisma.system_admin_details.findUnique({
    where: { system_admin_id: systemAdminId },
    select: {
      system_admin_details_id: true,
      system_admin_id: true,
      dob: true,
      gender: true,
      address: true,
      nid_no: true,
      phone: true,
      image_url: true,
      updated_at: true,
    },
  });

  return profile;
}

/**
 * Updates system admin profile details
 *
 * BEHAVIOR:
 * - Creates profile if doesn't exist
 * - Only updates provided fields
 * - Updates updated_at timestamp
 *
 * INPUTS:
 * - systemAdminId: System admin ID
 * - updates: { dob?, gender?, address?, nid_no?, phone?, image_url? }
 *
 * RETURNS:
 * {
 *   system_admin_details_id,
 *   system_admin_id,
 *   dob,
 *   gender,
 *   address,
 *   nid_no,
 *   phone,
 *   image_url,
 *   updated_at
 * }
 *
 * @throws SYSTEM_ADMIN_NOT_FOUND if system admin doesn't exist
 * @param {number} systemAdminId - System admin ID
 * @param {object} updates - Fields to update
 * @returns {Promise<object>} Updated profile details
 *
 * @example
 * const updated = await updateSystemAdminProfile(1, {
 *   phone: "+8801712345678"
 * });
 */
export async function updateSystemAdminProfile(systemAdminId: number, updates: any) {
  // Verify system admin exists
  const admin = await prisma.system_admins.findUnique({
    where: { system_admin_id: systemAdminId },
    select: { system_admin_id: true },
  });

  if (!admin) {
    throw new Error("SYSTEM_ADMIN_NOT_FOUND");
  }

  // Build update data
  const updateData: any = {};

  if (updates.dob !== undefined) updateData.dob = updates.dob ? new Date(updates.dob) : null;
  if (updates.gender !== undefined) updateData.gender = updates.gender;
  if (updates.address !== undefined) updateData.address = updates.address;
  if (updates.nid_no !== undefined) updateData.nid_no = updates.nid_no;
  if (updates.phone !== undefined) updateData.phone = updates.phone;
  if (updates.image_url !== undefined) updateData.image_url = updates.image_url;

  // Upsert profile (create if doesn't exist)
  const profile = await prisma.system_admin_details.upsert({
    where: { system_admin_id: systemAdminId },
    create: {
      system_admin_id: systemAdminId,
      ...updateData,
    },
    update: updateData,
    select: {
      system_admin_details_id: true,
      system_admin_id: true,
      dob: true,
      gender: true,
      address: true,
      nid_no: true,
      phone: true,
      image_url: true,
      updated_at: true,
    },
  });

  return profile;
}

/**
 * Retrieves hotel admin profile details
 *
 * INPUTS:
 * - hotelAdminId: Hotel admin ID
 *
 * RETURNS:
 * {
 *   hotel_admin_details_id,
 *   hotel_admin_id,
 *   dob,
 *   phone,
 *   nid_no,
 *   address,
 *   passport,
 *   manager_name,
 *   manager_phone,
 *   emergency_contact1,
 *   emergency_contact2,
 *   image_url,
 *   updated_at
 * } or null if no profile exists
 *
 * @throws HOTEL_ADMIN_NOT_FOUND if hotel admin doesn't exist
 * @param {number} hotelAdminId - Hotel admin ID
 * @returns {Promise<object|null>} Profile details or null
 *
 * @example
 * const profile = await getHotelAdminProfile(5);
 */
export async function getHotelAdminProfile(hotelAdminId: number) {
  // Verify hotel admin exists
  const admin = await prisma.hotel_admins.findUnique({
    where: { hotel_admin_id: hotelAdminId },
    select: { hotel_admin_id: true },
  });

  if (!admin) {
    throw new Error("HOTEL_ADMIN_NOT_FOUND");
  }

  // Get profile (may be null)
  const profile = await prisma.hotel_admin_details.findUnique({
    where: { hotel_admin_id: hotelAdminId },
    select: {
      hotel_admin_details_id: true,
      hotel_admin_id: true,
      dob: true,
      phone: true,
      nid_no: true,
      address: true,
      passport: true,
      manager_name: true,
      manager_phone: true,
      emergency_contact1: true,
      emergency_contact2: true,
      image_url: true,
      updated_at: true,
    },
  });

  return profile;
}

/**
 * Updates hotel admin profile details
 *
 * BEHAVIOR:
 * - Creates profile if doesn't exist
 * - Only updates provided fields
 * - Updates updated_at timestamp
 *
 * INPUTS:
 * - hotelAdminId: Hotel admin ID
 * - updates: { dob?, phone?, nid_no?, address?, passport?, manager_name?, manager_phone?, emergency_contact1?, emergency_contact2?, image_url? }
 *
 * RETURNS:
 * {
 *   hotel_admin_details_id,
 *   hotel_admin_id,
 *   dob,
 *   phone,
 *   nid_no,
 *   address,
 *   passport,
 *   manager_name,
 *   manager_phone,
 *   emergency_contact1,
 *   emergency_contact2,
 *   image_url,
 *   updated_at
 * }
 *
 * @throws HOTEL_ADMIN_NOT_FOUND if hotel admin doesn't exist
 * @param {number} hotelAdminId - Hotel admin ID
 * @param {object} updates - Fields to update
 * @returns {Promise<object>} Updated profile details
 *
 * @example
 * const updated = await updateHotelAdminProfile(5, {
 *   manager_name: "John Doe"
 * });
 */
export async function updateHotelAdminProfile(hotelAdminId: number, updates: any) {
  // Verify hotel admin exists
  const admin = await prisma.hotel_admins.findUnique({
    where: { hotel_admin_id: hotelAdminId },
    select: { hotel_admin_id: true },
  });

  if (!admin) {
    throw new Error("HOTEL_ADMIN_NOT_FOUND");
  }

  // Build update data
  const updateData: any = {};

  if (updates.dob !== undefined) updateData.dob = updates.dob ? new Date(updates.dob) : null;
  if (updates.phone !== undefined) updateData.phone = updates.phone;
  if (updates.nid_no !== undefined) updateData.nid_no = updates.nid_no;
  if (updates.address !== undefined) updateData.address = updates.address;
  if (updates.passport !== undefined) updateData.passport = updates.passport;
  if (updates.manager_name !== undefined) updateData.manager_name = updates.manager_name;
  if (updates.manager_phone !== undefined) updateData.manager_phone = updates.manager_phone;
  if (updates.emergency_contact1 !== undefined) updateData.emergency_contact1 = updates.emergency_contact1;
  if (updates.emergency_contact2 !== undefined) updateData.emergency_contact2 = updates.emergency_contact2;
  if (updates.image_url !== undefined) updateData.image_url = updates.image_url;

  // Upsert profile (create if doesn't exist)
  const profile = await prisma.hotel_admin_details.upsert({
    where: { hotel_admin_id: hotelAdminId },
    create: {
      hotel_admin_id: hotelAdminId,
      ...updateData,
    },
    update: updateData,
    select: {
      hotel_admin_details_id: true,
      hotel_admin_id: true,
      dob: true,
      phone: true,
      nid_no: true,
      address: true,
      passport: true,
      manager_name: true,
      manager_phone: true,
      emergency_contact1: true,
      emergency_contact2: true,
      image_url: true,
      updated_at: true,
    },
  });

  return profile;
}

/**
 * Retrieves hotel sub-admin profile details
 *
 * INPUTS:
 * - hotelSubAdminId: Hotel sub-admin ID
 *
 * RETURNS:
 * {
 *   hotel_sub_admin_details_id,
 *   hotel_sub_admin_id,
 *   phone,
 *   nid_no,
 *   image_url,
 *   updated_at
 * } or null if no profile exists
 *
 * @throws HOTEL_SUB_ADMIN_NOT_FOUND if hotel sub-admin doesn't exist
 * @param {number} hotelSubAdminId - Hotel sub-admin ID
 * @returns {Promise<object|null>} Profile details or null
 *
 * @example
 * const profile = await getHotelSubAdminProfile(8);
 */
export async function getHotelSubAdminProfile(hotelSubAdminId: number) {
  // Verify hotel sub-admin exists
  const admin = await prisma.hotel_sub_admins.findUnique({
    where: { hotel_sub_admin_id: hotelSubAdminId },
    select: { hotel_sub_admin_id: true },
  });

  if (!admin) {
    throw new Error("HOTEL_SUB_ADMIN_NOT_FOUND");
  }

  // Get profile (may be null)
  const profile = await prisma.hotel_sub_admin_details.findUnique({
    where: { hotel_sub_admin_id: hotelSubAdminId },
    select: {
      hotel_sub_admin_details_id: true,
      hotel_sub_admin_id: true,
      phone: true,
      nid_no: true,
      image_url: true,
      updated_at: true,
    },
  });

  return profile;
}

/**
 * Updates hotel sub-admin profile details
 *
 * BEHAVIOR:
 * - Creates profile if doesn't exist
 * - Only updates provided fields
 * - Updates updated_at timestamp
 *
 * INPUTS:
 * - hotelSubAdminId: Hotel sub-admin ID
 * - updates: { phone?, nid_no?, image_url? }
 *
 * RETURNS:
 * {
 *   hotel_sub_admin_details_id,
 *   hotel_sub_admin_id,
 *   phone,
 *   nid_no,
 *   image_url,
 *   updated_at
 * }
 *
 * @throws HOTEL_SUB_ADMIN_NOT_FOUND if hotel sub-admin doesn't exist
 * @param {number} hotelSubAdminId - Hotel sub-admin ID
 * @param {object} updates - Fields to update
 * @returns {Promise<object>} Updated profile details
 *
 * @example
 * const updated = await updateHotelSubAdminProfile(8, {
 *   phone: "+8801987654321"
 * });
 */
export async function updateHotelSubAdminProfile(hotelSubAdminId: number, updates: any) {
  // Verify hotel sub-admin exists
  const admin = await prisma.hotel_sub_admins.findUnique({
    where: { hotel_sub_admin_id: hotelSubAdminId },
    select: { hotel_sub_admin_id: true },
  });

  if (!admin) {
    throw new Error("HOTEL_SUB_ADMIN_NOT_FOUND");
  }

  // Build update data
  const updateData: any = {};

  if (updates.phone !== undefined) updateData.phone = updates.phone;
  if (updates.nid_no !== undefined) updateData.nid_no = updates.nid_no;
  if (updates.image_url !== undefined) updateData.image_url = updates.image_url;

  // Upsert profile (create if doesn't exist)
  const profile = await prisma.hotel_sub_admin_details.upsert({
    where: { hotel_sub_admin_id: hotelSubAdminId },
    create: {
      hotel_sub_admin_id: hotelSubAdminId,
      ...updateData,
    },
    update: updateData,
    select: {
      hotel_sub_admin_details_id: true,
      hotel_sub_admin_id: true,
      phone: true,
      nid_no: true,
      image_url: true,
      updated_at: true,
    },
  });

  return profile;
}

/**
 * Retrieves end user profile details
 *
 * INPUTS:
 * - endUserId: End user ID
 *
 * RETURNS:
 * {
 *   end_user_detail_id,
 *   end_user_id,
 *   dob,
 *   gender,
 *   address,
 *   country,
 *   nid_no,
 *   passport,
 *   phone,
 *   emergency_contact,
 *   image_url,
 *   updated_at
 * } or null if no profile exists
 *
 * @throws END_USER_NOT_FOUND if end user doesn't exist
 * @param {number} endUserId - End user ID
 * @returns {Promise<object|null>} Profile details or null
 *
 * @example
 * const profile = await getEndUserProfile(42);
 */
export async function getEndUserProfile(endUserId: number) {
  // Verify end user exists
  const user = await prisma.end_users.findUnique({
    where: { end_user_id: endUserId },
    select: { end_user_id: true },
  });

  if (!user) {
    throw new Error("END_USER_NOT_FOUND");
  }

  // Get profile (may be null)
  const profile = await prisma.end_user_details.findUnique({
    where: { end_user_id: endUserId },
    select: {
      end_user_detail_id: true,
      end_user_id: true,
      dob: true,
      gender: true,
      address: true,
      country: true,
      nid_no: true,
      passport: true,
      phone: true,
      emergency_contact: true,
      image_url: true,
      updated_at: true,
    },
  });

  return profile;
}

/**
 * Updates end user profile details
 *
 * BEHAVIOR:
 * - Creates profile if doesn't exist
 * - Only updates provided fields
 * - Updates updated_at timestamp
 *
 * INPUTS:
 * - endUserId: End user ID
 * - updates: { dob?, gender?, address?, country?, nid_no?, passport?, phone?, emergency_contact?, image_url? }
 *
 * RETURNS:
 * {
 *   end_user_detail_id,
 *   end_user_id,
 *   dob,
 *   gender,
 *   address,
 *   country,
 *   nid_no,
 *   passport,
 *   phone,
 *   emergency_contact,
 *   image_url,
 *   updated_at
 * }
 *
 * @throws END_USER_NOT_FOUND if end user doesn't exist
 * @param {number} endUserId - End user ID
 * @param {object} updates - Fields to update
 * @returns {Promise<object>} Updated profile details
 *
 * @example
 * const updated = await updateEndUserProfile(42, {
 *   country: "Bangladesh",
 *   phone: "+8801712345678"
 * });
 */
export async function updateEndUserProfile(endUserId: number, updates: any) {
  // Verify end user exists
  const user = await prisma.end_users.findUnique({
    where: { end_user_id: endUserId },
    select: { end_user_id: true },
  });

  if (!user) {
    throw new Error("END_USER_NOT_FOUND");
  }

  // Build update data
  const updateData: any = {};

  if (updates.dob !== undefined) updateData.dob = updates.dob ? new Date(updates.dob) : null;
  if (updates.gender !== undefined) updateData.gender = updates.gender;
  if (updates.address !== undefined) updateData.address = updates.address;
  if (updates.country !== undefined) updateData.country = updates.country;
  if (updates.nid_no !== undefined) updateData.nid_no = updates.nid_no;
  if (updates.passport !== undefined) updateData.passport = updates.passport;
  if (updates.phone !== undefined) updateData.phone = updates.phone;
  if (updates.emergency_contact !== undefined) updateData.emergency_contact = updates.emergency_contact;
  if (updates.image_url !== undefined) updateData.image_url = updates.image_url;

  // Upsert profile (create if doesn't exist)
  const profile = await prisma.end_user_details.upsert({
    where: { end_user_id: endUserId },
    create: {
      end_user_id: endUserId,
      ...updateData,
    },
    update: updateData,
    select: {
      end_user_detail_id: true,
      end_user_id: true,
      dob: true,
      gender: true,
      address: true,
      country: true,
      nid_no: true,
      passport: true,
      phone: true,
      emergency_contact: true,
      image_url: true,
      updated_at: true,
    },
  });

  return profile;
}
