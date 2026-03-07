/**
 * FILE: src/modules/hotels/hotels.service.ts
 * PURPOSE: Business logic for hotel operations
 *
 * WHAT IT DOES:
 * - Creates new hotel entries with default DRAFT status
 * - Retrieves hotel details by ID
 * - Lists all hotels with filtering and pagination
 * - Updates hotel information
 * - Changes hotel approval status
 * - Soft deletes hotels
 *
 * USAGE:
 * import { createHotel, getHotel, updateHotel } from './hotels.service';
 * const hotel = await createHotel(hotelData, createdBy);
 * const details = await getHotel(hotelId);
 * await updateHotel(hotelId, updates);
 *
 * DATABASE TABLES:
 * - hotels: Main hotel table with approval workflow
 */

import { prisma } from "@/config/prisma";
import { Prisma } from "@prisma/client";

/**
 * Creates a new hotel entry
 *
 * WORKFLOW:
 * 1. Create hotel with provided data
 * 2. Set approval_status to DRAFT by default
 * 3. Set created_by to the system admin creating it
 * 4. Return created hotel object
 *
 * @param {object} hotelData - Hotel information (name, email, address, etc)
 * @param {number} createdBy - System admin ID who is creating this hotel
 * @returns {{hotel_id, name, email, city, approval_status, created_at}} Created hotel
 * @throws {Error} DATABASE_ERROR
 *
 * @example
 * const hotel = await createHotel({
 *   name: "Grand Hotel",
 *   email: "info@grandhotel.com",
 *   city: "Dhaka",
 *   address: "123 Main St"
 * }, 1);
 */
export async function createHotel(hotelData: any, createdBy: number) {
  const hotel = await prisma.hotels.create({
    data: {
      name: hotelData.name,
      email: hotelData.email || null,
      address: hotelData.address || null,
      city: hotelData.city || null,
      hotel_type: hotelData.hotel_type || null,
      owner_name: hotelData.owner_name || null,
      description: hotelData.description || null,
      star_rating: hotelData.star_rating ? parseFloat(hotelData.star_rating) : null,
      emergency_contact1: hotelData.emergency_contact1 || null,
      emergency_contact2: hotelData.emergency_contact2 || null,
      reception_no1: hotelData.reception_no1 || null,
      reception_no2: hotelData.reception_no2 || null,
      zip_code: hotelData.zip_code || null,
      created_by: createdBy,
      approval_status: "DRAFT",
    },
    select: {
      hotel_id: true,
      name: true,
      email: true,
      city: true,
      approval_status: true,
      created_at: true,
    },
  });

  return hotel;
}

/**
 * Retrieves a hotel by ID
 *
 * WORKFLOW:
 * 1. Find hotel by ID
 * 2. Return hotel object with all details
 *
 * @param {number} hotelId - Hotel ID
 * @returns {{hotel_id, name, email, address, city, approval_status, ...}} Hotel details
 * @throws {Error} HOTEL_NOT_FOUND
 *
 * @example
 * const hotel = await getHotel(5);
 * console.log("Hotel:", hotel);
 */
export async function getHotel(hotelId: number) {
  const hotel = await prisma.hotels.findUnique({
    where: { hotel_id: hotelId },
    select: {
      hotel_id: true,
      name: true,
      email: true,
      address: true,
      city: true,
      hotel_type: true,
      owner_name: true,
      description: true,
      star_rating: true,
      guest_rating: true,
      approval_status: true,
      published_at: true,
      created_at: true,
      updated_at: true,
    },
  });

  if (!hotel) {
    throw new Error("HOTEL_NOT_FOUND");
  }

  return hotel;
}

/**
 * Lists hotels with filtering and pagination
 *
 * WORKFLOW:
 * 1. Build filter conditions (status, city, etc)
 * 2. Query hotels with pagination
 * 3. Get total count for pagination metadata
 * 4. Return paginated results with count
 *
 * @param {object} filters - Filter options (approval_status, city, etc)
 * @param {number} skip - Records to skip (pagination)
 * @param {number} take - Records to return (pagination)
 * @returns {{hotels: Array, total: number, skip, take}} Paginated list
 *
 * @example
 * const result = await listHotels(
 *   { approval_status: "PUBLISHED", city: "Dhaka" },
 *   0,
 *   10
 * );
 */
export async function listHotels(
  filters: any = {},
  skip: number = 0,
  take: number = 10
) {
  // Build where clause
  const where: Prisma.hotelsWhereInput = {};

  if (filters.approval_status) {
    where.approval_status = filters.approval_status;
  }

  if (filters.city) {
    where.city = { contains: filters.city };
  }

  if (filters.hotel_type) {
    where.hotel_type = filters.hotel_type;
  }

  // Query hotels
  const [hotels, total] = await Promise.all([
    prisma.hotels.findMany({
      where,
      skip,
      take,
      select: {
        hotel_id: true,
        name: true,
        email: true,
        city: true,
        hotel_type: true,
        star_rating: true,
        guest_rating: true,
        approval_status: true,
        created_at: true,
      },
      orderBy: { created_at: "desc" },
    }),
    prisma.hotels.count({ where }),
  ]);

  return {
    hotels,
    total,
    skip,
    take,
  };
}

