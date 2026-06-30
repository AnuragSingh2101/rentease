"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { useToast } from "@/components/toast";
import { ArrowLeft, ChevronLeft, ChevronRight, Store, Mail, User, ShieldCheck, ShoppingBag, Package, Sparkles, ShoppingCart, CheckCircle2 } from "lucide-react";

interface Product {
  _id: string;
  name: string;
  description: string;
  monthlyRent: number;
  deposit: number;
  availableQuantity: number;
  category: string;
  images: string[];
  tenureOptions: number[];
  rating?: number;
  vendor?: {
    _id: string;
    name: string;
    email: string;
    phone?: string;
  };
  createdAt: string;
}

interface ProductDetailsResponse {
  success: boolean;
  data: Product;
}

interface PageProps {
  params: Promise<{ id: string }>;
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

export default function ProductDetailPage({ params }: PageProps) {
  const { id } = React.use(params);
  const router = useRouter();
  const { showToast } = useToast();

  const [product, setProduct] = React.useState<Product | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);


  const [activeImageIndex, setActiveImageIndex] = React.useState(0);


  const [selectedTenure, setSelectedTenure] = React.useState<number>(3);
  const [quantity, setQuantity] = React.useState(1);


  const [bookingLoading, setBookingLoading] = React.useState(false);


  const [cartAdding, setCartAdding] = React.useState(false);
  const [cartSuccess, setCartSuccess] = React.useState(false);
  const [cartError, setCartError] = React.useState<string | null>(null);


  const [reviewsList, setReviewsList] = React.useState<any[]>([]);
  const [reviewsLoading, setReviewsLoading] = React.useState(true);
  const [canReview, setCanReview] = React.useState(false);
  const [ratingInput, setRatingInput] = React.useState(5);
  const [commentInput, setCommentInput] = React.useState("");
  const [submittingReview, setSubmittingReview] = React.useState(false);
  const [reviewError, setReviewError] = React.useState<string | null>(null);

  const fetchReviews = React.useCallback(async () => {
    setReviewsLoading(true);
    try {
      const res = await api.get<{ success: boolean; data: any[] }>(`/reviews/product/${id}`);
      if (res.success && res.data) {
        setReviewsList(res.data);
      }
    } catch (e) {
      console.error("Error fetching reviews", e);
    } finally {
      setReviewsLoading(false);
    }
  }, [id]);

  const checkCanReview = React.useCallback(async () => {
    const token = localStorage.getItem("rentease_token");
    if (!token) {
      setCanReview(false);
      return;
    }
    try {
      const rentalsRes = await api.get<{ success: boolean; data: any[] }>("/rentals/my-rentals");
      if (rentalsRes.success && rentalsRes.data) {
        const hasRented = rentalsRes.data.some(
          (r) => r.product?._id === id && ["Active", "Returned"].includes(r.status)
        );
        setCanReview(hasRented);
      }
    } catch (e) {
      console.error("Error checking review authorization", e);
    }
  }, [id]);

