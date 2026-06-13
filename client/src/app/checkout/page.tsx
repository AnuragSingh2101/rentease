"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { api } from "@/lib/api";
import {
  ShoppingCart,
  MapPin,
  Calendar,
  Sparkles,
  AlertCircle,
  CheckCircle,
  ArrowLeft,
  Store,
  ShieldCheck,
  CreditCard,
  Truck
} from "lucide-react";

interface Product {
  _id: string;
  name: string;
  monthlyRent: number;
  deposit: number;
  images: string[];
  category: string;
  availableQuantity: number;
  tenureOptions: number[];
}

interface CartItem {
  _id: string;
  product: Product;
  quantity: number;
  tenure: number;
}

interface Cart {
  _id: string;
  user: string;
  items: CartItem[];
}

interface CartApiResponse {
  success: boolean;
  data: Cart;
}

interface RentalItem {
  product: string;
  quantity: number;
  tenure: number;
  endDate: string;
}

interface RentalResponse {
  success: boolean;
  data: RentalItem[];
}

export default function CheckoutPage() {
  const router = useRouter();
  const [cart, setCart] = React.useState<Cart | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  // Form Fields
  const [deliveryAddress, setDeliveryAddress] = React.useState("");
  const [deliveryDate, setDeliveryDate] = React.useState("");
  
  // Checkout Processing States
  const [checkoutLoading, setCheckoutLoading] = React.useState(false);
  const [checkoutSuccess, setCheckoutSuccess] = React.useState(false);
  const [confirmedRentals, setConfirmedRentals] = React.useState<RentalItem[]>([]);

  // Calculate default delivery date (2 days from today)
  React.useEffect(() => {
    const defaultDate = new Date();
    defaultDate.setDate(defaultDate.getDate() + 2);
    setDeliveryDate(defaultDate.toISOString().split("T")[0]);
  }, []);

  const fetchCart = React.useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem("rentease_token");
      if (!token) {
        router.push("/login");
        return;
      }
      const res = await api.get<CartApiResponse>("/cart");
      if (res.success) {
        setCart(res.data);
      } else {
        setError("Failed to load cart details.");
      }
    } catch (err) {
      console.error(err);
      setError("An error occurred while fetching your checkout details.");
    } finally {
      setLoading(false);
    }
  }, [router]);

  React.useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  const handleCheckoutSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cart || cart.items.length === 0) return;
    if (!deliveryAddress.trim()) {
      alert("Please provide a valid delivery address.");
      return;
    }
    if (!deliveryDate) {
      alert("Please specify a delivery date.");
      return;
    }

    setCheckoutLoading(true);
    try {
      const payload = {
        items: cart.items.map((item) => ({
          product: item.product._id,
          quantity: item.quantity,
          tenure: item.tenure
        })),
        deliveryDate,
        deliveryAddress
      };

      const res = await api.post<RentalResponse>("/rentals", payload);
      if (res.success && res.data && res.data.length > 0) {
        setConfirmedRentals(res.data);
        setCheckoutSuccess(true);
        window.dispatchEvent(new Event("cart-change"));
      } else {
        setError("Booking failed — server returned an unexpected response. Please try again.");
      }
    } catch (err) {
      setError("Checkout failed: " + (err instanceof Error ? err.message : "Unknown error. Check that the server is running."));
    } finally {
      setCheckoutLoading(false);
    }
  };

  // Pricing & Calculations
  const totalMonthlyRent = cart?.items.reduce((sum, item) => sum + (item.product.monthlyRent * item.quantity), 0) || 0;
  const totalDeposit = cart?.items.reduce((sum, item) => sum + (item.product.deposit * item.quantity), 0) || 0;
  const totalInitialDue = totalMonthlyRent + totalDeposit;

  // Minimum date for delivery (Tomorrow)
  const getMinDeliveryDate = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split("T")[0];
  };

  // Helper to calculate end date preview
  const getLeaseEndDate = (tenureMonths: number) => {
    if (!deliveryDate) return "";
    const start = new Date(deliveryDate);
    start.setMonth(start.getMonth() + tenureMonths);
    return start.toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' });
  };

  const getLeaseStartDate = () => {
    if (!deliveryDate) return "";
    return new Date(deliveryDate).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950 flex flex-col justify-center items-center">
        <div className="h-10 w-10 border-4 border-indigo-650 border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-xs text-neutral-500 font-semibold tracking-wider uppercase animate-pulse">Initializing Secure Checkout...</p>
      </div>
    );
  }

  if (checkoutSuccess) {
    return (
      <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950/20 py-16 px-4">
        <div className="max-w-2xl mx-auto bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-3xl p-8 space-y-6 shadow-xl animate-in zoom-in duration-300">
          <div className="text-center space-y-2">
            <CheckCircle className="h-16 w-16 mx-auto text-emerald-500 animate-bounce" />
            <h1 className="text-2xl font-extrabold text-neutral-900 dark:text-white">Rental Bookings Placed!</h1>
            <p className="text-sm text-neutral-500 dark:text-neutral-400">
              Your rental requests have been submitted to vendors. Track your shipment and status on your dashboard.
            </p>
          </div>

          <div className="p-5 bg-neutral-50 dark:bg-neutral-950 rounded-2xl border border-neutral-150 dark:border-neutral-850 space-y-4 text-xs">
            <h4 className="font-extrabold uppercase text-[10px] text-neutral-400 tracking-wider">Lease Details</h4>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-neutral-600 dark:text-neutral-400">
              <div>
                <span className="block text-[10px] uppercase font-bold text-neutral-400">Delivery Address</span>
                <span className="font-semibold text-neutral-800 dark:text-white mt-0.5 block">{deliveryAddress}</span>
              </div>
              <div>
                <span className="block text-[10px] uppercase font-bold text-neutral-400">Scheduled Start Date</span>
                <span className="font-semibold text-neutral-800 dark:text-white mt-0.5 block">{getLeaseStartDate()}</span>
              </div>
            </div>

            <div className="border-t border-neutral-200 dark:border-neutral-800 pt-3 space-y-1">
              <span className="block text-[10px] uppercase font-bold text-neutral-400 mb-1">Booked Items</span>
              {confirmedRentals.map((r, idx) => (
                <div key={idx} className="flex justify-between items-center text-neutral-700 dark:text-neutral-350">
                  <span>{r.quantity}x {cart?.items.find(item => item.product._id === r.product)?.product.name || "Leased Product"} ({r.tenure} Months)</span>
                  <span className="font-semibold text-neutral-900 dark:text-white">Lease Ends: {new Date(r.endDate).toLocaleDateString()}</span>
                </div>
              ))}
            </div>

            <div className="border-t border-neutral-200 dark:border-neutral-800 pt-3 flex justify-between items-center text-xs">
              <span className="font-bold text-neutral-750 dark:text-neutral-300">Initial Due Paid (Deposit + 1st Month)</span>
              <strong className="text-sm text-indigo-600 dark:text-violet-400">₹{totalInitialDue.toLocaleString("en-IN")}</strong>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <button
              onClick={() => router.push("/dashboard")}
              className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-500 dark:bg-violet-600 dark:hover:bg-violet-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-indigo-500/10 cursor-pointer text-center"
            >
              Go to Customer Dashboard
            </button>
            <button
              onClick={() => router.push("/products")}
              className="flex-1 py-3 border border-neutral-300 dark:border-neutral-800 text-neutral-750 dark:text-white font-semibold text-xs rounded-xl hover:bg-neutral-50 dark:hover:bg-neutral-800 cursor-pointer text-center"
            >
              Continue Shopping Products
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50/50 dark:bg-neutral-950/20 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-8">
        
        {/* Navigation Link */}
        <div className="flex items-center justify-between">
          <Link href="/cart" className="inline-flex items-center gap-1.5 text-xs text-neutral-450 hover:text-indigo-600 dark:hover:text-violet-400 font-bold transition-colors">
            <ArrowLeft className="h-4 w-4" />
            Back to Shopping Cart
          </Link>
          <div className="inline-flex items-center space-x-2 rounded-full border border-indigo-200 dark:border-neutral-850 bg-white dark:bg-neutral-900 px-3 py-1 text-xs text-indigo-650 dark:text-violet-400 backdrop-blur-sm shadow-sm">
            <Truck className="h-3.5 w-3.5" />
            <span>Shipping & Lease Calculations</span>
          </div>
        </div>

        {/* Title */}
        <h1 className="text-2xl sm:text-3xl font-extrabold text-neutral-900 dark:text-white tracking-tight flex items-center gap-2">
          <CreditCard className="h-7 w-7 text-indigo-500" />
          Secure Leased Checkout
        </h1>

        {error && (
          <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/40 rounded-2xl p-4 flex items-start gap-2.5 text-xs text-red-650 dark:text-red-400 max-w-lg">
            <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {!cart || cart.items.length === 0 ? (
          <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-3xl py-16 text-center max-w-xl mx-auto space-y-4 shadow-sm">
            <ShoppingCart className="h-16 w-16 mx-auto text-neutral-300 dark:text-neutral-750" />
            <h3 className="text-lg font-bold text-neutral-900 dark:text-white">Your cart is empty</h3>
            <button
              onClick={() => router.push("/products")}
              className="bg-indigo-600 hover:bg-indigo-500 dark:bg-violet-600 dark:hover:bg-violet-500 text-white font-bold text-xs py-2.5 px-6 rounded-xl cursor-pointer"
            >
              Browse Catalog
            </button>
          </div>
        ) : (
          <form onSubmit={handleCheckoutSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Left Column: Form & Lease Details (7 cols) */}
            <div className="lg:col-span-7 space-y-6">
              
              {/* Delivery Settings */}
              <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 p-6 rounded-2xl shadow-sm space-y-5">
                <h3 className="text-sm font-bold text-neutral-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                  <Truck className="h-4 w-4 text-indigo-500" />
                  Delivery & Shipping
                </h3>

                <div className="space-y-4">
                  {/* Delivery Address */}
                  <div className="space-y-1.5">
                    <label htmlFor="address" className="text-xs font-bold text-neutral-550 dark:text-neutral-300">
                      Shipping Delivery Address
                    </label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-3 h-4.5 w-4.5 text-neutral-400" />
                      <textarea
                        id="address"
                        required
                        rows={3}
                        value={deliveryAddress}
                        onChange={(e) => setDeliveryAddress(e.target.value)}
                        placeholder="Enter your street address, apartment, city, and pincode..."
                        className="w-full text-xs font-semibold bg-neutral-50 dark:bg-neutral-950 border border-neutral-300 dark:border-neutral-800 rounded-xl pl-10 pr-4 py-2.5 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 dark:text-white placeholder-neutral-400"
                      />
                    </div>
                  </div>

                  {/* Delivery Date */}
                  <div className="space-y-1.5">
                    <label htmlFor="deliveryDate" className="text-xs font-bold text-neutral-550 dark:text-neutral-300">
                      Preferred Delivery Date
                    </label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-2.5 h-4.5 w-4.5 text-neutral-400" />
                      <input
                        id="deliveryDate"
                        type="date"
                        required
                        min={getMinDeliveryDate()}
                        value={deliveryDate}
                        onChange={(e) => setDeliveryDate(e.target.value)}
                        className="w-full text-xs font-semibold bg-neutral-50 dark:bg-neutral-950 border border-neutral-300 dark:border-neutral-800 rounded-xl pl-10 pr-4 py-2.5 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 dark:text-white placeholder-neutral-400 cursor-pointer"
                      />
                    </div>
                    <span className="text-[10px] text-neutral-400">Lease cycle starts on the day of delivery.</span>
                  </div>
                </div>
              </div>

              {/* Lease Schedules Details */}
              {deliveryDate && (
                <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 p-6 rounded-2xl shadow-sm space-y-4">
                  <h3 className="text-sm font-bold text-neutral-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                    <Sparkles className="h-4.5 w-4.5 text-indigo-500" />
                    Lease Schedule Preview
                  </h3>
                  <div className="space-y-3">
                    <div className="flex justify-between text-xs text-neutral-600 dark:text-neutral-450 border-b border-neutral-100 dark:border-neutral-850 pb-2">
                      <span>Rent Start Date</span>
                      <strong className="text-neutral-800 dark:text-white">{getLeaseStartDate()}</strong>
                    </div>

                    <div className="space-y-2 pt-1">
                      <span className="text-[10px] uppercase font-bold text-neutral-400 tracking-wider block">Item Schedules</span>
                      {cart.items.map((item) => (
                        <div key={item._id} className="flex justify-between items-center text-xs">
                          <span className="text-neutral-500 dark:text-neutral-400">{item.product.name} ({item.tenure} Months)</span>
                          <strong className="text-neutral-800 dark:text-white">Ends: {getLeaseEndDate(item.tenure)}</strong>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Right Column: Order Review & Pricing Summary (5 cols) */}
            <div className="lg:col-span-5 space-y-6">
              
              {/* Order Items Summary */}
              <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 p-6 rounded-2xl shadow-sm space-y-4">
                <h3 className="text-xs font-bold text-neutral-450 uppercase tracking-wider">Order Items</h3>
                <div className="space-y-3.5 max-h-56 overflow-y-auto pr-1">
                  {cart.items.map((item) => (
                    <div key={item._id} className="flex items-center justify-between gap-3 text-xs">
                      <div className="space-y-0.5">
                        <span className="font-bold text-neutral-800 dark:text-white line-clamp-1">{item.product.name}</span>
                        <span className="text-[10px] text-neutral-455">
                          ₹{item.product.monthlyRent}/mo × {item.quantity} · {item.tenure} Months
                        </span>
                      </div>
                      <span className="font-extrabold text-neutral-900 dark:text-white shrink-0">
                        ₹{(item.product.monthlyRent * item.quantity).toLocaleString("en-IN")}/mo
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Pricing Breakdown */}
              <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 p-6 rounded-2xl shadow-sm space-y-5">
                <h3 className="text-xs font-bold text-neutral-450 uppercase tracking-wider">Price Details</h3>
                
                <div className="space-y-3.5 text-xs">
                  <div className="flex justify-between text-neutral-600 dark:text-neutral-450">
                    <span>Total Monthly Lease</span>
                    <span className="font-semibold text-neutral-800 dark:text-white">₹{totalMonthlyRent.toLocaleString("en-IN")}/mo</span>
                  </div>
                  <div className="flex justify-between text-neutral-600 dark:text-neutral-455">
                    <span>Refundable Deposits</span>
                    <span className="font-semibold text-neutral-800 dark:text-white">₹{totalDeposit.toLocaleString("en-IN")}</span>
                  </div>

                  <div className="border-t border-neutral-200 dark:border-neutral-800 pt-4 space-y-1">
                    <span className="text-xs font-bold text-neutral-750 dark:text-neutral-300 block uppercase tracking-wide">
                      Total Initial Due Now
                    </span>
                    <div className="flex items-baseline justify-between">
                      <span className="text-[10px] text-neutral-450 block max-w-[170px] leading-tight">
                        Security deposit + 1st month rent
                      </span>
                      <strong className="text-xl font-extrabold text-indigo-650 dark:text-violet-400">
                        ₹{totalInitialDue.toLocaleString("en-IN")}
                      </strong>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-neutral-100 dark:border-neutral-800">
                    <div className="flex items-start gap-2 text-[10px] text-neutral-450 leading-relaxed bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-100/50 dark:border-indigo-950 p-3 rounded-xl">
                      <ShieldCheck className="h-4 w-4 shrink-0 text-indigo-500 mt-0.5" />
                      <span>Leases are subject to identity verification. Deposits are refunded on checkout return.</span>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={checkoutLoading || cart.items.length === 0}
                    className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-500 dark:bg-violet-600 dark:hover:bg-violet-500 text-white font-extrabold text-xs rounded-xl shadow-lg shadow-indigo-500/15 flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  >
                    {checkoutLoading ? "Confirming Rentals..." : "Place Booking & Confirm Leases"}
                  </button>
                </div>
              </div>

            </div>

          </form>
        )}

      </div>
    </div>
  );
}
