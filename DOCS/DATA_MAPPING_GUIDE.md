# Data Mapping: Seed Data → Frontend Display

## Hotels from Seed

### Database (from `prisma/seed.ts`)
```typescript
Hotels created:
1. Grand Stay Hotel (Dhaka, 5-Star Luxury)
2. Sunset Paradise Resort (Cox's Bazar, Resort)
3. Royal Palace Hotel (Khulna, Heritage Hotel)
4. Tech Hub Inn (Sylhet, Business Hotel)
5. Garden Valley Lodge (Chittagong, Budget Hotel)

// Plus duplicates (IDs 2-6) created from API results
```

### Displayed in AdminCurrentHotels
```
Grid View:
┌─────────────────────────────┐
│ 🏨 Grand Stay Hotel         │
│ 📍 Dhaka                    │
│ 👤 John Smith               │
│ 🛏️ Hotel | ⭐ 5             │
│ Published                   │
└─────────────────────────────┘
```

**Emoji Mapping:**
- 5-Star Luxury → 🏨
- Resort → 🏖️
- Heritage Hotel → 🏛️
- Business Hotel → 🏢
- Budget Hotel → 🛏️

## Hotel Admins from Seed

```typescript
Hotel Admins created:
1. Grand Stay Manager (manager@grandstay.com)
2. Sunset Manager (manager@sunsetparadise.com)
3. Royal Manager (manager@royalpalace.com)
4. Tech Manager (manager@techuinn.com)
5. Garden Manager (manager@gardenvalley.com)

Password for all: hotel123
```

## End Users from Seed

```typescript
End Users created:
1. Alice Johnson (alice@example.com)
2. Bob Wilson (bob@example.com)
3. Charlie Brown (charlie@example.com)
4. Diana Prince (diana@example.com)
5. Eve Anderson (eve@example.com)

Password for all: password123
```

**Displayed in AdminClientList as:**
```
Client Name | Email | Bookings | Joined
Alice J.    | alice@... | 0 | 2025-03-08
Bob W.      | bob@... | 0 | 2025-03-08
...
```

User initials generated from name:
- "Alice Johnson" → "AJ"
- "Bob Wilson" → "BW"
- Unknown users → "U"

## System Admin

```typescript
System Admin created:
Email: admin@myhotels.com
Password: admin123
Role: SYSTEM_ADMIN
Status: Active
```

**Displayed in Dashboard as:**
- Can access `/admin` dashboard
- Can manage all hotels and users
- Can view all bookings and revenue

## Dashboard Statistics Calculation

### Total Revenue
```
Calculation: Sum of all booking amounts where payment_status = "paid"

Data Flow:
1. fetchBookings() gets all bookings from API
2. Filter: booking.payment_status === "paid"
3. Sum: reduce((sum, b) => sum + b.total_amount, 0)

Display: formatCurrency(totalRevenue) → "$0.00"
```

### Total Bookings
```
Calculation: Count of all bookings

Data Flow:
1. fetchBookings() gets array
2. Display: bookings.length

Display: "0" bookings
```

### Active Properties
```
Calculation: Count of all hotels

Data Flow:
1. fetchHotels() gets array
2. Display: hotels.length

Display: "11" properties
```

### Pending Bookings
```
Calculation: Count of bookings with booking_status = "pending"

Data Flow:
1. Filter: booking.booking_status === "pending"
2. Count: filtered.length

Display: "0" pending
```

## Recent Bookings Table

**Columns:**
```
Guest # | Check-in | Check-out | Amount | Status
--------|----------|-----------|--------|--------
10      | Feb 15   | Feb 18    | $840   | Confirmed
2       | Feb 16   | Feb 20    | $780   | Pending
...
```

**Data Source:** Last 5 bookings sorted by `created_at` DESC

**Status Badge Colors:**
- ✅ confirmed → Primary (Blue)
- ⏳ pending → Secondary (Gray)
- ❌ cancelled → Destructive (Red)

## Top Properties Card

**Display Logic:**
```typescript
topHotels = hotels
  .map(hotel => ({
    id: hotel.hotel_id,
    name: hotel.name,
    bookings: count bookings for this hotel,
    revenue: sum amounts for this hotel,
    occupancy: 0 (not calculated from seed)
  }))
  .sort((a, b) => b.bookings - a.bookings)
  .slice(0, 4) // Top 4 only
```

**Example Display:**
```
1️⃣ Grand Stay Hotel
   💰 $0.00 | 0 bookings

2️⃣ Sunset Paradise Resort
   💰 $0.00 | 0 bookings
```

## Data Relationships

```
Hotels (11)
├── Hotel Admins (5) → Each manages one hotel
├── Rooms → Rooms belong to hotels
└── Bookings (0 current) → Bookings for rooms in hotels

End Users (5)
└── Bookings → Users make bookings

System Admin (1)
└── Manages entire platform
```

## Seed Execution Flow

```
1. Connect to Database
   ↓
2. Create Roles (HOTEL_ADMIN, HOTEL_SUB_ADMIN)
   ↓
3. Create System Admin
   ├── admin@myhotels.com / admin123
   └── system_admin_details record
   ↓
4. Create Hotels (5 hotels × 2 = 10 total)
   ├── Grand Stay Hotel (hotel_id: 1)
   ├── Sunset Paradise Resort (hotel_id: 2)
   ├── ... (duplicates 1-5 with IDs 7-11)
   ↓
5. Create Hotel Admins (1 per hotel)
   └── Linked to their respective hotels
   ↓
6. Create End Users (5 users)
   └── Independent of hotels
```

## Testing Data Consistency

### Verify in Browser Console
```javascript
// Check if hotels loaded
console.log("Hotels count:", hotels.length); // Should be 10+

// Check hotel structure
console.log("First hotel:", hotels[0]);
// Should have: hotel_id, name, city, hotel_type, etc.

// Check bookings (currently empty)
console.log("Bookings count:", bookings.length); // Should be 0

// Verify formatting
console.log("Total revenue:", formatCurrency(totalRevenue)); // $0.00
```

### Verify in Database
```sql
SELECT COUNT(*) FROM hotels;              -- 11
SELECT COUNT(*) FROM hotel_admins;        -- 5+
SELECT COUNT(*) FROM end_users;           -- 5+
SELECT COUNT(*) FROM system_admins;       -- 1
SELECT COUNT(*) FROM bookings;            -- 0
```

## What Happens After Seed

1. **Dashboard loads with:**
   - 11 hotels displayed
   - 0 bookings (none created yet)
   - $0.00 revenue (no paid bookings)
   - 5 end users available

2. **When users make bookings:**
   - Booking records created
   - Totals update automatically
   - Recent bookings table populates
   - Top properties calculated

3. **When admins are managed:**
   - Hotel admin list updates
   - Access controls enforced
   - Hotel-specific dashboards show their data

## Customizing Seed Data

To change seeded data, edit `backend/prisma/seed.ts`:

```typescript
// Change hotel list
const hotels = [
  { name: "Your Hotel", city: "Your City", ... },
  // Add more hotels
];

// Change admin credentials
const adminResult = await connection.query(
  `INSERT... VALUES (?, ?, ?, ...)`,
  ["new@email.com", "New Name", "newpassword123"]
);

// Run seed
npm run seed
```

Then data will be available in frontend dashboards immediately!
