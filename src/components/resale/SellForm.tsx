"use client";

/**
 * SellForm — Sell an Item form for UniVerse Resale.
 *
 * Responsibilities:
 *   - Collect listing details (title, description, category, condition, price,
 *     original_price, negotiable, pickup_location).
 *   - Allow up to 6 images with drag-to-reorder, preview, and per-image removal.
 *   - Validate all fields client-side for immediate feedback.
 *   - On submit:
 *       1. validateCreateListingInput() via Phase 1C.
 *       2. createResaleListing() → get listingId.
 *       3. uploadResaleListingImage() for each file.
 *       4. On any image-upload failure → attempt deleteAllListingImages() cleanup.
 *       5. Navigate to /dashboard/marketplace on success.
 *   - Never accept seller_id from client; auth comes from the Supabase session.
 *   - Never expose SQL / Supabase internal errors to the user.
 *
 * Security:
 *   - No direct Supabase calls — all operations via Phase 1C service layer.
 *   - createClient() uses the publishable key only.
 *   - All auth is validated server-side inside each service function.
 */

import {
  useState,
  useRef,
  useEffect,
  type ChangeEvent,
  type DragEvent,
} from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Camera,
  X,
  CheckCircle2,
  GripVertical,
  AlertTriangle,
  Loader2,
  Eye,
  Sparkles,
  ShieldCheck,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import {
  createResaleListing,
  deleteResaleListing,
  uploadResaleListingImage,
  deleteAllListingImages,
  validateImageFile,
  VALID_CATEGORIES,
  VALID_CONDITIONS,
  MAX_IMAGES_PER_LISTING,
  ALLOWED_IMAGE_MIME_TYPES,
  ResaleServiceError,
  type ResaleCategory,
  type ResaleCondition,
  type CreateResaleListingInput,
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

const CATEGORY_ICONS: Record<ResaleCategory, string> = {
  books: "📚",
  electronics: "💻",
  study_materials: "📝",
  hostel: "🛏️",
  sports: "⚽",
  furniture: "🪑",
  clothing: "👕",
  gaming: "🎮",
  other: "✨",
};

const POPULAR_PRICE_PRESETS = [50, 100, 200, 500, 1000];

const POPULAR_CAMPUS_LOCATIONS = [
  "Main Library",
  "Hostel Block D",
  "Hostel Block B",
  "Central Canteen",
  "Engineering Block",
  "Campus Main Gate",
];

const CONDITION_LABELS: Record<ResaleCondition, string> = {
  new: "New",
  like_new: "Like New",
  good: "Good",
  fair: "Fair",
};

const CONDITION_DESCRIPTIONS: Record<ResaleCondition, string> = {
  new: "Brand new, unused",
  like_new: "Barely used, excellent condition",
  good: "Some signs of use, fully functional",
  fair: "Noticeable wear, works as expected",
};

const MAX_TITLE_LEN = 200;
const MAX_DESC_LEN = 5000;
const MAX_LOCATION_LEN = 300;

// ─── Types ────────────────────────────────────────────────────────────────────

interface ImageEntry {
  /** Browser object URL for preview. Cleaned up on remove / unmount. */
  previewUrl: string;
  file: File;
  /** Client-side validation error, if any. */
  error: string | null;
}

interface FormErrors {
  title?: string;
  category?: string;
  condition?: string;
  price?: string;
  original_price?: string;
  pickup_location?: string;
  images?: string;
  submit?: string;
}

// ─── Helper ───────────────────────────────────────────────────────────────────

function friendlyError(err: unknown): string {
  if (err instanceof ResaleServiceError) {
    switch (err.code) {
      case "UNAUTHENTICATED":
        return "Please sign in to publish a listing.";
      case "VALIDATION_ERROR":
        return `Validation failed: ${err.message}`;
      case "STORAGE_ERROR":
        return "Image upload failed. Please try again.";
      case "DATABASE_ERROR":
        return "We couldn't save your listing. Please try again.";
      default:
        return "Something went wrong. Please try again.";
    }
  }
  return "We couldn't publish your listing. Please try again.";
}

// ─── Component ────────────────────────────────────────────────────────────────

export function SellForm() {
  const router = useRouter();

  // ── Form state ──
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<ResaleCategory | "">("");
  const [condition, setCondition] = useState<ResaleCondition | "">("");
  const [price, setPrice] = useState("");
  const [originalPrice, setOriginalPrice] = useState("");
  const [negotiable, setNegotiable] = useState(false);
  const [pickupLocation, setPickupLocation] = useState("");

  // ── Image state ──
  const [images, setImages] = useState<ImageEntry[]>([]);
  const [isDraggingOver, setIsDraggingOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ── Drag-to-reorder state ──
  const dragIndexRef = useRef<number | null>(null);

  // ── Submission state ──
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const submittingRef = useRef(false); // prevents duplicate submission

  // ── Preview mode ──
  const [showPreview, setShowPreview] = useState(false);

  // Clean up preview URLs on unmount
  useEffect(() => {
    return () => {
      images.forEach((img) => URL.revokeObjectURL(img.previewUrl));
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ─── Image selection ─────────────────────────────────────────────────────────

  function processFiles(files: FileList | File[]) {
    const incoming = Array.from(files);

    if (images.length + incoming.length > MAX_IMAGES_PER_LISTING) {
      setErrors((prev) => ({
        ...prev,
        images: `You can upload up to ${MAX_IMAGES_PER_LISTING} photos. Remove some before adding more.`,
      }));
      return;
    }

    const newEntries: ImageEntry[] = incoming.map((file) => {
      let error: string | null = null;
      try {
        validateImageFile(file);
      } catch (e) {
        if (e instanceof ResaleServiceError) {
          error = e.message;
        } else {
          error = "This file could not be accepted.";
        }
      }
      return {
        previewUrl: URL.createObjectURL(file),
        file,
        error,
      };
    });

    setImages((prev) => [...prev, ...newEntries]);
    setErrors((prev) => ({ ...prev, images: undefined }));
  }

  function handleFileInputChange(e: ChangeEvent<HTMLInputElement>) {
    if (e.target.files && e.target.files.length > 0) {
      processFiles(e.target.files);
    }
    // Reset so the same file can be re-selected after removal
    e.target.value = "";
  }

  function handleDropZoneDrop(e: DragEvent<HTMLDivElement>) {
    e.preventDefault();
    setIsDraggingOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFiles(e.dataTransfer.files);
    }
  }

  function removeImage(index: number) {
    setImages((prev) => {
      URL.revokeObjectURL(prev[index].previewUrl);
      return prev.filter((_, i) => i !== index);
    });
  }

  // ── Drag-to-reorder ──
  function handleDragStart(index: number) {
    dragIndexRef.current = index;
  }

  function handleDragEnterCard(targetIndex: number) {
    const from = dragIndexRef.current;
    if (from === null || from === targetIndex) return;
    setImages((prev) => {
      const next = [...prev];
      const [moved] = next.splice(from, 1);
      next.splice(targetIndex, 0, moved);
      return next;
    });
    dragIndexRef.current = targetIndex;
  }

  // ─── Client validation ────────────────────────────────────────────────────────

  function validate(): boolean {
    const next: FormErrors = {};

    if (!title.trim()) {
      next.title = "Please enter an item title.";
    } else if (title.trim().length > MAX_TITLE_LEN) {
      next.title = `Title must be ${MAX_TITLE_LEN} characters or less.`;
    }

    if (!category) {
      next.category = "Please select a category.";
    }

    if (!condition) {
      next.condition = "Please select the item condition.";
    }

    const priceNum = parseFloat(price);
    if (!price.trim()) {
      next.price = "Please enter a selling price.";
    } else if (isNaN(priceNum) || priceNum < 0) {
      next.price = "Please enter a valid price (0 or above).";
    }

    if (originalPrice.trim()) {
      const opNum = parseFloat(originalPrice);
      if (isNaN(opNum) || opNum < 0) {
        next.original_price = "Please enter a valid original price (0 or above).";
      } else if (opNum < priceNum) {
        next.original_price = "Original price should be ≥ selling price.";
      }
    }

    if (pickupLocation.trim().length > MAX_LOCATION_LEN) {
      next.pickup_location = `Location must be ${MAX_LOCATION_LEN} characters or less.`;
    }

    // Images: allow 0 (photos are optional in schema) but flag any per-image errors
    const hasImageErrors = images.some((img) => img.error !== null);
    if (hasImageErrors) {
      next.images = "One or more images have errors. Remove them and try again.";
    }

    setErrors(next);
    return Object.keys(next).length === 0;
  }

  // ─── Submit ───────────────────────────────────────────────────────────────────

  async function handleSubmit() {
    if (submittingRef.current) return; // duplicate-click guard
    if (!validate()) return;

    submittingRef.current = true;
    setIsSubmitting(true);
    setErrors({});

    const supabase = createClient();

    try {
      // Build service input (no seller_id — service derives from auth.uid())
      const input: CreateResaleListingInput = {
        title: title.trim(),
        description: description.trim() || null,
        category: category as ResaleCategory,
        condition: condition as ResaleCondition,
        price: parseFloat(price),
        original_price: originalPrice.trim() ? parseFloat(originalPrice) : null,
        negotiable,
        pickup_location: pickupLocation.trim() || null,
      };

      // 1. Create listing (auth verified inside service)
      const listing = await createResaleListing(supabase, input);

      // 2. Upload images sequentially (max 6, service enforces DB-level limit too)
      const validImages = images.filter((img) => img.error === null);
      let uploadFailed = false;

      for (let i = 0; i < validImages.length; i++) {
        try {
          await uploadResaleListingImage(supabase, listing.id, validImages[i].file, i);
        } catch (imgErr) {
          console.error("[SellForm] Image upload failed:", imgErr);
          uploadFailed = true;
          // Attempt to clean up already-uploaded images for this listing
          try {
            await deleteAllListingImages(supabase, listing.id);
          } catch (cleanupErr) {
            console.error("[SellForm] Image cleanup failed:", cleanupErr);
          }
          // PHASE 2B FIX: Delete the orphaned parent listing
          try {
            await deleteResaleListing(supabase, listing.id);
          } catch (deleteErr) {
            console.error("[SellForm] Orphan listing cleanup failed:", deleteErr);
          }
          setErrors({
            submit: "One or more images could not be uploaded. Please remove them and try again.",
          });
          break;
        }
      }

      if (!uploadFailed) {
        setIsSuccess(true);
        // Brief success pause so the user sees the confirmation, then navigate
        await new Promise((r) => setTimeout(r, 1200));
        router.push(`/dashboard/marketplace/${listing.id}`);
      }
    } catch (err) {
      console.error("[SellForm] Submit error:", err);
      setErrors({ submit: friendlyError(err) });
    } finally {
      setIsSubmitting(false);
      submittingRef.current = false;
    }
  }

  // ─── Derived ──────────────────────────────────────────────────────────────────

  const priceNum = parseFloat(price) || 0;
  const originalPriceNum = parseFloat(originalPrice) || 0;
  const discountPct =
    originalPriceNum > priceNum && priceNum > 0
      ? Math.round(((originalPriceNum - priceNum) / originalPriceNum) * 100)
      : null;

  const validImages = images.filter((img) => img.error === null);

  // ─── Render ───────────────────────────────────────────────────────────────────

  if (isSuccess) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "60vh" }}>
        <div style={{ textAlign: "center" }}>
          <div style={{
            width: "72px", height: "72px", borderRadius: "50%",
            background: "rgba(0,230,118,0.12)", border: "2px solid #00E676",
            display: "flex", alignItems: "center", justifyContent: "center",
            margin: "0 auto 1.5rem",
          }}>
            <CheckCircle2 size={32} color="#00E676" />
          </div>
          <h2 style={{ color: "#fff", fontSize: "1.4rem", fontWeight: 800, marginBottom: "0.5rem" }}>
            Listing Published!
          </h2>
          <p style={{ color: "rgba(167,184,176,0.7)", fontSize: "0.9rem" }}>
            Your item is now live on UniVerse Resale.
          </p>
          <p style={{ color: "rgba(167,184,176,0.4)", fontSize: "0.8rem", marginTop: "0.75rem" }}>
            Redirecting you to your listing...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#060a08] relative overflow-hidden py-4 sm:py-8 pb-24 selection:bg-emerald-500/30">
      {/* Ambient Stardust & Nebula Glows */}
      <div className="absolute inset-0 bg-[radial-gradient(#10b98110_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none opacity-50" />
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/3 -right-40 w-96 h-96 bg-teal-500/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 left-1/3 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-[1100px] mx-auto px-3 sm:px-6 lg:px-8 relative z-10">

        {/* ── Back + Header ── */}
        <div className="mb-6 sm:mb-8">
          <div className="flex items-center gap-2 mb-3">
            <Link href="/dashboard/marketplace" className="no-underline">
              <button className="flex items-center gap-1.5 bg-transparent border-none text-[#A7B8B0]/70 hover:text-white text-xs sm:text-sm font-semibold cursor-pointer py-1 transition-colors"
                aria-label="Back to UniVerse Resale"
              >
                <ArrowLeft size={15} />
                Back to UniVerse Resale
              </button>
            </Link>
          </div>

          <h1 className="text-white text-2xl sm:text-3xl font-extrabold m-0 mb-1.5 tracking-tight flex items-center gap-2.5">
            <span>Sell an Item</span>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 font-bold uppercase tracking-wider">
              Student Resale
            </span>
          </h1>
          <p className="text-[#A7B8B0]/70 text-xs sm:text-sm m-0">
            Turn things you no longer need into value for another student.
          </p>
        </div>

      {/* ── Global submit error ── */}
      {errors.submit && (
        <div className="flex items-start gap-3 bg-red-500/10 border border-red-500/30 rounded-2xl p-4 sm:p-5 mb-6" role="alert">
          <AlertTriangle size={18} className="text-red-400 shrink-0 mt-0.5" />
          <p className="text-red-400 text-xs sm:text-sm m-0">{errors.submit}</p>
        </div>
      )}

      {/* ── Two-column layout ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-7 items-start">

        {/* ════════════════════════════════════════════════════════════════════════
            LEFT: Photos
        ═══════════════════════════════════════════════════════════════════════ */}
        <section aria-label="Listing photos">
          <SectionCard title="Photos" subtitle={`Add up to ${MAX_IMAGES_PER_LISTING} photos — first photo is the cover.`}>

            {/* Image grid */}
            {images.length > 0 && (
              <div style={{
                display: "grid",
                gridTemplateColumns: "repeat(3, 1fr)",
                gap: "0.6rem",
                marginBottom: "0.75rem",
              }}>
                {images.map((img, index) => (
                  <div
                    key={img.previewUrl}
                    draggable
                    onDragStart={() => handleDragStart(index)}
                    onDragEnter={() => handleDragEnterCard(index)}
                    onDragOver={(e) => e.preventDefault()}
                    style={{
                      position: "relative",
                      aspectRatio: "1",
                      borderRadius: "10px",
                      overflow: "hidden",
                      border: img.error
                        ? "2px solid rgba(239,68,68,0.5)"
                        : index === 0
                          ? "2px solid #00E676"
                          : "2px solid rgba(102,255,178,0.1)",
                      cursor: "grab",
                      userSelect: "none",
                    }}
                    title={img.error ?? (index === 0 ? "Cover photo" : `Photo ${index + 1}`)}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={img.previewUrl}
                      alt={`Listing photo ${index + 1}`}
                      style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
                    />

                    {/* Drag handle */}
                    <div style={{
                      position: "absolute", top: "4px", left: "4px",
                      background: "rgba(0,0,0,0.5)", borderRadius: "4px",
                      padding: "2px", display: "flex", alignItems: "center",
                    }}>
                      <GripVertical size={12} color="rgba(255,255,255,0.7)" />
                    </div>

                    {/* Cover badge */}
                    {index === 0 && !img.error && (
                      <div style={{
                        position: "absolute", bottom: "4px", left: "4px",
                        background: "#00E676", color: "#050A07",
                        fontSize: "0.55rem", fontWeight: 800,
                        padding: "2px 5px", borderRadius: "4px",
                        textTransform: "uppercase", letterSpacing: "0.04em",
                      }}>Cover</div>
                    )}

                    {/* Error badge */}
                    {img.error && (
                      <div style={{
                        position: "absolute", inset: 0,
                        background: "rgba(239,68,68,0.5)",
                        display: "flex", alignItems: "center", justifyContent: "center",
                      }}>
                        <AlertTriangle size={20} color="#fff" />
                      </div>
                    )}

                    {/* Remove button */}
                    <button
                      onClick={() => removeImage(index)}
                      style={{
                        position: "absolute", top: "4px", right: "4px",
                        background: "rgba(0,0,0,0.65)", border: "none",
                        borderRadius: "5px", width: "22px", height: "22px",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        cursor: "pointer", transition: "background 0.15s ease",
                      }}
                      className="hover:bg-[rgba(239,68,68,0.8)]"
                      aria-label={`Remove photo ${index + 1}`}
                    >
                      <X size={12} color="#fff" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Error message for images */}
            {images.some((img) => img.error) && (
              <p style={{ color: "#f87171", fontSize: "0.8rem", marginBottom: "0.75rem" }} role="alert">
                {images.find((img) => img.error)?.error}
              </p>
            )}
            {errors.images && (
              <p style={{ color: "#f87171", fontSize: "0.8rem", marginBottom: "0.75rem" }} role="alert">
                {errors.images}
              </p>
            )}

            {/* Drop zone / add button */}
            {images.length < MAX_IMAGES_PER_LISTING && (
              <div
                role="button"
                tabIndex={0}
                aria-label="Add photos — click or drag and drop"
                onClick={() => fileInputRef.current?.click()}
                onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") fileInputRef.current?.click(); }}
                onDragOver={(e) => { e.preventDefault(); setIsDraggingOver(true); }}
                onDragLeave={() => setIsDraggingOver(false)}
                onDrop={handleDropZoneDrop}
                style={{
                  border: `2px dashed ${isDraggingOver ? "#00E676" : "rgba(102,255,178,0.2)"}`,
                  borderRadius: "14px",
                  padding: "2rem 1rem",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: "0.6rem",
                  cursor: "pointer",
                  background: isDraggingOver ? "rgba(0,230,118,0.06)" : "rgba(5,10,7,0.3)",
                  transition: "all 0.18s ease",
                }}
                className="hover:border-[rgba(0,230,118,0.4)] hover:bg-[rgba(0,230,118,0.04)]"
              >
                <div style={{
                  width: "44px", height: "44px", borderRadius: "12px",
                  background: "rgba(0,230,118,0.1)", border: "1px solid rgba(0,230,118,0.2)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  <Camera size={20} color="#00E676" />
                </div>
                <div style={{ textAlign: "center" }}>
                  <p style={{ color: "#fff", fontSize: "0.875rem", fontWeight: 600, margin: "0 0 0.25rem" }}>
                    {images.length === 0 ? "Add Photos" : `Add More (${MAX_IMAGES_PER_LISTING - images.length} remaining)`}
                  </p>
                  <p style={{ color: "rgba(167,184,176,0.5)", fontSize: "0.75rem", margin: 0 }}>
                    Click or drag and drop
                  </p>
                  <p style={{ color: "rgba(167,184,176,0.4)", fontSize: "0.72rem", margin: "0.35rem 0 0" }}>
                    JPG, PNG, WebP · max 5 MB each
                  </p>
                </div>
              </div>
            )}

            <input
              ref={fileInputRef}
              type="file"
              id="image-upload-input"
              accept={ALLOWED_IMAGE_MIME_TYPES.join(",")}
              multiple
              onChange={handleFileInputChange}
              style={{ display: "none" }}
              aria-hidden="true"
            />

            {images.length >= MAX_IMAGES_PER_LISTING && (
              <p style={{ color: "rgba(167,184,176,0.5)", fontSize: "0.78rem", textAlign: "center", marginTop: "0.5rem" }}>
                Maximum {MAX_IMAGES_PER_LISTING} photos reached.
              </p>
            )}
          </SectionCard>

          {/* Seller Pro-Tips Card */}
          <div className="mt-5 p-5 rounded-2xl bg-[#0c1410]/80 border border-white/10 backdrop-blur-md shadow-sm">
            <h3 className="text-sm font-bold text-white flex items-center gap-2 mb-3">
              <Sparkles className="w-4 h-4 text-emerald-400" />
              <span>Seller Pro-Tips for Fast Sales</span>
            </h3>
            <ul className="space-y-2.5 text-xs text-white/60">
              <li className="flex items-start gap-2">
                <span className="text-emerald-400 font-bold">☀️</span>
                <span><strong className="text-white/80">Good Lighting:</strong> Photos taken in natural desk light get 80% more peer inquiries.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-400 font-bold">📐</span>
                <span><strong className="text-white/80">All Angles:</strong> Show book covers, page edges, or gadget screens turned on.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-400 font-bold">🤝</span>
                <span><strong className="text-white/80">Honesty Wins:</strong> Note any highlights or marks early to build high campus trust.</span>
              </li>
            </ul>
          </div>

          {/* Campus Trust Banner */}
          <div className="mt-4 p-4 rounded-2xl bg-emerald-500/5 border border-emerald-500/20 backdrop-blur-md flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center shrink-0 text-emerald-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-emerald-300 m-0">Zero Fees · 100% Yours</p>
              <p className="text-[11px] text-white/50 m-0 mt-0.5">Meet at hostel gates or book a UniVerse runner for room delivery.</p>
            </div>
          </div>
        </section>

        {/* ════════════════════════════════════════════════════════════════════════
            RIGHT: Listing Details
        ═══════════════════════════════════════════════════════════════════════ */}
        <section aria-label="Listing details">
          <SectionCard title="Listing Details">

            {/* ── Title ── */}
            <FieldGroup label="Title" htmlFor="sell-title" required error={errors.title}>
              <input
                id="sell-title"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                maxLength={MAX_TITLE_LEN}
                placeholder="e.g. Engineering Maths Textbook (3rd Year)"
                aria-required="true"
                aria-describedby={errors.title ? "sell-title-err" : undefined}
                aria-invalid={!!errors.title}
                style={inputStyle(!!errors.title)}
              />
              <div style={{ display: "flex", justifyContent: "space-between", marginTop: "0.3rem" }}>
                {errors.title ? (
                  <span id="sell-title-err" style={errorTextStyle} role="alert">{errors.title}</span>
                ) : <span />}
                <span style={{ color: title.length > MAX_TITLE_LEN * 0.9 ? "#f87171" : "rgba(167,184,176,0.4)", fontSize: "0.72rem" }}>
                  {title.length}/{MAX_TITLE_LEN}
                </span>
              </div>
            </FieldGroup>

            {/* ── Category ── */}
            <FieldGroup label="Category" htmlFor="sell-category" required error={errors.category}>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {VALID_CATEGORIES.map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setCategory(cat)}
                    aria-pressed={category === cat}
                    className={`flex items-center justify-center gap-1.5 p-2.5 rounded-xl text-xs font-semibold cursor-pointer transition-all border ${
                      category === cat
                        ? "bg-emerald-500/20 border-emerald-500/50 text-emerald-300 shadow-[0_0_12px_rgba(16,185,129,0.25)] font-bold"
                        : "bg-[#090f0c] border-white/10 text-white/70 hover:text-white hover:border-white/20 hover:bg-white/5"
                    }`}
                  >
                    <span>{CATEGORY_ICONS[cat]}</span>
                    <span>{CATEGORY_LABELS[cat]}</span>
                  </button>
                ))}
              </div>
              {errors.category && (
                <span style={errorTextStyle} role="alert">{errors.category}</span>
              )}
            </FieldGroup>

            {/* ── Condition ── */}
            <FieldGroup label="Condition" htmlFor="sell-condition" required error={errors.condition}>
              <div className="flex flex-col gap-2">
                {VALID_CONDITIONS.map((cond) => (
                  <button
                    key={cond}
                    type="button"
                    onClick={() => setCondition(cond)}
                    aria-pressed={condition === cond}
                    className={`flex items-center justify-between p-3 rounded-xl border text-left cursor-pointer transition-all ${
                      condition === cond
                        ? "bg-emerald-500/15 border-emerald-500/45 shadow-[0_0_12px_rgba(16,185,129,0.2)]"
                        : "bg-[#090f0c] border-white/10 hover:border-white/20 hover:bg-white/5"
                    }`}
                  >
                    <span>
                      <span className={`block text-sm font-bold ${condition === cond ? "text-emerald-300" : "text-white"}`}>
                        {CONDITION_LABELS[cond]}
                      </span>
                      <span className="block text-xs text-white/50 mt-0.5">
                        {CONDITION_DESCRIPTIONS[cond]}
                      </span>
                    </span>
                    {condition === cond && <CheckCircle2 size={18} className="text-emerald-400 shrink-0" />}
                  </button>
                ))}
              </div>
              {errors.condition && (
                <span style={errorTextStyle} role="alert">{errors.condition}</span>
              )}
            </FieldGroup>

            {/* ── Price ── */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <FieldGroup label="Selling Price (₹)" htmlFor="sell-price" required error={errors.price}>
                <div style={{ position: "relative" }}>
                  <span style={{ position: "absolute", left: "0.85rem", top: "50%", transform: "translateY(-50%)", color: "rgba(167,184,176,0.5)", fontSize: "0.9rem", pointerEvents: "none" }}>₹</span>
                  <input
                    id="sell-price"
                    type="number"
                    min={0}
                    step={0.01}
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    placeholder="0"
                    aria-required="true"
                    aria-describedby={errors.price ? "sell-price-err" : undefined}
                    aria-invalid={!!errors.price}
                    style={{ ...inputStyle(!!errors.price), paddingLeft: "1.8rem" }}
                  />
                </div>
                {/* Price Presets */}
                <div className="flex items-center gap-1.5 mt-2 flex-wrap">
                  <span className="text-[11px] text-white/40 font-medium">Quick presets:</span>
                  {POPULAR_PRICE_PRESETS.map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => setPrice(preset.toString())}
                      className="px-2 py-0.5 rounded-lg bg-white/5 hover:bg-emerald-500/15 border border-white/10 hover:border-emerald-500/30 text-[11px] text-white/70 hover:text-emerald-300 font-medium transition-colors cursor-pointer"
                    >
                      ₹{preset}
                    </button>
                  ))}
                </div>
                {errors.price && <span id="sell-price-err" style={errorTextStyle} role="alert">{errors.price}</span>}
              </FieldGroup>

              <FieldGroup label="Original Price (₹) — optional" htmlFor="sell-original-price" error={errors.original_price}>
                <div style={{ position: "relative" }}>
                  <span style={{ position: "absolute", left: "0.85rem", top: "50%", transform: "translateY(-50%)", color: "rgba(167,184,176,0.5)", fontSize: "0.9rem", pointerEvents: "none" }}>₹</span>
                  <input
                    id="sell-original-price"
                    type="number"
                    min={0}
                    step={0.01}
                    value={originalPrice}
                    onChange={(e) => setOriginalPrice(e.target.value)}
                    placeholder="Optional"
                    aria-describedby={errors.original_price ? "sell-op-err" : undefined}
                    aria-invalid={!!errors.original_price}
                    style={{ ...inputStyle(!!errors.original_price), paddingLeft: "1.8rem" }}
                  />
                </div>
                {discountPct && !errors.original_price && (
                  <span style={{ color: "#00E676", fontSize: "0.72rem", fontWeight: 700 }}>
                    {discountPct}% off
                  </span>
                )}
                {errors.original_price && <span id="sell-op-err" style={errorTextStyle} role="alert">{errors.original_price}</span>}
              </FieldGroup>
            </div>

            {/* ── Negotiable toggle ── */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0.75rem 1rem", borderRadius: "12px", border: "1px solid rgba(102,255,178,0.1)", background: "rgba(5,10,7,0.5)" }}>
              <div>
                <p style={{ color: "#fff", fontSize: "0.875rem", fontWeight: 600, margin: "0 0 0.15rem" }}>Open to Negotiation</p>
                <p style={{ color: "rgba(167,184,176,0.5)", fontSize: "0.75rem", margin: 0 }}>Buyers can make offers on your price</p>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={negotiable}
                onClick={() => setNegotiable((v) => !v)}
                style={{
                  width: "44px", height: "24px",
                  borderRadius: "12px",
                  background: negotiable ? "#00E676" : "rgba(102,255,178,0.1)",
                  border: "none",
                  cursor: "pointer",
                  position: "relative",
                  transition: "background 0.2s ease",
                  flexShrink: 0,
                }}
                aria-label="Toggle price negotiability"
              >
                <span style={{
                  position: "absolute",
                  top: "3px",
                  left: negotiable ? "23px" : "3px",
                  width: "18px", height: "18px",
                  borderRadius: "50%",
                  background: negotiable ? "#050A07" : "#A7B8B0",
                  transition: "left 0.2s ease",
                }} />
              </button>
            </div>

            {/* ── Description ── */}
            <FieldGroup label="Description — optional" htmlFor="sell-description">
              <textarea
                id="sell-description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                maxLength={MAX_DESC_LEN}
                rows={4}
                placeholder="Describe the item's condition, reason for selling, what's included, etc. (optional)"
                style={{
                  ...inputStyle(false),
                  height: "auto",
                  resize: "vertical",
                  padding: "0.75rem 1rem",
                  fontFamily: "inherit",
                  lineHeight: 1.6,
                }}
              />
              <div style={{ display: "flex", justifyContent: "flex-end" }}>
                <span style={{ color: description.length > MAX_DESC_LEN * 0.95 ? "#f87171" : "rgba(167,184,176,0.4)", fontSize: "0.72rem" }}>
                  {description.length}/{MAX_DESC_LEN}
                </span>
              </div>
            </FieldGroup>

            {/* ── Pickup location ── */}
            <FieldGroup label="Pickup Location — optional" htmlFor="sell-pickup" error={errors.pickup_location}>
              <input
                id="sell-pickup"
                type="text"
                value={pickupLocation}
                onChange={(e) => setPickupLocation(e.target.value)}
                maxLength={MAX_LOCATION_LEN}
                placeholder="e.g. Main Library, Hostel Block C (optional)"
                aria-describedby="sell-pickup-hint"
                style={inputStyle(!!errors.pickup_location)}
              />
              {/* Campus Location Quick Chips */}
              <div className="flex items-center gap-1.5 mt-2 flex-wrap">
                <span className="text-[11px] text-white/40 font-medium">Quick spots:</span>
                {POPULAR_CAMPUS_LOCATIONS.map((loc) => (
                  <button
                    key={loc}
                    type="button"
                    onClick={() => setPickupLocation(loc)}
                    className="px-2 py-0.5 rounded-lg bg-white/5 hover:bg-emerald-500/15 border border-white/10 hover:border-emerald-500/30 text-[11px] text-white/70 hover:text-emerald-300 font-medium transition-colors cursor-pointer"
                  >
                    📍 {loc}
                  </button>
                ))}
              </div>
              <p id="sell-pickup-hint" style={{ color: "rgba(167,184,176,0.4)", fontSize: "0.72rem", marginTop: "0.3rem" }}>
                Use a general campus location. Avoid sharing private/exact addresses.
              </p>
              {errors.pickup_location && (
                <span style={errorTextStyle} role="alert">{errors.pickup_location}</span>
              )}
            </FieldGroup>

          </SectionCard>
        </section>
      </div>

      {/* ════════════════════════════════════════════════════════════════════════
          PREVIEW + SUBMIT
      ═══════════════════════════════════════════════════════════════════════ */}
      <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem", marginTop: "2rem" }}>

        {/* Preview toggle */}
        <button
          type="button"
          onClick={() => setShowPreview((v) => !v)}
          style={{
            display: "flex", alignItems: "center", gap: "0.5rem", justifyContent: "center",
            padding: "0.7rem 1.5rem",
            background: showPreview ? "rgba(0,230,118,0.08)" : "rgba(10,15,12,0.5)",
            border: `1px solid ${showPreview ? "rgba(0,230,118,0.35)" : "rgba(102,255,178,0.1)"}`,
            borderRadius: "14px",
            color: showPreview ? "#00E676" : "#A7B8B0",
            fontSize: "0.875rem",
            fontWeight: 600,
            cursor: "pointer",
            transition: "all 0.2s ease",
          }}
          aria-expanded={showPreview}
          aria-label="Toggle listing preview"
        >
          <Eye size={15} />
          {showPreview ? "Hide Preview" : "Preview Listing"}
        </button>

        {/* ── Preview ── */}
        {showPreview && (
          <ListingPreview
            title={title}
            description={description}
            category={category}
            condition={condition}
            price={priceNum}
            originalPrice={originalPriceNum}
            negotiable={negotiable}
            pickupLocation={pickupLocation}
            coverImageUrl={validImages[0]?.previewUrl ?? null}
            discountPct={discountPct}
          />
        )}

        {/* ── Publish button ── */}
        <button
          type="button"
          onClick={handleSubmit}
          disabled={isSubmitting}
          style={{
            display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem",
            padding: "1rem 2rem",
            background: isSubmitting
              ? "rgba(0,200,83,0.4)"
              : "linear-gradient(135deg, #00C853 0%, #00E676 100%)",
            border: "none", borderRadius: "16px",
            color: "#050A07", fontSize: "1rem", fontWeight: 800,
            cursor: isSubmitting ? "not-allowed" : "pointer",
            boxShadow: isSubmitting ? "none" : "0 4px 28px rgba(0,230,118,0.35)",
            transition: "all 0.2s ease",
            letterSpacing: "0.01em",
          }}
          className={!isSubmitting ? "hover:scale-[1.01] hover:shadow-[0_6px_32px_rgba(0,230,118,0.45)] active:scale-[0.99]" : ""}
          aria-busy={isSubmitting}
          aria-label={isSubmitting ? "Publishing your listing, please wait" : "Publish your listing"}
        >
          {isSubmitting && <Loader2 size={18} className="animate-spin" aria-hidden="true" />}
          {isSubmitting ? "Publishing…" : "Publish Listing"}
        </button>

        <p style={{ textAlign: "center", color: "rgba(167,184,176,0.35)", fontSize: "0.75rem" }}>
          By publishing, you confirm this item belongs to you and complies with UniVerse community guidelines.
        </p>
      </div>
      </div>
    </div>
  );
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function SectionCard({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-[#0c1410]/80 backdrop-blur-md border border-white/10 hover:border-emerald-500/20 rounded-2xl p-5 sm:p-6 transition-all shadow-sm">
      <h2 className="text-white text-base sm:text-lg font-bold m-0 mb-1 tracking-tight">
        {title}
      </h2>
      {subtitle && (
        <p className="text-white/50 text-xs sm:text-sm m-0 mb-5">{subtitle}</p>
      )}
      <div className={`${subtitle ? "" : "mt-4"} flex flex-col gap-5`}>
        {children}
      </div>
    </div>
  );
}

function FieldGroup({
  label,
  htmlFor,
  required,
  children,
}: {
  label: string;
  htmlFor?: string;
  required?: boolean;
  /** Accepted for call-site convenience; error display is handled inside children. */
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
      <label htmlFor={htmlFor} style={{ color: "#fff", fontSize: "0.82rem", fontWeight: 700, letterSpacing: "0.02em" }}>
        {label}
        {required && <span style={{ color: "#f87171", marginLeft: "3px" }} aria-label="required">*</span>}
      </label>
      {children}
    </div>
  );
}

function ListingPreview({
  title,
  description,
  category,
  condition,
  price,
  originalPrice,
  negotiable,
  pickupLocation,
  coverImageUrl,
  discountPct,
}: {
  title: string;
  description: string;
  category: ResaleCategory | "";
  condition: ResaleCondition | "";
  price: number;
  originalPrice: number;
  negotiable: boolean;
  pickupLocation: string;
  coverImageUrl: string | null;
  discountPct: number | null;
}) {
  const formatInr = (n: number) =>
    new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(n);

  return (
    <div style={{
      background: "rgba(5,10,7,0.7)",
      border: "1px solid rgba(0,230,118,0.15)",
      borderRadius: "18px",
      overflow: "hidden",
    }}>
      {/* Preview banner */}
      <div style={{ padding: "0.65rem 1.25rem", borderBottom: "1px solid rgba(102,255,178,0.08)", background: "rgba(0,230,118,0.05)" }}>
        <p style={{ color: "#00E676", fontSize: "0.75rem", fontWeight: 700, margin: 0, textTransform: "uppercase", letterSpacing: "0.06em" }}>
          Listing Preview
        </p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "auto 1fr", gap: "1.25rem", padding: "1.25rem", alignItems: "start" }}>
        {/* Cover image */}
        <div style={{
          width: "100px", height: "100px", borderRadius: "12px",
          background: "rgba(10,15,12,0.8)", border: "1px solid rgba(102,255,178,0.1)",
          overflow: "hidden", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          {coverImageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={coverImageUrl} alt="Preview" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          ) : (
            <Camera size={24} color="rgba(167,184,176,0.3)" />
          )}
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
          <h3 style={{ color: title ? "#fff" : "rgba(167,184,176,0.35)", fontSize: "1rem", fontWeight: 700, margin: 0 }}>
            {title || "Item title will appear here"}
          </h3>

          {/* Price */}
          <div style={{ display: "flex", alignItems: "baseline", gap: "0.4rem", flexWrap: "wrap" }}>
            <span style={{ color: price > 0 ? "#00E676" : "rgba(167,184,176,0.3)", fontSize: "1.1rem", fontWeight: 800 }}>
              {price > 0 ? formatInr(price) : "₹0"}
            </span>
            {originalPrice > price && (
              <span style={{ color: "rgba(167,184,176,0.4)", fontSize: "0.82rem", textDecoration: "line-through" }}>
                {formatInr(originalPrice)}
              </span>
            )}
            {discountPct && (
              <span style={{ background: "rgba(239,68,68,0.2)", color: "#f87171", fontSize: "0.68rem", fontWeight: 700, padding: "1px 6px", borderRadius: "5px" }}>
                {discountPct}% off
              </span>
            )}
            {negotiable && (
              <span style={{ color: "rgba(167,184,176,0.6)", fontSize: "0.72rem" }}>· Negotiable</span>
            )}
          </div>

          {/* Badges */}
          <div style={{ display: "flex", flexWrap: "wrap", gap: "0.4rem" }}>
            {condition && (
              <span style={{ background: "rgba(0,230,118,0.1)", color: "#00E676", fontSize: "0.7rem", fontWeight: 700, padding: "2px 8px", borderRadius: "6px" }}>
                {CONDITION_LABELS[condition]}
              </span>
            )}
            {category && (
              <span style={{ background: "rgba(102,255,178,0.06)", color: "rgba(167,184,176,0.7)", fontSize: "0.7rem", fontWeight: 600, padding: "2px 8px", borderRadius: "6px", border: "1px solid rgba(102,255,178,0.1)" }}>
                {CATEGORY_LABELS[category]}
              </span>
            )}
          </div>

          {pickupLocation && (
            <p style={{ color: "rgba(167,184,176,0.6)", fontSize: "0.78rem", margin: 0 }}>
              📍 {pickupLocation}
            </p>
          )}

          {description && (
            <p style={{
              color: "rgba(167,184,176,0.65)", fontSize: "0.82rem", margin: 0,
              lineHeight: 1.55,
              display: "-webkit-box", WebkitLineClamp: 3, WebkitBoxOrient: "vertical", overflow: "hidden",
            }}>
              {description}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Inline style helpers ─────────────────────────────────────────────────────

function inputStyle(hasError: boolean): React.CSSProperties {
  return {
    width: "100%",
    background: "rgba(5,10,7,0.7)",
    border: `1px solid ${hasError ? "rgba(239,68,68,0.5)" : "rgba(102,255,178,0.12)"}`,
    borderRadius: "10px",
    color: "#fff",
    fontSize: "0.875rem",
    padding: "0.7rem 0.9rem",
    outline: "none",
    transition: "border-color 0.15s ease",
    boxSizing: "border-box",
  };
}

const errorTextStyle: React.CSSProperties = {
  color: "#f87171",
  fontSize: "0.78rem",
  display: "block",
};
