import "dotenv/config";
import { prisma } from "./src/config/prisma";
import jwt from "jsonwebtoken";

async function testHotelCreation() {
  try {
    // Step 1: Get a system admin to create token
    const admin = await prisma.system_admins.findFirst();
    
    if (!admin) {
      console.log("❌ No system admin found in database");
      process.exit(1);
    }

    console.log("✅ Found system admin:", {
      id: admin.system_admin_id,
      email: admin.email,
      name: admin.name,
    });

    // Step 2: Create a valid JWT token
    const token = jwt.sign(
      {
        system_admin_id: admin.system_admin_id,
        actor_type: "SYSTEM_ADMIN",
      },
      process.env.JWT_SECRET || "SUPER_SECRET_KEY_123"
    );

    console.log("\n✅ Generated JWT Token:");
    console.log(token);

    // Step 3: Make API request to create hotel
    const hotelPayload = {
      name: "Test Grand Hotel",
      city: "Dhaka",
      address: "123 Main Street, Dhaka",
      zip_code: "1212",
      description: "A beautiful 5-star hotel in Dhaka",
      hotel_type: "hotel",
      star_rating: 5,
      email: "test@grandhotel.com",
      emergency_contact1: "+880-1234-567890",
      emergency_contact2: "+880-9876-543210",
      reception_no1: "+880-2-123-4567",
      reception_no2: "+880-2-234-5678",
      owner_name: "Ahmed Khan",
      manager_name: "Karim Manager",
      manager_phone: "+880-1111-111111",
      amenities: ["Swimming Pool", "Gym / Fitness Center", "Free Wi-Fi", "Parking", "Restaurant"],
      images: ["data:image/jpeg;base64,/9j/4AAQSkZJRg==", "data:image/jpeg;base64,/9j/4AAQSkZJRg=="],
    };

    console.log("\n📤 Sending hotel creation request to API...");
    const response = await fetch("http://localhost:3000/api/hotels/create", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
      body: JSON.stringify(hotelPayload),
    });

    const result = await response.json();

    if (response.ok) {
      console.log("\n✅ Hotel created successfully!");
      console.log("Response:", JSON.stringify(result, null, 2));

      const hotelId = (result as any).data?.hotel_id;

      // Step 4: Create hotel admin
      const adminPayload = {
        hotel_id: hotelId,
        name: "Hotel Admin User",
        email: "admin@grandhotel.com",
        password: "AdminPass123!",
        phone: "+880-3333-333333",
        nid_no: "1234567890123",
        manager_name: "Karim Manager",
        manager_phone: "+880-1111-111111",
      };

      console.log("\n📤 Creating hotel admin...");
      const adminResponse = await fetch("http://localhost:3000/api/hotels/admin/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify(adminPayload),
      });

      const adminResult = await adminResponse.json();

      if (adminResponse.ok) {
        console.log("\n✅ Hotel admin created successfully!");
        console.log("Admin Response:", JSON.stringify(adminResult, null, 2));

        // Step 5: Verify data in database
        console.log("\n📊 Verifying data in database...");

        const hotel = await prisma.hotels.findUnique({
          where: { hotel_id: hotelId },
          include: {
            hotel_details: true,
            hotel_admin: true,
          },
        });

        console.log("\n✅ Hotel from DB:", {
          id: hotel?.hotel_id,
          name: hotel?.name,
          city: hotel?.city,
          amenitiesCount: hotel?.hotel_details.filter((d) => d.amenity_name).length,
          imagesCount: hotel?.hotel_details.filter((d) => d.hotel_image_url).length,
        });

        const adminData = await prisma.hotel_admins.findUnique({
          where: { hotel_id: hotelId },
          include: { hotel_admin_details: true },
        });

        console.log("\n✅ Admin from DB:", {
          id: adminData?.hotel_admin_id,
          name: adminData?.name,
          email: adminData?.email,
          phone: adminData?.hotel_admin_details?.phone,
          nid: adminData?.hotel_admin_details?.nid_no,
        });

        console.log("\n✅✅✅ ALL TESTS PASSED! ✅✅✅");
      } else {
        console.log("\n❌ Failed to create hotel admin:");
        console.log("Error:", JSON.stringify(adminResult, null, 2));
      }
    } else {
      console.log("\n❌ Failed to create hotel:");
      console.log("Error:", JSON.stringify(result, null, 2));
    }
  } catch (error) {
    console.error("❌ Error:", error);
  } finally {
    await prisma.$disconnect();
    process.exit(0);
  }
}

testHotelCreation();
