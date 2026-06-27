"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import {
  ArrowLeft,
  Calendar,
  ShoppingBag,
  Hourglass,
  Clock,
  ChevronRight,
  Sparkles,
  ShieldCheck,
  AlertCircle,
  MapPin,
  Truck,
  Info,
  CheckCircle,
  History,
  X,
  ShieldAlert,
  FileText
} from "lucide-react";

interface Product {
  _id: string;
  name: string;
  category: string;
  monthlyRent: number;
  deposit: number;
  images: string[];
}

interface ExtensionRecord {
  extendedByMonths: number;
  previousEndDate: string;
  newEndDate: string;
  extraPaidAmount: number;
  createdAt: string;
  _id: string;
}

interface RentalItem {
  _id: string;
  product?: Product;
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
  extensionHistory?: ExtensionRecord[];
}

interface DeliveryItem {
  _id: string;
  rental: string | { _id: string };
  deliveryDate: string;
  deliveryAddress: string;
  deliveryStatus: 'Scheduled' | 'Assigned' | 'Delivered';
  assignedTo?: string;
  trackingNotes?: string;
}

interface PickupItem {
  _id: string;
  rental: {
    _id: string;
    product?: Product;
  } | null;
  pickupDate: string;
  pickupAddress: string;
  pickupStatus: 'Requested' | 'Scheduled' | 'Picked Up' | 'Completed';
  assignedTo?: string;
  trackingNotes?: string;
  createdAt: string;
}

interface ClaimItem {
  _id: string;
  rental: {
    _id: string;
    product?: Product;
  } | null;
  reportedBy: {
    name: string;
    email: string;
    phone?: string;
  };
  description: string;
  severity: 'Low' | 'Medium' | 'High';
  deductedAmount: number;
  penaltyAmount: number;
  status: 'Pending' | 'Approved' | 'Rejected' | 'Settled';
  inspectionNotes?: string;
  createdAt: string;
}

