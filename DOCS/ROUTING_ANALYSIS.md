# Frontend ↔ Backend Routing Analysis
## Mismatches & Missing Pages

**Date:** March 7, 2026  
**Status:** Comprehensive Review Complete  

---

## 📋 Summary

| Category | Count | Status |
|----------|-------|--------|
| **Missing Frontend Routes** | 1 | ❌ Critical |
| **API Integration Issues** | 3 | ❌ High Priority |
| **Authentication Mocks** | 3 | ⚠️ Uses localStorage |
| **Hotel Sub-Admin Routes** | 5+ | ❌ Not Implemented |
| **Upload Endpoints** | 1 | ⏳ Not Built |

---

## 🔴 Critical Mismatches

### 1. **Missing: Hotel Sub-Admin Login Route**
**Issue:** Backend has full hotel sub-admin auth implemented, but frontend has NO login page.

**Backend Ready:**
```
POST /api/auth/hotel-sub-admin/login
POST /api/auth/hotel-sub-admin/logout
```

**Frontend Status:**
- ❌ `/hotel-sub-admin-login` route does NOT exist
- ❌ `HotelSubAdminLogin.tsx` page missing
- ❌ Navbar links missing
- ❌ Navigation context missing

**Fix Required:**
1. Create `src/pages/HotelSubAdminLogin.tsx`
2. Add route: `<Route path="/hotel-sub-admin-login" element={<HotelSubAdminLogin />} />`
3. Add link in AdminLogin and HotelAdminLogin pages
4. Create sub-admin dashboard (`/hotel-sub-admin`)

---

### 2. **Authentication: All Logins Use Mock Data**
**Issue:** None of the three login pages call actual API endpoints.

#### **Current: Login.tsx (End User)**
```tsx
const handleSubmit = (e: React.FormEvent) => {
  e.preventDefault();
  setIsLoading(true);
  setTimeout(() => {
    const name = email.split("@")[0].replace(/[._]/g, " ");
    setLoggedInUser({ name, email });  // ← Mock localStorage only
    toast({ title: "Welcome back!", ... });
    navigate("/");
  }, 800);  // ← Fake 800ms delay
};
```

**Expected: Should call**
```ts
POST /api/auth/end-user/login
{
  "email": "user@example.com",
  "password": "password123"
}
```

#### **Current: AdminLogin.tsx (System Admin)**
```tsx
const handleSubmit = (e: React.FormEvent) => {
  e.preventDefault();
  setIsLoading(true);
  setTimeout(() => {  // ← Still mocked!
    setIsLoading(false);
    toast({ title: "Welcome, Admin!", ... });
    navigate("/admin");
  }, 1200);
};
```

**Expected: Should call**
```ts
POST /api/auth/system-admin/login
{
  "email": "admin@example.com",
  "password": "password123"
}
```

#### **Current: HotelAdminLogin.tsx (Hotel Admin)**
```tsx
// Same mock pattern - no actual API call
```

**Expected: Should call**
```ts
POST /api/auth/hotel-admin/login
{
  "email": "hotelmanager@hotel.com",
  "password": "password123"
}
```

**Fix Required:**
Replace all three with real API calls + token storage:
```ts
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setIsLoading(true);
  try {
    const response = await fetch('http://localhost:3000/api/auth/end-user/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    const data = await response.json();
    if (data.success) {
      localStorage.setItem('token', data.data.token);
      setLoggedInUser(data.data.user);
      navigate('/');
    } else {
      toast({ title: "Error", description: data.message });
    }
  } catch (error) {
    toast({ title: "Error", description: "Login failed" });
  } finally {
    setIsLoading(false);
  }
};
```

---

### 3. **Missing: Hotel Sub-Admin Dashboard Routes**
**Issue:** No routes for hotel sub-admin dashboard.

**Backend Endpoints Built:**
```
GET /api/profiles/hotel-sub-admin/:id          → Get profile
PATCH /api/profiles/hotel-sub-admin/:id        → Update profile
GET /api/bookings/hotel                        → View hotel bookings (sub-admin allowed)
PATCH /api/bookings/:id/status                 → Update booking status (sub-admin allowed)
```

