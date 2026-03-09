# API Response Data Structure Reference

## Hotel Data Structure

### Backend Response (from `GET /api/hotels`)

```typescript
interface HotelResponse {
  hotel_id: number;                    // Primary key from hotels table
  name: string;                        // Hotel name
  email: string | null;                // Hotel contact email
  address: string | null;              // Street address
  city: string | null;                 // City location
  hotel_type: string | null;           // Type (e.g., "5-Star Luxury", "Resort", "Boutique Hotel")
  owner_name: string | null;           // Owner's name
  description: string | null;          // Hotel description
  star_rating: number | null;          // Star rating (1-5)
  emergency_contact1: string | null;   // Emergency contact #1
  emergency_contact2: string | null;   // Emergency contact #2
  reception_no1: string | null;        // Reception phone #1
  reception_no2: string | null;        // Reception phone #2
  zip_code: string | null;             // Postal code
  approval_status: string;             // Status: DRAFT, PUBLISHED, PENDING, REJECTED
  created_by: number;                  // System admin who created it
  created_at: string;                  // ISO timestamp
  updated_at: string;                  // ISO timestamp
  approved_by?: number;                // Admin who approved (optional)
  published_at?: string;               // When published (optional)
}
```

### Example Hotel Object

```json
{
  "hotel_id": 1,
  "name": "Grand Stay Hotel",
  "email": "contact@grandstay.com",
  "address": "123 Hotel Street, Gulshan-2, Dhaka",
  "city": "Dhaka",
  "hotel_type": "5-Star Luxury",
  "owner_name": "John Smith",
  "description": "A luxury 5-star hotel in the heart of Dhaka with world-class amenities",
  "star_rating": 5,
  "approval_status": "PUBLISHED",
  "created_at": "2025-03-07T10:30:00.000Z",
  "updated_at": "2025-03-07T10:30:00.000Z"
}
```

### UI Component Mapping

| Database Field | Component Use | Example |
|---|---|---|
| `hotel_id` | React key, navigation params | `navigate(/admin/hotels/1)` |
| `name` | Hotel title | "Grand Stay Hotel" |
| `city` | Location display | `<MapPin /> Dhaka` |
| `hotel_type` | Emoji mapping | "5-Star Luxury" → "🏨" |
| `owner_name` | Admin/owner info | `<UserCheck /> John Smith` |
| `star_rating` | Rating display | `<Star /> 5` |
| `approval_status` | Status badge | "PUBLISHED" badge |
| `description` | Hover text/detail view | Full description |

---

## Booking Data Structure

### Backend Response (from `GET /api/bookings`)

```typescript
interface BookingResponse {
  booking_id: number;                  // Primary key from bookings table
  room_id: number;                     // Foreign key to rooms table
  end_user_id: number;                 // Foreign key to end_users table
  check_in_date: string;               // ISO date (YYYY-MM-DD)
  check_out_date: string;              // ISO date (YYYY-MM-DD)
  total_amount: number;                // Total booking cost
  booking_status: string;              // Status: pending, confirmed, cancelled
  payment_status: string;              // Status: paid, unpaid, refunded
  booking_reference?: string;          // Unique booking reference (optional)
  notes?: string;                      // Booking notes (optional)
  created_at: string;                  // ISO timestamp
  updated_at: string;                  // ISO timestamp
}
```

### Example Booking Object

```json
{
  "booking_id": 42,
  "room_id": 101,
  "end_user_id": 5,
  "check_in_date": "2025-03-15",
  "check_out_date": "2025-03-18",
  "total_amount": 840,
  "booking_status": "confirmed",
  "payment_status": "paid",
  "booking_reference": "BK-20250307-A3F9K2",
  "created_at": "2025-03-07T10:30:00.000Z",
  "updated_at": "2025-03-07T10:30:00.000Z"
}
```

### UI Component Mapping

| Database Field | Component Use | Example |
|---|---|---|
| `booking_id` | React key, detail page params | `navigate(/bookings/42)` |
| `end_user_id` | Guest identifier | "Guest #5" |
| `check_in_date` | Check-in display | "Mar 15, 2025" |
| `check_out_date` | Check-out display | "Mar 18, 2025" |
| `total_amount` | Revenue calculation | formatCurrency(840) → "$840.00" |
| `booking_status` | Status badge color | "confirmed" → green badge |
| `payment_status` | Payment indicator | "paid" → checkmark |
| `created_at` | Booking date for sorting | Sort by recency |

---

## End User Data Structure

### Backend Response (from `GET /api/end-users`)

