# Phase 1 — Foundation Build Guide
## MyHotels Backend — Complete Setup with Decisions

**Build Date:** March 7, 2026  
**Status:** Building  
**Database:** MySQL (`myhotels_db_final`)  

---

## 📋 Configuration Decisions Made

| Setting | Value | Purpose |
|---------|-------|---------|
| JWT Secret | `SUPER_SECRET_KEY_123` | Signing JWT tokens |
| PORT | `3000` | Backend server port |
| NODE_ENV | `development` | Development environment |
| JWT Expires | `7d` | Token validity period |
| Log Level | `debug` | Show all logs |
| Response Format | `{ success, message, data }` | Standard success response |
| Error Format | `{ error, message, data }` | Standard error response |
| Timezone | SKIP | Not needed for MVP |
| Database | Already created | `myhotels_db_final` with schema |

---

## 🎯 Build Sequence

### Step 1: Update .env file ✅
### Step 2-3: Create config files (env.ts, prisma.ts)
### Step 4: Create type definitions (global.d.ts)
### Step 5-10: Create utility functions (password, token, booking, date, pagination, logger)
### Step 11-13: Create middleware (auth, role, error)
### Step 14-16: Create app, routes, server
### Step 17: Create seed data
### Step 18: Test Phase 1 ✅

---

## 📁 File Organization

```
backend/
├── .env                          ← Already exists, will update
├── src/
│   ├── config/
│   │   ├── env.ts               ← Load .env with types
│   │   └── prisma.ts            ← Singleton PrismaClient
│   ├── types/
│   │   └── global.d.ts          ← JWT, ActorRole types
│   ├── utils/
│   │   ├── password.ts          ← hashPassword, comparePassword (stubs)
│   │   ├── token.ts             ← generateToken, verifyToken
│   │   ├── bookingReference.ts  ← generateBookingReference
│   │   ├── date.ts              ← calculateNights, datesOverlap
│   │   ├── pagination.ts        ← parsePagination
│   │   └── logger.ts            ← logger.info, .warn, .error
│   ├── middlewares/
│   │   ├── auth.middleware.ts   ← JWT verification
│   │   ├── role.middleware.ts   ← Role-based access control
│   │   └── error.middleware.ts  ← Global error handler
│   ├── app.ts                   ← Express app initialization
│   ├── routes.ts                ← Central route aggregator
│   └── server.ts                ← Server startup
├── prisma/
│   ├── schema.prisma            ← Already exists (591 lines)
│   └── seed.ts                  ← Demo data seeding
└── package.json                 ← Already has dependencies
```

---

## ✅ Build Status

- [ ] Step 1: Update .env
- [ ] Step 2: Create src/config/env.ts
- [ ] Step 3: Create src/config/prisma.ts
- [ ] Step 4: Create src/types/global.d.ts
- [ ] Step 5: Create src/utils/password.ts
- [ ] Step 6: Create src/utils/token.ts
- [ ] Step 7: Create src/utils/bookingReference.ts
- [ ] Step 8: Create src/utils/date.ts
- [ ] Step 9: Create src/utils/pagination.ts
- [ ] Step 10: Create src/utils/logger.ts
- [ ] Step 11: Create src/middlewares/auth.middleware.ts
- [ ] Step 12: Create src/middlewares/role.middleware.ts
- [ ] Step 13: Create src/middlewares/error.middleware.ts
- [ ] Step 14: Create src/app.ts
- [ ] Step 15: Create src/routes.ts
- [ ] Step 16: Create src/server.ts
- [ ] Step 17: Create prisma/seed.ts
- [ ] Step 18: Test & Verify

---

## 🚀 Ready to Build

See individual file guides in this folder for detailed implementation.

