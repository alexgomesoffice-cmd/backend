# MyHotels — Frontend ↔ Backend Planning Decisions
## All 11 Issues Resolved

---

## Issue 1 — Hotel + Admin Creation Flow
**Problem:** Frontend had one combined form submitting hotel + admin details together. Backend has two separate endpoints.

**Decision:** Option B — One combined endpoint on backend.

**Solution:**
```
POST /api/system-admin/hotels/with-admin
{
  hotel: { name, address, city, hotel_type, description, star_rating, owner_name, reception_no1, emergency_contact1 },
  admin: { name, email, password, phone, nid_no }
}
```
Backend handles both inserts in one `prisma.$transaction`. If anything fails, entire transaction rolls back.

**Response:**
```json
{
  "message": "Hotel and admin created successfully",
  "hotel": { "hotel_id": 5, "name": "Grand Hotel" },
  "admin": { "hotel_admin_id": 3, "email": "admin@grandhotel.com" }
}
```

**Additional endpoints kept:**
```
POST /api/system-admin/hotels            → create hotel only
POST /api/system-admin/hotel-admins      → create admin only (hotel exists)
POST /api/system-admin/hotels/with-admin → combined (main flow)
```

**Changes:**
- Backend: add `createHotelWithAdmin(hotelData, adminData, createdBy)` to `systemAdmin.service.ts`
- Frontend: keep one form, one submit button

---

## Issue 2 — Missing Hotel Search/Browse Endpoint
**Problem:** Frontend has `/search` and `/explore` routes expecting public hotel search. Backend Phase 7 not built yet.

**Decision:** Option B — Skip search UI until Phase 7 is built.

**Solution:**
- Don't wire up search/explore pages yet
- Show "Coming soon" placeholder or leave pages unlinked from nav
- Don't delete the files
- Build search endpoint in Phase 7, then connect frontend

**No backend or schema changes needed.**

---

## Issue 3 — Hotel Details Structure Mismatch
**Problem:** Frontend expects one clean nested object. Backend spreads data across four tables.

**Decision:** Option A — Single endpoint returns everything nested.

**Solution:** `GET /api/hotels/:id` returns:
```json
{
  "hotel_id": 1,
  "name": "Grand Stay",
  "city": "Dhaka",
  "address": "123 Gulshan Ave",
  "description": "...",
  "star_rating": 4.5,
  "guest_rating": 8.9,
  "images": ["url1", "url2"],
  "amenities": ["Free WiFi", "Pool"],
  "roomTypes": [
    {
      "hotel_room_id": 1,
      "room_type": "Deluxe Double",
      "base_price": 3500,
      "amenities": [
        { "id": 1, "name": "King Bed", "icon": "bed" }
      ],
      "physicalRooms": 3
    }
  ]
}
```

**Implementation in `hotel.service.ts`:**
```ts
const hotel = await prisma.hotels.findUnique({
  where: { hotel_id: id },
  include: {
    hotel_details: true,
    hotel_rooms: {
      include: {
        hotel_room_details: { where: { deleted_at: null } },
        hotel_room_amenities: { include: { amenity: true } }
      }
    }
  }
})
```

**No schema changes needed.**

---

## Issue 4 — Missing Admin Hierarchy in Frontend
**Problem:** Frontend missing `/hotel-sub-admin-login` route and sub admin dashboard.

**Decision:** Separate login page per actor — 3 different staff login URLs.

**Final login URL map:**
```
/login                     → end user (public)
/admin-login               → system admin
/hotel-admin-login         → hotel admin
/hotel-sub-admin-login     → hotel sub admin ← CREATE THIS
```

**Sub admin dashboard** — shows booking management only:
```
✅ View bookings
✅ Update booking status (check-in, check-out, no-show)
✅ View own profile
❌ No rooms section
❌ No hotel settings
❌ No sub admin management
```

**Changes:**
- Frontend: create `/hotel-sub-admin-login` page → calls `POST /api/auth/hotel-sub-admin/login`
- Frontend: create `/hotel-sub-admin/dashboard` with restricted sidebar
- Backend: no changes needed

