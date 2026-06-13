"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { api } from "@/lib/api";
import { 
  ShoppingCart, 
  Trash2, 
  Plus, 
  Minus, 
  ArrowRight, 
  Sparkles, 
  AlertCircle, 
  ShieldCheck,
  ChevronLeft,
  Store
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

export default function CartPage() {
  const router = useRouter();
  const [cart, setCart] = React.useState<Cart | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  
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
        setError("Failed to load cart.");
      }
    } catch (err) {
      console.error(err);
      setError("Something went wrong while fetching your cart.");
    } finally {
      setLoading(false);
    }
  }, [router]);

  React.useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  const updateQuantity = async (itemId: string, currentQty: number, change: number, maxQty: number) => {
    const newQty = currentQty + change;
    if (newQty < 1 || newQty > maxQty) return;

    try {
      const res = await api.put<CartApiResponse>(`/cart/items/${itemId}`, { quantity: newQty });
      if (res.success) {
        setCart(res.data);
        window.dispatchEvent(new Event("cart-change"));
      }
    } catch (err) {
      alert("Failed to update quantity: " + (err instanceof Error ? err.message : "Error"));
    }
  };

  const updateTenure = async (itemId: string, newTenure: number) => {
    try {
      const res = await api.put<CartApiResponse>(`/cart/items/${itemId}`, { tenure: newTenure });
      if (res.success) {
        setCart(res.data);
      }
    } catch (err) {
      alert("Failed to update tenure: " + (err instanceof Error ? err.message : "Error"));
    }
  };

  const removeItem = async (itemId: string) => {
    if (!confirm("Remove this item from your cart?")) return;
    try {
      const res = await api.delete<CartApiResponse>(`/cart/items/${itemId}`);
      if (res.success) {
        setCart(res.data);
        window.dispatchEvent(new Event("cart-change"));
      }
    } catch (err) {
      alert("Failed to remove item.");
    }
  };

  // Cost calculations
  const totalMonthlyRent = cart?.items.reduce((sum, item) => sum + (item.product.monthlyRent * item.quantity), 0) || 0;
  const totalDeposit = cart?.items.reduce((sum, item) => sum + (item.product.deposit * item.quantity), 0) || 0;
  const totalInitialDue = totalMonthlyRent + totalDeposit;

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950 flex flex-col justify-center items-center">
        <div className="h-10 w-10 border-4 border-indigo-650 border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-xs text-neutral-500 font-semibold tracking-wider uppercase animate-pulse">Loading Cart items...</p>
      </div>
    );
  }


  return (
    <div className="min-h-screen bg-neutral-50/50 dark:bg-neutral-950/20 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header Link */}
        <div className="flex items-center justify-between">
          <Link href="/products" className="inline-flex items-center gap-1.5 text-xs text-neutral-450 hover:text-indigo-600 dark:hover:text-violet-400 font-bold transition-colors">
            <ChevronLeft className="h-4 w-4" />
            Back to Products
          </Link>
          <div className="inline-flex items-center space-x-2 rounded-full border border-indigo-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 px-3 py-1 text-xs text-indigo-650 dark:text-violet-400 backdrop-blur-sm shadow-sm">
            <Sparkles className="h-3.5 w-3.5" />
            <span>Secure Rental Checkout</span>
          </div>
        </div>

        {/* Title */}
        <h1 className="text-2xl sm:text-3xl font-extrabold text-neutral-900 dark:text-white tracking-tight flex items-center gap-2">
          <ShoppingCart className="h-7 w-7 text-indigo-500" />
          Shopping Cart ({cart?.items.length || 0})
        </h1>

        {error && (
          <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/40 rounded-2xl p-4 flex items-start gap-2.5 text-xs text-red-650 dark:text-red-400 max-w-lg">
            <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {!cart || cart.items.length === 0 ? (
          <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-3xl py-20 text-center max-w-xl mx-auto space-y-4 shadow-sm">
            <ShoppingCart className="h-16 w-16 mx-auto text-neutral-300 dark:text-neutral-750 animate-pulse" />
            <div className="space-y-1">
              <h3 className="text-lg font-bold text-neutral-900 dark:text-white">Your cart is currently empty</h3>
              <p className="text-xs text-neutral-500 dark:text-neutral-455">
                Browse our catalog of premium furniture, appliances, and electronics to add rental items.
              </p>
            </div>
            <button
              onClick={() => router.push("/products")}
              className="bg-indigo-600 hover:bg-indigo-500 dark:bg-violet-600 dark:hover:bg-violet-500 text-white font-bold text-xs py-2.5 px-6 rounded-xl transition-all cursor-pointer shadow-md shadow-indigo-500/10"
            >
              Browse Products Catalog
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Items List */}
            <div className="lg:col-span-2 space-y-4">
              {cart.items.map((item) => {
                const product = item.product;
                const coverImg = product.images?.[0] || "linear-gradient(to right, #3b82f6, #06b6d4)";
                return (
                  <div 
                    key={item._id}
                    className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 p-5 rounded-2xl flex flex-col sm:flex-row gap-5 items-stretch sm:items-center justify-between shadow-sm hover:shadow-md transition-shadow"
                  >
                    <div className="flex gap-4 items-center">
                      {/* Image Thumbnail */}
                      <div 
                        className="w-20 h-20 rounded-xl shrink-0 border border-neutral-200 dark:border-neutral-800 overflow-hidden relative flex items-center justify-center text-white"
                        style={getCoverStyle(coverImg)}
                      >
                        <Store className="h-6 w-6 text-white/30" />
                      </div>

                      {/* Details */}
                      <div className="space-y-1">
                        <span className="text-[9px] bg-neutral-100 dark:bg-neutral-800 px-2 py-0.5 rounded-full capitalize text-neutral-500 dark:text-neutral-400 font-bold">
                          {product.category}
                        </span>
                        <h3 className="text-sm font-extrabold text-neutral-900 dark:text-white line-clamp-1">
                          {product.name}
                        </h3>
                        <div className="flex items-center gap-1.5 pt-0.5">
                          <label className="text-[10px] text-neutral-400 font-bold uppercase shrink-0">Tenure:</label>
                          <select
                            value={item.tenure}
                            onChange={(e) => updateTenure(item._id, Number(e.target.value))}
                            className="bg-neutral-50 dark:bg-neutral-950 text-neutral-800 dark:text-white text-xs py-0.5 px-2.5 rounded-lg border border-neutral-350 dark:border-neutral-800 focus:outline-none cursor-pointer"
                          >
                            {product.tenureOptions?.map((opt) => (
                              <option key={opt} value={opt}>{opt} Months</option>
                            ))}
                          </select>
                        </div>
                      </div>
                    </div>

                    {/* Controls & Price Details */}
                    <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-4 pt-4 sm:pt-0 border-t sm:border-t-0 border-neutral-100 dark:border-neutral-850">
                      {/* Qty Selector */}
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => updateQuantity(item._id, item.quantity, -1, product.availableQuantity)}
                          disabled={item.quantity <= 1}
                          className="h-7 w-7 border border-neutral-350 dark:border-neutral-800 rounded-lg flex items-center justify-center text-xs font-bold text-neutral-700 dark:text-white hover:bg-neutral-50 dark:hover:bg-neutral-800 disabled:opacity-40 cursor-pointer"
                        >
                          <Minus className="h-3 w-3" />
                        </button>
                        <span className="text-xs font-extrabold text-neutral-900 dark:text-white w-6 text-center">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item._id, item.quantity, 1, product.availableQuantity)}
                          disabled={item.quantity >= product.availableQuantity}
                          className="h-7 w-7 border border-neutral-350 dark:border-neutral-800 rounded-lg flex items-center justify-center text-xs font-bold text-neutral-700 dark:text-white hover:bg-neutral-50 dark:hover:bg-neutral-800 disabled:opacity-40 cursor-pointer"
                        >
                          <Plus className="h-3 w-3" />
                        </button>
                      </div>

                      {/* Pricing calculations */}
                      <div className="text-right space-y-0.5">
                        <p className="text-sm font-bold text-neutral-900 dark:text-white">
                          ₹{(product.monthlyRent * item.quantity).toLocaleString("en-IN")} <span className="text-[10px] text-neutral-450 font-normal">/ mo</span>
                        </p>
                        <p className="text-[10px] text-neutral-455">
                          Deposit: ₹{(product.deposit * item.quantity).toLocaleString("en-IN")}
                        </p>
                      </div>

                      {/* Delete */}
                      <button
                        onClick={() => removeItem(item._id)}
                        className="text-neutral-400 hover:text-red-500 p-1 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/20 cursor-pointer transition-colors"
                        title="Delete item"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Summary Panel */}
            <div className="lg:col-span-1">
              <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 p-6 rounded-2xl shadow-sm space-y-6 sticky top-20">
                <h3 className="text-sm font-bold text-neutral-900 dark:text-white uppercase tracking-wider">
                  Rental Summary
                </h3>

                <div className="space-y-3.5 text-xs">
                  <div className="flex justify-between text-neutral-550 dark:text-neutral-400">
                    <span>Total Items Count</span>
                    <span className="font-semibold text-neutral-800 dark:text-white">
                      {cart.items.reduce((sum, item) => sum + item.quantity, 0)} items
                    </span>
                  </div>
                  
                  <div className="flex justify-between text-neutral-550 dark:text-neutral-400">
                    <span>Total Monthly Rental</span>
                    <span className="font-extrabold text-neutral-900 dark:text-white">
                      ₹{totalMonthlyRent.toLocaleString("en-IN")}/mo
                    </span>
                  </div>

                  <div className="flex justify-between text-neutral-550 dark:text-neutral-400">
                    <span>Total Security Deposit</span>
                    <span className="font-extrabold text-neutral-900 dark:text-white">
                      ₹{totalDeposit.toLocaleString("en-IN")}
                    </span>
                  </div>

                  <div className="pt-4 border-t border-neutral-100 dark:border-neutral-800 space-y-1.5">
                    <span className="text-xs font-bold text-neutral-750 dark:text-neutral-300 block uppercase tracking-wide">
                      Initial Due Now
                    </span>
                    <div className="flex items-baseline justify-between">
                      <span className="text-[10px] text-neutral-450 block max-w-[150px] leading-tight">
                        Includes security deposit + first month rent
                      </span>
                      <span className="text-xl font-extrabold text-indigo-600 dark:text-violet-400">
                        ₹{totalInitialDue.toLocaleString("en-IN")}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="pt-2 border-t border-neutral-100 dark:border-neutral-800 space-y-2">
                  <div className="flex items-start gap-2 text-[10px] text-neutral-450 leading-relaxed bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-100/50 dark:border-indigo-950 p-3 rounded-xl">
                    <ShieldCheck className="h-4 w-4 shrink-0 text-indigo-500 mt-0.5" />
                    <span>All deposits are completely refundable upon return of products in compliance with policy.</span>
                  </div>
                </div>

                <button
                  onClick={() => router.push('/checkout')}
                  disabled={cart.items.length === 0}
                  className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-500 dark:bg-violet-600 dark:hover:bg-violet-500 text-white font-extrabold text-xs rounded-xl shadow-lg shadow-indigo-500/15 flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  <span>Proceed to Delivery & Checkout</span>
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </div>

          </div>
        )}

      </div>
    </div>
  );
}
