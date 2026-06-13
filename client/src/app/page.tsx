"use client";

import * as React from "react";
import Link from "next/link";
import { Search, MapPin, Calendar, Users, Star, Shield, Zap, Sparkles } from "lucide-react";

interface Listing {
  id: string;
  title: string;
  location: string;
  price: number;
  rating: number;
  image: string;
  category: string;
}

const MOCK_LISTINGS: Listing[] = [
  {
    id: "1",
    title: "Serene glass villa overlooking the valley",
    location: "Kasauli, Himachal Pradesh",
    price: 12000,
    rating: 4.9,
    image: "linear-gradient(to right bottom, #6366f1, #a855f7)",
    category: "Trending",
  },
  {
    id: "2",
    title: "Luxury Beachfront Condo with Infinity Pool",
    location: "Goa, India",
    price: 18500,
    rating: 4.85,
    image: "linear-gradient(to right bottom, #3b82f6, #06b6d4)",
    category: "Beachfront",
  },
  {
    id: "3",
    title: "Cozy A-frame Wooden Cabin in the Woods",
    location: "Manali, Himachal Pradesh",
    price: 6800,
    rating: 4.75,
    image: "linear-gradient(to right bottom, #f97316, #eab308)",
    category: "Cabins",
  },
  {
    id: "4",
    title: "Minimalist Heritage Loft in Historic District",
    location: "Pondicherry, India",
    price: 9200,
    rating: 4.92,
    image: "linear-gradient(to right bottom, #ec4899, #f43f5e)",
    category: "Heritage",
  },
];

