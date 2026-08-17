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
    <div style={{ minHeight: "100vh", paddingTop: "2rem", paddingBottom: "4rem", paddingLeft: "1.5rem", paddingRight: "1.5rem" }}>
      <div style={{ maxWidth: "700px", margin: "0 auto" }}>
        
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "2.5rem" }}>
          <button onClick={() => router.back()} style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: "40px", height: "40px", borderRadius: "50%", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", color: "#A7B8B0", cursor: "pointer", transition: "all 0.2s" }} className="hover:bg-[rgba(255,255,255,0.1)] hover:text-white" aria-label="Go back">
            <ArrowLeft size={18} />
          </button>
          <h1 style={{ color: "#fff", fontWeight: 800, fontSize: "1.8rem", margin: 0, letterSpacing: "-0.02em" }}>Edit Listing</h1>
        </div>

        {errors.submit && (
          <div style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", borderRadius: "12px", padding: "1rem", marginBottom: "2rem", display: "flex", gap: "0.75rem", alignItems: "flex-start" }}>
            <AlertTriangle size={20} color="#ef4444" style={{ flexShrink: 0, marginTop: "2px" }} />
            <div>
              <h3 style={{ color: "#f87171", margin: "0 0 0.25rem", fontSize: "0.95rem", fontWeight: 600 }}>Update Failed</h3>
              <p style={{ color: "rgba(255,255,255,0.8)", margin: 0, fontSize: "0.9rem", lineHeight: 1.5 }}>{errors.submit}</p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate>
          {/* Note: Image editing is disabled in this phase for simplicity */}
          <div style={{ background: "rgba(10,15,12,0.6)", border: "1px solid rgba(102,255,178,0.15)", borderRadius: "20px", padding: "2rem", marginBottom: "2rem" }}>
            <p style={{ margin: "0 0 1rem", color: "rgba(167,184,176,0.8)", fontSize: "0.9rem" }}>
              <strong>Note:</strong> Photo editing is currently disabled. To change photos, please create a new listing.
            </p>
            
            {/* Status */}
            <div style={{ marginBottom: "1.5rem" }}>
              <label htmlFor="status" style={{ display: "block", color: "#fff", fontWeight: 600, fontSize: "0.95rem", marginBottom: "0.6rem" }}>Status</label>
              <select
                id="status"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                style={{ width: "100%", padding: "1rem 1.25rem", background: "rgba(0,0,0,0.2)", border: "1px solid rgba(167,184,176,0.2)", borderRadius: "12px", color: "#fff", fontSize: "1rem", outline: "none", appearance: "none" }}
              >
                {(Object.entries(STATUS_LABELS)).map(([val, label]) => (
                  <option key={val} value={val} style={{ background: "#0f1713", color: "#fff" }}>{label}</option>
                ))}
              </select>
              <p style={{ margin: "0.4rem 0 0", color: "rgba(167,184,176,0.6)", fontSize: "0.8rem" }}>
                Active can move to Reserved/Sold/Removed. Sold/Removed cannot be moved back.
              </p>
            </div>

            {/* Title */}
            <div style={{ marginBottom: "1.5rem" }}>
              <label htmlFor="title" style={{ display: "block", color: "#fff", fontWeight: 600, fontSize: "0.95rem", marginBottom: "0.6rem" }}>Title <span style={{ color: "#ef4444" }}>*</span></label>
              <input
                id="title" type="text"
                value={title} onChange={(e) => setTitle(e.target.value)}
                maxLength={MAX_TITLE_LEN}
                placeholder="e.g. Introduction to Algorithms 3rd Ed."
                style={{ width: "100%", padding: "1rem 1.25rem", background: "rgba(0,0,0,0.2)", border: `1px solid ${errors.title ? "rgba(239,68,68,0.5)" : "rgba(167,184,176,0.2)"}`, borderRadius: "12px", color: "#fff", fontSize: "1rem", outline: "none", transition: "border-color 0.2s" }}
              />
              {errors.title && <p style={{ color: "#ef4444", fontSize: "0.85rem", margin: "0.5rem 0 0" }}>{errors.title}</p>}
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem", marginBottom: "1.5rem" }}>
              {/* Category */}
              <div>
                <label htmlFor="category" style={{ display: "block", color: "#fff", fontWeight: 600, fontSize: "0.95rem", marginBottom: "0.6rem" }}>Category <span style={{ color: "#ef4444" }}>*</span></label>
                <select
                  id="category"
                  value={category} onChange={(e) => setCategory(e.target.value as ResaleCategory)}
                  style={{ width: "100%", padding: "1rem 1.25rem", background: "rgba(0,0,0,0.2)", border: `1px solid ${errors.category ? "rgba(239,68,68,0.5)" : "rgba(167,184,176,0.2)"}`, borderRadius: "12px", color: category ? "#fff" : "rgba(167,184,176,0.5)", fontSize: "1rem", outline: "none", appearance: "none" }}
                >
                  <option value="" disabled style={{ background: "#0f1713", color: "rgba(167,184,176,0.5)" }}>Select category</option>
                  {(Object.entries(CATEGORY_LABELS) as [ResaleCategory, string][]).map(([val, label]) => (
                    <option key={val} value={val} style={{ background: "#0f1713", color: "#fff" }}>{label}</option>
                  ))}
                </select>
                {errors.category && <p style={{ color: "#ef4444", fontSize: "0.85rem", margin: "0.5rem 0 0" }}>{errors.category}</p>}
              </div>
              
              {/* Condition */}
              <div>
                <label htmlFor="condition" style={{ display: "block", color: "#fff", fontWeight: 600, fontSize: "0.95rem", marginBottom: "0.6rem" }}>Condition <span style={{ color: "#ef4444" }}>*</span></label>
                <select
                  id="condition"
                  value={condition} onChange={(e) => setCondition(e.target.value as ResaleCondition)}
                  style={{ width: "100%", padding: "1rem 1.25rem", background: "rgba(0,0,0,0.2)", border: `1px solid ${errors.condition ? "rgba(239,68,68,0.5)" : "rgba(167,184,176,0.2)"}`, borderRadius: "12px", color: condition ? "#fff" : "rgba(167,184,176,0.5)", fontSize: "1rem", outline: "none", appearance: "none" }}
                >
                  <option value="" disabled style={{ background: "#0f1713", color: "rgba(167,184,176,0.5)" }}>Select condition</option>
                  {(Object.entries(CONDITION_LABELS) as [ResaleCondition, string][]).map(([val, label]) => (
                    <option key={val} value={val} style={{ background: "#0f1713", color: "#fff" }}>{label}</option>
                  ))}
                </select>
                {errors.condition && <p style={{ color: "#ef4444", fontSize: "0.85rem", margin: "0.5rem 0 0" }}>{errors.condition}</p>}
              </div>
            </div>

            {/* Description */}
            <div style={{ marginBottom: "1.5rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: "0.6rem" }}>
                <label htmlFor="desc" style={{ display: "block", color: "#fff", fontWeight: 600, fontSize: "0.95rem" }}>Description</label>
                <span style={{ color: "rgba(167,184,176,0.5)", fontSize: "0.8rem" }}>{description.length} / {MAX_DESC_LEN}</span>
              </div>
              <textarea
                id="desc" value={description} onChange={(e) => setDescription(e.target.value)}
                maxLength={MAX_DESC_LEN}
                placeholder="Share any additional details, flaws, or features..."
                style={{ width: "100%", minHeight: "140px", padding: "1rem 1.25rem", background: "rgba(0,0,0,0.2)", border: "1px solid rgba(167,184,176,0.2)", borderRadius: "12px", color: "#fff", fontSize: "1rem", outline: "none", resize: "vertical", fontFamily: "inherit", transition: "border-color 0.2s" }}
              />
            </div>
          </div>

          <div style={{ background: "rgba(10,15,12,0.6)", border: "1px solid rgba(102,255,178,0.15)", borderRadius: "20px", padding: "2rem", marginBottom: "2.5rem" }}>
            <h2 style={{ color: "#fff", fontSize: "1.2rem", fontWeight: 700, margin: "0 0 1.5rem" }}>Pricing & Handover</h2>
            
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem", marginBottom: "1.5rem" }}>
              {/* Price */}
              <div>
                <label htmlFor="price" style={{ display: "block", color: "#fff", fontWeight: 600, fontSize: "0.95rem", marginBottom: "0.6rem" }}>Selling Price (₹) <span style={{ color: "#ef4444" }}>*</span></label>
                <div style={{ position: "relative" }}>
                  <span style={{ position: "absolute", left: "1.25rem", top: "50%", transform: "translateY(-50%)", color: "rgba(167,184,176,0.6)", fontSize: "1rem", pointerEvents: "none" }}>₹</span>
                  <input
                    id="price" type="number" min="0" step="1"
                    value={price} onChange={(e) => setPrice(e.target.value)}
                    placeholder="0"
                    style={{ width: "100%", padding: "1rem 1.25rem 1rem 2.25rem", background: "rgba(0,0,0,0.2)", border: `1px solid ${errors.price ? "rgba(239,68,68,0.5)" : "rgba(167,184,176,0.2)"}`, borderRadius: "12px", color: "#00E676", fontSize: "1.1rem", fontWeight: 700, outline: "none" }}
                  />
                </div>
                {errors.price && <p style={{ color: "#ef4444", fontSize: "0.85rem", margin: "0.5rem 0 0" }}>{errors.price}</p>}
              </div>
              
              {/* Original Price */}
              <div>
                <label htmlFor="original_price" style={{ display: "block", color: "#fff", fontWeight: 600, fontSize: "0.95rem", marginBottom: "0.6rem" }}>Original Price (Optional)</label>
                <div style={{ position: "relative" }}>
                  <span style={{ position: "absolute", left: "1.25rem", top: "50%", transform: "translateY(-50%)", color: "rgba(167,184,176,0.6)", fontSize: "1rem", pointerEvents: "none" }}>₹</span>
                  <input
                    id="original_price" type="number" min="0" step="1"
                    value={originalPrice} onChange={(e) => setOriginalPrice(e.target.value)}
                    placeholder="0"
                    style={{ width: "100%", padding: "1rem 1.25rem 1rem 2.25rem", background: "rgba(0,0,0,0.2)", border: `1px solid ${errors.original_price ? "rgba(239,68,68,0.5)" : "rgba(167,184,176,0.2)"}`, borderRadius: "12px", color: "#fff", fontSize: "1rem", outline: "none" }}
                  />
                </div>
                {errors.original_price && <p style={{ color: "#ef4444", fontSize: "0.85rem", margin: "0.5rem 0 0" }}>{errors.original_price}</p>}
              </div>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "2rem" }}>
              <input
                type="checkbox" id="negotiable" checked={negotiable}
                onChange={(e) => setNegotiable(e.target.checked)}
                style={{ width: "18px", height: "18px", cursor: "pointer", accentColor: "#00E676" }}
              />
              <label htmlFor="negotiable" style={{ color: "#fff", fontSize: "0.95rem", cursor: "pointer" }}>Price is negotiable</label>
            </div>

            <div>
              <label htmlFor="location" style={{ display: "block", color: "#fff", fontWeight: 600, fontSize: "0.95rem", marginBottom: "0.6rem" }}>Pickup Location (Optional)</label>
              <input
                id="location" type="text" maxLength={MAX_LOCATION_LEN}
                value={pickupLocation} onChange={(e) => setPickupLocation(e.target.value)}
                placeholder="e.g. Block C entrance, Library Cafe"
                style={{ width: "100%", padding: "1rem 1.25rem", background: "rgba(0,0,0,0.2)", border: `1px solid ${errors.pickup_location ? "rgba(239,68,68,0.5)" : "rgba(167,184,176,0.2)"}`, borderRadius: "12px", color: "#fff", fontSize: "1rem", outline: "none" }}
              />
              {errors.pickup_location && <p style={{ color: "#ef4444", fontSize: "0.85rem", margin: "0.5rem 0 0" }}>{errors.pickup_location}</p>}
            </div>
          </div>

          <div style={{ display: "flex", gap: "1rem", justifyContent: "flex-end" }}>
            <button
              type="button" onClick={() => router.back()} disabled={isSubmitting}
              style={{ padding: "0.9rem 2rem", background: "transparent", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "12px", color: "#fff", fontWeight: 600, fontSize: "1rem", cursor: isSubmitting ? "not-allowed" : "pointer", opacity: isSubmitting ? 0.5 : 1 }}
              className="hover:bg-white/5 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit" disabled={isSubmitting}
              style={{ display: "flex", alignItems: "center", gap: "0.5rem", padding: "0.9rem 2.5rem", background: "linear-gradient(135deg, #00C853 0%, #00E676 100%)", border: "none", borderRadius: "12px", color: "#050A07", fontWeight: 800, fontSize: "1rem", cursor: isSubmitting ? "not-allowed" : "pointer", opacity: isSubmitting ? 0.8 : 1, boxShadow: "0 4px 20px rgba(0,230,118,0.25)" }}
              className="hover:scale-105 hover:shadow-[0_6px_28px_rgba(0,230,118,0.35)] transition-all"
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
