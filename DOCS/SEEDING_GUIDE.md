# Database Seeding Guide

## What is Seeding?

Seeding is the process of populating your database with initial demo/test data. This allows you to:
- Test authentication flows immediately without creating accounts manually
- Test admin functionalities without registration endpoints
- Have consistent test data across development environments

## Current Seeded Data

### System Admin
Created by seed for testing the system admin panel:
- **Email:** `admin@myhotels.com`
- **Password:** `admin123`
- **Role:** SYSTEM_ADMIN
- **Access:** Full admin dashboard at `/admin`

### Hotel Admin
Created by seed with a demo hotel:
- **Hotel:** Grand Stay Hotel
- **Email:** `manager@grandstay.com`
- **Password:** `hotel123`
- **Role:** HOTEL_ADMIN
- **Access:** Hotel admin dashboard at `/hotel-admin`

### Demo Hotel
A pre-created hotel for testing:
- **Name:** Grand Stay Hotel
- **Location:** Dhaka, Bangladesh
- **Status:** PUBLISHED (ready to use)

## How to Seed the Database

### Method 1: Using npm script (Recommended)
```bash
cd backend
npm run seed
```

### Method 2: Using Prisma directly
```bash
cd backend
npx prisma db seed
```

### Method 3: Manual with ts-node
```bash
cd backend
ts-node --esm prisma/seed.ts
```

## What Happens When You Seed?

1. **Roles are created/verified:**
   - HOTEL_ADMIN role
   - HOTEL_SUB_ADMIN role

2. **System Admin is created:**
   - Email: admin@myhotels.com
   - Password: admin123
   - Also creates admin profile details

3. **Demo Hotel is created:**
   - Name: Grand Stay Hotel
   - Status: PUBLISHED (approved)
   - Created and approved by the system admin

4. **Demo Hotel Admin is created:**
   - Email: manager@grandstay.com
   - Password: hotel123
   - Assigned to the Grand Stay Hotel

## Testing After Seeding

### Test System Admin Login
```bash
curl -X POST http://localhost:3000/api/auth/system-admin/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@myhotels.com",
    "password": "admin123"
  }'
```

Expected response:
```json
{
  "success": true,
  "data": {
    "token": "eyJ...",
    "admin": {
      "system_admin_id": 1,
      "name": "System Administrator",
      "email": "admin@myhotels.com"
    }
  }
}
```

### Test Hotel Admin Login
```bash
curl -X POST http://localhost:3000/api/auth/hotel-admin/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "manager@grandstay.com",
    "password": "hotel123"
  }'
```

Expected response:
```json
{
  "success": true,
  "data": {
    "token": "eyJ...",
    "admin": {
      "hotel_admin_id": 1,
      "name": "Hotel Manager",
      "email": "manager@grandstay.com",
      "hotel_id": 1
    }
  }
}
```

## Important Notes

### ⚠️ WARNING: Seeding Overwrites Data

The seed file uses **upsert** operations, which means:
- **If data doesn't exist:** It creates it
- **If data already exists:** It keeps it (doesn't overwrite)

However, to fully reset your database, run:
```bash
cd backend
npx prisma migrate reset --force
```

This will:
1. Drop and recreate the database
2. Re-run all migrations
3. Run the seed file automatically

### 🚨 CRITICAL: Never Seed Production!

The seed file contains **plain-text passwords** for testing only. Never:
- Use seed on production databases
- Commit production passwords to seed file
- Use demo credentials in production

### 📝 Why Admins Can't Self-Register

Admin accounts are created by the system:
1. **System Admin** - Created during initial database setup (seeding)
2. **Hotel Admin** - Created by system admin or super admin
3. **Hotel Sub Admin** - Created by hotel admin for their hotel

This is different from end users who can register via `/api/auth/end-user/register`.

## Customizing Seeds

To add more test data, edit `backend/prisma/seed.ts`:

```typescript
// Add more hotels
const hotel2 = await prisma.hotels.create({
  data: {
    name: "Another Hotel",
    email: "contact@another.com",
    // ... more fields
  }
});

// Add more hotel admins
const admin2 = await prisma.hotel_admins.create({
  data: {
    hotel_id: hotel2.hotel_id,
    name: "Another Manager",
    email: "manager@another.com",
    password: "password123",
    // ... more fields
  }
});
```

Then run `npm run seed` again to add the new data.

## Troubleshooting

### Seed fails with "Table doesn't exist"
- Run migrations first: `npx prisma migrate dev`

### Seed fails with "Unique constraint violation"
- The data already exists, which is expected
- Seed uses upsert, so it won't create duplicates

### Can't connect to database
- Check `.env` file has correct `DATABASE_URL`
- Make sure MySQL server is running
- Check connection string format

### Seed runs but no data appears
- Check database name in `.env`
- Verify you're connected to the right database
- Run: `npx prisma studio` to inspect the database

## Next Steps

1. ✅ Seed the database: `npm run seed`
2. ✅ Start backend: `npm run dev`
3. ✅ Start frontend: `npm run dev` (in grand-stay-connect folder)
4. ✅ Test login pages with seeded credentials
5. ✅ Navigate to `/admin` or `/hotel-admin` to test admin dashboards
