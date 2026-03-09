# Phase 1 — File-by-File Reference

This document provides complete details for every file created in Phase 1.

---

## 📁 src/config/env.ts

**Purpose:** Load and validate environment variables at application startup

**Key Function:**
```typescript
getEnvVariable(key: string, defaultValue?: string): string
```

**Environment Variables Defined:**
- `DATABASE_URL` (required)
- `JWT_SECRET` (required)
- `JWT_EXPIRES_IN` (required)
- `PORT` (required)
- `NODE_ENV` (required)
- `LOG_LEVEL` (required)

**Usage:**
```typescript
import { env } from "@/config/env";

console.log(env.PORT);        // "3000"
console.log(env.JWT_SECRET);  // "SUPER_SECRET_KEY_123"
```

**Startup Behavior:**
- App crashes with clear error if any required variable is missing
- All variables are strings (parse to numbers in respective modules)
- Allows development without .env.example (all defaults provided)

---

## 📁 src/config/prisma.ts

**Purpose:** Singleton PrismaClient instance (prevents multiple DB connections)

**Key Pattern:**
```typescript
// Prevents multiple instances in development
const globalForPrisma = global as unknown as { prisma?: PrismaClient };
if (!globalForPrisma.prisma) {
  globalForPrisma.prisma = new PrismaClient({
    log: NODE_ENV === "development" ? ["query"] : [],
  });
}
```

**Features:**
- Single instance reused across entire app
- Query logging in development (shows all SQL)
- No query logging in production
- Prevents "Cannot overwrite \`PrismaClient\`" error

**Usage:**
```typescript
import { prisma } from "@/config/prisma";

const admin = await prisma.system_admins.findUnique({
  where: { id: 1 }
});
```

---

## 📁 src/types/global.d.ts

**Purpose:** Global TypeScript type definitions

**Types Exported:**

### ActorRole (enum-like)
```typescript
type ActorRole = 
  | "SYSTEM_ADMIN" 
  | "HOTEL_ADMIN" 
  | "HOTEL_SUB_ADMIN" 
  | "END_USER";
```

### JwtPayload (interface)
```typescript
interface JwtPayload {
  id: number;
  role: ActorRole;
  hotel_id?: number;
  iat?: number;      // Added by jwt.sign()
  exp?: number;      // Added by jwt.sign()
}
```

### Express Request Extension
```typescript
declare global {
  namespace Express {
    interface Request {
      actor?: JwtPayload;
    }
  }
}
```

**Why global.d.ts?**
- Avoid repeating imports in every file
- Types available globally without explicit import
- Express Request extended automatically

---

## 📁 src/utils/password.ts

**Purpose:** Password hashing and verification (stubbed for Phase 1, implemented in Phase 11)

**Current Behavior (Development Only):**
```typescript
hashPassword(plain: string): string {
  // TODO: Phase 11 - Replace with bcrypt.hash()
  return plain;  // Just returns plaintext
}

comparePassword(plain: string, hash: string): boolean {
  // TODO: Phase 11 - Replace with bcrypt.compare()
  return plain === hash;  // Just compares strings
}
```

**Phase 11 Implementation:**
```typescript
// Will become:
import bcryptjs from "bcryptjs";

async function hashPassword(plain: string): Promise<string> {
  const salt = await bcryptjs.genSalt(10);
  return bcryptjs.hash(plain, salt);
}

async function comparePassword(plain: string, hash: string): Promise<boolean> {
  return bcryptjs.compare(plain, hash);
}
```

**Why Stub Now?**
- Password hashing is isolated to this one file
- Phase 1-10 can use plaintext safely (dev environment)
- Phase 11 is a single-file change
- No need to refactor entire auth flow later

**Usage Pattern:**
```typescript
import { hashPassword, comparePassword } from "@/utils/password";

// Will work identically in Phase 1 and Phase 11
const hashed = await hashPassword("user123");
const isMatch = await comparePassword("user123", hashed);
```

---

## 📁 src/utils/token.ts

