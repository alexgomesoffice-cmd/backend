# Phase 1 — Architecture & Key Decisions

This document explains WHY we built Phase 1 this way and WHAT we decided.

---

## 🏗️ Architecture Overview

### Three-Layer Design

```
Express App (app.ts)
    ↓
Routes (routes.ts)
    ↓
Middleware Layer
  ├─ JWT Auth (auth.middleware.ts)
  ├─ Role Check (role.middleware.ts)
  └─ Error Handling (error.middleware.ts)
    ↓
Controllers (will add in Phase 2+)
    ↓
Services (will add in Phase 2+)
    ↓
Database (prisma)
```

### Why This Structure?

**Separation of Concerns:**
- Middleware handles cross-cutting concerns (auth, errors, logging)
- Controllers handle HTTP request/response
- Services handle business logic
- Database layer isolated from business logic

**Testability:**
- Each layer can be tested independently
- Mock Prisma for unit tests
- Mock Request/Response for middleware tests

**Reusability:**
- Middleware can be applied to multiple routes
- Same database logic used across controllers
- Same error handler catches errors everywhere

---

## 🔐 Security Decisions

### 1. JWT Tokens

**Decision:** HS256 with 7-day expiration

**Why?**
- Stateless authentication (no session table)
- Scales to millions of users without session memory
- 7 days balances security and UX

**Trade-offs:**
- ❌ Can't revoke tokens immediately (that's why we have blacklist)
- ✅ Cheaper to verify (no DB lookup on every request)
- ✅ Standard industry practice

### 2. Token Blacklist

**Decision:** Check blacklisted_tokens table on every auth request

**Why?**
- Allows instant logout (even though JWT is valid)
- User logs out → token added to blacklist
- Next request with that token → 401

**Trade-off:**
- Slightly slower (one DB query per auth request)
- But security is worth it

### 3. Password Hashing Delayed

**Decision:** Stubs now, bcrypt.js in Phase 11

**Why?**
- Keeps auth logic working in Phase 1-10
- Single file to change (password.ts)
- Test system can use plaintext (security OK for dev)
- No refactoring 10 phases of code later

**Risk Mitigation:**
- Runs on localhost only (dev environment)
- Admin@myhotels.com with admin123 is demo data
- Phase 11 implementation is straightforward

### 4. JWT Secret in Code

**Decision:** SUPER_SECRET_KEY_123 in .env

**Why?**
- Development environment (not production)
- .env is in .gitignore (not committed)
- Good enough for localhost testing

**Production Changes Needed:**
```env
# .env.production
JWT_SECRET="<use_actual_random_secret_from_environment_management>"
```

---

## 🗂️ File Organization Decisions

### Why src/ folder structure?

```
src/
  ├── config/       ← Configuration management
  ├── types/        ← TypeScript definitions
  ├── utils/        ← Reusable functions
  ├── middlewares/  ← Express middleware
  └── modules/      ← Will add in Phase 2+
      ├── auth/
      │   ├── systemAdmin/
      │   ├── hotelAdmin/
      │   └── endUser/
      ├── hotels/
      ├── rooms/
      └── bookings/
```

**Why this structure?**

