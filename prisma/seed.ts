#!/usr/bin/env node

/**
 * FILE: prisma/seed.ts
 * PURPOSE: Seed database with initial demo data
 * 
 * Using raw SQL via mysql2/promise for reliable seeding
 * (Prisma ORM adapter connection pooling has initialization issues)
 */

import "dotenv/config";
import mysql from "mysql2/promise";

const pool = mysql.createPool({
  host: process.env.DATABASE_HOST || "localhost",
  user: process.env.DATABASE_USER || "root",
  password: process.env.DATABASE_PASSWORD || "123456",
  database: process.env.DATABASE_NAME || "myhotels_db_final",
  waitForConnections: true,
  connectionLimit: 5,
  queueLimit: 0,
});

async function main() {
  let connection: any;
  
  try {
    console.log("🌱 Starting database seed...");
    console.log("Attempting to get connection from pool...");
    connection = await pool.getConnection();
    console.log("✅ Connected to database!");

    // 1. Create Roles
    console.log("📋 Creating roles...");
    const rolesResult = await connection.query(
      `INSERT IGNORE INTO roles (role_id, role_name) VALUES 
       (1, 'HOTEL_ADMIN'),
       (2, 'HOTEL_SUB_ADMIN')`
    );
    console.log("✅ Roles created");

    // 2. Create System Admin
    console.log("👤 Creating system admin...");
    const adminResult = await connection.query(
      `INSERT IGNORE INTO system_admins (email, name, password, is_active, is_blocked, created_at, updated_at) 
       VALUES (?, ?, ?, 1, 0, NOW(), NOW())`,
      ["admin@myhotels.com", "System Administrator", "admin123"]
    );
    console.log("✅ System admin created: admin@myhotels.com");

    // 3. Create System Admin Details
    console.log("📝 Creating system admin details...");
    await connection.query(
      `INSERT IGNORE INTO system_admin_details (system_admin_id, phone, nid_no, address, dob, gender, updated_at)
       SELECT system_admin_id, ?, ?, ?, ?, ?, NOW()
       FROM system_admins WHERE email = ?`,
      ["+880123456789", "1234567890123", "Dhaka, Bangladesh", "1990-01-01", "Male", "admin@myhotels.com"]
    );
    console.log("✅ System admin details created");

    // 4. Create Hotels
    console.log("🏨 Creating hotels...");
    const hotels = [
      { name: "Grand Stay Hotel", email: "contact@grandstay.com", address: "123 Hotel Street, Gulshan-2, Dhaka", city: "Dhaka", hotel_type: "5-Star Luxury", emergency_contact1: "+8801700000001", reception_no1: "+8801700000001", owner_name: "John Smith", description: "A luxury 5-star hotel in the heart of Dhaka with world-class amenities", zip_code: "1212", star_rating: 5 },
      { name: "Sunset Paradise Resort", email: "info@sunsetparadise.com", address: "456 Beach Road, Cox's Bazar", city: "Cox's Bazar", hotel_type: "Resort", emergency_contact1: "+8801800000001", reception_no1: "+8801800000001", owner_name: "Ahmed Hassan", description: "Beautiful beachside resort with stunning ocean views and water sports", zip_code: "4700", star_rating: 4 },
      { name: "Royal Palace Hotel", email: "reservations@royalpalace.com", address: "789 Heritage Lane, Khulna", city: "Khulna", hotel_type: "Heritage Hotel", emergency_contact1: "+8801900000001", reception_no1: "+8801900000001", owner_name: "Fatima Begum", description: "Historic heritage hotel with traditional architecture and modern amenities", zip_code: "9000", star_rating: 4 },
      { name: "Tech Hub Inn", email: "stay@techuinn.com", address: "321 Innovation Drive, Sylhet", city: "Sylhet", hotel_type: "Business Hotel", emergency_contact1: "+8801800000002", reception_no1: "+8801800000002", owner_name: "Karim Khan", description: "Modern business hotel with high-speed internet and conference facilities", zip_code: "3100", star_rating: 3 },
      { name: "Garden Valley Lodge", email: "bookings@gardenvalley.com", address: "555 Mountain Pass, Chittagong", city: "Chittagong", hotel_type: "Budget Hotel", emergency_contact1: "+8801700000002", reception_no1: "+8801700000002", owner_name: "Rashid Ahmed", description: "Cozy budget-friendly lodge perfect for travelers and nature lovers", zip_code: "4000", star_rating: 3 },
    ];

    for (const hotel of hotels) {
      await connection.query(
        `INSERT IGNORE INTO hotels (name, email, address, city, hotel_type, emergency_contact1, reception_no1, owner_name, description, zip_code, star_rating, created_by, approval_status, approved_by, published_at, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, 'PUBLISHED', 1, NOW(), NOW(), NOW())`,
        [hotel.name, hotel.email, hotel.address, hotel.city, hotel.hotel_type, hotel.emergency_contact1, hotel.reception_no1, hotel.owner_name, hotel.description, hotel.zip_code, hotel.star_rating]
      );
    }
    console.log(`✅ ${hotels.length} hotels created`);

    // 5. Create Hotel Admins
    console.log("🔑 Creating hotel admins...");
    const hotelAdmins = [
      { name: "Grand Stay Manager", email: "manager@grandstay.com", password: "hotel123", hotel_name: "Grand Stay Hotel" },
      { name: "Sunset Manager", email: "manager@sunsetparadise.com", password: "hotel123", hotel_name: "Sunset Paradise Resort" },
      { name: "Royal Manager", email: "manager@royalpalace.com", password: "hotel123", hotel_name: "Royal Palace Hotel" },
      { name: "Tech Manager", email: "manager@techuinn.com", password: "hotel123", hotel_name: "Tech Hub Inn" },
      { name: "Garden Manager", email: "manager@gardenvalley.com", password: "hotel123", hotel_name: "Garden Valley Lodge" },
    ];

    for (const admin of hotelAdmins) {
      await connection.query(
        `INSERT IGNORE INTO hotel_admins (hotel_id, name, email, password, role_id, is_active, is_blocked, created_at, updated_at)
         SELECT hotel_id, ?, ?, ?, 1, 1, 0, NOW(), NOW()
         FROM hotels WHERE name = ? LIMIT 1`,
        [admin.name, admin.email, admin.password, admin.hotel_name]
      );
    }
    console.log(`✅ ${hotelAdmins.length} hotel admins created`);

    // 6. Create End Users
    console.log("👥 Creating end users...");
    const endUsers = [
      { name: "Alice Johnson", email: "alice@example.com", password: "password123" },
      { name: "Bob Wilson", email: "bob@example.com", password: "password123" },
      { name: "Charlie Brown", email: "charlie@example.com", password: "password123" },
      { name: "Diana Prince", email: "diana@example.com", password: "password123" },
      { name: "Eve Anderson", email: "eve@example.com", password: "password123" },
    ];

    for (const user of endUsers) {
      await connection.query(
        `INSERT IGNORE INTO end_users (email, password, name, email_verified, is_blocked, created_at, updated_at)
         VALUES (?, ?, ?, 0, 0, NOW(), NOW())`,
        [user.email, user.password, user.name]
      );
    }
    console.log(`✅ ${endUsers.length} end users created`);

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
    console.log("\n" + "━".repeat(60));

  } catch (error: any) {
    console.error("\n❌ Seed failed:", error.message);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.release();
    }
    await pool.end();
  }
}

main();