**Purpose:** JWT generation, verification, and extraction

**Functions:**

### generateToken(payload: JwtPayload): string
```typescript
// Creates signed JWT that expires in JWT_EXPIRES_IN
// Payload: { id, role, hotel_id }
// Signing algorithm: HS256 (HMAC with SHA-256)
// Key: JWT_SECRET from environment

const token = generateToken({ id: 1, role: "SYSTEM_ADMIN" });
// Returns: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

### verifyToken(token: string): JwtPayload
```typescript
// Verifies signature and expiration
// Returns decoded payload or throws error

try {
  const payload = verifyToken(token);
  console.log(payload.id, payload.role);
} catch (err) {
  // "jwt malformed"
  // "invalid signature"
  // "jwt expired"
}
```

### extractToken(authHeader?: string): string | null
```typescript
// Strips "Bearer " prefix from Authorization header
// Returns token or null

const token = extractToken("Bearer eyJhb...");
// Returns: "eyJhb..."

const none = extractToken("Invalid format");
// Returns: null
```

**JWT Claims:**
```typescript
{
  id: 1,           // User ID from database
  role: "SYSTEM_ADMIN",
  hotel_id: null,  // Only for HOTEL_ADMIN, HOTEL_SUB_ADMIN
  iat: 1709881234,  // Issued at (added by jwt.sign)
  exp: 1710486034   // Expires at = now + 7 days
}
```

**Token Expiration:**
- Set via `JWT_EXPIRES_IN` in .env (currently "7d")
- Checked every request by auth.middleware
- If expired, returns 401 "Token has expired"

---

## 📁 src/utils/bookingReference.ts

**Purpose:** Generate unique booking reference codes

**Function:**
```typescript
generateBookingReference(): string
```

**Format:** `BK-YYYYMMDD-XXXXXX`
- Example: `BK-20250307-A3F9K2`
- Prefix: "BK-"
- Date: Current date (YYYYMMDD)
- Random: 6 alphanumeric characters

**Uniqueness:**
- Not cryptographically random (not for security)
- Statistically unique (extremely low collision)
- Human-readable and shareable

**Usage:**
```typescript
const booking = await prisma.bookings.create({
  data: {
    booking_reference: generateBookingReference(),
    user_id: 1,
    hotel_id: 1,
    // ... other fields
  }
});
```

**Database:**
- Stored in `bookings.booking_reference` column
- Should be marked UNIQUE in schema
- Returned to user for reference

---

## 📁 src/utils/date.ts

**Purpose:** Date calculations and overlap detection

**Functions:**

### calculateNights(checkIn: Date, checkOut: Date): number
```typescript
// Returns number of nights between dates
// checkOut - checkIn in milliseconds / milliseconds per day

const nights = calculateNights(
  new Date("2025-03-08"),
  new Date("2025-03-11")
);
// Returns: 3

// Used in:
// - Room availability queries
// - Pricing calculations
// - Booking duration
```

### datesOverlap(aIn: Date, aOut: Date, bIn: Date, bOut: Date): boolean
```typescript
// Checks if date ranges overlap
// Overlap = (aIn < bOut && bIn < aOut)

const overlap = datesOverlap(
  new Date("2025-03-08"),  // checkIn A
  new Date("2025-03-11"),  // checkOut A
  new Date("2025-03-10"),  // checkIn B
  new Date("2025-03-13")   // checkOut B
);
// Returns: true (overlaps 3/10 to 3/11)

