"use client";

import { useState, useEffect } from "react";
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
  Zap,
  ShieldCheck,
  Clock,
  Coins,
  Store,
  Search,
  X,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";
import type { Database } from "@/types/database";
import { VENDING_PRODUCTS } from "@/data/vendingProducts";

type InsertRequest = Database["public"]["Tables"]["delivery_requests"]["Insert"];
type InsertItem = Database["public"]["Tables"]["request_items"]["Insert"];

type Category =
  | "Vending Machine"
  | "Snack"
  | "Beverage"
  | "Meal"
  | "Grocery"
  | "Stationery"
  | "Medicine";

interface ItemForm {
  id: string;
  name: string;
  category: Category;
  quantity: number;
  estimatedPrice?: number;
}

interface QuickItem {
  name: string;
  price: number;
  subType?: "Drinks" | "Snacks" | "Sweets";
}

const PICKUP_LOCATIONS = [
  "Hostel Vending Machine",
  "Other (Custom Spot)",
];

const HOSTELS = [
  "Hostel A",
  "Hostel B",
  "Hostel C",
  "Hostel D",
  "Girls Hostel",
  "Faculty Block",
  "Other",
];

const POPULAR_ITEMS: Record<Category, QuickItem[]> = {
  "Vending Machine": [
    // ── Crunchy Snacks & Chips (Featured First: CrunchEx & Kurkure) ──
    { name: "CrunchEx Chili Tadka", price: 20, subType: "Snacks" },
    { name: "Kurkure Masala Munch", price: 20, subType: "Snacks" },
    { name: "Chili Chataka Kurkure", price: 20, subType: "Snacks" },
    { name: "Lays Magic Masala", price: 20, subType: "Snacks" },
    { name: "Lays Sizzling Hot", price: 20, subType: "Snacks" },
    { name: "Lays West Indies Sweet Chilli", price: 20, subType: "Snacks" },
    { name: "Puffcorn Lays", price: 20, subType: "Snacks" },
    { name: "Balaji Masala Wafers", price: 20, subType: "Snacks" },
    { name: "Balaji Salted Wafers", price: 20, subType: "Snacks" },
    { name: "ACT Butter Popcorn", price: 20, subType: "Snacks" },
    { name: "Gopal Masala Sev Murmura", price: 15, subType: "Snacks" },
    { name: "Gopal Tikha Mitha Mix", price: 15, subType: "Snacks" },
    { name: "Gopal Farali Chevdo", price: 20, subType: "Snacks" },
    { name: "Gopal Moong Dal", price: 15, subType: "Snacks" },
    { name: "Gopal Mexican Chilli", price: 20, subType: "Snacks" },
    { name: "Bingo Mad Angles Achaari", price: 20, subType: "Snacks" },
    { name: "Roaven Salted Peanut", price: 30, subType: "Snacks" },
    { name: "Maggi 2-Min", price: 20, subType: "Snacks" },
    { name: "Doritos Cheese", price: 30, subType: "Snacks" },

    // ── Cold Drinks & Shakes (Vending 1 & 2) ──
    { name: "Frooti 400ml", price: 30, subType: "Drinks" },
    { name: "Appy Fizz 250ml", price: 20, subType: "Drinks" },
    { name: "Amul Kool Cafe", price: 40, subType: "Drinks" },
    { name: "Amul Kool Dark Chocolate", price: 25, subType: "Drinks" },
    { name: "Amul Kool Koko", price: 40, subType: "Drinks" },
    { name: "Amul Kool Rose", price: 30, subType: "Drinks" },
    { name: "Dark Fantasy Shake", price: 30, subType: "Drinks" },
    { name: "Britannia Strawberry Shake", price: 40, subType: "Drinks" },
    { name: "Britannia Vanilla Shake", price: 40, subType: "Drinks" },
    { name: "Paper Boat Jamun", price: 25, subType: "Drinks" },
    { name: "Paper Boat Apple", price: 25, subType: "Drinks" },
    { name: "Paper Boat Orange", price: 25, subType: "Drinks" },
    { name: "Swing Coconut Water", price: 20, subType: "Drinks" },
    { name: "Swing Mixed Fruit", price: 20, subType: "Drinks" },
    { name: "Swing Guava", price: 20, subType: "Drinks" },
    { name: "Swing Pomegranate", price: 20, subType: "Drinks" },
    { name: "Jam-in Mix Fruit", price: 20, subType: "Drinks" },
    { name: "Sprite MRP 20", price: 20, subType: "Drinks" },
    { name: "Fanta 250ml", price: 20, subType: "Drinks" },
    { name: "Coca-Cola Can", price: 40, subType: "Drinks" },
    { name: "Kinley Water 500ml", price: 10, subType: "Drinks" },

    // ── Chocolates, Biscuits & Sweets (Vending 1 & 2) ──
    { name: "KitKat", price: 30, subType: "Sweets" },
    { name: "Dairy Milk Chocolate", price: 45, subType: "Sweets" },
    { name: "Amul Fruit Nut", price: 45, subType: "Sweets" },
    { name: "Amul Velvet Chocolate", price: 30, subType: "Sweets" },
    { name: "Amul Smooth Chocolate", price: 20, subType: "Sweets" },
    { name: "Dark Fantasy Vanilla", price: 30, subType: "Sweets" },
    { name: "Lotte Chocopie", price: 20, subType: "Sweets" },
    { name: "Oreo Vanilla Biscuit", price: 30, subType: "Sweets" },
    { name: "Dukes Bourbon", price: 25, subType: "Sweets" },
    { name: "Dukes Strawberry Cream", price: 25, subType: "Sweets" },
    { name: "Fab Vanilla Cream", price: 30, subType: "Sweets" },
    { name: "Milk Bikis Cream", price: 30, subType: "Sweets" },
    { name: "Butter Cookies", price: 20, subType: "Sweets" },
    { name: "Snow Blueberry Pie", price: 20, subType: "Sweets" },
    { name: "Nut & Grain Energy Bar", price: 20, subType: "Sweets" },
    { name: "Choco Desire Energy Bar", price: 20, subType: "Sweets" },
    { name: "Amul Premium Butter", price: 20, subType: "Sweets" },
  ],
  Snack: [
    { name: "CrunchEx Chili Tadka", price: 20 },
    { name: "Kurkure Masala Munch", price: 20 },
    { name: "Chili Chataka Kurkure", price: 20 },
    { name: "Lays Magic Masala", price: 20 },
    { name: "Lays Sizzling Hot", price: 20 },
    { name: "Lays West Indies Sweet Chilli", price: 20 },
    { name: "Puffcorn Lays", price: 20 },
    { name: "Balaji Masala Wafers", price: 20 },
    { name: "Balaji Salted Wafers", price: 20 },
    { name: "ACT Butter Popcorn", price: 20 },
    { name: "Gopal Masala Sev Murmura", price: 15 },
    { name: "Gopal Tikha Mitha Mix", price: 15 },
    { name: "Gopal Farali Chevdo", price: 20 },
    { name: "Gopal Moong Dal", price: 15 },
    { name: "Gopal Mexican Chilli", price: 20 },
    { name: "Bingo Mad Angles Achaari", price: 20 },
    { name: "Roaven Salted Peanut", price: 30 },
    { name: "Maggi 2-Min", price: 20 },
    { name: "Doritos Cheese", price: 30 },
  ],
  Beverage: [
    { name: "Frooti 400ml", price: 30 },
    { name: "Appy Fizz 250ml", price: 20 },
    { name: "Amul Kool Cafe", price: 40 },
    { name: "Amul Kool Dark Chocolate", price: 25 },
    { name: "Amul Kool Koko", price: 40 },
    { name: "Amul Kool Rose", price: 30 },
    { name: "Dark Fantasy Shake", price: 30 },
    { name: "Britannia Strawberry Shake", price: 40 },
    { name: "Britannia Vanilla Shake", price: 40 },
    { name: "Paper Boat Jamun", price: 25 },
    { name: "Swing Coconut Water", price: 20 },
    { name: "Jam-in Mix Fruit", price: 20 },
    { name: "Sprite MRP 20", price: 20 },
    { name: "Fanta 250ml", price: 20 },
    { name: "Coca-Cola Can", price: 40 },
    { name: "Kinley Water 500ml", price: 10 },
    { name: "Cold Coffee", price: 35 },
    { name: "Chai / Tea", price: 15 },
  ],
  Meal: [
    { name: "Paneer Butter Masala", price: 120 },
    { name: "Egg Roll", price: 50 },
    { name: "Veg Fried Rice", price: 80 },
    { name: "Chicken Biryani", price: 140 },
    { name: "Chole Bhature", price: 70 },
  ],
  Grocery: [
    { name: "Bread", price: 30 },
    { name: "Amul Butter", price: 55 },
    { name: "Milk 500ml", price: 32 },
    { name: "Eggs (6 pcs)", price: 45 },
    { name: "Instant Noodles", price: 20 },
  ],
  Stationery: [
    { name: "A4 Notebook", price: 60 },
    { name: "Blue Gel Pen", price: 10 },
    { name: "Sticky Notes", price: 40 },
    { name: "A4 Papers (50)", price: 50 },
    { name: "Highlighter", price: 25 },
  ],
  Medicine: [
    { name: "Paracetamol 650", price: 30 },
    { name: "Band-Aid", price: 10 },
    { name: "Strepsils", price: 35 },
    { name: "Vicks Inhaler", price: 60 },
    { name: "Digene / Eno", price: 10 },
  ],
};