- **config/** Centralizes environment and database setup
- **types/** One place to find all TypeScript definitions
- **utils/** Pure functions (passwords, tokens, dates, pagination, logging)
- **middlewares/** Request/response handling
- **modules/** Domain-driven design (each feature is a module)

**Each Module Pattern:**
```
systemAdmin/
  ├── systemAdmin.auth.validation.ts   ← Input validation
  ├── systemAdmin.auth.service.ts      ← Business logic
  ├── systemAdmin.auth.controller.ts   ← Request handling
  └── systemAdmin.auth.routes.ts       ← HTTP endpoints
```

Consistent naming makes it easy to find code.

---

## 🔧 Technology Choices

### Why Express.js?

**Chosen for:**
- Minimal, unopinionated framework
- Huge ecosystem (middleware, libraries)
- Easy to understand and debug
- Industry standard for Node.js backends

**Alternatives Considered:**
- NestJS: Too opinionated, overkill for initial build
- Fastify: Excellent, but smaller ecosystem
- Hono: Modern, but less backend-focused
- Bun: Runtime, not framework

### Why Prisma?

**Chosen for:**
- Type-safe database queries
- Auto-generated types from schema
- Easy migrations
- Supports MySQL perfectly

**Advantages for Team:**
- Schema-first design (design DB, code follows)
- No need to write raw SQL
- Built-in migration history
- Schema validation at compile-time

### Why MySQL?

**Chosen for:**
- Already decided and schema already created
- Reliable relational database
- Works perfectly for hotel booking domain
- Well-known by team

---

## 📝 Error Handling Strategy

### Error Flow

```
throw new AppError(message, statusCode, code, details)
    ↓
Next() passes to error middleware
    ↓
errorHandler catches and formats
    ↓
Send JSON response
    ↓
Client receives { success: false, error, message, data }
```

### Error Status Codes

| Status | Meaning | Example |
|--------|---------|---------|
| 400 | Bad request (client error) | Missing required field |
| 401 | Unauthorized (auth failed) | Invalid token |
| 403 | Forbidden (auth passed, no permission) | Admin endpoint, user not admin |
| 404 | Not found | Room doesn't exist |
| 409 | Conflict | Email already exists |
| 500 | Server error | Database crash |

### Why Consistent Error Format?

```json
{
  "success": false,
  "message": "Human-readable message for UI",
  "error": {
    "code": "CONSTANT_ERROR_CODE_FOR_FRONTEND",
    "details": { ... }
  },
  "data": null
}
```

**Benefits:**
- Frontend can show `error.code` in multiple languages
- Frontend can use `error.details` for field-level errors
- Consistent parsing across all endpoints
- Server can extend error object as needed

---

## 🔄 Request Lifecycle

### Every Request Goes Through

```
1. Express.json()          ← Parse JSON body
2. cors()                  ← Check CORS headers
3. requestLogger           ← Log request details
4. routes/endpoint         ← Find matching route
5. authenticate (if needed)← Verify JWT token
6. requireRole (if needed) ← Check permission
7. controller              ← Handle business logic
8. errorHandler            ← Catch any errors thrown
9. JSON response           ← Send result to client
```

### Example: Create Hotel (Admin Only)

```typescript
// Route definition
router.post(
  "/api/hotels",
  authenticate,      // ← Step 5: Verify JWT
  systemAdminOnly,   // ← Step 6: Check role = SYSTEM_ADMIN
  createHotel        // ← Step 7: Handle request
);

// Controller
async function createHotel(req: Request, res: Response, next: NextFunction) {
  try {
    // req.actor now available (set by authenticate)
    // req.actor.role checked to be SYSTEM_ADMIN (checked by systemAdminOnly)
    
    const hotel = await prisma.hotels.create({
      data: req.body
    });
    
    res.status(201).json({
      success: true,
      message: "Hotel created",
      data: hotel
    });
  } catch (err) {
    next(err);  // ← Step 8: Error handler catches
  }
}
```

---

## 🧪 Testing Strategy

### Unit Tests (Phase 1 Ready)

```typescript
// Test password utils (after Phase 11 bcrypt)
describe("password", () => {
  test("hashPassword creates hash", async () => {
    const hash = await hashPassword("test123");
    expect(hash).not.toBe("test123");
  });
});

// Test token generation
describe("token", () => {
  test("generateToken creates valid JWT", () => {
    const token = generateToken({ id: 1, role: "SYSTEM_ADMIN" });
    const payload = verifyToken(token);
    expect(payload.id).toBe(1);
  });
});

// Test pagination
describe("pagination", () => {
  test("parsePagination calculates skip correctly", () => {
    const { skip } = parsePagination({ page: 3, limit: 10 });
    expect(skip).toBe(20);
  });
});
```

### Integration Tests (Phase 2+)

```typescript
describe("System Admin Auth", () => {
  test("POST /api/auth/system-admin/login returns token", async () => {
    const res = await request(app)
      .post("/api/auth/system-admin/login")
      .send({ email: "admin@myhotels.com", password: "admin123" });
    
    expect(res.status).toBe(200);
    expect(res.body.data.token).toBeDefined();
  });
});
```

---

## 🚀 Scalability Decisions

### Current (Phase 1)

- Single database connection (Prisma singleton)
- All in-memory logging (not persistent)
- No caching
- No rate limiting

### Future Improvements (Post-Phase 20)

**Caching Layer:**
```typescript
// Add Redis for:
// - Token blacklist cache (faster lookups)
// - User sessions
// - Room availability cache
```

**Database:**
```typescript
// Replicas for read-heavy operations:
// - Hotel search, room listings
// - User bookings history
// - Reviews/ratings
```

**API Gateway:**
```typescript
// Rate limiting
// Request validation
// Load balancing
```

---

## 📊 Database Design Notes

### Why This Schema Structure?

```
system_admins
  ├─ System-level administrators
  ├─ One entry per admin
  └─ Can manage entire platform

system_admin_details
  ├─ Extended profile info
  ├─ One-to-one with system_admins
  └─ Keeps admin table lean

hotels
  ├─ Hotel listings
  ├─ Managed by hotel_admins
  └─ Multiple rooms per hotel

rooms
  ├─ Individual rooms
  ├─ Multiple per hotel
  └─ Bookable entities

bookings
  ├─ Guest reservations
  ├─ Links rooms to users
  └─ Tracks dates, status, prices

reviews
  ├─ Guest feedback
  ├─ For hotels or rooms
  └─ Supports ratings

cities & countries
  ├─ Reference data
  ├─ Normalized (no duplicates)
  └─ Used by hotels & users
```

### Relationships

```
SYSTEM_ADMIN (1) ──→ (1) SYSTEM_ADMIN_DETAILS
HOTEL (1) ──→ (N) ROOMS
ROOM (1) ──→ (N) BOOKINGS
USER (1) ──→ (N) BOOKINGS
HOTEL (1) ──→ (N) REVIEWS
ROOM (1) ──→ (N) REVIEWS
USER (1) ──→ (N) REVIEWS
```

All relationships are clean and normalized.

---

## 🎯 Phase Boundaries

### Why Build This Way?

Each phase builds on the previous:

```
Phase 1: Foundation      ← You are here
  ├─ Config, types, utils
  ├─ Auth middleware, error handling
  └─ Server startup

Phase 2: System Admin Auth
  ├─ Login endpoint
  ├─ Returns JWT token
  └─ Logout (token blacklist)

Phase 3: Hotel Admin Auth
  └─ Similar to Phase 2

Phase 4: End User Auth
  └─ Similar to Phase 2

Phase 5: Hotel Management
  ├─ Create hotel
  ├─ List hotels
  └─ Update hotel

... and so on
```

**Benefits:**
- Each phase is independent
- Can test each phase before moving to next
- Changes don't cascade backward
- Team can work on multiple phases in parallel

---

## ✅ What's NOT in Phase 1

**Intentionally Delayed:**
- ❌ Authentication endpoints (Phase 2)
- ❌ Hotel management (Phase 5)
- ❌ Room management (Phase 6)
- ❌ Booking system (Phase 7)
- ❌ Payment processing (Phase 9)
- ❌ Password hashing with bcrypt (Phase 11)
- ❌ Email verification (Phase 13)
- ❌ Rate limiting (Phase 19)

**Why delay?**
- Build solid foundation first
- Test foundation before adding features
- Easier to refactor foundation with empty tables
- Keep each phase focused and small

---

## 🔍 Code Quality Standards Applied

### Comments
- Every file has header comment
- Every function has JSDoc
- Complex logic has inline comments
- No over-commenting obvious code

### TypeScript
- No `any` types (except where forced)
- All imports typed correctly
- Strict mode enabled
- Path aliases for clean imports

### Error Handling
- Errors thrown as AppError
- Error codes are constants (not strings)
- Details object included for context
- Stack traces logged

### Logging
- Different levels (DEBUG, INFO, WARN, ERROR)
- Timestamps on all logs
- Metadata passed to logger
- Production can disable DEBUG logs

---

## 🎓 Learning Points for Team

### Middleware Pattern
- Order matters (authenticate before requireRole)
- 4-parameter function for Express error handler
- next(err) passes control to error handler

### Error Handling Pattern
- Try-catch in async functions
- Throw AppError for known errors
- Let unknown errors bubble up to errorHandler
- Always respond with JSON

### Environment Configuration
- Never hardcode secrets
- Validate at startup (fail fast)
- Different values for dev/prod
- Use .env files

### Database Queries
- Use Prisma types for autocomplete
- Handle null results
- Don't load unnecessary fields
- Use pagination for lists

---

## 📚 Documentation

All documentation is in `DOCS/` folder:

- **PHASE_1_BUILD_GUIDE.md** ← Overview & how to run
- **PHASE_1_FILE_BY_FILE_REFERENCE.md** ← Detailed file breakdown
- **PHASE_1_ARCHITECTURE_DECISIONS.md** ← This file

New team members should read all three.

---

## ✨ Ready for Phase 2!

Phase 1 foundation is solid and well-documented. No changes needed when building Phase 2.

