"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { Home, PlusCircle, Calendar, Settings, LogOut, Store, DollarSign, Eye, Edit2, Trash2, X, Plus, Sparkles, AlertCircle, Star, Package, Layers, Info, ShoppingBag, Truck, FileText, ShieldAlert } from "lucide-react";

interface BookingItem {
  _id: string;
  user: {
    name: string;
    email: string;
    phone?: string;
  };
  bookingType: 'listing' | 'product';
  listing?: {
    title: string;
    location: string;
    price: number;
    category: string;
  };
  product?: {
    name: string;
    monthlyRent: number;
    deposit: number;
    category: string;
  };
  startDate: string;
  endDate?: string;
  duration: number;
  totalPrice: number;
  quantity?: number;
  status: 'pending' | 'confirmed' | 'cancelled';
  createdAt: string;
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

interface UserData {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  role: string;
}

interface Listing {
  _id: string;
  title: string;
  description: string;
  location: string;
  price: number;
  category: string;
  rating: number;
  image: string;
  vendor: string;
  createdAt: string;
}

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
  vendor: string;
  createdAt: string;
}

const CATEGORIES = ["Trending", "Beachfront", "Cabins", "Heritage", "Villas", "Apartments", "Others"];
const PRODUCT_CATEGORIES = ["Electronics", "Furniture", "Appliances", "Fitness", "Others"];

const GRADIENTS = [
  { label: "Indigo Mist", value: "linear-gradient(to right bottom, #6366f1, #a855f7)" },
  { label: "Ocean Breeze", value: "linear-gradient(to right bottom, #3b82f6, #06b6d4)" },
  { label: "Sunset Glow", value: "linear-gradient(to right bottom, #f97316, #eab308)" },
  { label: "Rose Petal", value: "linear-gradient(to right bottom, #ec4899, #f43f5e)" },
  { label: "Emerald Canopy", value: "linear-gradient(to right bottom, #10b981, #059669)" }
];

interface VendorRentalItem {
  _id: string;
  user?: {
    name: string;
    email: string;
    phone?: string;
  };
  product?: {
    name: string;
    category?: string;
    images?: string[];
  };
  deliveryDate: string;
  startDate: string;
  endDate: string;
  tenure: number;
  quantity: number;
  deliveryAddress: string;
  totalPrice: number;
  status: string;
}

interface DeliveryItem {
  _id: string;
  rental: {
    _id: string;
    product?: {
      name: string;
      category: string;
      images: string[];
      monthlyRent: number;
      deposit: number;
    };
    quantity: number;
    tenure: number;
    totalPrice: number;
  };
  customer: {
    name: string;
    email: string;
    phone?: string;
  };
  deliveryDate: string;
  deliveryAddress: string;
  deliveryStatus: 'Scheduled' | 'Assigned' | 'Delivered';
  assignedTo?: string;
  trackingNotes?: string;
  createdAt: string;
}

