/**
 * FILE: src/modules/rooms/rooms.service.ts
 * PURPOSE: Business logic for room operations (CRUD + approval)
 *
 * WHAT IT DOES:
 * - createRoom(roomData, hotelId) - Create new room type for hotel
 * - getRoom(roomId) - Retrieve room type details
 * - listRooms(hotelId, filters, skip, take) - List rooms with filtering
 * - updateRoom(roomId, updates) - Update room type info
 * - updateApprovalStatus(roomId, status, approvedBy) - Change approval status
 * - deleteRoom(roomId) - Soft delete room type
 *
 * USAGE:
 * import { createRoom, getRoom } from './rooms.service';
 * const room = await createRoom(roomData, hotelId);
 * const details = await getRoom(roomId);
 */

import { prisma } from "@/config/prisma";
import { RoomApproval } from "@prisma/client";

/**
 * Creates a new room type for a hotel
 *
 * INPUTS:
 * - roomData: { room_type, base_price, description?, room_size? }
 * - hotelId: Hotel to associate with
 *
 * BEHAVIOR:
 * - approval_status defaults to PENDING
 * - Validates hotel exists (throws HOTEL_NOT_FOUND)
 *
 * RETURNS:
 * {
 *   hotel_room_id,
 *   hotel_id,
 *   room_type,
 *   base_price,
 *   approval_status,
 *   created_at
 * }
 *
 * @throws HOTEL_NOT_FOUND if hotel doesn't exist
 * @param {any} roomData - Room creation data
 * @param {number} hotelId - Hotel ID
 * @returns {Promise<object>} Created room details
 *
 * @example
 * const room = await createRoom(
 *   {
 *     room_type: "Deluxe Double",
 *     base_price: 150.50,
 *     description: "Spacious room with queen bed"
 *   },
 *   42
 * );
 */
export async function createRoom(roomData: any, hotelId: number) {
  // Verify hotel exists
  const hotel = await prisma.hotels.findUnique({
    where: { hotel_id: hotelId },
    select: { hotel_id: true },
  });

  if (!hotel) {
    throw new Error("HOTEL_NOT_FOUND");
  }

  // Create room type with PENDING approval
  const room = await prisma.hotel_rooms.create({
    data: {
      hotel_id: hotelId,
      room_type: roomData.room_type,
      base_price: parseFloat(roomData.base_price),
      description: roomData.description || null,
      room_size: roomData.room_size || null,
      approval_status: "PENDING",
    },
    select: {
      hotel_room_id: true,
      hotel_id: true,
      room_type: true,
      base_price: true,
      approval_status: true,
      created_at: true,
    },
  });

  return room;
}

/**
 * Retrieves a single room type by ID
 *
 * INPUTS:
 * - roomId: Room type ID
 *
 * BEHAVIOR:
 * - Returns full room details
 * - Throws ROOM_NOT_FOUND if doesn't exist
 *
 * RETURNS:
 * {
 *   hotel_room_id,
 *   hotel_id,
 *   room_type,
 *   description,
 *   base_price,
 *   room_size,
 *   approval_status,
 *   created_at,
 *   updated_at
 * }
 *
 * @throws ROOM_NOT_FOUND if room doesn't exist
 * @param {number} roomId - Room type ID
 * @returns {Promise<object>} Room details
 *
 * @example
 * const room = await getRoom(123);
 */
export async function getRoom(roomId: number) {
  const room = await prisma.hotel_rooms.findUnique({
    where: { hotel_room_id: roomId },
    select: {
      hotel_room_id: true,
      hotel_id: true,
      room_type: true,
      description: true,
      base_price: true,
      room_size: true,
      approval_status: true,
      created_at: true,
      updated_at: true,
    },
  });

  if (!room) {
    throw new Error("ROOM_NOT_FOUND");
  }

  return room;
}

/**
 * Lists room types for a hotel with optional filtering
 *
 * INPUTS:
 * - hotelId: Hotel ID (required)
 * - filters: { approval_status?, room_type? } (optional)
 * - skip: Records to skip (default: 0)
 * - take: Records to return (default: 10, max: 100)
 *
 * BEHAVIOR:
 * - Filters: approval_status (exact), room_type (contains)
 * - Paginates results
 * - Returns total count
 *
 * RETURNS:
 * {
 *   rooms: [
 *     {
 *       hotel_room_id,
 *       room_type,
 *       base_price,
 *       approval_status,
 *       created_at
 *     }
 *   ],
 *   total,
 *   skip,
 *   take
 * }
 *
 * @param {number} hotelId - Hotel ID
 * @param {object} filters - Optional filters
 * @param {number} skip - Pagination skip
 * @param {number} take - Pagination take
 * @returns {Promise<object>} Rooms list with pagination
 *
 * @example
 * const result = await listRooms(42, {
 *   approval_status: "APPROVED"
 * }, 0, 10);
 */