---

## Issue 5 — Room Amenities Per-Hotel vs Per-Room
**Problem:** Frontend allows per-room amenities but schema stored amenities at hotel level only.

**Decision:** Option C — Both levels. Hotel-wide amenities + room type specific amenities.  
**Storage:** Option A — Master amenities table + junction table (fully normalized).

**Solution:** Two new tables added to schema:

```prisma
model amenities {
  id           Int      @id @default(autoincrement())
  name         String   @unique @db.VarChar(150)
  icon         String?  @db.VarChar(100)
  is_active    Boolean  @default(true)
  created_at   DateTime @default(now())

  hotel_room_amenities hotel_room_amenities[]

  @@map("amenities")
}

model hotel_room_amenities {
  id            Int      @id @default(autoincrement())
  hotel_room_id Int
  amenity_id    Int
  created_at    DateTime @default(now())

  hotel_room hotel_rooms @relation(fields: [hotel_room_id], references: [hotel_room_id], onDelete: Cascade)
  amenity    amenities   @relation(fields: [amenity_id],    references: [id],            onDelete: Cascade)

  @@unique([hotel_room_id, amenity_id])
  @@index([hotel_room_id])
  @@map("hotel_room_amenities")
}
```

Add to `hotel_rooms` model:
```prisma
hotel_room_amenities hotel_room_amenities[]
```

**How it works:**
```
Hotel amenities (hotel_details) → Free WiFi, Pool, Gym, Parking
Room amenities (hotel_room_amenities) → King Bed, Sea View, Balcony, Jacuzzi
```

**New routes added:**
```
POST /api/system-admin/amenities   → system admin creates master amenity
GET  /api/amenities                → public list, used by room form checkboxes
```

**Seed default amenities:**
```ts
const defaultAmenities = [
  { name: 'King Bed',        icon: 'bed'      },
  { name: 'Sea View',        icon: 'ocean'    },
  { name: 'Balcony',         icon: 'balcony'  },
  { name: 'Private Jacuzzi', icon: 'jacuzzi'  },
  { name: 'City View',       icon: 'city'     },
  { name: 'Work Desk',       icon: 'desk'     },
  { name: 'Sofa',            icon: 'sofa'     },
  { name: 'Bathtub',         icon: 'bath'     },
]
```

**Migration:**
```bash
npx prisma migrate dev --name add_amenities_tables
```

---

## Issue 6 — Room Type vs Physical Room Confusion
**Problem:** Frontend form mixes room type fields and physical room fields together.

**Decision:** Two steps in one form (tab/wizard style).

**Step 1 — Room Type:**
```
room_type name, base_price, description, room_size
Amenities: checkboxes from GET /api/amenities
[ Next → ]
```

**Step 2 — Physical Rooms:**
```
[ + Add Physical Room ]
  room_number, bed_type, max_occupancy,
  smoking_allowed, pet_allowed, image_url
[ + Add Another Room ]
[ ← Back ]  [ Submit All ]
```

**On Submit All — frontend fires sequentially:**
```
1. POST /api/hotels/:hotelId/rooms
   → creates room type, gets back hotel_room_id

2. For each physical room in Step 2:
   POST /api/hotels/:hotelId/rooms/:roomId/physical-rooms
```

**No backend or schema changes needed.**

---

## Issue 7 — Booking Payment Flow
**Problem:** Frontend booking form not wired to any payment flow.

**Decision:** Simulated payment — Confirm Payment button calls pay endpoint directly. Keep RESERVED → BOOKED two-step flow with 30 min hold.

**Complete flow:**
```
Step 1 — User clicks Book Now:
  POST /api/bookings
  → status = RESERVED
  → reserved_until = NOW + 30 min
  → Returns { booking_id, booking_reference, total_price, reserved_until }

Step 2 — Frontend shows payment summary page:
  "Your booking is held for 30 minutes"
  Countdown timer
  Total: ৳8,500
  [ Confirm Payment ]

Step 3 — User clicks Confirm Payment:
  POST /api/bookings/:id/pay
  → status = BOOKED
  → locked_price = total_price
  → reserved_until = NULL
  → Returns { booking_reference, status: "BOOKED" }

Step 4 — Frontend redirects to booking confirmation page
```