export default function VendorDashboard() {
  const router = useRouter();
  const [user, setUser] = React.useState<UserData | null>(null);


  const [activeTab, setActiveTab] = React.useState<"properties" | "products" | "bookings" | "rentals" | "deliveries" | "my-orders" | "pickups" | "claims">("properties");


  const [imageType, setImageType] = React.useState<"gradient" | "url" | "upload">("gradient");
  const [productImageType, setProductImageType] = React.useState<"gradient" | "url" | "upload">("gradient");


  const [bookings, setBookings] = React.useState<BookingItem[]>([]);
  const [bookingsLoading, setBookingsLoading] = React.useState(true);
  const [bookingsError, setBookingsError] = React.useState<string | null>(null);


  const [rentals, setRentals] = React.useState<VendorRentalItem[]>([]);
  const [rentalsLoading, setRentalsLoading] = React.useState(true);
  const [rentalsError, setRentalsError] = React.useState<string | null>(null);


  const [myOrders, setMyOrders] = React.useState<VendorRentalItem[]>([]);
  const [myOrdersLoading, setMyOrdersLoading] = React.useState(true);
  const [myOrdersError, setMyOrdersError] = React.useState<string | null>(null);


  const [deliveries, setDeliveries] = React.useState<DeliveryItem[]>([]);
  const [deliveriesLoading, setDeliveriesLoading] = React.useState(true);
  const [deliveriesError, setDeliveriesError] = React.useState<string | null>(null);
  const [updatingDeliveryId, setUpdatingDeliveryId] = React.useState<string | null>(null);
  const [editingAssignment, setEditingAssignment] = React.useState<{ [key: string]: string }>({});
  const [editingNotes, setEditingNotes] = React.useState<{ [key: string]: string }>({});


  const [vendorPickups, setVendorPickups] = React.useState<any[]>([]);
  const [pickupsLoading, setPickupsLoading] = React.useState(true);
  const [pickupsError, setPickupsError] = React.useState<string | null>(null);
  const [updatingPickupId, setUpdatingPickupId] = React.useState<string | null>(null);
  const [pickupAssignment, setPickupAssignment] = React.useState<{ [key: string]: string }>({});
  const [pickupNotes, setPickupNotes] = React.useState<{ [key: string]: string }>({});


  const [vendorClaims, setVendorClaims] = React.useState<any[]>([]);
  const [claimsLoading, setClaimsLoading] = React.useState(true);
  const [claimsError, setClaimsError] = React.useState<string | null>(null);


  const [claimModalOpen, setClaimModalOpen] = React.useState(false);
  const [claimSubmitting, setClaimSubmitting] = React.useState(false);
  const [claimFormError, setClaimFormError] = React.useState<string | null>(null);
  const [claimFormData, setClaimFormData] = React.useState({
    rental: "",
    description: "",
    severity: "Medium",
    deductedAmount: 0,
    penaltyAmount: 0,
    inspectionNotes: ""
  });


  const [listings, setListings] = React.useState<Listing[]>([]);
  const [listingsLoading, setListingsLoading] = React.useState(true);
  const [listingsError, setListingsError] = React.useState<string | null>(null);


  const [products, setProducts] = React.useState<Product[]>([]);
  const [productsLoading, setProductsLoading] = React.useState(true);
  const [productsError, setProductsError] = React.useState<string | null>(null);


  const [modalOpen, setModalOpen] = React.useState(false);
  const [modalMode, setModalMode] = React.useState<"create" | "edit">("create");
  const [editingId, setEditingId] = React.useState<string | null>(null);


  const [formData, setFormData] = React.useState({
    title: "",
    description: "",
    location: "",
    price: 0,
    category: "Villas",
    image: GRADIENTS[0].value
  });
  const [formError, setFormError] = React.useState<string | null>(null);
  const [submitting, setSubmitting] = React.useState(false);


  const [productModalOpen, setProductModalOpen] = React.useState(false);
  const [productModalMode, setProductModalMode] = React.useState<"create" | "edit">("create");
  const [editingProductId, setEditingProductId] = React.useState<string | null>(null);


  const [productFormData, setProductFormData] = React.useState({
    name: "",
    description: "",
    monthlyRent: 200,
    deposit: 800,
    availableQuantity: 2,
    category: "Furniture",
    image: GRADIENTS[0].value,
    tenureOptions: [3, 6, 12]
  });
  const [productFormError, setProductFormError] = React.useState<string | null>(null);
  const [productSubmitting, setProductSubmitting] = React.useState(false);

  const fetchMyListings = React.useCallback(async () => {
    setListingsLoading(true);
    setListingsError(null);
    try {
      interface ApiResponse {
        success: boolean;
        data: Listing[];
      }
      const res = await api.get<ApiResponse>("/listings/my-listings");
      setListings(res.data || []);
    } catch (err) {
      console.error(err);
      setListingsError("Failed to load listings. Check if backend is online.");
    } finally {
      setListingsLoading(false);
    }
  }, []);

  const fetchMyProducts = React.useCallback(async () => {
    setProductsLoading(true);
    setProductsError(null);
    try {
      interface ApiResponse {
        success: boolean;
        data: Product[];
      }
      const res = await api.get<ApiResponse>("/products/my-products");
      setProducts(res.data || []);
    } catch (err) {
      console.error(err);
      setProductsError("Failed to load products. Check if backend is online.");
    } finally {
      setProductsLoading(false);
    }
  }, []);

  const fetchMyBookings = React.useCallback(async () => {
    setBookingsLoading(true);
    setBookingsError(null);
    try {
      interface ApiResponse {
        success: boolean;
        data: BookingItem[];
      }
      const res = await api.get<ApiResponse>("/bookings/vendor-bookings");
      setBookings(res.data || []);
    } catch (err) {
      console.error(err);
      setBookingsError("Failed to load received bookings.");
    } finally {
      setBookingsLoading(false);
    }
  }, []);

  const fetchMyRentals = React.useCallback(async () => {
    setRentalsLoading(true);
    setRentalsError(null);
    try {
      interface ApiResponse {
        success: boolean;
        data: VendorRentalItem[];
      }
      const res = await api.get<ApiResponse>("/rentals/vendor-rentals");
      setRentals(res.data || []);
    } catch (err) {
      console.error(err);
      setRentalsError("Failed to load rentals. Check if backend is online.");
    } finally {
      setRentalsLoading(false);
    }
  }, []);

  const fetchMyOrders = React.useCallback(async () => {
    setMyOrdersLoading(true);
    setMyOrdersError(null);
    try {
      interface ApiResponse {
        success: boolean;
        data: VendorRentalItem[];
      }
      const res = await api.get<ApiResponse>("/rentals/my-rentals");
      setMyOrders(res.data || []);
    } catch (err) {
      console.error(err);
      setMyOrdersError("Failed to load your orders.");
    } finally {
      setMyOrdersLoading(false);
    }
  }, []);

  const fetchMyDeliveries = React.useCallback(async () => {
    setDeliveriesLoading(true);
    setDeliveriesError(null);
    try {
      interface ApiResponse {
        success: boolean;
        data: DeliveryItem[];
      }
      const res = await api.get<ApiResponse>("/deliveries/vendor");
      setDeliveries(res.data || []);

      const assignments: { [key: string]: string } = {};
      const notes: { [key: string]: string } = {};
      (res.data || []).forEach(d => {
        assignments[d._id] = d.assignedTo || "";
        notes[d._id] = d.trackingNotes || "";
      });
      setEditingAssignment(assignments);
      setEditingNotes(notes);
    } catch (err) {
      console.error(err);
      setDeliveriesError("Failed to load delivery requests.");
    } finally {
      setDeliveriesLoading(false);
    }
  }, []);

  const fetchMyPickups = React.useCallback(async () => {
    setPickupsLoading(true);
    setPickupsError(null);
    try {
      const res = await api.get<{ success: boolean; data: any[] }>("/pickups/vendor-pickups");
      setVendorPickups(res.data || []);

      const assignments: { [key: string]: string } = {};
      const notes: { [key: string]: string } = {};
      (res.data || []).forEach(p => {
        assignments[p._id] = p.assignedTo || "";
        notes[p._id] = p.trackingNotes || "";
      });
      setPickupAssignment(assignments);
      setPickupNotes(notes);
    } catch (err) {
      console.error(err);
      setPickupsError("Failed to load return requests.");
    } finally {
      setPickupsLoading(false);
    }
  }, []);

  const fetchMyClaims = React.useCallback(async () => {
    setClaimsLoading(true);
    setClaimsError(null);
    try {
      const res = await api.get<{ success: boolean; data: any[] }>("/damage-claims/vendor-claims");
      setVendorClaims(res.data || []);
    } catch (err) {
      console.error(err);
      setClaimsError("Failed to load damage claims.");
    } finally {
      setClaimsLoading(false);
    }
  }, []);

  const handleUpdateBookingStatus = async (id: string, newStatus: 'confirmed' | 'cancelled') => {
    try {
      await api.put(`/bookings/${id}/status`, { status: newStatus });
      fetchMyBookings();
    } catch (err) {
      alert("Failed to update status: " + (err instanceof Error ? err.message : "Error"));
    }
  };

  const handleUpdateRentalStatus = async (id: string, newStatus: string) => {
    try {
      await api.put(`/rentals/${id}/status`, { status: newStatus });
      fetchMyRentals();
    } catch (err) {
      alert("Failed to update status: " + (err instanceof Error ? err.message : "Error"));
    }
  };

  const handleUpdateDelivery = async (id: string, deliveryStatus: string) => {
    setUpdatingDeliveryId(id);
    try {
      const assignedTo = editingAssignment[id];
      const trackingNotes = editingNotes[id];
      await api.put(`/deliveries/${id}/status`, {
        deliveryStatus,
        assignedTo,
        trackingNotes
      });
      fetchMyDeliveries();
      if (deliveryStatus === 'Delivered') {
        fetchMyRentals();
      }
    } catch (err) {
      alert("Failed to update delivery: " + (err instanceof Error ? err.message : "Error"));
    } finally {
      setUpdatingDeliveryId(null);
    }
  };

  const handleUpdatePickup = async (id: string, pickupStatus: string) => {
    setUpdatingPickupId(id);
    try {
      const assignedTo = pickupAssignment[id];
      const trackingNotes = pickupNotes[id];
      await api.put(`/pickups/${id}/status`, {
        pickupStatus,
        assignedTo,
        trackingNotes
      });
      fetchMyPickups();
      if (pickupStatus === 'Completed') {
        fetchMyRentals();
      }
    } catch (err) {
      alert("Failed to update pickup: " + (err instanceof Error ? err.message : "Error"));
    } finally {
      setUpdatingPickupId(null);
    }
  };

  const handleSchedulePickup = async (id: string) => {
    setUpdatingPickupId(id);
    try {
      const pickupDateStr = vendorPickups.find(p => p._id === id)?.pickupDate;
      const assignedTo = pickupAssignment[id];
      const trackingNotes = pickupNotes[id];
      await api.put(`/pickups/${id}/schedule`, {
        pickupDate: pickupDateStr,
        assignedTo,
        trackingNotes
      });
      fetchMyPickups();
    } catch (err) {
      alert("Failed to schedule pickup: " + (err instanceof Error ? err.message : "Error"));
    } finally {
      setUpdatingPickupId(null);
    }
  };

  const handleCreateDamageClaim = async (e: React.FormEvent) => {
    e.preventDefault();
    setClaimSubmitting(true);
    setClaimFormError(null);
    try {
      const res = await api.post<{ success: boolean }>("/damage-claims", claimFormData);
      if (res.success) {
        setClaimModalOpen(false);
        fetchMyClaims();
        setActiveTab("claims");
      }
    } catch (err) {
      setClaimFormError(err instanceof Error ? err.message : "Failed to report claim.");
    } finally {
      setClaimSubmitting(false);
    }
  };

  React.useEffect(() => {
    const stored = localStorage.getItem("rentease_user");
    const token = localStorage.getItem("rentease_token");

    if (!stored || !token) {
      router.push("/login");
      return;
    }

    const parsed = JSON.parse(stored) as UserData;
    if (parsed.role !== "vendor") {
      if (parsed.role === "customer" || parsed.role === "user") router.push("/dashboard");
      else if (parsed.role === "admin") router.push("/admin/dashboard");
      return;
    }
    setUser(parsed);
    fetchMyListings();
    fetchMyProducts();
    fetchMyBookings();
    fetchMyRentals();
    fetchMyOrders();
    fetchMyDeliveries();
    fetchMyPickups();
    fetchMyClaims();
  }, [router, fetchMyListings, fetchMyProducts, fetchMyBookings, fetchMyRentals, fetchMyOrders, fetchMyDeliveries, fetchMyPickups, fetchMyClaims]);

  const handleLogout = async () => {
    try {
      await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"}/auth/logout`, {
        method: "POST",
        credentials: "include",
      });
    } catch {}
    localStorage.removeItem("rentease_token");
    localStorage.removeItem("rentease_user");
    document.cookie = "token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
    window.dispatchEvent(new Event("auth-change"));
    router.push("/login");
  };


  const handleOpenCreate = () => {
    setModalMode("create");
    setEditingId(null);
    setFormData({
      title: "",
      description: "",
      location: "",
      price: 1500,
      category: "Villas",
      image: GRADIENTS[0].value
    });
    setImageType("gradient");
    setFormError(null);
    setModalOpen(true);
  };

  const handleOpenEdit = (listing: Listing) => {
    setModalMode("edit");
    setEditingId(listing._id);
    setFormData({
      title: listing.title,
      description: listing.description,
      location: listing.location,
      price: listing.price,
      category: listing.category,
      image: listing.image
    });
    if (listing.image?.startsWith("linear-gradient") || listing.image?.startsWith("gradient")) {
      setImageType("gradient");
    } else if (listing.image?.startsWith("data:image/")) {
      setImageType("upload");
    } else {
      setImageType("url");
    }
    setFormError(null);
    setModalOpen(true);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setSubmitting(true);

    if (!formData.title || !formData.description || !formData.location || formData.price <= 0) {
      setFormError("Please fill in all fields with valid information.");
      setSubmitting(false);
      return;
    }

    try {
      if (modalMode === "create") {
        await api.post("/listings", formData);
      } else {
        await api.put(`/listings/${editingId}`, formData);
      }
      setModalOpen(false);
      fetchMyListings();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to remove this property listing?")) return;
    try {
      await api.delete(`/listings/${id}`);
      fetchMyListings();
    } catch (err) {
      alert("Failed to delete listing.");
    }
  };


  const handleOpenProductCreate = () => {
    setProductModalMode("create");
    setEditingProductId(null);
    setProductFormData({
      name: "",
      description: "",
      monthlyRent: 350,
      deposit: 1500,
      availableQuantity: 2,
      category: "Furniture",
      image: GRADIENTS[0].value,
      tenureOptions: [3, 6, 12]
    });
    setProductImageType("gradient");
    setProductFormError(null);
    setProductModalOpen(true);
  };

  const handleOpenProductEdit = (product: Product) => {
    setProductModalMode("edit");
    setEditingProductId(product._id);
    const pImage = product.images?.[0] || GRADIENTS[0].value;
    setProductFormData({
      name: product.name,
      description: product.description,
      monthlyRent: product.monthlyRent,
      deposit: product.deposit,
      availableQuantity: product.availableQuantity,
      category: product.category,
      image: pImage,
      tenureOptions: product.tenureOptions || [3, 6, 12]
    });
    if (pImage.startsWith("linear-gradient") || pImage.startsWith("gradient")) {
      setProductImageType("gradient");
    } else if (pImage.startsWith("data:image/")) {
      setProductImageType("upload");
    } else {
      setProductImageType("url");
    }
    setProductFormError(null);
    setProductModalOpen(true);
  };

  const handleProductFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setProductFormError(null);
    setProductSubmitting(true);

    if (!productFormData.name || !productFormData.description || productFormData.monthlyRent <= 0 || productFormData.deposit <= 0 || productFormData.availableQuantity < 0) {
      setProductFormError("Please fill in all fields with valid information.");
      setProductSubmitting(false);
      return;
    }

    if (productFormData.tenureOptions.length === 0) {
      setProductFormError("Please select at least one tenure option.");
      setProductSubmitting(false);
      return;
    }

    const submissionPayload = {
      name: productFormData.name,
      description: productFormData.description,
      monthlyRent: productFormData.monthlyRent,
      deposit: productFormData.deposit,
      availableQuantity: productFormData.availableQuantity,
      category: productFormData.category,
      images: [productFormData.image],
      tenureOptions: productFormData.tenureOptions
    };

    try {
      if (productModalMode === "create") {
        await api.post("/products", submissionPayload);
      } else {
        await api.put(`/products/${editingProductId}`, submissionPayload);
      }
      setProductModalOpen(false);
      fetchMyProducts();
    } catch (err) {
      setProductFormError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    } finally {
      setProductSubmitting(false);
    }
  };

  const handleProductDelete = async (id: string) => {
    if (!confirm("Are you sure you want to remove this product from your catalog?")) return;
    try {
      await api.delete(`/products/${id}`);
      fetchMyProducts();
    } catch (err) {
      alert("Failed to delete product.");
    }
  };

  const handleTenureToggle = (months: number) => {
    setProductFormData(prev => {
      const exists = prev.tenureOptions.includes(months);
      const updated = exists
        ? prev.tenureOptions.filter(m => m !== months)
        : [...prev.tenureOptions, months].sort((a, b) => a - b);
      return { ...prev, tenureOptions: updated };
    });
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="h-8 w-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }


  const totalPropertyRevenue = listings.reduce((sum, item) => sum + (item.price * 5), 0);
  const totalProductRevenue = products.reduce((sum, item) => sum + (item.monthlyRent * 3), 0);

  const stats = [
    { label: "Listed Properties", value: listings.length.toString(), icon: Home, color: "bg-indigo-50 dark:bg-indigo-950/30 text-indigo-600 dark:text-indigo-400" },
    { label: "Catalog Products", value: products.length.toString(), icon: Package, color: "bg-violet-50 dark:bg-violet-950/30 text-violet-600 dark:text-violet-400" },
    { label: "Est. Prop. Revenue", value: `₹${totalPropertyRevenue.toLocaleString("en-IN")}`, icon: DollarSign, color: "bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400" },
    { label: "Est. Prod. Revenue", value: `₹${totalProductRevenue.toLocaleString("en-IN")}`, icon: DollarSign, color: "bg-amber-50 dark:bg-amber-950/30 text-amber-650 dark:text-amber-400" },
  ];

  return (
    <div className="min-h-screen bg-muted/20 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">

        {}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-card border border-border/60 p-6 rounded-2xl shadow-sm">
          <div className="flex items-center gap-4">
            <div className="h-14 w-14 rounded-2xl bg-gradient-to-tr from-violet-600 to-indigo-600 flex items-center justify-center text-white text-xl font-bold shadow-lg">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-extrabold text-foreground">
                  Vendor Dashboard
                </h1>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-violet-50 dark:bg-violet-950/40 text-violet-700 dark:text-violet-300 border border-violet-100 dark:border-violet-900">
                  <Store className="h-3 w-3" />
                  Vendor Account
                </span>
              </div>
              <p className="text-xs sm:text-sm text-muted-foreground">{user.name} · {user.email}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="self-start sm:self-center flex items-center gap-2 px-4 py-2 border border-red-200 dark:border-red-900/40 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-xl text-xs font-semibold text-red-600 dark:text-red-400 transition-all cursor-pointer"
          >
            <LogOut className="h-4 w-4" />
            Sign Out
          </button>
        </div>

        {}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map(({ label, value, icon: Icon, color }) => (
            <div key={label} className="bg-card border border-border/60 rounded-2xl p-5 flex items-center gap-4 shadow-sm">
              <div className={`h-11 w-11 rounded-xl flex items-center justify-center shrink-0 ${color}`}>
                <Icon className="h-5.5 w-5.5" />
              </div>
              <div>
              <p className="text-lg font-extrabold text-foreground">{value}</p>
                <p className="text-[10px] sm:text-xs text-muted-foreground font-medium">{label}</p>
              </div>
            </div>
          ))}
        </div>

        {}
        <div className="flex border-b border-border/60 overflow-x-auto whitespace-nowrap pb-1 scrollbar-none gap-2">
          <button
            onClick={() => setActiveTab("properties")}
            className={`pb-4 px-6 text-sm font-bold border-b-2 transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === "properties"
                ? "border-indigo-600 text-primary dark:border-violet-400"
                : "border-transparent text-neutral-450 hover:text-neutral-700 dark:hover:text-neutral-300"
            }`}
          >
            <Home className="h-4 w-4" />
            Property Listings ({listings.length})
          </button>
          <button
            onClick={() => setActiveTab("products")}
            className={`pb-4 px-6 text-sm font-bold border-b-2 transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === "products"
                ? "border-indigo-600 text-primary dark:border-violet-400"
                : "border-transparent text-neutral-450 hover:text-neutral-700 dark:hover:text-neutral-300"
            }`}
          >
            <Package className="h-4 w-4" />
            Physical Products ({products.length})
          </button>
          <button
            onClick={() => setActiveTab("bookings")}
            className={`pb-4 px-6 text-sm font-bold border-b-2 transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === "bookings"
                ? "border-indigo-600 text-primary dark:border-violet-400"
                : "border-transparent text-neutral-450 hover:text-neutral-700 dark:hover:text-neutral-300"
            }`}
          >
            <Calendar className="h-4 w-4" />
            Received Bookings ({bookings.length})
          </button>
          <button
            onClick={() => setActiveTab("rentals")}
            className={`pb-4 px-6 text-sm font-bold border-b-2 transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === "rentals"
                ? "border-indigo-600 text-primary dark:border-violet-400"
                : "border-transparent text-neutral-450 hover:text-neutral-700 dark:hover:text-neutral-300"
            }`}
          >
            <ShoppingBag className="h-4 w-4" />
            Received Leases ({rentals.length})
          </button>
          <button
            onClick={() => setActiveTab("deliveries")}
            className={`pb-4 px-6 text-sm font-bold border-b-2 transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === "deliveries"
                ? "border-indigo-600 text-primary dark:border-violet-400"
                : "border-transparent text-neutral-450 hover:text-neutral-700 dark:hover:text-neutral-300"
            }`}
          >
            <Truck className="h-4 w-4" />
            Delivery Management ({deliveries.length})
          </button>
          <button
            onClick={() => setActiveTab("pickups")}
            className={`pb-4 px-6 text-sm font-bold border-b-2 transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === "pickups"
                ? "border-indigo-600 text-primary dark:border-violet-400"
                : "border-transparent text-neutral-450 hover:text-neutral-700 dark:hover:text-neutral-300"
            }`}
          >
            <Truck className="h-4 w-4 text-violet-500" />
            Return Pickups ({vendorPickups.length})
          </button>
          <button
            onClick={() => setActiveTab("claims")}
            className={`pb-4 px-6 text-sm font-bold border-b-2 transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === "claims"
                ? "border-indigo-600 text-primary dark:border-violet-400"
                : "border-transparent text-neutral-450 hover:text-neutral-700 dark:hover:text-neutral-300"
            }`}
          >
            <FileText className="h-4 w-4 text-red-500" />
            Damage Claims ({vendorClaims.length})
          </button>
          <button
            onClick={() => setActiveTab("my-orders")}
            className={`pb-4 px-6 text-sm font-bold border-b-2 transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === "my-orders"
                ? "border-indigo-600 text-primary dark:border-violet-400"
                : "border-transparent text-neutral-450 hover:text-neutral-700 dark:hover:text-neutral-300"
            }`}
          >
            <ShoppingBag className="h-4 w-4" />
            My Rented Items ({myOrders.length})
          </button>
        </div>

        {}
        {activeTab === "properties" && (
          <div className="bg-card border border-border/60 rounded-2xl p-6 space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
                <Store className="h-4.5 w-4.5 text-violet-500" />
                My Listed Properties
              </h2>
              <button
                onClick={handleOpenCreate}
                className="bg-primary hover:bg-primary/90 text-white font-bold text-xs py-2 px-4 rounded-xl flex items-center gap-1.5 transition-all shadow-md shadow-indigo-500/10 cursor-pointer"
              >
                <Plus className="h-4 w-4" />
                Add Property
              </button>
            </div>

            {listingsLoading ? (
              <div className="py-16 flex justify-center">
                <div className="h-8 w-8 border-3 border-violet-600 border-t-transparent rounded-full animate-spin" />
              </div>
            ) : listingsError ? (
              <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/40 rounded-xl p-4 text-center max-w-md mx-auto text-xs text-red-650 dark:text-red-400 font-medium">
                {listingsError}
              </div>
            ) : listings.length === 0 ? (
              <div className="text-center py-16 border border-dashed border-border/60 rounded-xl space-y-3">
                <Home className="h-12 w-12 mx-auto text-neutral-300 dark:text-neutral-700" />
                <div className="space-y-1">
                  <p className="font-bold text-neutral-800 dark:text-white text-sm">No properties listed yet</p>
                  <p className="text-xs text-neutral-505">Add your first escape property to start earning rental fees.</p>
                </div>
                <button
                  onClick={handleOpenCreate}
                  className="bg-indigo-50 hover:bg-indigo-100 dark:bg-neutral-850 dark:hover:bg-neutral-850 text-primary text-xs font-semibold py-1.5 px-4 rounded-lg cursor-pointer border border-indigo-100 dark:border-neutral-800"
                >
                  Create First Listing
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {listings.map((listing) => (
                  <div
                    key={listing._id}
                    className="group relative bg-neutral-50/50 dark:bg-neutral-950/35 border border-neutral-200/50 dark:border-neutral-855 rounded-2xl overflow-hidden shadow-sm flex flex-col justify-between h-full"
                  >
                    <div>
                      <div className="h-36 w-full" style={getCoverStyle(listing.image)} />
                      <div className="p-4 space-y-2">
                        <div className="flex items-center justify-between text-[11px] text-neutral-505">
                          <span className="font-semibold">{listing.category}</span>
                          <span className="flex items-center gap-0.5 text-amber-500 font-bold">
                            <Star className="h-3.5 w-3.5 fill-current" />
                            {listing.rating.toFixed(1)}
                          </span>
                        </div>
                        <h4 className="text-sm font-bold text-foreground line-clamp-1">{listing.title}</h4>
                        <p className="text-xs text-neutral-505 line-clamp-2">{listing.description}</p>
                      </div>
                    </div>

                    <div className="p-4 pt-0">
                      <div className="border-t border-neutral-200/50 dark:border-neutral-800 pt-3 flex items-center justify-between">
                        <div>
                          <span className="text-sm font-extrabold text-foreground">
                            ₹{listing.price.toLocaleString("en-IN")}
                          </span>
                          <span className="text-[10px] text-neutral-400">/ night</span>
                        </div>

                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => handleOpenEdit(listing)}
                            className="p-2 bg-card hover:bg-neutral-100 dark:hover:bg-neutral-800 border border-border/60 rounded-lg text-muted-foreground transition-colors cursor-pointer"
                            title="Edit Details"
                          >
                            <Edit2 className="h-3.5 w-3.5" />
                          </button>
                          <button
                            onClick={() => handleDelete(listing._id)}
                            className="p-2 bg-card hover:bg-red-50 dark:hover:bg-red-950/20 border border-border/60 hover:border-red-200 dark:hover:border-red-900 text-neutral-600 hover:text-red-650 dark:text-neutral-400 dark:hover:text-red-400 transition-colors cursor-pointer"
                            title="Remove Listing"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === "products" && (
          <div className="bg-card border border-border/60 rounded-2xl p-6 space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
                <Store className="h-4.5 w-4.5 text-violet-500" />
                My Listed Products
              </h2>
              <button
                onClick={handleOpenProductCreate}
                className="bg-primary hover:bg-primary/90 text-white font-bold text-xs py-2 px-4 rounded-xl flex items-center gap-1.5 transition-all shadow-md shadow-indigo-500/10 cursor-pointer"
              >
                <Plus className="h-4 w-4" />
                Add Product
              </button>
            </div>

            {productsLoading ? (
              <div className="py-16 flex justify-center">
                <div className="h-8 w-8 border-3 border-violet-600 border-t-transparent rounded-full animate-spin" />
              </div>
            ) : productsError ? (
              <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/40 rounded-xl p-4 text-center max-w-md mx-auto text-xs text-red-655 dark:text-red-400 font-medium">
                {productsError}
              </div>
            ) : products.length === 0 ? (
              <div className="text-center py-16 border border-dashed border-border/60 rounded-xl space-y-3">
                <Package className="h-12 w-12 mx-auto text-neutral-300 dark:text-neutral-700" />
                <div className="space-y-1">
                  <p className="font-bold text-neutral-800 dark:text-white text-sm">No products in your catalog yet</p>
                  <p className="text-xs text-neutral-505">List appliances, furniture or electronics for customers to rent monthly.</p>
                </div>
                <button
                  onClick={handleOpenProductCreate}
                  className="bg-indigo-50 hover:bg-indigo-100 dark:bg-neutral-850 dark:hover:bg-neutral-850 text-primary text-xs font-semibold py-1.5 px-4 rounded-lg cursor-pointer border border-indigo-100 dark:border-neutral-800"
                >
                  List First Product
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {products.map((product) => (
                  <div
                    key={product._id}
                    className="group relative bg-neutral-50/50 dark:bg-neutral-900/35 border border-neutral-200/50 dark:border-neutral-800 rounded-2xl overflow-hidden shadow-sm flex flex-col justify-between h-full"
                  >
                    <div>
                      <div className="h-36 w-full" style={getCoverStyle(product.images?.[0] || GRADIENTS[0].value)} />
                      <div className="p-4 space-y-2">
                        <div className="flex items-center justify-between text-[11px] text-neutral-505">
                          <span className="font-semibold">{product.category}</span>
                          <span className="text-emerald-650 dark:text-emerald-400 font-bold">
                            {product.availableQuantity} in Stock
                          </span>
                        </div>
                        <h4 className="text-sm font-bold text-foreground line-clamp-1">{product.name}</h4>
                        <p className="text-xs text-neutral-550 line-clamp-2">{product.description}</p>
                      </div>
                    </div>

                    <div className="p-4 pt-0">
                      <div className="border-t border-neutral-200/50 dark:border-neutral-800 pt-3 flex items-center justify-between">
                        <div>
                          <span className="text-sm font-extrabold text-foreground">
                            ₹{product.monthlyRent.toLocaleString("en-IN")}
                          </span>
                          <span className="text-[10px] text-neutral-455">/ mo</span>
                        </div>

                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => handleOpenProductEdit(product)}
                            className="p-2 bg-card hover:bg-neutral-100 dark:hover:bg-neutral-800 border border-border/60 rounded-lg text-muted-foreground transition-colors cursor-pointer"
                            title="Edit Product"
                          >
                            <Edit2 className="h-3.5 w-3.5" />
                          </button>
                          <button
                            onClick={() => handleProductDelete(product._id)}
                            className="p-2 bg-card hover:bg-red-50 dark:hover:bg-red-950/20 border border-border/60 hover:border-red-200 dark:hover:border-red-900 text-neutral-600 hover:text-red-650 dark:text-neutral-400 dark:hover:text-red-400 transition-colors cursor-pointer"
                            title="Remove Product"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === "bookings" && (
          <div className="bg-card border border-border/60 rounded-2xl p-6 space-y-6">
            <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
              <Calendar className="h-4.5 w-4.5 text-violet-500" />
              Customer Reservations & Rentals Received
            </h2>

            {bookingsLoading ? (
              <div className="py-16 flex justify-center">
                <div className="h-8 w-8 border-3 border-violet-600 border-t-transparent rounded-full animate-spin" />
              </div>
            ) : bookingsError ? (
              <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/40 rounded-xl p-4 text-center text-xs text-red-650 dark:text-red-400 font-medium">
                {bookingsError}
              </div>
            ) : bookings.length === 0 ? (
              <div className="text-center py-16 border border-dashed border-border/60 rounded-xl space-y-3">
                <Calendar className="h-12 w-12 mx-auto text-neutral-300 dark:text-neutral-700" />
                <div className="space-y-1">
                  <p className="font-bold text-neutral-800 dark:text-white text-sm">No reservations received yet</p>
                  <p className="text-xs text-neutral-505">Once customers book your properties or products, they will show up here.</p>
                </div>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-border/60 text-neutral-400 font-bold uppercase tracking-wider">
                      <th className="py-3 px-4">Customer Details</th>
                      <th className="py-3 px-4">Item Type</th>
                      <th className="py-3 px-4">Item Booked</th>
                      <th className="py-3 px-4">Stay / Rental Details</th>
                      <th className="py-3 px-4">Est. Payment Due</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {bookings.map((booking) => (
                      <tr key={booking._id} className="border-b border-neutral-100 dark:border-neutral-850 hover:bg-neutral-50/50 dark:hover:bg-neutral-950/40 transition-colors">
                        <td className="py-3.5 px-4 font-semibold text-neutral-800 dark:text-white">
                          <div className="font-bold">{booking.user?.name}</div>
                          <div className="text-[10px] text-neutral-500 font-normal">{booking.user?.email}</div>
                          {booking.user?.phone && <div className="text-[10px] text-neutral-500 font-normal">{booking.user?.phone}</div>}
                        </td>
                        <td className="py-3.5 px-4">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            booking.bookingType === 'listing'
                              ? 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300'
                              : 'bg-violet-50 dark:bg-violet-950/40 text-violet-700 dark:text-violet-300'
                          }`}>
                            {booking.bookingType === 'listing' ? 'Property' : 'Product'}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 font-medium text-foreground">
                          {booking.bookingType === 'listing' ? booking.listing?.title : booking.product?.name}
                        </td>
                        <td className="py-3.5 px-4 text-muted-foreground">
                          <div>Starts: {new Date(booking.startDate).toLocaleDateString()}</div>
                          <div>Duration: <strong className="text-muted-foreground">{booking.duration} {booking.bookingType === 'listing' ? 'Nights' : 'Months'}</strong></div>
                          {booking.bookingType === 'product' && <div>Qty: {booking.quantity || 1}</div>}
                        </td>
                        <td className="py-3.5 px-4 font-bold text-foreground">
                          ₹{booking.totalPrice?.toLocaleString("en-IN")}
                        </td>
                        <td className="py-3.5 px-4">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            booking.status === 'confirmed'
                              ? 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400'
                              : booking.status === 'cancelled'
                              ? 'bg-red-50 dark:bg-red-950/30 text-red-700 dark:text-red-400'
                              : 'bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-400'
                          }`}>
                            {booking.status}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-right space-x-1.5">
                          {booking.status === 'pending' && (
                            <>
                              <button
                                onClick={() => handleUpdateBookingStatus(booking._id, 'confirmed')}
                                className="px-2 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-[10px] font-bold cursor-pointer"
                              >
                                Confirm
                              </button>
                              <button
                                onClick={() => handleUpdateBookingStatus(booking._id, 'cancelled')}
                                className="px-2 py-1 bg-red-650 hover:bg-red-600 text-white rounded text-[10px] font-bold cursor-pointer"
                              >
                                Reject
                              </button>
                            </>
                          )}
                          {booking.status !== 'pending' && (
                            <span className="text-[10px] text-neutral-400 font-semibold uppercase">Resolved</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {activeTab === "rentals" && (
          <div className="bg-card border border-border/60 rounded-2xl p-6 space-y-6">
            <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
              <ShoppingBag className="h-4.5 w-4.5 text-violet-500" />
              Incoming Product Leases & Rentals
            </h2>

            {rentalsLoading ? (
              <div className="py-16 flex justify-center">
                <div className="h-8 w-8 border-3 border-violet-600 border-t-transparent rounded-full animate-spin" />
              </div>
            ) : rentalsError ? (
              <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/40 rounded-xl p-4 text-center text-xs text-red-650 dark:text-red-400 font-medium">
                {rentalsError}
              </div>
            ) : rentals.length === 0 ? (
              <div className="text-center py-16 border border-dashed border-border/60 rounded-xl space-y-3">
                <ShoppingBag className="h-12 w-12 mx-auto text-neutral-300 dark:text-neutral-700" />
                <div className="space-y-1">
                  <p className="font-bold text-neutral-800 dark:text-white text-sm">No rentals received yet</p>
                  <p className="text-xs text-neutral-550">Once customers rent your products, they will show up here to process delivery.</p>
                </div>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-border/60 text-neutral-400 font-bold uppercase tracking-wider">
                      <th className="py-3 px-4">Customer Details</th>
                      <th className="py-3 px-4">Product Name</th>
                      <th className="py-3 px-4">Lease Details</th>
                      <th className="py-3 px-4">Delivery Address</th>
                      <th className="py-3 px-4">Total Due</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rentals.map((rental) => {
                      const getStatusClass = (s: string) => {
                        switch (s) {
                          case "Pending": return "bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-400";
                          case "Approved": return "bg-blue-50 dark:bg-blue-950/30 text-blue-700 dark:text-blue-400";
                          case "Delivered": return "bg-indigo-50 dark:bg-indigo-950/30 text-indigo-700 dark:text-indigo-400";
                          case "Active": return "bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400";
                          case "Returned": return "bg-neutral-100 dark:bg-neutral-800 text-muted-foreground";
                          case "Cancelled": return "bg-red-50 dark:bg-red-950/30 text-red-700 dark:text-red-400";
                          default: return "bg-neutral-50 dark:bg-neutral-800 text-neutral-600";
                        }
                      };

                      return (
                        <tr key={rental._id} className="border-b border-neutral-100 dark:border-neutral-850 hover:bg-neutral-50/50 dark:hover:bg-neutral-955/40 transition-colors">
                          <td className="py-3.5 px-4 font-semibold text-neutral-800 dark:text-white">
                            <div className="font-bold">{rental.user?.name}</div>
                            <div className="text-[10px] text-neutral-500 font-normal">{rental.user?.email}</div>
                            {rental.user?.phone && <div className="text-[10px] text-neutral-500 font-normal">{rental.user?.phone}</div>}
                          </td>
                          <td className="py-3.5 px-4 font-medium text-foreground">
                            {rental.product?.name}
                          </td>
                          <td className="py-3.5 px-4 text-muted-foreground">
                            <div>Delivery: {new Date(rental.deliveryDate).toLocaleDateString()}</div>
                            <div>Lease: {new Date(rental.startDate).toLocaleDateString()} to {new Date(rental.endDate).toLocaleDateString()}</div>
                            <div>Duration: <strong className="text-muted-foreground">{rental.tenure} Months</strong></div>
                            <div>Qty: {rental.quantity}</div>
                          </td>
                          <td className="py-3.5 px-4 font-medium text-neutral-800 dark:text-white max-w-[150px] truncate" title={rental.deliveryAddress}>
                            {rental.deliveryAddress}
                          </td>
                          <td className="py-3.5 px-4 font-bold text-foreground">
                            ₹{rental.totalPrice?.toLocaleString("en-IN")}
                          </td>
                          <td className="py-3.5 px-4">
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${getStatusClass(rental.status)}`}>
                              {rental.status}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-right">
                            <select
                              value={rental.status}
                              onChange={(e) => handleUpdateRentalStatus(rental._id, e.target.value)}
                              className="bg-neutral-50 dark:bg-neutral-950 text-neutral-800 dark:text-white text-[11px] py-1 px-2 rounded-lg border border-neutral-300 dark:border-neutral-800 focus:outline-none cursor-pointer"
                            >
                              <option value="Pending">Pending</option>
                              <option value="Approved">Approved</option>
                              <option value="Delivered">Delivered</option>
                              <option value="Active">Active</option>
                              <option value="Returned">Returned</option>
                              <option value="Cancelled">Cancelled</option>
                            </select>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {activeTab === "deliveries" && (
          <div className="bg-card border border-border/60 rounded-2xl p-6 space-y-6">
            <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
              <Truck className="h-4.5 w-4.5 text-violet-500" />
              Delivery & Order Fulfillment Tracker
            </h2>

            {deliveriesLoading ? (
              <div className="py-16 flex justify-center">
                <div className="h-8 w-8 border-3 border-violet-600 border-t-transparent rounded-full animate-spin" />
              </div>
            ) : deliveriesError ? (
              <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/40 rounded-xl p-4 text-center text-xs text-red-650 dark:text-red-400 font-semibold animate-pulse">
                {deliveriesError}
              </div>
            ) : deliveries.length === 0 ? (
              <div className="text-center py-16 border border-dashed border-border/60 rounded-xl space-y-3">
                <Truck className="h-12 w-12 mx-auto text-neutral-300 dark:text-neutral-700 animate-bounce" />
                <div className="space-y-1">
                  <p className="font-bold text-neutral-800 dark:text-white text-sm">No scheduled deliveries</p>
                  <p className="text-xs text-neutral-505">Once customers place orders via checkout, delivery requests will generate here.</p>
                </div>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-border/60 text-neutral-400 font-bold uppercase tracking-wider">
                      <th className="py-3 px-4">Customer Details</th>
                      <th className="py-3 px-4">Rental Item</th>
                      <th className="py-3 px-4">Fulfillment Details</th>
                      <th className="py-3 px-4">Delivery Partner</th>
                      <th className="py-3 px-4">Tracking Status Notes</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {deliveries.map((delivery) => {
                      const getDeliveryStatusClass = (s: string) => {
                        switch (s) {
                          case "Scheduled": return "bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-400 border border-amber-200/40";
                          case "Assigned": return "bg-blue-50 dark:bg-blue-950/30 text-blue-700 dark:text-blue-400 border border-blue-200/40";
                          case "Delivered": return "bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 border border-emerald-200/40";
                          default: return "bg-neutral-50 dark:bg-neutral-800 text-neutral-600 border border-neutral-700";
                        }
                      };

                      return (
                        <tr key={delivery._id} className="border-b border-neutral-100 dark:border-neutral-850 hover:bg-neutral-50/50 dark:hover:bg-neutral-955/40 transition-colors">
                          <td className="py-3.5 px-4 font-semibold text-neutral-800 dark:text-white">
                            <div className="font-bold">{delivery.customer?.name}</div>
                            <div className="text-[10px] text-neutral-500 font-normal">{delivery.customer?.email}</div>
                            {delivery.customer?.phone && <div className="text-[10px] text-neutral-500 font-normal">{delivery.customer?.phone}</div>}
                          </td>
                          <td className="py-3.5 px-4">
                            <div className="font-bold text-foreground">{delivery.rental?.product?.name || "Leased Product"}</div>
                            <div className="text-[10px] text-neutral-500">Qty: {delivery.rental?.quantity || 1} · Tenure: {delivery.rental?.tenure || 1} Months</div>
                          </td>
                          <td className="py-3.5 px-4 text-neutral-500 dark:text-neutral-450">
                            <div>Date: <strong className="text-neutral-800 dark:text-neutral-200">{new Date(delivery.deliveryDate).toLocaleDateString()}</strong></div>
                            <div className="max-w-[150px] truncate" title={delivery.deliveryAddress}>Address: {delivery.deliveryAddress}</div>
                          </td>
                          <td className="py-3.5 px-4">
                            <input
                              type="text"
                              value={editingAssignment[delivery._id] || ""}
                              onChange={(e) => setEditingAssignment(prev => ({ ...prev, [delivery._id]: e.target.value }))}
                              placeholder="e.g. Delivery Partner Name"
                              className="bg-neutral-50 dark:bg-neutral-950 text-neutral-800 dark:text-white text-[11px] py-1 px-2 rounded-lg border border-neutral-305 dark:border-neutral-800 focus:outline-none focus:ring-1 focus:ring-violet-500 w-36 font-semibold"
                            />
                          </td>
                          <td className="py-3.5 px-4">
                            <input
                              type="text"
                              value={editingNotes[delivery._id] || ""}
                              onChange={(e) => setEditingNotes(prev => ({ ...prev, [delivery._id]: e.target.value }))}
                              placeholder="e.g. Out for delivery / Delayed"
                              className="bg-neutral-50 dark:bg-neutral-950 text-neutral-800 dark:text-white text-[11px] py-1 px-2 rounded-lg border border-neutral-305 dark:border-neutral-800 focus:outline-none focus:ring-1 focus:ring-violet-500 w-44 font-semibold"
                            />
                          </td>
                          <td className="py-3.5 px-4">
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${getDeliveryStatusClass(delivery.deliveryStatus)}`}>
                              {delivery.deliveryStatus}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <select
                                value={delivery.deliveryStatus}
                                onChange={(e) => handleUpdateDelivery(delivery._id, e.target.value)}
                                disabled={updatingDeliveryId === delivery._id}
                                className="bg-neutral-50 dark:bg-neutral-950 text-neutral-800 dark:text-white text-[11px] py-1 px-2 rounded-lg border border-neutral-300 dark:border-neutral-800 focus:outline-none cursor-pointer disabled:opacity-50 font-bold"
                              >
                                <option value="Scheduled">Scheduled</option>
                                <option value="Assigned">Assigned</option>
                                <option value="Delivered">Delivered</option>
                              </select>
                              <button
                                onClick={() => handleUpdateDelivery(delivery._id, delivery.deliveryStatus)}
                                disabled={updatingDeliveryId === delivery._id}
                                className="px-2 py-1 bg-violet-650 hover:bg-violet-600 text-white rounded text-[10px] font-bold cursor-pointer transition-all disabled:opacity-50"
                              >
                                Save
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {}
        {modalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-950/60 backdrop-blur-sm">
            <div className="w-full max-w-lg bg-card border border-border/60 rounded-2xl overflow-hidden shadow-2xl relative animate-in fade-in zoom-in duration-150">
              <div className="px-6 py-4 border-b border-neutral-100 dark:border-neutral-850 flex items-center justify-between bg-neutral-50 dark:bg-neutral-950/50">
                <h3 className="font-extrabold text-foreground text-sm flex items-center gap-2">
                  <Sparkles className="h-4.5 w-4.5 text-violet-500" />
                  {modalMode === "create" ? "Add New Property Escapes" : "Modify Property Details"}
                </h3>
                <button
                  onClick={() => setModalOpen(false)}
                  className="text-neutral-400 hover:text-neutral-600 dark:hover:text-white p-1 rounded-full cursor-pointer"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <form onSubmit={handleFormSubmit} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
                {formError && (
                  <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/40 rounded-xl p-3 flex items-start gap-2.5 text-xs text-red-600 dark:text-red-400">
                    <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                    <span>{formError}</span>
                  </div>
                )}

                {}
                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase font-extrabold text-neutral-400">Property Title</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Cozy Log Cabin under the stars"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full py-2 px-3.5 rounded-xl border border-neutral-300 dark:border-neutral-800 bg-white dark:bg-neutral-950 text-xs focus:border-indigo-500 focus:outline-none dark:text-white transition-colors"
                  />
                </div>

                {}
                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase font-extrabold text-neutral-400">Description</label>
                  <textarea
                    required
                    rows={3}
                    placeholder="Details about the rooms, amenities, location benefits..."
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full py-2 px-3.5 rounded-xl border border-neutral-300 dark:border-neutral-800 bg-white dark:bg-neutral-950 text-xs focus:border-indigo-500 focus:outline-none dark:text-white transition-colors resize-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {}
                  <div className="space-y-1.5">
                    <label className="text-[10px] uppercase font-extrabold text-neutral-400">Location</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Goa, India"
                      value={formData.location}
                      onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                      className="w-full py-2 px-3.5 rounded-xl border border-neutral-300 dark:border-neutral-800 bg-white dark:bg-neutral-950 text-xs focus:border-indigo-500 focus:outline-none dark:text-white transition-colors"
                    />
                  </div>

                  {}
                  <div className="space-y-1.5">
                    <label className="text-[10px] uppercase font-extrabold text-neutral-400">Rent Price (₹/Night)</label>
                    <input
                      type="number"
                      required
                      min={1}
                      placeholder="Price"
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                      className="w-full py-2 px-3.5 rounded-xl border border-neutral-300 dark:border-neutral-800 bg-white dark:bg-neutral-950 text-xs focus:border-indigo-500 focus:outline-none dark:text-white transition-colors"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {}
                  <div className="space-y-1.5 col-span-2">
                    <label className="text-[10px] uppercase font-extrabold text-neutral-400">Category</label>
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      className="w-full py-2.5 px-3.5 rounded-xl border border-neutral-300 dark:border-neutral-800 bg-card text-foreground text-xs focus:border-indigo-500 focus:outline-none transition-colors"
                    >
                      {CATEGORIES.map((c) => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {}
                <div className="space-y-1.5 pt-1">
                  <label className="text-[10px] uppercase font-extrabold text-neutral-400">Cover Media Type</label>
                  <div className="flex gap-4">
                    {["gradient", "url", "upload"].map((type) => (
                      <label key={type} className="flex items-center gap-1.5 cursor-pointer text-xs font-semibold text-muted-foreground select-none">
                        <input
                          type="radio"
                          name="propertyImageType"
                          checked={imageType === type}
                          onChange={() => setImageType(type as "gradient" | "url" | "upload")}
                          className="h-4 w-4 border-neutral-300 text-indigo-650 focus:ring-indigo-500 bg-neutral-50 dark:bg-neutral-900"
                        />
                        <span className="capitalize">{type === 'url' ? 'Image URL' : type === 'upload' ? 'Upload Image' : 'Preset Gradient'}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4">
                  {imageType === "gradient" && (
                    <div className="space-y-1.5">
                      <label className="text-[10px] uppercase font-extrabold text-neutral-400">Visual Theme (Gradient)</label>
                      <select
                        value={formData.image.startsWith('linear-gradient') ? formData.image : GRADIENTS[0].value}
                        onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                        className="w-full py-2.5 px-3.5 rounded-xl border border-neutral-300 dark:border-neutral-800 bg-card text-foreground text-xs focus:border-indigo-500 focus:outline-none transition-colors"
                      >
                        {GRADIENTS.map((g) => (
                          <option key={g.value} value={g.value}>{g.label}</option>
                        ))}
                      </select>
                    </div>
                  )}

                  {imageType === "url" && (
                    <div className="space-y-1.5">
                      <label className="text-[10px] uppercase font-extrabold text-neutral-400">Image URL</label>
                      <input
                        type="text"
                        placeholder="Paste image URL (e.g. https://images.unsplash.com/...)"
                        value={formData.image.startsWith('linear-gradient') ? "" : formData.image}
                        onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                        className="w-full py-2.5 px-3.5 rounded-xl border border-neutral-300 dark:border-neutral-800 bg-card text-foreground text-xs focus:border-indigo-500 focus:outline-none transition-colors"
                      />
                    </div>
                  )}

                  {imageType === "upload" && (
                    <div className="space-y-1.5">
                      <label className="text-[10px] uppercase font-extrabold text-neutral-400">Upload Image File</label>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            const reader = new FileReader();
                            reader.onloadend = () => {
                              setFormData({ ...formData, image: reader.result as string });
                            };
                            reader.readAsDataURL(file);
                          }
                        }}
                        className="w-full py-2 px-3 border border-neutral-300 dark:border-neutral-800 bg-card text-foreground text-xs focus:border-indigo-500 focus:outline-none rounded-xl"
                      />
                    </div>
                  )}
                </div>

                {}
                <div className="space-y-1.5 pt-2">
                  <label className="text-[9px] uppercase font-bold text-neutral-400">Card Cover Preview</label>
                  <div className="h-16 rounded-xl border border-border/60 overflow-hidden relative flex items-center justify-center text-white font-bold text-xs shadow-inner" style={getCoverStyle(formData.image)}>
                    <div className="bg-neutral-950/40 absolute inset-0 flex items-center justify-center">
                      <span className="drop-shadow-md">{formData.title || "Untitled Escapes"}</span>
                    </div>
                  </div>
                </div>

                {}
                <div className="flex items-center justify-end gap-3 pt-4 border-t border-neutral-100 dark:border-neutral-850">
                  <button
                    type="button"
                    onClick={() => setModalOpen(false)}
                    className="px-4 py-2 border border-neutral-300 dark:border-neutral-800 text-neutral-750 dark:text-white text-xs font-semibold rounded-xl hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="bg-primary hover:bg-primary/90 text-white text-xs font-bold py-2 px-5 rounded-xl transition-all cursor-pointer shadow-md shadow-indigo-500/10 disabled:opacity-50"
                  >
                    {submitting ? "Saving..." : "Save Listing"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {}
        {productModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-950/60 backdrop-blur-sm">
            <div className="w-full max-w-lg bg-card border border-border/60 rounded-2xl overflow-hidden shadow-2xl relative animate-in fade-in zoom-in duration-150">

              <div className="px-6 py-4 border-b border-neutral-100 dark:border-neutral-850 flex items-center justify-between bg-neutral-50 dark:bg-neutral-950/50">
                <h3 className="font-extrabold text-foreground text-sm flex items-center gap-2">
                  <Sparkles className="h-4.5 w-4.5 text-violet-500" />
                  {productModalMode === "create" ? "Add Product to Catalog" : "Modify Catalog Product"}
                </h3>
                <button
                  onClick={() => setProductModalOpen(false)}
                  className="text-neutral-400 hover:text-neutral-600 dark:hover:text-white p-1 rounded-full cursor-pointer"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <form onSubmit={handleProductFormSubmit} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
                {productFormError && (
                  <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/40 rounded-xl p-3 flex items-start gap-2.5 text-xs text-red-650 dark:text-red-400">
                    <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                    <span>{productFormError}</span>
                  </div>
                )}

                {}
                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase font-extrabold text-neutral-400">Product Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Ergonomic Office Desk Chair"
                    value={productFormData.name}
                    onChange={(e) => setProductFormData({ ...productFormData, name: e.target.value })}
                    className="w-full py-2 px-3.5 rounded-xl border border-neutral-300 dark:border-neutral-800 bg-card text-foreground text-xs focus:border-indigo-500 focus:outline-none transition-colors"
                  />
                </div>

                {}
                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase font-extrabold text-neutral-400">Description</label>
                  <textarea
                    required
                    rows={3}
                    placeholder="Details about components, materials, dimensions..."
                    value={productFormData.description}
                    onChange={(e) => setProductFormData({ ...productFormData, description: e.target.value })}
                    className="w-full py-2 px-3.5 rounded-xl border border-neutral-300 dark:border-neutral-800 bg-card text-foreground text-xs focus:border-indigo-500 focus:outline-none transition-colors resize-none"
                  />
                </div>

                <div className="grid grid-cols-3 gap-3">
                  {}
                  <div className="space-y-1.5">
                    <label className="text-[10px] uppercase font-extrabold text-neutral-400">Rent (₹/Mo)</label>
                    <input
                      type="number"
                      required
                      min={1}
                      placeholder="Rent"
                      value={productFormData.monthlyRent}
                      onChange={(e) => setProductFormData({ ...productFormData, monthlyRent: Number(e.target.value) })}
                      className="w-full py-2 px-3.5 rounded-xl border border-neutral-300 dark:border-neutral-800 bg-card text-foreground text-xs focus:border-indigo-500 focus:outline-none transition-colors"
                    />
                  </div>

                  {}
                  <div className="space-y-1.5">
                    <label className="text-[10px] uppercase font-extrabold text-neutral-400">Deposit (₹)</label>
                    <input
                      type="number"
                      required
                      min={1}
                      placeholder="Deposit"
                      value={productFormData.deposit}
                      onChange={(e) => setProductFormData({ ...productFormData, deposit: Number(e.target.value) })}
                      className="w-full py-2 px-3.5 rounded-xl border border-neutral-300 dark:border-neutral-800 bg-card text-foreground text-xs focus:border-indigo-500 focus:outline-none transition-colors"
                    />
                  </div>

                  {}
                  <div className="space-y-1.5">
                    <label className="text-[10px] uppercase font-extrabold text-neutral-400">Available Qty</label>
                    <input
                      type="number"
                      required
                      min={0}
                      placeholder="Quantity"
                      value={productFormData.availableQuantity}
                      onChange={(e) => setProductFormData({ ...productFormData, availableQuantity: Number(e.target.value) })}
                      className="w-full py-2 px-3.5 rounded-xl border border-neutral-300 dark:border-neutral-800 bg-card text-foreground text-xs focus:border-indigo-500 focus:outline-none transition-colors"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4">
                  {}
                  <div className="space-y-1.5">
                    <label className="text-[10px] uppercase font-extrabold text-neutral-400">Category</label>
                    <select
                      value={productFormData.category}
                      onChange={(e) => setProductFormData({ ...productFormData, category: e.target.value })}
                      className="w-full py-2.5 px-3.5 rounded-xl border border-neutral-300 dark:border-neutral-800 bg-card text-foreground text-xs focus:border-indigo-500 focus:outline-none transition-colors"
                    >
                      {PRODUCT_CATEGORIES.map((c) => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {}
                <div className="space-y-1.5 pt-1">
                  <label className="text-[10px] uppercase font-extrabold text-neutral-400">Cover Media Type</label>
                  <div className="flex gap-4">
                    {(["gradient", "url", "upload"] as const).map((type) => (
                      <label key={type} className="flex items-center gap-1.5 cursor-pointer text-xs font-semibold text-neutral-700 dark:text-neutral-350 select-none">
                        <input
                          type="radio"
                          name="productImageType"
                          checked={productImageType === type}
                          onChange={() => setProductImageType(type)}
                          className="h-4 w-4 border-neutral-300 text-indigo-650 focus:ring-indigo-500 bg-neutral-50 dark:bg-neutral-900"
                        />
                        <span className="capitalize">{type === 'url' ? 'Image URL' : type === 'upload' ? 'Upload Image' : 'Preset Gradient'}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4">
                  {productImageType === "gradient" && (
                    <div className="space-y-1.5">
                      <label className="text-[10px] uppercase font-extrabold text-neutral-400">Visual Theme (Gradient)</label>
                      <select
                        value={productFormData.image.startsWith('linear-gradient') ? productFormData.image : GRADIENTS[0].value}
                        onChange={(e) => setProductFormData({ ...productFormData, image: e.target.value })}
                        className="w-full py-2.5 px-3.5 rounded-xl border border-neutral-300 dark:border-neutral-800 bg-card text-foreground text-xs focus:border-indigo-500 focus:outline-none transition-colors"
                      >
                        {GRADIENTS.map((g) => (
                          <option key={g.value} value={g.value}>{g.label}</option>
                        ))}
                      </select>
                    </div>
                  )}

                  {productImageType === "url" && (
                    <div className="space-y-1.5">
                      <label className="text-[10px] uppercase font-extrabold text-neutral-400">Image URL</label>
                      <input
                        type="text"
                        placeholder="Paste image URL (e.g. https://images.unsplash.com/...)"
                        value={productFormData.image.startsWith('linear-gradient') ? "" : productFormData.image}
                        onChange={(e) => setProductFormData({ ...productFormData, image: e.target.value })}
                        className="w-full py-2.5 px-3.5 rounded-xl border border-neutral-300 dark:border-neutral-800 bg-card text-foreground text-xs focus:border-indigo-500 focus:outline-none transition-colors"
                      />
                    </div>
                  )}

                  {productImageType === "upload" && (
                    <div className="space-y-1.5">
                      <label className="text-[10px] uppercase font-extrabold text-neutral-400">Upload Image File</label>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            const reader = new FileReader();
                            reader.onloadend = () => {
                              setProductFormData({ ...productFormData, image: reader.result as string });
                            };
                            reader.readAsDataURL(file);
                          }
                        }}
                        className="w-full py-2 px-3 border border-neutral-300 dark:border-neutral-800 bg-card text-foreground text-xs focus:border-indigo-500 focus:outline-none rounded-xl"
                      />
                    </div>
                  )}
                </div>

                {}
                <div className="space-y-2">
                  <label className="text-[10px] uppercase font-extrabold text-neutral-400 block">Rental Tenure Options (months)</label>
                  {}
                  <div className="flex flex-wrap gap-2 min-h-[32px]">
                    {productFormData.tenureOptions.length === 0 && (
                      <span className="text-[10px] text-neutral-400 italic">No tenures added yet</span>
                    )}
                    {productFormData.tenureOptions.map((months) => (
                      <span
                        key={months}
                        className="inline-flex items-center gap-1.5 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-violet-300 border border-indigo-100 dark:border-violet-900 text-xs font-bold px-2.5 py-1 rounded-lg"
                      >
                        {months} mo
                        <button
                          type="button"
                          onClick={() => handleTenureToggle(months)}
                          className="text-indigo-400 hover:text-red-500 dark:hover:text-red-400 transition-colors cursor-pointer leading-none"
                          title={`Remove ${months} months`}
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                  {}
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-[10px] text-neutral-400 font-bold uppercase">Quick add:</span>
                    {[1, 2, 3, 6, 9, 12, 18, 24, 36].filter(m => !productFormData.tenureOptions.includes(m)).map((months) => (
                      <button
                        key={months}
                        type="button"
                        onClick={() => handleTenureToggle(months)}
                        className="text-[10px] font-bold px-2 py-1 rounded-lg bg-neutral-100 dark:bg-neutral-800 text-muted-foreground hover:bg-indigo-50 dark:hover:bg-indigo-950/30 hover:text-primary border border-neutral-200 dark:border-neutral-700 transition-colors cursor-pointer"
                      >
                        +{months}mo
                      </button>
                    ))}
                    <div className="flex items-center gap-1 ml-1">
                      <input
                        type="number"
                        min={1}
                        max={120}
                        placeholder="Custom"
                        id="customTenureVendor"
                        className="w-20 text-xs bg-neutral-50 dark:bg-neutral-950 border border-neutral-300 dark:border-neutral-700 rounded-lg px-2 py-1 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:text-white"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            const val = parseInt((e.target as HTMLInputElement).value);
                            if (val >= 1 && val <= 120) {
                              handleTenureToggle(val);
                              (e.target as HTMLInputElement).value = '';
                            }
                          }
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => {
                          const input = document.getElementById('customTenureVendor') as HTMLInputElement;
                          const val = parseInt(input.value);
                          if (val >= 1 && val <= 120) {
                            handleTenureToggle(val);
                            input.value = '';
                          }
                        }}
                        className="text-[10px] font-bold px-2 py-1 rounded-lg bg-primary hover:bg-primary/90 text-white cursor-pointer transition-colors"
                      >
                        Add
                      </button>
                    </div>
                  </div>
                  <p className="text-[10px] text-neutral-400">Customers can only choose from the months you set here.</p>
                </div>

                {}
                <div className="space-y-1.5 pt-2">
                  <label className="text-[9px] uppercase font-bold text-neutral-400">Card Cover Preview</label>
                  <div className="h-16 rounded-xl border border-border/60 overflow-hidden relative flex items-center justify-center text-white font-bold text-xs shadow-inner" style={getCoverStyle(productFormData.image)}>
                    <div className="bg-neutral-950/40 absolute inset-0 flex items-center justify-center">
                      <span className="drop-shadow-md">{productFormData.name || "Untitled Product"}</span>
                    </div>
                  </div>
                </div>

                {}
                <div className="flex items-center justify-end gap-3 pt-4 border-t border-neutral-100 dark:border-neutral-850">
                  <button
                    type="button"
                    onClick={() => setProductModalOpen(false)}
                    className="px-4 py-2 border border-neutral-300 dark:border-neutral-800 text-neutral-750 dark:text-white text-xs font-semibold rounded-xl hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={productSubmitting}
                    className="bg-primary hover:bg-primary/90 text-white text-xs font-bold py-2 px-5 rounded-xl transition-all cursor-pointer shadow-md shadow-indigo-500/10 disabled:opacity-50"
                  >
                    {productSubmitting ? "Saving..." : "Save Product"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {activeTab === "my-orders" && (
          <div className="bg-card border border-border/60 rounded-2xl p-6 space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
                  <ShoppingBag className="h-4.5 w-4.5 text-violet-500" />
                  Products I've Rented
                </h2>
                <p className="text-xs text-neutral-500">Items you rented from other vendors as a customer</p>
              </div>
            </div>

            {myOrdersLoading ? (
              <div className="py-16 flex justify-center">
                <div className="h-8 w-8 border-3 border-violet-600 border-t-transparent rounded-full animate-spin" />
              </div>
            ) : myOrdersError ? (
              <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/40 rounded-xl p-4 text-center text-xs text-red-600 dark:text-red-400 font-medium">
                {myOrdersError}
              </div>
            ) : myOrders.length === 0 ? (
              <div className="text-center py-16 border border-dashed border-border/60 rounded-xl space-y-3">
                <ShoppingBag className="h-12 w-12 mx-auto text-neutral-300 dark:text-neutral-700" />
                <p className="font-bold text-neutral-800 dark:text-white text-sm">No rentals yet</p>
                <p className="text-xs text-neutral-500">Browse the product catalog and rent items from other vendors.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {myOrders.map((order) => {
                  const getStatusClass = (s: string) => {
                    switch (s) {
                      case "Pending":   return "bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-400";
                      case "Approved":  return "bg-blue-50 dark:bg-blue-950/30 text-blue-700 dark:text-blue-400";
                      case "Delivered": return "bg-indigo-50 dark:bg-indigo-950/30 text-indigo-700 dark:text-indigo-400";
                      case "Active":    return "bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400";
                      case "Returned":  return "bg-neutral-100 dark:bg-neutral-800 text-muted-foreground";
                      case "Cancelled": return "bg-red-50 dark:bg-red-950/30 text-red-700 dark:text-red-400";
                      default:          return "bg-neutral-50 dark:bg-neutral-800 text-neutral-600";
                    }
                  };
                  const cover = order.product?.images?.[0] || "linear-gradient(to right bottom, #6366f1, #a855f7)";
                  return (
                    <div key={order._id} className="flex gap-4 p-4 border border-border/60 rounded-xl bg-neutral-50/50 dark:bg-neutral-950/20">
                      <div
                        className="w-20 h-20 rounded-xl shrink-0 border border-border/60"
                        style={getCoverStyle(cover)}
                      />
                      <div className="flex-grow flex flex-col justify-between space-y-1.5">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <span className="px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider bg-violet-50 dark:bg-violet-950/40 text-violet-700 dark:text-violet-300">
                              {order.product?.category || "Product"}
                            </span>
                            <h4 className="text-xs font-bold text-foreground mt-1">
                              {(order as any).product?.name || "Leased Product"} &nbsp;
                              <span className="font-normal text-neutral-500">×{order.quantity}</span>
                            </h4>
                          </div>
                          <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold shrink-0 ${getStatusClass(order.status)}`}>
                            {order.status}
                          </span>
                        </div>
                        <div className="text-[10px] text-neutral-500 border-t border-neutral-100 dark:border-neutral-800 pt-1.5 grid grid-cols-2 gap-x-4 gap-y-0.5">
                          <span>Tenure: <strong className="text-muted-foreground">{order.tenure} months</strong></span>
                          <span>Due: <strong className="text-muted-foreground">₹{order.totalPrice?.toLocaleString("en-IN")}</strong></span>
                          <span>Delivery: <strong className="text-muted-foreground">{new Date(order.deliveryDate).toLocaleDateString()}</strong></span>
                          <span>Ends: <strong className="text-muted-foreground">{new Date(order.endDate).toLocaleDateString()}</strong></span>
                          <span className="col-span-2 truncate">Address: {order.deliveryAddress}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* PICKUPS TAB VIEW */}
        {activeTab === "pickups" && (
          <div className="bg-card border border-border/60 rounded-2xl p-6 space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
                  <Truck className="h-4.5 w-4.5 text-violet-500" />
                  Lease Return Pickups
                </h2>
                <p className="text-xs text-neutral-500">Manage client return pickup requests and tracking logs.</p>
              </div>
            </div>

            {pickupsLoading ? (
              <div className="py-16 flex justify-center">
                <div className="h-8 w-8 border-3 border-violet-600 border-t-transparent rounded-full animate-spin" />
              </div>
            ) : pickupsError ? (
              <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/40 rounded-xl p-4 text-center text-xs text-red-650 dark:text-red-400">
                {pickupsError}
              </div>
            ) : vendorPickups.length === 0 ? (
              <div className="text-center py-16 border border-dashed border-border/60 rounded-xl space-y-3">
                <Truck className="h-12 w-12 mx-auto text-neutral-350 dark:text-neutral-750" />
                <p className="font-bold text-neutral-800 dark:text-white text-sm">No return requests</p>
                <p className="text-xs text-neutral-500">No active leases are currently awaiting return collection.</p>
              </div>
            ) : (
              <div className="space-y-6">
                {vendorPickups.map((pickup) => {
                  const cover = pickup.rental?.product?.images?.[0] || "linear-gradient(to right bottom, #6366f1, #a855f7)";
                  const isScheduled = pickup.pickupStatus !== "Requested";
                  return (
                    <div key={pickup._id} className="p-5 border border-neutral-200 dark:border-neutral-850 bg-neutral-50/50 dark:bg-neutral-950/20 rounded-2xl flex flex-col md:flex-row gap-5 justify-between">
                      {/* Left: Product & Client Details */}
                      <div className="flex gap-4 items-start flex-grow">
                        <div className="w-16 h-16 rounded-xl border border-border/60 shrink-0 overflow-hidden" style={getCoverStyle(cover)} />
                        <div className="space-y-1.5 flex-grow min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider bg-violet-50 dark:bg-violet-950/40 text-violet-700 dark:text-violet-300">
                              {pickup.rental?.product?.category || "Return"}
                            </span>
                            <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${
                              pickup.pickupStatus === "Completed" ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/20 dark:text-emerald-400" : "bg-amber-50 text-amber-700 dark:bg-amber-950/20 dark:text-amber-400"
                            }`}>
                              {pickup.pickupStatus}
                            </span>
                          </div>
                          <h4 className="text-sm font-extrabold text-foreground truncate">
                            {pickup.rental?.product?.name || "Physical Return Item"}
                          </h4>
                          <div className="text-[10px] text-neutral-500 space-y-1">
                            <p>Customer: <strong className="text-muted-foreground">{pickup.customer?.name} ({pickup.customer?.email})</strong></p>
                            <p>Address: <strong className="text-muted-foreground">{pickup.pickupAddress}</strong></p>
                            <p>Proposed Handover: <strong className="text-muted-foreground">{new Date(pickup.pickupDate).toLocaleDateString()}</strong></p>
                          </div>
                        </div>
                      </div>

                      {/* Right: Actions and Status updates */}
                      <div className="flex flex-col justify-between md:items-end gap-4 min-w-[240px]">
                        <div className="space-y-2 w-full">
                          <div className="flex gap-2">
                            <input
                              type="text"
                              placeholder="Assign Driver Name..."
                              value={pickupAssignment[pickup._id] || ""}
                              onChange={(e) => setPickupAssignment({ ...pickupAssignment, [pickup._id]: e.target.value })}
                              className="w-1/2 py-1.5 px-2.5 rounded-lg border border-neutral-300 dark:border-neutral-800 bg-white dark:bg-neutral-950 text-foreground text-[11px] focus:outline-none"
                            />
                            <input
                              type="text"
                              placeholder="Log/Status Notes..."
                              value={pickupNotes[pickup._id] || ""}
                              onChange={(e) => setPickupNotes({ ...pickupNotes, [pickup._id]: e.target.value })}
                              className="w-1/2 py-1.5 px-2.5 rounded-lg border border-neutral-300 dark:border-neutral-800 bg-white dark:bg-neutral-950 text-foreground text-[11px] focus:outline-none"
                            />
                          </div>

                          <div className="flex gap-2">
                            <button
                              onClick={() => handleSchedulePickup(pickup._id)}
                              disabled={updatingPickupId === pickup._id}
                              className="flex-1 py-1.5 border border-indigo-600 text-indigo-650 dark:text-violet-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/20 text-[10px] font-bold rounded-lg cursor-pointer transition-all"
                            >
                              Schedule Pickup
                            </button>

                            <select
                              value={pickup.pickupStatus}
                              disabled={!isScheduled || updatingPickupId === pickup._id}
                              onChange={(e) => handleUpdatePickup(pickup._id, e.target.value)}
                              className="py-1 px-2 text-[10px] font-semibold border border-neutral-300 dark:border-neutral-800 bg-white dark:bg-neutral-950 text-neutral-700 dark:text-white rounded-lg focus:outline-none"
                            >
                              <option value="Scheduled">Scheduled</option>
                              <option value="Picked Up">Picked Up</option>
                              <option value="Completed">Completed</option>
                            </select>
                          </div>
                        </div>

                        {/* Damage claim option after return completion */}
                        {pickup.pickupStatus === "Completed" && (
                          <button
                            onClick={() => {
                              setClaimFormData({
                                rental: pickup.rental?._id || "",
                                description: "",
                                severity: "Medium",
                                deductedAmount: 0,
                                penaltyAmount: 0,
                                inspectionNotes: ""
                              });
                              setClaimFormError(null);
                              setClaimModalOpen(true);
                            }}
                            className="bg-red-650 hover:bg-red-700 text-white text-[10px] font-extrabold py-1.5 px-3 rounded-lg flex items-center gap-1 self-start md:self-auto cursor-pointer border-none"
                          >
                            <FileText className="h-3.5 w-3.5" />
                            Report Damage Claim
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* DAMAGE CLAIMS TAB VIEW */}
        {activeTab === "claims" && (
          <div className="bg-card border border-border/60 rounded-2xl p-6 space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
                  <FileText className="h-4.5 w-4.5 text-red-500" />
                  Reported Damage Claims
                </h2>
                <p className="text-xs text-neutral-550">Inspect claims and penalty details filed against customer accounts.</p>
              </div>
            </div>

            {claimsLoading ? (
              <div className="py-16 flex justify-center">
                <div className="h-8 w-8 border-3 border-violet-600 border-t-transparent rounded-full animate-spin" />
              </div>
            ) : claimsError ? (
              <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/40 rounded-xl p-4 text-center text-xs text-red-600 dark:text-red-400">
                {claimsError}
              </div>
            ) : vendorClaims.length === 0 ? (
              <div className="text-center py-16 border border-dashed border-border/60 rounded-xl space-y-3">
                <FileText className="h-12 w-12 mx-auto text-neutral-300 dark:text-neutral-700" />
                <p className="font-bold text-neutral-800 dark:text-white text-sm">No damage claims reported</p>
                <p className="text-xs text-neutral-500">You haven't reported any item damages for returned rentals.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {vendorClaims.map((claim) => {
                  const getStatusClass = (s: string) => {
                    switch (s) {
                      case "Pending":   return "bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-955/20 dark:text-amber-450";
                      case "Approved":  return "bg-blue-50 text-blue-700 border border-blue-200 dark:bg-blue-955/20 dark:text-blue-450";
                      case "Rejected":  return "bg-red-50 text-red-700 border border-red-200 dark:bg-red-955/20 dark:text-red-450";
                      case "Settled":   return "bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-955/20 dark:text-emerald-450";
                      default:          return "bg-neutral-50 text-neutral-700";
                    }
                  };
                  return (
                    <div key={claim._id} className="p-4 border border-neutral-200 dark:border-neutral-850 bg-neutral-55/40 dark:bg-neutral-950/20 rounded-2xl flex gap-4 items-start">
                      <div className="w-14 h-14 rounded-xl border border-border/60 shrink-0 overflow-hidden" style={getCoverStyle(claim.rental?.product?.images?.[0] || "")} />
                      <div className="flex-grow min-w-0 space-y-1.5">
                        <div className="flex items-center justify-between gap-2">
                          <span className={`px-2 py-0.5 rounded text-[8px] font-extrabold uppercase bg-red-50 text-red-800 dark:bg-red-950/20 dark:text-red-400`}>
                            {claim.severity} severity
                          </span>
                          <span className={`px-2 py-0.5 rounded-full text-[9px] font-extrabold ${getStatusClass(claim.status)}`}>
                            {claim.status}
                          </span>
                        </div>
                        <h4 className="text-xs font-bold text-foreground truncate">
                          {claim.rental?.product?.name || "Product Damage Claim"}
                        </h4>
                        <p className="text-[11px] text-neutral-600 dark:text-neutral-450 font-medium">"{claim.description}"</p>
                        <div className="text-[10px] text-neutral-500 flex gap-4 pt-1">
                          <span>Deposit Deduct: <strong>₹{claim.deductedAmount}</strong></span>
                          <span>Extra Penalty: <strong>₹{claim.penaltyAmount}</strong></span>
                          <span>Client: <strong>{claim.reportedTo?.name}</strong></span>
                        </div>
                        {claim.inspectionNotes && (
                          <div className="text-[10px] bg-neutral-100 dark:bg-neutral-900 p-2 rounded-lg italic text-neutral-550 border border-neutral-200/50 dark:border-neutral-800 leading-tight">
                            Admin Note: "{claim.inspectionNotes}"
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

      </div>

      {}
      {claimModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-950/60 backdrop-blur-sm">
          <div className="w-full max-w-md bg-card border border-border/60 rounded-3xl overflow-hidden shadow-2xl relative animate-in fade-in zoom-in duration-200 p-6 space-y-5">

            <div className="flex justify-between items-center pb-2 border-b border-neutral-100 dark:border-neutral-850">
              <h3 className="font-extrabold text-foreground text-sm flex items-center gap-2">
                <FileText className="h-4.5 w-4.5 text-red-500" />
                Report Product Damage Claim
              </h3>
              <button
                onClick={() => setClaimModalOpen(false)}
                className="text-neutral-400 hover:text-neutral-600 dark:hover:text-white p-1 rounded-full cursor-pointer animate-none"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleCreateDamageClaim} className="space-y-4">
              {claimFormError && (
                <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/40 rounded-xl p-3 flex items-start gap-2 text-xs text-red-650 dark:text-red-400">
                  <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                  <span>{claimFormError}</span>
                </div>
              )}

              {}
              <div className="space-y-1">
                <label className="text-[10px] uppercase font-extrabold text-neutral-400 block">Damage Severity</label>
                <div className="grid grid-cols-3 gap-2">
                  {["Low", "Medium", "High"].map((sev) => (
                    <button
                      key={sev}
                      type="button"
                      onClick={() => setClaimFormData({ ...claimFormData, severity: sev })}
                      className={`py-1.5 px-2 text-xs font-bold rounded-xl border cursor-pointer text-center transition-all ${
                        claimFormData.severity === sev
                          ? "bg-red-600 border-red-600 text-white"
                          : "bg-white dark:bg-neutral-950 border-neutral-200 dark:border-neutral-850 text-neutral-700 dark:text-neutral-350 hover:bg-neutral-50"
                      }`}
                    >
                      {sev}
                    </button>
                  ))}
                </div>
              </div>

              {}
              <div className="space-y-1">
                <label className="text-[10px] uppercase font-extrabold text-neutral-455 block">Damage Description</label>
                <textarea
                  required
                  rows={3}
                  placeholder="Detail the scratches, broken parts, or functional failure discovered during collection..."
                  value={claimFormData.description}
                  onChange={(e) => setClaimFormData({ ...claimFormData, description: e.target.value })}
                  className="w-full py-2 px-3 rounded-xl border border-neutral-300 dark:border-neutral-800 bg-white dark:bg-neutral-950 text-foreground text-xs focus:border-red-500 focus:outline-none resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                {}
                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-extrabold text-neutral-455 block">Deduct Deposit (₹)</label>
                  <input
                    type="number"
                    min={0}
                    value={claimFormData.deductedAmount}
                    onChange={(e) => setClaimFormData({ ...claimFormData, deductedAmount: Number(e.target.value) || 0 })}
                    className="w-full py-2 px-3 rounded-xl border border-neutral-300 dark:border-neutral-800 bg-white dark:bg-neutral-950 text-foreground text-xs focus:border-red-550 focus:outline-none"
                  />
                </div>

                {}
                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-extrabold text-neutral-455 block">Extra Penalty Fee (₹)</label>
                  <input
                    type="number"
                    min={0}
                    value={claimFormData.penaltyAmount}
                    onChange={(e) => setClaimFormData({ ...claimFormData, penaltyAmount: Number(e.target.value) || 0 })}
                    className="w-full py-2 px-3 rounded-xl border border-neutral-300 dark:border-neutral-800 bg-white dark:bg-neutral-950 text-foreground text-xs focus:border-red-550 focus:outline-none"
                  />
                </div>
              </div>

              {}
              <div className="space-y-1">
                <label className="text-[10px] uppercase font-extrabold text-neutral-455 block">Inspection Notes (Optional)</label>
                <input
                  type="text"
                  placeholder="Remarks on collection inspection..."
                  value={claimFormData.inspectionNotes}
                  onChange={(e) => setClaimFormData({ ...claimFormData, inspectionNotes: e.target.value })}
                  className="w-full py-2 px-3 rounded-xl border border-neutral-300 dark:border-neutral-800 bg-white dark:bg-neutral-950 text-foreground text-xs focus:border-red-550 focus:outline-none"
                />
              </div>

              <div className="bg-red-50/10 dark:bg-red-950/10 p-3 rounded-xl flex items-start gap-2 text-[10px] text-red-650 leading-relaxed border border-red-200/25">
                <ShieldAlert className="h-4 w-4 shrink-0 mt-0.5 text-red-500" />
                <span>Damage claims are sent to administrative review. Approved claims will deduct directly from client deposit and invoice penalties.</span>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setClaimModalOpen(false)}
                  className="flex-1 py-2.5 border border-neutral-300 dark:border-neutral-800 text-neutral-700 dark:text-white font-semibold text-xs rounded-xl hover:bg-neutral-50 dark:hover:bg-neutral-800 cursor-pointer text-center"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={claimSubmitting}
                  className="flex-1 py-2.5 bg-red-600 hover:bg-red-500 text-white font-extrabold text-xs rounded-xl shadow-lg cursor-pointer disabled:opacity-50"
                >
                  {claimSubmitting ? "Filing..." : "Submit Claim"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