```typescript
interface EndUserResponse {
  end_user_id: number;                 // Primary key from end_users table
  email: string;                       // User email (unique)
  name: string | null;                 // User's full name
  password: string;                    // Hashed password (shouldn't be exposed)
  is_blocked: boolean;                 // Whether user is blocked
  email_verified: boolean;             // Whether email is verified
  deleted_at: string | null;           // Soft delete timestamp (null if not deleted)
  created_at: string;                  // ISO timestamp
  updated_at: string;                  // ISO timestamp
}
```

### Example End User Object

```json
{
  "end_user_id": 5,
  "email": "alice@example.com",
  "name": "Alice Johnson",
  "is_blocked": false,
  "email_verified": true,
  "deleted_at": null,
  "created_at": "2025-03-07T10:30:00.000Z",
  "updated_at": "2025-03-07T10:30:00.000Z"
}
```

### UI Component Mapping

| Database Field | Component Use | Example |
|---|---|---|
| `end_user_id` | React key, navigation params | `navigate(/admin/users/5)` |
| `name` | User display | "Alice Johnson" or "A.J." |
| `email` | Contact info | "alice@example.com" |
| `is_blocked` | Status toggle | Switch on/off, icon |
| `created_at` | Join date | "Mar 7, 2025" |
| `email_verified` | Verification badge | Checkmark if verified |

---

## Calculation Examples

### Total Revenue

```typescript
const totalRevenue = bookings
  .filter((b) => b.payment_status === "paid")    // Only paid bookings
  .reduce((sum, b) => sum + b.total_amount, 0);  // Sum amounts

// Example: [840, 560, 1200] → 2600
```

### Pending Bookings

```typescript
const pendingBookings = bookings
  .filter((b) => b.booking_status === "pending") // Only pending
  .length;

// Example: 2 pending out of 10 total
```

### Recent Bookings

```typescript
const recent = bookings
  .sort((a, b) => 
    new Date(b.created_at).getTime() - 
    new Date(a.created_at).getTime()
  )
  .slice(0, 5);  // Last 5
```

### Bookings by Hotel

```typescript
const hotelBookings = bookings.filter(
  (b) => b.room_id in hotelRooms  // Or join with room data
);

// Used to calculate hotel-specific metrics
```

### Cities from Hotels

```typescript
const cities = [...new Set(
  hotels
    .map((h) => h.city)
    .filter(Boolean)  // Remove nulls
)];

// Creates unique list: ["Dhaka", "Cox's Bazar", "Sylhet"]
```

---

## API Filter Parameters

### Hotels Endpoint
```
GET /api/hotels?page=1&limit=100&city=Dhaka&approval_status=PUBLISHED&hotel_type=5-Star

Parameters:
- page: number (default: 1)
- limit: number (default: 10, max: 100)
- city: string (optional)
- approval_status: string (DRAFT|PUBLISHED|PENDING|REJECTED)
- hotel_type: string (optional)
```

### Bookings Endpoint
```
GET /api/bookings?page=1&limit=100&booking_status=confirmed&payment_status=paid

Parameters:
- page: number (default: 1)
- limit: number (default: 10, max: 100)
- booking_status: string (pending|confirmed|cancelled)
- payment_status: string (paid|unpaid|refunded)
```

### End Users Endpoint
```
GET /api/end-users?page=1&limit=100

Parameters:
- page: number (default: 1)
- limit: number (default: 10, max: 100)
```

---

## Error Response Format

All endpoints return errors in this format:

```json
{
  "success": false,
  "message": "Error description",
  "data": null
}
```

Example:
```json
{
  "success": false,
  "message": "Hotel not found",
  "data": null
}
```

---

## Timestamp Formatting

Backend sends ISO 8601 format, frontend converts:

```typescript
const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

// "2025-03-07T10:30:00.000Z" → "Mar 7, 2025"
```

---

## Hotel Type to Emoji Mapping

```typescript
const getHotelEmoji = (hotelType: string | null) => {
  const map: Record<string, string> = {
    "5-star luxury": "🏨",
    "resort": "🏖️",
    "boutique": "🏛️",
    "heritage hotel": "🏛️",
    "business hotel": "🏢",
    "budget hotel": "🛏️",
  };
  return map[hotelType?.toLowerCase() || ""] || "🏨";
};

// "5-Star Luxury" → "🏨"
// "Resort" → "🏖️"
```

---

## Status Badge Colors

### Approval Status
- `DRAFT` → Gray/secondary
- `PUBLISHED` → Green/primary
- `PENDING` → Yellow/warning
- `REJECTED` → Red/destructive

### Booking Status
- `pending` → Orange/warning
- `confirmed` → Green/primary
- `cancelled` → Red/destructive

### Payment Status
- `paid` → Green/primary
- `unpaid` → Yellow/warning
- `refunded` → Blue/info
