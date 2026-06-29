"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { Home, Search, Heart, Calendar, User, Settings, LogOut, ShoppingBag, MapPin, Star, Compass, Sparkles, Wrench } from "lucide-react";

interface UserData {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  role: string;
}

interface Listing {
  _id: string;
  title: string;
  location: string;
  price: number;
  rating: number;
  image: string;
  category: string;
}

interface BookingItem {
  _id: string;
  bookingType: 'listing' | 'product';
  listing?: {
    title: string;
    location: string;
    price: number;
    category: string;
    image: string;
  };
  product?: {
    name: string;
    monthlyRent: number;
    deposit: number;
    category: string;
    images: string[];
  };
  vendor?: {
    name: string;
    email: string;
    phone?: string;
  };
  startDate: string;
  endDate?: string;
  duration: number;
  totalPrice: number;
  quantity?: number;
  status: 'pending' | 'confirmed' | 'cancelled';
  createdAt: string;
}

const getCoverStyle = (image: string) => {
  if (!image) return {};
  if (image.startsWith("linear-gradient") || image.startsWith("gradient")) {
    return { background: image };
  }
  return {
    backgroundImage: `url(${image})`,
    backgroundSize: "cover",
    backgroundPosition: "center",
    backgroundRepeat: "no-repeat"
  };
};

interface RentalItemDetail {
  _id: string;
  product?: {
    name: string;
    category: string;
    images: string[];
  };
  quantity: number;
  tenure: number;
  status: string;
  deliveryDate: string;
  endDate: string;
  deliveryAddress: string;
  totalPrice: number;
  monthlyRent: number;
  deposit: number;
}