/**
 * Updates hotel information
 *
 * WORKFLOW:
 * 1. Check if hotel exists
 * 2. Update provided fields
 * 3. Return updated hotel object
 *
 * @param {number} hotelId - Hotel ID
 * @param {object} updates - Fields to update
 * @returns {{hotel_id, name, email, city, ...}} Updated hotel
 * @throws {Error} HOTEL_NOT_FOUND
 *
 * @example
 * const updated = await updateHotel(5, {
 *   name: "Grand Hotel Updated",
 *   star_rating: 4.5
 * });
 */
export async function updateHotel(hotelId: number, updates: any) {
  // Check if hotel exists
  const existingHotel = await prisma.hotels.findUnique({
    where: { hotel_id: hotelId },
  });

  if (!existingHotel) {
    throw new Error("HOTEL_NOT_FOUND");
  }

  // Build update data - only include provided fields
  const updateData: any = {};
  if (updates.name !== undefined) updateData.name = updates.name;
  if (updates.email !== undefined) updateData.email = updates.email;
  if (updates.address !== undefined) updateData.address = updates.address;
  if (updates.city !== undefined) updateData.city = updates.city;
  if (updates.hotel_type !== undefined) updateData.hotel_type = updates.hotel_type;
  if (updates.owner_name !== undefined) updateData.owner_name = updates.owner_name;
  if (updates.description !== undefined) updateData.description = updates.description;
  if (updates.star_rating !== undefined) {
    updateData.star_rating = updates.star_rating ? parseFloat(updates.star_rating) : null;
  }
  if (updates.emergency_contact1 !== undefined) updateData.emergency_contact1 = updates.emergency_contact1;
  if (updates.emergency_contact2 !== undefined) updateData.emergency_contact2 = updates.emergency_contact2;
  if (updates.reception_no1 !== undefined) updateData.reception_no1 = updates.reception_no1;
  if (updates.reception_no2 !== undefined) updateData.reception_no2 = updates.reception_no2;
  if (updates.zip_code !== undefined) updateData.zip_code = updates.zip_code;

  // Update hotel
  const updated = await prisma.hotels.update({
    where: { hotel_id: hotelId },
    data: updateData,
    select: {
      hotel_id: true,
      name: true,
      email: true,
      city: true,
      approval_status: true,
      updated_at: true,
    },
  });

  return updated;
}

/**
 * Changes hotel approval status
 *
 * WORKFLOW:
 * 1. Check if hotel exists
 * 2. Update approval_status
 * 3. Set published_at if status is PUBLISHED
 * 4. Set approved_by to the system admin approving it
 * 5. Return updated hotel
 *
 * @param {number} hotelId - Hotel ID
 * @param {string} status - New approval status (DRAFT, PENDING_APPROVAL, PUBLISHED, REJECTED)
 * @param {number} approvedBy - System admin ID approving the change (optional)
 * @returns {{hotel_id, approval_status, published_at}} Updated hotel status
 * @throws {Error} HOTEL_NOT_FOUND
 *
 * @example
 * const approved = await updateHotelApprovalStatus(5, "PUBLISHED", 1);
 */
export async function updateHotelApprovalStatus(
  hotelId: number,
  status: string,
  approvedBy?: number
) {
  // Check if hotel exists
  const existingHotel = await prisma.hotels.findUnique({
    where: { hotel_id: hotelId },
  });

  if (!existingHotel) {
    throw new Error("HOTEL_NOT_FOUND");
  }

  // Build update data
  const updateData: any = {
    approval_status: status,
  };

  // Set published_at when publishing
  if (status === "PUBLISHED" && !existingHotel.published_at) {
    updateData.published_at = new Date();
  }

  // Set approved_by if provided
  if (approvedBy) {
    updateData.approved_by = approvedBy;
  }

  // Update hotel
  const updated = await prisma.hotels.update({
    where: { hotel_id: hotelId },
    data: updateData,
    select: {
      hotel_id: true,
      approval_status: true,
      published_at: true,
      updated_at: true,
    },
  });

  return updated;
}

/**
 * Soft deletes a hotel
 *
 * WORKFLOW:
 * 1. Check if hotel exists
 * 2. Set deleted_at timestamp
 * 3. Return confirmation
 *
 * @param {number} hotelId - Hotel ID to delete
 * @returns {{message: string, hotel_id: number}} Deletion confirmation
 * @throws {Error} HOTEL_NOT_FOUND
 *
 * @example
 * const result = await deleteHotel(5);
 * console.log(result.message);
 */
export async function deleteHotel(hotelId: number) {
  // Check if hotel exists
  const existingHotel = await prisma.hotels.findUnique({
    where: { hotel_id: hotelId },
  });

  if (!existingHotel) {
    throw new Error("HOTEL_NOT_FOUND");
  }

  // Soft delete
  await prisma.hotels.update({
    where: { hotel_id: hotelId },
    data: { deleted_at: new Date() },
  });

  return {
    message: "Hotel deleted successfully",
    hotel_id: hotelId,
  };
}
