"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ThemeToggle } from "./theme-toggle";
import { Menu, X, Home, LogOut, Compass, Info, Store, ShieldCheck, ShoppingCart, Bell } from "lucide-react";
import { api } from "@/lib/api";

export function Navbar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = React.useState(false);
  const [user, setUser] = React.useState<{ name: string; email: string; role: string } | null>(null);
  const [cartCount, setCartCount] = React.useState(0);
  const [notifications, setNotifications] = React.useState<any[]>([]);
  const [notifDropdownOpen, setNotifDropdownOpen] = React.useState(false);

  const fetchNotifications = React.useCallback(async () => {
    const token = localStorage.getItem("rentease_token");
    if (!token) {
      setNotifications([]);
      return;
    }
    try {
      const res = await api.get<{ success: boolean; data: any[] }>("/notifications");
      if (res.success && res.data) {
        setNotifications(res.data);
      }
    } catch (e) {
      console.error("Error fetching notifications", e);
    }
  }, []);

  React.useEffect(() => {
    // Check if user is logged in
    const checkUser = () => {
      const storedUser = localStorage.getItem("rentease_user");
      if (storedUser) {
        try {
          setUser(JSON.parse(storedUser));
        } catch (e) {
          console.error("Error parsing stored user", e);
        }
      } else {
        setUser(null);
      }
    };

    const fetchCartCount = async () => {
      const token = localStorage.getItem("rentease_token");
      if (!token) {
        setCartCount(0);
        return;
      }
      try {
        interface CartRes {
          success: boolean;
          data: {
            items: { quantity: number }[];
          };
        }
        const res = await api.get<CartRes>("/cart");
        if (res.success && res.data) {
          const count = res.data.items.reduce((total, item) => total + item.quantity, 0);
          setCartCount(count);
        } else {
          setCartCount(0);
        }
      } catch (e) {
        setCartCount(0);
      }
    };

    checkUser();
    fetchCartCount();
    fetchNotifications();

    const handleAuthChange = () => {
      checkUser();
      fetchCartCount();
      fetchNotifications();
    };

    window.addEventListener("auth-change", handleAuthChange);
    window.addEventListener("cart-change", fetchCartCount);
    window.addEventListener("notification-refresh", fetchNotifications);

    // Auto poll notifications every 30 seconds for live feel
    const interval = setInterval(fetchNotifications, 30000);

    return () => {
      window.removeEventListener("auth-change", handleAuthChange);
      window.removeEventListener("cart-change", fetchCartCount);
      window.removeEventListener("notification-refresh", fetchNotifications);
      clearInterval(interval);
    };
  }, [fetchNotifications]);

  const handleLogout = async () => {
    try {
      // Clear server-side cookie
      await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/auth/logout`, {
        method: 'POST',
        credentials: 'include',
      });
    } catch {
      // Proceed with client-side logout even if server call fails
    }
    localStorage.removeItem("rentease_token");
    localStorage.removeItem("rentease_user");
    document.cookie = "token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
    setUser(null);
    window.dispatchEvent(new Event("auth-change"));
    window.location.href = "/";
  };

  const handleMarkAsRead = async (id: string) => {
    try {
      await api.put(`/notifications/${id}/read`, {});
      fetchNotifications();
    } catch (e) {
      console.error(e);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await api.put(`/notifications/read-all`, {});
      fetchNotifications();
    } catch (e) {
      console.error(e);
    }
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-neutral-200/40 dark:border-white/[0.06] bg-white/80 dark:bg-background/80 backdrop-blur-md transition-all duration-300">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between relative">
          
          {/* Logo Section */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 text-white shadow-md shadow-indigo-500/20">
                <Home className="h-5 w-5" />
              </div>
              <span className="bg-gradient-to-r from-neutral-900 to-neutral-700 dark:from-white dark:to-neutral-300 bg-clip-text text-xl font-bold tracking-tight text-transparent">
                RentEase
              </span>
            </Link>
          </div>

          {/* Desktop Nav Links */}
          <div className="hidden md:flex items-center space-x-8">
            <Link 
              href="/listings" 
              className={`text-sm font-semibold flex items-center gap-1.5 transition-colors ${
                pathname?.startsWith("/listings")
                  ? "text-indigo-600 dark:text-violet-400"
                  : "text-neutral-600 hover:text-indigo-600 dark:text-neutral-300 dark:hover:text-violet-400"
              }`}
            >
              <Compass className="h-4 w-4" />
              Properties
            </Link>
            <Link 
              href="/products" 
              className={`text-sm font-semibold flex items-center gap-1.5 transition-colors ${
                pathname?.startsWith("/products")
                  ? "text-indigo-600 dark:text-violet-400"
                  : "text-neutral-600 hover:text-indigo-600 dark:text-neutral-300 dark:hover:text-violet-400"
              }`}
            >
              <Store className="h-4 w-4" />
              Products
            </Link>
            <Link 
              href="/about" 
              className={`text-sm font-semibold flex items-center gap-1.5 transition-colors ${
                pathname === "/about"
                  ? "text-indigo-600 dark:text-violet-400"
                  : "text-neutral-600 hover:text-indigo-600 dark:text-neutral-300 dark:hover:text-violet-400"
              }`}
            >
              <Info className="h-4 w-4" />
              About
            </Link>
            {user?.role === "vendor" && (
              <Link 
                href="/vendor/dashboard" 
                className={`px-3 py-1 rounded-full text-xs font-semibold transition-all flex items-center gap-1.5 shadow-sm border ${
                  pathname?.startsWith("/vendor/dashboard")
                    ? "bg-violet-600 text-white border-violet-600"
                    : "bg-violet-50 dark:bg-violet-950/40 text-violet-700 dark:text-violet-350 border-violet-200/50 dark:border-violet-850 hover:bg-violet-100/70 dark:hover:bg-violet-950/60"
                }`}
              >
                <Store className="h-3.5 w-3.5" />
                Vendor Dashboard
              </Link>
            )}
            {user?.role === "vendor" && (
              <Link 
                href="/dashboard" 
                className={`px-3 py-1 rounded-full text-xs font-semibold transition-all flex items-center gap-1.5 shadow-sm border ${
                  pathname === "/dashboard"
                    ? "bg-indigo-600 text-white border-indigo-600"
                    : "bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-355 border-indigo-200/50 dark:border-indigo-850 hover:bg-indigo-100/70 dark:hover:bg-indigo-950/60"
                }`}
              >
                <Compass className="h-3.5 w-3.5" />
                My Rentals
              </Link>
            )}
            {user?.role === "customer" && (
              <Link 
                href="/dashboard" 
                className={`px-3 py-1 rounded-full text-xs font-semibold transition-all flex items-center gap-1.5 shadow-sm border ${
                  pathname === "/dashboard"
                    ? "bg-indigo-600 text-white border-indigo-600"
                    : "bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-355 border-indigo-200/50 dark:border-indigo-850 hover:bg-indigo-100/70 dark:hover:bg-indigo-950/60"
                }`}
              >
                <Compass className="h-3.5 w-3.5" />
                My Dashboard
              </Link>
            )}
            {user?.role === "admin" && (
              <Link 
                href="/admin/dashboard" 
                className={`px-3 py-1 rounded-full text-xs font-semibold transition-all flex items-center gap-1.5 shadow-sm border ${
                  pathname?.startsWith("/admin/dashboard")
                    ? "bg-red-650 text-white border-red-650"
                    : "bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-350 border-red-200/50 dark:border-red-850 hover:bg-red-100/70 dark:hover:bg-red-950/60"
                }`}
              >
                <ShieldCheck className="h-3.5 w-3.5" />
                Admin Panel
              </Link>
            )}
          </div>

          {/* Action Buttons & Theme Toggle */}
          <div className="hidden md:flex items-center space-x-4">
            {/* Cart */}
            {user && (
              <Link
                href="/cart"
                className="relative p-2 text-neutral-600 hover:text-indigo-600 dark:text-neutral-350 dark:hover:text-violet-400 transition-colors cursor-pointer"
                title="View Shopping Cart"
              >
                <ShoppingCart className="h-5 w-5" />
                {cartCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-indigo-600 dark:bg-violet-600 text-[9px] font-bold text-white shadow-sm ring-1 ring-white dark:ring-neutral-950 animate-pulse">
                    {cartCount}
                  </span>
                )}
              </Link>
            )}
            {!user && (
              <Link
                href="/cart"
                className="relative p-2 text-neutral-600 hover:text-indigo-600 dark:text-neutral-350 dark:hover:text-violet-400 transition-colors cursor-pointer"
                title="View Shopping Cart"
              >
                <ShoppingCart className="h-5 w-5" />
              </Link>
            )}

            {/* Notifications Dropdown Bell */}
            {user && (
              <div className="relative">
                <button
                  onClick={() => setNotifDropdownOpen(!notifDropdownOpen)}
                  className="relative p-2 text-neutral-600 hover:text-indigo-600 dark:text-neutral-350 dark:hover:text-violet-400 transition-colors cursor-pointer"
                  title="Notifications"
                >
                  <Bell className="h-5 w-5" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[8px] font-bold text-white shadow-sm ring-1 ring-white dark:ring-neutral-950">
                      {unreadCount}
                    </span>
                  )}
                </button>
                
                {notifDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-80 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-2xl py-3 z-[100] animate-in fade-in slide-in-from-top-2 duration-150">
                    <div className="flex items-center justify-between px-4 pb-2.5 border-b border-neutral-100 dark:border-neutral-850">
                      <span className="text-xs font-extrabold text-neutral-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
                        <Bell className="h-4 w-4 text-indigo-500" />
                        Notifications
                      </span>
                      {unreadCount > 0 && (
                        <button
                          onClick={handleMarkAllAsRead}
                          className="text-[10px] text-indigo-605 hover:text-indigo-500 dark:text-violet-400 dark:hover:text-violet-300 font-extrabold cursor-pointer border-none bg-transparent"
                        >
                          Mark all read
                        </button>
                      )}
                    </div>
                    
                    <div className="max-h-[300px] overflow-y-auto pr-1">
                      {notifications.length === 0 ? (
                        <p className="text-[11px] text-neutral-400 italic text-center py-6">You're all caught up!</p>
                      ) : (
                        notifications.map((notif) => (
                          <div
                            key={notif._id}
                            onClick={() => {
                              if (!notif.isRead) handleMarkAsRead(notif._id);
                            }}
                            className={`px-4 py-3 hover:bg-neutral-50 dark:hover:bg-neutral-950/40 cursor-pointer border-b border-neutral-50 dark:border-neutral-850 last:border-none transition-colors ${
                              !notif.isRead ? "bg-indigo-50/20 dark:bg-indigo-950/10 border-l-2 border-l-indigo-500" : ""
                            }`}
                          >
                            <div className="flex justify-between items-baseline gap-2">
                              <p className={`text-xs font-bold ${!notif.isRead ? "text-neutral-900 dark:text-white" : "text-neutral-700 dark:text-neutral-300"}`}>
                                {notif.title}
                              </p>
                              <span className="text-[8px] text-neutral-400 shrink-0">
                                {new Date(notif.createdAt).toLocaleDateString()}
                              </span>
                            </div>
                            <p className="text-[11px] text-neutral-500 dark:text-neutral-400 mt-1 leading-relaxed">
                              {notif.message}
                            </p>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            <ThemeToggle />

            {user ? (
              <div className="flex items-center space-x-4">
                <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300 flex items-center gap-2">
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-indigo-100 dark:bg-violet-955 text-indigo-600 dark:text-violet-400 font-bold text-xs uppercase">
                    {user.name.charAt(0)}
                  </span>
                  {user.name}
                  <span className="text-[10px] bg-neutral-100 dark:bg-neutral-800 text-neutral-500 dark:text-neutral-400 px-2 py-0.5 rounded-full capitalize">
                    {user.role}
                  </span>
                </span>
                <button
                  onClick={handleLogout}
                  className="text-sm font-medium text-neutral-600 dark:text-neutral-300 hover:text-red-500 dark:hover:text-red-400 transition-colors flex items-center gap-1 cursor-pointer"
                >
                  <LogOut className="h-4 w-4" />
                  Logout
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <Link
                  href="/login"
                  className="text-sm font-medium text-neutral-600 dark:text-neutral-300 hover:text-indigo-600 dark:hover:text-violet-400 transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  href="/register"
                  className="rounded-lg bg-indigo-600 hover:bg-indigo-500 dark:bg-violet-600 dark:hover:bg-violet-500 px-4 py-2 text-sm font-medium text-white shadow-sm transition-all duration-200"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="flex md:hidden items-center space-x-3">
            {/* Mobile cart */}
            {user && (
              <Link
                href="/cart"
                className="relative p-2 text-neutral-600 hover:text-indigo-600 dark:text-neutral-355 dark:hover:text-violet-400 transition-colors"
                title="View Shopping Cart"
              >
                <ShoppingCart className="h-5 w-5" />
                {cartCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-indigo-650 text-[9px] font-bold text-white shadow-sm ring-1 ring-white dark:ring-neutral-950">
                    {cartCount}
                  </span>
                )}
              </Link>
            )}
            {!user && (
              <Link
                href="/cart"
                className="relative p-2 text-neutral-600 hover:text-indigo-600 dark:text-neutral-355 dark:hover:text-violet-400 transition-colors"
                title="View Shopping Cart"
              >
                <ShoppingCart className="h-5 w-5" />
              </Link>
            )}

            {/* Mobile Notifications dropdown */}
            {user && (
              <div className="relative">
                <button
                  onClick={() => setNotifDropdownOpen(!notifDropdownOpen)}
                  className="relative p-2 text-neutral-600 hover:text-indigo-600 dark:text-neutral-350 dark:hover:text-violet-400 transition-colors"
                  title="Notifications"
                >
                  <Bell className="h-5 w-5" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[8px] font-bold text-white shadow-sm ring-1 ring-white dark:ring-neutral-950">
                      {unreadCount}
                    </span>
                  )}
                </button>
                {notifDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-72 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-2xl py-3 z-[100] animate-in fade-in slide-in-from-top-2 duration-155">
                    <div className="flex items-center justify-between px-4 pb-2 border-b border-neutral-100 dark:border-neutral-850">
                      <span className="text-xs font-bold text-neutral-900 dark:text-white uppercase tracking-wider">
                        Alerts
                      </span>
                      {unreadCount > 0 && (
                        <button
                          onClick={handleMarkAllAsRead}
                          className="text-[9px] text-indigo-600 font-extrabold cursor-pointer"
                        >
                          Clear
                        </button>
                      )}
                    </div>
                    <div className="max-h-[220px] overflow-y-auto">
                      {notifications.length === 0 ? (
                        <p className="text-[10px] text-neutral-400 italic text-center py-4">All clear!</p>
                      ) : (
                        notifications.map((notif) => (
                          <div
                            key={notif._id}
                            onClick={() => {
                              if (!notif.isRead) handleMarkAsRead(notif._id);
                            }}
                            className={`px-4 py-2 hover:bg-neutral-50 dark:hover:bg-neutral-950/40 cursor-pointer border-b border-neutral-50 dark:border-neutral-850 transition-colors ${
                              !notif.isRead ? "bg-indigo-50/20 dark:bg-indigo-950/10 border-l-2 border-l-indigo-500" : ""
                            }`}
                          >
                            <p className="text-[11px] font-bold text-neutral-800 dark:text-white">{notif.title}</p>
                            <p className="text-[10px] text-neutral-500 dark:text-neutral-400 mt-0.5">{notif.message}</p>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            <ThemeToggle />
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="inline-flex items-center justify-center rounded-lg p-2 text-neutral-500 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 focus:outline-none transition-colors"
              aria-expanded="false"
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden border-t border-neutral-200 dark:border-white/[0.06] bg-white dark:bg-background px-4 py-4 space-y-3 transition-all duration-300">
          <Link
            href="/listings"
            onClick={() => setIsOpen(false)}
            className="block rounded-lg px-3 py-2 text-base font-medium text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-850"
          >
            Explore Properties
          </Link>
          <Link
            href="/products"
            onClick={() => setIsOpen(false)}
            className="block rounded-lg px-3 py-2 text-base font-medium text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-850"
          >
            Explore Products
          </Link>
          <Link
            href="/about"
            onClick={() => setIsOpen(false)}
            className="block rounded-lg px-3 py-2 text-base font-medium text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-850"
          >
            About Us
          </Link>

          {user && user.role === "vendor" && (
            <Link
              href="/vendor/dashboard"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold bg-violet-50 dark:bg-violet-955/20 text-violet-750 dark:text-violet-350 border border-violet-100 dark:border-violet-900"
            >
              <Store className="h-4 w-4" />
              Vendor Dashboard
            </Link>
          )}
          {user && user.role === "vendor" && (
            <Link
              href="/dashboard"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-350 border border-indigo-100 dark:border-indigo-900"
            >
              <Compass className="h-4 w-4" />
              My Rentals
            </Link>
          )}
          {user && user.role === "customer" && (
            <Link
              href="/dashboard"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-350 border border-indigo-100 dark:border-indigo-900"
            >
              <Compass className="h-4 w-4" />
              My Dashboard
            </Link>
          )}
          {user && user.role === "admin" && (
            <Link
              href="/admin/dashboard"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-350 border border-red-100 dark:border-red-900"
            >
              <ShieldCheck className="h-4 w-4" />
              Admin Panel
            </Link>
          )}

          <div className="border-t border-neutral-100 dark:border-neutral-850 pt-4">
            {user ? (
              <div className="space-y-3">
                <div className="px-3 py-1 flex items-center justify-between text-sm text-neutral-700 dark:text-neutral-300">
                  <span className="font-semibold flex items-center gap-2">
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-indigo-100 dark:bg-violet-950 text-indigo-650 dark:text-violet-400 font-bold text-xs uppercase">
                      {user.name.charAt(0)}
                    </span>
                    {user.name}
                  </span>
                  <span className="text-[10px] bg-neutral-100 dark:bg-neutral-800 text-neutral-500 px-2 py-0.5 rounded-full capitalize">
                    {user.role}
                  </span>
                </div>
                <button
                  onClick={() => {
                    handleLogout();
                    setIsOpen(false);
                  }}
                  className="w-full text-left block rounded-lg px-3 py-2 text-base font-medium text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 cursor-pointer"
                >
                  Logout
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2 px-3">
                <Link
                  href="/login"
                  onClick={() => setIsOpen(false)}
                  className="text-center rounded-lg border border-neutral-200 dark:border-neutral-850 px-4 py-2 text-sm font-medium text-neutral-700 dark:text-neutral-300 hover:bg-neutral-55 dark:hover:bg-neutral-850"
                >
                  Sign In
                </Link>
                <Link
                  href="/register"
                  onClick={() => setIsOpen(false)}
                  className="text-center rounded-lg bg-indigo-600 dark:bg-violet-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-500"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