export default function ActiveRentalsPage() {
  const router = useRouter();
  const [rentals, setRentals] = React.useState<RentalItem[]>([]);
  const [deliveries, setDeliveries] = React.useState<DeliveryItem[]>([]);
  const [pickups, setPickups] = React.useState<PickupItem[]>([]);
  const [claims, setClaims] = React.useState<ClaimItem[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);


  const [activeSubTab, setActiveSubTab] = React.useState<"rentals" | "pickups" | "claims">("rentals");


  const [selectedRental, setSelectedRental] = React.useState<RentalItem | null>(null);
  const [extensionMonths, setExtensionMonths] = React.useState<number>(3);
  const [extending, setExtending] = React.useState(false);
  const [extendError, setExtendError] = React.useState<string | null>(null);
  const [extendSuccess, setExtendSuccess] = React.useState(false);


  const [requestPickupRental, setRequestPickupRental] = React.useState<RentalItem | null>(null);
  const [pickupDate, setPickupDate] = React.useState<string>("");
  const [pickupAddress, setPickupAddress] = React.useState<string>("");
  const [requestingPickup, setRequestingPickup] = React.useState(false);
  const [requestPickupError, setRequestPickupError] = React.useState<string | null>(null);
  const [requestPickupSuccess, setRequestPickupSuccess] = React.useState(false);


  const [viewHistoryRental, setViewHistoryRental] = React.useState<RentalItem | null>(null);

  const fetchData = React.useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem("rentease_token");
      if (!token) {
        router.push("/login");
        return;
      }


      const [rentalsRes, deliveriesRes, pickupsRes, claimsRes] = await Promise.all([
        api.get<{ success: boolean; data: RentalItem[] }>("/rentals/my-rentals"),
        api.get<{ success: boolean; data: DeliveryItem[] }>("/deliveries/my-deliveries"),
        api.get<{ success: boolean; data: PickupItem[] }>("/pickups/my-pickups"),
        api.get<{ success: boolean; data: ClaimItem[] }>("/damage-claims/my-claims")
      ]);

      if (rentalsRes.success) {
        setRentals(rentalsRes.data || []);
      }
      if (deliveriesRes.success) {
        setDeliveries(deliveriesRes.data || []);
      }
      if (pickupsRes.success) {
        setPickups(pickupsRes.data || []);
      }
      if (claimsRes.success) {
        setClaims(claimsRes.data || []);
      }
    } catch (err) {
      console.error(err);
      setError("Failed to retrieve lease dashboard metrics. Please reload.");
    } finally {
      setLoading(false);
    }
  }, [router]);

  React.useEffect(() => {
    fetchData();
  }, [fetchData]);


  const getDaysRemaining = (endDateStr: string) => {
    const end = new Date(endDateStr);
    const today = new Date();
    end.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);
    const diffTime = end.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };


  const getDeliveryForRental = (rentalId: string) => {
    return deliveries.find(d => {
      const id = typeof d.rental === "object" ? d.rental._id : d.rental;
      return id === rentalId;
    });
  };


  const openExtendModal = (rental: RentalItem) => {
    setSelectedRental(rental);
    setExtensionMonths(3);
    setExtendError(null);
    setExtendSuccess(false);
  };


  const openPickupRequestModal = (rental: RentalItem) => {
    setRequestPickupRental(rental);
    setPickupDate("");
    setPickupAddress(rental.deliveryAddress || "");
    setRequestPickupError(null);
    setRequestPickupSuccess(false);
  };


  const handleExtendLeaseSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRental) return;
    setExtendError(null);
    setExtending(true);

    try {
      const res = await api.post<{ success: boolean; data: RentalItem }>(
        `/rentals/${selectedRental._id}/extend`,
        { extendedByMonths: extensionMonths }
      );

      if (res.success) {
        setExtendSuccess(true);
        fetchData();
        setTimeout(() => {
          setSelectedRental(null);
          setExtendSuccess(false);
        }, 1800);
      } else {
        setExtendError("Extension request denied. Please check your lease conditions.");
      }
    } catch (err) {
      setExtendError(err instanceof Error ? err.message : "Lease extension failed.");
    } finally {
      setExtending(false);
    }
  };


  const handlePickupRequestSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!requestPickupRental) return;
    if (!pickupDate || !pickupAddress.trim()) {
      setRequestPickupError("Please select a date and enter an address.");
      return;
    }
    setRequestPickupError(null);
    setRequestingPickup(true);

    try {
      const res = await api.post<{ success: boolean; data: PickupItem }>(
        `/pickups`,
        {
          rental: requestPickupRental._id,
          pickupDate,
          pickupAddress,
        }
      );

      if (res.success) {
        setRequestPickupSuccess(true);
        fetchData();
        setTimeout(() => {
          setRequestPickupRental(null);
          setRequestPickupSuccess(false);
        }, 1800);
      } else {
        setRequestPickupError("Failed to file return request. Try again.");
      }
    } catch (err) {
      setRequestPickupError(err instanceof Error ? err.message : "Failed to file request.");
    } finally {
      setRequestingPickup(false);
    }
  };

  const getPreviewExtendedDate = (currentEndStr: string, months: number) => {
    const date = new Date(currentEndStr);
    date.setMonth(date.getMonth() + months);
    return date.toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' });
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

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950 flex flex-col justify-center items-center">
        <div className="h-10 w-10 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-xs text-neutral-500 font-semibold tracking-wider uppercase animate-pulse">Loading Lease Dashboard...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50/50 dark:bg-neutral-950/20 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-8">

        {}
        <div className="flex items-center justify-between">
          <Link href="/dashboard" className="inline-flex items-center gap-1.5 text-xs text-neutral-450 hover:text-indigo-650 dark:hover:text-violet-400 font-bold transition-colors">
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard Home
          </Link>
          <div className="inline-flex items-center space-x-2 rounded-full border border-indigo-150 dark:border-neutral-850 bg-card px-3 py-1 text-xs text-indigo-650 dark:text-violet-400 backdrop-blur-sm shadow-sm font-semibold">
            <Hourglass className="h-3.5 w-3.5" />
            <span>Active Subscriptions & Returns</span>
          </div>
        </div>

        {}
        <div className="space-y-2">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight flex items-center gap-2">
            <ShoppingBag className="h-7 w-7 text-indigo-500" />
            My Active Product Rentals
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground max-w-2xl">
            Monitor lease periods, track delivery agents, schedule returns, and view damage claims.
          </p>
        </div>

        {error && (
          <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/40 rounded-2xl p-4 flex items-start gap-2.5 text-xs text-red-650 dark:text-red-400 max-w-lg mx-auto">
            <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {}
        <div className="flex border-b border-neutral-250 dark:border-neutral-850 gap-6">
          <button
            onClick={() => setActiveSubTab("rentals")}
            className={`pb-3.5 text-xs font-bold transition-all relative cursor-pointer ${
              activeSubTab === "rentals"
                ? "text-primary after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-indigo-600 dark:after:bg-violet-400"
                : "text-neutral-500 hover:text-neutral-700 dark:hover:text-white"
            }`}
          >
            Lease Catalog Items ({rentals.length})
          </button>
          <button
            onClick={() => setActiveSubTab("pickups")}
            className={`pb-3.5 text-xs font-bold transition-all relative cursor-pointer ${
              activeSubTab === "pickups"
                ? "text-primary after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-indigo-600 dark:after:bg-violet-400"
                : "text-neutral-500 hover:text-neutral-700 dark:hover:text-white"
            }`}
          >
            Return Pickups ({pickups.length})
          </button>
          <button
            onClick={() => setActiveSubTab("claims")}
            className={`pb-3.5 text-xs font-bold transition-all relative cursor-pointer ${
              activeSubTab === "claims"
                ? "text-primary after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-indigo-600 dark:after:bg-violet-400"
                : "text-neutral-500 hover:text-neutral-700 dark:hover:text-white"
            }`}
          >
            Damage Claims ({claims.length})
          </button>
        </div>

        {}
        {activeSubTab === "rentals" && (
          <div>
            {rentals.length === 0 ? (
              <div className="bg-card border border-border/60 rounded-3xl py-20 text-center max-w-xl mx-auto space-y-4 shadow-sm animate-in fade-in duration-300">
                <ShoppingBag className="h-16 w-16 mx-auto text-neutral-350 dark:text-neutral-750" />
                <h3 className="text-lg font-bold text-foreground">No rental leases found</h3>
                <p className="text-xs text-muted-foreground max-w-xs mx-auto">
                  You haven't ordered any physical product rentals. Browse catalog to start a subscription.
                </p>
                <Link
                  href="/products"
                  className="inline-block bg-indigo-600 hover:bg-indigo-500 dark:bg-violet-650 dark:hover:bg-violet-600 text-white font-bold text-xs py-2.5 px-6 rounded-xl cursor-pointer shadow-md"
                >
                  Explore Products
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {rentals.map((rental) => {
                  const delivery = getDeliveryForRental(rental._id);
                  const daysRemaining = getDaysRemaining(rental.endDate);
                  const isExtendable = rental.status === 'Active';
                  const isReturnable = rental.status === 'Active' || rental.status === 'Delivered';

                  const getStatusText = (status: string) => {
                    switch (status) {
                      case 'Active': return 'Active Lease';
                      case 'Pending': return 'Awaiting Approval';
                      case 'Approved': return 'Approved (Preparing)';
                      case 'Delivered': return 'Dispatched';
                      case 'Returned': return 'Returned & Closed';
                      case 'Cancelled': return 'Cancelled';
                      default: return status;
                    }
                  };

                  const getStatusBadgeClass = (status: string) => {
                    switch (status) {
                      case 'Active': return 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 border border-emerald-200/40';
                      case 'Pending': return 'bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-400 border border-amber-200/40';
                      case 'Approved': return 'bg-blue-50 dark:bg-blue-950/30 text-blue-700 dark:text-blue-400 border border-blue-200/40';
                      case 'Delivered': return 'bg-indigo-50 dark:bg-indigo-950/30 text-indigo-750 dark:text-indigo-300 border border-indigo-200/40';
                      case 'Returned': return 'bg-neutral-100 dark:bg-neutral-800 text-muted-foreground border border-neutral-700/50';
                      case 'Cancelled': return 'bg-red-50 dark:bg-red-950/30 text-red-750 dark:text-red-400 border border-red-200/40';
                      default: return 'bg-neutral-50 dark:bg-neutral-800 text-neutral-650';
                    }
                  };

                  return (
                    <div
                      key={rental._id}
                      className="bg-card border border-border/60 rounded-3xl p-6 shadow-sm flex flex-col justify-between space-y-6 hover:shadow-md transition-all group"
                    >
                      {/* Top: Product Info & Badge */}
                      <div className="flex gap-4">
                        <div className="w-20 h-20 rounded-2xl bg-neutral-100 dark:bg-neutral-950 shrink-0 overflow-hidden" style={getCoverStyle(rental.product?.images?.[0] || "")} />
                        <div className="flex-grow min-w-0 space-y-1">
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-[10px] font-bold text-neutral-450 uppercase tracking-wider">{rental.product?.category}</span>
                            <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${getStatusBadgeClass(rental.status)}`}>
                              {getStatusText(rental.status)}
                            </span>
                          </div>
                          <h3 className="text-sm font-bold text-foreground truncate" title={rental.product?.name}>
                            {rental.product?.name || "Leased Product"}
                          </h3>
                          <p className="text-[11px] text-neutral-500 font-medium">Qty: {rental.quantity} · Tenure: {rental.tenure} Months</p>
                        </div>
                      </div>

                      {/* Mid: Dates & Days Remaining Card */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 bg-neutral-50 dark:bg-neutral-950 rounded-2xl border border-neutral-150 dark:border-neutral-850 text-xs">
                        <div className="space-y-3">
                          <div className="space-y-0.5">
                            <span className="block text-[10px] uppercase font-bold text-neutral-400">Lease Period</span>
                            <span className="font-semibold text-neutral-800 dark:text-neutral-200">
                              {new Date(rental.startDate).toLocaleDateString()} to {new Date(rental.endDate).toLocaleDateString()}
                            </span>
                          </div>
                          <div className="space-y-0.5">
                            <span className="block text-[10px] uppercase font-bold text-neutral-400">Financial Breakdown</span>
                            <span className="font-semibold text-neutral-850 dark:text-neutral-200">
                              ₹{rental.monthlyRent.toLocaleString("en-IN")}/mo + ₹{rental.deposit.toLocaleString("en-IN")} deposit
                            </span>
                          </div>
                        </div>

                        <div className="flex flex-col justify-center items-center border-t sm:border-t-0 sm:border-l border-border/60 pt-3 sm:pt-0 sm:pl-4">
                          {rental.status === 'Active' ? (
                            <>
                              <div className="text-center">
                                {daysRemaining > 0 ? (
                                  <>
                                    <span className="text-xl font-extrabold text-indigo-650 dark:text-violet-400 flex items-center justify-center gap-1">
                                      <Clock className="h-5 w-5 shrink-0" />
                                      {daysRemaining}
                                    </span>
                                    <span className="block text-[10px] uppercase font-extrabold text-neutral-400 tracking-wider">Days Remaining</span>
                                  </>
                                ) : (
                                  <>
                                    <span className="text-sm font-extrabold text-red-500 uppercase">Expired</span>
                                    <span className="block text-[10px] text-neutral-400 mt-0.5 font-medium">Lease cycle finished</span>
                                  </>
                                )}
                              </div>
                            </>
                          ) : (
                            <div className="text-center space-y-1">
                              <span className="block text-[9px] uppercase font-extrabold text-neutral-400">Scheduled Handover</span>
                              <span className="font-bold text-neutral-800 dark:text-neutral-200">
                                {new Date(rental.deliveryDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                              </span>
                              <span className="block text-[9px] text-primary font-semibold uppercase">{rental.status === 'Returned' ? 'Returned' : 'Pending Delivery'}</span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Delivery Tracking Section */}
                      {delivery && rental.status !== 'Returned' && (
                        <div className="border-t border-border/60 pt-4 text-xs space-y-2.5">
                          <h4 className="font-extrabold uppercase text-[10px] text-neutral-450 tracking-wider flex items-center gap-1.5">
                            <Truck className="h-3.5 w-3.5 text-indigo-500" />
                            Fulfillment & Tracking Log
                          </h4>

                          <div className="grid grid-cols-2 gap-4 bg-indigo-50/20 dark:bg-indigo-950/10 border border-indigo-100/30 dark:border-indigo-900/30 p-3 rounded-xl">
                            <div className="space-y-0.5">
                              <span className="block text-[9px] text-neutral-450 font-bold uppercase">Delivery Status</span>
                              <span className="font-bold text-neutral-800 dark:text-neutral-200 text-[11px]">{delivery.deliveryStatus}</span>
                            </div>
                            <div className="space-y-0.5">
                              <span className="block text-[9px] text-neutral-455 font-bold uppercase">Carrier Assigned</span>
                              <span className="font-bold text-neutral-800 dark:text-neutral-200 text-[11px]">{delivery.assignedTo || "Unassigned"}</span>
                            </div>
                            <div className="col-span-2 space-y-0.5 border-t border-indigo-100/30 dark:border-indigo-950/50 pt-1.5 mt-0.5">
                              <span className="block text-[9px] text-neutral-455 font-bold uppercase">Status Update Notes</span>
                              <p className="text-muted-foreground italic text-[11px] font-medium leading-tight">
                                "{delivery.trackingNotes || "Package is being prepared for logistics."}"
                              </p>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Bottom: Action Buttons */}
                      <div className="border-t border-border/60 pt-4 flex gap-2">
                        <button
                          onClick={() => openExtendModal(rental)}
                          disabled={!isExtendable}
                          className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-500 dark:bg-violet-650 dark:hover:bg-violet-600 disabled:bg-neutral-100 dark:disabled:bg-neutral-800 disabled:text-neutral-400 disabled:cursor-not-allowed text-white font-extrabold text-[11px] rounded-xl shadow-md cursor-pointer transition-all text-center flex items-center justify-center gap-1"
                        >
                          <Sparkles className="h-3.5 w-3.5" />
                          Extend Lease
                        </button>

                        <button
                          onClick={() => openPickupRequestModal(rental)}
                          disabled={!isReturnable}
                          className="flex-1 py-2.5 border border-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-950/20 disabled:border-neutral-200 dark:disabled:border-neutral-800 disabled:text-neutral-400 disabled:cursor-not-allowed text-primary font-extrabold text-[11px] rounded-xl cursor-pointer transition-all text-center flex items-center justify-center gap-1"
                        >
                          <ArrowLeft className="h-3.5 w-3.5" />
                          Return & Pickup
                        </button>

                        {rental.extensionHistory && rental.extensionHistory.length > 0 && (
                          <button
                            onClick={() => setViewHistoryRental(rental)}
                            className="py-2.5 px-3 border border-neutral-300 dark:border-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-800 text-neutral-750 dark:text-neutral-300 font-bold text-[11px] rounded-xl cursor-pointer transition-all flex items-center justify-center gap-1"
                            title="View Extension History Logs"
                          >
                            <History className="h-4 w-4" />
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

        {/* Tab 2: Pickups List */}
        {activeSubTab === "pickups" && (
          <div className="space-y-6">
            {pickups.length === 0 ? (
              <div className="bg-card border border-border/60 rounded-3xl py-20 text-center max-w-xl mx-auto space-y-4 shadow-sm animate-in fade-in duration-300">
                <Truck className="h-16 w-16 mx-auto text-neutral-350 dark:text-neutral-750" />
                <h3 className="text-lg font-bold text-foreground">No return requests found</h3>
                <p className="text-xs text-muted-foreground max-w-xs mx-auto">
                  You haven't requested any returns. Select active items from the lease catalog and request return pickups.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {pickups.map((pickup) => {
                  const getStatusText = (status: string) => {
                    switch (status) {
                      case 'Requested': return 'Requested';
                      case 'Scheduled': return 'Scheduled';
                      case 'Picked Up': return 'In Transit (Picked Up)';
                      case 'Completed': return 'Returned & Closed';
                      default: return status;
                    }
                  };

                  const getStatusBadgeClass = (status: string) => {
                    switch (status) {
                      case 'Requested': return 'bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-400 border border-amber-200/40';
                      case 'Scheduled': return 'bg-blue-50 dark:bg-blue-950/30 text-blue-700 dark:text-blue-400 border border-blue-200/40';
                      case 'Picked Up': return 'bg-indigo-50 dark:bg-indigo-950/30 text-indigo-750 dark:text-indigo-300 border border-indigo-200/40';
                      case 'Completed': return 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 border border-emerald-200/40';
                      default: return 'bg-neutral-50 dark:bg-neutral-800 text-neutral-650';
                    }
                  };

                  return (
                    <div
                      key={pickup._id}
                      className="bg-card border border-border/60 rounded-3xl p-6 shadow-sm flex flex-col justify-between space-y-4 group hover:shadow-md transition-all"
                    >
                      {}
                      <div className="flex gap-4">
                        <div className="w-16 h-16 rounded-xl bg-neutral-100 dark:bg-neutral-950 shrink-0 overflow-hidden" style={getCoverStyle(pickup.rental?.product?.images?.[0] || "")} />
                        <div className="flex-grow min-w-0 space-y-1">
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-[10px] font-bold text-neutral-450 uppercase tracking-wider">{pickup.rental?.product?.category || "Return"}</span>
                            <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-bold ${getStatusBadgeClass(pickup.pickupStatus)}`}>
                              {getStatusText(pickup.pickupStatus)}
                            </span>
                          </div>
                          <h3 className="text-sm font-bold text-foreground truncate" title={pickup.rental?.product?.name}>
                            {pickup.rental?.product?.name || "Return Handover"}
                          </h3>
                          <p className="text-[10px] text-neutral-500 font-medium">Pickup Date: {new Date(pickup.pickupDate).toLocaleDateString()}</p>
                        </div>
                      </div>

                      {}
                      <div className="p-3 bg-neutral-50 dark:bg-neutral-950 border border-neutral-150 dark:border-neutral-850 rounded-xl space-y-2 text-xs">
                        <div>
                          <span className="block text-[9px] text-neutral-400 uppercase font-bold">Pickup Address</span>
                          <span className="font-semibold text-neutral-800 dark:text-neutral-200 leading-tight">{pickup.pickupAddress}</span>
                        </div>
                        <div className="grid grid-cols-2 gap-2 border-t border-border/60 pt-2">
                          <div>
                            <span className="block text-[9px] text-neutral-400 uppercase font-bold">Carrier Assigned</span>
                            <span className="font-semibold text-muted-foreground">{pickup.assignedTo || "Awaiting Logistics"}</span>
                          </div>
                          <div>
                            <span className="block text-[9px] text-neutral-400 uppercase font-bold">Created On</span>
                            <span className="font-semibold text-neutral-750 dark:text-neutral-300">{new Date(pickup.createdAt).toLocaleDateString()}</span>
                          </div>
                        </div>
                      </div>

                      {}
                      <div className="bg-indigo-50/20 dark:bg-indigo-950/10 border border-indigo-100/20 dark:border-indigo-900/20 p-3 rounded-xl text-xs">
                        <span className="block text-[9px] text-neutral-450 uppercase font-extrabold mb-1">Log Update Notes</span>
                        <p className="text-neutral-600 dark:text-neutral-450 italic leading-tight">
                          "{pickup.trackingNotes || "Your return request was submitted. Waiting for vendor scheduling."}"
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {}
        {activeSubTab === "claims" && (
          <div className="space-y-6">
            {claims.length === 0 ? (
              <div className="bg-card border border-border/60 rounded-3xl py-20 text-center max-w-xl mx-auto space-y-4 shadow-sm animate-in fade-in duration-300">
                <FileText className="h-16 w-16 mx-auto text-neutral-350 dark:text-neutral-750" />
                <h3 className="text-lg font-bold text-foreground">No damage claims reported</h3>
                <p className="text-xs text-neutral-505 dark:text-neutral-400 max-w-xs mx-auto">
                  Excellent! You do not have any registered physical damage claims or deposit deductions on your leases.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {claims.map((claim) => {
                  const getStatusBadgeClass = (status: string) => {
                    switch (status) {
                      case 'Pending': return 'bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-400 border border-amber-200/40';
                      case 'Approved': return 'bg-blue-50 dark:bg-blue-950/30 text-blue-700 dark:text-blue-400 border border-blue-200/40';
                      case 'Rejected': return 'bg-red-50 dark:bg-red-950/30 text-red-750 dark:text-red-400 border border-red-200/40';
                      case 'Settled': return 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 border border-emerald-200/40';
                      default: return 'bg-neutral-50 dark:bg-neutral-800 text-neutral-650';
                    }
                  };

                  const getSeverityBadgeClass = (sev: string) => {
                    switch (sev) {
                      case 'Low': return 'bg-neutral-100 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300';
                      case 'Medium': return 'bg-orange-50 text-orange-755 dark:bg-orange-950/20 dark:text-orange-400';
                      case 'High': return 'bg-red-55/10 text-red-655 dark:bg-red-950/30 dark:text-red-400';
                      default: return '';
                    }
                  };

                  return (
                    <div
                      key={claim._id}
                      className="bg-card border border-border/60 rounded-3xl p-6 shadow-sm flex flex-col justify-between space-y-4 group hover:shadow-md transition-all border-l-4 border-l-red-500"
                    >
                      {}
                      <div className="flex gap-4">
                        <div className="w-16 h-16 rounded-xl bg-neutral-100 dark:bg-neutral-950 shrink-0 overflow-hidden" style={getCoverStyle(claim.rental?.product?.images?.[0] || "")} />
                        <div className="flex-grow min-w-0 space-y-1">
                          <div className="flex items-center justify-between gap-2">
                            <span className={`px-2 py-0.5 rounded text-[8px] font-bold uppercase ${getSeverityBadgeClass(claim.severity)}`}>
                              {claim.severity} Severity
                            </span>
                            <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-bold ${getStatusBadgeClass(claim.status)}`}>
                              {claim.status}
                            </span>
                          </div>
                          <h3 className="text-sm font-bold text-foreground truncate" title={claim.rental?.product?.name}>
                            {claim.rental?.product?.name || "Physical Item Damage"}
                          </h3>
                          <p className="text-[10px] text-neutral-500 font-medium">Reported by: {claim.reportedBy?.name || "Vendor"}</p>
                        </div>
                      </div>

                      {}
                      <div className="p-3.5 bg-neutral-50 dark:bg-neutral-950 border border-neutral-150 dark:border-neutral-850 rounded-xl space-y-2.5 text-xs">
                        <div>
                          <span className="block text-[9px] text-neutral-400 uppercase font-bold">Damage Description</span>
                          <p className="text-muted-foreground font-medium text-[11px] leading-snug">
                            {claim.description}
                          </p>
                        </div>

                        <div className="grid grid-cols-2 gap-3 border-t border-border/60 pt-2 mt-1.5">
                          <div className="bg-red-50/10 dark:bg-red-950/10 p-2 rounded-lg border border-red-200/20">
                            <span className="block text-[8px] text-red-550 dark:text-red-400 uppercase font-extrabold">Deducted Deposit</span>
                            <span className="font-extrabold text-foreground text-sm">₹{claim.deductedAmount}</span>
                          </div>
                          <div className="bg-amber-50/10 dark:bg-amber-950/10 p-2 rounded-lg border border-amber-200/20">
                            <span className="block text-[8px] text-amber-600 dark:text-amber-400 uppercase font-extrabold">Penalty Charge</span>
                            <span className="font-extrabold text-foreground text-sm">₹{claim.penaltyAmount}</span>
                          </div>
                        </div>
                      </div>

                      {}
                      <div className="bg-neutral-50/50 dark:bg-neutral-900/60 border border-border/60 p-3 rounded-xl text-xs">
                        <span className="block text-[9px] text-neutral-450 uppercase font-bold flex items-center gap-1">
                          <ShieldAlert className="h-3 w-3 text-indigo-500" />
                          Administrative Assessment Logs
                        </span>
                        <p className="text-muted-foreground italic leading-tight mt-1">
                          "{claim.inspectionNotes || "Review is ongoing. Pending admin verification."}"
                        </p>
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
      {selectedRental && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-950/60 backdrop-blur-sm">
          <div className="w-full max-w-md bg-card border border-border/60 rounded-3xl overflow-hidden shadow-2xl relative animate-in fade-in zoom-in duration-200 p-6 space-y-6">

            <div className="flex justify-between items-center pb-2 border-b border-neutral-100 dark:border-neutral-850">
              <h3 className="font-extrabold text-foreground text-sm flex items-center gap-2">
                <Sparkles className="h-4.5 w-4.5 text-violet-500" />
                Extend Lease Subscription
              </h3>
              <button
                onClick={() => setSelectedRental(null)}
                className="text-neutral-450 hover:text-neutral-600 dark:hover:text-white p-1 rounded-full cursor-pointer animate-none"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {extendSuccess ? (
              <div className="py-6 text-center space-y-3 animate-in zoom-in-50 duration-200">
                <CheckCircle className="h-14 w-14 text-emerald-500 mx-auto animate-bounce" />
                <h4 className="text-base font-extrabold text-foreground">Lease Extended Successfully!</h4>
                <p className="text-xs text-neutral-500">Your rental end date and calculations have been updated.</p>
              </div>
            ) : (
              <form onSubmit={handleExtendLeaseSubmit} className="space-y-5">
                {extendError && (
                  <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/40 rounded-xl p-3 flex items-start gap-2 text-xs text-red-650 dark:text-red-400">
                    <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                    <span>{extendError}</span>
                  </div>
                )}

                <div className="p-4 bg-neutral-50 dark:bg-neutral-950 border border-neutral-150 dark:border-neutral-850 rounded-2xl space-y-2 text-xs">
                  <div className="flex justify-between text-neutral-500">
                    <span>Product Leased</span>
                    <strong className="text-neutral-800 dark:text-neutral-200 truncate max-w-[200px]">{selectedRental.product?.name}</strong>
                  </div>
                  <div className="flex justify-between text-neutral-500">
                    <span>Current Lease End Date</span>
                    <strong className="text-neutral-800 dark:text-neutral-200">{new Date(selectedRental.endDate).toLocaleDateString()}</strong>
                  </div>
                  <div className="flex justify-between text-neutral-500 border-t border-border/60 pt-2">
                    <span>Monthly Rent Rate</span>
                    <strong className="text-neutral-800 dark:text-neutral-200">₹{selectedRental.monthlyRent}/month</strong>
                  </div>
                  <div className="flex justify-between text-neutral-500">
                    <span>Quantity Subscribed</span>
                    <strong className="text-neutral-800 dark:text-neutral-200">{selectedRental.quantity} units</strong>
                  </div>
                </div>

                {}
                <div className="space-y-2">
                  <label className="text-[10px] uppercase font-extrabold text-neutral-450 block">Select Extension Tenure</label>
                  <div className="grid grid-cols-4 gap-2">
                    {[1, 3, 6, 12].map((months) => (
                      <button
                        key={months}
                        type="button"
                        onClick={() => setExtensionMonths(months)}
                        className={`py-2 px-3 text-xs font-bold rounded-xl border cursor-pointer text-center transition-all ${
                          extensionMonths === months
                            ? "bg-indigo-650 border-indigo-650 text-white dark:bg-violet-650 dark:border-violet-650"
                            : "bg-white dark:bg-neutral-950 border-neutral-200 dark:border-neutral-850 text-neutral-700 dark:text-neutral-350 hover:bg-neutral-50"
                        }`}
                      >
                        {months} Mo
                      </button>
                    ))}
                  </div>
                </div>

                {}
                <div className="border-t border-dashed border-neutral-250 dark:border-neutral-800 pt-4 space-y-2 text-xs">
                  <div className="flex justify-between text-neutral-650 dark:text-neutral-450">
                    <span>New End Date Preview</span>
                    <strong className="text-neutral-800 dark:text-white">{getPreviewExtendedDate(selectedRental.endDate, extensionMonths)}</strong>
                  </div>
                  <div className="flex justify-between items-baseline pt-1">
                    <span className="font-bold text-neutral-750 dark:text-neutral-350">Additional Rent Due</span>
                    <strong className="text-lg font-extrabold text-indigo-650 dark:text-violet-400">
                      ₹{(selectedRental.monthlyRent * extensionMonths * selectedRental.quantity).toLocaleString("en-IN")}
                    </strong>
                  </div>
                </div>

                <div className="bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-100/50 dark:border-indigo-950 p-3 rounded-xl flex items-start gap-2 text-[10px] text-neutral-450 leading-relaxed">
                  <ShieldCheck className="h-4 w-4 shrink-0 text-indigo-500 mt-0.5" />
                  <span>The new billing cycle begins after your current lease ends. Security deposits remain locked.</span>
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setSelectedRental(null)}
                    className="flex-1 py-3 border border-neutral-300 dark:border-neutral-800 text-neutral-700 dark:text-white font-semibold text-xs rounded-xl hover:bg-neutral-50 dark:hover:bg-neutral-800 cursor-pointer text-center"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={extending}
                    className="flex-1 py-3 bg-primary hover:bg-primary/90 text-white font-extrabold text-xs rounded-xl shadow-lg cursor-pointer disabled:opacity-50"
                  >
                    {extending ? "Processing..." : "Confirm Extension"}
                  </button>
                </div>
              </form>
            )}

          </div>
        </div>
      )}

      {}
      {requestPickupRental && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-950/60 backdrop-blur-sm">
          <div className="w-full max-w-md bg-card border border-border/60 rounded-3xl overflow-hidden shadow-2xl relative animate-in fade-in zoom-in duration-200 p-6 space-y-6">

            <div className="flex justify-between items-center pb-2 border-b border-neutral-100 dark:border-neutral-850">
              <h3 className="font-extrabold text-foreground text-sm flex items-center gap-2">
                <Truck className="h-4.5 w-4.5 text-indigo-500" />
                Request Return Pickup
              </h3>
              <button
                onClick={() => setRequestPickupRental(null)}
                className="text-neutral-450 hover:text-neutral-600 dark:hover:text-white p-1 rounded-full cursor-pointer animate-none"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {requestPickupSuccess ? (
              <div className="py-6 text-center space-y-3 animate-in zoom-in-50 duration-200">
                <CheckCircle className="h-14 w-14 text-emerald-500 mx-auto animate-bounce" />
                <h4 className="text-base font-extrabold text-foreground">Return Pickup Requested!</h4>
                <p className="text-xs text-neutral-505">The vendor has been notified to schedule a return pickup carrier.</p>
              </div>
            ) : (
              <form onSubmit={handlePickupRequestSubmit} className="space-y-4">
                {requestPickupError && (
                  <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/40 rounded-xl p-3 flex items-start gap-2 text-xs text-red-650 dark:text-red-400">
                    <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                    <span>{requestPickupError}</span>
                  </div>
                )}

                <div className="p-3.5 bg-neutral-50 dark:bg-neutral-950 border border-neutral-150 dark:border-neutral-850 rounded-2xl space-y-1.5 text-xs">
                  <div className="flex justify-between text-neutral-500">
                    <span>Item Returning</span>
                    <strong className="text-neutral-800 dark:text-neutral-200 truncate max-w-[200px]">{requestPickupRental.product?.name}</strong>
                  </div>
                  <div className="flex justify-between text-neutral-500">
                    <span>Original Deposit</span>
                    <strong className="text-neutral-800 dark:text-neutral-200">₹{requestPickupRental.deposit} (Refundable)</strong>
                  </div>
                </div>

                {}
                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-extrabold text-neutral-450 block">Select Desired Return Date</label>
                  <input
                    type="date"
                    required
                    min={new Date().toISOString().split("T")[0]}
                    value={pickupDate}
                    onChange={(e) => setPickupDate(e.target.value)}
                    className="w-full py-2 px-3 rounded-xl border border-neutral-300 dark:border-neutral-800 bg-white dark:bg-neutral-950 text-foreground text-xs focus:border-indigo-550 focus:outline-none"
                  />
                </div>

                {}
                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-extrabold text-neutral-450 block">Pickup Location Address</label>
                  <textarea
                    required
                    rows={3}
                    placeholder="Enter full address where agent should collect the item..."
                    value={pickupAddress}
                    onChange={(e) => setPickupAddress(e.target.value)}
                    className="w-full py-2 px-3 rounded-xl border border-neutral-300 dark:border-neutral-800 bg-white dark:bg-neutral-950 text-foreground text-xs focus:border-indigo-550 focus:outline-none resize-none"
                  />
                </div>

                <div className="bg-amber-50/10 dark:bg-amber-950/10 border border-amber-200/20 p-3 rounded-xl flex items-start gap-2 text-[10px] text-neutral-500 dark:text-neutral-450 leading-relaxed">
                  <Info className="h-4 w-4 shrink-0 text-amber-500 mt-0.5" />
                  <span>Your deposit is subject to administrative product inspection. A damage claim may be filed if physical damage is discovered during pickup handover.</span>
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setRequestPickupRental(null)}
                    className="flex-1 py-2.5 border border-neutral-300 dark:border-neutral-800 text-neutral-700 dark:text-white font-semibold text-xs rounded-xl hover:bg-neutral-50 dark:hover:bg-neutral-800 cursor-pointer text-center"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={requestingPickup}
                    className="flex-1 py-2.5 bg-indigo-650 hover:bg-indigo-500 dark:bg-violet-650 dark:hover:bg-violet-600 text-white font-extrabold text-xs rounded-xl shadow-lg cursor-pointer disabled:opacity-50"
                  >
                    {requestingPickup ? "Filing..." : "Submit Return"}
                  </button>
                </div>
              </form>
            )}

          </div>
        </div>
      )}

      {}
      {viewHistoryRental && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-950/60 backdrop-blur-sm">
          <div className="w-full max-w-lg bg-card border border-border/60 rounded-3xl overflow-hidden shadow-2xl relative animate-in fade-in zoom-in duration-200 p-6 space-y-6">

            <div className="flex justify-between items-center pb-2 border-b border-neutral-100 dark:border-neutral-850">
              <h3 className="font-extrabold text-foreground text-sm flex items-center gap-2">
                <History className="h-4.5 w-4.5 text-violet-500" />
                Lease Extension Log History
              </h3>
              <button
                onClick={() => setViewHistoryRental(null)}
                className="text-neutral-450 hover:text-neutral-600 dark:hover:text-white p-1 rounded-full cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="p-3 bg-neutral-50 dark:bg-neutral-950 border border-neutral-150 dark:border-neutral-850 rounded-2xl text-xs space-y-1">
              <div className="flex justify-between">
                <span className="text-neutral-455 font-bold uppercase text-[10px]">Product</span>
                <span className="font-bold text-neutral-800 dark:text-white truncate max-w-[250px]">{viewHistoryRental.product?.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-455 font-bold uppercase text-[10px]">Current End Date</span>
                <span className="font-bold text-neutral-800 dark:text-white">{new Date(viewHistoryRental.endDate).toLocaleDateString()}</span>
              </div>
            </div>

            <div className="max-h-60 overflow-y-auto pr-1 space-y-3">
              {viewHistoryRental.extensionHistory?.map((hist, idx) => (
                <div key={hist._id || idx} className="p-3.5 border border-neutral-150 dark:border-neutral-855 bg-neutral-50/20 dark:bg-neutral-900 rounded-xl space-y-2 text-xs">
                  <div className="flex justify-between items-center">
                    <span className="font-extrabold text-indigo-650 dark:text-violet-400">Extended by +{hist.extendedByMonths} Months</span>
                    <span className="text-[10px] text-neutral-400 font-semibold">{new Date(hist.createdAt).toLocaleDateString()}</span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-[11px] text-neutral-500 border-t border-neutral-100 dark:border-neutral-800 pt-2">
                    <div>
                      <span>Previous End Date</span>
                      <strong className="block text-neutral-750 dark:text-neutral-200 mt-0.5">{new Date(hist.previousEndDate).toLocaleDateString()}</strong>
                    </div>
                    <div>
                      <span>Extended End Date</span>
                      <strong className="block text-neutral-750 dark:text-neutral-200 mt-0.5">{new Date(hist.newEndDate).toLocaleDateString()}</strong>
                    </div>
                  </div>

                  <div className="border-t border-neutral-100 dark:border-neutral-800 pt-1.5 flex justify-between items-center text-[11px]">
                    <span className="font-bold text-neutral-500">Extra Paid Amount</span>
                    <strong className="text-neutral-800 dark:text-white">₹{hist.extraPaidAmount.toLocaleString("en-IN")}</strong>
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-2">
              <button
                type="button"
                onClick={() => setViewHistoryRental(null)}
                className="w-full py-3 bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-150 dark:hover:bg-neutral-750 text-neutral-850 dark:text-white font-bold text-xs rounded-xl cursor-pointer text-center"
              >
                Close Logs
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
