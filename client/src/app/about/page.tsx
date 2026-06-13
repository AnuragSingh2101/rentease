import Link from "next/link";
import { Home, Users, ShieldCheck, Star, Compass, Package } from "lucide-react";

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950/20 py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-16">

        {/* Hero */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center space-x-2 rounded-full border border-indigo-200 dark:border-neutral-800 bg-white/80 dark:bg-neutral-900/80 px-4 py-1.5 text-xs text-indigo-600 dark:text-violet-400 backdrop-blur-sm shadow-sm">
            <Home className="h-3.5 w-3.5" />
            <span>About RentEase</span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-neutral-900 dark:text-white tracking-tight">
            Renting made{" "}
            <span className="bg-gradient-to-r from-indigo-600 to-violet-500 bg-clip-text text-transparent">
              simple
            </span>
          </h1>
          <p className="text-base text-neutral-500 dark:text-neutral-400 max-w-2xl mx-auto leading-relaxed">
            RentEase is a full-featured rental marketplace connecting customers with verified vendors
            for property stays and monthly product leases — all in one place.
          </p>
        </div>

        {/* Mission */}
        <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-3xl p-8 space-y-4 shadow-sm">
          <h2 className="text-xl font-extrabold text-neutral-900 dark:text-white">Our Mission</h2>
          <p className="text-sm text-neutral-600 dark:text-neutral-300 leading-relaxed">
            We believe access to quality homes and products shouldn&apos;t require ownership. RentEase
            bridges the gap between people who have space and things to share, and those who need
            them — offering transparent pricing, secure transactions, and a seamless experience from
            browse to delivery.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            {
              icon: Compass,
              title: "Verified Properties",
              description:
                "Browse villas, beachfront stays, heritage homes, and city apartments — all vetted by our team.",
              color: "bg-indigo-50 dark:bg-indigo-950/30 text-indigo-600 dark:text-indigo-400",
            },
            {
              icon: Package,
              title: "Monthly Product Rentals",
              description:
                "Rent furniture, appliances, electronics, and fitness equipment on flexible monthly leases.",
              color: "bg-violet-50 dark:bg-violet-950/30 text-violet-600 dark:text-violet-400",
            },
            {
              icon: ShieldCheck,
              title: "Secure & Transparent",
              description:
                "Deposits are fully refundable. Every transaction is protected and tracked in your dashboard.",
              color: "bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400",
            },
            {
              icon: Users,
              title: "Vendor Marketplace",
              description:
                "Vendors manage listings, track bookings, and grow their rental business — all from one dashboard.",
              color: "bg-amber-50 dark:bg-amber-950/30 text-amber-600 dark:text-amber-400",
            },
            {
              icon: Star,
              title: "Rated Experiences",
              description:
                "Every property carries a community rating so you can book with confidence every time.",
              color: "bg-rose-50 dark:bg-rose-950/30 text-rose-600 dark:text-rose-400",
            },
            {
              icon: Home,
              title: "End-to-End Managed",
              description:
                "From cart to delivery scheduling, RentEase handles every step of the rental lifecycle.",
              color: "bg-sky-50 dark:bg-sky-950/30 text-sky-600 dark:text-sky-400",
            },
          ].map(({ icon: Icon, title, description, color }) => (
            <div
              key={title}
              className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-6 space-y-3 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className={`h-10 w-10 rounded-xl flex items-center justify-center ${color}`}>
                <Icon className="h-5 w-5" />
              </div>
              <h3 className="text-sm font-bold text-neutral-900 dark:text-white">{title}</h3>
              <p className="text-xs text-neutral-500 dark:text-neutral-400 leading-relaxed">
                {description}
              </p>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="text-center space-y-4">
          <h2 className="text-2xl font-extrabold text-neutral-900 dark:text-white">
            Ready to get started?
          </h2>
          <p className="text-sm text-neutral-500 dark:text-neutral-400">
            Sign up as a customer to browse rentals, or as a vendor to list your properties and products.
          </p>
          <div className="flex items-center justify-center gap-4 flex-wrap">
            <Link
              href="/register"
              className="rounded-xl bg-indigo-600 hover:bg-indigo-500 dark:bg-violet-600 dark:hover:bg-violet-500 px-6 py-3 text-sm font-bold text-white shadow-md shadow-indigo-500/15 transition-all"
            >
              Create an Account
            </Link>
            <Link
              href="/listings"
              className="rounded-xl border border-neutral-300 dark:border-neutral-700 px-6 py-3 text-sm font-bold text-neutral-700 dark:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-all"
            >
              Explore Properties
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
}
