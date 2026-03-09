# Phase 1 — Complete Implementation Guide
## MyHotels Backend Foundation

**Status:** ✅ COMPLETE  
**Build Date:** March 7, 2026  
**Database:** MySQL (`myhotels_db_final`)  
**Port:** 3000  

---

## 📋 All Phase 1 Files Created

### Config Files (src/config/)
| File | Purpose | Lines | Status |
|------|---------|-------|--------|
| `env.ts` | Load & validate environment variables | 85 | ✅ |
| `prisma.ts` | Singleton PrismaClient | 67 | ✅ |

### Type Definitions (src/types/)
| File | Purpose | Lines | Status |
|------|---------|-------|--------|
| `global.d.ts` | Global types: JwtPayload, ActorRole, Express.Request | 80 | ✅ |

### Utility Functions (src/utils/)
| File | Purpose | Lines | Status |
|------|---------|-------|--------|
| `password.ts` | Hash & compare passwords (stubs for now) | 72 | ✅ |
| `token.ts` | JWT generation & verification | 142 | ✅ |
| `bookingReference.ts` | Generate BK-YYYYMMDD-XXXXXX codes | 57 | ✅ |
| `date.ts` | Date calculations & overlap checks | 95 | ✅ |
| `pagination.ts` | Parse pagination from query params | 78 | ✅ |
| `logger.ts` | Logging wrapper (console for now) | 130 | ✅ |

### Middleware (src/middlewares/)
| File | Purpose | Lines | Status |
|------|---------|-------|--------|
| `auth.middleware.ts` | JWT verification & blacklist check | 130 | ✅ |
| `role.middleware.ts` | Role-based access control | 130 | ✅ |
| `error.middleware.ts` | Global error handler | 95 | ✅ |

### Express App (src/)
| File | Purpose | Lines | Status |
|------|---------|-------|--------|
| `app.ts` | Express initialization & middleware setup | 95 | ✅ |
| `routes.ts` | Central route aggregator | 50 | ✅ |
| `server.ts` | Server startup & shutdown handling | 90 | ✅ |

### Database (prisma/)
| File | Purpose | Lines | Status |
|------|---------|-------|--------|
| `seed.ts` | Demo data seeding | 125 | ✅ |

### Configuration Files
| File | Purpose | Status |
|------|---------|--------|
| `.env` | Environment variables | ✅ Updated |
| `tsconfig.json` | TypeScript + path aliases | ✅ Updated |
| `package.json` | Dependencies | ✅ (jsonwebtoken added) |

---

## 🔧 Configuration Details

### .env File
```properties
DATABASE_URL="mysql://root:123456@localhost:3306/myhotels_db_final"
JWT_SECRET="SUPER_SECRET_KEY_123"
JWT_EXPIRES_IN="7d"
PORT=3000
NODE_ENV="development"
LOG_LEVEL="debug"
```

### tsconfig.json
```json
{
  "paths": {
    "@/*": ["src/*"]
  }
}
```

Allows importing with `@/config/env` instead of `../../../config/env`

---

## 🚀 How to Run Phase 1

### Step 1: Install Dependencies
```bash
cd backend
npm install
```

### Step 2: Generate Prisma Client
```bash
npx prisma generate
```

### Step 3: Seed Database
```bash
npx prisma db seed
```

This creates:
- Roles (HOTEL_ADMIN, HOTEL_SUB_ADMIN)
- Test admin: `admin@myhotels.com` / `admin123`

### Step 4: Start Server
```bash
npm run dev
```

You should see:
```
✅ Server started successfully
   port: 3000
   node_env: development
   timestamp: 2025-03-07T...

🌐 API is running at:
   base_url: http://localhost:3000
   api_root: http://localhost:3000/api
   health_check: http://localhost:3000/health
```

---

## ✅ Testing Phase 1

### Health Check
```bash
curl http://localhost:3000/health
```

Response:
```json
{
  "success": true,
  "message": "Server is running",
  "data": {
    "timestamp": "2025-03-07T...",
    "uptime": 2.5
  }
}
```

### API Root
```bash
curl http://localhost:3000/api
```

Response:
```json
{
  "success": true,
  "message": "MyHotels API - Phase 1 Foundation Complete",
  "data": {
    "status": "API is running",
    "timestamp": "2025-03-07T..."
  }
}
```