**No new table needed. No schema changes.**

When ready to add real SSLCommerz payment later:
- Add `payment_transactions` table at that point
- Insert `initiate-payment` endpoint between the two existing steps
- Nothing already built breaks

---

## Issue 8 — Email Verification
**Problem:** Schema has email_verified fields but frontend has no verification flow.

**Decision:** Option B — Skip entirely. Users log in immediately after registering.

**Solution:**
- In `endUser.auth.service.ts` login function — do not check `email_verified`
- `email_verified` and `email_verified_at` columns stay in schema unused
- Signup redirects straight to login or logs user in automatically

**No schema changes. No new routes. No frontend verification page.**

---

## Issue 9 — Image Upload vs URL
**Problem:** Frontend has file upload UI. Backend expects image URLs.

**Decision:** Option C — Store files on server using multer.

**Install:**
```bash
npm install multer
npm install -D @types/multer
```

**Folder structure:**
```
backend/
└── uploads/
    ├── hotels/
    ├── rooms/
    └── profiles/
```

**Add to `app.ts`:**
```ts
app.use('/uploads', express.static(path.join(__dirname, '../uploads')))
```

**Single upload endpoint:**
```
POST /api/upload?folder=hotels    → hotel images
POST /api/upload?folder=rooms     → room images
POST /api/upload?folder=profiles  → profile images

Response: { url: "http://localhost:3000/uploads/hotels/1234-hotel.jpg" }
```

**Frontend flow:**
```
User picks file
→ POST /api/upload?folder=hotels
→ Gets back URL
→ Includes URL in hotel/room creation form
```

**Add to `.gitignore`:**
```
uploads/
```

**Note:** Files are lost on server restart/redeploy. Migration to Cloudinary later only requires changing `upload.ts`.

---

## Issue 10 — Rating System
**Problem:** `guest_rating` on hotels has no data source. No reviews table in schema.

**Decision:** Option B — Star rating only, no user reviews.

**Solution:**
- `star_rating` set by system admin when creating/updating a hotel
- `guest_rating` never displayed on frontend or left as `0.00`
- No reviews table needed
- No new endpoints needed

**No schema changes.**

---

## Issue 11 — Missing Frontend Routes
**Problem:** `/hotel-sub-admin-login` and `/hotel-sub-admin/dashboard` missing from frontend router.

**Decision:** Already resolved in Issue 4.

**Solution:**
- Create `/hotel-sub-admin-login` page
- Create `/hotel-sub-admin/dashboard` with booking management only
- No backend changes needed

---

## Summary of All Changes

### Schema changes (one migration needed):
```bash
npx prisma migrate dev --name add_amenities_tables
```
Adds:
- `amenities` table — master list managed by system admin
- `hotel_room_amenities` table — junction table linking room types to amenities

### New backend endpoints beyond original plan:
```
POST /api/system-admin/hotels/with-admin   → Issue 1
POST /api/upload                           → Issue 9
POST /api/system-admin/amenities           → Issue 5
GET  /api/amenities                        → Issue 5
```

### Frontend tasks before connecting to backend:
```
✅ Keep one combined hotel+admin creation form (calls with-admin endpoint)
✅ Skip search/explore pages until Phase 7
✅ Add /hotel-sub-admin-login page
✅ Add /hotel-sub-admin/dashboard (bookings only, no rooms)
✅ Split room form into two steps (type info → physical rooms)
✅ Replace file input with upload flow (POST /api/upload → get URL → submit form)
```

### Things that need NO changes and resolve themselves during normal build:
```
Issue 2  → search endpoint built in Phase 7
Issue 7  → booking flow built in Phase 9
Issue 8  → no verification check in login service
Issue 10 → no reviews table needed
Issue 11 → covered by Issue 4
```
