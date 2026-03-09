# Hotel Sub-Admin Implementation Guide

## Current Status
✅ Backend: Fully implemented (Phases 1-10)  
❌ Frontend: Missing completely

---

## What's Missing on Frontend

| Component | Status | Path |
|-----------|--------|------|
| Login Page | ❌ Missing | `src/pages/HotelSubAdminLogin.tsx` |
| Layout | ❌ Missing | `src/components/HotelSubAdminLayout.tsx` |
| Dashboard | ❌ Missing | `src/pages/hotel-sub-admin/HotelSubAdminDashboard.tsx` |
| Bookings | ❌ Missing | `src/pages/hotel-sub-admin/HotelSubAdminBookings.tsx` |
| Profile | ❌ Missing | `src/pages/hotel-sub-admin/HotelSubAdminProfile.tsx` |
| Routes | ❌ Missing | `src/App.tsx` |

---

## Backend Endpoints Ready

### Authentication
```
POST /api/auth/hotel-sub-admin/login
  Input: { email, password }
  Output: { token, user: { id, name, email, hotel_id } }

POST /api/auth/hotel-sub-admin/logout
  Auth required: Bearer token
  Output: { message: "Logged out" }
```

### Profile Management
```
GET /api/profiles/hotel-sub-admin/:id
  Auth required: Bearer token
  Output: { phone, nid_no, image_url, updated_at }

PATCH /api/profiles/hotel-sub-admin/:id
  Auth required: Bearer token
  Input: { phone?, nid_no?, image_url? }
  Output: Updated profile
```

### Booking Management (Sub-Admin can view & update status only)
```
GET /api/bookings/hotel
  Auth required: Bearer token + hotelStaffOnly
  Query params: ?skip=0&take=10 (pagination)
  Output: List of bookings for sub-admin's hotel

PATCH /api/bookings/:id/status
  Auth required: Bearer token + hotelStaffOnly
  Input: { status: "CHECKED_IN" | "CHECKED_OUT" | "NO_SHOW" }
  Output: Updated booking
```

---

## What Sub-Admin CAN Do

✅ View their profile  
✅ Update profile (phone, NID, image)  
✅ View all bookings for their hotel  
✅ Update booking status (check-in, check-out, no-show)  

---

## What Sub-Admin CANNOT Do

❌ Create hotels  
❌ Create rooms  
❌ Manage hotel settings  
❌ Manage other sub-admins  
❌ View analytics  

---

## Implementation Steps

### Step 1: Create Login Page
File: `src/pages/HotelSubAdminLogin.tsx`

```tsx
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Shield, Eye, EyeOff, ArrowRight } from "lucide-react";
import { toast } from "@/hooks/use-toast";

const HotelSubAdminLogin = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch("http://localhost:3000/api/auth/hotel-sub-admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (data.success) {
        localStorage.setItem("token", data.data.token);
        localStorage.setItem("user", JSON.stringify(data.data.user));
        localStorage.setItem("userRole", "HOTEL_SUB_ADMIN");
        
        toast({ title: "Welcome!", description: `Signed in as ${data.data.user.name}` });
        navigate("/hotel-sub-admin");
      } else {
        toast({ title: "Error", description: data.message, variant: "destructive" });
      }
    } catch (error) {
      toast({ title: "Error", description: "Login failed", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background relative overflow-hidden">
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
      <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-blue/10 rounded-full blur-3xl" />

      <div className="relative z-10 w-full max-w-md mx-4 animate-fade-in-up">
        <Link to="/" className="flex items-center justify-center gap-3 mb-8 group">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-primary to-blue rounded-xl blur-lg opacity-50 group-hover:opacity-75 transition-opacity" />
            <div className="relative bg-gradient-to-r from-primary to-blue p-2.5 rounded-xl">
              <Shield className="h-6 w-6 text-primary-foreground" />
            </div>
          </div>
          <span className="text-2xl font-bold text-gradient">StayVista Sub Admin</span>
        </Link>

        <div className="glass rounded-2xl p-8 shadow-2xl">
          <h1 className="text-2xl font-bold text-center mb-2">Staff Login</h1>
          <p className="text-muted-foreground text-center mb-8">Sign in to manage bookings</p>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="staff@hotel.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1.5 bg-secondary/30 border-border/50 focus:border-primary"
                required
              />
            </div>
            <div>
              <div className="flex justify-between items-center">
                <Label htmlFor="password">Password</Label>
              </div>
              <div className="relative mt-1.5">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="bg-secondary/30 border-border/50 focus:border-primary pr-10"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
            <Button type="submit" variant="hero" className="w-full group" disabled={isLoading}>
              {isLoading ? "Signing in..." : "Sign in as Staff"}
              <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
          </form>

          <div className="mt-6 pt-6 border-t border-border/50 space-y-3">
            <Link to="/hotel-admin-login" className="block text-center text-sm text-muted-foreground hover:text-primary transition-colors">
              Sign in as Hotel Manager →
            </Link>
            <Link to="/login" className="block text-center text-sm text-muted-foreground hover:text-primary transition-colors">
              Sign in as Guest →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HotelSubAdminLogin;
```

---

### Step 2: Create Layout Component
File: `src/components/HotelSubAdminLayout.tsx`