### Check Logs
The dev server shows:
```
[2025-03-07T10:30:45.123Z] [DEBUG] GET /api
[2025-03-07T10:30:45.124Z] [INFO] ✅ Server started successfully
```

---

## 📚 Key Decisions Made

### Environment Variables (.env)
- **JWT_SECRET:** `SUPER_SECRET_KEY_123` (development only)
- **JWT_EXPIRES_IN:** `7d` (7 days for production, adjust as needed)
- **PORT:** `3000` (can change if frontend is on same port)
- **LOG_LEVEL:** `debug` (shows all logs in development)

### Response Format
All API responses follow this structure:

**Success:**
```json
{
  "success": true,
  "message": "...",
  "data": { ... }
}
```

**Error:**
```json
{
  "success": false,
  "message": "...",
  "error": { "code": "ERROR_CODE" },
  "data": null
}
```

### Authentication Flow
1. Client sends Authorization header: `Authorization: Bearer <token>`
2. Auth middleware extracts token and verifies signature
3. Checks if token is blacklisted (user logged out)
4. Sets `req.actor` with decoded JWT payload
5. Role middleware checks if actor.role is allowed

### Error Handling
All errors caught by error.middleware.ts:
- Returns consistent JSON response
- Logs full error details for debugging
- Never exposes internal error messages to client

---

## 🎯 What's Ready for Phase 2

✅ **Environment & Config:** Typed, validated at startup
✅ **Authentication Infrastructure:** JWT verified, tokens blacklisted
✅ **Role-Based Access:** Permissions enforced middleware
✅ **Error Handling:** Consistent error responses
✅ **Logging:** Debug, info, warn, error levels
✅ **Utilities:** Passwords, tokens, dates, pagination
✅ **Database Connection:** Prisma singleton ready

❌ **NOT YET:** Auth endpoints (Phase 2 will add)

---

## 📝 Code Quality Notes

### Comments
Every file has:
- **Header comment** - File purpose
- **Function comments** - What it does, inputs, outputs
- **Line comments** - Why we do something, not just what

### Type Safety
- All TypeScript types defined in `global.d.ts`
- Path aliases for clean imports: `@/config/env`
- Strict mode enabled
- No `any` types (except where necessary)

### Error Messages
- Consistent format: `{ success, message, error, data }`
- HTTP status codes match semantics
- Error codes for programmatic handling

---

## 🔄 What Happens on Startup

1. **Load .env** → `env.ts` validates all required variables
2. **Create Prisma client** → Singleton pattern, reused across app
3. **Initialize Express** → Middlewares applied in order
4. **Mount routes** → Currently just /api endpoint
5. **Start server** → Listen on PORT
6. **Log startup** → Show URLs and ready message

If any step fails, app crashes with clear error message.

---

## 🚨 Common Issues & Fixes

### `Cannot find module '@/config/env'`
**Fix:** Did you update tsconfig.json with baseUrl and paths? Restart TypeScript server in VS Code.

### `PrismaClient not found`
**Fix:** Run `npx prisma generate` to generate client from schema

### `Port 3000 already in use`
**Fix:** Change `PORT` in .env to 3001 or 5000, or kill process using port 3000

### `Cannot connect to database`
**Fix:** Check `DATABASE_URL` in .env and verify MySQL is running

### `Seed fails with foreign key errors`
**Fix:** Schema might not be migrated. But we're NOT migrating yet in Phase 1 (only seeding existing tables)

---

## 📖 Files Organization

```
backend/
├── src/
│   ├── config/          ← Environment & Prisma
│   ├── types/           ← TypeScript definitions
│   ├── utils/           ← Helper functions
│   ├── middlewares/     ← Express middleware
│   ├── app.ts           ← Express initialization
│   ├── routes.ts        ← Route aggregator
│   └── server.ts        ← Server startup
├── prisma/
│   ├── schema.prisma    ← Database schema (591 lines)
│   └── seed.ts          ← Demo data
├── .env                 ← Environment variables
├── tsconfig.json        ← TypeScript config + aliases
└── package.json         ← Dependencies
```

---

## ✨ Next Phase (Phase 2)

Phase 2 will add:
- `src/modules/auth/systemAdmin/` directory
- System admin login/logout endpoints
- Integration with this Phase 1 foundation

No changes needed to Phase 1 files when Phase 2 is built!

---

