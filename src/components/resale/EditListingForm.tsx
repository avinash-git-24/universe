"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  CheckCircle2,
  AlertTriangle,
  Loader2,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import {
  updateResaleListing,
  VALID_CATEGORIES,
  VALID_CONDITIONS,
  ResaleServiceError,
  type ResaleCategory,
  type ResaleCondition,
  type ResaleListingWithImages,
  type UpdateResaleListingInput,
} from "@/lib/database/resale";

// ─── Constants ────────────────────────────────────────────────────────────────

const CATEGORY_LABELS: Record<ResaleCategory, string> = {
  books: "Books",
  electronics: "Electronics",
  study_materials: "Study Materials",
  hostel: "Hostel",
  sports: "Sports",
  furniture: "Furniture",
  clothing: "Clothing",
  gaming: "Gaming",
  other: "Other",
};

const CONDITION_LABELS: Record<ResaleCondition, string> = {
  new: "New",
  like_new: "Like New",
  good: "Good",
  fair: "Fair",
};

const STATUS_LABELS: Record<string, string> = {
  active: "Active",
  reserved: "Reserved",
  sold: "Sold",
  removed: "Removed",
};

const MAX_TITLE_LEN = 200;
const MAX_DESC_LEN = 5000;
const MAX_LOCATION_LEN = 300;

// ─── Types ────────────────────────────────────────────────────────────────────

interface FormErrors {
  title?: string;
  category?: string;
  condition?: string;
  price?: string;
  original_price?: string;
  pickup_location?: string;
  submit?: string;
}

interface EditListingFormProps {
  listing: ResaleListingWithImages;
}

// ─── Helper ───────────────────────────────────────────────────────────────────

function friendlyError(err: unknown): string {
  if (err instanceof ResaleServiceError) {
    switch (err.code) {
      case "UNAUTHENTICATED":
        return "Please sign in to edit a listing.";
      case "VALIDATION_ERROR":
        return `Validation failed: ${err.message}`;
      case "UNAUTHORIZED":
        return "You don't have permission to edit this listing, or invalid status transition.";
      case "DATABASE_ERROR":
        return "We couldn't save your changes. Please try again.";
      default:
        return "Something went wrong. Please try again.";
    }
  }
  return "We couldn't save your changes. Please try again.";
}

// ─── Component ────────────────────────────────────────────────────────────────

