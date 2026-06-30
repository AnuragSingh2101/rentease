"use client";

import * as React from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import { Search, SlidersHorizontal, Store, Sparkles, Filter, ChevronLeft, ChevronRight, Package, CheckCircle, AlertTriangle } from "lucide-react";
import { SkeletonProductCard } from "@/components/skeleton-loader";

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
  vendor?: {
    _id: string;
    name: string;
    email: string;
  };
  createdAt: string;
}

interface ProductApiResponse {
  success: boolean;
  count: number;
  page: number;
  totalPages: number;
  data: Product[];
}

const CATEGORIES = ["All", "Furniture", "Electronics", "Appliances", "Fitness", "Others"];

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

export default function ProductsPage() {
  const [products, setProducts] = React.useState<Product[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);


  const [search, setSearch] = React.useState("");
  const [category, setCategory] = React.useState("All");
  const [minRent, setMinRent] = React.useState("");
  const [maxRent, setMaxRent] = React.useState("");
  const [availability, setAvailability] = React.useState(false);
  const [sort, setSort] = React.useState("newest");
  const [page, setPage] = React.useState(1);
  const [totalPages, setTotalPages] = React.useState(1);
  const [totalCount, setTotalCount] = React.useState(0);


  const [tempMinRent, setTempMinRent] = React.useState("");
  const [tempMaxRent, setTempMaxRent] = React.useState("");

  const fetchProducts = React.useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      let endpoint = "/products";
      const params = new URLSearchParams();

      if (category && category !== "All") {
        params.append("category", category);
      }
      if (search) {
        params.append("search", search);
      }
      if (minRent) {
        params.append("minRent", minRent);
      }
      if (maxRent) {
        params.append("maxRent", maxRent);
      }
      if (availability) {
        params.append("availability", "true");
      }
      if (sort) {
        params.append("sort", sort);
      }
      params.append("page", page.toString());
      params.append("limit", "8");

      const queryString = params.toString();
      if (queryString) {
        endpoint += `?${queryString}`;
      }

      const res = await api.get<ProductApiResponse>(endpoint);
      setProducts(res.data || []);
      setTotalPages(res.totalPages || 1);
      setTotalCount(res.count || 0);
    } catch (err) {
      console.error(err);
      setError("Failed to load products. Please check if the server is running.");
    } finally {
      setLoading(false);
    }
  }, [category, search, minRent, maxRent, availability, sort, page]);

  React.useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);


  const applyRangeFilters = (e: React.FormEvent) => {
    e.preventDefault();
    setMinRent(tempMinRent);
    setMaxRent(tempMaxRent);
    setPage(1);
  };

  const handleReset = () => {
    setSearch("");
    setCategory("All");
    setMinRent("");
    setMaxRent("");
    setTempMinRent("");
    setTempMaxRent("");
    setAvailability(false);
    setSort("newest");
    setPage(1);
  };

  const handlePrevPage = () => {
    if (page > 1) setPage(page - 1);
  };

  const handleNextPage = () => {
    if (page < totalPages) setPage(page + 1);
  };

  return (
    <div className="min-h-screen bg-neutral-50/50 dark:bg-neutral-950/20 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-10">

        {}
        <div className="text-center space-y-4 max-w-2xl mx-auto">
          <div className="inline-flex items-center space-x-2 rounded-full border border-indigo-200 dark:border-neutral-800 bg-white/80 dark:bg-neutral-900/80 px-3 py-1 text-xs text-primary backdrop-blur-sm shadow-sm">
            <Sparkles className="h-3.5 w-3.5" />
            <span>Premium Appliances & Furniture Rentals</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold text-foreground tracking-tight">
            Rent Anything You Need
          </h1>
          <p className="text-sm sm:text-base text-neutral-550 dark:text-neutral-400">
            Skip buying! Rent verified high-quality electronics, ergonomic office furniture, smart fitness equipment, and appliances with flexible monthly tenures.
          </p>
        </div>

        {}
        <div className="flex justify-center border-b border-neutral-200 dark:border-neutral-850 pb-4">
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none scroll-smooth max-w-full">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => {
                  setCategory(cat);
                  setPage(1);
                }}
                className={`px-5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all duration-300 cursor-pointer ${
                  category === cat
                    ? "bg-indigo-600 dark:bg-violet-600 text-white shadow-lg shadow-indigo-500/20 scale-105"
                    : "bg-card text-muted-foreground hover:bg-neutral-100 dark:hover:bg-neutral-800 border border-border/60"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">

          {}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-card border border-border/60 p-5 rounded-2xl shadow-sm space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                  <Filter className="h-4 w-4 text-indigo-500" />
                  Filter Options
                </h3>
                <button
                  onClick={handleReset}
                  className="text-xs text-muted-foreground hover:text-primary dark:hover:text-violet-400 font-semibold transition-colors cursor-pointer"
                >
                  Clear All
                </button>
              </div>

              {}
              <div className="space-y-2">
                <label className="text-xs font-bold text-neutral-400 uppercase tracking-wider">Search Keywords</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
                  <input
                    type="text"
                    placeholder="Search name or details..."
                    value={search}
                    onChange={(e) => {
                      setSearch(e.target.value);
                      setPage(1);
                    }}
                    className="w-full pl-10 pr-4 py-2 rounded-xl border border-neutral-300 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950 text-xs focus:border-indigo-500 focus:outline-none dark:text-white transition-colors"
                  />
                </div>
              </div>

              {}
              <form onSubmit={applyRangeFilters} className="space-y-3">
                <label className="text-xs font-bold text-neutral-400 uppercase tracking-wider block">Monthly Rent (₹)</label>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="number"
                    placeholder="Min"
                    value={tempMinRent}
                    onChange={(e) => setTempMinRent(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-neutral-300 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950 text-xs focus:border-indigo-500 focus:outline-none dark:text-white transition-colors"
                  />
                  <input
                    type="number"
                    placeholder="Max"
                    value={tempMaxRent}
                    onChange={(e) => setTempMaxRent(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-neutral-300 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950 text-xs focus:border-indigo-500 focus:outline-none dark:text-white transition-colors"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full py-1.5 bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-750 text-neutral-750 dark:text-white text-[11px] font-bold rounded-xl transition-all cursor-pointer"
                >
                  Apply Rent Range
                </button>
              </form>

              {}
              <div className="pt-4 border-t border-neutral-100 dark:border-neutral-850 space-y-2">
                <label className="flex items-center gap-2.5 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={availability}
                    onChange={(e) => {
                      setAvailability(e.target.checked);
                      setPage(1);
                    }}
                    className="h-4 w-4 rounded border-neutral-300 text-indigo-650 focus:ring-indigo-500 bg-neutral-50 dark:bg-neutral-950 dark:border-neutral-800"
                  />
                  <span className="text-xs font-medium text-muted-foreground group-hover:text-neutral-900 dark:group-hover:text-white transition-colors select-none">
                    Only In-Stock / Available
                  </span>
                </label>
              </div>

              {}
              <div className="pt-4 border-t border-neutral-100 dark:border-neutral-850 space-y-2">
                <label className="text-xs font-bold text-neutral-400 uppercase tracking-wider block">Sort By</label>
                <select
                  value={sort}
                  onChange={(e) => {
                    setSort(e.target.value);
                    setPage(1);
                  }}
                  className="w-full px-3 py-2 rounded-xl border border-neutral-300 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950 text-xs focus:outline-none dark:text-white transition-colors"
                >
                  <option value="newest">Newest Added</option>
                  <option value="priceAsc">Rent: Low to High</option>
                  <option value="priceDesc">Rent: High to Low</option>
                </select>
              </div>
            </div>
          </div>

          {}
          <div className="lg:col-span-3 space-y-8">

            {}
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <p>
                Showing <span className="font-bold text-neutral-800 dark:text-white">{products.length}</span> of{" "}
                <span className="font-bold text-neutral-800 dark:text-white">{totalCount}</span> items
              </p>
              <p>
                Page <span className="font-bold text-neutral-800 dark:text-white">{page}</span> of {totalPages}
              </p>
            </div>

            {}
            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {Array.from({ length: 6 }).map((_, idx) => (
                  <SkeletonProductCard key={idx} />
                ))}
              </div>
            ) : error ? (
              <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/40 rounded-2xl p-8 text-center max-w-lg mx-auto">
                <AlertTriangle className="h-8 w-8 mx-auto text-red-500 mb-3 animate-pulse" />
                <p className="text-red-650 dark:text-red-400 font-semibold">{error}</p>
                <button
                  onClick={fetchProducts}
                  className="mt-4 text-xs bg-red-650 hover:bg-red-600 text-white font-semibold py-2 px-4 rounded-xl cursor-pointer"
                >
                  Retry Connection
                </button>
              </div>
            ) : products.length === 0 ? (
              <div className="bg-card border border-border/60 rounded-2xl py-20 text-center max-w-xl mx-auto space-y-4 shadow-sm">
                <Package className="h-14 w-14 mx-auto text-neutral-300 dark:text-neutral-700 animate-pulse" />
                <div className="space-y-1">
                  <h3 className="text-lg font-bold text-foreground">No products match your criteria</h3>
                  <p className="text-xs text-muted-foreground">
                    Try checking a different category, clearing price filters, or searching for alternative names.
                  </p>
                </div>
                <button
                  onClick={handleReset}
                  className="bg-primary hover:bg-primary/90 text-white font-semibold text-xs py-2 px-5 rounded-xl transition-colors cursor-pointer"
                >
                  Reset Filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 animate-in fade-in duration-300">
                {products.map((product) => {
                  const firstImage = product.images?.[0] || "linear-gradient(to right, #3b82f6, #06b6d4)";
                  const isAvailable = product.availableQuantity > 0;
                  return (
                    <Link
                      href={`/products/${product._id}`}
                      key={product._id}
                      className="group bg-card border border-border/60 rounded-2xl overflow-hidden shadow-sm hover:shadow-lg hover:border-neutral-300 dark:hover:border-neutral-700 transition-all duration-300 flex flex-col h-full"
                    >
                      {}
                      <div
                        className="w-full h-44 relative shrink-0 transition-all duration-300 flex items-center justify-center text-white"
                        style={getCoverStyle(firstImage)}
                      >
                        <div className="absolute inset-0 bg-neutral-950/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                          <span className="bg-white/95 dark:bg-neutral-950/95 text-foreground text-[11px] font-bold px-3.5 py-2 rounded-xl shadow-sm transform scale-95 group-hover:scale-100 transition-transform duration-350">
                            Rent & Options
                          </span>
                        </div>
                        <div className="absolute top-3 left-3 bg-white/95 dark:bg-neutral-950/95 text-foreground text-[9px] font-extrabold px-2.5 py-1 rounded-full uppercase tracking-wider shadow-sm">
                          {product.category}
                        </div>
                        {!firstImage.startsWith("http") && !firstImage.startsWith("/") && (
                          <Store className="h-10 w-10 text-white/40 drop-shadow-md" />
                        )}
                      </div>

                      {}
                      <div className="p-4 flex flex-col flex-grow justify-between gap-4">
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] bg-neutral-100 dark:bg-neutral-850 px-2 py-0.5 rounded-full capitalize text-muted-foreground font-semibold">
                              {product.tenureOptions?.length || 0} Tenure Modes
                            </span>
                            {isAvailable ? (
                              <span className="flex items-center gap-1 text-[10px] text-emerald-600 dark:text-emerald-400 font-bold">
                                <CheckCircle className="h-3 w-3" />
                                {product.availableQuantity} in Stock
                              </span>
                            ) : (
                              <span className="text-[10px] text-red-500 font-bold">Out of Stock</span>
                            )}
                          </div>
                          <h3 className="text-sm font-bold text-foreground group-hover:text-indigo-600 dark:group-hover:text-violet-400 line-clamp-1 transition-colors">
                            {product.name}
                          </h3>
                          <p className="text-xs text-muted-foreground line-clamp-2">
                            {product.description}
                          </p>
                        </div>

                        {}
                        <div className="border-t border-neutral-100 dark:border-neutral-800 pt-3.5 flex items-center justify-between">
                          <div>
                            <span className="text-base font-extrabold text-foreground">
                              ₹{product.monthlyRent.toLocaleString("en-IN")}
                            </span>
                            <span className="text-[10px] text-neutral-400"> / mo</span>
                          </div>
                          <div className="text-right">
                            <span className="text-[9px] text-neutral-400 block uppercase font-medium">Refundable Deposit</span>
                            <span className="text-xs font-bold text-neutral-600 dark:text-neutral-350">
                              ₹{product.deposit.toLocaleString("en-IN")}
                            </span>
                          </div>
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}

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
        </div>

      </div>
    </div>
  );
}