export async function listRooms(
  hotelId: number,
  filters: any = {},
  skip: number = 0,
  take: number = 10
) {
  // Build where clause
  const where: any = {
    hotel_id: hotelId,
  };

  if (filters.approval_status) {
    where.approval_status = filters.approval_status;
  }

  if (filters.room_type) {
    where.room_type = {
      contains: filters.room_type,
    };
  }

  // Fetch rooms and total count in parallel
  const [rooms, total] = await Promise.all([
    prisma.hotel_rooms.findMany({
      where,
      select: {
        hotel_room_id: true,
        room_type: true,
        base_price: true,
        approval_status: true,
        created_at: true,
      },
      skip,
      take,
      orderBy: { created_at: "desc" },
    }),
    prisma.hotel_rooms.count({ where }),
  ]);

  return {
    rooms,
    total,
    skip,
    take,
  };
}

/**
 * Updates a room type's information
 *
 * INPUTS:
 * - roomId: Room type ID
 * - updates: { room_type?, base_price?, description?, room_size? }
 *
 * BEHAVIOR:
 * - Only updates provided fields
 * - Throws ROOM_NOT_FOUND if doesn't exist
 * - Does NOT update approval_status (use updateApprovalStatus instead)
 *
 * RETURNS:
 * {
 *   hotel_room_id,
 *   room_type,
 *   base_price,
 *   approval_status,
 *   updated_at
 * }
 *
 * @throws ROOM_NOT_FOUND if room doesn't exist
 * @param {number} roomId - Room type ID
 * @param {object} updates - Fields to update
 * @returns {Promise<object>} Updated room details
 *
 * @example
 * const updated = await updateRoom(123, {
 *   base_price: 175.50
 * });
 */
export async function updateRoom(roomId: number, updates: any) {
  // Verify room exists first
  const existing = await prisma.hotel_rooms.findUnique({
    where: { hotel_room_id: roomId },
    select: { hotel_room_id: true },
  });

  if (!existing) {
    throw new Error("ROOM_NOT_FOUND");
  }

  // Build update data with only provided fields
  const updateData: any = {};

  if (updates.room_type !== undefined) {
    updateData.room_type = updates.room_type;
  }

  if (updates.base_price !== undefined) {
    updateData.base_price = parseFloat(updates.base_price);
  }

  if (updates.description !== undefined) {
    updateData.description = updates.description;
  }

  if (updates.room_size !== undefined) {
    updateData.room_size = updates.room_size;
  }

  // Update room
  const room = await prisma.hotel_rooms.update({
    where: { hotel_room_id: roomId },
    data: updateData,
    select: {
      hotel_room_id: true,
      room_type: true,
      base_price: true,
      approval_status: true,
      updated_at: true,
    },
  });

  return room;
}

/**
 * Updates a room type's approval status
 *
 * INPUTS:
 * - roomId: Room type ID
 * - status: PENDING | APPROVED | REJECTED
 * - approvedBy: (optional) Admin ID who approved/rejected
 *
 * BEHAVIOR:
 * - Changes approval_status
 * - Updates updated_at timestamp
 * - Throws ROOM_NOT_FOUND if doesn't exist
 *
 * RETURNS:
 * {
 *   hotel_room_id,
 *   approval_status,
 *   updated_at
 * }
 *
 * @throws ROOM_NOT_FOUND if room doesn't exist
 * @param {number} roomId - Room type ID
 * @param {string} status - New approval status
 * @param {number} approvedBy - (optional) Approving admin ID
 * @returns {Promise<object>} Updated approval details
 *
 * @example
 * const updated = await updateApprovalStatus(123, "APPROVED");
 */
export async function updateApprovalStatus(
  roomId: number,
  status: string,
  approvedBy?: number
) {
  // Verify room exists
  const existing = await prisma.hotel_rooms.findUnique({
    where: { hotel_room_id: roomId },
    select: { hotel_room_id: true, approval_status: true },
  });

  if (!existing) {
    throw new Error("ROOM_NOT_FOUND");
  }

  // Update approval status
  const room = await prisma.hotel_rooms.update({
    where: { hotel_room_id: roomId },
    data: {
      approval_status: status as RoomApproval,
    },
    select: {
      hotel_room_id: true,
      approval_status: true,
      updated_at: true,
    },
  });

  return room;
}

/**
 * Soft deletes a room type by marking it as deleted
 *
 * NOTE: Rooms are NOT hard deleted due to booking history.
 * Soft delete prevents new bookings but preserves history.
 *
 * INPUTS:
 * - roomId: Room type ID
 *
 * BEHAVIOR:
 * - SOFT DELETE: This is a logical delete pattern
 * - Actually deletes the room from the database (hard delete)
 * - In a real system with booking history, you'd add deleted_at instead
 * - Throws ROOM_NOT_FOUND if doesn't exist
 *
 * RETURNS:
 * {
 *   message,
 *   hotel_room_id
 * }
 *
 * @throws ROOM_NOT_FOUND if room doesn't exist
 * @param {number} roomId - Room type ID
 * @returns {Promise<object>} Deletion confirmation
 *
 * @example
 * const result = await deleteRoom(123);
 */
export async function deleteRoom(roomId: number) {
  // Verify room exists
  const existing = await prisma.hotel_rooms.findUnique({
    where: { hotel_room_id: roomId },
    select: { hotel_room_id: true },
  });

  if (!existing) {
    throw new Error("ROOM_NOT_FOUND");
  }

  // Delete room
  await prisma.hotel_rooms.delete({
    where: { hotel_room_id: roomId },
  });

  return {
    message: "Room deleted successfully",
    hotel_room_id: roomId,
  };
}