export default function CustomerDashboard() {
  const router = useRouter();
  const [user, setUser] = React.useState<UserData | null>(null);
  const [listingsCount, setListingsCount] = React.useState(0);
  const [recentListings, setRecentListings] = React.useState<Listing[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [bookings, setBookings] = React.useState<BookingItem[]>([]);
  const [bookingsLoading, setBookingsLoading] = React.useState(true);
  const [rentals, setRentals] = React.useState<RentalItemDetail[]>([]);
  const [rentalsLoading, setRentalsLoading] = React.useState(true);

  React.useEffect(() => {
    const stored = localStorage.getItem("rentease_user");
    const token = localStorage.getItem("rentease_token");

    if (!stored || !token) {
      router.push("/login");
      return;
    }

    const parsed = JSON.parse(stored) as UserData;

    if (parsed.role === "admin") {
      router.push("/admin/dashboard");
      return;
    }
    setUser(parsed);


    const fetchHighlights = async () => {
      try {
        interface ListingsRes {
          success: boolean;
          count: number;
          data: Listing[];
        }
        const res = await api.get<ListingsRes>("/listings");
        setListingsCount(res.count || 0);
        setRecentListings((res.data || []).slice(0, 3));
      } catch (err) {
        console.error("Failed to load listings data", err);
      } finally {
        setLoading(false);
      }
    };

    const fetchBookings = async () => {
      try {
        interface BookingsRes {
          success: boolean;
          data: BookingItem[];
        }
        const res = await api.get<BookingsRes>("/bookings/my-bookings");
        setBookings(res.data || []);
      } catch (err) {
        console.error("Failed to load customer bookings", err);
      } finally {
        setBookingsLoading(false);
      }
    };

    const fetchRentals = async () => {
      try {
        interface RentalsRes {
          success: boolean;
          data: RentalItemDetail[];
        }
        const res = await api.get<RentalsRes>("/rentals/my-rentals");
        setRentals(res.data || []);
      } catch (err) {
        console.error("Failed to load customer rentals", err);
      } finally {
        setRentalsLoading(false);
      }
    };

    fetchHighlights();
    fetchBookings();
    fetchRentals();
  }, [router]);

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
    window.dispatchEvent(new Event("auth-change"));
    router.push("/login");
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="h-8 w-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const propertyBookings = bookings.filter(b => b.bookingType === 'listing');

  const stats = [
    { label: "Available Properties", value: listingsCount.toString(), icon: Home, color: "bg-indigo-50 dark:bg-indigo-950/30 text-indigo-600 dark:text-indigo-400" },
    { label: "Property Bookings", value: propertyBookings.length.toString(), icon: Calendar, color: "bg-green-50 dark:bg-green-950/30 text-green-600 dark:text-green-400" },
    { label: "Product Leases", value: rentals.length.toString(), icon: ShoppingBag, color: "bg-violet-50 dark:bg-violet-950/30 text-violet-600 dark:text-violet-400" },
  ];

  return (
    <div className="min-h-screen bg-muted/20 py-8 md:py-12">
      <div className="page-container space-y-8">

        <div className="saas-card flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-6">
          <div className="flex items-center gap-4">
            <div className="h-14 w-14 rounded-2xl bg-primary flex items-center justify-center text-primary-foreground text-xl font-bold shadow-sm">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-extrabold text-foreground">
                  Welcome, {user.name.split(" ")[0]}!
                </h1>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 border border-indigo-100 dark:border-indigo-900">
                  <ShoppingBag className="h-3 w-3" />
                  Customer Account
                </span>
              </div>
              <p className="text-xs sm:text-sm text-muted-foreground">{user.email}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="self-start sm:self-center flex items-center gap-2 px-4 py-2 border border-red-200 dark:border-red-900/40 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-xl text-xs font-semibold text-red-600 dark:text-red-400 transition-all cursor-pointer"
          >
            <LogOut className="h-4 w-4" />
            Sign Out
          </button>
        </div>

        {}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {stats.map(({ label, value, icon: Icon, color }) => (
            <div key={label} className="bg-card border border-border/60 rounded-2xl p-5 flex items-center gap-4 shadow-sm">
              <div className={`h-11 w-11 rounded-xl flex items-center justify-center shrink-0 ${color}`}>
                <Icon className="h-5.5 w-5.5" />
              </div>
              <div>
                <p className="text-xl font-extrabold text-foreground">{value}</p>
                <p className="text-xs text-muted-foreground font-medium">{label}</p>
              </div>
            </div>
          ))}
        </div>

        {}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Link
            href="/listings"
            className="relative overflow-hidden bg-gradient-to-br from-indigo-650 to-violet-605 text-white rounded-2xl p-6 hover:shadow-lg hover:shadow-indigo-500/10 transition-all group"
          >
            <Compass className="h-8 w-8 mb-3 group-hover:scale-110 transition-transform" />
            <h3 className="text-lg font-bold mb-1">Explore Properties</h3>
            <p className="text-xs text-indigo-150">Browse all properties with live pricing</p>
          </Link>

          <Link
            href="/listings"
            className="bg-card border border-border/60 rounded-2xl p-6 hover:border-indigo-300 dark:hover:border-indigo-700 transition-all group"
          >
            <Calendar className="h-8 w-8 mb-3 text-primary group-hover:scale-110 transition-transform" />
            <h3 className="text-lg font-bold text-foreground mb-1">Bookings Manager</h3>
            <p className="text-xs text-muted-foreground">View upcoming stays and invoices</p>
          </Link>

          <Link
            href="/dashboard/maintenance"
            className="bg-card border border-border/60 rounded-2xl p-6 hover:border-indigo-300 dark:hover:border-indigo-700 transition-all group"
          >
            <Wrench className="h-8 w-8 mb-3 text-primary group-hover:scale-110 transition-transform" />
            <h3 className="text-lg font-bold text-foreground mb-1">Support & Repairs</h3>
            <p className="text-xs text-neutral-505 dark:text-neutral-400 font-medium">Submit and track maintenance requests</p>
          </Link>

          <Link
            href="/profile"
            className="bg-card border border-border/60 rounded-2xl p-6 hover:border-indigo-300 dark:hover:border-indigo-700 transition-all group"
          >
            <Settings className="h-8 w-8 mb-3 text-primary group-hover:scale-110 transition-transform" />
            <h3 className="text-lg font-bold text-foreground mb-1">Profile Settings</h3>
            <p className="text-xs text-muted-foreground">Update phone, email, and password</p>
          </Link>
        </div>

        {}
        <div className="bg-card border border-border/60 rounded-2xl p-6 space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
                <Sparkles className="h-4.5 w-4.5 text-indigo-500" />
                Featured Escapes
              </h2>
              <p className="text-xs text-neutral-500">Handpicked properties available to rent today</p>
            </div>
            <Link href="/listings" className="text-xs font-bold text-primary hover:underline">
              View all listings &rarr;
            </Link>
          </div>

          {loading ? (
            <div className="py-12 flex justify-center">
              <div className="h-6 w-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
          ) : recentListings.length === 0 ? (
            <div className="text-center py-12 text-neutral-400 text-xs">
              No listings posted yet. Please check back later.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {recentListings.map((listing) => (
                <Link
                  href="/listings"
                  key={listing._id}
                  className="group block border border-neutral-100 dark:border-neutral-800 rounded-xl overflow-hidden bg-neutral-50/50 dark:bg-neutral-950/20 hover:shadow-md transition-all"
                >
                  <div className="h-28 w-full" style={getCoverStyle(listing.image)} />
                  <div className="p-3.5 space-y-1.5">
                    <h4 className="text-xs font-bold text-foreground group-hover:text-indigo-600 dark:group-hover:text-violet-400 line-clamp-1 transition-colors">
                      {listing.title}
                    </h4>
                    <div className="flex items-center justify-between text-[11px] text-neutral-500">
                      <span className="flex items-center gap-0.5">
                        <MapPin className="h-3 w-3 text-indigo-500" />
                        {listing.location}
                      </span>
                      <span className="font-extrabold text-foreground">
                        ₹{listing.price.toLocaleString("en-IN")}
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

          {}
          <div className="bg-card border border-border/60 rounded-2xl p-6 space-y-6 shadow-sm">
            <div className="space-y-1">
              <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
                <Calendar className="h-4.5 w-4.5 text-indigo-600" />
                Property Reservations
              </h2>
              <p className="text-xs text-neutral-500">Track stays in properties and vacations</p>
            </div>

            {bookingsLoading ? (
              <div className="py-8 flex justify-center">
                <div className="h-6 w-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              </div>
            ) : propertyBookings.length === 0 ? (
              <div className="text-center py-12 text-neutral-500 text-xs border border-dashed border-neutral-200 dark:border-neutral-850 rounded-xl space-y-2">
                <Calendar className="h-8 w-8 mx-auto text-neutral-350 dark:text-neutral-705" />
                <p>No property bookings reserved yet.</p>
              </div>
            ) : (
              <div className="space-y-4 max-h-[400px] overflow-y-auto pr-1">
                {propertyBookings.map((booking) => {
                  const itemTitle = booking.listing?.title;
                  const itemCategory = booking.listing?.category;
                  const itemCover = booking.listing?.image;
                  return (
                    <div key={booking._id} className="flex gap-4 p-4 border border-neutral-150 dark:border-neutral-850 rounded-xl bg-neutral-50/50 dark:bg-neutral-950/20">
                      <div className="w-20 h-20 rounded-lg shrink-0 overflow-hidden" style={getCoverStyle(itemCover || "")} />
                      <div className="flex-grow flex flex-col justify-between space-y-1.5">
                        <div>
                          <div className="flex items-center justify-between gap-2">
                            <span className="px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300">
                              {itemCategory}
                            </span>
                            <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold capitalize ${
                              booking.status === 'confirmed'
                                ? 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400'
                                : booking.status === 'cancelled'
                                ? 'bg-red-50 dark:bg-red-950/30 text-red-700 dark:text-red-400'
                                : 'bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-400'
                            }`}>
                              {booking.status}
                            </span>
                          </div>
                          <h4 className="text-xs font-bold text-foreground line-clamp-1 mt-1">{itemTitle}</h4>
                        </div>
                        <div className="flex items-center justify-between text-[10px] text-neutral-500 border-t border-neutral-100 dark:border-neutral-800 pt-1.5">
                          <span>Starts: {new Date(booking.startDate).toLocaleDateString()} ({booking.duration} Nights)</span>
                          <strong className="text-neutral-800 dark:text-white">₹{booking.totalPrice?.toLocaleString("en-IN")}</strong>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {}
          <div className="bg-card border border-border/60 rounded-2xl p-6 space-y-6 shadow-sm">
            <div className="flex justify-between items-center">
              <div className="space-y-1">
                <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
                  <ShoppingBag className="h-4.5 w-4.5 text-violet-600" />
                  Product Leases (Rentals)
                </h2>
                <p className="text-xs text-neutral-505">Track appliance, furniture, and electronic rentals</p>
              </div>
              <Link href="/dashboard/active-rentals" className="text-xs font-bold text-indigo-650 dark:text-violet-400 hover:underline">
                Manage Leases &rarr;
              </Link>
            </div>

            {rentalsLoading ? (
              <div className="py-8 flex justify-center">
                <div className="h-6 w-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              </div>
            ) : rentals.length === 0 ? (
              <div className="text-center py-12 text-neutral-500 text-xs border border-dashed border-neutral-200 dark:border-neutral-850 rounded-xl space-y-2">
                <ShoppingBag className="h-8 w-8 mx-auto text-neutral-350 dark:text-neutral-705" />
                <p>No product rentals leased yet.</p>
              </div>
            ) : (
              <div className="space-y-4 max-h-[400px] overflow-y-auto pr-1">
                {rentals.map((rental) => {
                  const itemTitle = rental.product?.name || "Leased Product";
                  const itemCategory = rental.product?.category;
                  const itemCover = rental.product?.images?.[0];

                  const getStatusClass = (s: string) => {
                    switch (s) {
                      case "Pending": return "bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-400";
                      case "Approved": return "bg-blue-50 dark:bg-blue-950/30 text-blue-700 dark:text-blue-400";
                      case "Delivered": return "bg-indigo-50 dark:bg-indigo-950/30 text-indigo-700 dark:text-indigo-400";
                      case "Active": return "bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400";
                      case "Returned": return "bg-neutral-100 dark:bg-neutral-800 text-muted-foreground";
                      case "Cancelled": return "bg-red-50 dark:bg-red-950/30 text-red-700 dark:text-red-400";
                      default: return "bg-neutral-50 dark:bg-neutral-800 text-neutral-600";
                    }
                  };

                  return (
                    <div key={rental._id} className="flex gap-4 p-4 border border-neutral-150 dark:border-neutral-850 rounded-xl bg-neutral-50/50 dark:bg-neutral-950/20">
                      <div className="w-20 h-20 rounded-lg shrink-0 overflow-hidden" style={getCoverStyle(itemCover || "")} />
                      <div className="flex-grow flex flex-col justify-between space-y-1.5">
                        <div>
                          <div className="flex items-center justify-between gap-2">
                            <span className="px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider bg-violet-50 dark:bg-violet-950/40 text-violet-700 dark:text-violet-300">
                              {itemCategory}
                            </span>
                            <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${getStatusClass(rental.status)}`}>
                              {rental.status}
                            </span>
                          </div>
                          <h4 className="text-xs font-bold text-foreground line-clamp-1 mt-1">{itemTitle} (Qty: {rental.quantity})</h4>
                        </div>
                        <div className="text-[10px] text-neutral-500 border-t border-neutral-100 dark:border-neutral-800 pt-1.5 space-y-1">
                          <div className="flex justify-between">
                            <span>Delivery: <strong>{new Date(rental.deliveryDate).toLocaleDateString()}</strong></span>
                            <span>Ends: <strong>{new Date(rental.endDate).toLocaleDateString()}</strong></span>
                          </div>
                          <div className="flex justify-between items-center text-[9px] text-neutral-400 gap-2">
                            <span className="truncate max-w-[130px] sm:max-w-[160px]">Address: {rental.deliveryAddress}</span>
                            <strong className="text-neutral-800 dark:text-white text-[10px] shrink-0">Due Now: ₹{rental.totalPrice?.toLocaleString("en-IN")}</strong>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

        </div>

        {}
        <div className="bg-card border border-border/60 rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <User className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-bold text-foreground">Account Details</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div>
              <p className="text-muted-foreground mb-1 font-medium">Full Name</p>
              <p className="font-bold text-neutral-800 dark:text-neutral-250">{user.name}</p>
            </div>
            <div>
              <p className="text-muted-foreground mb-1 font-medium">Registered Email</p>
              <p className="font-bold text-neutral-800 dark:text-neutral-250">{user.email}</p>
            </div>
            <div>
              <p className="text-muted-foreground mb-1 font-medium">Contact Phone</p>
              <p className="font-bold text-neutral-800 dark:text-neutral-250">{user.phone || "Not provided"}</p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