**Frontend Missing:**
- ❌ `/hotel-sub-admin` base layout (like `/admin` and `/hotel-admin`)
- ❌ `/hotel-sub-admin/bookings` — view bookings only
- ❌ `/hotel-sub-admin/profile` — profile page
- ❌ No sidebar/navigation specific to sub-admin
- ❌ No role separation in booking management (sub-admin can't manage rooms)

**Create:**
1. `src/pages/HotelSubAdminLogin.tsx` — Login page
2. `src/components/HotelSubAdminLayout.tsx` — Layout with restricted sidebar
3. `src/pages/hotel-sub-admin/HotelSubAdminDashboard.tsx` — Home page
4. `src/pages/hotel-sub-admin/HotelSubAdminBookings.tsx` — Booking management
5. `src/pages/hotel-sub-admin/HotelSubAdminProfile.tsx` — Profile page

**App.tsx Routes:**
```tsx
<Route path="/hotel-sub-admin-login" element={<HotelSubAdminLogin />} />
<Route path="/hotel-sub-admin" element={<HotelSubAdminLayout />}>
  <Route index element={<HotelSubAdminDashboard />} />
  <Route path="bookings" element={<HotelSubAdminBookings />} />
  <Route path="profile" element={<HotelSubAdminProfile />} />
</Route>
```

---

## ⚠️ High Priority Issues

### 4. **Missing: Upload Endpoint Implementation**
**Issue:** No image upload endpoint exists on backend.

**Frontend Expectation:**
- File upload form inputs exist in several admin pages
- No upload handler implemented
- Pages expect to get URLs back

**Backend Status:**
- ❌ `/api/upload` endpoint NOT created
- ❌ Multer NOT installed
- ❌ Upload folder structure created ✅ (but no handling)

**Needed:**
```bash
# Install
npm install multer
npm install -D @types/multer
```

**Create backend files:**
1. `src/utils/upload.ts` — Multer configuration
2. `src/modules/upload/upload.controller.ts` — Upload handler
3. `src/modules/upload/upload.routes.ts` — Routes
4. `src/app.ts` — Add static file serving

**Expected API:**
```
POST /api/upload?folder=hotels
POST /api/upload?folder=rooms
POST /api/upload?folder=profiles

Response: { "success": true, "data": { "url": "http://localhost:3000/uploads/hotels/..." } }
```

---

### 5. **Missing: Hotel Search/Browse Endpoints Integration**
**Issue:** Frontend pages exist but will fail when trying to call unbuilt Phase 7 endpoints.

**Frontend Pages:**
- ✅ `/search` → SearchHotels.tsx
- ✅ `/explore` → ExploreHotels.tsx

**Backend Endpoints (Phase 7 - NOT YET BUILT):**
- ❌ `GET /api/hotels` — List hotels
- ❌ `GET /api/hotels/:id` — Get hotel details
- ❌ `GET /api/hotels/search` — Search with filters

**Status:** Pages exist but are orphaned until Phase 7 is built

---

### 6. **Missing: Signup Integration**
**Issue:** Signup.tsx exists but doesn't call backend.

**Current:** Uses mock localStorage  
**Expected:**
```ts
POST /api/auth/end-user/register
{
  "email": "newuser@example.com",
  "password": "password123",
  "name": "John Doe"
}
```

---

## 📊 Frontend Routes Audit

### ✅ Implemented Routes

| Path | Component | Status |
|------|-----------|--------|
| `/` | Index | ✅ Working |
| `/login` | Login | ✅ Page exists, API not connected |
| `/admin-login` | AdminLogin | ✅ Page exists, API not connected |
| `/hotel-admin-login` | HotelAdminLogin | ✅ Page exists, API not connected |
| `/signup` | Signup | ✅ Page exists, API not connected |
| `/admin/*` | AdminLayout + 17 sub-pages | ✅ All implemented |
| `/hotel-admin/*` | HotelAdminLayout + 11 sub-pages | ✅ All implemented |
| `/profile` | UserProfile | ✅ Working |
| `/my-bookings` | MyBookings | ✅ Working |

### ❌ Missing Routes

| Path | Component | Status |
|------|-----------|--------|
| `/hotel-sub-admin-login` | HotelSubAdminLogin | ❌ MISSING |
| `/hotel-sub-admin/*` | HotelSubAdminLayout | ❌ MISSING |
| `/hotel-sub-admin/bookings` | HotelSubAdminBookings | ❌ MISSING |
| `/hotel-sub-admin/profile` | HotelSubAdminProfile | ❌ MISSING |

### ⚠️ Pages Waiting for Backend (Phase 7)

| Path | Component | Status |
|------|-----------|--------|
| `/search` | SearchHotels | ⏳ Ready, needs API |
| `/explore` | ExploreHotels | ⏳ Ready, needs API |
| `/hotel/:id` | HotelDetail | ⏳ Uses mock data, needs API |

---

## 🔧 Backend Routes Status

### ✅ Fully Implemented (Phases 1-10)

```
/api/auth/system-admin/login         ✅
/api/auth/system-admin/logout        ✅
/api/auth/hotel-admin/login          ✅
/api/auth/hotel-admin/logout         ✅
/api/auth/hotel-sub-admin/login      ✅
/api/auth/hotel-sub-admin/logout     ✅
/api/auth/end-user/register          ✅
/api/auth/end-user/login             ✅
/api/auth/end-user/logout            ✅
/api/system-admin/hotels             ✅
/api/system-admin/hotel-admins       ✅
/api/system-admin/analytics          ✅
/api/bookings/*                      ✅
/api/profiles/*                      ✅
```

### ❌ Not Yet Built (Phases 7-8, Upload)

```
/api/hotels                          ❌ Phase 7
/api/hotels/:id                      ❌ Phase 7
/api/hotels/search                   ❌ Phase 7
/api/rooms                           ❌ Phase 8
/api/rooms/:id                       ❌ Phase 8
/api/upload                          ❌ Custom
```

---

## 🎯 Integration Checklist

### Immediate (Before Testing)
- [ ] Create `HotelSubAdminLogin.tsx`
- [ ] Create `HotelSubAdminLayout.tsx`
- [ ] Create sub-admin dashboard pages (3 pages)
- [ ] Add routes for `/hotel-sub-admin-login` and `/hotel-sub-admin/*`
- [ ] Add navbar links to sub-admin login

### High Priority (Authentication)
- [ ] Update `Login.tsx` to call `POST /api/auth/end-user/login`
- [ ] Update `AdminLogin.tsx` to call `POST /api/auth/system-admin/login`
- [ ] Update `HotelAdminLogin.tsx` to call `POST /api/auth/hotel-admin/login`
- [ ] Update `Signup.tsx` to call `POST /api/auth/end-user/register`
- [ ] Implement token storage (localStorage or Context)
- [ ] Add Authorization header to all API requests

### Medium Priority (Upload)
- [ ] Install multer: `npm install multer @types/multer`
- [ ] Create `src/utils/upload.ts`
- [ ] Create upload controller and routes
- [ ] Add static file serving in `app.ts`
- [ ] Update admin forms to use upload endpoint

### Lower Priority (Can Wait)
- [ ] Phase 7 Hotel endpoints (when Phase 7 is built)
- [ ] Phase 8 Room endpoints (when Phase 8 is built)

---

## 📝 Code Template: Converting Mock Login to Real API

**Before (Current):**
```tsx
const handleSubmit = (e: React.FormEvent) => {
  e.preventDefault();
  setIsLoading(true);
  setTimeout(() => {
    setLoggedInUser({ name: email.split("@")[0], email });
    navigate("/");
  }, 800);
};
```

**After (Real API):**
```tsx
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setIsLoading(true);
  try {
    const response = await fetch('http://localhost:3000/api/auth/end-user/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    
    if (!response.ok) {
      throw new Error('Login failed');
    }
    
    const data = await response.json();
    
    if (data.success) {
      // Store token for future requests
      localStorage.setItem('authToken', data.data.token);
      localStorage.setItem('user', JSON.stringify(data.data.user));
      
      // Update UI
      setLoggedInUser(data.data.user);
      
      toast({ 
        title: "Welcome!", 
        description: `Signed in as ${data.data.user.name}` 
      });
      
      navigate("/");
    } else {
      toast({ 
        title: "Login Failed", 
        description: data.message,
        variant: "destructive"
      });
    }
  } catch (error) {
    toast({ 
      title: "Error", 
      description: error instanceof Error ? error.message : "Login failed",
      variant: "destructive"
    });
  } finally {
    setIsLoading(false);
  }
};
```

---

## 🚀 Next Steps Priority Order

1. **CRITICAL:** Create hotel-sub-admin-login + dashboard (Issue #1-3)
2. **HIGH:** Connect auth pages to real APIs (Issue #2)
3. **HIGH:** Implement upload endpoint (Issue #4)
4. **MEDIUM:** Test all login flows end-to-end
5. **LOW:** Wait for Phase 7 to build search/hotel APIs