// Used in:
// - Room availability queries
// - Preventing double-bookings
// - Finding conflicting bookings
```

**Example Query:**
```typescript
// Find all bookings that overlap with requested dates
const conflicts = await prisma.bookings.findMany({
  where: {
    room_id: roomId,
    AND: [
      { check_in_date: { lt: checkOut } },
      { check_out_date: { gt: checkIn } }
    ]
  }
});
```

---

## 📁 src/utils/pagination.ts

**Purpose:** Parse pagination parameters from query string

**Function:**
```typescript
parsePagination(query: Record<string, any>): {
  page: number;
  limit: number;
  skip: number;
}
```

**Defaults:**
- `page`: 1 (first page)
- `limit`: 10 (results per page)
- `max_limit`: 100 (never return more)

**Calculation:**
```typescript
skip = (page - 1) * limit
// Page 1, limit 10: skip = 0 (results 0-9)
// Page 2, limit 10: skip = 10 (results 10-19)
// Page 3, limit 20: skip = 40 (results 40-59)
```

**Usage:**
```typescript
const { page, limit, skip } = parsePagination(req.query);

const hotels = await prisma.hotels.findMany({
  skip,
  take: limit,
  orderBy: { created_at: "desc" }
});

const total = await prisma.hotels.count();
const pages = Math.ceil(total / limit);
```

**Response:**
```json
{
  "data": [ ... ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 150,
    "pages": 15
  }
}
```

---

## 📁 src/utils/logger.ts

**Purpose:** Centralized logging with timestamps and levels

**Logger Methods:**
```typescript
logger.debug(message: string, metadata?: any)
logger.info(message: string, metadata?: any)
logger.warn(message: string, metadata?: any)
logger.error(message: string, metadata?: any)
```

**Output Format:**
```
[2025-03-07T10:30:45.123Z] [DEBUG] GET /api { path: "/api" }
[2025-03-07T10:30:46.456Z] [INFO] ✅ Server started successfully
[2025-03-07T10:30:47.789Z] [WARN] Slow query: 2543ms
[2025-03-07T10:30:48.101Z] [ERROR] Database connection failed
  Error: connect ECONNREFUSED
  at ...
```

**Features:**
- Timestamps on every log
- Level-based filtering (only shows logs >= LOG_LEVEL)
- Error stack traces included
- Metadata object support

**Log Levels (lowest → highest):**
1. DEBUG (show all)
2. INFO (skip debug)
3. WARN (skip debug & info)
4. ERROR (only errors)

**Usage in Code:**
```typescript
// Debugging
logger.debug("Parsed token", { payload: decodedToken });

// Informational
logger.info("✅ Server started successfully");

// Warnings
logger.warn("Rate limit approaching", { remaining: 5 });

// Errors
logger.error("Failed to hash password", new Error("bcrypt failed"));
```

**Future Migration:**
Currently uses console.log. Can replace with Winston or Pino:
```typescript
// Just update src/utils/logger.ts
import winston from "winston";
const logger = winston.createLogger({...});
```

All other files continue working unchanged.

---

## 📁 src/middlewares/auth.middleware.ts

**Purpose:** Verify JWT tokens and enforce authentication

**Middleware Function:**
```typescript
authenticate(req: Request, res: Response, next: NextFunction): Promise<void>
```

**Workflow:**
1. Extract Authorization header
2. Verify format: "Bearer <token>"
3. Verify JWT signature using JWT_SECRET
4. Check token expiration
5. Check if token is blacklisted (user logged out)
6. Set `req.actor` with decoded payload
7. Call `next()` or return 401

**Error Codes:**
- `NO_AUTH_HEADER` → Missing Authorization header (401)
- `INVALID_BEARER` → Wrong format (not "Bearer ...") (401)
- `INVALID_TOKEN` → JWT invalid/expired/malformed (401)
- `TOKEN_REVOKED` → Token in blacklist table (401)

**Blacklist Check:**
```typescript
// Looks up token hash in blacklisted_tokens table
const hash = crypto.createHash("sha256").update(token).digest("hex");
const isBlacklisted = await prisma.blacklisted_tokens.findUnique({
  where: { token_hash: hash }
});
```

Uses hash for security (don't store raw tokens).

**Response on Failure:**
```json
{
  "success": false,
  "message": "Unauthorized",
  "error": { "code": "INVALID_TOKEN" }
}
```

**Usage:**
```typescript
// In routes.ts
router.get("/api/admin/dashboard", authenticate, adminDashboard);

