"use client";

import * as React from "react";
import Link from "next/link";
import { Search, MapPin, Calendar, Users, Star, Shield, Zap, Sparkles, ArrowRight, X, CheckCircle2, User, ShieldCheck, Mail, Phone } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { api } from "@/lib/api";
import { SkeletonListingCard } from "@/components/skeleton-loader";

interface Listing {
  _id: string;
  title: string;
  location: string;
  price: number;
  rating: number;
  image: string;
  category: string;
  description: string;
  vendor?: {
    name: string;
    email: string;
    phone?: string;
  };
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

const FEATURES = [
  {
    icon: Shield,
    title: "Verified Properties",
    description: "Every listing undergoes rigorous screening to guarantee authenticity and quality.",
  },
  {
    icon: Zap,
    title: "Instant Booking",
    description: "No endless waiting. Find a place, reserve instantly, and secure your plans.",
  },
  {
    icon: Star,
    title: "Premium Quality",
    description: "Modern design, top-tier amenities, and highly responsive hosts.",
  },
];

export default function Home() {
  const [user, setUser] = React.useState<{ name: string; role: string } | null>(null);
  const [listings, setListings] = React.useState<Listing[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [selectedListing, setSelectedListing] = React.useState<Listing | null>(null);
  const [bookingSuccess, setBookingSuccess] = React.useState(false);
  const [bookingDays, setBookingDays] = React.useState(3);

  const handleBook = async () => {
    if (!selectedListing) return;

    const token = typeof window !== "undefined" ? localStorage.getItem("rentease_token") : null;
    if (!token) {
      window.location.href = "/login";
      return;
    }

    try {
      await api.post("/bookings", {
        bookingType: "listing",
        listing: selectedListing._id,
        startDate: new Date(),
        duration: bookingDays
      });
      setBookingSuccess(true);
      setTimeout(() => {
        setBookingSuccess(false);
        setSelectedListing(null);
      }, 2500);
    } catch (err) {
      alert("Failed to create booking: " + (err instanceof Error ? err.message : "Error"));
    }
  };

  React.useEffect(() => {
    const stored = localStorage.getItem("rentease_user");
    if (stored) {
      try {
        setUser(JSON.parse(stored));
      } catch {}
    }

    const fetchTrendingListings = async () => {
      try {
        interface ApiResponse {
          success: boolean;
          data: Listing[];
        }
        const res = await api.get<ApiResponse>("/listings?category=Trending&limit=4");
        setListings(res.data || []);
      } catch (err) {
        console.error("Failed to fetch trending listings:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchTrendingListings();
  }, []);

  return (
    <div className="flex flex-col">
      {/* Hero */}
      <section className="relative overflow-hidden page-section pb-8">
        <div className="absolute inset-0 saas-grid-bg opacity-40 -z-10" aria-hidden />
        <div className="page-container text-center">
          <div className="mx-auto max-w-3xl space-y-6">
            <Badge variant="brand" className="mx-auto">
              <Sparkles className="h-3 w-3" />
              Discover Premium Rental Escapes
            </Badge>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight">
              Find your next perfect stay with{" "}
              <span className="text-primary">RentEase</span>
            </h1>

            <p className="text-base sm:text-lg text-muted-foreground max-w-xl mx-auto">
              Browse verified listings, secure bookings instantly, and enjoy a curated stay experience tailored to your lifestyle.
            </p>

            {user && (
              <Card className="inline-flex items-center gap-4 px-5 py-3 animate-in fade-in slide-in-from-bottom-2">
                <span className="text-sm text-muted-foreground">
                  Welcome back, <strong className="text-foreground capitalize">{user.name}</strong>
                </span>
                <Button size="sm" asChild>
                  <Link
                    href={
                      user.role === "admin" ? "/admin/dashboard" :
                      user.role === "vendor" ? "/vendor/dashboard" :
                      "/dashboard"
                    }
                  >
                    Go to Dashboard
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </Button>
              </Card>
            )}
          </div>

          {/* Search bar */}
          <Card className="mx-auto mt-10 max-w-4xl p-3 sm:p-4 shadow-lg">
            <div className="flex flex-col md:flex-row items-stretch gap-3 md:gap-0">
              <div className="flex items-center gap-3 flex-1 md:border-r border-border/60 md:pr-4 pb-3 md:pb-0 border-b md:border-b-0">
                <MapPin className="h-4 w-4 text-primary shrink-0" />
                <div className="text-left flex-1">
                  <label className="saas-label">Where to?</label>
                  <input placeholder="Search destinations..." className="w-full bg-transparent border-0 outline-none px-0 h-8 focus:ring-0 text-sm text-foreground placeholder:text-muted-foreground" />
                </div>
              </div>
              <div className="flex items-center gap-3 flex-1 md:border-r border-border/60 md:px-4 pb-3 md:pb-0 border-b md:border-b-0">
                <Calendar className="h-4 w-4 text-primary shrink-0" />
                <div className="text-left flex-1">
                  <label className="saas-label">Dates</label>
                  <input placeholder="Check-in / Check-out" className="w-full bg-transparent border-0 outline-none px-0 h-8 focus:ring-0 text-sm text-foreground placeholder:text-muted-foreground" />
                </div>
              </div>
              <div className="flex items-center gap-3 flex-1 md:px-4">
                <Users className="h-4 w-4 text-primary shrink-0" />
                <div className="text-left flex-1">
                  <label className="saas-label">Guests</label>
                  <input placeholder="How many?" className="w-full bg-transparent border-0 outline-none px-0 h-8 focus:ring-0 text-sm text-foreground placeholder:text-muted-foreground" />
                </div>
              </div>
              <Button className="md:ml-3 h-11 px-6 rounded-xl shrink-0">
                <Search className="h-4 w-4" />
                Search
              </Button>
            </div>
          </Card>
        </div>
      </section>

      {/* Listings */}
      <section className="page-section pt-0">
        <div className="page-container">
          <div className="flex items-end justify-between mb-8 gap-4">
            <div className="page-header mb-0">
              <h2 className="page-title">Trending Experiences</h2>
              <p className="page-description">Top rated properties with premium amenities</p>
            </div>
            <Link href="/listings" className="text-sm font-medium text-primary hover:text-primary/80 shrink-0 flex items-center gap-1">
              View all <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {loading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <SkeletonListingCard key={i} />
              ))
            ) : listings.length === 0 ? (
              <div className="col-span-full text-center py-10 text-muted-foreground">
                No trending experiences available.
              </div>
            ) : (
              listings.map((listing) => (
                <Card key={listing._id} onClick={() => setSelectedListing(listing)} className="group overflow-hidden saas-card-hover p-0 gap-0 cursor-pointer">
                  <div className="relative h-48 transition-transform duration-300 group-hover:scale-[1.02]" style={getCoverStyle(listing.image)}>
                    <div className="absolute inset-0 bg-foreground/0 group-hover:bg-foreground/10 transition-colors flex items-center justify-center">
                      <button className="opacity-0 group-hover:opacity-100 transition-opacity bg-background text-foreground text-xs font-semibold px-3 py-1.5 rounded-lg shadow-sm cursor-pointer">
                        View Details
                      </button>
                    </div>
                    <Badge variant="outline" className="absolute top-3 left-3 bg-background/90 backdrop-blur-sm uppercase text-[10px]">
                      {listing.category}
                    </Badge>
                  </div>
                  <div className="p-4 space-y-3">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs text-muted-foreground flex items-center gap-1 truncate">
                        <MapPin className="h-3 w-3 text-primary shrink-0" />
                        {listing.location}
                      </span>
                      <span className="flex items-center gap-0.5 text-xs font-semibold text-amber-500 shrink-0">
                        <Star className="h-3.5 w-3.5 fill-current" />
                        {listing.rating}
                      </span>
                    </div>
                    <h3 className="text-sm font-semibold text-foreground line-clamp-1 group-hover:text-primary transition-colors">
                      {listing.title}
                    </h3>
                    <div className="saas-divider pt-3 flex items-baseline gap-1">
                      <span className="text-lg font-bold text-foreground">₹{listing.price.toLocaleString("en-IN")}</span>
                      <span className="text-xs text-muted-foreground">/ night</span>
                    </div>
                  </div>
                </Card>
              ))
            )}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="border-y border-border/60 bg-muted/30 py-14">
        <div className="page-container grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12">
          {FEATURES.map(({ icon: Icon, title, description }) => (
            <div key={title} className="flex gap-4">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-accent text-accent-foreground border border-border/60">
                <Icon className="h-5 w-5" />
              </div>
              <div className="space-y-1.5">
                <h3 className="text-base font-semibold">{title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Details Modal */}
      {selectedListing && (
        <div
          onClick={() => setSelectedListing(null)}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-950/60 backdrop-blur-sm"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-2xl bg-card border border-border/60 rounded-2xl overflow-hidden shadow-2xl relative animate-in fade-in zoom-in duration-200 max-h-[90vh] flex flex-col"
          >
            {/* Cover Image */}
            <div
              className="w-full h-52 relative shrink-0"
              style={getCoverStyle(selectedListing.image)}
            >
              <button
                onClick={() => setSelectedListing(null)}
                className="absolute top-4 right-4 bg-neutral-950/40 hover:bg-neutral-950/65 text-white p-2 rounded-full transition-colors cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
              <div className="absolute bottom-4 left-4 bg-white/95 dark:bg-neutral-950/95 text-foreground text-[10px] font-extrabold px-3 py-1.5 rounded-full uppercase tracking-wider shadow-sm">
                {selectedListing.category}
              </div>
            </div>

            {/* Content */}
            <div className="p-6 overflow-y-auto space-y-6 flex-grow text-left">
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <span className="flex items-center gap-1 text-sm font-bold text-amber-500">
                    <Star className="h-4 w-4 fill-current" />
                    {selectedListing.rating.toFixed(1)}
                  </span>
                  <span className="text-neutral-300 dark:text-neutral-700">|</span>
                  <span className="text-sm font-semibold text-muted-foreground flex items-center gap-1">
                    <MapPin className="h-4 w-4 text-primary shrink-0" />
                    {selectedListing.location}
                  </span>
                </div>
                <h2 className="text-xl font-extrabold text-foreground">
                  {selectedListing.title}
                </h2>
              </div>

              <div className="space-y-2">
                <h4 className="text-xs font-bold text-neutral-400 uppercase tracking-wider">About this space</h4>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {selectedListing.description}
                </p>
              </div>

              {/* Host/Vendor Information */}
              {selectedListing.vendor && (
                <div className="bg-neutral-50 dark:bg-neutral-950 p-4 rounded-xl border border-neutral-200/50 dark:border-neutral-850 space-y-3">
                  <div className="flex items-center gap-2">
                    <User className="h-4.5 w-4.5 text-primary" />
                    <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                      Host Information
                    </h4>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
                      <span>Name: <strong className="text-neutral-700 dark:text-white">{selectedListing.vendor.name}</strong></span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Mail className="h-3.5 w-3.5" />
                      <span>{selectedListing.vendor.email}</span>
                    </div>
                    {selectedListing.vendor.phone && (
                      <div className="flex items-center gap-2 sm:col-span-2">
                        <Phone className="h-3.5 w-3.5" />
                        <span>{selectedListing.vendor.phone}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Booking Options */}
              <div className="bg-primary/5 dark:bg-neutral-950 p-4 rounded-xl border border-primary/10 dark:border-neutral-850 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div>
                  <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider block">Rental Duration</span>
                  <div className="flex items-center gap-2 mt-1">
                    {[3, 6, 12].map((d) => (
                      <button
                        key={d}
                        onClick={() => setBookingDays(d)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                          bookingDays === d
                            ? "bg-primary text-white"
                            : "bg-white dark:bg-neutral-900 border border-neutral-250/70 dark:border-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50"
                        }`}
                      >
                        {d} Months
                      </button>
                    ))}
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-neutral-400 block uppercase font-medium">Estimated Rent</span>
                  <p className="text-sm font-extrabold text-primary">
                    ₹{(selectedListing.price * bookingDays).toLocaleString("en-IN")}
                  </p>
                </div>
              </div>
            </div>

            {/* Actions Footer */}
            <div className="p-4 bg-neutral-50 dark:bg-neutral-950/60 border-t border-neutral-100 dark:border-neutral-850 shrink-0 flex items-center justify-between gap-4">
              <button
                onClick={() => setSelectedListing(null)}
                className="px-4 py-2 border border-neutral-300 dark:border-neutral-800 text-neutral-700 dark:text-white text-xs font-semibold rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
              >
                Cancel
              </button>

              {bookingSuccess ? (
                <div className="bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 px-4 py-2.5 rounded-lg flex items-center gap-2 text-xs font-bold border border-emerald-200 dark:border-emerald-900/40 animate-pulse">
                  <CheckCircle2 className="h-4.5 w-4.5 text-emerald-500" />
                  Booking Request Sent!
                </div>
              ) : (
                <button
                  onClick={handleBook}
                  className="bg-primary hover:bg-primary/90 text-white text-xs font-bold px-6 py-2.5 rounded-lg transition-colors cursor-pointer shadow-md shadow-indigo-500/15"
                >
                  Reserve Now
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
