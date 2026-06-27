"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import {
  ArrowLeft,
  Wrench,
  AlertCircle,
  Clock,
  CheckCircle,
  FileText,
  Plus,
  Send,
  MessageSquare,
  Image as ImageIcon,
  Sparkles,
  Info,
  X,
  Layers,
  ChevronRight
} from "lucide-react";

interface CommentRecord {
  user: string;
  name: string;
  text: string;
  createdAt: string;
  _id?: string;
}

interface MaintenanceTicket {
  _id: string;
  title: string;
  description: string;
  itemType: 'listing' | 'product';
  images: string[];
  status: 'Open' | 'In Progress' | 'Resolved';
  comments: CommentRecord[];
  listing?: { _id: string; title: string; location: string };
  product?: { _id: string; name: string };
  rental?: { _id: string };
  booking?: { _id: string };
  createdAt: string;
}

interface BookingItem {
  _id: string;
  bookingType: 'listing' | 'product';
  listing?: { _id: string; title: string };
  product?: { _id: string; name: string };
  status: string;
}

interface RentalItem {
  _id: string;
  product?: { _id: string; name: string };
  status: string;
}

export default function UserMaintenanceDashboard() {
  const router = useRouter();
  const [tickets, setTickets] = React.useState<MaintenanceTicket[]>([]);
  const [activeBookings, setActiveBookings] = React.useState<BookingItem[]>([]);
  const [activeRentals, setActiveRentals] = React.useState<RentalItem[]>([]);

  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);


  const [selectedTicket, setSelectedTicket] = React.useState<MaintenanceTicket | null>(null);
  const [newTicketOpen, setNewTicketOpen] = React.useState(false);
  const [newCommentText, setNewCommentText] = React.useState("");
  const [submittingComment, setSubmittingComment] = React.useState(false);


  const [formTitle, setFormTitle] = React.useState("");
  const [formDescription, setFormDescription] = React.useState("");
  const [selectedContext, setSelectedContext] = React.useState("");
  const [formImages, setFormImages] = React.useState<string[]>([]);
  const [submittingTicket, setSubmittingTicket] = React.useState(false);
  const [formError, setFormError] = React.useState<string | null>(null);

  const fetchTickets = React.useCallback(async () => {
    try {
      const res = await api.get<{ success: boolean; data: MaintenanceTicket[] }>("/maintenance/my-requests");
      if (res.success) {
        setTickets(res.data || []);

        if (selectedTicket) {
          const updated = (res.data || []).find(t => t._id === selectedTicket._id);
          if (updated) setSelectedTicket(updated);
        }
      }
    } catch (err) {
      console.error(err);
    }
  }, [selectedTicket]);

  const fetchContextItems = React.useCallback(async () => {
    try {
      const [bookingsRes, rentalsRes] = await Promise.all([
        api.get<{ success: boolean; data: BookingItem[] }>("/bookings/my-bookings"),
        api.get<{ success: boolean; data: RentalItem[] }>("/rentals/my-rentals")
      ]);
      if (bookingsRes.success) {
        setActiveBookings((bookingsRes.data || []).filter(b => b.status === "confirmed"));
      }
      if (rentalsRes.success) {
        setActiveRentals((rentalsRes.data || []).filter(r => r.status === "Active" || r.status === "Delivered"));
      }
    } catch (err) {
      console.error("Failed to load context stays / product leases", err);
    }
  }, []);

  React.useEffect(() => {
    const init = async () => {
      setLoading(true);
      setError(null);
      try {
        const token = localStorage.getItem("rentease_token");
        if (!token) {
          router.push("/login");
          return;
        }
        await Promise.all([fetchTickets(), fetchContextItems()]);
      } catch (err) {
        setError("An error occurred while launching dashboard.");
      } finally {
        setLoading(false);
      }
    };
    init();
  }, [router, fetchTickets, fetchContextItems]);


  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    Array.from(files).forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === "string") {
          setFormImages((prev) => [...prev, reader.result as string]);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index: number) => {
    setFormImages((prev) => prev.filter((_, idx) => idx !== index));
  };


  const handleNewTicketSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim() || !formDescription.trim() || !selectedContext) {
      setFormError("Please enter a title, description, and select the item needing service.");
      return;
    }
    setSubmittingTicket(true);
    setFormError(null);

    try {
      const [type, id] = selectedContext.split(":");
      const payload: any = {
        title: formTitle,
        description: formDescription,
        images: formImages
      };

      if (type === "booking") {
        payload.itemType = "listing";
        payload.booking = id;
      } else {
        payload.itemType = "product";
        payload.rental = id;
      }

      const res = await api.post<{ success: boolean; data: MaintenanceTicket }>("/maintenance", payload);
      if (res.success) {
        setNewTicketOpen(false);
        setFormTitle("");
        setFormDescription("");
        setFormImages([]);
        setSelectedContext("");
        fetchTickets();
      } else {
        setFormError("Could not submit request. Please try again.");
      }
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Submission failed.");
    } finally {
      setSubmittingTicket(false);
    }
  };


  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTicket || !newCommentText.trim()) return;
    setSubmittingComment(true);

    try {
      const res = await api.post<{ success: boolean; data: MaintenanceTicket }>(
        `/maintenance/${selectedTicket._id}/comments`,
        { text: newCommentText }
      );
      if (res.success) {
        setNewCommentText("");
        fetchTickets();
      }
    } catch (err) {
      alert("Failed to post message: " + (err instanceof Error ? err.message : "Error"));
    } finally {
      setSubmittingComment(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Open": return "bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-400 border border-amber-200/40";
      case "In Progress": return "bg-blue-50 dark:bg-blue-950/30 text-blue-700 dark:text-blue-400 border border-blue-200/40";
      case "Resolved": return "bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 border border-emerald-200/40";
      default: return "bg-neutral-100 dark:bg-neutral-800 text-neutral-600";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950 flex flex-col justify-center items-center">
        <div className="h-10 w-10 border-4 border-indigo-650 border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-xs text-neutral-500 font-semibold tracking-wider uppercase animate-pulse">Entering Support Dashboard...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50/50 dark:bg-neutral-950/20 py-10 px-4 sm:px-6 lg:px-8 animate-in fade-in duration-200">
      <div className="max-w-6xl mx-auto space-y-8">

        {}
        <div className="flex items-center justify-between">
          <Link href="/dashboard" className="inline-flex items-center gap-1.5 text-xs text-neutral-450 hover:text-indigo-650 dark:hover:text-violet-400 font-bold transition-colors">
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard Home
          </Link>
          <div className="inline-flex items-center space-x-2 rounded-full border border-indigo-150 dark:border-neutral-850 bg-card px-3 py-1 text-xs text-indigo-650 dark:text-violet-400 backdrop-blur-sm shadow-sm font-semibold">
            <Wrench className="h-3.5 w-3.5" />
            <span>Support & Repair System</span>
          </div>
        </div>

        {}
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
          <div className="space-y-1">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight flex items-center gap-2">
              <Wrench className="h-7 w-7 text-indigo-500" />
              Maintenance Requests
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground max-w-xl">
              File tickets for repairs, exchange faulty electronics/appliances, or notify about property issues.
            </p>
          </div>
          <button
            onClick={() => {
              setNewTicketOpen(true);
              setFormError(null);
            }}
            className="self-start sm:self-center bg-indigo-605 hover:bg-indigo-500 dark:bg-violet-650 dark:hover:bg-violet-600 text-white font-bold text-xs py-2.5 px-5 rounded-xl shadow-lg flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            Submit Maintenance Request
          </button>
        </div>

        {error && (
          <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/40 rounded-2xl p-4 flex items-start gap-2.5 text-xs text-red-650 dark:text-red-400 max-w-lg mx-auto">
            <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {}
        {tickets.length === 0 ? (
          <div className="bg-card border border-border/60 rounded-3xl py-20 text-center max-w-xl mx-auto space-y-4 shadow-sm">
            <Wrench className="h-16 w-16 mx-auto text-neutral-350 dark:text-neutral-750" />
            <h3 className="text-lg font-bold text-foreground">No maintenance tickets filed</h3>
            <p className="text-xs text-muted-foreground max-w-xs mx-auto">
              If any of your properties or physical rentals have repair requirements, submit a support ticket above.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">

            {}
            <div className="md:col-span-1 space-y-4 max-h-[70vh] overflow-y-auto pr-1">
              <span className="text-[10px] font-extrabold uppercase text-neutral-400 tracking-wider block">My Tickets ({tickets.length})</span>
              {tickets.map((t) => (
                <button
                  key={t._id}
                  onClick={() => setSelectedTicket(t)}
                  className={`w-full text-left p-4 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between space-y-3 ${
                    selectedTicket?._id === t._id
                      ? "bg-card border-indigo-505 dark:border-violet-505 shadow-md"
                      : "bg-card/80 border-border/60 hover:bg-white hover:shadow-sm"
                  }`}
                >
                  <div className="space-y-1">
                    <div className="flex justify-between items-center gap-2">
                      <span className={`px-2 py-0.5 rounded-full text-[8px] font-extrabold tracking-wide uppercase ${getStatusBadge(t.status)}`}>
                        {t.status}
                      </span>
                      <span className="text-[9px] text-neutral-400 font-semibold">{new Date(t.createdAt).toLocaleDateString()}</span>
                    </div>
                    <h4 className="text-xs font-bold text-foreground line-clamp-1">{t.title}</h4>
                    <p className="text-[11px] text-neutral-505 line-clamp-1 font-semibold">
                      For: {t.itemType === 'listing' ? t.listing?.title : t.product?.name || "Rental Item"}
                    </p>
                  </div>
                  <div className="flex justify-between items-center text-[10px] text-neutral-450 font-semibold border-t border-neutral-100 dark:border-neutral-850 pt-2">
                    <span className="flex items-center gap-1">
                      <MessageSquare className="h-3.5 w-3.5" />
                      {t.comments.length} replies
                    </span>
                    <ChevronRight className="h-3.5 w-3.5" />
                  </div>
                </button>
              ))}
            </div>

            {}
            <div className="md:col-span-2">
              {selectedTicket ? (
                <div className="bg-card border border-border/60 rounded-3xl p-6 shadow-sm space-y-6">

                  {}
                  <div className="border-b border-neutral-150 dark:border-neutral-850 pb-4 space-y-2">
                    <div className="flex justify-between items-center gap-4">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${getStatusBadge(selectedTicket.status)}`}>
                        {selectedTicket.status}
                      </span>
                      <span className="text-xs text-neutral-400 font-medium">Submitted on: {new Date(selectedTicket.createdAt).toLocaleDateString()}</span>
                    </div>
                    <h2 className="text-base sm:text-lg font-extrabold text-foreground leading-snug">{selectedTicket.title}</h2>
                    <p className="text-xs text-neutral-550 font-bold">
                      Associated item: <span className="text-indigo-650 dark:text-violet-400">{selectedTicket.itemType === 'listing' ? selectedTicket.listing?.title : selectedTicket.product?.name || "Leased Product"}</span>
                    </p>
                  </div>

                  {}
                  <div className="space-y-4">
                    <div className="space-y-1">
                      <h4 className="text-[10px] font-extrabold uppercase text-neutral-450 tracking-wider">Issue Description</h4>
                      <p className="text-xs text-muted-foreground leading-relaxed bg-neutral-50 dark:bg-neutral-950 p-4 rounded-2xl border border-neutral-150 dark:border-neutral-850 whitespace-pre-wrap">
                        {selectedTicket.description}
                      </p>
                    </div>

                    {}
                    {selectedTicket.images && selectedTicket.images.length > 0 && (
                      <div className="space-y-2">
                        <h4 className="text-[10px] font-extrabold uppercase text-neutral-455 tracking-wider">Reference Uploads</h4>
                        <div className="flex flex-wrap gap-3">
                          {selectedTicket.images.map((img, idx) => (
                            <a
                              key={idx}
                              href={img}
                              target="_blank"
                              rel="noreferrer"
                              className="w-24 h-24 rounded-xl border border-border/60 overflow-hidden hover:scale-105 transition-transform"
                            >
                              <img src={img} alt="Reference Attachment" className="w-full h-full object-cover" />
                            </a>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {}
                  <div className="border-t border-border/60 pt-6 space-y-4">
                    <h3 className="text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-1.5">
                      <MessageSquare className="h-4.5 w-4.5 text-indigo-500" />
                      Activity & Discussion Replies ({selectedTicket.comments.length})
                    </h3>

                    <div className="space-y-3.5 max-h-60 overflow-y-auto pr-1">
                      {selectedTicket.comments.length === 0 ? (
                        <p className="text-xs text-neutral-450 italic">No messages posted yet. Post a comment below to ask details.</p>
                      ) : (
                        selectedTicket.comments.map((comment, index) => (
                          <div
                            key={comment._id || index}
                            className={`p-3.5 rounded-2xl border text-xs space-y-1 max-w-[85%] ${
                              comment.name === "Default Admin" || comment.name === "Vendor Account" || comment.name.toLowerCase().includes("admin")
                                ? "bg-indigo-50/20 dark:bg-indigo-950/15 border-indigo-100/30 dark:border-indigo-900/30 ml-auto"
                                : "bg-neutral-50 dark:bg-neutral-950 border-neutral-150 dark:border-neutral-850 mr-auto"
                            }`}
                          >
                            <div className="flex justify-between items-center gap-4 border-b border-neutral-200/35 dark:border-neutral-800/40 pb-1 mb-1">
                              <span className="font-extrabold text-neutral-800 dark:text-white">{comment.name}</span>
                              <span className="text-[9px] text-neutral-400">{new Date(comment.createdAt).toLocaleDateString()}</span>
                            </div>
                            <p className="text-neutral-700 dark:text-neutral-350 leading-relaxed font-semibold">{comment.text}</p>
                          </div>
                        ))
                      )}
                    </div>

                    {}
                    <form onSubmit={handleCommentSubmit} className="flex gap-2 border-t border-neutral-100 dark:border-neutral-800 pt-4">
                      <input
                        type="text"
                        required
                        value={newCommentText}
                        onChange={(e) => setNewCommentText(e.target.value)}
                        placeholder="Type a message or response description..."
                        className="flex-grow text-xs font-semibold bg-neutral-50 dark:bg-neutral-950 border border-neutral-300 dark:border-neutral-800 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-1 focus:ring-indigo-550 dark:text-white"
                      />
                      <button
                        type="submit"
                        disabled={submittingComment}
                        className="py-2.5 px-4 bg-indigo-605 hover:bg-indigo-550 dark:bg-violet-650 dark:hover:bg-violet-600 text-white rounded-xl shadow-md cursor-pointer flex items-center justify-center shrink-0 disabled:opacity-50"
                      >
                        <Send className="h-4 w-4" />
                      </button>
                    </form>
                  </div>

                </div>
              ) : (
                <div className="bg-white/40 dark:bg-neutral-900/10 border border-dashed border-neutral-250 dark:border-neutral-850 rounded-3xl p-16 text-center text-neutral-450 text-xs">
                  <FileText className="h-10 w-10 mx-auto text-neutral-300 dark:text-neutral-800 mb-2" />
                  Select a support ticket from the list to view tracking logistics details and communications logs.
                </div>
              )}
            </div>

          </div>
        )}

      </div>

      {}
      {newTicketOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-950/60 backdrop-blur-sm">
          <div className="w-full max-w-lg bg-card border border-border/60 rounded-3xl overflow-hidden shadow-2xl relative animate-in fade-in zoom-in duration-200 p-6 space-y-6">

            <div className="flex justify-between items-center pb-2 border-b border-neutral-105 dark:border-neutral-850 bg-neutral-50 dark:bg-neutral-950/50 -m-6 mb-0 p-6">
              <h3 className="font-extrabold text-foreground text-sm flex items-center gap-2">
                <Sparkles className="h-4.5 w-4.5 text-violet-500" />
                File Maintenance Request
              </h3>
              <button
                onClick={() => setNewTicketOpen(false)}
                className="text-neutral-400 hover:text-neutral-600 dark:hover:text-white p-1 rounded-full cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleNewTicketSubmit} className="space-y-4 pt-2">
              {formError && (
                <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/40 rounded-xl p-3 flex items-start gap-2.5 text-xs text-red-650 dark:text-red-400">
                  <AlertCircle className="h-4.5 w-4.5 shrink-0 mt-0.5" />
                  <span>{formError}</span>
                </div>
              )}

              {}
              <div className="space-y-1.5">
                <label className="text-[10px] uppercase font-extrabold text-neutral-400">Select Active Rental needing service</label>
                <select
                  required
                  value={selectedContext}
                  onChange={(e) => setSelectedContext(e.target.value)}
                  className="w-full py-2.5 px-3.5 rounded-xl border border-neutral-350 dark:border-neutral-800 bg-white dark:bg-neutral-950 text-foreground text-xs focus:border-indigo-500 focus:outline-none transition-colors"
                >
                  <option value="">-- Choose item context --</option>
                  <optgroup label="Physical Product Rentals">
                    {activeRentals.map((r) => (
                      <option key={r._id} value={`rental:${r._id}`}>
                        {r.product?.name || "Leased Product"} (Rental Contract #{r._id.slice(-6)})
                      </option>
                    ))}
                  </optgroup>
                  <optgroup label="Escape Property stays">
                    {activeBookings.map((b) => (
                      <option key={b._id} value={`booking:${b._id}`}>
                        {b.listing?.title || "Booked Property"} (Booking #{b._id.slice(-6)})
                      </option>
                    ))}
                  </optgroup>
                </select>
                <span className="text-[9px] text-neutral-400 block">Select which item context the maintenance logs apply to.</span>
              </div>

              {}
              <div className="space-y-1.5">
                <label className="text-[10px] uppercase font-extrabold text-neutral-400">Issue Title Summary</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Microwave stopped heating / AC fan making noise"
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  className="w-full py-2 px-3.5 rounded-xl border border-neutral-300 dark:border-neutral-800 bg-white dark:bg-neutral-950 text-xs focus:border-indigo-505 focus:outline-none dark:text-white transition-colors"
                />
              </div>

              {}
              <div className="space-y-1.5">
                <label className="text-[10px] uppercase font-extrabold text-neutral-400">Describe the problem in detail</label>
                <textarea
                  required
                  rows={4}
                  placeholder="Tell us exactly what went wrong. Include details like when it started happening and what error codes appear."
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  className="w-full py-2 px-3.5 rounded-xl border border-neutral-300 dark:border-neutral-800 bg-white dark:bg-neutral-950 text-xs focus:border-indigo-505 focus:outline-none dark:text-white transition-colors resize-none"
                />
              </div>

              {}
              <div className="space-y-2">
                <label className="text-[10px] uppercase font-extrabold text-neutral-400 block">Attach reference images</label>
                <div className="flex items-center gap-3">
                  <label className="flex items-center gap-1.5 py-2 px-3 border border-neutral-350 dark:border-neutral-800 rounded-xl bg-neutral-50 dark:bg-neutral-950 text-muted-foreground hover:bg-neutral-100 text-xs font-semibold cursor-pointer">
                    <ImageIcon className="h-4 w-4" />
                    Upload Image
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      className="hidden"
                      onChange={handleImageUpload}
                    />
                  </label>
                  <span className="text-[9px] text-neutral-400">Attach photos of the issue to speed up diagnostic processing.</span>
                </div>

                {}
                {formImages.length > 0 && (
                  <div className="flex flex-wrap gap-2 pt-1.5">
                    {formImages.map((img, idx) => (
                      <div key={idx} className="relative w-16 h-16 rounded-lg border border-neutral-300 overflow-hidden group">
                        <img src={img} alt="Thumbnail Preview" className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => removeImage(idx)}
                          className="absolute inset-0 bg-neutral-950/60 flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                        >
                          <X className="h-4.5 w-4.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex gap-3 pt-3 border-t border-neutral-100 dark:border-neutral-800">
                <button
                  type="button"
                  onClick={() => setNewTicketOpen(false)}
                  className="flex-1 py-3 border border-neutral-350 dark:border-neutral-800 text-neutral-700 dark:text-white font-semibold text-xs rounded-xl hover:bg-neutral-50 dark:hover:bg-neutral-800 cursor-pointer text-center"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingTicket}
                  className="flex-1 py-3 bg-primary hover:bg-primary/90 text-white font-extrabold text-xs rounded-xl shadow-lg cursor-pointer disabled:opacity-50"
                >
                  {submittingTicket ? "Submitting Ticket..." : "Submit Ticket"}
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

    </div>
  );
}
