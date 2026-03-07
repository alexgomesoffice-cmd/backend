/**
 * FILE: prisma/seed.ts
 * PURPOSE: Seed database with initial demo data
 *
 * WHAT IT DOES:
 * 1. Creates roles (HOTEL_ADMIN, HOTEL_SUB_ADMIN) - required by schema
 * 2. Creates one system admin for testing login
 * 3. Sets up demo data so you can test immediately
 *
 * RUN THIS:
 * npx prisma db seed
 *
 * WARNING:
 * - This OVERWRITES existing roles and test admin
 * - Only run on development database
 * - Do NOT run on production!
 *
 * WHAT YOU CAN TEST AFTER SEEDING:
 * POST /api/auth/system-admin/login
 * {
 *   "email": "admin@myhotels.com",
 *   "password": "admin123"
 * }
 */

import { prisma } from "../src/config/prisma";
import { logger } from "../src/utils/logger";

/**
 * Main seed function
 * All seeding logic goes here
 */
async function main() {
  logger.info("🌱 Starting database seed...");

  try {
    // ============================================================
    // 1. Create/Update Roles
    // ============================================================
    logger.info("Creating roles...");

    // Role 1: HOTEL_ADMIN
    // Hotel owner/manager level admin
    const hotelAdminRole = await prisma.roles.upsert({
      where: { role_id: 1 },
      update: {}, // Don't update if exists
      create: {
        role_id: 1,
        role_name: "HOTEL_ADMIN",
      },
    });
    logger.info("✅ HOTEL_ADMIN role created/verified");

    // Role 2: HOTEL_SUB_ADMIN
    // Hotel staff/receptionist level admin
    const hotelSubAdminRole = await prisma.roles.upsert({
      where: { role_id: 2 },
      update: {},
      create: {
        role_id: 2,
        role_name: "HOTEL_SUB_ADMIN",
      },
    });
    logger.info("✅ HOTEL_SUB_ADMIN role created/verified");

    // ============================================================
    // 2. Create Test System Admin
    // ============================================================
    logger.info("Creating test system admin...");

    const testAdmin = await prisma.system_admins.upsert({
      where: { email: "admin@myhotels.com" },
      update: {}, // Don't update if exists
      create: {
        // Basic info
        name: "System Administrator",
        email: "admin@myhotels.com",
        password: "admin123", // Plain text (will be hashed in Phase 11)

        // Status
        is_active: true,
        is_blocked: false,

        // Meta
        created_at: new Date(),
        updated_at: new Date(),
      },
    });
    logger.info("✅ Test system admin created", {
      admin_id: testAdmin.system_admin_id,
      email: testAdmin.email,
    });

    // ============================================================
    // 3. Demo Seed Data (Optional)
    // ============================================================
    logger.info("Creating demo data...");

    // Create demo system admin details (profile info)
    await prisma.system_admin_details.upsert({
      where: { system_admin_id: testAdmin.system_admin_id },
      update: {},
      create: {
        system_admin_id: testAdmin.system_admin_id,
        phone: "+880123456789",
        nid_no: "1234567890123",
        address: "Dhaka, Bangladesh",
        dob: new Date("1990-01-01"),
        gender: "Male",
        updated_at: new Date(),
      },
    });
    logger.info("✅ Demo system admin details created");

    // ============================================================
    // Summary
    // ============================================================
    logger.info("🎉 Database seed completed successfully!");
    logger.info("📝 You can now test the API with:", {
      endpoint: "POST /api/auth/system-admin/login",
      email: "admin@myhotels.com",
      password: "admin123",
    });
  } catch (error) {
    logger.error("❌ Seed failed:", error);
    throw error;
  }
}

/**
 * Run seed function
 * Prisma automatically calls this when you run `npx prisma db seed`
 */
main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
