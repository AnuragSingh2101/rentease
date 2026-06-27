"use client";

import Link from "next/link";
import { Home, Mail } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export function Footer() {
  return (
    <footer className="border-t border-border/60 bg-muted/30 mt-auto">
      <div className="page-container py-14">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 lg:gap-12">
          <div className="space-y-4 md:col-span-1">
            <Link href="/" className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm">
                <Home className="h-4 w-4" />
              </div>
              <span className="text-lg font-bold tracking-tight text-foreground">RentEase</span>
            </Link>
            <p className="text-sm text-muted-foreground leading-relaxed max-w-xs">
              Discover and rent premium properties effortlessly. Seamless, secure, and built for modern renters.
            </p>
            <div className="flex gap-3">
              {["Twitter", "Instagram", "GitHub"].map((label) => (
                <a
                  key={label}
                  href="#"
                  className="flex h-9 w-9 items-center justify-center rounded-lg border border-border/60 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                  aria-label={label}
                >
                  <span className="text-xs font-medium">{label[0]}</span>
                </a>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-xs font-semibold text-foreground uppercase tracking-wider mb-4">Discover</h3>
            <ul className="space-y-3 text-sm">
              {[
                { href: "/listings", label: "Explore Places" },
                { href: "/products", label: "Rent Products" },
                { href: "/about", label: "How it Works" },
              ].map(({ href, label }) => (
                <li key={href}>
                  <Link href={href} className="text-muted-foreground hover:text-foreground transition-colors">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-xs font-semibold text-foreground uppercase tracking-wider mb-4">Support</h3>
            <ul className="space-y-3 text-sm">
              {[
                { href: "/dashboard/maintenance", label: "Help Center" },
                { href: "/about", label: "Trust & Safety" },
                { href: "/profile", label: "Contact Us" },
              ].map(({ href, label }) => (
                <li key={label}>
                  <Link href={href} className="text-muted-foreground hover:text-foreground transition-colors">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="space-y-4">
            <h3 className="text-xs font-semibold text-foreground uppercase tracking-wider">Stay Updated</h3>
            <p className="text-sm text-muted-foreground">
              Get updates on premium properties and exclusive deals.
            </p>
            <form className="flex gap-2" onSubmit={(e) => e.preventDefault()}>
              <Input type="email" placeholder="you@email.com" className="flex-1" required />
              <Button type="submit" size="icon" aria-label="Subscribe">
                <Mail className="h-4 w-4" />
              </Button>
            </form>
          </div>
        </div>

        <div className="saas-divider mt-12 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} RentEase Inc. All rights reserved.</p>
          <div className="flex gap-6">
            <a href="#" className="hover:text-foreground transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-foreground transition-colors">Terms of Service</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
