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
    <div style={{ maxWidth: "800px", margin: "0 auto", width: "100%", display: "flex", flexDirection: "column", alignItems: "center" }}>
      {/* Dynamic Step Indicator */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem", marginBottom: "2.5rem", width: "100%", maxWidth: "600px", position: "relative" }}>
        {/* Step 1 Indicator */}
        <div
          onClick={() => setStep(1)}
          style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "0.5rem", zIndex: 1, cursor: "pointer" }}
        >
          <div
            style={{
              width: "38px",
              height: "38px",
              borderRadius: "50%",
              background: step > 1 ? "#00E676" : step === 1 ? "#00E676" : "rgba(255,255,255,0.05)",
              color: step >= 1 ? "#050805" : "rgba(255,255,255,0.4)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontWeight: 800,
              fontSize: "1rem",
              border: step === 1 ? "2px solid #66FFB2" : "none",
              boxShadow: step === 1 ? "0 0 15px rgba(0,230,118,0.5)" : "none",
              transition: "all 0.3s ease",
            }}
          >
            {step > 1 ? <Check size={18} strokeWidth={3} /> : "1"}
          </div>
          <span style={{ color: step >= 1 ? "#fff" : "rgba(255,255,255,0.4)", fontSize: "0.8rem", fontWeight: step === 1 ? 800 : 600 }}>
            Item Details
          </span>
        </div>

        {/* Line 1 -> 2 */}
        <div
          style={{
            flex: 1,
            borderTop: step >= 2 ? "2px solid #00E676" : "2px dashed rgba(255,255,255,0.2)",
            transform: "translateY(-12px)",
            transition: "all 0.3s ease",
          }}
        />

        {/* Step 2 Indicator */}
        <div
          onClick={() => {
            if (items.length > 0) setStep(2);
          }}
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "0.5rem",
            zIndex: 1,
            cursor: items.length > 0 ? "pointer" : "not-allowed",
          }}
        >
          <div
            style={{
              width: "38px",
              height: "38px",
              borderRadius: "50%",
              background: step > 2 ? "#00E676" : step === 2 ? "#00E676" : "transparent",
              border: step >= 2 ? "none" : "1px solid rgba(255,255,255,0.2)",
              color: step >= 2 ? "#050805" : "rgba(255,255,255,0.4)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontWeight: 800,
              fontSize: "1rem",
              boxShadow: step === 2 ? "0 0 15px rgba(0,230,118,0.5)" : "none",
              transition: "all 0.3s ease",
            }}
          >
            {step > 2 ? <Check size={18} strokeWidth={3} /> : "2"}
          </div>
          <span style={{ color: step >= 2 ? "#fff" : "rgba(255,255,255,0.4)", fontSize: "0.8rem", fontWeight: step === 2 ? 800 : 500 }}>
            Delivery Details
          </span>
        </div>

        {/* Line 2 -> 3 */}
        <div
          style={{
            flex: 1,
            borderTop: step === 3 ? "2px solid #00E676" : "2px dashed rgba(255,255,255,0.2)",
            transform: "translateY(-12px)",
            transition: "all 0.3s ease",
          }}
        />

        {/* Step 3 Indicator */}
        <div
          onClick={() => {
            if (items.length > 0 && dropoffRoom.trim()) setStep(3);
          }}
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "0.5rem",
            zIndex: 1,
            cursor: items.length > 0 && dropoffRoom.trim() ? "pointer" : "not-allowed",
          }}
        >
          <div
            style={{
              width: "38px",
              height: "38px",
              borderRadius: "50%",
              background: step === 3 ? "#00E676" : "transparent",
              border: step === 3 ? "none" : "1px solid rgba(255,255,255,0.2)",
              color: step === 3 ? "#050805" : "rgba(255,255,255,0.4)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontWeight: 800,
              fontSize: "1rem",
              boxShadow: step === 3 ? "0 0 15px rgba(0,230,118,0.5)" : "none",
              transition: "all 0.3s ease",
            }}
          >
            3
          </div>
          <span style={{ color: step === 3 ? "#fff" : "rgba(255,255,255,0.4)", fontSize: "0.8rem", fontWeight: step === 3 ? 800 : 500 }}>
            Confirm Request
          </span>
        </div>
      </div>

      {/* Global Form Error Banner */}
      {formError && (
        <div
          style={{
            width: "100%",
            background: "rgba(239, 68, 68, 0.15)",
            border: "1px solid rgba(239, 68, 68, 0.4)",
            borderRadius: "14px",
            padding: "1rem",
            color: "#fca5a5",
            fontSize: "0.9rem",
            display: "flex",
            alignItems: "center",
            gap: "0.75rem",
            marginBottom: "1.5rem",
          }}
        >
          <AlertCircle size={20} color="#ef4444" />
          <span>{formError}</span>
        </div>
      )}

      {/* Main Glassmorphic Card */}
      <div
        style={{
          background: "rgba(10,15,12,0.75)",
          border: "1px solid rgba(102,255,178,0.18)",
          borderRadius: "24px",
          padding: "2.25rem",
          width: "100%",
          boxShadow: "0 10px 40px rgba(0,0,0,0.5), 0 0 40px rgba(0,230,118,0.05)",
          backdropFilter: "blur(16px)",
          display: "flex",
          flexDirection: "column",
          gap: "2rem",
        }}
      >
        {/* ================= STEP 1: ITEM DETAILS ================= */}
        {step === 1 && (
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
                <Box size={22} color="#00E676" />
              </div>
              <div>
                <h2 style={{ color: "#fff", fontWeight: 800, fontSize: "1.3rem", margin: 0 }}>What do you need?</h2>
                <p style={{ color: "#A7B8B0", fontSize: "0.85rem", margin: 0, marginTop: "0.2rem" }}>
                  Select a category and add the items you want delivered to your room.
                </p>
              </div>
            </div>

            {/* Categories */}
            <div style={{ display: "flex", gap: "0.85rem", flexWrap: "wrap", justifyContent: "center" }}>
              {categories.map((cat) => {
                const isActive = currentCategory === cat.label;
                const IconComp = cat.icon;
                return (
                  <button
                    key={cat.label}
                    type="button"
                    onClick={() => setCurrentCategory(cat.label)}
                    style={{
                      position: "relative",
                      background: isActive ? "rgba(0,230,118,0.12)" : "rgba(255,255,255,0.02)",
                      border: isActive ? "1.5px solid #00E676" : "1px solid rgba(255,255,255,0.08)",
                      borderRadius: "16px",
                      width: "88px",
                      height: "88px",
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "0.45rem",
                      cursor: "pointer",
                      boxShadow: isActive ? "0 0 20px rgba(0,230,118,0.2)" : "none",
                      transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
                    }}
                  >
                    <IconComp size={24} color={isActive ? "#00E676" : "#A7B8B0"} strokeWidth={1.75} />
                    <span style={{ color: isActive ? "#fff" : "#A7B8B0", fontSize: "0.75rem", fontWeight: isActive ? 700 : 500 }}>
                      {cat.label}
                    </span>
                    {isActive && (
                      <div
                        style={{
                          position: "absolute",
                          bottom: "-5px",
                          left: "50%",
                          transform: "translateX(-50%) rotate(45deg)",
                          width: "8px",
                          height: "8px",
                          background: "#00E676",
                        }}
                      />
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
                <MapPin size={22} color="#00E676" />
              </div>
              <div>
                <h2 style={{ color: "#fff", fontWeight: 800, fontSize: "1.3rem", margin: 0 }}>Logistics & Reward</h2>
                <p style={{ color: "#A7B8B0", fontSize: "0.85rem", margin: 0, marginTop: "0.2rem" }}>
                  Where should the runner pick up your items and deliver them?
                </p>
              </div>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "1.75rem" }}>
              {/* Pickup Location */}
              <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem" }}>
                <label style={{ color: "#00E676", fontSize: "0.85rem", fontWeight: 700, display: "flex", alignItems: "center", gap: "0.4rem" }}>
                  <MapPin size={15} /> Select Pickup Location
                </label>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.6rem" }}>
                  {PICKUP_LOCATIONS.map((loc) => {
                    const isSelected = pickupLocation === loc;
                    return (
                      <button
                        key={loc}
                        type="button"
                        onClick={() => setPickupLocation(loc)}
                        style={{
                          background: isSelected ? "rgba(0,230,118,0.15)" : "rgba(0,0,0,0.35)",
                          border: isSelected ? "1.5px solid #00E676" : "1px solid rgba(255,255,255,0.1)",
                          color: isSelected ? "#00E676" : "#E8F0EB",
                          padding: "0.9rem 1.1rem",
                          borderRadius: "12px",
                          textAlign: "left",
                          cursor: "pointer",
                          fontSize: "0.9rem",
                          fontWeight: isSelected ? 800 : 500,
                          boxShadow: isSelected ? "0 0 15px rgba(0,230,118,0.15)" : "none",
                          transition: "all 0.2s ease",
                        }}
                      >
                        {loc}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Delivery Details */}
              <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem", borderTop: "1px solid rgba(255,255,255,0.08)", paddingTop: "1.5rem" }}>
                <label style={{ color: "#00E676", fontSize: "0.85rem", fontWeight: 700, display: "flex", alignItems: "center", gap: "0.4rem" }}>
                  <MapPin size={15} /> Delivery Destination (Hostel & Room)
                </label>

                {/* Hostel Selector */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.6rem", marginBottom: "0.5rem" }}>
                  {HOSTELS.map((hostel) => {
                    const isSelected = dropoffHostel === hostel;
                    return (
                      <button
                        key={hostel}
                        type="button"
                        onClick={() => setDropoffHostel(hostel)}
                        style={{
                          background: isSelected ? "rgba(0,230,118,0.15)" : "rgba(0,0,0,0.35)",
                          border: isSelected ? "1.5px solid #00E676" : "1px solid rgba(255,255,255,0.1)",
                          color: isSelected ? "#00E676" : "#E8F0EB",
                          padding: "0.85rem 1.1rem",
                          borderRadius: "12px",
                          cursor: "pointer",
                          fontSize: "0.9rem",
                          fontWeight: isSelected ? 800 : 500,
                          boxShadow: isSelected ? "0 0 15px rgba(0,230,118,0.15)" : "none",
                          transition: "all 0.2s ease",
                        }}
                      >
                        {hostel}
                      </button>
                    );
                  })}
                </div>

                {/* Room Number Input */}
                <div style={{ display: "flex", flexDirection: "column", gap: "0.35rem" }}>
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
                    style={{
                      background: "rgba(0,0,0,0.4)",
                      border: roomError ? "1.5px solid #ef4444" : "1px solid rgba(255,255,255,0.12)",
                      borderRadius: "12px",
                      padding: "0.9rem 1.1rem",
                      color: "#fff",
                      fontSize: "0.95rem",
                      outline: "none",
                      boxShadow: roomError ? "0 0 10px rgba(239,68,68,0.3)" : "none",
                    }}
                  />
                  {roomError && (
                    <span style={{ color: "#ef4444", fontSize: "0.8rem", fontWeight: 600 }}>
                      * Please enter your room number to continue.
                    </span>
                  )}
                </div>
              </div>

              {/* Delivery Reward */}
              <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem", borderTop: "1px solid rgba(255,255,255,0.08)", paddingTop: "1.5rem" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <label style={{ color: "#00E676", fontSize: "0.85rem", fontWeight: 700, display: "flex", alignItems: "center", gap: "0.4rem" }}>
                    <Sparkles size={15} /> Delivery Reward for Runner
                  </label>
                  <span style={{ color: "#A7B8B0", fontSize: "0.75rem" }}>
                    Suggested: ₹{calculateSuggestedReward()}
                  </span>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      background: "rgba(0,0,0,0.4)",
                      border: "1px solid rgba(255,255,255,0.12)",
                      borderRadius: "12px",
                      padding: "0.4rem 1rem",
                    }}
                  >
                    <span style={{ color: "#00E676", fontSize: "1.3rem", fontWeight: 800, marginRight: "0.4rem" }}>₹</span>
                    <input
                      type="number"
                      min={0}
                      placeholder={calculateSuggestedReward().toString()}
                      value={customReward}
                      onChange={(e) => setCustomReward(e.target.value)}
                      style={{
                        background: "transparent",
                        border: "none",
                        color: "#fff",
                        fontSize: "1.1rem",
                        fontWeight: 800,
                        width: "90px",
                        outline: "none",
                      }}
                    />
                  </div>

                  {/* Preset quick buttons */}
                  <div style={{ display: "flex", gap: "0.5rem" }}>
                    {[5, 10, 20, 50].map((amt) => (
                      <button
                        key={amt}
                        type="button"
                        onClick={() => setCustomReward(amt.toString())}
                        style={{
                          background: currentReward === amt ? "rgba(0,230,118,0.2)" : "rgba(255,255,255,0.05)",
                          border: currentReward === amt ? "1px solid #00E676" : "1px solid rgba(255,255,255,0.1)",
                          color: currentReward === amt ? "#00E676" : "#A7B8B0",
                          borderRadius: "10px",
                          padding: "0.6rem 0.8rem",
                          fontSize: "0.85rem",
                          fontWeight: 700,
                          cursor: "pointer",
                        }}
                      >
                        ₹{amt}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Navigation Buttons */}
              <div style={{ display: "flex", gap: "1rem", marginTop: "0.5rem" }}>
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  style={{
                    background: "rgba(255,255,255,0.05)",
                    border: "1px solid rgba(255,255,255,0.1)",
                    color: "#fff",
                    padding: "1rem",
                    borderRadius: "14px",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    width: "60px",
                  }}
                >
                  <ArrowLeft size={18} />
                </button>
                <button
                  type="button"
                  onClick={handleStep2Continue}
                  style={{
                    flex: 1,
                    background: "linear-gradient(135deg, #00C853 0%, #00E676 100%)",
                    color: "#050805",
                    fontWeight: 800,
                    fontSize: "1rem",
                    padding: "1rem",
                    borderRadius: "14px",
                    border: "none",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "0.5rem",
                    cursor: "pointer",
                    boxShadow: "0 0 25px rgba(0,230,118,0.35)",
                    transition: "all 0.2s ease",
                  }}
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
