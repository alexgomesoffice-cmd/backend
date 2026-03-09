#!/usr/bin/env node

/**
 * FILE: prisma/seed.ts
 * PURPOSE: Seed database with initial demo data
 * 
 * Using Prisma Client for ORM-based seeding with actual schema
 */

import "dotenv/config";
import { PrismaClient } from "@prisma/client";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL environment variable is not set");
}

const prisma = new PrismaClient();

async function main() {
  try {
    console.log("🌱 Starting database seed...");
    console.log("✅ Connected to database via Prisma!");

    // 1. Create Roles
    console.log("📋 Creating roles...");
    await prisma.roles.upsert({
      where: { role_id: 1 },
      update: {},
      create: { role_id: 1, role_name: "HOTEL_ADMIN" },
    });
    await prisma.roles.upsert({
      where: { role_id: 2 },
      update: {},
      create: { role_id: 2, role_name: "HOTEL_SUB_ADMIN" },
    });
    console.log("✅ Roles created");

    // 2. Create System Admin
    console.log("👤 Creating system admin...");
    const systemAdmin = await prisma.system_admins.upsert({
      where: { email: "admin@myhotels.com" },
      update: {},
      create: {
        email: "admin@myhotels.com",
        name: "System Administrator",
        password: "admin123",
        is_active: true,
        is_blocked: false,
      },
    });
    console.log("✅ System admin created: admin@myhotels.com");

    // 3. Create System Admin Details
    console.log("📝 Creating system admin details...");
    await prisma.system_admin_details.upsert({
      where: { system_admin_id: systemAdmin.system_admin_id },
      update: {},
      create: {
        system_admin_id: systemAdmin.system_admin_id,
        phone: "+880123456789",
        nid_no: "1234567890123",
        address: "Dhaka, Bangladesh",
        dob: new Date("1990-01-01"),
        gender: "Male",
      },
    });
    console.log("✅ System admin details created");

    // 4. Create Hotels
    console.log("🏨 Creating hotels...");
    await prisma.hotels.deleteMany({}); // Clear existing
    const hotelNames = [
      "Grand Stay Hotel",
      "Sunset Paradise Resort",
      "Royal Palace Hotel",
      "Tech Hub Inn",
      "Garden Valley Lodge",
    ];
    
    await prisma.hotels.createMany({
      data: [
        {
          name: "Grand Stay Hotel",
          email: "contact@grandstay.com",
          address: "123 Hotel Street, Gulshan-2, Dhaka",
          city: "Dhaka",
          hotel_type: "5-Star Luxury",
          emergency_contact1: "+8801700000001",
          reception_no1: "+8801700000001",
          owner_name: "John Smith",
          description: "A luxury 5-star hotel in the heart of Dhaka with world-class amenities",
          zip_code: "1212",
          star_rating: 5,
          created_by: systemAdmin.system_admin_id,
          approval_status: "PUBLISHED",
          approved_by: systemAdmin.system_admin_id,
          published_at: new Date(),
        },
        {
          name: "Sunset Paradise Resort",
          email: "info@sunsetparadise.com",
          address: "456 Beach Road, Cox's Bazar",
          city: "Cox's Bazar",
          hotel_type: "Resort",
          emergency_contact1: "+8801800000001",
          reception_no1: "+8801800000001",
          owner_name: "Ahmed Hassan",
          description: "Beautiful beachside resort with stunning ocean views and water sports",
          zip_code: "4700",
          star_rating: 4,
          created_by: systemAdmin.system_admin_id,
          approval_status: "PUBLISHED",
          approved_by: systemAdmin.system_admin_id,
          published_at: new Date(),
        },
        {
          name: "Royal Palace Hotel",
          email: "reservations@royalpalace.com",
          address: "789 Heritage Lane, Khulna",
          city: "Khulna",
          hotel_type: "Heritage Hotel",
          emergency_contact1: "+8801900000001",
          reception_no1: "+8801900000001",
          owner_name: "Fatima Begum",
          description: "Historic heritage hotel with traditional architecture and modern amenities",
          zip_code: "9000",
          star_rating: 4,
          created_by: systemAdmin.system_admin_id,
          approval_status: "PUBLISHED",
          approved_by: systemAdmin.system_admin_id,
          published_at: new Date(),
        },
        {
          name: "Tech Hub Inn",
          email: "stay@techuinn.com",
          address: "321 Innovation Drive, Sylhet",
          city: "Sylhet",
          hotel_type: "Business Hotel",
          emergency_contact1: "+8801800000002",
          reception_no1: "+8801800000002",
          owner_name: "Karim Khan",
          description: "Modern business hotel with high-speed internet and conference facilities",
          zip_code: "3100",
          star_rating: 3,
          created_by: systemAdmin.system_admin_id,
          approval_status: "PUBLISHED",
          approved_by: systemAdmin.system_admin_id,
          published_at: new Date(),
        },
        {
          name: "Garden Valley Lodge",
          email: "bookings@gardenvalley.com",
          address: "555 Mountain Pass, Chittagong",
          city: "Chittagong",
          hotel_type: "Budget Hotel",
          emergency_contact1: "+8801700000002",
          reception_no1: "+8801700000002",
          owner_name: "Rashid Ahmed",
          description: "Cozy budget-friendly lodge perfect for travelers and nature lovers",
          zip_code: "4000",
          star_rating: 3,
          created_by: systemAdmin.system_admin_id,
          approval_status: "PUBLISHED",
          approved_by: systemAdmin.system_admin_id,
          published_at: new Date(),
        },
      ],
    });
    
    const hotels = await prisma.hotels.findMany({ orderBy: { hotel_id: "asc" } });
    if (hotels.length < 5) throw new Error("Failed to create all hotels");
    const hotel1 = hotels[0]!;
    const hotel2 = hotels[1]!;
    const hotel3 = hotels[2]!;
    const hotel4 = hotels[3]!;
    const hotel5 = hotels[4]!;
    console.log(`✅ ${hotels.length} hotels created`);

    // 5. Create Hotel Admins
    console.log("🔑 Creating hotel admins...");
    const hotelAdmins = await Promise.all([
      prisma.hotel_admins.upsert({
        where: { email: "manager@grandstay.com" },
        update: {},
        create: {
          name: "Grand Stay Manager",
          email: "manager@grandstay.com",
          password: "hotel123",
          hotel_id: hotel1.hotel_id,
          role_id: 1,
          created_by: systemAdmin.system_admin_id,
          is_active: true,
        },
      }),
      prisma.hotel_admins.upsert({
        where: { email: "manager@sunsetparadise.com" },
        update: {},
        create: {
          name: "Sunset Manager",
          email: "manager@sunsetparadise.com",
          password: "hotel123",
          hotel_id: hotel2.hotel_id,
          role_id: 1,
          created_by: systemAdmin.system_admin_id,
          is_active: true,
        },
      }),
      prisma.hotel_admins.upsert({
        where: { email: "manager@royalpalace.com" },
        update: {},
        create: {
          name: "Royal Manager",
          email: "manager@royalpalace.com",
          password: "hotel123",
          hotel_id: hotel3.hotel_id,
          role_id: 1,
          created_by: systemAdmin.system_admin_id,
          is_active: true,
        },
      }),
      prisma.hotel_admins.upsert({
        where: { email: "manager@techuinn.com" },
        update: {},
        create: {
          name: "Tech Manager",
          email: "manager@techuinn.com",
          password: "hotel123",
          hotel_id: hotel4.hotel_id,
          role_id: 1,
          created_by: systemAdmin.system_admin_id,
          is_active: true,
        },
      }),
      prisma.hotel_admins.upsert({
        where: { email: "manager@gardenvalley.com" },
        update: {},
        create: {
          name: "Garden Manager",
          email: "manager@gardenvalley.com",
          password: "hotel123",
          hotel_id: hotel5.hotel_id,
          role_id: 1,
          created_by: systemAdmin.system_admin_id,
          is_active: true,
        },
      }),
    ]);
    console.log(`✅ ${hotelAdmins.length} hotel admins created`);

    // 6. Create End Users
    console.log("👥 Creating end users...");
    const endUsers = await Promise.all([
      prisma.end_users.upsert({
        where: { email: "alice@example.com" },
        update: {},
        create: {
          name: "Alice Johnson",
          email: "alice@example.com",
          password: "password123",
          email_verified: false,
        },
      }),
      prisma.end_users.upsert({
        where: { email: "bob@example.com" },
        update: {},
        create: {
          name: "Bob Wilson",
          email: "bob@example.com",
          password: "password123",
          email_verified: false,
        },
      }),
      prisma.end_users.upsert({
        where: { email: "charlie@example.com" },
        update: {},
        create: {
          name: "Charlie Brown",
          email: "charlie@example.com",
          password: "password123",
          email_verified: false,
        },
      }),
      prisma.end_users.upsert({
        where: { email: "diana@example.com" },
        update: {},
        create: {
          name: "Diana Prince",
          email: "diana@example.com",
          password: "password123",
          email_verified: false,
        },
      }),
      prisma.end_users.upsert({
        where: { email: "eve@example.com" },
        update: {},
        create: {
          name: "Eve Anderson",
          email: "eve@example.com",
          password: "password123",
          email_verified: false,
        },
      }),
      prisma.end_users.upsert({
        where: { email: "frank@example.com" },
        update: {},
        create: {
          name: "Frank Miller",
          email: "frank@example.com",
          password: "password123",
          email_verified: false,
        },
      }),
      prisma.end_users.upsert({
        where: { email: "grace@example.com" },
        update: {},
        create: {
          name: "Grace Lee",
          email: "grace@example.com",
          password: "password123",
          email_verified: false,
        },
      }),
      prisma.end_users.upsert({
        where: { email: "henry@example.com" },
        update: {},
        create: {
          name: "Henry Davis",
          email: "henry@example.com",
          password: "password123",
          email_verified: false,
        },
      }),
      prisma.end_users.upsert({
        where: { email: "iris@example.com" },
        update: {},
        create: {
          name: "Iris Kumar",
          email: "iris@example.com",
          password: "password123",
          email_verified: false,
        },
      }),
      prisma.end_users.upsert({
        where: { email: "jack@example.com" },
        update: {},
        create: {
          name: "Jack Robinson",
          email: "jack@example.com",
          password: "password123",
          email_verified: false,
        },
      }),
    ]);
    if (endUsers.length < 8) throw new Error("Failed to create all end users");
    const user1 = endUsers[0]!;
    const user2 = endUsers[1]!;
    const user3 = endUsers[2]!;
    const user4 = endUsers[3]!;
    const user5 = endUsers[4]!;
    const user6 = endUsers[5]!;
    const user7 = endUsers[6]!;
    const user8 = endUsers[7]!;
    console.log(`✅ ${endUsers.length} end users created`);

    // 7. Create Room Types
    console.log("🛏️ Creating room types...");
    await prisma.hotel_rooms.createMany({
      data: [
        // Grand Stay Hotel
        {
          hotel_id: hotel1.hotel_id,
          room_type: "Deluxe Double",
          base_price: 150,
          description: "Spacious double room with city view and modern amenities",
          approval_status: "APPROVED",
        },
        {
          hotel_id: hotel1.hotel_id,
          room_type: "Suite",
          base_price: 250,
          description: "Luxury suite with living room and premium amenities",
          approval_status: "APPROVED",
        },
        // Sunset Paradise Resort
        {
          hotel_id: hotel2.hotel_id,
          room_type: "Ocean View",
          base_price: 200,
          description: "Beachfront room with stunning ocean views",
          approval_status: "APPROVED",
        },
        {
          hotel_id: hotel2.hotel_id,
          room_type: "Garden Bungalow",
          base_price: 120,
          description: "Tropical garden bungalow with direct beach access",
          approval_status: "APPROVED",
        },
        // Royal Palace Hotel
        {
          hotel_id: hotel3.hotel_id,
          room_type: "Heritage Room",
          base_price: 180,
          description: "Traditional heritage room with modern comfort",
          approval_status: "APPROVED",
        },
      ],
      skipDuplicates: true,
    });
    const roomTypes = await prisma.hotel_rooms.findMany({
      where: { hotel_id: { in: [hotel1.hotel_id, hotel2.hotel_id, hotel3.hotel_id] } },
      orderBy: { hotel_room_id: "asc" },
    });
    if (roomTypes.length < 5) throw new Error("Failed to create all room types");
    const roomType1 = roomTypes[0]!;
    const roomType2 = roomTypes[1]!;
    const roomType3 = roomTypes[2]!;
    const roomType4 = roomTypes[3]!;
    const roomType5 = roomTypes[4]!;
    console.log(`✅ ${roomTypes.length} room types created`);

    // 8. Create Physical Rooms
    console.log("🏠 Creating physical rooms...");
    await prisma.hotel_room_details.createMany({
      data: [
        // Grand Stay - Deluxe Double
        { hotel_rooms_id: roomType1.hotel_room_id, room_number: "101", bed_type: "Double", max_occupancy: 2 },
        { hotel_rooms_id: roomType1.hotel_room_id, room_number: "102", bed_type: "Double", max_occupancy: 2 },
        { hotel_rooms_id: roomType1.hotel_room_id, room_number: "103", bed_type: "Double", max_occupancy: 2 },
        // Grand Stay - Suite
        { hotel_rooms_id: roomType2.hotel_room_id, room_number: "201", bed_type: "Double", max_occupancy: 4 },
        { hotel_rooms_id: roomType2.hotel_room_id, room_number: "202", bed_type: "Double", max_occupancy: 4 },
        // Sunset - Ocean View
        { hotel_rooms_id: roomType3.hotel_room_id, room_number: "301", bed_type: "Double", max_occupancy: 2 },
        { hotel_rooms_id: roomType3.hotel_room_id, room_number: "302", bed_type: "Double", max_occupancy: 2 },
        // Sunset - Garden Bungalow
        { hotel_rooms_id: roomType4.hotel_room_id, room_number: "B01", bed_type: "Double", max_occupancy: 2 },
        // Royal Palace - Heritage Room
        { hotel_rooms_id: roomType5.hotel_room_id, room_number: "401", bed_type: "Double", max_occupancy: 2 },
        { hotel_rooms_id: roomType5.hotel_room_id, room_number: "402", bed_type: "Double", max_occupancy: 2 },
      ],
      skipDuplicates: true,
    });
    const physicalRooms = await prisma.hotel_room_details.findMany();
    console.log(`✅ ${physicalRooms.length} physical rooms created`);

    // 9. Create Bookings
    console.log("📅 Creating bookings...");
    const bookings = await Promise.all([
      prisma.bookings.create({
        data: {
          booking_reference: "BK-20260315-A3F9K2",
          end_user_id: user1.end_user_id,
          hotel_id: hotel1.hotel_id,
          check_in: new Date("2026-03-15"),
          check_out: new Date("2026-03-18"),
          status: "BOOKED",
          total_price: 450,
          locked_price: 450,
        },
      }),
      prisma.bookings.create({
        data: {
          booking_reference: "BK-20260320-B7L2K5",
          end_user_id: user2.end_user_id,
          hotel_id: hotel2.hotel_id,
          check_in: new Date("2026-03-20"),
          check_out: new Date("2026-03-25"),
          status: "BOOKED",
          total_price: 1000,
          locked_price: 1000,
        },
      }),
      prisma.bookings.create({
        data: {
          booking_reference: "BK-20260401-C9M3J8",
          end_user_id: user3.end_user_id,
          hotel_id: hotel3.hotel_id,
          check_in: new Date("2026-04-01"),
          check_out: new Date("2026-04-05"),
          status: "RESERVED",
          total_price: 720,
        },
      }),
      prisma.bookings.create({
        data: {
          booking_reference: "BK-20260310-D5N1P6",
          end_user_id: user4.end_user_id,
          hotel_id: hotel4.hotel_id,
          check_in: new Date("2026-03-10"),
          check_out: new Date("2026-03-12"),
          status: "BOOKED",
          total_price: 500,
          locked_price: 500,
        },
      }),
      prisma.bookings.create({
        data: {
          booking_reference: "BK-20260322-E2Q4H7",
          end_user_id: user5.end_user_id,
          hotel_id: hotel5.hotel_id,
          check_in: new Date("2026-03-22"),
          check_out: new Date("2026-03-24"),
          status: "BOOKED",
          total_price: 240,
          locked_price: 240,
        },
      }),
      prisma.bookings.create({
        data: {
          booking_reference: "BK-20260410-F6R8S9",
          end_user_id: user6.end_user_id,
          hotel_id: hotel1.hotel_id,
          check_in: new Date("2026-04-10"),
          check_out: new Date("2026-04-15"),
          status: "RESERVED",
          total_price: 1250,
        },
      }),
      prisma.bookings.create({
        data: {
          booking_reference: "BK-20260328-G4T2U3",
          end_user_id: user7.end_user_id,
          hotel_id: hotel2.hotel_id,
          check_in: new Date("2026-03-28"),
          check_out: new Date("2026-03-30"),
          status: "BOOKED",
          total_price: 240,
          locked_price: 240,
        },
      }),
      prisma.bookings.create({
        data: {
          booking_reference: "BK-20260405-H8V1W2",
          end_user_id: user8.end_user_id,
          hotel_id: hotel4.hotel_id,
          check_in: new Date("2026-04-05"),
          check_out: new Date("2026-04-10"),
          status: "RESERVED",
          total_price: 750,
        },
      }),
    ]);
    console.log(`✅ ${bookings.length} bookings created`);

    // 10. Create Hotel Details with amenities
    console.log("✨ Creating hotel details and amenities...");
    const hotelDetails = await Promise.all([
      prisma.hotel_details.create({
        data: { hotel_id: hotel1.hotel_id, amenity_name: "Free WiFi" },
      }),
      prisma.hotel_details.create({
        data: { hotel_id: hotel1.hotel_id, amenity_name: "Swimming Pool" },
      }),
      prisma.hotel_details.create({
        data: { hotel_id: hotel1.hotel_id, amenity_name: "Gym & Fitness" },
      }),
      prisma.hotel_details.create({
        data: { hotel_id: hotel1.hotel_id, amenity_name: "Restaurant" },
      }),
      prisma.hotel_details.create({
        data: { hotel_id: hotel2.hotel_id, amenity_name: "Beach Access" },
      }),
      prisma.hotel_details.create({
        data: { hotel_id: hotel2.hotel_id, amenity_name: "Water Sports" },
      }),
      prisma.hotel_details.create({
        data: { hotel_id: hotel2.hotel_id, amenity_name: "Spa & Wellness" },
      }),
      prisma.hotel_details.create({
        data: { hotel_id: hotel3.hotel_id, amenity_name: "Free WiFi" },
      }),
      prisma.hotel_details.create({
        data: { hotel_id: hotel3.hotel_id, amenity_name: "Heritage Tours" },
      }),
      prisma.hotel_details.create({
        data: { hotel_id: hotel4.hotel_id, amenity_name: "Business Center" },
      }),
      prisma.hotel_details.create({
        data: { hotel_id: hotel4.hotel_id, amenity_name: "Conference Rooms" },
      }),
      prisma.hotel_details.create({
        data: { hotel_id: hotel5.hotel_id, amenity_name: "Garden Access" },
      }),
      prisma.hotel_details.create({
        data: { hotel_id: hotel5.hotel_id, amenity_name: "Nature Trails" },
      }),
    ]);
    console.log(`✅ ${hotelDetails.length} hotel amenities created`);

    // Summary
    console.log("\n🎉 Database seed completed successfully!\n");
    console.log("📝 Test Credentials:");
    console.log("━".repeat(60));
    console.log("\n🔐 System Admin:");
    console.log("  📧 Email: admin@myhotels.com");
    console.log("  🔑 Password: admin123");
    console.log("\n🏨 Hotel Admins (all use password: hotel123):");
    hotelAdmins.forEach((admin) => console.log(`  📧 ${admin.email}`));
    console.log("\n👤 End Users (all use password: password123):");
    endUsers.forEach((user) => console.log(`  📧 ${user.email}`));
    console.log("\n📊 Database Summary:");
    console.log(`  ✅ Hotels: ${hotels.length}`);
    console.log(`  ✅ Hotel Admins: ${hotelAdmins.length}`);
    console.log(`  ✅ End Users: ${endUsers.length}`);
    console.log(`  ✅ Room Types: ${roomTypes.length}`);
    console.log(`  ✅ Physical Rooms: ${physicalRooms.length}`);
    console.log(`  ✅ Bookings: ${bookings.length}`);
    console.log(`  ✅ Amenities: ${hotelDetails.length}`);
    console.log("\n" + "━".repeat(60));
  } catch (error: any) {
    console.error("\n❌ Seed failed:", error.message);
    console.error(error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();

