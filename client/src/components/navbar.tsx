"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ThemeToggle } from "./theme-toggle";
import { Menu, X, Home, LogOut, Compass, Info, Store, ShieldCheck, ShoppingCart, Bell } from "lucide-react";
import { api } from "@/lib/api";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

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
          data: { items: { quantity: number }[] };
        }
        const res = await api.get<CartRes>("/cart");
        if (res.success && res.data) {
          const count = res.data.items.reduce((total, item) => total + item.quantity, 0);
          setCartCount(count);
        } else {
          setCartCount(0);
        }
      } catch {
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
      const apiBase = process.env.NEXT_PUBLIC_API_URL?.endsWith('/api')
        ? process.env.NEXT_PUBLIC_API_URL
        : `${process.env.NEXT_PUBLIC_API_URL}/api`;
      await fetch(`${apiBase}/auth/logout`, {
        method: "POST",
        credentials: "include",
      });
    } catch {}
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

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const navLinks = [
    { href: "/listings", label: "Properties", icon: Compass, match: "/listings" },
    { href: "/products", label: "Products", icon: Store, match: "/products" },
    { href: "/about", label: "About", icon: Info, match: "/about" },
  ];

  const isActive = (match: string) =>
    match === "/about" ? pathname === "/about" : pathname?.startsWith(match);

  const roleLinks = () => {
    if (!user) return null;
    if (user.role === "vendor") {
      return (
        <>
          <Link
            href="/vendor/dashboard"
            className={cn(
              "rounded-lg px-3 py-1.5 text-xs font-medium transition-colors",
              pathname?.startsWith("/vendor/dashboard")
                ? "bg-primary text-primary-foreground"
                : "bg-accent text-accent-foreground hover:bg-accent/80"
            )}
          >
            Vendor
          </Link>
          <Link
            href="/dashboard"
            className={cn(
              "rounded-lg px-3 py-1.5 text-xs font-medium transition-colors",
              pathname === "/dashboard"
                ? "bg-primary text-primary-foreground"
                : "bg-accent text-accent-foreground hover:bg-accent/80"
            )}
          >
            Rentals
          </Link>
        </>
      );
    }
    if (user.role === "customer") {
      return (
        <Link
          href="/dashboard"
          className={cn(
            "rounded-lg px-3 py-1.5 text-xs font-medium transition-colors",
            pathname === "/dashboard"
              ? "bg-primary text-primary-foreground"
              : "bg-accent text-accent-foreground hover:bg-accent/80"
          )}
        >
          Dashboard
        </Link>
      );
    }
    if (user.role === "admin") {
      return (
        <Link
          href="/admin/dashboard"
          className={cn(
            "rounded-lg px-3 py-1.5 text-xs font-medium transition-colors",
            pathname?.startsWith("/admin")
              ? "bg-destructive/90 text-white"
              : "bg-destructive/10 text-destructive hover:bg-destructive/20"
          )}
        >
          Admin
        </Link>
      );
    }
    return null;
  };

  const NotificationDropdown = ({ className }: { className?: string }) => (
    <div
      className={cn(
        "absolute right-0 mt-2 w-80 rounded-2xl border border-border/60 bg-popover shadow-xl py-3 z-[100] animate-in fade-in slide-in-from-top-2 duration-150",
        className
      )}
    >
      <div className="flex items-center justify-between px-4 pb-3 border-b border-border/60">
        <span className="text-xs font-semibold text-foreground uppercase tracking-wider flex items-center gap-1.5">
          <Bell className="h-3.5 w-3.5 text-primary" />
          Notifications
        </span>
        {unreadCount > 0 && (
          <button
            onClick={handleMarkAllAsRead}
            className="text-xs text-primary hover:text-primary/80 font-medium cursor-pointer bg-transparent border-none"
          >
            Mark all read
          </button>
        )}
      </div>
      <div className="max-h-[300px] overflow-y-auto">
        {notifications.length === 0 ? (
          <p className="text-xs text-muted-foreground italic text-center py-8">You&apos;re all caught up!</p>
        ) : (
          notifications.map((notif) => (
            <div
              key={notif._id}
              onClick={() => {
                if (!notif.isRead) handleMarkAsRead(notif._id);
              }}
              className={cn(
                "px-4 py-3 hover:bg-muted/50 cursor-pointer border-b border-border/40 last:border-none transition-colors",
                !notif.isRead && "bg-accent/30 border-l-2 border-l-primary"
              )}
            >
              <div className="flex justify-between items-baseline gap-2">
                <p className={cn("text-xs font-semibold", !notif.isRead ? "text-foreground" : "text-muted-foreground")}>
                  {notif.title}
                </p>
                <span className="text-[10px] text-muted-foreground shrink-0">
                  {new Date(notif.createdAt).toLocaleDateString()}
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{notif.message}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-border/60 bg-background/80 backdrop-blur-xl supports-[backdrop-filter]:bg-background/70">
      <div className="page-container">
        <div className="flex h-16 items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-2.5 shrink-0">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm">
              <Home className="h-4.5 w-4.5" />
            </div>
            <span className="text-lg font-bold tracking-tight text-foreground">RentEase</span>
          </Link>

          <div className="hidden md:flex items-center gap-1 rounded-xl border border-border/60 bg-muted/40 p-1">
            {navLinks.map(({ href, label, icon: Icon, match }) => (
              <Link
                key={href}
                href={href}
                className={cn(
                  "flex items-center gap-1.5 rounded-lg px-3.5 py-1.5 text-sm font-medium transition-all",
                  isActive(match)
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <Icon className="h-3.5 w-3.5" />
                {label}
              </Link>
            ))}
          </div>

          <div className="hidden md:flex items-center gap-2">
            {roleLinks()}

            <Link
              href="/cart"
              className="relative flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
              title="Shopping Cart"
            >
              <ShoppingCart className="h-4 w-4" />
              {cartCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[9px] font-bold text-primary-foreground">
                  {cartCount}
                </span>
              )}
            </Link>

            {user && (
              <div className="relative">
                <button
                  onClick={() => setNotifDropdownOpen(!notifDropdownOpen)}
                  className="relative flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-colors cursor-pointer"
                  title="Notifications"
                >
                  <Bell className="h-4 w-4" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-[9px] font-bold text-white">
                      {unreadCount}
                    </span>
                  )}
                </button>
                {notifDropdownOpen && <NotificationDropdown />}
              </div>
            )}

            <ThemeToggle />

            {user ? (
              <div className="flex items-center gap-3 pl-2 ml-1 border-l border-border/60">
                <div className="flex items-center gap-2">
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-accent text-accent-foreground font-semibold text-xs uppercase">
                    {user.name.charAt(0)}
                  </span>
                  <div className="hidden lg:block">
                    <p className="text-sm font-medium text-foreground leading-none">{user.name}</p>
                    <Badge variant="outline" className="mt-1 capitalize text-[10px] py-0">
                      {user.role}
                    </Badge>
                  </div>
                </div>
                <button
                  onClick={handleLogout}
                  className="flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors cursor-pointer"
                  title="Logout"
                >
                  <LogOut className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2 pl-2 ml-1 border-l border-border/60">
                <Button variant="ghost" size="sm" asChild>
                  <Link href="/login">Sign In</Link>
                </Button>
                <Button size="sm" asChild>
                  <Link href="/register">Sign Up</Link>
                </Button>
              </div>
            )}
          </div>

          <div className="flex md:hidden items-center gap-1.5">
            <Link href="/cart" className="relative flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground">
              <ShoppingCart className="h-4 w-4" />
              {cartCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[9px] font-bold text-primary-foreground">
                  {cartCount}
                </span>
              )}
            </Link>
            {user && (
              <div className="relative">
                <button
                  onClick={() => setNotifDropdownOpen(!notifDropdownOpen)}
                  className="relative flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground"
                >
                  <Bell className="h-4 w-4" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-[9px] font-bold text-white">
                      {unreadCount}
                    </span>
                  )}
                </button>
                {notifDropdownOpen && <NotificationDropdown className="w-72" />}
              </div>
            )}
            <ThemeToggle />
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted transition-colors"
              aria-label="Toggle menu"
            >
              {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </div>

      {isOpen && (
        <div className="md:hidden border-t border-border/60 bg-background px-4 py-4 space-y-1 animate-in slide-in-from-top-2 duration-200">
          {navLinks.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-medium text-foreground hover:bg-muted transition-colors"
            >
              <Icon className="h-4 w-4 text-muted-foreground" />
              {label}
            </Link>
          ))}

          {user && (
            <div className="flex flex-wrap gap-2 pt-2">
              {user.role === "vendor" && (
                <>
                  <Link href="/vendor/dashboard" onClick={() => setIsOpen(false)} className="saas-btn-secondary text-xs py-2 px-3">
                    <Store className="h-3.5 w-3.5" /> Vendor
                  </Link>
                  <Link href="/dashboard" onClick={() => setIsOpen(false)} className="saas-btn-secondary text-xs py-2 px-3">
                    <Compass className="h-3.5 w-3.5" /> Rentals
                  </Link>
                </>
              )}
              {user.role === "customer" && (
                <Link href="/dashboard" onClick={() => setIsOpen(false)} className="saas-btn-secondary text-xs py-2 px-3">
                  Dashboard
                </Link>
              )}
              {user.role === "admin" && (
                <Link href="/admin/dashboard" onClick={() => setIsOpen(false)} className="saas-btn-secondary text-xs py-2 px-3">
                  <ShieldCheck className="h-3.5 w-3.5" /> Admin
                </Link>
              )}
            </div>
          )}

          <div className="saas-divider pt-4 mt-2">
            {user ? (
              <div className="space-y-3">
                <div className="flex items-center gap-3 px-3">
                  <span className="flex h-9 w-9 items-center justify-center rounded-full bg-accent text-accent-foreground font-semibold text-sm uppercase">
                    {user.name.charAt(0)}
                  </span>
                  <div>
                    <p className="text-sm font-medium text-foreground">{user.name}</p>
                    <Badge variant="outline" className="mt-0.5 capitalize text-[10px]">{user.role}</Badge>
                  </div>
                </div>
                <button
                  onClick={() => { handleLogout(); setIsOpen(false); }}
                  className="w-full text-left rounded-xl px-3 py-2.5 text-sm font-medium text-destructive hover:bg-destructive/10 cursor-pointer"
                >
                  Logout
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2 px-1">
                <Link href="/login" onClick={() => setIsOpen(false)} className="saas-btn-secondary text-center text-sm py-2.5">
                  Sign In
                </Link>
                <Link href="/register" onClick={() => setIsOpen(false)} className="saas-btn-primary text-center text-sm py-2.5">
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
