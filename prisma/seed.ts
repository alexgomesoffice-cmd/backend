import { PrismaClient, AmenityContext, ApprovalStatus, RoomApproval, BookingStatus, TrackerStatus } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Running seed script...");

  // roles
  const hotelAdminRole = await prisma.roles.upsert({
    where: { role_name: "HOTEL_ADMIN" },
    update: {},
    create: { role_name: "HOTEL_ADMIN" },
  });

  const hotelSubAdminRole = await prisma.roles.upsert({
    where: { role_name: "HOTEL_SUB_ADMIN" },
    update: {},
    create: { role_name: "HOTEL_SUB_ADMIN" },
  });

  // system admin
  const sysAdmin = await prisma.system_admins.upsert({
    where: { email: "admin@myhotels.com" },
    update: {},
    create: {
      name: "System Administrator",
      email: "admin@myhotels.com",
      password: "admin123", // production should hash
      is_active: true,
      is_blocked: false,
    },
  });

  // system admin details
  await prisma.system_admin_details.upsert({
    where: { system_admin_id: sysAdmin.system_admin_id },
    update: {},
    create: {
      system_admin_id: sysAdmin.system_admin_id,
      address: "123 Main St, Dhaka",
      phone: "+8801234567890",
    },
  });

  // amenities master list
  const amenitiesData = [
    { name: "Swimming Pool", context: AmenityContext.BOTH, icon: "pool" },
    { name: "Gym / Fitness Center", context: AmenityContext.BOTH, icon: "fitness" },
    { name: "Free Wi-Fi", context: AmenityContext.BOTH, icon: "wifi" },
    { name: "Parking", context: AmenityContext.BOTH, icon: "parking" },
    { name: "Restaurant", context: AmenityContext.BOTH, icon: "restaurant" },
    { name: "Bar / Lounge", context: AmenityContext.BOTH, icon: "bar" },
    { name: "Spa & Wellness", context: AmenityContext.BOTH, icon: "spa" },
    { name: "Conference Room", context: AmenityContext.HOTEL, icon: "conference" },
    { name: "24/7 Front Desk", context: AmenityContext.HOTEL, icon: "desk" },
    { name: "Room Service", context: AmenityContext.HOTEL, icon: "room_service" },
    { name: "Laundry Service", context: AmenityContext.HOTEL, icon: "laundry" },
    { name: "Airport Shuttle", context: AmenityContext.HOTEL, icon: "shuttle" },
    { name: "Garden / Terrace", context: AmenityContext.HOTEL, icon: "garden" },
    { name: "Elevator", context: AmenityContext.HOTEL, icon: "elevator" },
    { name: "CCTV Security", context: AmenityContext.HOTEL, icon: "security" },
    { name: "Power Backup", context: AmenityContext.HOTEL, icon: "power" },
    { name: "Wheelchair Accessible", context: AmenityContext.HOTEL, icon: "wheelchair" },
    { name: "Pet Friendly", context: AmenityContext.HOTEL, icon: "pets" },
    { name: "Kids Play Area", context: AmenityContext.HOTEL, icon: "kids" },
    { name: "Business Center", context: AmenityContext.HOTEL, icon: "business" },
  ];

  for (const amenity of amenitiesData) {
    await prisma.amenities.upsert({
      where: { name: amenity.name },
      update: {},
      create: amenity,
    });
  }

  // hotels + details + images + amenities
  const hotelsSeed = [
    {
      name: "Grand Stay Hotel",
      email: "contact@grandstay.com",
      city: "Dhaka",
      hotel_type: "5-Star Luxury",
      emergency_contact1: "+880123000001",
      owner_name: "John Smith",
      zip_code: "1212",
      description: "A luxury 5-star hotel in the heart of Dhaka with world-class amenities",
      reception_no1: "+880123000002",
      reception_no2: "+880123000003",
      star_rating: 5,
      guest_rating: 4.8,
      amenities: [
        "Swimming Pool",
        "Gym / Fitness Center",
        "Free Wi-Fi",
        "Parking",
      ],
      images: [
        "https://example.com/images/grand1.jpg",
        "https://example.com/images/grand2.jpg",
      ],
      hotelAdmin: {
        name: "Grand Manager",
        email: "manager@grandstay.com",
        password: "hotel123",
        phone: "+880123000004",
      },
    },
    // more hotels if desired
  ];

  for (const hotelData of hotelsSeed) {
    // identify hotel by name+city combination; upgrade if existing
    let hotel = await prisma.hotels.findFirst({
      where: {
        name: hotelData.name,
        city: hotelData.city,
      },
    });

    if (!hotel) {
      hotel = await prisma.hotels.create({
        data: {
          name: hotelData.name,
          email: hotelData.email || null,
          city: hotelData.city || null,
          hotel_type: hotelData.hotel_type || null,
          emergency_contact1: hotelData.emergency_contact1 || null,
          owner_name: hotelData.owner_name || null,
          zip_code: hotelData.zip_code || null,
          created_by: sysAdmin.system_admin_id,
          approval_status: ApprovalStatus.PUBLISHED,
          published_at: new Date(),
        },
      });
    }

    // hotel_details
    await prisma.hotel_details.upsert({
      where: { hotel_id: hotel.hotel_id },
      update: {
        description: hotelData.description,
        reception_no1: hotelData.reception_no1,
        reception_no2: hotelData.reception_no2,
        star_rating: hotelData.star_rating,
        guest_rating: hotelData.guest_rating,
      },
      create: {
        hotel_id: hotel.hotel_id,
        description: hotelData.description,
        reception_no1: hotelData.reception_no1,
        reception_no2: hotelData.reception_no2,
        star_rating: hotelData.star_rating,
        guest_rating: hotelData.guest_rating,
      },
    });

    // hotel_amenities junction
    for (const name of hotelData.amenities) {
      const amenity = await prisma.amenities.findUnique({ where: { name } });
      if (amenity) {
        await prisma.hotel_amenities.upsert({
          where: { hotel_id_amenity_id: { hotel_id: hotel.hotel_id, amenity_id: amenity.id } },
          update: {},
          create: { hotel_id: hotel.hotel_id, amenity_id: amenity.id },
        });
      }
    }

    // hotel_images: only create if not already present
    for (const url of hotelData.images) {
      const existingImg = await prisma.hotel_images.findFirst({
        where: { hotel_id: hotel.hotel_id, image_url: url },
      });
      if (!existingImg) {
        await prisma.hotel_images.create({
          data: { hotel_id: hotel.hotel_id, image_url: url },
        });
      }
    }

    // hotel admin
    const admin = await prisma.hotel_admins.upsert({
      where: { email: hotelData.hotelAdmin.email },
      update: {},
      create: {
        name: hotelData.hotelAdmin.name,
        email: hotelData.hotelAdmin.email,
        password: hotelData.hotelAdmin.password,
        hotel_id: hotel.hotel_id,
        role_id: hotelAdminRole.role_id,
        created_by: sysAdmin.system_admin_id,
      },
    });

    await prisma.hotel_admin_details.upsert({
      where: { hotel_admin_id: admin.hotel_admin_id },
      update: { phone: hotelData.hotelAdmin.phone },
      create: { hotel_admin_id: admin.hotel_admin_id, phone: hotelData.hotelAdmin.phone },
    });
  }

  // end users
  const users = [
    { name: "Alice Johnson", email: "alice@example.com" },
    { name: "Bob Wilson", email: "bob@example.com" },
  ];

  for (const u of users) {
    const user = await prisma.end_users.upsert({
      where: { email: u.email },
      update: {},
      create: {
        name: u.name,
        email: u.email,
        password: "password123",
      },
    });

    await prisma.end_user_details.upsert({
      where: { end_user_id: user.end_user_id },
      update: {},
      create: { end_user_id: user.end_user_id, phone: "+880100000000" },
    });
  }

  console.log("Seeding finished.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