  const fetchProductDetails = React.useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get<ProductDetailsResponse>(`/products/${id}`);
      if (res.success && res.data) {
        setProduct(res.data);
        if (res.data.tenureOptions && res.data.tenureOptions.length > 0) {
          setSelectedTenure(res.data.tenureOptions[0]);
        }
      } else {
        setError("Could not retrieve product information.");
      }
    } catch (err) {
      console.error(err);
      setError("Failed to fetch product details. Verify that the server is online.");
    } finally {
      setLoading(false);
    }
  }, [id]);

  React.useEffect(() => {
    fetchProductDetails();
    fetchReviews();
    checkCanReview();
  }, [fetchProductDetails, fetchReviews, checkCanReview]);

  const handleIncrement = () => {
    if (product && quantity < product.availableQuantity) {
      setQuantity(quantity + 1);
    }
  };

  const handleDecrement = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1);
    }
  };

  const handleAddToCart = async () => {
    if (!product) return;
    setCartError(null);
    const token = localStorage.getItem("rentease_token");
    if (!token) {
      router.push("/login");
      return;
    }
    setCartAdding(true);
    try {
      await api.post("/cart", {
        productId: product._id,
        quantity: quantity,
        tenure: selectedTenure
      });
      setCartAdding(false);
      setCartSuccess(true);
      showToast(`Added ${quantity} units of ${product.name} to cart!`, "success");
      window.dispatchEvent(new Event("cart-change"));
      setTimeout(() => setCartSuccess(false), 3000);
    } catch (err) {
      setCartAdding(false);
      const errMsg = err instanceof Error ? err.message : "Failed to add to cart. Please try again.";
      setCartError(errMsg);
      showToast(errMsg, "error");
    }
  };

  const handleRentNow = async () => {
    if (!product) return;
    setCartError(null);
    const token = localStorage.getItem("rentease_token");
    if (!token) {
      router.push("/login");
      return;
    }
    setBookingLoading(true);
    try {
      await api.post("/cart", {
        productId: product._id,
        quantity: quantity,
        tenure: selectedTenure
      });
      window.dispatchEvent(new Event("cart-change"));
      router.push("/checkout");
    } catch (err) {
      setBookingLoading(false);
      const errMsg = err instanceof Error ? err.message : "Failed to initiate rental. Please try again.";
      setCartError(errMsg);
      showToast(errMsg, "error");
    }
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setReviewError(null);
    setSubmittingReview(true);
    try {
      await api.post("/reviews", {
        productId: id,
        rating: ratingInput,
        comment: commentInput.trim()
      });
      setCommentInput("");
      showToast("Review submitted successfully! Thank you for your feedback.", "success");
      fetchReviews();
      fetchProductDetails();
    } catch (err) {
      const errMsg = err instanceof Error ? err.message : "Failed to submit review.";
      setReviewError(errMsg);
      showToast(errMsg, "error");
    } finally {
      setSubmittingReview(false);
    }
  };

  const handlePrevImage = () => {
    if (product && product.images && product.images.length > 0) {
      setActiveImageIndex((prev) => (prev === 0 ? product.images.length - 1 : prev - 1));
    }
  };

  const handleNextImage = () => {
    if (product && product.images && product.images.length > 0) {
      setActiveImageIndex((prev) => (prev === product.images.length - 1 ? 0 : prev + 1));
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-50 dark:bg-neutral-950">
        <div className="h-10 w-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-neutral-50 dark:bg-neutral-950 px-4">
        <div className="bg-card border border-border/60 p-8 rounded-2xl text-center max-w-md w-full shadow-sm space-y-4">
          <Package className="h-12 w-12 mx-auto text-red-500 animate-pulse" />
          <h3 className="text-lg font-bold text-foreground">Product Not Found</h3>
          <p className="text-xs text-neutral-500">{error || "The requested item does not exist or has been removed."}</p>
          <div className="flex gap-3 justify-center">
            <button
              onClick={() => router.push("/products")}
              className="bg-neutral-100 hover:bg-neutral-200 text-neutral-750 font-semibold text-xs py-2 px-4 rounded-xl cursor-pointer"
            >
              Back to Catalog
            </button>
            <button
              onClick={fetchProductDetails}
              className="bg-indigo-650 hover:bg-indigo-600 text-white font-semibold text-xs py-2 px-4 rounded-xl cursor-pointer"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  const monthlyRate = product.monthlyRent;
  const isOutofStock = product.availableQuantity <= 0;
  const maxStock = product.availableQuantity || 1;

  const totalMonthlyCost = monthlyRate * quantity;
  const totalSecurityDeposit = product.deposit * quantity;
  const initialPaymentDue = totalSecurityDeposit + totalMonthlyCost;

  const activeGradient = product.images?.[activeImageIndex] || "linear-gradient(to right, #3b82f6, #06b6d4)";

  return (
    <div className="min-h-screen bg-neutral-50/50 dark:bg-neutral-950/20 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-8">

        {}
        <div>
          <Link
            href="/products"
            className="inline-flex items-center gap-2 text-xs font-bold text-neutral-600 hover:text-indigo-600 dark:text-neutral-450 dark:hover:text-violet-400 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Products Catalog
          </Link>
        </div>

        {}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

          {}
          <div className="lg:col-span-5 space-y-4">
            <div className="bg-card border border-neutral-250/70 dark:border-neutral-800 rounded-3xl overflow-hidden shadow-md relative group">

              {}
              <div
                className="w-full h-80 sm:h-96 transition-all duration-500 ease-in-out flex items-center justify-center text-white relative"
                style={getCoverStyle(activeGradient)}
              >
                <div className="absolute inset-0 bg-neutral-950/10" />
                {!activeGradient.startsWith("http") && !activeGradient.startsWith("/") && (
                  <Store className="h-20 w-20 text-white/30 drop-shadow-lg" />
                )}

                {}
                {product.images && product.images.length > 1 && (
                  <>
                    <button
                      onClick={handlePrevImage}
                      className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/90 dark:bg-neutral-955/90 text-neutral-800 dark:text-white hover:bg-white dark:hover:bg-neutral-900 p-2 rounded-full shadow-md transition-all cursor-pointer opacity-0 group-hover:opacity-100"
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </button>
                    <button
                      onClick={handleNextImage}
                      className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/90 dark:bg-neutral-955/90 text-neutral-800 dark:text-white hover:bg-white dark:hover:bg-neutral-900 p-2 rounded-full shadow-md transition-all cursor-pointer opacity-0 group-hover:opacity-100"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  </>
                )}

                {}
                <div className="absolute bottom-4 right-4 bg-neutral-950/70 text-white text-[10px] font-extrabold px-3 py-1 rounded-full uppercase tracking-wider backdrop-blur-sm">
                  Image {activeImageIndex + 1} of {product.images?.length || 1}
                </div>
              </div>
            </div>

            {}
            {product.images && product.images.length > 1 && (
              <div className="flex justify-center gap-2.5">
                {product.images.map((img, idx) => (
                  <button
                    key={img}
                    onClick={() => setActiveImageIndex(idx)}
                    className={`h-4.5 w-12 rounded-lg border-2 transition-all cursor-pointer ${
                      activeImageIndex === idx
                        ? "border-indigo-650 scale-105"
                        : "border-neutral-300 dark:border-neutral-800"
                    }`}
                    style={getCoverStyle(img)}
                  />
                ))}
              </div>
            )}
          </div>

          {}
          <div className="lg:col-span-7 space-y-6">

            {}
            <div className="bg-card border border-border/60 p-6 rounded-3xl shadow-sm space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <span className="bg-indigo-50 dark:bg-indigo-950/40 text-indigo-750 dark:text-violet-400 text-[10px] font-extrabold px-3 py-1.5 rounded-full uppercase tracking-wider border border-indigo-100/50 dark:border-violet-900/55">
                    {product.category}
                  </span>

                  {product.rating !== undefined && product.rating > 0 && (
                    <span className="bg-amber-50 dark:bg-amber-955/20 text-amber-600 dark:text-amber-400 text-[10px] font-extrabold px-3 py-1.5 rounded-full border border-amber-100/50 dark:border-amber-900">
                      ★ {product.rating} / 5
                    </span>
                  )}
                </div>

                {isOutofStock ? (
                  <span className="text-xs font-bold text-red-500 bg-red-50 dark:bg-red-950/20 px-3 py-1 rounded-full border border-red-200/50 dark:border-red-900/30">
                    Temporarily Out of Stock
                  </span>
                ) : (
                  <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/25 px-3 py-1 rounded-full border border-emerald-250/30 dark:border-emerald-900/40 flex items-center gap-1.5">
                    <CheckCircle2 className="h-4 w-4" />
                    Available to Rent ({product.availableQuantity} items left)
                  </span>
                )}
              </div>

              <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground leading-tight">
                {product.name}
              </h1>

              <div className="pt-2 border-t border-neutral-100 dark:border-neutral-850">
                <label className="text-xs font-bold text-neutral-400 uppercase tracking-wider block mb-1">Product Description</label>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {product.description}
                </p>
              </div>
            </div>

            {}
            {!isOutofStock && (
              <div className="bg-card border border-border/60 p-6 rounded-3xl shadow-sm space-y-6">

                {}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-5 border-b border-neutral-150 dark:border-neutral-850">

                  {}
                  <div className="space-y-3">
                    <label className="text-xs font-bold text-neutral-400 uppercase tracking-wider flex items-center gap-1.5">
                      <Sparkles className="h-4 w-4 text-indigo-500" />
                      Select Rent Tenure
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {product.tenureOptions?.map((m) => (
                        <button
                          key={m}
                          onClick={() => setSelectedTenure(m)}
                          className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer ${
                            selectedTenure === m
                              ? "bg-indigo-650 dark:bg-violet-600 text-white shadow-md shadow-indigo-500/10"
                              : "bg-neutral-50 dark:bg-neutral-950 text-neutral-650 dark:text-neutral-400 border border-border/60 hover:bg-neutral-100 dark:hover:bg-neutral-850"
                          }`}
                        >
                          {m} Months
                        </button>
                      ))}
                    </div>
                  </div>

                  {}
                  <div className="space-y-3">
                    <label className="text-xs font-bold text-neutral-400 uppercase tracking-wider block">Quantity</label>
                    <div className="flex items-center gap-3">
                      <button
                        onClick={handleDecrement}
                        disabled={quantity <= 1}
                        className="h-9 w-9 border border-neutral-300 dark:border-neutral-800 rounded-xl flex items-center justify-center text-sm font-bold text-neutral-700 dark:text-white hover:bg-neutral-50 dark:hover:bg-neutral-850 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                      >
                        -
                      </button>
                      <span className="text-sm font-extrabold text-foreground w-8 text-center">
                        {quantity}
                      </span>
                      <button
                        onClick={handleIncrement}
                        disabled={quantity >= maxStock}
                        className="h-9 w-9 border border-neutral-300 dark:border-neutral-800 rounded-xl flex items-center justify-center text-sm font-bold text-neutral-700 dark:text-white hover:bg-neutral-50 dark:hover:bg-neutral-850 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                      >
                        +
                      </button>
                    </div>
                  </div>
                </div>

                {}
                <div className="bg-neutral-50 dark:bg-neutral-950 p-5 rounded-2xl border border-neutral-200/50 dark:border-neutral-850 space-y-3">
                  <h4 className="text-xs font-bold text-neutral-400 uppercase tracking-wider">Pricing Breakdown</h4>

                  <div className="space-y-2.5 text-xs">
                    <div className="flex justify-between text-muted-foreground">
                      <span>Monthly Rent (₹{monthlyRate.toLocaleString("en-IN")} × {quantity} item{quantity > 1 ? "s" : ""})</span>
                      <span className="font-bold text-neutral-800 dark:text-white">₹{totalMonthlyCost.toLocaleString("en-IN")}/mo</span>
                    </div>
                    <div className="flex justify-between text-muted-foreground">
                      <span>Refundable Security Deposit (₹{product.deposit.toLocaleString("en-IN")} × {quantity})</span>
                      <span className="font-bold text-neutral-800 dark:text-white">₹{totalSecurityDeposit.toLocaleString("en-IN")}</span>
                    </div>

                    <div className="border-t border-border/60 pt-2.5 flex justify-between items-baseline">
                      <span className="font-bold text-neutral-850 dark:text-neutral-200 text-sm">Due Now (Deposit + 1st Month Rent)</span>
                      <div className="text-right">
                        <p className="text-lg font-extrabold text-indigo-650 dark:text-violet-400">
                          ₹{initialPaymentDue.toLocaleString("en-IN")}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {}
                <div className="flex flex-col gap-3 pt-2 w-full">
                  {cartError && (
                    <div className="flex items-start gap-2 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/40 rounded-xl px-4 py-3 text-xs text-red-655 dark:text-red-400 font-medium">
                      <span>⚠</span>
                      <span>{cartError}</span>
                    </div>
                  )}
                  <div className="flex flex-col sm:flex-row justify-end gap-3">
                    <button
                      onClick={handleAddToCart}
                      disabled={cartAdding || cartSuccess}
                      className={`w-full sm:w-auto px-6 py-3 text-xs font-bold rounded-xl border transition-all cursor-pointer flex items-center justify-center gap-2 ${
                        cartSuccess
                          ? "bg-emerald-50 dark:bg-emerald-950/20 border-emerald-500 text-emerald-600 dark:text-emerald-450"
                          : "bg-white hover:bg-neutral-50 dark:bg-neutral-900 dark:hover:bg-neutral-800 text-neutral-700 dark:text-white border-neutral-300 dark:border-neutral-800"
                      }`}
                    >
                      <ShoppingCart className="h-4.5 w-4.5" />
                      {cartAdding ? "Adding..." : cartSuccess ? "Added to Cart!" : "Add to Cart"}
                    </button>
                    <button
                      onClick={handleRentNow}
                      disabled={bookingLoading}
                      className="w-full sm:w-auto bg-primary hover:bg-primary/90 text-white text-xs font-bold px-8 py-3 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2 shadow-md shadow-indigo-500/10"
                    >
                      <ShoppingBag className="h-4.5 w-4.5" />
                      {bookingLoading ? "Processing..." : "Rent This Item"}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {}
            {product.vendor && (
              <div className="bg-card border border-border/60 p-5 rounded-3xl shadow-sm space-y-3.5">
                <div className="flex items-center gap-2">
                  <User className="h-4.5 w-4.5 text-indigo-500" />
                  <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                    Listed By Vendor
                  </h4>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="h-4 w-4 text-emerald-505" />
                    <span>Vendor: <strong className="text-neutral-700 dark:text-white">{product.vendor.name}</strong></span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-neutral-400" />
                    <span>{product.vendor.email}</span>
                  </div>
                </div>
              </div>
            )}

          </div>

        </div>

        {}
        <div className="bg-card border border-border/60 p-6 rounded-3xl shadow-sm space-y-6">
          <h2 className="text-base font-extrabold text-foreground flex items-center gap-2">
            ★ Verified Reviews ({reviewsList.length})
          </h2>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {}
            <div className="lg:col-span-8 space-y-4">
              {reviewsLoading ? (
                <div className="space-y-4 animate-pulse">
                  <div className="h-16 bg-neutral-200 dark:bg-neutral-800 rounded-xl" />
                  <div className="h-16 bg-neutral-200 dark:bg-neutral-800 rounded-xl" />
                </div>
              ) : reviewsList.length === 0 ? (
                <div className="text-center py-10 border border-dashed border-border/60 rounded-2xl">
                  <p className="text-xs text-neutral-400 italic">No feedback reviews posted for this item yet.</p>
                </div>
              ) : (
                <div className="space-y-4 max-h-[350px] overflow-y-auto pr-2">
                  {reviewsList.map((rev) => (
                    <div key={rev._id} className="border-b border-neutral-100 dark:border-neutral-850 pb-4 last:border-none space-y-1">
                      <div className="flex justify-between items-center">
                        <p className="text-xs font-bold text-neutral-800 dark:text-white">{rev.user?.name || "Renter"}</p>
                        <div className="flex text-amber-500 text-xs">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <span key={i}>{i < rev.rating ? "★" : "☆"}</span>
                          ))}
                        </div>
                      </div>
                      <p className="text-xs text-muted-foreground font-medium">"{rev.comment}"</p>
                      <p className="text-[9px] text-neutral-400">{new Date(rev.createdAt).toLocaleDateString()}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {}
            <div className="lg:col-span-4 bg-neutral-50/50 dark:bg-neutral-950/20 p-5 rounded-2xl border border-neutral-250/60 dark:border-neutral-800 space-y-4">
              <h3 className="text-xs font-extrabold text-muted-foreground uppercase tracking-wider">
                Write a Review
              </h3>

              {!canReview ? (
                <p className="text-[11px] text-neutral-450 leading-relaxed italic">
                  Reviews are restricted to customers who have an active or completed rental agreement for this product.
                </p>
              ) : (
                <form onSubmit={handleReviewSubmit} className="space-y-3">
                  <div className="space-y-1.5">
                    <label className="text-[10px] uppercase font-bold text-neutral-400">Rating Stars</label>
                    <select
                      value={ratingInput}
                      onChange={(e) => setRatingInput(Number(e.target.value))}
                      className="w-full py-2 px-3 rounded-xl border border-neutral-300 dark:border-neutral-800 bg-card text-neutral-900 text-xs focus:outline-none dark:text-white"
                    >
                      <option value={5}>★★★★★ (5 Stars)</option>
                      <option value={4}>★★★★☆ (4 Stars)</option>
                      <option value={3}>★★★☆☆ (3 Stars)</option>
                      <option value={2}>★★☆☆☆ (2 Stars)</option>
                      <option value={1}>★☆☆☆☆ (1 Star)</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] uppercase font-bold text-neutral-400">Comments</label>
                    <textarea
                      required
                      rows={3}
                      placeholder="How was the product quality, shipping, and vendor service?..."
                      value={commentInput}
                      onChange={(e) => setCommentInput(e.target.value)}
                      className="w-full py-2 px-3 rounded-xl border border-neutral-300 dark:border-neutral-800 bg-card text-neutral-900 text-xs focus:outline-none dark:text-white resize-none"
                    />
                  </div>

                  {reviewError && (
                    <p className="text-[10px] text-red-500 font-bold">{reviewError}</p>
                  )}

                  <button
                    type="submit"
                    disabled={submittingReview}
                    className="w-full bg-indigo-605 hover:bg-indigo-500 dark:bg-violet-600 dark:hover:bg-violet-500 text-white font-bold text-xs py-2 px-4 rounded-xl cursor-pointer disabled:opacity-50 border-none transition-all"
                  >
                    {submittingReview ? "Posting..." : "Post Review"}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
