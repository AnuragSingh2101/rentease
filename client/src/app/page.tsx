"use client";

import * as React from "react";
import Link from "next/link";
import { Search, MapPin, Calendar, Users, Star, Shield, Zap, Sparkles, ArrowRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

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
    image: "linear-gradient(135deg, oklch(0.511 0.209 280), oklch(0.607 0.22 301))",
    category: "Trending",
  },
  {
    id: "2",
    title: "Luxury Beachfront Condo with Infinity Pool",
    location: "Goa, India",
    price: 18500,
    rating: 4.85,
    image: "linear-gradient(135deg, oklch(0.55 0.18 250), oklch(0.65 0.14 200))",
    category: "Beachfront",
  },
  {
    id: "3",
    title: "Cozy A-frame Wooden Cabin in the Woods",
    location: "Manali, Himachal Pradesh",
    price: 6800,
    rating: 4.75,
    image: "linear-gradient(135deg, oklch(0.65 0.18 55), oklch(0.75 0.15 85))",
    category: "Cabins",
  },
  {
    id: "4",
    title: "Minimalist Heritage Loft in Historic District",
    location: "Pondicherry, India",
    price: 9200,
    rating: 4.92,
    image: "linear-gradient(135deg, oklch(0.6 0.2 350), oklch(0.55 0.22 15))",
    category: "Heritage",
  },
];

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
  const [apiStatus, setApiStatus] = React.useState<"checking" | "connected" | "disconnected">("checking");
  const [apiVersion, setApiVersion] = React.useState<string | null>(null);
  const [user, setUser] = React.useState<{ name: string; role: string } | null>(null);

  React.useEffect(() => {
    const stored = localStorage.getItem("rentease_user");
    if (stored) {
      try {
        setUser(JSON.parse(stored));
      } catch {}
    }

    const rootUrl = process.env.NEXT_PUBLIC_API_URL?.endsWith('/api')
      ? process.env.NEXT_PUBLIC_API_URL.slice(0, -4)
      : process.env.NEXT_PUBLIC_API_URL;
    fetch(rootUrl!)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to connect");
        return res.json();
      })
      .then((data) => {
        setApiStatus("connected");
        setApiVersion(data.version || "1.0.0");
      })
      .catch(() => setApiStatus("disconnected"));
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
                  <Input placeholder="Search destinations..." className="border-0 shadow-none px-0 h-8 focus-visible:ring-0" />
                </div>
              </div>
              <div className="flex items-center gap-3 flex-1 md:border-r border-border/60 md:px-4 pb-3 md:pb-0 border-b md:border-b-0">
                <Calendar className="h-4 w-4 text-primary shrink-0" />
                <div className="text-left flex-1">
                  <label className="saas-label">Dates</label>
                  <Input placeholder="Check-in / Check-out" className="border-0 shadow-none px-0 h-8 focus-visible:ring-0" />
                </div>
              </div>
              <div className="flex items-center gap-3 flex-1 md:px-4">
                <Users className="h-4 w-4 text-primary shrink-0" />
                <div className="text-left flex-1">
                  <label className="saas-label">Guests</label>
                  <Input placeholder="How many?" className="border-0 shadow-none px-0 h-8 focus-visible:ring-0" />
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
            {MOCK_LISTINGS.map((listing) => (
              <Card key={listing.id} className="group overflow-hidden saas-card-hover p-0 gap-0">
                <div className="relative h-48 transition-transform duration-300 group-hover:scale-[1.02]" style={{ background: listing.image }}>
                  <div className="absolute inset-0 bg-foreground/0 group-hover:bg-foreground/10 transition-colors flex items-center justify-center">
                    <span className="opacity-0 group-hover:opacity-100 transition-opacity bg-background text-foreground text-xs font-semibold px-3 py-1.5 rounded-lg shadow-sm">
                      View Details
                    </span>
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
            ))}
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

      {/* API Status */}
      
      <section className="page-container pb-16 pt-4">
        <Card className="mx-auto max-w-md p-5 text-center">
          <p className="text-xs uppercase tracking-wider font-semibold text-muted-foreground">Server Connection</p>
          <div className="mt-3 flex items-center justify-center gap-2">
            <span className={`h-2 w-2 rounded-full ${
              apiStatus === "connected" ? "bg-emerald-500" :
              apiStatus === "checking" ? "bg-amber-500 animate-pulse" :
              "bg-red-500"
            }`} />
            <span className="text-sm font-medium">
              {apiStatus === "connected" ? `Connected (v${apiVersion})` :
               apiStatus === "checking" ? "Verifying connection..." :
               "Disconnected"}
            </span>
          </div>
          {apiStatus === "disconnected" && (
            <p className="text-xs text-muted-foreground mt-2">
              Start the backend with <code className="rounded bg-muted px-1.5 py-0.5 text-foreground">npm run dev</code>
            </p>
          )}
        </Card>
      </section>
    </div>
  );
}
