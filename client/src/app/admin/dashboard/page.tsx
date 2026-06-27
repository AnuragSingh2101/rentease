"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import {
  Users, Store, Home, ShieldCheck, LogOut, Trash2, Edit2, ShieldAlert, Sparkles, X, Plus,
  CheckCircle2, UserCheck, Package, MapPin, Wrench, Clock, DollarSign, Activity,
  MessageSquare, AlertTriangle, Check, RefreshCw
} from "lucide-react";

interface UserData {
  _id: string;
  name: string;
  email: string;
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
  vendor?: {
    _id?: string;
    name: string;
    email: string;
  } | string;
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
  vendor?: {
    _id?: string;
    name: string;
    email: string;
  } | string;
  createdAt: string;
}

interface RentalData {
  _id: string;
  user: {
    _id: string;
    name: string;
    email: string;
    phone?: string;
  };
  product: {
    _id: string;
    name: string;
    category: string;
    monthlyRent: number;
    deposit: number;
    images: string[];
  };
  quantity: number;
  tenure: number;
  deliveryDate: string;
  deliveryAddress: string;
  startDate: string;
  endDate: string;
  monthlyRent: number;
  deposit: number;
  totalPrice: number;
  status: 'Pending' | 'Approved' | 'Delivered' | 'Active' | 'Returned' | 'Cancelled';
  createdAt: string;
}

interface ServiceArea {
  _id: string;
  name: string;
  city: string;
  state: string;
  postalCodes: string[];
  isActive: boolean;
  createdAt: string;
}

interface MaintenanceTicket {
  _id: string;
  user: {
    _id: string;
    name: string;
    email: string;
    phone?: string;
  };
  itemType: 'product' | 'listing';
  product?: {
    _id: string;
    name: string;
    category: string;
    images?: string[];
  };
  listing?: {
    _id: string;
    title: string;
    location: string;
    category: string;
  };
  rental?: any;
  booking?: any;
  title: string;
  description: string;
  status: 'Open' | 'In Progress' | 'Resolved';
  comments: Array<{
    _id: string;
    user: string;
    name: string;
    text: string;
    createdAt: string;
  }>;
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

export default function AdminDashboard() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = React.useState<UserData | null>(null);