export function EditListingForm({ listing }: EditListingFormProps) {
  const router = useRouter();

  // ── Form state ──
  const [title, setTitle] = useState(listing.title);
  const [description, setDescription] = useState(listing.description ?? "");
  const [category, setCategory] = useState<ResaleCategory>(listing.category as ResaleCategory);
  const [condition, setCondition] = useState<ResaleCondition>(listing.condition as ResaleCondition);
  const [status, setStatus] = useState<string>(listing.status);
  const [price, setPrice] = useState(listing.price.toString());
  const [originalPrice, setOriginalPrice] = useState(listing.original_price?.toString() ?? "");
  const [negotiable, setNegotiable] = useState(listing.negotiable);
  const [pickupLocation, setPickupLocation] = useState(listing.pickup_location ?? "");

  // ── Submission state ──
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // ── Validation ──
  function validateClient(): boolean {
    const errs: FormErrors = {};

    if (!title.trim()) errs.title = "A descriptive title is required.";
    else if (title.length > MAX_TITLE_LEN) errs.title = `Title must be under ${MAX_TITLE_LEN} characters.`;

    if (!category || !(VALID_CATEGORIES as readonly string[]).includes(category)) errs.category = "Please select a valid category.";
    if (!condition || !(VALID_CONDITIONS as readonly string[]).includes(condition)) errs.condition = "Please select a condition.";

    const p = parseFloat(price);
    if (!price) errs.price = "A price is required. Use 0 for free.";
    else if (isNaN(p) || p < 0 || p > 10000000) errs.price = "Please enter a valid price under ₹10,000,000.";

    if (originalPrice) {
      const op = parseFloat(originalPrice);
      if (isNaN(op) || op < 0) errs.original_price = "Please enter a valid original price.";
      else if (op < p) errs.original_price = "Original price should be greater than the selling price.";
    }

    if (pickupLocation.length > MAX_LOCATION_LEN) errs.pickup_location = "Location is too long.";

    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  // ── Submission ──
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (isSubmitting || isSuccess) return;

    if (!validateClient()) {
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    setIsSubmitting(true);
    setErrors({});

    try {
      const supabase = createClient();
      
      const updateData: UpdateResaleListingInput = {
        title: title.trim(),
        description: description.trim() || undefined,
        category: category as ResaleCategory,
        condition: condition as ResaleCondition,
        price: parseFloat(price),
        original_price: originalPrice ? parseFloat(originalPrice) : undefined,
        negotiable,
        pickup_location: pickupLocation.trim() || undefined,
        status: status !== listing.status ? (status as "active" | "reserved" | "sold" | "removed") : undefined,
      };

      await updateResaleListing(supabase, listing.id, updateData);
      
      setIsSuccess(true);
      setTimeout(() => {
        router.push("/dashboard/marketplace/my-listings");
        router.refresh();
      }, 1500);

    } catch (error) {
      console.error("[EditListingForm] Error updating:", error);
      setErrors({ submit: friendlyError(error) });
      setIsSubmitting(false);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // Render
  // ─────────────────────────────────────────────────────────────────────────────

  if (isSuccess) {
    return (
      <div style={{ maxWidth: "600px", margin: "4rem auto", padding: "3rem 2rem", textAlign: "center", background: "rgba(10,15,12,0.6)", borderRadius: "24px", border: "1px solid rgba(102,255,178,0.15)" }}>
        <div style={{ display: "flex", justifyContent: "center", marginBottom: "1.5rem" }}>
          <div style={{ width: "64px", height: "64px", borderRadius: "50%", background: "rgba(0,230,118,0.1)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <CheckCircle2 size={32} color="#00E676" />
          </div>
        </div>
        <h2 style={{ color: "#fff", fontSize: "1.8rem", fontWeight: 800, margin: "0 0 1rem", letterSpacing: "-0.02em" }}>Listing Updated Successfully!</h2>
        <p style={{ color: "rgba(167,184,176,0.8)", fontSize: "1.05rem", margin: "0 0 2.5rem" }}>Your changes have been saved.</p>
        <Link href="/dashboard/marketplace/my-listings" style={{ textDecoration: "none" }}>
          <button style={{ padding: "0.85rem 2rem", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "12px", color: "#fff", fontWeight: 600, fontSize: "1rem", cursor: "pointer", transition: "background 0.2s" }} className="hover:bg-[rgba(255,255,255,0.1)]">
            Back to My Listings
          </button>
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-4 sm:pt-8 pb-16 px-3 sm:px-6">
      <div className="max-w-[700px] mx-auto">
        
        {/* Header */}
        <div className="flex items-center gap-3 sm:gap-4 mb-6 sm:mb-8">
          <button onClick={() => router.back()} style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: "40px", height: "40px", borderRadius: "50%", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", color: "#A7B8B0", cursor: "pointer", transition: "all 0.2s" }} className="hover:bg-[rgba(255,255,255,0.1)] hover:text-white" aria-label="Go back">
            <ArrowLeft size={18} />
          </button>
          <h1 className="text-white font-extrabold text-2xl sm:text-3xl m-0 tracking-tight">Edit Listing</h1>
        </div>

        {errors.submit && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-4 sm:p-5 mb-6 flex gap-3 items-start">
            <AlertTriangle size={20} className="text-red-400 shrink-0 mt-0.5" />
            <div>
              <h3 className="text-red-400 m-0 mb-1 text-sm font-semibold">Update Failed</h3>
              <p className="text-white/80 m-0 text-xs sm:text-sm leading-relaxed">{errors.submit}</p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate>
          {/* Note: Image editing is disabled in this phase for simplicity */}
          <div className="bg-[#0A0F0C]/60 border border-[#66FFB2]/15 rounded-2xl p-4 sm:p-7 mb-6">
            <p className="m-0 mb-4 text-[#A7B8B0]/80 text-xs sm:text-sm">
              <strong>Note:</strong> Photo editing is currently disabled. To change photos, please create a new listing.
            </p>
            
            {/* Status */}
            <div className="mb-5">
              <label htmlFor="status" className="block text-white font-semibold text-sm mb-2">Status</label>
              <select
                id="status"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                style={{ width: "100%", padding: "0.85rem 1rem", background: "rgba(0,0,0,0.2)", border: "1px solid rgba(167,184,176,0.2)", borderRadius: "12px", color: "#fff", fontSize: "0.95rem", outline: "none", appearance: "none" }}
              >
                {(Object.entries(STATUS_LABELS)).map(([val, label]) => (
                  <option key={val} value={val} style={{ background: "#0f1713", color: "#fff" }}>{label}</option>
                ))}
              </select>
              <p className="m-0 mt-1.5 text-[#A7B8B0]/60 text-xs">
                Active can move to Reserved/Sold/Removed. Sold/Removed cannot be moved back.
              </p>
            </div>

            {/* Title */}
            <div className="mb-5">
              <label htmlFor="title" className="block text-white font-semibold text-sm mb-2">Title <span className="text-red-400">*</span></label>
              <input
                id="title" type="text"
                value={title} onChange={(e) => setTitle(e.target.value)}
                maxLength={MAX_TITLE_LEN}
                placeholder="e.g. Introduction to Algorithms 3rd Ed."
                style={{ width: "100%", padding: "0.85rem 1rem", background: "rgba(0,0,0,0.2)", border: `1px solid ${errors.title ? "rgba(239,68,68,0.5)" : "rgba(167,184,176,0.2)"}`, borderRadius: "12px", color: "#fff", fontSize: "0.95rem", outline: "none", transition: "border-color 0.2s" }}
              />
              {errors.title && <p className="text-red-400 text-xs mt-1.5 mb-0">{errors.title}</p>}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5 mb-5">
              {/* Category */}
              <div>
                <label htmlFor="category" className="block text-white font-semibold text-sm mb-2">Category <span className="text-red-400">*</span></label>
                <select
                  id="category"
                  value={category} onChange={(e) => setCategory(e.target.value as ResaleCategory)}
                  style={{ width: "100%", padding: "0.85rem 1rem", background: "rgba(0,0,0,0.2)", border: `1px solid ${errors.category ? "rgba(239,68,68,0.5)" : "rgba(167,184,176,0.2)"}`, borderRadius: "12px", color: category ? "#fff" : "rgba(167,184,176,0.5)", fontSize: "0.95rem", outline: "none", appearance: "none" }}
                >
                  <option value="" disabled style={{ background: "#0f1713", color: "rgba(167,184,176,0.5)" }}>Select category</option>
                  {(Object.entries(CATEGORY_LABELS) as [ResaleCategory, string][]).map(([val, label]) => (
                    <option key={val} value={val} style={{ background: "#0f1713", color: "#fff" }}>{label}</option>
                  ))}
                </select>
                {errors.category && <p className="text-red-400 text-xs mt-1.5 mb-0">{errors.category}</p>}
              </div>
              
              {/* Condition */}
              <div>
                <label htmlFor="condition" className="block text-white font-semibold text-sm mb-2">Condition <span className="text-red-400">*</span></label>
                <select
                  id="condition"
                  value={condition} onChange={(e) => setCondition(e.target.value as ResaleCondition)}
                  style={{ width: "100%", padding: "0.85rem 1rem", background: "rgba(0,0,0,0.2)", border: `1px solid ${errors.condition ? "rgba(239,68,68,0.5)" : "rgba(167,184,176,0.2)"}`, borderRadius: "12px", color: condition ? "#fff" : "rgba(167,184,176,0.5)", fontSize: "0.95rem", outline: "none", appearance: "none" }}
                >
                  <option value="" disabled style={{ background: "#0f1713", color: "rgba(167,184,176,0.5)" }}>Select condition</option>
                  {(Object.entries(CONDITION_LABELS) as [ResaleCondition, string][]).map(([val, label]) => (
                    <option key={val} value={val} style={{ background: "#0f1713", color: "#fff" }}>{label}</option>
                  ))}
                </select>
                {errors.condition && <p className="text-red-400 text-xs mt-1.5 mb-0">{errors.condition}</p>}
              </div>
            </div>

            {/* Description */}
            <div className="mb-2">
              <div className="flex justify-between items-baseline mb-2">
                <label htmlFor="desc" className="block text-white font-semibold text-sm">Description</label>
                <span className="text-[#A7B8B0]/50 text-xs">{description.length} / {MAX_DESC_LEN}</span>
              </div>
              <textarea
                id="desc" value={description} onChange={(e) => setDescription(e.target.value)}
                maxLength={MAX_DESC_LEN}
                placeholder="Share any additional details, flaws, or features..."
                style={{ width: "100%", minHeight: "130px", padding: "0.85rem 1rem", background: "rgba(0,0,0,0.2)", border: "1px solid rgba(167,184,176,0.2)", borderRadius: "12px", color: "#fff", fontSize: "0.95rem", outline: "none", resize: "vertical", fontFamily: "inherit", transition: "border-color 0.2s" }}
              />
            </div>
          </div>

          <div className="bg-[#0A0F0C]/60 border border-[#66FFB2]/15 rounded-2xl p-4 sm:p-7 mb-6">
            <h2 className="text-white text-base sm:text-lg font-bold m-0 mb-4">Pricing & Handover</h2>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5 mb-5">
              {/* Price */}
              <div>
                <label htmlFor="price" className="block text-white font-semibold text-sm mb-2">Selling Price (₹) <span className="text-red-400">*</span></label>
                <div style={{ position: "relative" }}>
                  <span style={{ position: "absolute", left: "1rem", top: "50%", transform: "translateY(-50%)", color: "rgba(167,184,176,0.6)", fontSize: "1rem", pointerEvents: "none" }}>₹</span>
                  <input
                    id="price" type="number" min="0" step="1"
                    value={price} onChange={(e) => setPrice(e.target.value)}
                    placeholder="0"
                    style={{ width: "100%", padding: "0.85rem 1rem 0.85rem 2rem", background: "rgba(0,0,0,0.2)", border: `1px solid ${errors.price ? "rgba(239,68,68,0.5)" : "rgba(167,184,176,0.2)"}`, borderRadius: "12px", color: "#00E676", fontSize: "1rem", fontWeight: 700, outline: "none" }}
                  />
                </div>
                {errors.price && <p className="text-red-400 text-xs mt-1.5 mb-0">{errors.price}</p>}
              </div>
              
              {/* Original Price */}
              <div>
                <label htmlFor="original_price" className="block text-white font-semibold text-sm mb-2">Original Price (Optional)</label>
                <div style={{ position: "relative" }}>
                  <span style={{ position: "absolute", left: "1rem", top: "50%", transform: "translateY(-50%)", color: "rgba(167,184,176,0.6)", fontSize: "1rem", pointerEvents: "none" }}>₹</span>
                  <input
                    id="original_price" type="number" min="0" step="1"
                    value={originalPrice} onChange={(e) => setOriginalPrice(e.target.value)}
                    placeholder="0"
                    style={{ width: "100%", padding: "0.85rem 1rem 0.85rem 2rem", background: "rgba(0,0,0,0.2)", border: `1px solid ${errors.original_price ? "rgba(239,68,68,0.5)" : "rgba(167,184,176,0.2)"}`, borderRadius: "12px", color: "#fff", fontSize: "1rem", outline: "none" }}
                  />
                </div>
                {errors.original_price && <p className="text-red-400 text-xs mt-1.5 mb-0">{errors.original_price}</p>}
              </div>
            </div>

            <div className="flex items-center gap-2.5 mb-5">
              <input
                type="checkbox" id="negotiable" checked={negotiable}
                onChange={(e) => setNegotiable(e.target.checked)}
                style={{ width: "18px", height: "18px", cursor: "pointer", accentColor: "#00E676" }}
              />
              <label htmlFor="negotiable" className="text-white text-sm cursor-pointer">Price is negotiable</label>
            </div>

            <div>
              <label htmlFor="location" className="block text-white font-semibold text-sm mb-2">Pickup Location (Optional)</label>
              <input
                id="location" type="text" maxLength={MAX_LOCATION_LEN}
                value={pickupLocation} onChange={(e) => setPickupLocation(e.target.value)}
                placeholder="e.g. Block C entrance, Library Cafe"
                style={{ width: "100%", padding: "0.85rem 1rem", background: "rgba(0,0,0,0.2)", border: `1px solid ${errors.pickup_location ? "rgba(239,68,68,0.5)" : "rgba(167,184,176,0.2)"}`, borderRadius: "12px", color: "#fff", fontSize: "0.95rem", outline: "none" }}
              />
              {errors.pickup_location && <p className="text-red-400 text-xs mt-1.5 mb-0">{errors.pickup_location}</p>}
            </div>
          </div>

          <div className="flex flex-col-reverse sm:flex-row gap-3 justify-end">
            <button
              type="button" onClick={() => router.back()} disabled={isSubmitting}
              className="w-full sm:w-auto px-6 py-3 bg-transparent border border-white/10 rounded-xl text-white font-semibold text-sm hover:bg-white/5 transition-colors cursor-pointer disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit" disabled={isSubmitting}
              className="w-full sm:w-auto px-8 py-3 bg-[#00E676] hover:bg-[#00E676]/90 border-none rounded-xl text-black font-extrabold text-sm shadow-[0_4px_20px_rgba(0,230,118,0.25)] transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isSubmitting ? (
                <><Loader2 size={18} className="animate-spin" /> Saving...</>
              ) : (
                "Save Changes"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
