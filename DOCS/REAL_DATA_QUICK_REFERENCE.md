# Quick Reference: Real Data Integration

## API Response Structure
The backend API returns responses in this format:

```typescript
// Hotels Response
{
  success: true,
  message: "Hotels retrieved successfully",
  data: {
    hotels: [
      {
        hotel_id: 7,
        name: "Grand Stay Hotel",
        email: "contact@grandstay.com",
        city: "Dhaka",
        hotel_type: "5-Star Luxury",
        star_rating: 5,
        approval_status: "PUBLISHED",
        ...
      }
    ],
    total: 11,
    skip: 0,
    take: 10
  }
}

// Bookings Response
{
  success: true,
  message: "Bookings retrieved successfully",
  data: {
    bookings: [
      {
        booking_id: 1,
        room_id: 5,
        end_user_id: 10,
        check_in_date: "2025-02-15",
        check_out_date: "2025-02-18",
        total_amount: 840,
        booking_status: "confirmed",
        payment_status: "paid",
        ...
      }
    ],
    total: 0,
    skip: 0,
    take: 10
  }
}
```

## Service Usage Examples

### Fetch Hotels
```typescript
import { fetchHotels } from '@/services/adminApi';

const hotels = await fetchHotels({ 
  limit: 100,
  city: "Dhaka",
  approval_status: "PUBLISHED"
});
```

### Fetch Bookings
```typescript
import { fetchBookings } from '@/services/adminApi';

const bookings = await fetchBookings({ 
  limit: 50,
  booking_status: "confirmed",
  payment_status: "paid"
});
```

### Fetch End Users
```typescript
import { fetchEndUsers } from '@/services/adminApi';

const users = await fetchEndUsers({ 
  limit: 100 
});
```

### Get Dashboard Stats
```typescript
import { getDashboardStats } from '@/services/adminApi';

const stats = await getDashboardStats();
// Returns: {
//   totalRevenue: number,
//   totalBookings: number,
//   pendingBookings: number,
//   totalProperties: number,
//   publishedProperties: number,
//   hotels: HotelResponse[],
//   bookings: BookingResponse[]
// }
```

## Component Usage Pattern

```typescript
import { fetchHotels, HotelResponse } from '@/services/adminApi';

const MyComponent = () => {
  const [hotels, setHotels] = useState<HotelResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        const data = await fetchHotels({ limit: 100 });
        setHotels(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load");
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, []);

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  
  return (
    <div>
      {hotels.map(hotel => (
        <div key={hotel.hotel_id}>{hotel.name}</div>
      ))}
    </div>
  );
};
```

## Available Data Fields

### HotelResponse
```typescript
hotel_id: number
name: string
email: string | null
address: string | null
city: string | null
hotel_type: string | null
owner_name: string | null
description: string | null
star_rating: number | null
approval_status: string // "DRAFT", "PUBLISHED", "REJECTED"
created_at: string
updated_at: string
```

### BookingResponse
```typescript
booking_id: number
room_id: number
end_user_id: number
check_in_date: string
check_out_date: string
total_amount: number
booking_status: string // "confirmed", "pending", "cancelled"
payment_status: string // "paid", "unpaid", "refunded"
created_at: string
updated_at: string
```

### EndUserResponse
```typescript
end_user_id: number
email: string
name: string | null
is_blocked: boolean
deleted_at: string | null
created_at: string
```

## Browser Console Debugging

Look for these logs to verify data flow:

```javascript
// When hotels are fetched
"Fetch Hotels Response: {...}"

// When bookings are fetched
"Fetch Bookings Response: {...}"

// If there's a structure issue
"Hotels response is not an array: {...}"
```

## Common Issues & Solutions

### Issue: "hotels.map is not a function"
**Cause:** API response format differs from expected
**Solution:** Service now checks for nested structure (`response.data.hotels`)

### Issue: Empty dashboard despite hotels in database
**Cause:** API endpoint not returning data
**Solution:** Check backend terminal, ensure `/api/hotels` endpoint is working
```bash
curl http://localhost:3000/api/hotels
```

### Issue: Loading state never clears
**Cause:** Promise not resolving
**Solution:** Check browser console for errors, verify API response includes `success: true`

## Testing Checklist

- [ ] Backend running on http://localhost:3000
- [ ] Frontend running on http://localhost:8080
- [ ] Login works with admin@myhotels.com / admin123
- [ ] Dashboard displays hotel count
- [ ] Dashboard displays booking count
- [ ] Recent bookings table shows real data
- [ ] Current Hotels page displays all hotels
- [ ] Hotel filters (city, type, stars) work
- [ ] Client list shows users from database

## Performance Tips

1. **Limit Data:** Use `limit` parameter to reduce API payload
   ```typescript
   fetchHotels({ limit: 100 }) // Not 10000
   ```

2. **Filter on Backend:** Let API filter instead of filtering in component
   ```typescript
   // Good - API filters
   fetchHotels({ city: "Dhaka" })
   
   // Bad - Component filters
   hotels.filter(h => h.city === "Dhaka")
   ```

3. **Batch Requests:** Load related data in parallel
   ```typescript
   const [hotels, bookings] = await Promise.all([
     fetchHotels(),
     fetchBookings()
   ]);
   ```

4. **Memoize Calculations:** Use useMemo for derived data
   ```typescript
   const topHotels = useMemo(() => 
     hotels.sort(...).slice(0, 5),
     [hotels]
   );
   ```
