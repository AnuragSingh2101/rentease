"use client";

import Link from "next/link";
import { Home, Mail } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-neutral-200 dark:border-white/[0.06] bg-neutral-50 dark:bg-background text-neutral-600 dark:text-neutral-400 transition-colors duration-200">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Logo and About */}
          <div className="space-y-4">
            <Link href="/" className="flex items-center space-x-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 text-white shadow-md">
                <Home className="h-5 w-5" />
              </div>
              <span className="text-xl font-bold tracking-tight text-neutral-900 dark:text-white">
                RentEase
              </span>
            </Link>
            <p className="text-sm">
              Discover and rent premium properties effortlessly. RentEase makes renting seamless, secure, and modern.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="hover:text-indigo-600 dark:hover:text-violet-400 transition-colors" aria-label="Twitter">
                <svg className="h-5 w-5 fill-current" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
              </a>
              <a href="#" className="hover:text-indigo-600 dark:hover:text-violet-400 transition-colors" aria-label="Instagram">
                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                  <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
                </svg>
              </a>
              <a href="#" className="hover:text-indigo-600 dark:hover:text-violet-400 transition-colors" aria-label="GitHub">
                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
                  <path d="M9 18c-4.51 2-5-2-7-2" />
                </svg>
              </a>
            </div>
          </div>

          {/* Quick Links: Discover */}
          <div>
            <h3 className="text-sm font-semibold text-neutral-950 dark:text-neutral-200 tracking-wider uppercase mb-4">
              Discover
            </h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/listings" className="hover:text-indigo-600 dark:hover:text-violet-400 transition-colors">
                  Explore Places
                </Link>
              </li>
              <li>
                <Link href="/host" className="hover:text-indigo-600 dark:hover:text-violet-400 transition-colors">
                  List Your Property
                </Link>
              </li>
              <li>
                <Link href="/services" className="hover:text-indigo-600 dark:hover:text-violet-400 transition-colors">
                  How it Works
                </Link>
              </li>
            </ul>
          </div>

          {/* Quick Links: Support */}
          <div>
            <h3 className="text-sm font-semibold text-neutral-950 dark:text-neutral-200 tracking-wider uppercase mb-4">
              Support
            </h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/help" className="hover:text-indigo-600 dark:hover:text-violet-400 transition-colors">
                  Help Center
                </Link>
              </li>
              <li>
                <Link href="/safety" className="hover:text-indigo-600 dark:hover:text-violet-400 transition-colors">
                  Trust & Safety
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-indigo-600 dark:hover:text-violet-400 transition-colors">
                  Contact Us
                </Link>
              </li>
            </ul>
          </div>

          {/* Subscription */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-neutral-950 dark:text-neutral-200 tracking-wider uppercase">
              Stay Updated
            </h3>
            <p className="text-sm">
              Subscribe to receive updates on premium properties and exclusive deals.
            </p>
            <form className="flex space-x-2" onSubmit={(e) => e.preventDefault()}>
              <input
                type="email"
                placeholder="Email Address"
                className="w-full rounded-lg border border-neutral-300 dark:border-neutral-800 bg-white dark:bg-neutral-900 px-3 py-2 text-sm placeholder-neutral-400 focus:border-indigo-500 focus:outline-none dark:text-white transition-colors"
                required
              />
              <button
                type="submit"
                className="rounded-lg bg-indigo-600 hover:bg-indigo-500 dark:bg-violet-600 dark:hover:bg-violet-500 p-2 text-white shadow-sm transition-colors"
              >
                <Mail className="h-4 w-4" />
              </button>
            </form>
          </div>
        </div>

        <div className="mt-8 border-t border-neutral-200 dark:border-white/[0.06] pt-8 flex flex-col sm:flex-row items-center justify-between text-xs">
          <p>&copy; {new Date().getFullYear()} RentEase Inc. All rights reserved.</p>
          <div className="flex space-x-6 mt-4 sm:mt-0">
            <a href="#" className="hover:text-neutral-950 dark:hover:text-white transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-neutral-950 dark:hover:text-white transition-colors">Terms of Service</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