// In controller
async function adminDashboard(req: Request, res: Response) {
  console.log(req.actor.id);     // ✅ Available
  console.log(req.actor.role);   // "SYSTEM_ADMIN"
  // ...
}
```

---

## 📁 src/middlewares/role.middleware.ts

**Purpose:** Enforce role-based access control

**Factory Function:**
```typescript
requireRole(...roles: ActorRole[]): Middleware
```

Returns middleware that checks if `req.actor.role` is in allowed list.

**Provided Shortcuts:**
```typescript
systemAdminOnly       // requireRole("SYSTEM_ADMIN")
hotelAdminOnly        // requireRole("HOTEL_ADMIN")
hotelSubAdminOnly     // requireRole("HOTEL_SUB_ADMIN")
hotelStaffOnly        // requireRole("HOTEL_ADMIN", "HOTEL_SUB_ADMIN")
endUserOnly           // requireRole("END_USER")
```

**Workflow:**
1. Check if `req.actor` exists (should be set by auth middleware)
2. Check if `req.actor.role` in allowed roles list
3. If yes → call `next()`
4. If no → return 403 "Insufficient permissions"

**Error Code:**
```json
{
  "success": false,
  "message": "Insufficient permissions",
  "error": { "code": "INSUFFICIENT_PERMISSION" }
}
```

**Usage:**
```typescript
router.post(
  "/api/admin/users",
  authenticate,           // ← Check JWT valid
  systemAdminOnly,        // ← Check role is SYSTEM_ADMIN
  createUserController    // ← Handle request
);
```

**Stack Order Matters:**
```typescript
// ✅ CORRECT
router.post("/endpoint", authenticate, systemAdminOnly, handler);

// ❌ WRONG
router.post("/endpoint", systemAdminOnly, authenticate, handler);
// Would check role before verifying JWT exists!
```

---

## 📁 src/middlewares/error.middleware.ts

**Purpose:** Catch all unhandled errors and format responses

**Error Handler Function:**
```typescript
errorHandler(err: any, req: Request, res: Response, next: NextFunction): void
```

**CRITICAL:** Must have 4 parameters for Express to recognize as error handler.

**AppError Class:**
```typescript
class AppError extends Error {
  constructor(
    message: string,
    statusCode: number = 500,
    code: string = "INTERNAL_ERROR",
    details?: any
  )
}

// Usage
throw new AppError(
  "Email already exists",
  409,
  "EMAIL_DUPLICATE",
  { email: "user@example.com" }
);
```

**Workflow:**
1. Check if error is AppError instance
2. If yes → use status/code/message from error
3. If no → use status 500, code "INTERNAL_ERROR"
4. Log error with full stack trace
5. Send JSON response
6. Include status code in response

**Response Format:**
```json
{
  "success": false,
  "message": "Email already exists",
  "error": {
    "code": "EMAIL_DUPLICATE",
    "details": { "email": "user@example.com" }
  }
}
```

**Placement in App:**
```typescript
// In app.ts
app.use(jsonParser);
app.use(cors);
app.use(routes);
app.use(notFoundHandler);      // ← Must be before error handler
app.use(errorHandler);          // ← MUST BE LAST middleware
```

**Usage in Controllers:**
```typescript
async function createUser(req: Request, res: Response, next: NextFunction) {
  try {
    const { email } = req.body;
    const exists = await prisma.system_admins.findUnique({
      where: { email }
    });
    if (exists) {
      throw new AppError(
        "Email already exists",
        409,
        "EMAIL_DUPLICATE"
      );
    }
  } catch (err) {
    next(err);  // ← Passes to error middleware
  }
}
```

---

## 📁 src/app.ts

**Purpose:** Express application initialization and middleware configuration

**Middleware Stack (in order):**
```typescript
express.json()           // Parse JSON body
cors()                   // Enable CORS
requestLogger            // Log every request
router                   // All routes
notFoundHandler          // 404 for undefined routes
errorHandler             // Catch errors (LAST!)
```

**CORS Configuration:**
```typescript
// Development: Allow all origins
cors({ origin: "*" })