  const [usersList, setUsersList] = React.useState<UserData[]>([]);
  const [listingsList, setListingsList] = React.useState<Listing[]>([]);
  const [productsList, setProductsList] = React.useState<Product[]>([]);
  const [rentalsList, setRentalsList] = React.useState<RentalData[]>([]);
  const [serviceAreasList, setServiceAreasList] = React.useState<ServiceArea[]>([]);
  const [claimsList, setClaimsList] = React.useState<any[]>([]);
  const [maintenanceList, setMaintenanceList] = React.useState<MaintenanceTicket[]>([]);
  const [analyticsData, setAnalyticsData] = React.useState<any>(null);

  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);


  const [activeTab, setActiveTab] = React.useState<"overview" | "users" | "listings" | "products" | "rentals" | "disputes" | "service_areas">("overview");
  const [disputesSubTab, setDisputesSubTab] = React.useState<"claims" | "maintenance">("claims");


  const [updatingClaimId, setUpdatingClaimId] = React.useState<string | null>(null);
  const [adminInspectionNotes, setAdminInspectionNotes] = React.useState<{ [key: string]: string }>({});
  const [updatingTicketId, setUpdatingTicketId] = React.useState<string | null>(null);
  const [newCommentText, setNewCommentText] = React.useState<{ [key: string]: string }>({});


  const [listingModalOpen, setListingModalOpen] = React.useState(false);
  const [listingModalMode, setListingModalMode] = React.useState<"create" | "edit">("create");
  const [editingListingId, setEditingListingId] = React.useState<string | null>(null);
  const [listingForm, setListingForm] = React.useState({
    title: "",
    description: "",
    location: "",
    price: 0,
    category: "Villas",
    image: GRADIENTS[0].value,
    vendor: ""
  });
  const [listingFormError, setListingFormError] = React.useState<string | null>(null);
  const [submittingListing, setSubmittingListing] = React.useState(false);


  const [productModalOpen, setProductModalOpen] = React.useState(false);
  const [productModalMode, setProductModalMode] = React.useState<"create" | "edit">("create");
  const [editingProductId, setEditingProductId] = React.useState<string | null>(null);
  const [productForm, setProductForm] = React.useState({
    name: "",
    description: "",
    monthlyRent: 300,
    deposit: 1200,
    availableQuantity: 5,
    category: "Furniture",
    image: GRADIENTS[0].value,
    tenureOptions: [3, 6, 12],
    vendor: ""
  });
  const [productFormError, setProductFormError] = React.useState<string | null>(null);
  const [submittingProduct, setSubmittingProduct] = React.useState(false);


  const [serviceAreaModalOpen, setServiceAreaModalOpen] = React.useState(false);
  const [serviceAreaModalMode, setServiceAreaModalMode] = React.useState<"create" | "edit">("create");
  const [editingServiceAreaId, setEditingServiceAreaId] = React.useState<string | null>(null);
  const [serviceAreaForm, setServiceAreaForm] = React.useState({
    name: "",
    city: "",
    state: "",
    postalCodes: "",
    isActive: true
  });
  const [serviceAreaFormError, setServiceAreaFormError] = React.useState<string | null>(null);
  const [submittingServiceArea, setSubmittingServiceArea] = React.useState(false);


  const [updatingRentalId, setUpdatingRentalId] = React.useState<string | null>(null);

  const fetchPlatformData = React.useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [
        usersRes,
        listingsRes,
        productsRes,
        claimsRes,
        rentalsRes,
        serviceAreasRes,
        maintenanceRes,
        analyticsRes
      ] = await Promise.all([
        api.get<{ success: boolean; data: UserData[] }>("/auth/users"),
        api.get<{ success: boolean; data: Listing[] }>("/listings"),
        api.get<{ success: boolean; data: Product[] }>("/products?limit=100"),
        api.get<{ success: boolean; data: any[] }>("/damage-claims/admin-claims"),
        api.get<{ success: boolean; data: RentalData[] }>("/rentals/vendor-rentals"),
        api.get<{ success: boolean; data: ServiceArea[] }>("/service-areas"),
        api.get<{ success: boolean; data: MaintenanceTicket[] }>("/maintenance/admin-requests"),
        api.get<{ success: boolean; data: any }>("/analytics/admin").catch(() => null)
      ]);

      setUsersList(usersRes.data || []);
      setListingsList(listingsRes.data || []);
      setProductsList(productsRes.data || []);
      setClaimsList(claimsRes.data || []);
      setRentalsList(rentalsRes.data || []);
      setServiceAreasList(serviceAreasRes.data || []);
      setMaintenanceList(maintenanceRes.data || []);
      if (analyticsRes && analyticsRes.success) {
        setAnalyticsData(analyticsRes.data);
      }

      const notes: { [key: string]: string } = {};
      (claimsRes.data || []).forEach(c => {
        notes[c._id] = c.inspectionNotes || "";
      });
      setAdminInspectionNotes(notes);
    } catch (err) {
      console.error(err);
      setError("Failed to fetch administrative data. Please verify database and backend connectivity.");
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    const stored = localStorage.getItem("rentease_user");
    const token = localStorage.getItem("rentease_token");

    if (!stored || !token) {
      router.push("/login");
      return;
    }

    const parsed = JSON.parse(stored) as UserData;
    if (parsed.role !== "admin") {
      if (parsed.role === "vendor") router.push("/vendor/dashboard");
      else router.push("/dashboard");
      return;
    }

    setCurrentUser(parsed);
    fetchPlatformData();
  }, [router, fetchPlatformData]);

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


  const handleUpdateUserRole = async (userId: string, newRole: string) => {
    try {
      await api.put(`/auth/users/${userId}/role`, { role: newRole });
      fetchPlatformData();
    } catch (err) {
      alert("Failed to update user role.");
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (userId === currentUser?._id) {
      alert("You cannot delete your own admin account.");
      return;
    }
    if (!confirm("Are you sure you want to permanently delete this user account?")) return;
    try {
      await api.delete(`/auth/users/${userId}`);
      fetchPlatformData();
    } catch (err) {
      alert("Failed to delete user account.");
    }
  };


  const handleUpdateClaimStatus = async (id: string, status: 'Approved' | 'Rejected' | 'Settled') => {
    setUpdatingClaimId(id);
    try {
      const inspectionNotes = adminInspectionNotes[id] || "";
      await api.put(`/damage-claims/${id}/status`, { status, inspectionNotes });
      fetchPlatformData();
    } catch (err) {
      alert("Failed to update damage claim status: " + (err instanceof Error ? err.message : "Error"));
    } finally {
      setUpdatingClaimId(null);
    }
  };


  const handleUpdateTicketStatus = async (id: string, status: 'Open' | 'In Progress' | 'Resolved') => {
    setUpdatingTicketId(id);
    try {
      await api.put(`/maintenance/${id}/status`, { status });
      fetchPlatformData();
    } catch (err) {
      alert("Failed to update ticket status: " + (err instanceof Error ? err.message : "Error"));
    } finally {
      setUpdatingTicketId(null);
    }
  };

  const handleAddTicketComment = async (id: string) => {
    const text = newCommentText[id] || "";
    if (!text.trim()) return;
    try {
      await api.post(`/maintenance/${id}/comments`, { text });
      setNewCommentText({ ...newCommentText, [id]: "" });
      fetchPlatformData();
    } catch (err) {
      alert("Failed to post comment: " + (err instanceof Error ? err.message : "Error"));
    }
  };


  const handleUpdateRentalStatus = async (rentalId: string, newStatus: string) => {
    setUpdatingRentalId(rentalId);
    try {
      await api.put(`/rentals/${rentalId}/status`, { status: newStatus });
      fetchPlatformData();
    } catch (err) {
      alert("Failed to update rental status: " + (err instanceof Error ? err.message : "Error"));
    } finally {
      setUpdatingRentalId(null);
    }
  };


  const handleOpenCreateListing = () => {
    setListingModalMode("create");
    setEditingListingId(null);
    setListingForm({
      title: "",
      description: "",
      location: "",
      price: 2000,
      category: "Villas",
      image: GRADIENTS[0].value,
      vendor: currentUser?._id || ""
    });
    setListingFormError(null);
    setListingModalOpen(true);
  };

  const handleOpenEditListing = (listing: Listing) => {
    setListingModalMode("edit");
    setEditingListingId(listing._id);
    setListingForm({
      title: listing.title,
      description: listing.description,
      location: listing.location,
      price: listing.price,
      category: listing.category,
      image: listing.image,
      vendor: typeof listing.vendor === "object" ? listing.vendor?._id || "" : listing.vendor || ""
    });
    setListingFormError(null);
    setListingModalOpen(true);
  };

  const handleListingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setListingFormError(null);
    setSubmittingListing(true);

    if (!listingForm.title || !listingForm.description || !listingForm.location || listingForm.price <= 0) {
      setListingFormError("Please enter valid property information.");
      setSubmittingListing(false);
      return;
    }

    try {
      if (listingModalMode === "create") {
        await api.post("/listings", listingForm);
      } else {
        await api.put(`/listings/${editingListingId}`, listingForm);
      }
      setListingModalOpen(false);
      fetchPlatformData();
    } catch (err) {
      setListingFormError(err instanceof Error ? err.message : "Failed to save property. Please try again.");
    } finally {
      setSubmittingListing(false);
    }
  };

  const handleDeleteListing = async (listingId: string) => {
    if (!confirm("Are you sure you want to remove this property listing from the platform?")) return;
    try {
      await api.delete(`/listings/${listingId}`);
      fetchPlatformData();
    } catch (err) {
      alert("Failed to delete listing.");
    }
  };


  const handleOpenCreateProduct = () => {
    setProductModalMode("create");
    setEditingProductId(null);
    setProductForm({
      name: "",
      description: "",
      monthlyRent: 400,
      deposit: 1500,
      availableQuantity: 5,
      category: "Furniture",
      image: GRADIENTS[0].value,
      tenureOptions: [3, 6, 12],
      vendor: currentUser?._id || ""
    });
    setProductFormError(null);
    setProductModalOpen(true);
  };

  const handleOpenEditProduct = (product: Product) => {
    setProductModalMode("edit");
    setEditingProductId(product._id);
    setProductForm({
      name: product.name,
      description: product.description,
      monthlyRent: product.monthlyRent,
      deposit: product.deposit,
      availableQuantity: product.availableQuantity,
      category: product.category,
      image: product.images?.[0] || GRADIENTS[0].value,
      tenureOptions: product.tenureOptions || [3, 6, 12],
      vendor: typeof product.vendor === "object" ? product.vendor?._id || "" : product.vendor || ""
    });
    setProductFormError(null);
    setProductModalOpen(true);
  };

  const handleProductSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setProductFormError(null);
    setSubmittingProduct(true);

    if (!productForm.name || !productForm.description || productForm.monthlyRent <= 0 || productForm.deposit <= 0 || productForm.availableQuantity < 0) {
      setProductFormError("Please enter valid product details.");
      setSubmittingProduct(false);
      return;
    }

    if (productForm.tenureOptions.length === 0) {
      setProductFormError("Please select at least one rental tenure option.");
      setSubmittingProduct(false);
      return;
    }

    const payload = {
      name: productForm.name,
      description: productForm.description,
      monthlyRent: productForm.monthlyRent,
      deposit: productForm.deposit,
      availableQuantity: productForm.availableQuantity,
      category: productForm.category,
      images: [productForm.image],
      tenureOptions: productForm.tenureOptions,
      vendor: productForm.vendor
    };

    try {
      if (productModalMode === "create") {
        await api.post("/products", payload);
      } else {
        await api.put(`/products/${editingProductId}`, payload);
      }
      setProductModalOpen(false);
      fetchPlatformData();
    } catch (err) {
      setProductFormError(err instanceof Error ? err.message : "Failed to save product. Please try again.");
    } finally {
      setSubmittingProduct(false);
    }
  };

  const handleDeleteProduct = async (productId: string) => {
    if (!confirm("Are you sure you want to remove this product from the platform?")) return;
    try {
      await api.delete(`/products/${productId}`);
      fetchPlatformData();
    } catch (err) {
      alert("Failed to delete product.");
    }
  };

  const handleAdminTenureToggle = (months: number) => {
    setProductForm(prev => {
      const exists = prev.tenureOptions.includes(months);
      const updated = exists
        ? prev.tenureOptions.filter(m => m !== months)
        : [...prev.tenureOptions, months].sort((a, b) => a - b);
      return { ...prev, tenureOptions: updated };
    });
  };


  const handleOpenCreateServiceArea = () => {
    setServiceAreaModalMode("create");
    setEditingServiceAreaId(null);
    setServiceAreaForm({
      name: "",
      city: "",
      state: "",
      postalCodes: "",
      isActive: true
    });
    setServiceAreaFormError(null);
    setServiceAreaModalOpen(true);
  };

  const handleOpenEditServiceArea = (area: ServiceArea) => {
    setServiceAreaModalMode("edit");
    setEditingServiceAreaId(area._id);
    setServiceAreaForm({
      name: area.name,
      city: area.city,
      state: area.state,
      postalCodes: area.postalCodes.join(", "),
      isActive: area.isActive
    });
    setServiceAreaFormError(null);
    setServiceAreaModalOpen(true);
  };

  const handleServiceAreaSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setServiceAreaFormError(null);
    setSubmittingServiceArea(true);

    const { name, city, state, postalCodes, isActive } = serviceAreaForm;
    if (!name.trim() || !city.trim() || !state.trim() || !postalCodes.trim()) {
      setServiceAreaFormError("Please fill in all fields.");
      setSubmittingServiceArea(false);
      return;
    }

    const postalCodesArr = postalCodes
      .split(",")
      .map(pc => pc.trim())
      .filter(pc => pc.length > 0);

    if (postalCodesArr.length === 0) {
      setServiceAreaFormError("Please add at least one valid postal code.");
      setSubmittingServiceArea(false);
      return;
    }

    const payload = {
      name: name.trim(),
      city: city.trim(),
      state: state.trim(),
      postalCodes: postalCodesArr,
      isActive
    };

    try {
      if (serviceAreaModalMode === "create") {
        await api.post("/service-areas", payload);
      } else {
        await api.put(`/service-areas/${editingServiceAreaId}`, payload);
      }
      setServiceAreaModalOpen(false);
      fetchPlatformData();
    } catch (err) {
      setServiceAreaFormError(err instanceof Error ? err.message : "Failed to save service area.");
    } finally {
      setSubmittingServiceArea(false);
    }
  };

  const handleToggleServiceAreaStatus = async (area: ServiceArea) => {
    try {
      await api.put(`/service-areas/${area._id}`, { isActive: !area.isActive });
      fetchPlatformData();
    } catch (err) {
      alert("Failed to toggle service area status.");
    }
  };

  const handleDeleteServiceArea = async (areaId: string) => {
    if (!confirm("Are you sure you want to delete this service area?")) return;
    try {
      await api.delete(`/service-areas/${areaId}`);
      fetchPlatformData();
    } catch (err) {
      alert("Failed to delete service area.");
    }
  };


  const totalUsersCount = analyticsData?.cards?.totalUsers ?? usersList.length;
  const activeRentalsCount = analyticsData?.cards?.activeRentals ?? rentalsList.filter(r => r.status === "Active").length;
  const pendingRequestsCount = analyticsData?.cards?.pendingRequests ?? rentalsList.filter(r => r.status === "Pending").length;
  const revenueAmount = analyticsData?.cards?.revenue ?? rentalsList.reduce((sum, r) => sum + r.totalPrice, 0);

  const overviewCards = [
    { label: "Total Users", value: totalUsersCount, icon: Users, color: "bg-indigo-50 dark:bg-indigo-950/30 text-indigo-650 dark:text-indigo-400" },
    { label: "Active Rentals", value: activeRentalsCount, icon: Clock, color: "bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400" },
    { label: "Revenue", value: `₹${revenueAmount.toLocaleString("en-IN")}`, icon: DollarSign, color: "bg-violet-50 dark:bg-violet-950/30 text-violet-600 dark:text-violet-400" },
    { label: "Pending Requests", value: pendingRequestsCount, icon: AlertTriangle, color: "bg-amber-50 dark:bg-amber-950/30 text-amber-600 dark:text-amber-400" },
  ];

  if (!currentUser) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="h-8 w-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/20 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">

        {}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-card border border-border/60 p-6 rounded-2xl shadow-sm">
          <div className="flex items-center gap-4">
            <div className="h-14 w-14 rounded-2xl bg-gradient-to-tr from-red-600 to-orange-500 flex items-center justify-center text-white text-xl font-bold shadow-lg">
              {currentUser.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-extrabold text-foreground">Admin Control Panel</h1>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-400 border border-red-100 dark:border-red-900">
                  <ShieldCheck className="h-3.5 w-3.5" />
                  Administrator
                </span>
              </div>
              <p className="text-xs sm:text-sm text-muted-foreground">{currentUser.name} · {currentUser.email}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 self-start sm:self-center">
            <Link
              href="/admin/analytics"
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-indigo-600 to-violet-650 hover:from-indigo-500 hover:to-violet-550 text-white rounded-xl text-xs font-semibold shadow-md transition-all cursor-pointer"
            >
              <Activity className="h-4 w-4" />
              Analytics Dashboard
            </Link>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 border border-red-200 dark:border-red-900/40 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-xl text-xs font-semibold text-red-650 dark:text-red-400 transition-all cursor-pointer"
            >
              <LogOut className="h-4 w-4" />
              Sign Out
            </button>
          </div>
        </div>

        {}
        <div className="flex border-b border-border/60 gap-6 overflow-x-auto pb-0.5 scrollbar-none">
          <button
            onClick={() => setActiveTab("overview")}
            className={`pb-3.5 text-xs font-bold transition-all relative cursor-pointer whitespace-nowrap ${
              activeTab === "overview"
                ? "text-red-650 dark:text-red-400 after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-red-600 dark:after:bg-red-400"
                : "text-neutral-500 hover:text-neutral-700 dark:hover:text-white"
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab("users")}
            className={`pb-3.5 text-xs font-bold transition-all relative cursor-pointer whitespace-nowrap ${
              activeTab === "users"
                ? "text-red-650 dark:text-red-400 after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-red-600 dark:after:bg-red-400"
                : "text-neutral-500 hover:text-neutral-700 dark:hover:text-white"
            }`}
          >
            User Accounts ({usersList.length})
          </button>
          <button
            onClick={() => setActiveTab("listings")}
            className={`pb-3.5 text-xs font-bold transition-all relative cursor-pointer whitespace-nowrap ${
              activeTab === "listings"
                ? "text-red-650 dark:text-red-400 after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-red-600 dark:after:bg-red-400"
                : "text-neutral-500 hover:text-neutral-700 dark:hover:text-white"
            }`}
          >
            Property Listings ({listingsList.length})
          </button>
          <button
            onClick={() => setActiveTab("products")}
            className={`pb-3.5 text-xs font-bold transition-all relative cursor-pointer whitespace-nowrap ${
              activeTab === "products"
                ? "text-red-650 dark:text-red-400 after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-red-600 dark:after:bg-red-400"
                : "text-neutral-500 hover:text-neutral-700 dark:hover:text-white"
            }`}
          >
            Catalog Products ({productsList.length})
          </button>
          <button
            onClick={() => setActiveTab("rentals")}
            className={`pb-3.5 text-xs font-bold transition-all relative cursor-pointer whitespace-nowrap ${
              activeTab === "rentals"
                ? "text-red-650 dark:text-red-400 after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-red-600 dark:after:bg-red-400"
                : "text-neutral-500 hover:text-neutral-700 dark:hover:text-white"
            }`}
          >
            Rentals Management ({rentalsList.length})
          </button>
          <button
            onClick={() => setActiveTab("disputes")}
            className={`pb-3.5 text-xs font-bold transition-all relative cursor-pointer whitespace-nowrap ${
              activeTab === "disputes"
                ? "text-red-650 dark:text-red-400 after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-red-600 dark:after:bg-red-400"
                : "text-neutral-500 hover:text-neutral-700 dark:hover:text-white"
            }`}
          >
            Disputes & Tickets ({claimsList.length + maintenanceList.length})
          </button>
          <button
            onClick={() => setActiveTab("service_areas")}
            className={`pb-3.5 text-xs font-bold transition-all relative cursor-pointer whitespace-nowrap ${
              activeTab === "service_areas"
                ? "text-red-650 dark:text-red-400 after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-red-600 dark:after:bg-red-400"
                : "text-neutral-500 hover:text-neutral-700 dark:hover:text-white"
            }`}
          >
            Service Areas ({serviceAreasList.length})
          </button>
        </div>

        {loading ? (
          <div className="py-20 flex justify-center">
            <div className="h-8 w-8 border-3 border-red-600 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : error ? (
          <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/40 rounded-xl p-4 text-center text-xs text-red-650 dark:text-red-400 max-w-md mx-auto">
            {error}
          </div>
        ) : (
          <div className="space-y-6">

            {}
            {activeTab === "overview" && (
              <div className="space-y-8 animate-in fade-in duration-200">
                {}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  {overviewCards.map(({ label, value, icon: Icon, color }) => (
                    <div key={label} className="bg-card border border-border/60 rounded-2xl p-5 flex items-center gap-4 shadow-sm">
                      <div className={`h-11 w-11 rounded-xl flex items-center justify-center shrink-0 ${color}`}>
                        <Icon className="h-5.5 w-5.5" />
                      </div>
                      <div>
                        <p className="text-xl font-extrabold text-foreground">{value}</p>
                        <p className="text-[10px] sm:text-xs text-muted-foreground font-semibold">{label}</p>
                      </div>
                    </div>
                  ))}
                </div>

                {}
                <div className="bg-card border border-border/60 rounded-2xl p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <ShieldCheck className="h-5 w-5 text-red-600 dark:text-red-400" />
                    <h2 className="text-lg font-bold text-foreground">Platform Summary</h2>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="rounded-xl border border-neutral-100 dark:border-neutral-800 bg-neutral-50/40 dark:bg-neutral-950/20 p-4 space-y-1">
                      <p className="text-xs text-neutral-400 font-medium">Platform Roles</p>
                      <div className="text-xs font-semibold text-muted-foreground space-y-1 pt-1">
                        <div className="flex justify-between"><span>Customers</span> <span className="font-bold">{usersList.filter(u => u.role === "customer" || u.role === "user").length}</span></div>
                        <div className="flex justify-between"><span>Vendors</span> <span className="font-bold">{usersList.filter(u => u.role === "vendor").length}</span></div>
                        <div className="flex justify-between"><span>Administrators</span> <span className="font-bold">{usersList.filter(u => u.role === "admin").length}</span></div>
                      </div>
                    </div>

                    <div className="rounded-xl border border-neutral-100 dark:border-neutral-800 bg-neutral-50/40 dark:bg-neutral-950/20 p-4 space-y-1">
                      <p className="text-xs text-neutral-400 font-medium">Platform Averages</p>
                      <div className="text-xs font-semibold text-muted-foreground space-y-1 pt-1">
                        <div className="flex justify-between"><span>Avg. Prop Price</span> <span className="font-bold">₹{listingsList.length > 0 ? Math.round(listingsList.reduce((sum, item) => sum + item.price, 0) / listingsList.length).toLocaleString("en-IN") : 0}</span></div>
                        <div className="flex justify-between"><span>Avg. Prod Rent</span> <span className="font-bold">₹{productsList.length > 0 ? Math.round(productsList.reduce((sum, item) => sum + item.monthlyRent, 0) / productsList.length).toLocaleString("en-IN") : 0}</span></div>
                      </div>
                    </div>

                    <div className="rounded-xl border border-neutral-100 dark:border-neutral-800 bg-neutral-50/40 dark:bg-neutral-950/20 p-4 flex flex-col justify-center gap-2">
                      <button
                        onClick={() => setActiveTab("rentals")}
                        className="w-full text-center bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/25 dark:hover:bg-indigo-950/45 text-indigo-650 dark:text-indigo-400 text-xs font-semibold py-1.5 rounded-xl border border-indigo-100 dark:border-indigo-900/40 cursor-pointer"
                      >
                        Manage Active Rentals &rarr;
                      </button>
                      <button
                        onClick={() => setActiveTab("service_areas")}
                        className="w-full text-center bg-orange-50 hover:bg-orange-100 dark:bg-orange-950/25 dark:hover:bg-orange-950/45 text-orange-655 dark:text-orange-400 text-xs font-semibold py-1.5 rounded-xl border border-orange-100 dark:border-orange-900/40 cursor-pointer"
                      >
                        Manage Serviced Areas &rarr;
                      </button>
                      <button
                        onClick={() => setActiveTab("disputes")}
                        className="w-full text-center bg-red-50 hover:bg-red-100 dark:bg-red-950/25 dark:hover:bg-red-950/45 text-red-650 dark:text-red-400 text-xs font-semibold py-1.5 rounded-xl border border-red-100 dark:border-red-900/40 cursor-pointer"
                      >
                        Review Disputes & Claims &rarr;
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {}
            {activeTab === "users" && (
              <div className="bg-card border border-border/60 rounded-2xl p-6 space-y-4 animate-in fade-in duration-205">
                <h2 className="text-base font-bold text-foreground flex items-center gap-2">
                  <Users className="h-4.5 w-4.5 text-red-500" />
                  Registered Platform Accounts
                </h2>

                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="border-b border-neutral-100 dark:border-neutral-800 text-neutral-400 font-bold uppercase tracking-wider">
                        <th className="py-3 px-4">User Details</th>
                        <th className="py-3 px-4">Email Address</th>
                        <th className="py-3 px-4">Account Role</th>
                        <th className="py-3 px-4 text-right">Administrative Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {usersList.map((user) => (
                        <tr key={user._id} className="border-b border-neutral-50 dark:border-neutral-850 hover:bg-neutral-50/50 dark:hover:bg-neutral-950/40 transition-colors">
                          <td className="py-3.5 px-4 font-bold text-neutral-800 dark:text-white">{user.name}</td>
                          <td className="py-3.5 px-4 text-muted-foreground">{user.email}</td>
                          <td className="py-3.5 px-4">
                            <select
                              value={user.role}
                              onChange={(e) => handleUpdateUserRole(user._id, e.target.value)}
                              className="text-xs font-semibold border border-neutral-300 dark:border-neutral-800 bg-card text-neutral-700 dark:text-white rounded px-2 py-1 focus:outline-none"
                            >
                              <option value="customer">Customer</option>
                              <option value="vendor">Vendor</option>
                              <option value="admin">Admin</option>
                            </select>
                          </td>
                          <td className="py-3.5 px-4 text-right">
                            <button
                              onClick={() => handleDeleteUser(user._id)}
                              className="p-1.5 border border-border/60 hover:border-red-200 hover:text-red-500 rounded-lg text-neutral-400 transition-colors cursor-pointer"
                              title="Delete Account"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {}
            {activeTab === "listings" && (
              <div className="bg-card border border-border/60 rounded-2xl p-6 space-y-6 animate-in fade-in duration-205">
                <div className="flex items-center justify-between">
                  <h2 className="text-base font-bold text-foreground flex items-center gap-2">
                    <Home className="h-4.5 w-4.5 text-orange-500" />
                    All Platform Listings
                  </h2>
                  <button
                    onClick={handleOpenCreateListing}
                    className="bg-primary hover:bg-primary/90 text-white font-bold text-xs py-2 px-4 rounded-xl flex items-center gap-1.5 transition-all cursor-pointer shadow-md shadow-indigo-500/10"
                  >
                    <Plus className="h-4 w-4" />
                    Add Listing
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="border-b border-neutral-100 dark:border-neutral-800 text-neutral-400 font-bold uppercase tracking-wider">
                        <th className="py-3 px-4">Property</th>
                        <th className="py-3 px-4">Location</th>
                        <th className="py-3 px-4">Host Vendor</th>
                        <th className="py-3 px-4">Price</th>
                        <th className="py-3 px-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {listingsList.map((listing) => (
                        <tr key={listing._id} className="border-b border-neutral-50 dark:border-neutral-850 hover:bg-neutral-50/50 dark:hover:bg-neutral-950/40 transition-colors">
                          <td className="py-3.5 px-4 font-bold text-neutral-800 dark:text-white">{listing.title}</td>
                          <td className="py-3.5 px-4 text-muted-foreground">{listing.location}</td>
                          <td className="py-3.5 px-4 text-muted-foreground font-medium">
                            {listing.vendor && typeof listing.vendor === "object" ? listing.vendor.name : "Platform Admin"}
                          </td>
                          <td className="py-3.5 px-4 font-bold text-foreground">
                            ₹{listing.price.toLocaleString("en-IN")}
                          </td>
                          <td className="py-3.5 px-4 text-right space-x-1.5">
                            <button
                              onClick={() => handleOpenEditListing(listing)}
                              className="p-1.5 border border-border/60 hover:border-indigo-300 hover:text-indigo-600 dark:hover:hover:border-violet-650 dark:hover:text-violet-400 rounded-lg text-neutral-450 transition-colors cursor-pointer"
                              title="Edit Listing"
                            >
                              <Edit2 className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteListing(listing._id)}
                              className="p-1.5 border border-border/60 hover:border-red-200 hover:text-red-500 rounded-lg text-neutral-450 transition-colors cursor-pointer"
                              title="Delete Listing"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {}
            {activeTab === "products" && (
              <div className="bg-card border border-border/60 rounded-2xl p-6 space-y-6 animate-in fade-in duration-205">
                <div className="flex items-center justify-between">
                  <h2 className="text-base font-bold text-foreground flex items-center gap-2">
                    <Package className="h-4.5 w-4.5 text-amber-500" />
                    All Catalog Products
                  </h2>
                  <button
                    onClick={handleOpenCreateProduct}
                    className="bg-primary hover:bg-primary/90 text-white font-bold text-xs py-2 px-4 rounded-xl flex items-center gap-1.5 transition-all cursor-pointer shadow-md shadow-indigo-500/10"
                  >
                    <Plus className="h-4 w-4" />
                    Add Product
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="border-b border-neutral-100 dark:border-neutral-800 text-neutral-400 font-bold uppercase tracking-wider">
                        <th className="py-3 px-4">Product Name</th>
                        <th className="py-3 px-4">Category</th>
                        <th className="py-3 px-4">Owner Vendor</th>
                        <th className="py-3 px-4">Monthly Rent</th>
                        <th className="py-3 px-4">In Stock</th>
                        <th className="py-3 px-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {productsList.map((product) => (
                        <tr key={product._id} className="border-b border-neutral-50 dark:border-neutral-850 hover:bg-neutral-50/50 dark:hover:bg-neutral-950/40 transition-colors">
                          <td className="py-3.5 px-4 font-bold text-neutral-800 dark:text-white">{product.name}</td>
                          <td className="py-3.5 px-4 text-muted-foreground capitalize">{product.category}</td>
                          <td className="py-3.5 px-4 text-muted-foreground font-medium">
                            {product.vendor && typeof product.vendor === "object" ? product.vendor.name : "Platform Admin"}
                          </td>
                          <td className="py-3.5 px-4 font-bold text-foreground">
                            ₹{product.monthlyRent.toLocaleString("en-IN")}/mo
                          </td>
                          <td className="py-3.5 px-4 text-neutral-500 font-bold">
                            {product.availableQuantity} units
                          </td>
                          <td className="py-3.5 px-4 text-right space-x-1.5">
                            <button
                              onClick={() => handleOpenEditProduct(product)}
                              className="p-1.5 border border-border/60 hover:border-indigo-300 hover:text-indigo-600 dark:hover:hover:border-violet-650 dark:hover:text-violet-400 rounded-lg text-neutral-450 transition-colors cursor-pointer"
                              title="Edit Product"
                            >
                              <Edit2 className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteProduct(product._id)}
                              className="p-1.5 border border-border/60 hover:border-red-200 hover:text-red-500 rounded-lg text-neutral-450 transition-colors cursor-pointer"
                              title="Delete Product"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {}
            {activeTab === "rentals" && (
              <div className="bg-card border border-border/60 rounded-2xl p-6 space-y-6 animate-in fade-in duration-205">
                <h2 className="text-base font-bold text-foreground flex items-center gap-2">
                  <Clock className="h-4.5 w-4.5 text-indigo-550" />
                  Global Rental Agreements
                </h2>

                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="border-b border-neutral-100 dark:border-neutral-800 text-neutral-400 font-bold uppercase tracking-wider">
                        <th className="py-3 px-4">Rental ID / Product</th>
                        <th className="py-3 px-4">Customer Details</th>
                        <th className="py-3 px-4">Dates & Tenure</th>
                        <th className="py-3 px-4">Price details</th>
                        <th className="py-3 px-4">Lease Status</th>
                        <th className="py-3 px-4 text-right">Update Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {rentalsList.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="py-10 text-center text-neutral-500 italic">No bookings recorded on the platform.</td>
                        </tr>
                      ) : (
                        rentalsList.map((rental) => (
                          <tr key={rental._id} className="border-b border-neutral-50 dark:border-neutral-850 hover:bg-neutral-50/50 dark:hover:bg-neutral-950/40 transition-colors">
                            <td className="py-3.5 px-4 font-bold text-neutral-800 dark:text-white">
                              <p className="text-[10px] text-neutral-400 font-mono">#{rental._id.slice(-8).toUpperCase()}</p>
                              <p className="mt-0.5 truncate max-w-[150px]" title={rental.product?.name}>{rental.product?.name || "Product Item"}</p>
                            </td>
                            <td className="py-3.5 px-4 text-neutral-500">
                              <p className="font-bold text-muted-foreground">{rental.user?.name}</p>
                              <p className="text-[10px]">{rental.user?.email}</p>
                              {rental.user?.phone && <p className="text-[10px] text-neutral-400">{rental.user?.phone}</p>}
                            </td>
                            <td className="py-3.5 px-4 text-neutral-500 space-y-0.5">
                              <p>Start: <strong className="text-muted-foreground">{new Date(rental.startDate).toLocaleDateString()}</strong></p>
                              <p>End: <strong className="text-muted-foreground">{new Date(rental.endDate).toLocaleDateString()}</strong></p>
                              <p className="text-[10px] bg-neutral-100 dark:bg-neutral-800 inline-block px-1.5 py-0.5 rounded font-bold">{rental.tenure} months ({rental.quantity} unit{rental.quantity > 1 ? "s" : ""})</p>
                            </td>
                            <td className="py-3.5 px-4 space-y-0.5">
                              <p>Rent: <span className="font-semibold text-neutral-800 dark:text-white">₹{rental.monthlyRent}/mo</span></p>
                              <p>Deposit: <span className="font-semibold text-neutral-800 dark:text-white">₹{rental.deposit}</span></p>
                              <p className="text-[11px] font-bold text-primary">Total: ₹{rental.totalPrice.toLocaleString("en-IN")}</p>
                            </td>
                            <td className="py-3.5 px-4">
                              <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                                rental.status === 'Active' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-955/20 dark:text-emerald-400' :
                                rental.status === 'Pending' ? 'bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-955/20 dark:text-amber-400' :
                                rental.status === 'Approved' ? 'bg-blue-50 text-blue-700 border border-blue-200 dark:bg-blue-955/20 dark:text-blue-400' :
                                rental.status === 'Delivered' ? 'bg-indigo-50 text-indigo-700 border border-indigo-200 dark:bg-indigo-955/20 dark:text-indigo-400' :
                                rental.status === 'Returned' ? 'bg-neutral-100 text-neutral-700 border border-neutral-300 dark:bg-neutral-800 dark:text-neutral-300' :
                                'bg-red-50 text-red-700 border border-red-200 dark:bg-red-955/20 dark:text-red-400'
                              }`}>
                                {rental.status}
                              </span>
                            </td>
                            <td className="py-3.5 px-4 text-right">
                              <select
                                value={rental.status}
                                disabled={updatingRentalId === rental._id}
                                onChange={(e) => handleUpdateRentalStatus(rental._id, e.target.value)}
                                className="text-xs font-semibold border border-neutral-300 dark:border-neutral-800 bg-card text-neutral-700 dark:text-white rounded px-2.5 py-1 focus:outline-none disabled:opacity-50"
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
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {}
            {activeTab === "disputes" && (
              <div className="space-y-6 animate-in fade-in duration-205">
                {}
                <div className="flex border-b border-border/60 gap-4">
                  <button
                    onClick={() => setDisputesSubTab("claims")}
                    className={`pb-2.5 text-xs font-bold transition-all relative cursor-pointer ${
                      disputesSubTab === "claims"
                        ? "text-red-650 dark:text-red-400 after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-red-650 dark:after:bg-red-450"
                        : "text-neutral-450 hover:text-neutral-700 dark:hover:text-white"
                    }`}
                  >
                    Damage Claims ({claimsList.length})
                  </button>
                  <button
                    onClick={() => setDisputesSubTab("maintenance")}
                    className={`pb-2.5 text-xs font-bold transition-all relative cursor-pointer ${
                      disputesSubTab === "maintenance"
                        ? "text-red-650 dark:text-red-400 after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-red-650 dark:after:bg-red-450"
                        : "text-neutral-450 hover:text-neutral-700 dark:hover:text-white"
                    }`}
                  >
                    Maintenance Tickets ({maintenanceList.length})
                  </button>
                </div>

                {}
                {disputesSubTab === "claims" ? (
                  <div className="bg-card border border-border/60 rounded-2xl p-6 space-y-6">
                    <h2 className="text-base font-bold text-foreground flex items-center gap-2">
                      <ShieldAlert className="h-4.5 w-4.5 text-red-505" />
                      Damage Claims Review & Settlement
                    </h2>

                    {claimsList.length === 0 ? (
                      <div className="text-center py-16 border border-dashed border-border/60 rounded-xl space-y-3">
                        <CheckCircle2 className="h-12 w-12 mx-auto text-emerald-400" />
                        <p className="font-bold text-neutral-800 dark:text-white text-sm">No active claims</p>
                        <p className="text-xs text-neutral-500">All properties and product handovers are in perfect condition.</p>
                      </div>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse text-xs">
                          <thead>
                            <tr className="border-b border-neutral-100 dark:border-neutral-800 text-neutral-400 font-bold uppercase tracking-wider">
                              <th className="py-3 px-4">Claimed Item</th>
                              <th className="py-3 px-4">Severity & Description</th>
                              <th className="py-3 px-4">Reported By / To</th>
                              <th className="py-3 px-4">Charges</th>
                              <th className="py-3 px-4">Status & Action</th>
                            </tr>
                          </thead>
                          <tbody>
                            {claimsList.map((claim) => {
                              const getStatusClass = (s: string) => {
                                switch (s) {
                                  case "Pending":   return "bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-955/20 dark:text-amber-400";
                                  case "Approved":  return "bg-blue-50 text-blue-700 border border-blue-200 dark:bg-blue-955/20 dark:text-blue-400";
                                  case "Rejected":  return "bg-red-50 text-red-700 border border-red-200 dark:bg-red-955/20 dark:text-red-400";
                                  case "Settled":   return "bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-955/20 dark:text-emerald-400";
                                  default:          return "bg-neutral-50 text-neutral-700";
                                }
                              };

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

                              return (
                                <tr key={claim._id} className="border-b border-neutral-50 dark:border-neutral-850 hover:bg-neutral-55/20 dark:hover:bg-neutral-950/40 transition-colors">
                                  <td className="py-3.5 px-4 font-bold text-neutral-800 dark:text-white">
                                    <div className="flex items-center gap-2">
                                      <div className="w-10 h-10 rounded-lg bg-neutral-100 dark:bg-neutral-950 overflow-hidden shrink-0" style={getCoverStyle(claim.rental?.product?.images?.[0] || "")} />
                                      <span className="truncate max-w-[150px] block" title={claim.rental?.product?.name}>{claim.rental?.product?.name || "Product"}</span>
                                    </div>
                                  </td>
                                  <td className="py-3.5 px-4">
                                    <span className={`px-2 py-0.5 rounded text-[8px] font-extrabold uppercase ${
                                      claim.severity === "High" ? "bg-red-100 text-red-755 dark:bg-red-955/20 dark:text-red-400" : "bg-neutral-100 text-neutral-700"
                                    }`}>
                                      {claim.severity}
                                    </span>
                                    <p className="text-neutral-500 mt-1 max-w-[200px] truncate" title={claim.description}>"{claim.description}"</p>
                                  </td>
                                  <td className="py-3.5 px-4 text-neutral-500 space-y-0.5">
                                    <p>By: <strong className="text-neutral-750 dark:text-neutral-350">{claim.reportedBy?.name || "Vendor"}</strong></p>
                                    <p>To: <strong className="text-neutral-750 dark:text-neutral-350">{claim.reportedTo?.name || "Customer"}</strong></p>
                                  </td>
                                  <td className="py-3.5 px-4 space-y-0.5">
                                    <p>Deduct: <strong className="text-neutral-800 dark:text-white">₹{claim.deductedAmount}</strong></p>
                                    <p>Penalty: <strong className="text-neutral-800 dark:text-white">₹{claim.penaltyAmount}</strong></p>
                                  </td>
                                  <td className="py-3.5 px-4 space-y-2">
                                    <div className="flex items-center gap-2 justify-between">
                                      <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${getStatusClass(claim.status)}`}>
                                        {claim.status}
                                      </span>
                                      <input
                                        type="text"
                                        placeholder="Review Notes..."
                                        value={adminInspectionNotes[claim._id] || ""}
                                        onChange={(e) => setAdminInspectionNotes({ ...adminInspectionNotes, [claim._id]: e.target.value })}
                                        className="py-1 px-2 border border-neutral-300 dark:border-neutral-850 bg-white dark:bg-neutral-950 text-foreground text-[10px] rounded focus:outline-none w-[120px]"
                                      />
                                    </div>
                                    <div className="flex gap-1.5">
                                      <button
                                        onClick={() => handleUpdateClaimStatus(claim._id, 'Approved')}
                                        disabled={updatingClaimId === claim._id || claim.status === 'Approved' || claim.status === 'Settled'}
                                        className="flex-1 py-1 px-1.5 bg-blue-600 hover:bg-blue-750 disabled:opacity-50 text-white text-[9px] font-extrabold rounded cursor-pointer border-none"
                                      >
                                        Approve
                                      </button>
                                      <button
                                        onClick={() => handleUpdateClaimStatus(claim._id, 'Rejected')}
                                        disabled={updatingClaimId === claim._id || claim.status === 'Rejected' || claim.status === 'Settled'}
                                        className="flex-1 py-1 px-1.5 bg-red-600 hover:bg-red-750 disabled:opacity-50 text-white text-[9px] font-extrabold rounded cursor-pointer border-none"
                                      >
                                        Reject
                                      </button>
                                      <button
                                        onClick={() => handleUpdateClaimStatus(claim._id, 'Settled')}
                                        disabled={updatingClaimId === claim._id || claim.status === 'Settled' || claim.status === 'Rejected'}
                                        className="flex-1 py-1 px-1.5 bg-emerald-600 hover:bg-emerald-755 disabled:opacity-50 text-white text-[9px] font-extrabold rounded cursor-pointer border-none"
                                      >
                                        Settle
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
                ) : (
                  <div className="bg-card border border-border/60 rounded-2xl p-6 space-y-6">
                    <h2 className="text-base font-bold text-foreground flex items-center gap-2">
                      <Wrench className="h-4.5 w-4.5 text-indigo-505" />
                      Active Maintenance & Repair Tickets
                    </h2>

                    {maintenanceList.length === 0 ? (
                      <div className="text-center py-16 border border-dashed border-border/60 rounded-xl space-y-3">
                        <CheckCircle2 className="h-12 w-12 mx-auto text-emerald-400" />
                        <p className="font-bold text-neutral-800 dark:text-white text-sm">No maintenance tickets</p>
                        <p className="text-xs text-neutral-500">All customer products and listing repairs are fully completed.</p>
                      </div>
                    ) : (
                      <div className="space-y-6">
                        {maintenanceList.map((ticket) => (
                          <div key={ticket._id} className="border border-border/60 rounded-xl p-5 space-y-4">
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-neutral-100 dark:border-neutral-850 pb-3">
                              <div>
                                <span className={`px-2 py-0.5 rounded text-[9px] font-extrabold uppercase tracking-wide ${
                                  ticket.status === 'Open' ? 'bg-amber-50 text-amber-705 border border-amber-200 dark:bg-amber-955/20 dark:text-amber-400' :
                                  ticket.status === 'In Progress' ? 'bg-blue-50 text-blue-700 border border-blue-200 dark:bg-blue-955/20 dark:text-blue-400' :
                                  'bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-955/20 dark:text-emerald-400'
                                }`}>
                                  {ticket.status}
                                </span>
                                <h3 className="font-extrabold text-neutral-800 dark:text-white mt-1 text-sm">{ticket.title}</h3>
                              </div>
                              <div className="flex items-center gap-2">
                                <label className="text-[10px] text-neutral-400 uppercase font-bold">Status Action:</label>
                                <select
                                  value={ticket.status}
                                  disabled={updatingTicketId === ticket._id}
                                  onChange={(e) => handleUpdateTicketStatus(ticket._id, e.target.value as any)}
                                  className="text-[11px] font-bold border border-neutral-300 dark:border-neutral-800 bg-white dark:bg-neutral-950 text-neutral-800 dark:text-white rounded px-2 py-1 focus:outline-none"
                                >
                                  <option value="Open">Open</option>
                                  <option value="In Progress">In Progress</option>
                                  <option value="Resolved">Resolved</option>
                                </select>
                              </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-neutral-500">
                              <div>
                                <p className="font-bold text-neutral-450 uppercase text-[9px]">Ticket Details</p>
                                <p className="mt-1 text-muted-foreground font-medium">"{ticket.description}"</p>
                                <p className="mt-2 text-[10px]">Submitted By: <strong>{ticket.user?.name}</strong> ({ticket.user?.email})</p>
                                <p className="text-[10px]">Date Filed: <strong>{new Date(ticket.createdAt).toLocaleString()}</strong></p>
                              </div>
                              <div>
                                <p className="font-bold text-neutral-450 uppercase text-[9px]">Affected Item Details</p>
                                {ticket.itemType === 'product' && ticket.product ? (
                                  <p className="mt-1 text-neutral-800 dark:text-neutral-250 font-bold flex items-center gap-1.5">
                                    <Package className="h-4 w-4 text-amber-500" />
                                    {ticket.product.name} (Category: {ticket.product.category})
                                  </p>
                                ) : ticket.itemType === 'listing' && ticket.listing ? (
                                  <p className="mt-1 text-neutral-800 dark:text-neutral-250 font-bold flex items-center gap-1.5">
                                    <Home className="h-4 w-4 text-orange-500" />
                                    {ticket.listing.title} ({ticket.listing.location})
                                  </p>
                                ) : (
                                  <p className="mt-1 italic text-neutral-400">Context item not specified</p>
                                )}
                              </div>
                            </div>

                            {}
                            <div className="border-t border-neutral-100 dark:border-neutral-850 pt-4 space-y-3">
                              <p className="text-[10px] text-neutral-450 font-extrabold uppercase flex items-center gap-1">
                                <MessageSquare className="h-3.5 w-3.5" />
                                Ticket Conversation ({ticket.comments.length})
                              </p>
                              <div className="space-y-2 max-h-[150px] overflow-y-auto pr-2">
                                {ticket.comments.length === 0 ? (
                                  <p className="text-[11px] italic text-neutral-400 pl-4 border-l border-neutral-200">No replies in this thread yet.</p>
                                ) : (
                                  ticket.comments.map((comment, index) => (
                                    <div key={index} className="text-[11px] pl-3 border-l border-indigo-400 dark:border-violet-500 space-y-0.5">
                                      <p className="text-[10px] text-neutral-400">
                                        <strong className="text-neutral-700 dark:text-neutral-200">{comment.name}</strong> · {new Date(comment.createdAt).toLocaleDateString()}
                                      </p>
                                      <p className="text-muted-foreground font-medium">"{comment.text}"</p>
                                    </div>
                                  ))
                                )}
                              </div>

                              <div className="flex gap-2 items-center mt-2">
                                <input
                                  type="text"
                                  placeholder="Write a message response to user..."
                                  value={newCommentText[ticket._id] || ""}
                                  onChange={(e) => setNewCommentText({ ...newCommentText, [ticket._id]: e.target.value })}
                                  onKeyDown={(e) => {
                                    if (e.key === "Enter") {
                                      e.preventDefault();
                                      handleAddTicketComment(ticket._id);
                                    }
                                  }}
                                  className="flex-1 py-1.5 px-3 border border-neutral-300 dark:border-neutral-800 bg-white dark:bg-neutral-950 text-foreground text-xs rounded-xl focus:border-indigo-500 focus:outline-none"
                                />
                                <button
                                  type="button"
                                  onClick={() => handleAddTicketComment(ticket._id)}
                                  className="px-3 py-1.5 bg-indigo-600 dark:bg-violet-600 hover:bg-indigo-500 hover:dark:bg-violet-500 text-white font-bold text-xs rounded-xl cursor-pointer transition-all border-none"
                                >
                                  Reply
                                </button>
                              </div>
                            </div>

                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {}
            {activeTab === "service_areas" && (
              <div className="bg-card border border-border/60 rounded-2xl p-6 space-y-6 animate-in fade-in duration-205">
                <div className="flex items-center justify-between">
                  <h2 className="text-base font-bold text-foreground flex items-center gap-2">
                    <MapPin className="h-4.5 w-4.5 text-orange-555" />
                    Platform Serviced Areas (Geographies)
                  </h2>
                  <button
                    onClick={handleOpenCreateServiceArea}
                    className="bg-primary hover:bg-primary/90 text-white font-bold text-xs py-2 px-4 rounded-xl flex items-center gap-1.5 transition-all cursor-pointer shadow-md shadow-indigo-500/10"
                  >
                    <Plus className="h-4 w-4" />
                    New Territory
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="border-b border-neutral-100 dark:border-neutral-800 text-neutral-400 font-bold uppercase tracking-wider">
                        <th className="py-3 px-4">Territory Name</th>
                        <th className="py-3 px-4">City</th>
                        <th className="py-3 px-4">State</th>
                        <th className="py-3 px-4">Postal Codes Covered</th>
                        <th className="py-3 px-4">Service Status</th>
                        <th className="py-3 px-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {serviceAreasList.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="py-10 text-center text-neutral-500 italic">No serviced areas configured on the platform yet.</td>
                        </tr>
                      ) : (
                        serviceAreasList.map((area) => (
                          <tr key={area._id} className="border-b border-neutral-50 dark:border-neutral-850 hover:bg-neutral-50/50 dark:hover:bg-neutral-950/40 transition-colors">
                            <td className="py-3.5 px-4 font-bold text-neutral-800 dark:text-white">{area.name}</td>
                            <td className="py-3.5 px-4 text-muted-foreground font-medium">{area.city}</td>
                            <td className="py-3.5 px-4 text-muted-foreground">{area.state}</td>
                            <td className="py-3.5 px-4 text-neutral-550 max-w-[200px] truncate" title={area.postalCodes.join(", ")}>
                              {area.postalCodes.join(", ")}
                            </td>
                            <td className="py-3.5 px-4">
                              <button
                                onClick={() => handleToggleServiceAreaStatus(area)}
                                className={`px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase border cursor-pointer transition-colors bg-transparent ${
                                  area.isActive
                                    ? "text-emerald-600 border-emerald-300 dark:text-emerald-450 dark:border-emerald-900"
                                    : "text-neutral-400 border-neutral-300 dark:text-neutral-550 dark:border-neutral-800"
                                }`}
                              >
                                {area.isActive ? "Active" : "Inactive"}
                              </button>
                            </td>
                            <td className="py-3.5 px-4 text-right space-x-1.5">
                              <button
                                onClick={() => handleOpenEditServiceArea(area)}
                                className="p-1.5 border border-border/60 hover:border-indigo-300 hover:text-indigo-600 dark:hover:hover:border-violet-650 dark:hover:text-violet-400 rounded-lg text-neutral-450 transition-colors cursor-pointer"
                                title="Edit Area"
                              >
                                <Edit2 className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => handleDeleteServiceArea(area._id)}
                                className="p-1.5 border border-border/60 hover:border-red-200 hover:text-red-500 rounded-lg text-neutral-450 transition-colors cursor-pointer"
                                title="Delete Area"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

          </div>
        )}

        {}
        {listingModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-950/60 backdrop-blur-sm">
            <div className="w-full max-w-lg bg-card border border-border/60 rounded-2xl overflow-hidden shadow-2xl relative animate-in fade-in zoom-in duration-150">

              <div className="px-6 py-4 border-b border-neutral-100 dark:border-neutral-850 flex items-center justify-between bg-neutral-50 dark:bg-neutral-950/50">
                <h3 className="font-extrabold text-foreground text-sm flex items-center gap-2">
                  <Sparkles className="h-4.5 w-4.5 text-red-505" />
                  {listingModalMode === "create" ? "Admin: Post New Listing" : "Admin: Update Listing"}
                </h3>
                <button
                  onClick={() => setListingModalOpen(false)}
                  className="text-neutral-400 hover:text-neutral-600 dark:hover:text-white p-1 rounded-full cursor-pointer"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <form onSubmit={handleListingSubmit} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
                {listingFormError && (
                  <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/40 rounded-xl p-3 flex items-start gap-2.5 text-xs text-red-650 dark:text-red-400">
                    <ShieldAlert className="h-4 w-4 shrink-0 mt-0.5" />
                    <span>{listingFormError}</span>
                  </div>
                )}

                {}
                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase font-extrabold text-neutral-450">Listing Title</label>
                  <input
                    type="text"
                    required
                    placeholder="Property title..."
                    value={listingForm.title}
                    onChange={(e) => setListingForm({ ...listingForm, title: e.target.value })}
                    className="w-full py-2 px-3.5 rounded-xl border border-neutral-300 dark:border-neutral-800 bg-card text-neutral-900 text-xs focus:border-indigo-500 focus:outline-none dark:text-white transition-colors"
                  />
                </div>

                {}
                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase font-extrabold text-neutral-450">Description</label>
                  <textarea
                    required
                    rows={3}
                    placeholder="Details about rooms, area features..."
                    value={listingForm.description}
                    onChange={(e) => setListingForm({ ...listingForm, description: e.target.value })}
                    className="w-full py-2 px-3.5 rounded-xl border border-neutral-300 dark:border-neutral-800 bg-card text-neutral-900 text-xs focus:border-indigo-500 focus:outline-none dark:text-white transition-colors resize-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {}
                  <div className="space-y-1.5">
                    <label className="text-[10px] uppercase font-extrabold text-neutral-450">Location</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Goa, India"
                      value={listingForm.location}
                      onChange={(e) => setListingForm({ ...listingForm, location: e.target.value })}
                      className="w-full py-2 px-3.5 rounded-xl border border-neutral-300 dark:border-neutral-800 bg-card text-neutral-900 text-xs focus:border-indigo-500 focus:outline-none dark:text-white transition-colors"
                    />
                  </div>

                  {}
                  <div className="space-y-1.5">
                    <label className="text-[10px] uppercase font-extrabold text-neutral-455">Rent Price (₹/Night)</label>
                    <input
                      type="number"
                      required
                      min={1}
                      placeholder="Rent fee"
                      value={listingForm.price}
                      onChange={(e) => setListingForm({ ...listingForm, price: Number(e.target.value) })}
                      className="w-full py-2 px-3.5 rounded-xl border border-neutral-300 dark:border-neutral-800 bg-card text-neutral-900 text-xs focus:border-indigo-500 focus:outline-none dark:text-white transition-colors"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {}
                  <div className="space-y-1.5">
                    <label className="text-[10px] uppercase font-extrabold text-neutral-455">Category</label>
                    <select
                      value={listingForm.category}
                      onChange={(e) => setListingForm({ ...listingForm, category: e.target.value })}
                      className="w-full py-2.5 px-3.5 rounded-xl border border-neutral-300 dark:border-neutral-800 bg-card text-neutral-900 text-xs focus:border-indigo-500 focus:outline-none dark:text-white transition-colors"
                    >
                      {CATEGORIES.map((c) => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>

                  {}
                  <div className="space-y-1.5">
                    <label className="text-[10px] uppercase font-extrabold text-neutral-455">Visual Gradient</label>
                    <select
                      value={listingForm.image}
                      onChange={(e) => setListingForm({ ...listingForm, image: e.target.value })}
                      className="w-full py-2.5 px-3.5 rounded-xl border border-neutral-300 dark:border-neutral-800 bg-card text-neutral-900 text-xs focus:border-indigo-500 focus:outline-none dark:text-white transition-colors"
                    >
                      {GRADIENTS.map((g) => (
                        <option key={g.value} value={g.value}>{g.label}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {}
                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase font-extrabold text-neutral-455">Assign Host Account</label>
                  <select
                    value={listingForm.vendor}
                    onChange={(e) => setListingForm({ ...listingForm, vendor: e.target.value })}
                    className="w-full py-2.5 px-3.5 rounded-xl border border-neutral-300 dark:border-neutral-800 bg-card text-neutral-900 text-xs focus:border-indigo-500 focus:outline-none dark:text-white transition-colors"
                  >
                    <option value={currentUser._id}>Self (Default Admin)</option>
                    {usersList.filter(u => u.role === "vendor").map((u) => (
                      <option key={u._id} value={u._id}>{u.name} (Vendor: {u.email})</option>
                    ))}
                  </select>
                </div>

                {}
                <div className="h-14 rounded-xl border border-border/60 overflow-hidden flex items-center justify-center text-white font-bold text-xs" style={{ background: listingForm.image }}>
                  {listingForm.title || "Preview title..."}
                </div>

                {}
                <div className="flex items-center justify-end gap-3 pt-4 border-t border-neutral-100 dark:border-neutral-850">
                  <button
                    type="button"
                    onClick={() => setListingModalOpen(false)}
                    className="px-4 py-2 border border-neutral-300 dark:border-neutral-800 text-neutral-700 dark:text-white text-xs font-semibold rounded-xl hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submittingListing}
                    className="bg-red-650 hover:bg-red-600 dark:bg-red-600 dark:hover:bg-red-500 text-white text-xs font-bold py-2 px-5 rounded-xl transition-all cursor-pointer shadow-md disabled:opacity-50"
                  >
                    {submittingListing ? "Saving..." : "Save Listing"}
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
                  <Sparkles className="h-4.5 w-4.5 text-red-505" />
                  {productModalMode === "create" ? "Admin: Post New Product" : "Admin: Update Product"}
                </h3>
                <button
                  onClick={() => setProductModalOpen(false)}
                  className="text-neutral-400 hover:text-neutral-600 dark:hover:text-white p-1 rounded-full cursor-pointer"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <form onSubmit={handleProductSubmit} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
                {productFormError && (
                  <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/40 rounded-xl p-3 flex items-start gap-2.5 text-xs text-red-650 dark:text-red-400">
                    <ShieldAlert className="h-4 w-4 shrink-0 mt-0.5" />
                    <span>{productFormError}</span>
                  </div>
                )}

                {}
                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase font-extrabold text-neutral-450">Product Name</label>
                  <input
                    type="text"
                    required
                    placeholder="Product name..."
                    value={productForm.name}
                    onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                    className="w-full py-2 px-3.5 rounded-xl border border-neutral-300 dark:border-neutral-800 bg-card text-neutral-900 text-xs focus:border-indigo-500 focus:outline-none dark:text-white transition-colors"
                  />
                </div>

                {}
                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase font-extrabold text-neutral-455">Description</label>
                  <textarea
                    required
                    rows={3}
                    placeholder="Product details, materials..."
                    value={productForm.description}
                    onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                    className="w-full py-2 px-3.5 rounded-xl border border-neutral-300 dark:border-neutral-800 bg-card text-neutral-900 text-xs focus:border-indigo-500 focus:outline-none dark:text-white transition-colors resize-none"
                  />
                </div>

                <div className="grid grid-cols-3 gap-3">
                  {}
                  <div className="space-y-1.5">
                    <label className="text-[10px] uppercase font-extrabold text-neutral-455">Rent (₹/Mo)</label>
                    <input
                      type="number"
                      required
                      min={1}
                      placeholder="Rent fee"
                      value={productForm.monthlyRent}
                      onChange={(e) => setProductForm({ ...productForm, monthlyRent: Number(e.target.value) })}
                      className="w-full py-2 px-3.5 rounded-xl border border-neutral-300 dark:border-neutral-800 bg-card text-neutral-900 text-xs focus:border-indigo-500 focus:outline-none dark:text-white transition-colors"
                    />
                  </div>

                  {}
                  <div className="space-y-1.5">
                    <label className="text-[10px] uppercase font-extrabold text-neutral-455">Deposit (₹)</label>
                    <input
                      type="number"
                      required
                      min={1}
                      placeholder="Deposit"
                      value={productForm.deposit}
                      onChange={(e) => setProductForm({ ...productForm, deposit: Number(e.target.value) })}
                      className="w-full py-2 px-3.5 rounded-xl border border-neutral-300 dark:border-neutral-800 bg-card text-neutral-900 text-xs focus:border-indigo-500 focus:outline-none dark:text-white transition-colors"
                    />
                  </div>

                  {}
                  <div className="space-y-1.5">
                    <label className="text-[10px] uppercase font-extrabold text-neutral-455">Available Qty</label>
                    <input
                      type="number"
                      required
                      min={0}
                      placeholder="Units in stock"
                      value={productForm.availableQuantity}
                      onChange={(e) => setProductForm({ ...productForm, availableQuantity: Number(e.target.value) })}
                      className="w-full py-2 px-3.5 rounded-xl border border-neutral-300 dark:border-neutral-800 bg-card text-neutral-900 text-xs focus:border-indigo-500 focus:outline-none dark:text-white transition-colors"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {}
                  <div className="space-y-1.5">
                    <label className="text-[10px] uppercase font-extrabold text-neutral-455">Category</label>
                    <select
                      value={productForm.category}
                      onChange={(e) => setProductForm({ ...productForm, category: e.target.value })}
                      className="w-full py-2.5 px-3.5 rounded-xl border border-neutral-300 dark:border-neutral-800 bg-card text-neutral-900 text-xs focus:border-indigo-500 focus:outline-none dark:text-white transition-colors"
                    >
                      {PRODUCT_CATEGORIES.map((c) => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>

                  {}
                  <div className="space-y-1.5">
                    <label className="text-[10px] uppercase font-extrabold text-neutral-455">Visual theme</label>
                    <select
                      value={productForm.image}
                      onChange={(e) => setProductForm({ ...productForm, image: e.target.value })}
                      className="w-full py-2.5 px-3.5 rounded-xl border border-neutral-300 dark:border-neutral-800 bg-card text-neutral-900 text-xs focus:border-indigo-500 focus:outline-none dark:text-white transition-colors"
                    >
                      {GRADIENTS.map((g) => (
                        <option key={g.value} value={g.value}>{g.label}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {}
                <div className="space-y-2">
                  <label className="text-[10px] uppercase font-extrabold text-neutral-455 block">Rental Tenure Options (months)</label>
                  <div className="flex flex-wrap gap-2 min-h-[32px]">
                    {productForm.tenureOptions.length === 0 && (
                      <span className="text-[10px] text-neutral-400 italic">No tenures added yet</span>
                    )}
                    {productForm.tenureOptions.map((months) => (
                      <span
                        key={months}
                        className="inline-flex items-center gap-1.5 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-violet-300 border border-indigo-100 dark:border-violet-900 text-xs font-bold px-2.5 py-1 rounded-lg"
                      >
                        {months} mo
                        <button
                          type="button"
                          onClick={() => handleAdminTenureToggle(months)}
                          className="text-indigo-400 hover:text-red-505 dark:hover:text-red-400 transition-colors cursor-pointer leading-none"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-[10px] text-neutral-400 font-bold uppercase">Quick add:</span>
                    {[1, 2, 3, 6, 9, 12, 18, 24, 36].filter(m => !productForm.tenureOptions.includes(m)).map((months) => (
                      <button
                        key={months}
                        type="button"
                        onClick={() => handleAdminTenureToggle(months)}
                        className="text-[10px] font-bold px-2 py-1 rounded-lg bg-neutral-100 dark:bg-neutral-800 text-muted-foreground hover:bg-indigo-50 dark:hover:bg-indigo-950/30 hover:text-indigo-650 dark:hover:text-violet-400 border border-neutral-200 dark:border-neutral-700 transition-colors cursor-pointer"
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
                        id="customTenureAdmin"
                        className="w-20 text-xs bg-neutral-50 dark:bg-neutral-955 border border-neutral-300 dark:border-neutral-700 rounded-lg px-2 py-1 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:text-white"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            const val = parseInt((e.target as HTMLInputElement).value);
                            if (val >= 1 && val <= 120) {
                              handleAdminTenureToggle(val);
                              (e.target as HTMLInputElement).value = '';
                            }
                          }
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => {
                          const input = document.getElementById('customTenureAdmin') as HTMLInputElement;
                          const val = parseInt(input.value);
                          if (val >= 1 && val <= 120) {
                            handleAdminTenureToggle(val);
                            input.value = '';
                          }
                        }}
                        className="text-[10px] font-bold px-2 py-1 rounded-lg bg-primary hover:bg-primary/90 text-white cursor-pointer transition-colors"
                      >
                        Add
                      </button>
                    </div>
                  </div>
                </div>

                {}
                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase font-extrabold text-neutral-455">Assign Host Account</label>
                  <select
                    value={productForm.vendor}
                    onChange={(e) => setProductForm({ ...productForm, vendor: e.target.value })}
                    className="w-full py-2.5 px-3.5 rounded-xl border border-neutral-300 dark:border-neutral-800 bg-card text-neutral-900 text-xs focus:border-indigo-500 focus:outline-none dark:text-white transition-colors"
                  >
                    <option value={currentUser._id}>Self (Default Admin)</option>
                    {usersList.filter(u => u.role === "vendor").map((u) => (
                      <option key={u._id} value={u._id}>{u.name} (Vendor: {u.email})</option>
                    ))}
                  </select>
                </div>

                {}
                <div className="h-14 rounded-xl border border-border/60 overflow-hidden flex items-center justify-center text-white font-bold text-xs" style={{ background: productForm.image }}>
                  {productForm.name || "Preview title..."}
                </div>

                {}
                <div className="flex items-center justify-end gap-3 pt-4 border-t border-neutral-100 dark:border-neutral-850">
                  <button
                    type="button"
                    onClick={() => setProductModalOpen(false)}
                    className="px-4 py-2 border border-neutral-300 dark:border-neutral-800 text-neutral-700 dark:text-white text-xs font-semibold rounded-xl hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submittingProduct}
                    className="bg-red-600 hover:bg-red-500 dark:bg-red-650 dark:hover:bg-red-600 text-white text-xs font-bold py-2 px-5 rounded-xl transition-all cursor-pointer shadow-md disabled:opacity-50"
                  >
                    {submittingProduct ? "Saving..." : "Save Product"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {}
        {serviceAreaModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-950/60 backdrop-blur-sm">
            <div className="w-full max-w-md bg-card border border-border/60 rounded-2xl overflow-hidden shadow-2xl relative animate-in fade-in zoom-in duration-150">

              <div className="px-6 py-4 border-b border-neutral-100 dark:border-neutral-850 flex items-center justify-between bg-neutral-50 dark:bg-neutral-950/50">
                <h3 className="font-extrabold text-foreground text-sm flex items-center gap-2">
                  <MapPin className="h-4.5 w-4.5 text-orange-555" />
                  {serviceAreaModalMode === "create" ? "Configure Serviced Territory" : "Update Territory Details"}
                </h3>
                <button
                  onClick={() => setServiceAreaModalOpen(false)}
                  className="text-neutral-400 hover:text-neutral-600 dark:hover:text-white p-1 rounded-full cursor-pointer"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <form onSubmit={handleServiceAreaSubmit} className="p-6 space-y-4">
                {serviceAreaFormError && (
                  <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/40 rounded-xl p-3 flex items-start gap-2.5 text-xs text-red-655 dark:text-red-400">
                    <ShieldAlert className="h-4 w-4 shrink-0 mt-0.5" />
                    <span>{serviceAreaFormError}</span>
                  </div>
                )}

                {}
                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase font-extrabold text-neutral-450">Territory Name (e.g. Mumbai South)</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. South Delhi"
                    value={serviceAreaForm.name}
                    onChange={(e) => setServiceAreaForm({ ...serviceAreaForm, name: e.target.value })}
                    className="w-full py-2 px-3.5 rounded-xl border border-neutral-300 dark:border-neutral-800 bg-card text-neutral-900 text-xs focus:border-indigo-500 focus:outline-none dark:text-white transition-colors"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {}
                  <div className="space-y-1.5">
                    <label className="text-[10px] uppercase font-extrabold text-neutral-455">City</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Delhi"
                      value={serviceAreaForm.city}
                      onChange={(e) => setServiceAreaForm({ ...serviceAreaForm, city: e.target.value })}
                      className="w-full py-2 px-3.5 rounded-xl border border-neutral-300 dark:border-neutral-800 bg-card text-neutral-900 text-xs focus:border-indigo-500 focus:outline-none dark:text-white transition-colors"
                    />
                  </div>

                  {}
                  <div className="space-y-1.5">
                    <label className="text-[10px] uppercase font-extrabold text-neutral-455">State</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Delhi NCR"
                      value={serviceAreaForm.state}
                      onChange={(e) => setServiceAreaForm({ ...serviceAreaForm, state: e.target.value })}
                      className="w-full py-2 px-3.5 rounded-xl border border-neutral-300 dark:border-neutral-800 bg-card text-neutral-900 text-xs focus:border-indigo-500 focus:outline-none dark:text-white transition-colors"
                    />
                  </div>
                </div>

                {}
                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase font-extrabold text-neutral-450 block">Postal Codes Covered (comma separated)</label>
                  <textarea
                    required
                    rows={2}
                    placeholder="e.g. 110001, 110002, 110011"
                    value={serviceAreaForm.postalCodes}
                    onChange={(e) => setServiceAreaForm({ ...serviceAreaForm, postalCodes: e.target.value })}
                    className="w-full py-2 px-3.5 rounded-xl border border-neutral-300 dark:border-neutral-800 bg-card text-neutral-900 text-xs focus:border-indigo-500 focus:outline-none dark:text-white transition-colors resize-none"
                  />
                  <p className="text-[10px] text-neutral-400">Specify postal zip codes this delivery network covers.</p>
                </div>

                {}
                <div className="flex items-center gap-2 pt-2">
                  <input
                    type="checkbox"
                    id="serviceAreaActive"
                    checked={serviceAreaForm.isActive}
                    onChange={(e) => setServiceAreaForm({ ...serviceAreaForm, isActive: e.target.checked })}
                    className="rounded border-neutral-300 text-indigo-600 focus:ring-indigo-500 h-4 w-4"
                  />
                  <label htmlFor="serviceAreaActive" className="text-xs font-bold text-muted-foreground cursor-pointer">
                    Enable service delivery inside this territory immediately
                  </label>
                </div>

                {}
                <div className="flex items-center justify-end gap-3 pt-4 border-t border-neutral-100 dark:border-neutral-850">
                  <button
                    type="button"
                    onClick={() => setServiceAreaModalOpen(false)}
                    className="px-4 py-2 border border-neutral-300 dark:border-neutral-800 text-neutral-700 dark:text-white text-xs font-semibold rounded-xl hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submittingServiceArea}
                    className="bg-indigo-600 hover:bg-indigo-500 dark:bg-violet-650 dark:hover:bg-violet-550 text-white text-xs font-bold py-2 px-5 rounded-xl transition-all cursor-pointer shadow-md disabled:opacity-50 border-none"
                  >
                    {submittingServiceArea ? "Saving..." : "Save Territory"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