export default function Home() {
  const [apiStatus, setApiStatus] = React.useState<"checking" | "connected" | "disconnected">("checking");
  const [apiVersion, setApiVersion] = React.useState<string | null>(null);
  const [user, setUser] = React.useState<{ name: string; role: string } | null>(null);

  React.useEffect(() => {
    // Check if user is logged in
    const stored = localStorage.getItem("rentease_user");
    if (stored) {
      try {
        setUser(JSON.parse(stored));
      } catch (e) {}
    }

    fetch("http://localhost:5000/")
      .then((res) => {
        if (!res.ok) throw new Error("Failed to connect");
        return res.json();
      })
      .then((data) => {
        setApiStatus("connected");
        setApiVersion(data.version || "1.0.0");
      })
      .catch((err) => {
        console.warn("Backend server not responding yet", err);
        setApiStatus("disconnected");
      });
  }, []);

  return (
    <div className="w-full flex flex-col gap-16 pb-16">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 md:pt-24 pb-16">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(45rem_50rem_at_top,var(--color-indigo-100),white)] dark:bg-[radial-gradient(45rem_50rem_at_top,var(--color-neutral-900),var(--color-neutral-950))] opacity-40" />
        
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center space-y-8 flex flex-col items-center">
          <div className="inline-flex items-center space-x-2 rounded-full border border-indigo-200 dark:border-neutral-800 bg-white/80 dark:bg-neutral-900/80 px-3 py-1 text-xs text-indigo-600 dark:text-violet-400 backdrop-blur-sm shadow-sm">
            <Sparkles className="h-3.5 w-3.5" />
            <span>Discover Premium Rental Escapes</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-neutral-900 dark:text-white max-w-3xl mx-auto leading-tight sm:leading-none">
            Find Your Next Perfect Stay with{" "}
            <span className="bg-gradient-to-r from-indigo-600 to-violet-500 bg-clip-text text-transparent">
              RentEase
            </span>
          </h1>
          
          <p className="text-lg text-neutral-600 dark:text-neutral-400 max-w-2xl mx-auto font-medium">
            Browse verified listings, secure bookings instantly, and enjoy a curated stay experience tailored to your lifestyle.
          </p>

          {user && (
            <div className="inline-flex items-center gap-3 bg-white/70 dark:bg-neutral-900/70 border border-neutral-250 dark:border-neutral-800 p-3 px-5 rounded-2xl shadow-md backdrop-blur-md animate-in fade-in slide-in-from-bottom-2 duration-300">
              <span className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                Logged in as <strong className="text-neutral-900 dark:text-white capitalize">{user.name}</strong> ({user.role})
              </span>
              <Link
                href={
                  user.role === "admin" ? "/admin/dashboard" :
                  user.role === "vendor" ? "/vendor/dashboard" :
                  "/dashboard"
                }
                className="bg-indigo-600 hover:bg-indigo-500 dark:bg-violet-600 dark:hover:bg-violet-500 text-white font-extrabold text-[11px] px-3.5 py-1.5 rounded-xl shadow-sm hover:shadow transition-all hover:scale-[1.03]"
              >
                Go to {user.role === "admin" ? "Admin Panel" : user.role === "vendor" ? "Vendor Dashboard" : "My Dashboard"} &rarr;
              </Link>
            </div>
          )}

          {/* Search bar */}
          <div className="max-w-4xl mx-auto rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-3 sm:p-4 shadow-xl shadow-neutral-100 dark:shadow-none flex flex-col md:flex-row items-center gap-4">
            <div className="flex items-center gap-2 flex-1 w-full border-b md:border-b-0 md:border-r border-neutral-100 dark:border-neutral-800 pb-3 md:pb-0 md:pr-4">
              <MapPin className="h-5 w-5 text-indigo-500 shrink-0" />
              <div className="text-left flex-grow">
                <label className="block text-[10px] uppercase font-bold text-neutral-400">Where to?</label>
                <input
                  type="text"
                  placeholder="Search destinations..."
                  className="w-full text-sm font-semibold bg-transparent border-0 focus:outline-none dark:text-white placeholder-neutral-400 p-0 mt-0.5"
                />
              </div>
            </div>

            <div className="flex items-center gap-2 flex-1 w-full border-b md:border-b-0 md:border-r border-neutral-100 dark:border-neutral-800 pb-3 md:pb-0 md:pr-4">
              <Calendar className="h-5 w-5 text-indigo-500 shrink-0" />
              <div className="text-left flex-grow">
                <label className="block text-[10px] uppercase font-bold text-neutral-400">Dates</label>
                <input
                  type="text"
                  placeholder="Add check-in / out"
                  className="w-full text-sm font-semibold bg-transparent border-0 focus:outline-none dark:text-white placeholder-neutral-400 p-0 mt-0.5"
                />
              </div>
            </div>

            <div className="flex items-center gap-2 flex-1 w-full pb-3 md:pb-0">
              <Users className="h-5 w-5 text-indigo-500 shrink-0" />
              <div className="text-left flex-grow">
                <label className="block text-[10px] uppercase font-bold text-neutral-400">Guests</label>
                <input
                  type="text"
                  placeholder="How many guests?"
                  className="w-full text-sm font-semibold bg-transparent border-0 focus:outline-none dark:text-white placeholder-neutral-400 p-0 mt-0.5"
                />
              </div>
            </div>

            <button className="w-full md:w-auto bg-indigo-600 hover:bg-indigo-500 dark:bg-violet-600 dark:hover:bg-violet-500 text-white font-semibold py-3 px-6 rounded-xl flex items-center justify-center gap-2 transition-all duration-200 shadow-md shadow-indigo-500/20 hover:scale-[1.02] cursor-pointer">
              <Search className="h-4 w-4" />
              Search
            </button>
          </div>
        </div>
      </section>

      {/* Featured Listings */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between mb-8">
          <div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-neutral-900 dark:text-white">
              Trending Experiences
            </h2>
            <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">
              Top rated properties with premium amenities
            </p>
          </div>
          <Link href="/listings" className="text-sm font-semibold text-indigo-600 dark:text-violet-400 hover:underline">
            View all listings &rarr;
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {MOCK_LISTINGS.map((listing) => (
            <div
              key={listing.id}
              className="group relative rounded-2xl border border-neutral-200/60 dark:border-neutral-800 bg-white dark:bg-neutral-900 overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 flex flex-col h-full"
            >
              {/* Image Container with Gradient */}
              <div
                className="w-full h-48 relative transition-transform duration-300"
                style={{ background: listing.image }}
              >
                <div className="absolute inset-0 bg-neutral-950/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                  <span className="bg-white/95 dark:bg-neutral-950/95 text-neutral-900 dark:text-white text-xs font-bold px-3 py-1.5 rounded-lg shadow-sm">
                    View Details
                  </span>
                </div>
                <div className="absolute top-3 left-3 bg-white/95 dark:bg-neutral-950/95 text-neutral-900 dark:text-white text-[10px] font-extrabold px-2.5 py-1 rounded-full uppercase tracking-wider shadow-sm">
                  {listing.category}
                </div>
              </div>

              {/* Listing details */}
              <div className="p-4 flex flex-col flex-grow justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-neutral-500 dark:text-neutral-400 flex items-center gap-1">
                      <MapPin className="h-3 w-3 text-indigo-500" />
                      {listing.location}
                    </span>
                    <span className="flex items-center gap-0.5 text-xs font-bold text-amber-500">
                      <Star className="h-3.5 w-3.5 fill-current" />
                      {listing.rating}
                    </span>
                  </div>
                  <h3 className="text-sm font-bold text-neutral-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-violet-400 line-clamp-1 transition-colors">
                    {listing.title}
                  </h3>
                </div>

                <div className="border-t border-neutral-100 dark:border-neutral-800 pt-3 flex items-center justify-between">
                  <div>
                    <span className="text-lg font-extrabold text-neutral-900 dark:text-white">
                      ₹{listing.price.toLocaleString("en-IN")}
                    </span>
                    <span className="text-xs text-neutral-400"> / night</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Trust / Core Value Props */}
      <section className="bg-neutral-50 dark:bg-neutral-950/40 border-y border-neutral-200/50 dark:border-neutral-800/50 py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="flex gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-violet-400 border border-indigo-100 dark:border-indigo-950">
              <Shield className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-neutral-900 dark:text-white">Verified Properties</h3>
              <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">
                Every listing on our platform undergoes a rigorous screening process to guarantee authenticity.
              </p>
            </div>
          </div>
          <div className="flex gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-violet-400 border border-indigo-100 dark:border-indigo-950">
              <Zap className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-neutral-900 dark:text-white">Instant Booking</h3>
              <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">
                No endless waiting for host confirmations. Find a place, reserve it instantly, and secure your plans.
              </p>
            </div>
          </div>
          <div className="flex gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-violet-400 border border-indigo-100 dark:border-indigo-950">
              <Star className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-neutral-900 dark:text-white">Premium Quality</h3>
              <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">
                We prioritize listings with modern design, top-tier amenities, and highly responsive hosts.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* API Connection Health Check Status banner */}
      <section className="mx-auto max-w-lg px-4">
        <div className="rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-4 text-center shadow-sm">
          <h4 className="text-xs uppercase tracking-wider font-extrabold text-neutral-400">
            RentEase Server Connection Status
          </h4>
          <div className="mt-3 flex items-center justify-center gap-2">
            <span className={`h-2.5 w-2.5 rounded-full ${
              apiStatus === "connected" ? "bg-emerald-500 animate-pulse" :
              apiStatus === "checking" ? "bg-amber-500 animate-pulse" :
              "bg-rose-500 animate-pulse"
            }`} />
            <span className="text-sm font-semibold dark:text-white">
              {apiStatus === "connected" ? `Connected (v${apiVersion})` :
               apiStatus === "checking" ? "Verifying connection..." :
               "Disconnected (Backend Offline)"}
            </span>
          </div>
          {apiStatus === "disconnected" && (
            <p className="text-[11px] text-neutral-400 mt-2">
              Start the backend Express server using <code className="bg-neutral-100 dark:bg-neutral-850 px-1 py-0.5 rounded">npm run dev</code> to verify full communication.
            </p>
          )}
        </div>
      </section>
    </div>
  );
}
