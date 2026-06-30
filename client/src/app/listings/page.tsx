"use client";

import * as React from "react";
import { api } from "@/lib/api";
import { SkeletonListingCard } from "@/components/skeleton-loader";
import { MapPin, Star, Search, SlidersHorizontal, Home, X, Phone, Mail, User, ShieldCheck, Sparkles, CheckCircle2, ChevronLeft, ChevronRight } from "lucide-react";

interface Listing {
  _id: string;
  title: string;
  description: string;
  location: string;
  price: number;
  category: string;
  rating: number;
  image: string;
  vendor?: {
    name: string;
    email: string;
    phone?: string;
  };
  createdAt: string;
}

const CATEGORIES = ["All", "Trending", "Beachfront", "Cabins", "Heritage", "Villas", "Apartments", "Others"];

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

export default function ListingsPage() {
  const [listings, setListings] = React.useState<Listing[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);


  const [searchTerm, setSearchTerm] = React.useState("");
  const [selectedCategory, setSelectedCategory] = React.useState("All");
  const [locationSearch, setLocationSearch] = React.useState("");


  const [page, setPage] = React.useState(1);
  const [totalPages, setTotalPages] = React.useState(1);
  const [totalCount, setTotalCount] = React.useState(0);


  const [selectedListing, setSelectedListing] = React.useState<Listing | null>(null);
  const [bookingSuccess, setBookingSuccess] = React.useState(false);
  const [bookingDays, setBookingDays] = React.useState(3);

  const handlePrevPage = () => {
    if (page > 1) setPage(page - 1);
  };

  const handleNextPage = () => {
    if (page < totalPages) setPage(page + 1);
  };

  const fetchListings = React.useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      let endpoint = "/listings";
      const params = new URLSearchParams();

      if (selectedCategory && selectedCategory !== "All") {
        params.append("category", selectedCategory);
      }
      if (locationSearch) {
        params.append("location", locationSearch);
      }
      if (searchTerm) {
        params.append("search", searchTerm);
      }
      params.append("page", page.toString());
      params.append("limit", "8");

      const queryString = params.toString();
      if (queryString) {
        endpoint += `?${queryString}`;
      }

      interface ApiResponse {
        success: boolean;
        count: number;
        page: number;
        totalPages: number;
        data: Listing[];
      }
      const res = await api.get<ApiResponse>(endpoint);
      setListings(res.data || []);
      setTotalPages(res.totalPages || 1);
      setTotalCount(res.count || 0);
    } catch (err) {
      console.error(err);
      setError("Failed to fetch listings. Please verify the backend is running.");
    } finally {
      setLoading(false);
    }
  }, [selectedCategory, locationSearch, searchTerm, page]);

  React.useEffect(() => {
    fetchListings();
  }, [fetchListings]);

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
      }, 3000);
    } catch (err) {
      alert("Failed to create booking: " + (err instanceof Error ? err.message : "Error"));
    }
  };

  return (
    <div className="min-h-screen bg-muted/20 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">

        {}
        <div className="text-center space-y-3 max-w-2xl mx-auto">
          <div className="inline-flex items-center space-x-2 rounded-full border border-indigo-200 dark:border-neutral-800 bg-white/80 dark:bg-neutral-900/80 px-3 py-1 text-xs text-primary backdrop-blur-sm shadow-sm">
            <Sparkles className="h-3.5 w-3.5" />
            <span>Discover Verified Premium Spaces</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-foreground tracking-tight">
            Explore RentEase Properties
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            Book unique villas, beachfront lofts, rustic cabins, and luxury apartments verified for comfort.
          </p>
        </div>

        {}
        <div className="bg-card border border-border/60 p-4 sm:p-5 rounded-2xl shadow-md space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
              <input
                type="text"
                placeholder="Search title or description..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setPage(1);
                }}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-neutral-300 dark:border-neutral-800 bg-white dark:bg-neutral-950 text-sm focus:border-indigo-500 focus:outline-none dark:text-white transition-colors"
              />
            </div>

            {}
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
              <input
                type="text"
                placeholder="Filter by location (e.g. Goa, Manali)..."
                value={locationSearch}
                onChange={(e) => {
                  setLocationSearch(e.target.value);
                  setPage(1);
                }}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-neutral-300 dark:border-neutral-800 bg-white dark:bg-neutral-950 text-sm focus:border-indigo-500 focus:outline-none dark:text-white transition-colors"
              />
            </div>

            {}
            <button
              onClick={() => {
                setSearchTerm("");
                setLocationSearch("");
                setSelectedCategory("All");
                setPage(1);
              }}
              className="bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-neutral-700 dark:text-white font-medium py-2.5 px-4 rounded-xl flex items-center justify-center gap-2 text-sm transition-all duration-200 cursor-pointer"
            >
              <SlidersHorizontal className="h-4 w-4" />
              Reset All Filters
            </button>
          </div>

          {}
          <div className="pt-2 border-t border-neutral-100 dark:border-neutral-850">
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none scroll-smooth">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  onClick={() => {
                    setSelectedCategory(cat);
                    setPage(1);
                  }}
                  className={`px-4 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all duration-200 cursor-pointer ${
                    selectedCategory === cat
                      ? "bg-indigo-600 dark:bg-violet-600 text-white shadow-md shadow-indigo-500/10 scale-105"
                      : "bg-neutral-100 dark:bg-neutral-850 text-muted-foreground hover:bg-neutral-250 dark:hover:bg-neutral-800"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        </div>

        {}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, idx) => (
              <SkeletonListingCard key={idx} />
            ))}
          </div>
        ) : error ? (
          <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/40 rounded-2xl p-6 text-center max-w-lg mx-auto">
            <p className="text-red-600 dark:text-red-400 font-semibold">{error}</p>
            <button
              onClick={fetchListings}
              className="mt-3 text-xs bg-red-600 hover:bg-red-500 text-white font-semibold py-1.5 px-4 rounded-lg cursor-pointer"
            >
              Retry Connection
            </button>
          </div>
        ) : listings.length === 0 ? (
          <div className="bg-card border border-border/60 rounded-2xl py-16 text-center max-w-xl mx-auto space-y-4">
            <Home className="h-14 w-14 mx-auto text-neutral-300 dark:text-neutral-700 animate-bounce" />
            <div className="space-y-1">
              <h3 className="text-lg font-bold text-foreground">No properties found</h3>
              <p className="text-sm text-muted-foreground">
                Try resetting your search query or location filters to discover options.
              </p>
            </div>
            <button
              onClick={() => {
                setSearchTerm("");
                setLocationSearch("");
                setSelectedCategory("All");
                setPage(1);
              }}
              className="bg-indigo-600 dark:bg-violet-600 text-white font-semibold text-xs py-2 px-4 rounded-xl cursor-pointer"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="space-y-8">
            {}
            <div className="flex items-center justify-between text-xs text-muted-foreground pb-1">
              <p>
                Showing <span className="font-bold text-neutral-800 dark:text-white">{listings.length}</span> of{" "}
                <span className="font-bold text-neutral-800 dark:text-white">{totalCount}</span> properties
              </p>
              <p>
                Page <span className="font-bold text-neutral-800 dark:text-white">{page}</span> of {totalPages}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {listings.map((listing) => (
                <div
                  key={listing._id}
                  onClick={() => setSelectedListing(listing)}
                  className="group cursor-pointer bg-card border border-border/60 rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 flex flex-col h-full"
                >
                  {}
                  <div
                    className="w-full h-44 relative shrink-0 transition-transform duration-300"
                    style={getCoverStyle(listing.image)}
                  >
                    <div className="absolute inset-0 bg-neutral-950/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                      <span className="bg-white/95 dark:bg-neutral-950/95 text-foreground text-[11px] font-bold px-3 py-1.5 rounded-lg shadow-sm">
                        View Property Details
                      </span>
                    </div>
                    <div className="absolute top-3 left-3 bg-white/95 dark:bg-neutral-950/95 text-foreground text-[9px] font-extrabold px-2.5 py-1 rounded-full uppercase tracking-wider shadow-sm">
                      {listing.category}
                    </div>
                  </div>

                  {}
                  <div className="p-4 flex flex-col flex-grow justify-between gap-3">
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-muted-foreground flex items-center gap-1">
                          <MapPin className="h-3 w-3 text-indigo-500" />
                          {listing.location}
                        </span>
                        <span className="flex items-center gap-0.5 text-xs font-bold text-amber-500">
                          <Star className="h-3.5 w-3.5 fill-current" />
                          {listing.rating.toFixed(1)}
                        </span>
                      </div>
                      <h3 className="text-sm font-bold text-foreground group-hover:text-indigo-600 dark:group-hover:text-violet-400 line-clamp-1 transition-colors">
                        {listing.title}
                      </h3>
                      <p className="text-xs text-muted-foreground line-clamp-2">
                        {listing.description}
                      </p>
                    </div>

                    <div className="border-t border-neutral-100 dark:border-neutral-800 pt-3 flex items-center justify-between">
                      <div>
                        <span className="text-base font-extrabold text-foreground">
                          ₹{listing.price.toLocaleString("en-IN")}
                        </span>
                        <span className="text-[10px] text-neutral-400"> / night</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-4 pt-6 border-t border-neutral-100 dark:border-neutral-850">
                <button
                  onClick={handlePrevPage}
                  disabled={page === 1}
                  className="p-2 border border-neutral-300 dark:border-neutral-800 rounded-xl bg-card hover:bg-neutral-50 dark:hover:bg-neutral-800 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors"
                >
                  <ChevronLeft className="h-4 w-4 text-neutral-700 dark:text-white" />
                </button>
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                    <button
                      key={p}
                      onClick={() => setPage(p)}
                      className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                        page === p
                          ? "bg-indigo-600 dark:bg-violet-600 text-white"
                          : "hover:bg-neutral-150 dark:hover:bg-neutral-800 text-muted-foreground"
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                </div>
                <button
                  onClick={handleNextPage}
                  disabled={page === totalPages}
                  className="p-2 border border-neutral-300 dark:border-neutral-800 rounded-xl bg-card hover:bg-neutral-50 dark:hover:bg-neutral-800 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors"
                >
                  <ChevronRight className="h-4 w-4 text-neutral-700 dark:text-white" />
                </button>
              </div>
            )}
          </div>
        )}

        {}
        {selectedListing && (
          <div
            onClick={() => setSelectedListing(null)}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-950/60 backdrop-blur-sm"
          >
            <div
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-2xl bg-card border border-border/60 rounded-2xl overflow-hidden shadow-2xl relative animate-in fade-in zoom-in duration-200 max-h-[90vh] flex flex-col"
            >

              {}
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

              {}
              <div className="p-6 overflow-y-auto space-y-6 flex-grow">
                {}
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <span className="flex items-center gap-1 text-sm font-bold text-amber-500">
                      <Star className="h-4 w-4 fill-current" />
                      {selectedListing.rating.toFixed(1)}
                    </span>
                    <span className="text-neutral-300 dark:text-neutral-700">|</span>
                    <span className="text-sm font-semibold text-muted-foreground flex items-center gap-1">
                      <MapPin className="h-4 w-4 text-indigo-500" />
                      {selectedListing.location}
                    </span>
                  </div>
                  <h2 className="text-xl font-extrabold text-foreground">
                    {selectedListing.title}
                  </h2>
                </div>

                {}
                <div className="space-y-2">
                  <h4 className="text-xs font-bold text-neutral-400 uppercase tracking-wider">About this space</h4>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {selectedListing.description}
                  </p>
                </div>

                {}
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
                          <span>Phone: {selectedListing.vendor.phone}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {}
                <div className="bg-indigo-50/50 dark:bg-neutral-950 p-4 rounded-xl border border-indigo-100/50 dark:border-neutral-850 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="text-left w-full sm:w-auto">
                    <span className="text-[10px] uppercase font-bold text-neutral-400">Price details</span>
                    <div className="flex items-baseline gap-1 mt-0.5">
                      <span className="text-2xl font-extrabold text-foreground">
                        ₹{selectedListing.price.toLocaleString("en-IN")}
                      </span>
                      <span className="text-xs text-neutral-500">/ night</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 w-full sm:w-auto shrink-0 justify-end">
                    <div className="flex flex-col text-left shrink-0">
                      <label className="text-[9px] uppercase font-bold text-neutral-400">Stay Duration</label>
                      <select
                        value={bookingDays}
                        onChange={(e) => setBookingDays(Number(e.target.value))}
                        className="text-xs font-bold border border-neutral-300 dark:border-neutral-800 bg-card text-neutral-700 dark:text-white rounded px-2 py-1 focus:outline-none"
                      >
                        {[1, 2, 3, 5, 7, 10, 14].map((d) => (
                          <option key={d} value={d}>{d} Nights</option>
                        ))}
                      </select>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="text-[9px] uppercase font-bold text-neutral-400">Estimated Total</span>
                      <p className="text-sm font-extrabold text-primary">
                        ₹{(selectedListing.price * bookingDays).toLocaleString("en-IN")}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {}
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
    </div>
  );
}
