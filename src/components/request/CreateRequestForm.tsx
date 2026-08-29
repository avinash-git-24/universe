"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Plus,
  Minus,
  Trash2,
  ArrowRight,
  ArrowLeft,
  MapPin,
  Box,
  Pizza,
  Coffee,
  Utensils,
  ShoppingBag,
  Book,
  Pill,
  Check,
  AlertCircle,
  Sparkles,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";
import type { Database } from "@/types/database";

type InsertRequest = Database["public"]["Tables"]["delivery_requests"]["Insert"];
type InsertItem = Database["public"]["Tables"]["request_items"]["Insert"];

type Category = "Snack" | "Beverage" | "Meal" | "Grocery" | "Stationery" | "Medicine";

interface ItemForm {
  id: string;
  name: string;
  category: Category;
  quantity: number;
}

const PICKUP_LOCATIONS = [
  "Campus Store",
  "Vending Machine",
  "Food Court",
  "Hostel Shop",
];

const HOSTELS = ["Hostel A", "Hostel B", "Hostel C", "Hostel D"];

export function CreateRequestForm({ requesterId }: { requesterId?: string }) {
  const router = useRouter();
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Step 1 State: Items
  const [items, setItems] = useState<ItemForm[]>([]);
  const [currentCategory, setCurrentCategory] = useState<Category>("Snack");
  const [currentItemName, setCurrentItemName] = useState("");
  const [currentItemQty, setCurrentItemQty] = useState(1);
  const [itemInputError, setItemInputError] = useState(false);

  // Step 2 State: Logistics & Reward
  const [pickupLocation, setPickupLocation] = useState(PICKUP_LOCATIONS[0]);
  const [dropoffHostel, setDropoffHostel] = useState(HOSTELS[0]);
  const [dropoffRoom, setDropoffRoom] = useState("");
  const [roomError, setRoomError] = useState(false);
  const [customReward, setCustomReward] = useState<string>("");

  // Step 3 State: Extras
  const [instructions, setInstructions] = useState("");

  const calculateSuggestedReward = () => {
    if (items.length === 0) return 5;
    const hasMeal = items.some((item) => item.category === "Meal");
    if (hasMeal) return 25;
    const totalQty = items.reduce((sum, item) => sum + item.quantity, 0);
    if (totalQty === 1) return 5;
    if (totalQty === 2) return 10;
    if (totalQty === 3) return 15;
    return 20;
  };

  const currentReward = customReward !== "" ? Math.max(0, Number(customReward)) : calculateSuggestedReward();

  const handleAddItem = () => {
    if (!currentItemName.trim()) {
      setItemInputError(true);
      return;
    }
    setItemInputError(false);
    setItems((prev) => [
      ...prev,
      {
        id: Math.random().toString(36).substring(2, 9),
        name: currentItemName.trim(),
        category: currentCategory,
        quantity: currentItemQty,
      },
    ]);
    setCurrentItemName("");
    setCurrentItemQty(1);
    setFormError(null);
  };

  const handleRemoveItem = (id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  };

  const handleClearAll = () => {
    setItems([]);
  };

  const handleStep2Continue = () => {
    if (!dropoffRoom.trim()) {
      setRoomError(true);
      return;
    }
    setRoomError(false);
    setFormError(null);
    setStep(3);
  };

  const handleSubmit = async () => {
    if (items.length === 0) {
      setFormError("Please add at least one item before submitting.");
      setStep(1);
      return;
    }
    if (!dropoffRoom.trim()) {
      setFormError("Please provide your room number.");
      setStep(2);
      return;
    }

    setIsSubmitting(true);
    setFormError(null);

    try {
      const supabase = createClient();
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      const currentUserId = user?.id || requesterId;

      if (authError || !currentUserId) {
        setFormError("Your session has expired. Please log in again to continue.");
        setIsSubmitting(false);
        return;
      }

      // Ensure profile exists in public.profiles to satisfy foreign key constraint
      const { data: existingProfile } = await supabase
        .from("profiles")
        .select("id")
        .eq("id", currentUserId)
        .maybeSingle();

      if (!existingProfile) {
        const fallbackName =
          user?.user_metadata?.full_name ||
          user?.user_metadata?.name ||
          user?.email?.split("@")[0] ||
          "Student";

        const fallbackEnrollment =
          user?.user_metadata?.enrollment_number ||
          (user?.email?.includes("@") ? user.email.split("@")[0] : null);

        await supabase.from("profiles").upsert(
          {
            id: currentUserId,
            full_name: fallbackName,
            enrollment_number: fallbackEnrollment,
            role: "student",
          },
          { onConflict: "id" }
        );
      }

      const requestData: Omit<InsertRequest, "requester_id"> = {
        pickup_location: pickupLocation,
        dropoff_location: `${dropoffHostel}, Room ${dropoffRoom.trim()}`,
        instructions: instructions.trim() || null,
        delivery_fee: currentReward,
        total_estimated_amount: 0,
        status: "pending",
      };

      const itemsData: Omit<InsertItem, "request_id">[] = items.map((item) => ({
        name: item.name,
        quantity: item.quantity,
        notes: `Category: ${item.category}`,
        estimated_price: 0,
      }));

      const { data: request, error: requestError } = await supabase
        .from("delivery_requests")
        .insert({ ...requestData, requester_id: currentUserId })
        .select()
        .single();

      if (requestError || !request) {
        console.error("Delivery request insert error:", requestError);
        setFormError(requestError?.message || "Failed to create delivery request. Please try again.");
        setIsSubmitting(false);
        return;
      }

      if (itemsData.length > 0) {
        const { error: itemsError } = await supabase
          .from("request_items")
          .insert(itemsData.map((item) => ({ ...item, request_id: request.id })));

        if (itemsError) {
          console.error("Request items insert error:", itemsError);
        }
      }

      window.location.href = "/dashboard";
    } catch (error) {
      console.error("Unexpected submission error:", error);
      setFormError(error instanceof Error ? error.message : "An unexpected error occurred. Please try again.");
      setIsSubmitting(false);
    }
  };

  const categories: {
    label: Category;
    icon: React.ComponentType<{ size?: number; color?: string; strokeWidth?: number }>;
  }[] = [
    { label: "Snack", icon: Pizza },
    { label: "Beverage", icon: Coffee },
    { label: "Meal", icon: Utensils },
    { label: "Grocery", icon: ShoppingBag },
    { label: "Stationery", icon: Book },
    { label: "Medicine", icon: Pill },
  ];

  return (
    <div className="max-w-[800px] mx-auto w-full flex flex-col items-center">
      {/* Dynamic Step Indicator */}
      <div className="flex items-center justify-between sm:justify-center gap-1.5 sm:gap-3 mb-6 sm:mb-10 w-full max-w-[600px] relative px-2">
        {/* Step 1 Indicator */}
        <div
          onClick={() => setStep(1)}
          className="flex flex-col items-center gap-1.5 z-10 cursor-pointer"
        >
          <div
            className={cn(
              "w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center font-extrabold text-sm sm:text-base transition-all duration-300",
              step >= 1 ? "bg-[#00E676] text-[#050805]" : "bg-white/5 text-white/40",
              step === 1 ? "ring-4 ring-[#00E676]/30 shadow-[0_0_15px_rgba(0,230,118,0.5)]" : ""
            )}
          >
            {step > 1 ? <Check size={16} strokeWidth={3} /> : "1"}
          </div>
          <span className={cn("text-[10px] sm:text-xs font-semibold text-center whitespace-nowrap", step >= 1 ? "text-white" : "text-white/40")}>
            Item Details
          </span>
        </div>

        {/* Line 1 -> 2 */}
        <div
          className={cn(
            "flex-1 h-0.5 -mt-4 sm:-mt-5 transition-all duration-300",
            step >= 2 ? "bg-[#00E676]" : "border-t-2 border-dashed border-white/20"
          )}
        />

        {/* Step 2 Indicator */}
        <div
          onClick={() => {
            if (items.length > 0) setStep(2);
          }}
          className={cn(
            "flex flex-col items-center gap-1.5 z-10",
            items.length > 0 ? "cursor-pointer" : "cursor-not-allowed opacity-70"
          )}
        >
          <div
            className={cn(
              "w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center font-extrabold text-sm sm:text-base transition-all duration-300 border",
              step >= 2 ? "bg-[#00E676] text-[#050805] border-[#00E676]" : "bg-transparent text-white/40 border-white/20",
              step === 2 ? "ring-4 ring-[#00E676]/30 shadow-[0_0_15px_rgba(0,230,118,0.5)]" : ""
            )}
          >
            {step > 2 ? <Check size={16} strokeWidth={3} /> : "2"}
          </div>
          <span className={cn("text-[10px] sm:text-xs font-semibold text-center whitespace-nowrap", step >= 2 ? "text-white" : "text-white/40")}>
            Delivery Details
          </span>
        </div>

        {/* Line 2 -> 3 */}
        <div
          className={cn(
            "flex-1 h-0.5 -mt-4 sm:-mt-5 transition-all duration-300",
            step === 3 ? "bg-[#00E676]" : "border-t-2 border-dashed border-white/20"
          )}
        />

        {/* Step 3 Indicator */}
        <div
          onClick={() => {
            if (items.length > 0 && dropoffRoom.trim()) setStep(3);
          }}
          className={cn(
            "flex flex-col items-center gap-1.5 z-10",
            items.length > 0 && dropoffRoom.trim() ? "cursor-pointer" : "cursor-not-allowed opacity-70"
          )}
        >
          <div
            className={cn(
              "w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center font-extrabold text-sm sm:text-base transition-all duration-300 border",
              step === 3 ? "bg-[#00E676] text-[#050805] border-[#00E676] ring-4 ring-[#00E676]/30 shadow-[0_0_15px_rgba(0,230,118,0.5)]" : "bg-transparent text-white/40 border-white/20"
            )}
          >
            3
          </div>
          <span className={cn("text-[10px] sm:text-xs font-semibold text-center whitespace-nowrap", step === 3 ? "text-white" : "text-white/40")}>
            Confirm Request
          </span>
        </div>
      </div>

      {/* Global Form Error Banner */}
      {formError && (
        <div
          role="alert"
          className="w-full bg-red-500/15 border border-red-500/40 rounded-xl p-3.5 sm:p-4 text-red-300 text-xs sm:text-sm flex items-center gap-2.5 mb-6 break-words"
        >
          <AlertCircle size={18} className="text-red-400 shrink-0" />
          <span>{formError}</span>
        </div>
      )}

      {/* Main Glassmorphic Card */}
      <div className="bg-[#0a0f0c]/85 border border-[#66ffb2]/20 rounded-[20px] sm:rounded-[24px] p-4 sm:p-8 lg:p-9 w-full shadow-[0_10px_40px_rgba(0,0,0,0.5),0_0_40px_rgba(0,230,118,0.05)] backdrop-blur-xl flex flex-col gap-6 sm:gap-8">
        {/* ================= STEP 1: ITEM DETAILS ================= */}
        {step === 1 && (
          <>
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-[#00E676]/10 flex items-center justify-center border border-[#00E676]/25 shrink-0">
                <Box size={20} className="text-[#00E676]" />
              </div>
              <div>
                <h2 className="text-white font-extrabold text-lg sm:text-xl m-0 leading-tight">What do you need?</h2>
                <p className="text-[#A7B8B0] text-xs sm:text-sm m-0 mt-1">
                  Select a category and add the items you want delivered to your room.
                </p>
              </div>
            </div>

            {/* Categories Grid (3 cols on mobile, 6 cols on tablet/desktop) */}
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 sm:gap-3 w-full">
              {categories.map((cat) => {
                const isActive = currentCategory === cat.label;
                const IconComp = cat.icon;
                return (
                  <button
                    key={cat.label}
                    type="button"
                    onClick={() => setCurrentCategory(cat.label)}
                    className={cn(
                      "relative rounded-2xl h-[76px] sm:h-[88px] w-full flex flex-col items-center justify-center gap-1.5 cursor-pointer transition-all duration-200 border",
                      isActive
                        ? "bg-[#00E676]/15 border-[#00E676] shadow-[0_0_20px_rgba(0,230,118,0.2)]"
                        : "bg-white/[0.02] border-white/10 hover:border-white/20"
                    )}
                  >
                    <IconComp size={20} color={isActive ? "#00E676" : "#A7B8B0"} strokeWidth={1.75} />
                    <span className={cn("text-[11px] sm:text-xs", isActive ? "text-white font-bold" : "text-[#A7B8B0] font-medium")}>
                      {cat.label}
                    </span>
                    {isActive && (
                      <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 rotate-45 w-2 h-2 bg-[#00E676]" />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Input Row */}
            <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
              <label style={{ color: "#00E676", fontSize: "0.85rem", fontWeight: 700 }}>
                Add item for category: <span style={{ color: "#fff" }}>{currentCategory}</span>
              </label>
              <div style={{ display: "flex", gap: "0.75rem", alignItems: "center", flexWrap: "wrap" }}>
                <input
                  type="text"
                  placeholder={`e.g. ${
                    currentCategory === "Snack"
                      ? "Lays Chips, Doritos, KitKat..."
                      : currentCategory === "Beverage"
                      ? "Cold Coffee, Red Bull, Sprite..."
                      : currentCategory === "Meal"
                      ? "Paneer Butter Masala, Roti..."
                      : currentCategory === "Stationery"
                      ? "A4 Notebook, Blue Pen..."
                      : currentCategory === "Medicine"
                      ? "Paracetamol, Band-Aid..."
                      : "Milk, Bread, Biscuits..."
                  }`}
                  value={currentItemName}
                  onChange={(e) => {
                    setCurrentItemName(e.target.value);
                    if (itemInputError) setItemInputError(false);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleAddItem();
                    }
                  }}
                  style={{
                    flex: "1 1 240px",
                    background: "rgba(0,0,0,0.4)",
                    border: itemInputError ? "1px solid #ef4444" : "1px solid rgba(255,255,255,0.12)",
                    borderRadius: "12px",
                    padding: "0.85rem 1rem",
                    color: "#fff",
                    fontSize: "0.95rem",
                    outline: "none",
                  }}
                />

                {/* Quantity Controls */}
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    background: "rgba(0,0,0,0.4)",
                    border: "1px solid rgba(255,255,255,0.12)",
                    borderRadius: "12px",
                    overflow: "hidden",
                  }}
                >
                  <button
                    type="button"
                    onClick={() => setCurrentItemQty(Math.max(1, currentItemQty - 1))}
                    style={{
                      background: "transparent",
                      border: "none",
                      color: "rgba(255,255,255,0.7)",
                      padding: "0.85rem 0.9rem",
                      cursor: "pointer",
                    }}
                  >
                    <Minus size={14} />
                  </button>
                  <span style={{ color: "#fff", fontWeight: 800, fontSize: "0.95rem", minWidth: "24px", textAlign: "center" }}>
                    {currentItemQty}
                  </span>
                  <button
                    type="button"
                    onClick={() => setCurrentItemQty(currentItemQty + 1)}
                    style={{
                      background: "transparent",
                      border: "none",
                      color: "rgba(255,255,255,0.7)",
                      padding: "0.85rem 0.9rem",
                      cursor: "pointer",
                    }}
                  >
                    <Plus size={14} />
                  </button>
                </div>

                {/* Add Item Button */}
                <button
                  type="button"
                  onClick={handleAddItem}
                  style={{
                    background: "rgba(0,230,118,0.2)",
                    border: "1px solid rgba(0,230,118,0.4)",
                    color: "#00E676",
                    fontWeight: 700,
                    fontSize: "0.95rem",
                    padding: "0.85rem 1.6rem",
                    borderRadius: "12px",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: "0.4rem",
                  }}
                >
                  <Plus size={16} /> Add
                </button>
              </div>
            </div>

            {/* List / Empty State */}
            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ color: "#A7B8B0", fontSize: "0.85rem", fontWeight: 600 }}>Added Items ({items.length})</span>
                {items.length > 0 && (
                  <button
                    type="button"
                    onClick={handleClearAll}
                    style={{
                      background: "transparent",
                      border: "none",
                      color: "#A7B8B0",
                      fontSize: "0.8rem",
                      display: "flex",
                      alignItems: "center",
                      gap: "0.4rem",
                      cursor: "pointer",
                    }}
                  >
                    Clear all <Trash2 size={14} />
                  </button>
                )}
              </div>

              {items.length === 0 ? (
                <div
                  style={{
                    border: "1px dashed rgba(255,255,255,0.12)",
                    borderRadius: "16px",
                    padding: "3rem 1.5rem",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "0.5rem",
                    background: "rgba(0,0,0,0.25)",
                    textAlign: "center",
                  }}
                >
                  <Box size={36} color="#00E676" style={{ opacity: 0.8, marginBottom: "0.25rem" }} />
                  <h4 style={{ color: "#fff", fontWeight: 700, margin: 0, fontSize: "1rem" }}>No items added yet</h4>
                  <p style={{ color: "#A7B8B0", margin: 0, fontSize: "0.85rem" }}>Type an item name above and click &ldquo;Add&rdquo; to begin.</p>
                </div>
              ) : (
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "0.5rem",
                    background: "rgba(0,0,0,0.3)",
                    borderRadius: "16px",
                    padding: "1rem",
                    border: "1px solid rgba(255,255,255,0.06)",
                    maxHeight: "260px",
                    overflowY: "auto",
                  }}
                >
                  {items.map((item) => (
                    <div
                      key={item.id}
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        padding: "0.6rem 0.8rem",
                        background: "rgba(255,255,255,0.02)",
                        borderRadius: "10px",
                        border: "1px solid rgba(255,255,255,0.04)",
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                        <span
                          style={{
                            background: "rgba(0,230,118,0.15)",
                            color: "#00E676",
                            fontSize: "0.75rem",
                            fontWeight: 800,
                            padding: "0.2rem 0.5rem",
                            borderRadius: "6px",
                          }}
                        >
                          {item.quantity}x
                        </span>
                        <span style={{ color: "#fff", fontWeight: 600, fontSize: "0.95rem" }}>{item.name}</span>
                        <span
                          style={{
                            color: "#A7B8B0",
                            fontSize: "0.75rem",
                            padding: "0.15rem 0.45rem",
                            background: "rgba(255,255,255,0.05)",
                            borderRadius: "6px",
                          }}
                        >
                          {item.category}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveItem(item.id)}
                        style={{ background: "transparent", border: "none", color: "#ef4444", cursor: "pointer", padding: "4px" }}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Step 1 Continue Button */}
            <button
              type="button"
              onClick={() => {
                if (items.length === 0) {
                  setFormError("Please add at least one item to proceed.");
                  return;
                }
                setFormError(null);
                setStep(2);
              }}
              style={{
                width: "100%",
                background: items.length > 0 ? "linear-gradient(135deg, #00C853 0%, #00E676 100%)" : "rgba(255,255,255,0.06)",
                color: items.length > 0 ? "#050805" : "rgba(255,255,255,0.3)",
                fontWeight: 800,
                fontSize: "1rem",
                padding: "1rem",
                borderRadius: "14px",
                border: "none",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "0.5rem",
                cursor: items.length > 0 ? "pointer" : "default",
                boxShadow: items.length > 0 ? "0 0 25px rgba(0,230,118,0.35)" : "none",
                transition: "all 0.2s ease",
              }}
            >
              Continue to Delivery Details <ArrowRight size={18} />
            </button>
          </>
        )}

        {/* ================= STEP 2: LOGISTICS & REWARD ================= */}
        {step === 2 && (
          <>
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-[#00E676]/10 flex items-center justify-center border border-[#00E676]/25 shrink-0">
                <MapPin size={20} className="text-[#00E676]" />
              </div>
              <div>
                <h2 className="text-white font-extrabold text-lg sm:text-xl m-0 leading-tight">Logistics & Reward</h2>
                <p className="text-[#A7B8B0] text-xs sm:text-sm m-0 mt-1">
                  Where should the runner pick up your items and deliver them?
                </p>
              </div>
            </div>

            <div className="flex flex-col gap-5 sm:gap-6">
              {/* Pickup Location */}
              <div className="flex flex-col gap-2">
                <label className="text-[#00E676] text-xs sm:text-sm font-bold flex items-center gap-1.5">
                  <MapPin size={14} /> Select Pickup Location
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-2.5">
                  {PICKUP_LOCATIONS.map((loc) => {
                    const isSelected = pickupLocation === loc;
                    return (
                      <button
                        key={loc}
                        type="button"
                        onClick={() => setPickupLocation(loc)}
                        className={cn(
                          "p-3 sm:p-3.5 rounded-xl text-left cursor-pointer text-xs sm:text-sm font-medium transition-all duration-150 border",
                          isSelected
                            ? "bg-[#00E676]/15 border-[#00E676] text-[#00E676] font-bold shadow-[0_0_15px_rgba(0,230,118,0.15)]"
                            : "bg-black/35 border-white/10 text-white/90 hover:border-white/20"
                        )}
                      >
                        {loc}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Delivery Details */}
              <div className="flex flex-col gap-2 border-t border-white/10 pt-4 sm:pt-5">
                <label className="text-[#00E676] text-xs sm:text-sm font-bold flex items-center gap-1.5">
                  <MapPin size={14} /> Delivery Destination (Hostel & Room)
                </label>

                {/* Hostel Selector */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-1">
                  {HOSTELS.map((hostel) => {
                    const isSelected = dropoffHostel === hostel;
                    return (
                      <button
                        key={hostel}
                        type="button"
                        onClick={() => setDropoffHostel(hostel)}
                        className={cn(
                          "py-2.5 sm:py-3 px-2 rounded-xl text-center cursor-pointer text-xs sm:text-sm font-medium transition-all duration-150 border",
                          isSelected
                            ? "bg-[#00E676]/15 border-[#00E676] text-[#00E676] font-bold shadow-[0_0_15px_rgba(0,230,118,0.15)]"
                            : "bg-black/35 border-white/10 text-white/90 hover:border-white/20"
                        )}
                      >
                        {hostel}
                      </button>
                    );
                  })}
                </div>

                {/* Room Number Input */}
                <div className="flex flex-col gap-1 mt-1">
                  <input
                    type="text"
                    placeholder="Enter Room Number (e.g. 104, B-205)"
                    value={dropoffRoom}
                    onChange={(e) => {
                      setDropoffRoom(e.target.value);
                      if (roomError) setRoomError(false);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleStep2Continue();
                      }
                    }}
                    className={cn(
                      "bg-black/40 rounded-xl px-4 py-3 text-white text-sm outline-none border transition-all",
                      roomError ? "border-red-500 ring-1 ring-red-500" : "border-white/12 focus:border-[#00E676]"
                    )}
                  />
                  {roomError && (
                    <span className="text-red-400 text-xs font-semibold mt-0.5">
                      * Please enter your room number to continue.
                    </span>
                  )}
                </div>
              </div>

              {/* Delivery Reward */}
              <div className="flex flex-col gap-2 border-t border-white/10 pt-4 sm:pt-5">
                <div className="flex justify-between items-center">
                  <label className="text-[#00E676] text-xs sm:text-sm font-bold flex items-center gap-1.5">
                    <Sparkles size={14} /> Delivery Reward for Runner
                  </label>
                  <span className="text-[#A7B8B0] text-xs">
                    Suggested: ₹{calculateSuggestedReward()}
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                  <div className="flex items-center bg-black/40 border border-white/12 rounded-xl px-3 sm:px-4 py-2">
                    <span className="text-[#00E676] text-lg font-extrabold mr-1.5">₹</span>
                    <input
                      type="number"
                      min={0}
                      placeholder={calculateSuggestedReward().toString()}
                      value={customReward}
                      onChange={(e) => setCustomReward(e.target.value)}
                      className="bg-transparent border-none text-white text-base font-extrabold w-20 outline-none"
                    />
                  </div>

                  {/* Preset quick buttons */}
                  <div className="flex flex-wrap gap-1.5 sm:gap-2">
                    {[5, 10, 20, 50].map((amt) => (
                      <button
                        key={amt}
                        type="button"
                        onClick={() => setCustomReward(amt.toString())}
                        className={cn(
                          "rounded-xl px-3 py-2 text-xs sm:text-sm font-bold cursor-pointer transition-all border",
                          currentReward === amt
                            ? "bg-[#00E676]/20 border-[#00E676] text-[#00E676]"
                            : "bg-white/5 border-white/10 text-[#A7B8B0] hover:text-white"
                        )}
                      >
                        ₹{amt}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Navigation Buttons */}
              <div className="flex gap-3 mt-2">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="bg-white/5 border border-white/10 text-white p-3.5 rounded-xl cursor-pointer flex items-center justify-center w-12 shrink-0 hover:bg-white/10"
                >
                  <ArrowLeft size={18} />
                </button>
                <button
                  type="button"
                  onClick={handleStep2Continue}
                  className="flex-1 bg-gradient-to-r from-[#00C853] to-[#00E676] text-[#050805] font-extrabold text-sm sm:text-base p-3.5 rounded-xl border-none flex items-center justify-center gap-2 cursor-pointer shadow-[0_0_25px_rgba(0,230,118,0.35)] hover:scale-[1.02] transition-transform"
                >
                  Continue to Summary <ArrowRight size={18} />
                </button>
              </div>
            </div>
          </>
        )}

        {/* ================= STEP 3: CONFIRM & SUBMIT ================= */}
        {step === 3 && (
          <>
            <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
              <div
                style={{
                  width: "44px",
                  height: "44px",
                  borderRadius: "12px",
                  background: "rgba(0,230,118,0.12)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  border: "1px solid rgba(0,230,118,0.25)",
                }}
              >
                <Check size={22} color="#00E676" />
              </div>
              <div>
                <h2 style={{ color: "#fff", fontWeight: 800, fontSize: "1.3rem", margin: 0 }}>Review & Confirm</h2>
                <p style={{ color: "#A7B8B0", fontSize: "0.85rem", margin: 0, marginTop: "0.2rem" }}>
                  Double check your request details before publishing for campus runners.
                </p>
              </div>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
              {/* Optional Instructions */}
              <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                <label style={{ color: "#00E676", fontSize: "0.85rem", fontWeight: 700 }}>
                  Special Instructions (Optional)
                </label>
                <textarea
                  placeholder="e.g. Call when outside the hostel gate. Prefer chilled if possible."
                  value={instructions}
                  onChange={(e) => setInstructions(e.target.value)}
                  style={{
                    background: "rgba(0,0,0,0.4)",
                    border: "1px solid rgba(255,255,255,0.12)",
                    borderRadius: "12px",
                    padding: "0.9rem 1.1rem",
                    color: "#fff",
                    fontSize: "0.95rem",
                    minHeight: "85px",
                    resize: "vertical",
                    outline: "none",
                  }}
                />
              </div>

              {/* Order Summary Box */}
              <div
                style={{
                  background: "rgba(0,230,118,0.06)",
                  border: "1px solid rgba(0,230,118,0.2)",
                  borderRadius: "16px",
                  padding: "1.35rem",
                  display: "flex",
                  flexDirection: "column",
                  gap: "0.85rem",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", fontSize: "0.9rem" }}>
                  <span style={{ color: "#A7B8B0", fontWeight: 500 }}>Items ({items.length})</span>
                  <div style={{ textAlign: "right", display: "flex", flexDirection: "column", gap: "0.2rem", maxWidth: "260px" }}>
                    {items.map((i) => (
                      <span key={i.id} style={{ color: "#fff", fontWeight: 600, fontSize: "0.85rem" }}>
                        {i.quantity}x {i.name} ({i.category})
                      </span>
                    ))}
                  </div>
                </div>

                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.9rem", borderTop: "1px solid rgba(255,255,255,0.06)", paddingTop: "0.6rem" }}>
                  <span style={{ color: "#A7B8B0", fontWeight: 500 }}>Pickup Location</span>
                  <span style={{ color: "#fff", fontWeight: 700 }}>{pickupLocation}</span>
                </div>

                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.9rem" }}>
                  <span style={{ color: "#A7B8B0", fontWeight: 500 }}>Delivery Address</span>
                  <span style={{ color: "#fff", fontWeight: 700 }}>
                    {dropoffHostel}, Room {dropoffRoom}
                  </span>
                </div>

                <div
                  style={{
                    borderTop: "1px solid rgba(0,230,118,0.2)",
                    paddingTop: "0.85rem",
                    marginTop: "0.25rem",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <span style={{ color: "#fff", fontSize: "1.05rem", fontWeight: 800 }}>Total Delivery Reward</span>
                  <span style={{ color: "#00E676", fontSize: "1.4rem", fontWeight: 900 }}>₹{currentReward}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div style={{ display: "flex", gap: "1rem", marginTop: "0.5rem" }}>
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  disabled={isSubmitting}
                  style={{
                    background: "rgba(255,255,255,0.05)",
                    border: "1px solid rgba(255,255,255,0.1)",
                    color: "#fff",
                    padding: "1rem",
                    borderRadius: "14px",
                    cursor: isSubmitting ? "not-allowed" : "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    width: "60px",
                    opacity: isSubmitting ? 0.5 : 1,
                  }}
                >
                  <ArrowLeft size={18} />
                </button>
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  style={{
                    flex: 1,
                    background: "linear-gradient(135deg, #00C853 0%, #00E676 100%)",
                    color: "#050805",
                    fontWeight: 800,
                    fontSize: "1.05rem",
                    padding: "1rem",
                    borderRadius: "14px",
                    border: "none",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "0.5rem",
                    cursor: isSubmitting ? "not-allowed" : "pointer",
                    boxShadow: "0 0 25px rgba(0,230,118,0.4)",
                    opacity: isSubmitting ? 0.8 : 1,
                    transition: "all 0.2s ease",
                  }}
                >
                  {isSubmitting ? (
                    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                      <div
                        style={{
                          width: "18px",
                          height: "18px",
                          border: "2px solid #050805",
                          borderTopColor: "transparent",
                          borderRadius: "50%",
                          animation: "spin 1s linear infinite",
                        }}
                      />
                      <span>Publishing Request...</span>
                    </div>
                  ) : (
                    <>
                      <span>Confirm & Publish Request</span>
                      <ArrowRight size={18} />
                    </>
                  )}
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