// Production: Restrict to specific domain
cors({ origin: "https://myhotels.com" })
```

**Health Endpoint:**
```
GET /health

Response:
{
  "success": true,
  "message": "Server is running",
  "data": {
    "timestamp": "2025-03-07T10:30:45.123Z",
    "uptime": 42.5
  }
}
```

**404 Handler:**
```typescript
app.use((req, res, next) => {
  next(new AppError("Route not found", 404, "NOT_FOUND"));
});
```

Triggers error handler for consistency.

---

## 📁 src/routes.ts

**Purpose:** Central aggregator for all API routes

**Current Structure:**
```typescript
const router = express.Router();

// Health check (no auth required)
router.get("/health", (req, res) => { ... });

// API root endpoint
router.get("/api", (req, res) => { ... });

export { router };
```

**Ready for Phase 2+:**
```typescript
// Phase 2 will add:
import systemAdminAuthRouter from "@/modules/auth/systemAdmin/systemAdmin.auth.routes";
router.use("/api/auth/system-admin", systemAdminAuthRouter);

// Phase 3 will add:
import hotelAuthRouter from "@/modules/auth/hotelAdmin/hotel.auth.routes";
router.use("/api/auth/hotel", hotelAuthRouter);

// Phase 4 will add:
import endUserAuthRouter from "@/modules/auth/endUser/endUser.auth.routes";
router.use("/api/auth/end-user", endUserAuthRouter);
```

No changes needed to Phase 1 files when adding phase routers!

---

## 📁 src/server.ts

**Purpose:** Start Express server and handle graceful shutdown

**Startup Sequence:**
```typescript
1. Validate environment (env.ts)
2. Check database connection (prisma.ts)
3. Start Express app (app.ts)
4. Listen on PORT
5. Log startup info
6. Register shutdown handlers
```

**Shutdown Handlers:**
```typescript
// SIGTERM: Graceful shutdown (e.g., Docker, systemd)
process.on("SIGTERM", async () => {
  console.log("SIGTERM received, shutting down gracefully...");
  await prisma.$disconnect();
  process.exit(0);
});

// SIGINT: Ctrl+C in terminal
process.on("SIGINT", async () => {
  console.log("SIGINT received, shutting down gracefully...");
  await prisma.$disconnect();
  process.exit(0);
});
```

**Unhandled Errors:**
```typescript
process.on("unhandledRejection", (reason, promise) => {
  logger.error("Unhandled Rejection", { promise, reason });
});

process.on("uncaughtException", (error) => {
  logger.error("Uncaught Exception", error);
  process.exit(1);  // Exit on fatal error
});
```

**Startup Output:**
```
✅ Server started successfully
   port: 3000
   node_env: development
   database: myhotels_db_final

🌐 API is running at:
   base_url: http://localhost:3000
   api_root: http://localhost:3000/api
   health_check: http://localhost:3000/health

[DEBUG] Express listening on port 3000
```

---

## 📁 prisma/seed.ts

**Purpose:** Populate database with demo data on initial setup

**Data Created:**

### Roles
```
HOTEL_ADMIN (id: 1) - Hotel ownership/management
HOTEL_SUB_ADMIN (id: 2) - Hotel staff with limited access
SYSTEM_ADMIN (created at login) - Platform admin
END_USER (created at login) - Customer/guest
```

### Demo System Admin
```
email: admin@myhotels.com
password: admin123 (plaintext, for testing only)
role: SYSTEM_ADMIN
status: ACTIVE
```

### Demo Admin Details
```
first_name: Admin
last_name: User
phone: +1234567890
country: Global
city: Admin City
```

**Execution:**
```bash
npx prisma db seed
```

**Idempotency:**
Uses `upsert` operations, so safe to run multiple times.

---

## ✅ Phase 1 Complete!

All 17 files are created, tested, and ready for Phase 2.