```tsx
import { useState } from "react";
import { Outlet, Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Menu, X, LogOut, Home, Calendar, User } from "lucide-react";

const HotelSubAdminLayout = () => {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("userRole");
    navigate("/hotel-sub-admin-login");
  };

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <div
        className={`${
          sidebarOpen ? "w-64" : "w-20"
        } bg-card border-r border-border transition-all duration-300 flex flex-col`}
      >
        <div className="p-4 border-b border-border flex items-center justify-between">
          {sidebarOpen && <span className="font-bold text-primary">StayVista</span>}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-1 hover:bg-muted rounded"
          >
            {sidebarOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>
        </div>

        <nav className="flex-1 p-4 space-y-2">
          <Link
            to="/hotel-sub-admin"
            className="flex items-center gap-3 px-4 py-2 rounded hover:bg-muted"
          >
            <Home className="h-5 w-5" />
            {sidebarOpen && <span>Dashboard</span>}
          </Link>

          <Link
            to="/hotel-sub-admin/bookings"
            className="flex items-center gap-3 px-4 py-2 rounded hover:bg-muted"
          >
            <Calendar className="h-5 w-5" />
            {sidebarOpen && <span>Bookings</span>}
          </Link>

          <Link
            to="/hotel-sub-admin/profile"
            className="flex items-center gap-3 px-4 py-2 rounded hover:bg-muted"
          >
            <User className="h-5 w-5" />
            {sidebarOpen && <span>Profile</span>}
          </Link>
        </nav>

        <div className="p-4 border-t border-border">
          {sidebarOpen && (
            <div className="text-sm text-muted-foreground mb-3">
              <p className="font-medium">{user.name}</p>
              <p className="text-xs">{user.email}</p>
            </div>
          )}
          <Button
            onClick={handleLogout}
            variant="ghost"
            className="w-full justify-start"
          >
            <LogOut className="h-4 w-4" />
            {sidebarOpen && <span className="ml-2">Logout</span>}
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        <Outlet />
      </div>
    </div>
  );
};

export default HotelSubAdminLayout;
```

---

### Step 3: Update App.tsx Routes

Add these routes before the catch-all `<Route path="*" />`:

```tsx
import HotelSubAdminLogin from "./pages/HotelSubAdminLogin";
import HotelSubAdminLayout from "./components/HotelSubAdminLayout";
import HotelSubAdminDashboard from "./pages/hotel-sub-admin/HotelSubAdminDashboard";
import HotelSubAdminBookings from "./pages/hotel-sub-admin/HotelSubAdminBookings";
import HotelSubAdminProfile from "./pages/hotel-sub-admin/HotelSubAdminProfile";

// In the Routes section:
<Route path="/hotel-sub-admin-login" element={<HotelSubAdminLogin />} />
<Route path="/hotel-sub-admin" element={<HotelSubAdminLayout />}>
  <Route index element={<HotelSubAdminDashboard />} />
  <Route path="bookings" element={<HotelSubAdminBookings />} />
  <Route path="profile" element={<HotelSubAdminProfile />} />
</Route>
```

---

### Step 4: Create Dashboard Page
File: `src/pages/hotel-sub-admin/HotelSubAdminDashboard.tsx`

```tsx
import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, Users, DollarSign } from "lucide-react";

const HotelSubAdminDashboard = () => {
  const [stats, setStats] = useState({
    totalBookings: 0,
    pendingBookings: 0,
    totalRevenue: 0,
  });

  useEffect(() => {
    // Fetch stats from backend
    // GET /api/bookings/hotel (with role check)
  }, []);

  return (
    <div className="p-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">Welcome back! Here's your booking overview.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Bookings</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalBookings}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Check-in</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pendingBookings}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Revenue (Current Month)</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">৳{stats.totalRevenue}</div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default HotelSubAdminDashboard;
```

---

### Step 5: Create Bookings Page
File: `src/pages/hotel-sub-admin/HotelSubAdminBookings.tsx`

Similar to `HotelAdminReservations.tsx` but:
- Call `GET /api/bookings/hotel` instead
- Show only status update button (no delete/cancel)
- Don't show room management section

---

### Step 6: Create Profile Page
File: `src/pages/hotel-sub-admin/HotelSubAdminProfile.tsx`

Similar to `UserProfile.tsx` but:
- Call `GET /api/profiles/hotel-sub-admin/:id`
- Call `PATCH /api/profiles/hotel-sub-admin/:id` on save
- Only show phone, NID, image fields

---

## Update Navbar Links

Add link to Hotel Sub-Admin login in `AdminLogin.tsx`:

```tsx
<div className="mt-4 pt-4 border-t border-border/50 space-y-3">
  <Link to="/hotel-admin-login" className="block text-center text-sm text-muted-foreground hover:text-primary transition-colors">
    Sign in as Hotel Manager →
  </Link>
  <Link to="/hotel-sub-admin-login" className="block text-center text-sm text-muted-foreground hover:text-primary transition-colors">
    Sign in as Hotel Staff →  {/* NEW */}
  </Link>
  <Link to="/login" className="block text-center text-sm text-muted-foreground hover:text-primary transition-colors">
    Sign in as Guest →
  </Link>
</div>
```

---

## Testing Checklist

- [ ] Create all 5 files
- [ ] Add routes to App.tsx
- [ ] Test login: `POST /api/auth/hotel-sub-admin/login`
- [ ] Test profile fetch: `GET /api/profiles/hotel-sub-admin/:id`
- [ ] Test bookings fetch: `GET /api/bookings/hotel`
- [ ] Test status update: `PATCH /api/bookings/:id/status`
- [ ] Test logout: `POST /api/auth/hotel-sub-admin/logout`