export function CreateRequestForm({ requesterId }: { requesterId?: string }) {
  const router = useRouter();
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Step 1 State: Items
  const [items, setItems] = useState<ItemForm[]>([]);
  const [currentCategory, setCurrentCategory] = useState<Category>("Vending Machine");
  const [vendingSubFilter, setVendingSubFilter] = useState<"All" | "Drinks" | "Snacks" | "Sweets">("All");
  const [vendingSearch, setVendingSearch] = useState("");
  const [currentItemName, setCurrentItemName] = useState("");
  const [currentItemQty, setCurrentItemQty] = useState(1);
  const [currentItemPrice, setCurrentItemPrice] = useState("");
  const [itemInputError, setItemInputError] = useState(false);

  // Helper to get quantity of an item currently in cart
  const getItemQty = (name: string): number => {
    const found = items.find((it) => it.name.toLowerCase() === name.toLowerCase());
    return found ? found.quantity : 0;
  };

  // Step 2 State: Logistics & Reward
  const [pickupLocation, setPickupLocation] = useState(PICKUP_LOCATIONS[0]);
  const [customPickupLocation, setCustomPickupLocation] = useState("");
  const [dropoffHostel, setDropoffHostel] = useState(HOSTELS[0]);
  const [dropoffRoom, setDropoffRoom] = useState("");
  const [roomError, setRoomError] = useState(false);
  const [urgency, setUrgency] = useState<"standard" | "urgent">("standard");

  // Prefill default delivery location and notes from Settings defaults
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedHostel = localStorage.getItem("universe_default_hostel");
      const savedRoom = localStorage.getItem("universe_default_room");
      const savedInstructions = localStorage.getItem("universe_default_instructions");

      if (savedHostel && (HOSTELS as readonly string[]).includes(savedHostel)) {
        setDropoffHostel(savedHostel);
      }
      if (savedRoom) {
        setDropoffRoom(savedRoom);
      }
      if (savedInstructions) {
        setInstructions((prev) => prev || savedInstructions);
      }
    }
  }, []);

  // Total item count across all selected products
  const totalItemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  // Delivery Reward: strictly ₹5 per item minimum (minimum ₹5 if 0 or 1 item)
  const minRequiredReward = Math.max(5, totalItemCount * 5);

  const [customReward, setCustomReward] = useState<string>("5");

  // Keep customReward synced with minRequiredReward when items are added or removed
  useEffect(() => {
    setCustomReward((prev) => {
      const num = Number(prev);
      if (!prev || isNaN(num) || num < minRequiredReward) {
        return String(minRequiredReward);
      }
      return prev;
    });
  }, [minRequiredReward]);

  // Delivery Reward: strictly chosen by requester with minimum ₹5 per item
  const currentReward =
    customReward.trim() !== "" ? Math.max(minRequiredReward, Number(customReward) || minRequiredReward) : minRequiredReward;

  // Step 3 State: Extras
  const [instructions, setInstructions] = useState("");

  const totalEstimatedItemsAmount = items.reduce(
    (sum, item) => sum + (item.estimatedPrice || 0) * item.quantity,
    0
  );

  const handleAddItem = (overrideName?: string) => {
    const nameToAdd = (overrideName !== undefined ? overrideName : currentItemName).trim();
    if (!nameToAdd) {
      setItemInputError(true);
      return;
    }
    setItemInputError(false);

    const parsedPrice = currentItemPrice ? Math.max(0, Number(currentItemPrice)) : undefined;

    setItems((prev) => [
      ...prev,
      {
        id: Math.random().toString(36).substring(2, 9),
        name: nameToAdd,
        category: currentCategory,
        quantity: currentItemQty,
        estimatedPrice: parsedPrice,
      },
    ]);
    setCurrentItemName("");
    setCurrentItemQty(1);
    setCurrentItemPrice("");
    setFormError(null);
  };

  const handleQuickAdd = (name: string, price: number) => {
    setItems((prev) => {
      const idx = prev.findIndex((it) => it.name.toLowerCase() === name.toLowerCase());
      if (idx > -1) {
        const updated = [...prev];
        updated[idx] = { ...updated[idx], quantity: updated[idx].quantity + 1 };
        return updated;
      }
      return [
        ...prev,
        {
          id: Math.random().toString(36).substring(2, 9),
          name,
          category: currentCategory,
          quantity: 1,
          estimatedPrice: price,
        },
      ];
    });
    setCurrentItemName("");
    setCurrentItemPrice("");
    setItemInputError(false);
    setFormError(null);
  };

  const handleQuickRemove = (name: string) => {
    setItems((prev) => {
      const idx = prev.findIndex((it) => it.name.toLowerCase() === name.toLowerCase());
      if (idx === -1) return prev;
      if (prev[idx].quantity > 1) {
        const updated = [...prev];
        updated[idx] = { ...updated[idx], quantity: updated[idx].quantity - 1 };
        return updated;
      }
      return prev.filter((_, i) => i !== idx);
    });
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
    if (pickupLocation === "Other (Custom Spot)" && !customPickupLocation.trim()) {
      setFormError("Please enter your custom pickup spot.");
      return;
    }
    if (currentReward < minRequiredReward) {
      setFormError(`Minimum runner delivery reward must be at least ₹${minRequiredReward} (₹5 per item).`);
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
    if (currentReward < minRequiredReward) {
      setFormError(`Minimum runner delivery reward must be at least ₹${minRequiredReward} (₹5 per item).`);
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

      const finalPickup =
        pickupLocation === "Other (Custom Spot)"
          ? customPickupLocation.trim()
          : pickupLocation;

      const finalDropoff =
        dropoffHostel === "Other"
          ? `Class Room: ${dropoffRoom.trim()}`
          : `${dropoffHostel} - Room ${dropoffRoom.trim()}`;

      const finalInstructions = [
        instructions.trim(),
        urgency === "urgent" ? "[URGENT / EXPRESS PRIORITY]" : "",
      ]
        .filter(Boolean)
        .join(" ");

      // Generate unique 4-digit Handover PIN
      const freshOtp = Math.floor(1000 + Math.random() * 9000).toString();

      const requestData: Omit<InsertRequest, "requester_id"> = {
        pickup_location: finalPickup,
        dropoff_location: finalDropoff,
        instructions: finalInstructions || null,
        total_estimated_amount: totalEstimatedItemsAmount,
        delivery_fee: currentReward,
        status: "pending",
      };

      const itemsData: Omit<InsertItem, "request_id">[] = items.map((item) => ({
        name: item.name,
        quantity: item.quantity,
        notes: `Category: ${item.category}`,
        estimated_price: item.estimatedPrice || 0,
      }));

      // Resilient insert: Try with delivery_otp, fallback cleanly without it if column is not yet in DB schema
      let insertResult = await supabase
        .from("delivery_requests")
        .insert({ ...requestData, delivery_otp: freshOtp, requester_id: currentUserId })
        .select()
        .single();

      if (
        insertResult.error &&
        (insertResult.error.message?.includes("delivery_otp") ||
          insertResult.error.code === "PGRST204" ||
          insertResult.error.message?.includes("schema cache"))
      ) {
        insertResult = await supabase
          .from("delivery_requests")
          .insert({ ...requestData, requester_id: currentUserId })
          .select()
          .single();
      }

      const { data: request, error: requestError } = insertResult;

      if (requestError || !request) {
        console.error("Delivery request insert error:", requestError);
        setFormError(
          requestError?.message || "Failed to create delivery request. Please try again."
        );
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

      // Redirect immediately to live tracking page
      window.location.href = `/dashboard/requests/${request.id}`;
    } catch (error) {
      console.error("Unexpected submission error:", error);
      setFormError(
        error instanceof Error ? error.message : "An unexpected error occurred. Please try again."
      );
      setIsSubmitting(false);
    }
  };

  const categories: {
    label: Category;
    icon: React.ComponentType<{ size?: number; className?: string }>;
  }[] = [
    { label: "Vending Machine", icon: Store },
    { label: "Snack", icon: Pizza },
    { label: "Beverage", icon: Coffee },
    { label: "Meal", icon: Utensils },
    { label: "Grocery", icon: ShoppingBag },
    { label: "Stationery", icon: Book },
    { label: "Medicine", icon: Pill },
  ];

  return (
    <div className="max-w-[820px] mx-auto w-full flex flex-col items-center">
      {/* ── Dynamic Stepper Header ── */}
      <div className="w-full max-w-[620px] mb-8 sm:mb-10 px-2">
        <div className="flex items-center justify-between relative">
          {/* Step 1 Pill */}
          <button
            type="button"
            onClick={() => setStep(1)}
            className="flex flex-col items-center gap-2 z-10 cursor-pointer group bg-transparent border-none"
          >
            <div
              className={cn(
                "w-9 h-9 sm:w-11 sm:h-11 rounded-2xl flex items-center justify-center font-extrabold text-sm sm:text-base transition-all duration-300",
                step >= 1
                  ? "bg-[#00E676] text-[#050805] shadow-[0_0_20px_rgba(0,230,118,0.4)]"
                  : "bg-white/5 text-white/40 border border-white/10",
                step === 1 ? "ring-4 ring-[#00E676]/30 scale-105" : ""
              )}
            >
              {step > 1 ? <Check size={18} strokeWidth={3} /> : "1"}
            </div>
            <span
              className={cn(
                "text-[11px] sm:text-xs font-semibold tracking-wide transition-colors",
                step >= 1 ? "text-white" : "text-white/40"
              )}
            >
              Item Details
            </span>
          </button>

          {/* Line 1 -> 2 */}
          <div className="flex-1 h-0.5 mx-2 sm:mx-3 -mt-6 rounded-full bg-white/10 overflow-hidden">
            <div
              className={cn(
                "h-full bg-gradient-to-r from-[#00E676] to-emerald-400 transition-all duration-500",
                step >= 2 ? "w-full" : "w-0"
              )}
            />
          </div>

          {/* Step 2 Pill */}
          <button
            type="button"
            onClick={() => {
              if (items.length > 0) setStep(2);
            }}
            disabled={items.length === 0}
            className={cn(
              "flex flex-col items-center gap-2 z-10 bg-transparent border-none transition-opacity",
              items.length > 0 ? "cursor-pointer" : "cursor-not-allowed opacity-50"
            )}
          >
            <div
              className={cn(
                "w-9 h-9 sm:w-11 sm:h-11 rounded-2xl flex items-center justify-center font-extrabold text-sm sm:text-base transition-all duration-300 border",
                step >= 2
                  ? "bg-[#00E676] text-[#050805] border-[#00E676] shadow-[0_0_20px_rgba(0,230,118,0.4)]"
                  : "bg-[#0a0f0c]/60 text-white/40 border-white/15",
                step === 2 ? "ring-4 ring-[#00E676]/30 scale-105" : ""
              )}
            >
              {step > 2 ? <Check size={18} strokeWidth={3} /> : "2"}
            </div>
            <span
              className={cn(
                "text-[11px] sm:text-xs font-semibold tracking-wide transition-colors",
                step >= 2 ? "text-white" : "text-white/40"
              )}
            >
              Delivery & Reward
            </span>
          </button>

          {/* Line 2 -> 3 */}
          <div className="flex-1 h-0.5 mx-2 sm:mx-3 -mt-6 rounded-full bg-white/10 overflow-hidden">
            <div
              className={cn(
                "h-full bg-gradient-to-r from-[#00E676] to-emerald-400 transition-all duration-500",
                step === 3 ? "w-full" : "w-0"
              )}
            />
          </div>

          {/* Step 3 Pill */}
          <button
            type="button"
            onClick={() => {
              if (items.length > 0 && dropoffRoom.trim()) setStep(3);
            }}
            disabled={items.length === 0 || !dropoffRoom.trim()}
            className={cn(
              "flex flex-col items-center gap-2 z-10 bg-transparent border-none transition-opacity",
              items.length > 0 && dropoffRoom.trim()
                ? "cursor-pointer"
                : "cursor-not-allowed opacity-50"
            )}
          >
            <div
              className={cn(
                "w-9 h-9 sm:w-11 sm:h-11 rounded-2xl flex items-center justify-center font-extrabold text-sm sm:text-base transition-all duration-300 border",
                step === 3
                  ? "bg-[#00E676] text-[#050805] border-[#00E676] ring-4 ring-[#00E676]/30 shadow-[0_0_20px_rgba(0,230,118,0.4)] scale-105"
                  : "bg-[#0a0f0c]/60 text-white/40 border-white/15"
              )}
            >
              3
            </div>
            <span
              className={cn(
                "text-[11px] sm:text-xs font-semibold tracking-wide transition-colors",
                step === 3 ? "text-white" : "text-white/40"
              )}
            >
              Confirm
            </span>
          </button>
        </div>
      </div>

      {/* Global Form Error Banner */}
      {formError && (
        <div
          role="alert"
          className="w-full bg-red-500/15 border border-red-500/40 rounded-2xl p-4 text-red-300 text-xs sm:text-sm flex items-center gap-3 mb-6 shadow-[0_4px_20px_rgba(239,68,68,0.15)]"
        >
          <AlertCircle size={20} className="text-red-400 shrink-0" />
          <span className="font-medium">{formError}</span>
        </div>
      )}

      {/* Main Glassmorphic Form Card */}
      <div className="bg-[#0a0f0c]/65 border border-white/10 hover:border-emerald-500/20 rounded-[24px] sm:rounded-[28px] p-5 sm:p-8 lg:p-9 w-full shadow-[0_12px_45px_rgba(0,0,0,0.6),0_0_30px_rgba(0,230,118,0.04)] backdrop-blur-2xl flex flex-col gap-6 sm:gap-8 transition-all">
        {/* ================= STEP 1: ITEM DETAILS ================= */}
        {step === 1 && (
          <>
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center border border-emerald-500/30 shrink-0 shadow-[0_0_15px_rgba(0,230,118,0.15)]">
                <Box size={22} className="text-[#00E676]" />
              </div>
              <div>
                <h2 className="text-white font-extrabold text-lg sm:text-xl tracking-tight leading-tight">
                  What do you need delivered?
                </h2>
                <p className="text-[#A7B8B0] text-xs sm:text-sm mt-1">
                  Pick a category, tap quick campus favorites or type any custom item.
                </p>
              </div>
            </div>

            {/* Categories Grid */}
            <div className="grid grid-cols-3 sm:grid-cols-7 gap-2 sm:gap-2.5 w-full">
              {categories.map((cat) => {
                const isActive = currentCategory === cat.label;
                const IconComp = cat.icon;
                return (
                  <button
                    key={cat.label}
                    type="button"
                    onClick={() => setCurrentCategory(cat.label)}
                    className={cn(
                      "relative rounded-2xl h-[78px] sm:h-[90px] w-full flex flex-col items-center justify-center gap-1.5 sm:gap-2 cursor-pointer transition-all duration-200 border overflow-hidden",
                      isActive
                        ? "bg-emerald-500/15 border-[#00E676] shadow-[0_0_20px_rgba(0,230,118,0.25)] scale-[1.02]"
                        : "bg-white/[0.02] border-white/10 hover:border-white/20 hover:bg-white/[0.04]"
                    )}
                  >
                    <IconComp
                      size={22}
                      className={cn(
                        "transition-colors",
                        isActive ? "text-[#00E676]" : "text-[#A7B8B0]"
                      )}
                    />
                    <span
                      className={cn(
                        "text-[10.5px] sm:text-xs tracking-tight text-center px-1 leading-tight",
                        isActive ? "text-white font-bold" : "text-[#A7B8B0] font-medium"
                      )}
                    >
                      {cat.label}
                    </span>
                    {isActive && (
                      <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#00E676] to-transparent" />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Quick-Pick Popular Chips */}
            <div className="flex flex-col gap-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs text-[#A7B8B0]">
                  <Sparkles size={13} className="text-[#00E676]" />
                  <span>
                    {currentCategory === "Vending Machine"
                      ? "Hostel Vending Machine Live Stock (Tap to 1-click add):"
                      : `Popular ${currentCategory} items (tap to 1-click add):`}
                  </span>
                </div>
                {currentCategory === "Vending Machine" && (
                  <span className="text-[10px] uppercase font-extrabold text-[#00E676] bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#00E676] animate-pulse" />
                    Hostel GF Machines
                  </span>
                )}
              </div>

              {/* Vending Machine Filter & Search Header */}
              {currentCategory === "Vending Machine" && (
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                  {/* Sub-Category Tabs */}
                  <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs select-none flex-1">
                    {(["All", "Drinks", "Snacks", "Sweets"] as const).map((sub) => {
                      const isSubActive = vendingSubFilter === sub;
                      const count =
                        sub === "All"
                          ? VENDING_PRODUCTS.length
                          : VENDING_PRODUCTS.filter((it) => it.subType === sub).length;
                      return (
                        <button
                          key={sub}
                          type="button"
                          onClick={() => setVendingSubFilter(sub)}
                          className={cn(
                            "px-2.5 py-1 rounded-lg font-semibold cursor-pointer transition-all border text-[11px] whitespace-nowrap",
                            isSubActive
                              ? "bg-[#00E676]/20 border-[#00E676] text-[#00E676] shadow-[0_0_10px_rgba(0,230,118,0.2)] font-bold"
                              : "bg-white/[0.03] border-white/10 text-white/60 hover:text-white hover:border-white/20"
                          )}
                        >
                          {sub === "All" && `All (${count})`}
                          {sub === "Drinks" && `🥤 Drinks (${count})`}
                          {sub === "Snacks" && `🍿 Chips (${count})`}
                          {sub === "Sweets" && `🍫 Chocolates (${count})`}
                        </button>
                      );
                    })}
                  </div>

                  {/* Instant Quick Search Bar */}
                  <div className="relative w-full sm:w-52 shrink-0">
                    <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-white/40 pointer-events-none" />
                    <input
                      type="text"
                      placeholder="Search 57 snacks & drinks..."
                      value={vendingSearch}
                      onChange={(e) => setVendingSearch(e.target.value)}
                      className="w-full bg-black/40 border border-white/10 focus:border-[#00E676] rounded-xl pl-7 pr-7 py-1.5 text-xs text-white placeholder:text-white/30 outline-none transition-all"
                    />
                    {vendingSearch && (
                      <button
                        type="button"
                        onClick={() => setVendingSearch("")}
                        className="absolute right-2 top-1/2 -translate-y-1/2 text-white/40 hover:text-white cursor-pointer"
                        title="Clear search"
                      >
                        <X size={12} />
                      </button>
                    )}
                  </div>
                </div>
              )}

              {currentCategory === "Vending Machine" ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5 sm:gap-3 max-h-[460px] overflow-y-auto pr-1.5 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-black/20 [&::-webkit-scrollbar-thumb]:bg-emerald-500/30 hover:[&::-webkit-scrollbar-thumb]:bg-[#00E676]/60 [&::-webkit-scrollbar-thumb]:rounded-full">
                  {VENDING_PRODUCTS.filter((item) => {
                    const matchesTab = vendingSubFilter === "All" || item.subType === vendingSubFilter;
                    const q = vendingSearch.trim().toLowerCase();
                    const matchesSearch =
                      !q ||
                      item.name.toLowerCase().includes(q) ||
                      item.slot.toLowerCase().includes(q);
                    return matchesTab && matchesSearch;
                  }).map((prod) => {
                    const qty = getItemQty(prod.name);
                    const isInCart = qty > 0;
                    return (
                      <div
                        key={prod.id}
                        onClick={() => {
                          if (!isInCart) handleQuickAdd(prod.name, prod.price);
                        }}
                        className={cn(
                          "group relative border rounded-2xl p-2.5 sm:p-3 flex flex-col justify-between transition-all duration-200 cursor-pointer shadow-md select-none",
                          isInCart
                            ? "bg-[#122319] border-[#00E676] ring-1 ring-[#00E676]/40 shadow-[0_0_20px_rgba(0,230,118,0.22)]"
                            : "bg-[#0e1612]/90 hover:bg-[#132219] border-white/10 hover:border-[#00E676]/60 hover:shadow-[0_0_20px_rgba(0,230,118,0.2)] hover:-translate-y-0.5"
                        )}
                      >
                        {/* Top-Right Cart Quantity Indicator Badge */}
                        {isInCart && (
                          <span className="absolute -top-1.5 -right-1.5 bg-[#00E676] text-[#050805] text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center shadow-lg border border-[#050805] z-10 animate-in fade-in zoom-in-75">
                            {qty}
                          </span>
                        )}

                        {/* Product Packaging Image */}
                        <div className="relative w-full aspect-square rounded-xl bg-black/40 border border-white/5 flex items-center justify-center p-2 mb-2 overflow-hidden group-hover:border-[#00E676]/20 transition-colors">
                          <img
                            src={prod.image}
                            alt={prod.name}
                            loading="lazy"
                            className="w-full h-full object-contain drop-shadow-[0_4px_8px_rgba(0,0,0,0.5)] group-hover:scale-105 transition-transform duration-300"
                          />
                          {/* Category badge */}
                          <span className="absolute top-1.5 left-1.5 text-[9px] font-semibold text-white/60 bg-black/70 px-1.5 py-0.5 rounded-md backdrop-blur-sm border border-white/5">
                            {prod.subType === "Drinks" ? "Drink" : prod.subType === "Snacks" ? "Snack" : "Sweet"}
                          </span>
                          {/* Vending Machine Slot Code (e.g., A-01, B-03) */}
                          <span className="absolute top-1.5 right-1.5 text-[9px] font-mono font-bold text-[#00E676] bg-black/80 px-1.5 py-0.5 rounded border border-emerald-500/30 shadow-sm">
                            {prod.slot}
                          </span>
                        </div>

                        {/* Title */}
                        <h4 className="text-white/90 group-hover:text-white font-medium text-xs line-clamp-2 leading-snug mb-2 min-h-[32px]">
                          {prod.name}
                        </h4>

                        {/* Price + Quick Add / In-Card Stepper */}
                        <div className="flex items-center justify-between mt-auto pt-1.5 border-t border-white/5">
                          <span className="text-[#00E676] font-extrabold text-xs sm:text-sm tracking-tight">
                            ₹{prod.price}
                          </span>

                          {isInCart ? (
                            <div className="flex items-center bg-[#00E676] text-[#050805] rounded-lg p-0.5 shadow-[0_0_12px_rgba(0,230,118,0.35)]">
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleQuickRemove(prod.name);
                                }}
                                className="w-6 h-6 flex items-center justify-center hover:bg-black/20 rounded transition-colors active:scale-90"
                                title={`Remove 1 ${prod.name}`}
                              >
                                <Minus size={12} strokeWidth={3} />
                              </button>
                              <span className="text-xs font-black px-1.5 min-w-[16px] text-center">
                                {qty}
                              </span>
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleQuickAdd(prod.name, prod.price);
                                }}
                                className="w-6 h-6 flex items-center justify-center hover:bg-black/20 rounded transition-colors active:scale-90"
                                title={`Add 1 more ${prod.name}`}
                              >
                                <Plus size={12} strokeWidth={3} />
                              </button>
                            </div>
                          ) : (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleQuickAdd(prod.name, prod.price);
                              }}
                              className="w-7 h-7 rounded-lg bg-emerald-500/15 group-hover:bg-[#00E676] text-[#00E676] group-hover:text-[#050805] border border-emerald-500/30 group-hover:border-[#00E676] flex items-center justify-center transition-all cursor-pointer shadow-sm active:scale-90"
                              title={`Add ${prod.name}`}
                            >
                              <Plus size={14} strokeWidth={2.5} />
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}

                  {/* Empty Search Results */}
                  {VENDING_PRODUCTS.filter((item) => {
                    const matchesTab = vendingSubFilter === "All" || item.subType === vendingSubFilter;
                    const q = vendingSearch.trim().toLowerCase();
                    return matchesTab && (!q || item.name.toLowerCase().includes(q) || item.slot.toLowerCase().includes(q));
                  }).length === 0 && (
                    <div className="col-span-full py-12 text-center flex flex-col items-center justify-center gap-2 text-white/50">
                      <p className="text-xs">No vending machine items found matching &quot;{vendingSearch}&quot;</p>
                      <button
                        type="button"
                        onClick={() => {
                          setVendingSearch("");
                          setVendingSubFilter("All");
                        }}
                        className="text-xs font-semibold text-[#00E676] hover:underline cursor-pointer"
                      >
                        Reset search and view all items
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex flex-wrap gap-1.5 sm:gap-2 max-h-[220px] overflow-y-auto pr-1">
                  {(POPULAR_ITEMS[currentCategory] || []).map((chip) => (
                    <button
                      key={chip.name}
                      type="button"
                      onClick={() => handleQuickAdd(chip.name, chip.price)}
                      className="group text-xs bg-white/[0.04] hover:bg-emerald-500/15 text-white/85 hover:text-[#00E676] border border-white/10 hover:border-emerald-500/30 px-3 py-1.5 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 active:scale-95 shadow-sm"
                      title={`Click to quickly add ${chip.name} (₹${chip.price})`}
                    >
                      <Plus size={12} className="text-[#00E676] group-hover:rotate-90 transition-transform" />
                      <span className="font-medium">{chip.name}</span>
                      <span className="text-emerald-400 font-bold text-[11px] bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20">
                        ₹{chip.price}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Input Row: Item Name + Optional Est Price + Quantity + Add */}
            <div className="flex flex-col gap-3 bg-black/40 border border-white/10 p-3.5 sm:p-4 rounded-2xl">
              <div className="flex flex-wrap gap-2.5 sm:gap-3 items-center">
                {/* Item Name Input */}
                <div className="flex-1 min-w-[200px]">
                  <input
                    type="text"
                    placeholder={`Type ${currentCategory.toLowerCase()} name...`}
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
                    className={cn(
                      "w-full bg-white/[0.04] border rounded-xl px-3.5 py-3 text-white text-sm outline-none transition-all placeholder:text-white/30",
                      itemInputError
                        ? "border-red-500 ring-1 ring-red-500"
                        : "border-white/10 focus:border-[#00E676] focus:bg-white/[0.06]"
                    )}
                  />
                </div>

                {/* Optional Estimated Price */}
                <div className="w-28 sm:w-32 flex items-center bg-white/[0.04] border border-white/10 rounded-xl px-3 py-2.5 focus-within:border-[#00E676]">
                  <span className="text-emerald-400 font-bold text-xs mr-1">₹</span>
                  <input
                    type="number"
                    min={0}
                    placeholder="Est. price"
                    value={currentItemPrice}
                    onChange={(e) => setCurrentItemPrice(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleAddItem();
                      }
                    }}
                    className="w-full bg-transparent border-none text-white text-xs outline-none placeholder:text-white/30"
                  />
                </div>

                {/* Quantity Controls */}
                <div className="flex items-center bg-white/[0.04] border border-white/10 rounded-xl overflow-hidden">
                  <button
                    type="button"
                    onClick={() => setCurrentItemQty(Math.max(1, currentItemQty - 1))}
                    className="bg-transparent border-none text-white/70 hover:text-white px-3 py-2.5 cursor-pointer hover:bg-white/5 transition-colors"
                  >
                    <Minus size={14} />
                  </button>
                  <span className="text-white font-extrabold text-sm min-w-[24px] text-center">
                    {currentItemQty}
                  </span>
                  <button
                    type="button"
                    onClick={() => setCurrentItemQty(currentItemQty + 1)}
                    className="bg-transparent border-none text-white/70 hover:text-white px-3 py-2.5 cursor-pointer hover:bg-white/5 transition-colors"
                  >
                    <Plus size={14} />
                  </button>
                </div>

                {/* Add Button */}
                <button
                  type="button"
                  onClick={() => handleAddItem()}
                  className="bg-emerald-500 hover:bg-emerald-400 text-[#050805] font-extrabold text-sm px-5 py-3 rounded-xl cursor-pointer flex items-center gap-1.5 shadow-[0_0_15px_rgba(0,230,118,0.3)] transition-all active:scale-95"
                >
                  <Plus size={16} strokeWidth={3} /> Add
                </button>
              </div>

              {itemInputError && (
                <span className="text-red-400 text-xs font-semibold">
                  * Please enter an item name before clicking Add.
                </span>
              )}
            </div>

            {/* Added Items List */}
            <div className="flex flex-col gap-3">
              <div className="flex justify-between items-center px-1">
                <span className="text-[#A7B8B0] text-xs font-semibold uppercase tracking-wider">
                  Added Items ({items.length})
                </span>
                {items.length > 0 && (
                  <button
                    type="button"
                    onClick={handleClearAll}
                    className="bg-transparent border-none text-[#A7B8B0] hover:text-red-400 text-xs flex items-center gap-1.5 cursor-pointer transition-colors"
                  >
                    <Trash2 size={13} /> Clear all
                  </button>
                )}
              </div>

              {items.length === 0 ? (
                <div className="border border-dashed border-white/15 rounded-2xl p-8 sm:p-10 flex flex-col items-center justify-center gap-2 bg-black/25 text-center">
                  <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mb-1">
                    <Box size={24} className="text-[#00E676] opacity-80" />
                  </div>
                  <h4 className="text-white font-bold text-sm sm:text-base m-0">No items added yet</h4>
                  <p className="text-[#A7B8B0] text-xs max-w-xs m-0">
                    Tap popular chips above or type items and hit &ldquo;Add&rdquo;.
                  </p>
                </div>
              ) : (
                <div className="flex flex-col gap-2 bg-black/35 rounded-2xl p-3 border border-white/10 max-h-[280px] overflow-y-auto">
                  {items.map((item) => (
                    <div
                      key={item.id}
                      className="flex justify-between items-center p-3 rounded-xl bg-white/[0.02] border border-white/5 hover:border-white/10 transition-colors"
                    >
                      <div className="flex items-center gap-2.5">
                        <span className="bg-[#00E676]/15 text-[#00E676] text-xs font-extrabold px-2 py-0.5 rounded-md">
                          {item.quantity}x
                        </span>
                        <span className="text-white font-semibold text-sm">{item.name}</span>
                        <span className="text-[#A7B8B0] text-[11px] px-2 py-0.5 bg-white/5 rounded-md">
                          {item.category}
                        </span>
                        {item.estimatedPrice ? (
                          <span className="text-emerald-400/90 text-xs font-medium">
                            ~₹{item.estimatedPrice * item.quantity}
                          </span>
                        ) : null}
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveItem(item.id)}
                        className="bg-transparent border-none text-white/40 hover:text-red-400 cursor-pointer p-1.5 rounded-lg transition-colors"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))}

                  {totalEstimatedItemsAmount > 0 && (
                    <div className="pt-2 border-t border-white/10 flex justify-between items-center text-xs text-[#A7B8B0] px-2">
                      <span>Est. Items Total:</span>
                      <span className="text-white font-bold text-sm">₹{totalEstimatedItemsAmount}</span>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Continue Button */}
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
              className={cn(
                "w-full font-extrabold text-sm sm:text-base p-4 rounded-2xl border-none flex items-center justify-center gap-2 transition-all duration-200",
                items.length > 0
                  ? "bg-gradient-to-r from-[#00C853] to-[#00E676] text-[#050805] cursor-pointer shadow-[0_0_25px_rgba(0,230,118,0.35)] hover:shadow-[0_0_35px_rgba(0,230,118,0.5)] active:scale-[0.99]"
                  : "bg-white/5 text-white/30 cursor-not-allowed"
              )}
            >
              Continue to Delivery Details <ArrowRight size={18} />
            </button>
          </>
        )}

        {/* ================= STEP 2: LOGISTICS & REWARD ================= */}
        {step === 2 && (
          <>
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center border border-emerald-500/30 shrink-0 shadow-[0_0_15px_rgba(0,230,118,0.15)]">
                <MapPin size={22} className="text-[#00E676]" />
              </div>
              <div>
                <h2 className="text-white font-extrabold text-lg sm:text-xl tracking-tight leading-tight">
                  Logistics & Runner Reward
                </h2>
                <p className="text-[#A7B8B0] text-xs sm:text-sm mt-1">
                  Specify where to fetch your items and the reward for the student runner.
                </p>
              </div>
            </div>

            {/* Selected Items Review Card */}
            <div className="bg-[#0e1612]/95 border border-emerald-500/25 rounded-2xl p-4 flex flex-col gap-3 shadow-[0_4px_20px_rgba(0,0,0,0.4)]">
              <div className="flex items-center justify-between">
                <span className="text-xs text-[#00E676] font-bold flex items-center gap-1.5 uppercase tracking-wider">
                  <Box size={14} className="text-[#00E676]" />
                  Selected Items ({totalItemCount} {totalItemCount === 1 ? "item" : "items"})
                </span>
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="text-xs font-semibold text-[#00E676] hover:underline cursor-pointer flex items-center gap-1"
                >
                  Edit Items
                </button>
              </div>
              <div className="flex flex-col gap-2 max-h-[170px] overflow-y-auto pr-1 [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-thumb]:bg-emerald-500/30 [&::-webkit-scrollbar-thumb]:rounded-full">
                {items.map((it) => (
                  <div
                    key={it.id}
                    className="flex items-center justify-between bg-black/40 border border-white/10 rounded-xl px-3.5 py-2 text-xs"
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="text-[#00E676] font-black bg-emerald-500/15 px-2 py-0.5 rounded-md border border-emerald-500/25">
                        {it.quantity}x
                      </span>
                      <span className="text-white font-semibold">{it.name}</span>
                      <span className="text-white/40 text-[10px]">({it.category})</span>
                    </div>
                    <span className="text-emerald-400 font-bold">
                      {it.estimatedPrice !== undefined
                        ? `~₹${it.estimatedPrice * it.quantity}`
                        : "Custom price"}
                    </span>
                  </div>
                ))}
              </div>
              <div className="flex flex-wrap items-center justify-between pt-2 border-t border-white/5 text-xs gap-2">
                <span className="text-[#A7B8B0]">
                  Items Est. Total:{" "}
                  <strong className="text-white">~₹{totalEstimatedItemsAmount}</strong>
                </span>
                <span className="text-[#A7B8B0]">
                  Delivery Reward:{" "}
                  <strong className="text-[#00E676]">
                    ₹5 × {totalItemCount} items = ₹{minRequiredReward}
                  </strong>
                </span>
              </div>
            </div>

            <div className="flex flex-col gap-6">
              {/* Pickup Location */}
              <div className="flex flex-col gap-2.5">
                <label className="text-[#00E676] text-xs sm:text-sm font-bold flex items-center gap-1.5">
                  <MapPin size={14} /> Pickup Location
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {PICKUP_LOCATIONS.map((loc) => {
                    const isSelected = pickupLocation === loc;
                    return (
                      <button
                        key={loc}
                        type="button"
                        onClick={() => setPickupLocation(loc)}
                        className={cn(
                          "p-3 rounded-xl text-left cursor-pointer text-xs sm:text-sm font-medium transition-all border",
                          isSelected
                            ? "bg-emerald-500/20 border-[#00E676] text-[#00E676] font-bold shadow-[0_0_15px_rgba(0,230,118,0.2)]"
                            : "bg-black/40 border-white/10 text-white/80 hover:border-white/20"
                        )}
                      >
                        {loc}
                      </button>
                    );
                  })}
                </div>

                {pickupLocation === "Hostel Vending Machine" && (
                  <div className="flex items-center gap-2.5 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/25 text-xs text-emerald-300">
                    <Zap size={15} className="text-[#00E676] shrink-0" />
                    <span>
                      <strong>Hostel Vending Machine:</strong> Student runners in your hostel can dispense and deliver your items to your room in 3–5 minutes!
                    </span>
                  </div>
                )}

                {pickupLocation === "Other (Custom Spot)" && (
                  <input
                    type="text"
                    placeholder="Enter custom pickup spot (e.g. Nescafe near Library, Gate 2 Tapri)..."
                    value={customPickupLocation}
                    onChange={(e) => setCustomPickupLocation(e.target.value)}
                    className="w-full mt-1 bg-black/40 border border-white/10 focus:border-[#00E676] rounded-xl px-4 py-3 text-white text-sm outline-none transition-colors"
                  />
                )}
              </div>

              {/* Delivery Destination */}
              <div className="flex flex-col gap-3 border-t border-white/10 pt-5">
                <label className="text-[#00E676] text-xs sm:text-sm font-bold flex items-center gap-1.5">
                  <MapPin size={14} /> Delivery Destination (Hostel & Room)
                </label>

                {/* Hostel & Other Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                  {HOSTELS.map((hostel) => {
                    const isSelected = dropoffHostel === hostel;
                    return (
                      <button
                        key={hostel}
                        type="button"
                        onClick={() => {
                          setDropoffHostel(hostel);
                          if (roomError) setRoomError(false);
                        }}
                        className={cn(
                          "py-2.5 px-3 rounded-xl text-center cursor-pointer text-xs sm:text-sm font-medium transition-all border",
                          isSelected
                            ? "bg-emerald-500/20 border-[#00E676] text-[#00E676] font-bold shadow-[0_0_15px_rgba(0,230,118,0.2)]"
                            : "bg-black/40 border-white/10 text-white/80 hover:border-white/20"
                        )}
                      >
                        {hostel}
                      </button>
                    );
                  })}
                </div>

                {/* Single Room / Classroom Input */}
                <div className="flex flex-col gap-1 mt-1">
                  <input
                    type="text"
                    placeholder={
                      dropoffHostel === "Other"
                        ? "Class Room (e.g. 104, B-205)..."
                        : "Room Number (e.g. 104, B-205)..."
                    }
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
                      "bg-black/40 rounded-xl px-4 py-3 text-white text-sm outline-none border transition-all placeholder:text-white/30",
                      roomError
                        ? "border-red-500 ring-1 ring-red-500"
                        : "border-white/10 focus:border-[#00E676]"
                    )}
                  />
                  {roomError && (
                    <span className="text-red-400 text-xs font-semibold mt-0.5">
                      * {dropoffHostel === "Other" ? "Classroom / spot detail" : "Room number"} is required so runner can find you.
                    </span>
                  )}
                </div>
              </div>

              {/* Delivery Speed / Priority Option */}
              <div className="flex flex-col gap-2.5 border-t border-white/10 pt-5">
                <label className="text-[#00E676] text-xs sm:text-sm font-bold flex items-center gap-1.5">
                  <Clock size={14} /> Delivery Speed & Priority
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <button
                    type="button"
                    onClick={() => setUrgency("standard")}
                    className={cn(
                      "p-3.5 rounded-xl border text-left cursor-pointer transition-all flex flex-col gap-1",
                      urgency === "standard"
                        ? "bg-emerald-500/15 border-[#00E676] shadow-[0_0_15px_rgba(0,230,118,0.15)]"
                        : "bg-black/35 border-white/10 hover:border-white/20"
                    )}
                  >
                    <span
                      className={cn(
                        "text-xs font-bold",
                        urgency === "standard" ? "text-emerald-400" : "text-white"
                      )}
                    >
                      🟢 Standard Delivery
                    </span>
                    <span className="text-[11px] text-[#A7B8B0]">
                      Usually delivered within 30-45 minutes
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setUrgency("urgent")}
                    className={cn(
                      "p-3.5 rounded-xl border text-left cursor-pointer transition-all flex flex-col gap-1",
                      urgency === "urgent"
                        ? "bg-emerald-500/15 border-[#00E676] shadow-[0_0_15px_rgba(0,230,118,0.15)]"
                        : "bg-black/35 border-white/10 hover:border-white/20"
                    )}
                  >
                    <span
                      className={cn(
                        "text-xs font-bold",
                        urgency === "urgent" ? "text-emerald-400" : "text-white"
                      )}
                    >
                      ⚡ Express Priority
                    </span>
                    <span className="text-[11px] text-[#A7B8B0]">
                      High runner priority for fast delivery
                    </span>
                  </button>
                </div>
              </div>

              {/* Delivery Reward - Strictly User Defined (Min ₹5 per item) */}
              <div className="flex flex-col gap-2.5 border-t border-white/10 pt-5">
                <div className="flex justify-between items-center">
                  <label className="text-[#00E676] text-xs sm:text-sm font-bold flex items-center gap-1.5">
                    <Coins size={14} /> Delivery Reward for Runner
                  </label>
                  <span className="text-emerald-400/90 text-[11px] font-semibold bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-0.5 rounded-full">
                    ₹5 per item (Min ₹{minRequiredReward})
                  </span>
                </div>
                <p className="text-[#A7B8B0] text-xs m-0">
                  You have selected {totalItemCount} {totalItemCount === 1 ? "item" : "items"}, so the minimum reward is ₹{minRequiredReward} (₹5 per item). You can also add an extra tip/reward for faster runner pickup.
                </p>

                <div className="flex flex-wrap items-center gap-2.5">
                  <div className="flex items-center bg-black/40 border border-white/15 rounded-xl px-4 py-2.5 focus-within:border-[#00E676]">
                    <span className="text-[#00E676] text-lg font-extrabold mr-2">₹</span>
                    <input
                      type="number"
                      min={minRequiredReward}
                      placeholder={String(minRequiredReward)}
                      value={customReward}
                      onChange={(e) => setCustomReward(e.target.value)}
                      className="bg-transparent border-none text-white text-base font-extrabold w-24 outline-none placeholder:text-white/30"
                    />
                  </div>

                  {/* Preset quick buttons */}
                  <div className="flex flex-wrap gap-1.5 sm:gap-2">
                    {[
                      { label: `₹${minRequiredReward} (Min)`, val: String(minRequiredReward) },
                      { label: `₹${minRequiredReward + 5}`, val: String(minRequiredReward + 5) },
                      { label: `₹${minRequiredReward + 10}`, val: String(minRequiredReward + 10) },
                      { label: `₹${minRequiredReward + 20}`, val: String(minRequiredReward + 20) },
                      { label: `₹${minRequiredReward + 35}`, val: String(minRequiredReward + 35) },
                      { label: `₹${minRequiredReward + 50}`, val: String(minRequiredReward + 50) },
                    ].map((btn) => (
                      <button
                        key={btn.val}
                        type="button"
                        onClick={() => setCustomReward(btn.val)}
                        className={cn(
                          "rounded-xl px-3 py-2 text-xs font-bold cursor-pointer transition-all border",
                          customReward === btn.val
                            ? "bg-[#00E676]/20 border-[#00E676] text-[#00E676] shadow-[0_0_10px_rgba(0,230,118,0.2)] font-extrabold"
                            : "bg-white/5 border-white/10 text-[#A7B8B0] hover:text-white"
                        )}
                      >
                        {btn.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Navigation Buttons */}
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="bg-white/5 border border-white/10 text-white p-3.5 rounded-2xl cursor-pointer flex items-center justify-center w-14 shrink-0 hover:bg-white/10 transition-colors"
                >
                  <ArrowLeft size={18} />
                </button>
                <button
                  type="button"
                  onClick={handleStep2Continue}
                  className="flex-1 bg-gradient-to-r from-[#00C853] to-[#00E676] text-[#050805] font-extrabold text-sm sm:text-base p-4 rounded-2xl border-none flex items-center justify-center gap-2 cursor-pointer shadow-[0_0_25px_rgba(0,230,118,0.35)] hover:shadow-[0_0_35px_rgba(0,230,118,0.5)] active:scale-[0.99] transition-all"
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
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center border border-emerald-500/30 shrink-0 shadow-[0_0_15px_rgba(0,230,118,0.15)]">
                <Check size={22} className="text-[#00E676]" />
              </div>
              <div>
                <h2 className="text-white font-extrabold text-lg sm:text-xl tracking-tight leading-tight">
                  Review & Confirm Request
                </h2>
                <p className="text-[#A7B8B0] text-xs sm:text-sm mt-1">
                  Double check your request details before publishing for campus runners.
                </p>
              </div>
            </div>

            <div className="flex flex-col gap-6">
              {/* Optional Instructions */}
              <div className="flex flex-col gap-2">
                <label className="text-[#00E676] text-xs sm:text-sm font-bold">
                  Special Instructions (Optional)
                </label>
                <textarea
                  placeholder="e.g. Call when outside the hostel gate. Prefer chilled if cold coffee..."
                  value={instructions}
                  onChange={(e) => setInstructions(e.target.value)}
                  className="bg-black/40 border border-white/10 focus:border-[#00E676] rounded-2xl p-4 text-white text-sm min-h-[90px] resize-y outline-none transition-colors placeholder:text-white/30"
                />
              </div>

              {/* Order Summary Glass Card */}
              <div className="bg-emerald-500/[0.04] border border-emerald-500/20 rounded-2xl p-4 sm:p-5 flex flex-col gap-3.5">
                {/* Items preview */}
                <div className="flex justify-between items-start text-xs sm:text-sm">
                  <span className="text-[#A7B8B0] font-medium">Items ({totalItemCount} {totalItemCount === 1 ? "item" : "items"})</span>
                  <div className="text-right flex flex-col gap-1 max-w-[280px]">
                    {items.map((i) => (
                      <span key={i.id} className="text-white font-semibold text-xs sm:text-sm">
                        {i.quantity}x {i.name}{" "}
                        <span className="text-[#A7B8B0] text-xs">({i.category})</span>
                      </span>
                    ))}
                  </div>
                </div>

                {/* Pickup */}
                <div className="flex justify-between items-center text-xs sm:text-sm border-t border-white/5 pt-3">
                  <span className="text-[#A7B8B0] font-medium">Pickup Spot</span>
                  <span className="text-white font-bold">
                    {pickupLocation === "Other (Custom Spot)"
                      ? customPickupLocation || "Custom Spot"
                      : pickupLocation}
                  </span>
                </div>

                {/* Dropoff */}
                <div className="flex justify-between items-center text-xs sm:text-sm">
                  <span className="text-[#A7B8B0] font-medium">Delivery Destination</span>
                  <span className="text-white font-bold text-right">
                    {dropoffHostel === "Other"
                      ? `Class Room: ${dropoffRoom}`
                      : `${dropoffHostel}, Room ${dropoffRoom}`}
                  </span>
                </div>

                {/* Speed */}
                <div className="flex justify-between items-center text-xs sm:text-sm">
                  <span className="text-[#A7B8B0] font-medium">Delivery Speed</span>
                  <span className="text-emerald-400 font-bold">
                    {urgency === "urgent" ? "⚡ Express Priority" : "🟢 Standard (~30-45m)"}
                  </span>
                </div>

                {totalEstimatedItemsAmount > 0 && (
                  <div className="flex justify-between items-center text-xs sm:text-sm border-t border-white/5 pt-2">
                    <span className="text-[#A7B8B0] font-medium">Est. Items Cost</span>
                    <span className="text-white font-bold">~₹{totalEstimatedItemsAmount}</span>
                  </div>
                )}

                {/* Total Reward Highlight */}
                <div className="border-t border-emerald-500/20 pt-3 flex justify-between items-center">
                  <div className="flex flex-col">
                    <span className="text-white text-sm sm:text-base font-extrabold">
                      Runner Delivery Reward
                    </span>
                    <span className="text-[#A7B8B0] text-[11px]">
                      Credited directly to runner upon delivery verification
                    </span>
                  </div>
                  <span className="text-[#00E676] text-xl sm:text-2xl font-black">
                    ₹{currentReward}
                  </span>
                </div>
              </div>

              {/* Escrow & Trust Badges */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="flex items-center gap-2.5 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs font-medium">
                  <ShieldCheck size={18} className="text-[#00E676] shrink-0" />
                  <span>Escrow Protected: Reward released only after 4-digit OTP match.</span>
                </div>
                <div className="flex items-center gap-2.5 p-3 rounded-xl bg-white/[0.03] border border-white/10 text-white/80 text-xs font-medium">
                  <Zap size={18} className="text-[#00E676] shrink-0" />
                  <span>High Availability: Campus runners typically match in 4-8 mins.</span>
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  disabled={isSubmitting}
                  className="bg-white/5 border border-white/10 text-white p-4 rounded-2xl cursor-pointer flex items-center justify-center w-14 shrink-0 hover:bg-white/10 disabled:opacity-50 transition-colors"
                >
                  <ArrowLeft size={18} />
                </button>
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="flex-1 bg-gradient-to-r from-[#00C853] to-[#00E676] text-[#050805] font-extrabold text-sm sm:text-base p-4 rounded-2xl border-none flex items-center justify-center gap-2 cursor-pointer shadow-[0_0_25px_rgba(0,230,118,0.4)] hover:shadow-[0_0_35px_rgba(0,230,118,0.6)] disabled:opacity-75 transition-all active:scale-[0.99]"
                >
                  {isSubmitting ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-[#050805] border-t-transparent rounded-full animate-spin" />
                      <span>Publishing Request to Campus...</span>
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
