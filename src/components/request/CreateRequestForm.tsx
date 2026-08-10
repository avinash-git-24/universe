"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Minus, Trash2, ArrowRight, ArrowLeft, Mic, Image as ImageIcon, MapPin, Box, Pizza, Coffee, Utensils, ShoppingBag, Book, Pill } from "lucide-react";
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

export function CreateRequestForm({ requesterId }: { requesterId: string }) {
  const router = useRouter();
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Step 1 State: Items
  const [items, setItems] = useState<ItemForm[]>([]);
  const [currentCategory, setCurrentCategory] = useState<Category>("Snack");
  const [currentItemName, setCurrentItemName] = useState("");
  const [currentItemQty, setCurrentItemQty] = useState(1);

  // Step 2 State: Logistics & Reward
  const [pickupLocation, setPickupLocation] = useState(PICKUP_LOCATIONS[0]);
  const [dropoffHostel, setDropoffHostel] = useState(HOSTELS[0]);
  const [dropoffRoom, setDropoffRoom] = useState("");
  const [customReward, setCustomReward] = useState<string>("");

  // Step 3 State: Extras
  const [instructions, setInstructions] = useState("");

  const calculateSuggestedReward = () => {
    if (items.length === 0) return 0;
    const hasMeal = items.some((item) => item.category === "Meal");
    if (hasMeal) return 25;
    const totalQty = items.reduce((sum, item) => sum + item.quantity, 0);
    if (totalQty === 1) return 5;
    if (totalQty === 2) return 10;
    if (totalQty === 3) return 15;
    return 20;
  };

  const currentReward = customReward !== "" ? Number(customReward) : calculateSuggestedReward();

  const handleAddItem = () => {
    if (!currentItemName.trim()) return;
    setItems((prev) => [
      ...prev,
      {
        id: Math.random().toString(36).substr(2, 9),
        name: currentItemName.trim(),
        category: currentCategory,
        quantity: currentItemQty,
      },
    ]);
    setCurrentItemName("");
    setCurrentItemQty(1);
  };

  const handleRemoveItem = (id: string) => setItems((prev) => prev.filter((item) => item.id !== id));
  const handleClearAll = () => setItems([]);

  const handleSubmit = async () => {
    if (items.length === 0 || !dropoffRoom.trim()) return;
    setIsSubmitting(true);
    try {
      const supabase = createClient();
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) {
        alert("Session expired. Please log in again.");
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
        .insert({ ...requestData, requester_id: user.id })
        .select()
        .single();

      if (requestError || !request) {
        alert(`Failed to create request.\nError: ${requestError?.message}`);
        setIsSubmitting(false);
        return;
      }

      if (itemsData.length > 0) {
        await supabase.from("request_items").insert(itemsData.map((item) => ({ ...item, request_id: request.id })));
      }

      router.push("/dashboard");
      router.refresh();
    } catch (error) {
      alert(`Unexpected error: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const categories: { label: Category; icon: React.ComponentType<{ size?: number; color?: string; strokeWidth?: number }> }[] = [
    { label: "Snack", icon: Pizza },
    { label: "Beverage", icon: Coffee },
    { label: "Meal", icon: Utensils },
    { label: "Grocery", icon: ShoppingBag },
    { label: "Stationery", icon: Book },
    { label: "Medicine", icon: Pill },
  ];

  return (
    <div style={{ maxWidth: "800px", margin: "0 auto", width: "100%", display: "flex", flexDirection: "column", alignItems: "center" }}>
      
      {/* Step Indicator */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem", marginBottom: "3rem", width: "100%", maxWidth: "600px", position: "relative" }}>
        
        {/* Step 1 */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "0.5rem", zIndex: 1 }}>
          <div style={{ width: "36px", height: "36px", borderRadius: "50%", background: "#00E676", color: "#050805", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: "1rem" }}>1</div>
          <span style={{ color: "#fff", fontSize: "0.75rem", fontWeight: 700 }}>Item Details</span>
        </div>
        
        {/* Line 1 -> 2 */}
        <div style={{ flex: 1, borderTop: "2px dashed #00E676", transform: "translateY(-10px)", opacity: 0.5 }} />
        
        {/* Step 2 */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "0.5rem", zIndex: 1 }}>
          <div style={{ width: "36px", height: "36px", borderRadius: "50%", background: "transparent", border: "1px solid rgba(255,255,255,0.2)", color: "rgba(255,255,255,0.4)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: "1rem" }}>2</div>
          <span style={{ color: "rgba(255,255,255,0.4)", fontSize: "0.75rem", fontWeight: 500 }}>Delivery Details</span>
        </div>

        {/* Line 2 -> 3 */}
        <div style={{ flex: 1, borderTop: "2px dashed rgba(255,255,255,0.2)", transform: "translateY(-10px)" }} />

        {/* Step 3 */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "0.5rem", zIndex: 1 }}>
          <div style={{ width: "36px", height: "36px", borderRadius: "50%", background: "transparent", border: "1px solid rgba(255,255,255,0.2)", color: "rgba(255,255,255,0.4)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: "1rem" }}>3</div>
          <span style={{ color: "rgba(255,255,255,0.4)", fontSize: "0.75rem", fontWeight: 500 }}>Confirm Request</span>
        </div>

      </div>

      {/* Main Card */}
      <div style={{
        background: "rgba(10,15,12,0.6)",
        border: "1px solid rgba(102,255,178,0.15)",
        borderRadius: "24px",
        padding: "2rem",
        width: "100%",
        boxShadow: "0 0 40px rgba(0,230,118,0.05), inset 0 0 20px rgba(102,255,178,0.05)",
        display: "flex", flexDirection: "column", gap: "2rem"
      }}>
        {step === 1 && (
          <>
            {/* Header */}
            <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
              <div style={{ width: "40px", height: "40px", borderRadius: "12px", background: "rgba(0,230,118,0.1)", display: "flex", alignItems: "center", justifyContent: "center", border: "1px solid rgba(0,230,118,0.2)" }}>
                <Box size={20} color="#00E676" />
              </div>
              <div>
                <h2 style={{ color: "#fff", fontWeight: 800, fontSize: "1.2rem", margin: 0 }}>What do you need?</h2>
                <p style={{ color: "#A7B8B0", fontSize: "0.85rem", margin: 0, marginTop: "0.2rem" }}>Add the items you want delivered.</p>
              </div>
            </div>

            {/* Categories */}
            <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap", justifyContent: "center" }}>
              {categories.map(cat => {
                const isActive = currentCategory === cat.label;
                return (
                  <button
                    key={cat.label}
                    onClick={() => setCurrentCategory(cat.label)}
                    style={{
                      position: "relative",
                      background: "rgba(255,255,255,0.02)",
                      border: isActive ? "1px solid #00E676" : "1px solid rgba(255,255,255,0.1)",
                      borderRadius: "16px",
                      width: "85px", height: "85px",
                      display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "0.5rem",
                      cursor: "pointer",
                      boxShadow: isActive ? "0 0 20px rgba(0,230,118,0.15)" : "none",
                      transition: "all 0.2s"
                    }}
                  >
                    {(() => {
                      const IconComp = cat.icon;
                      return <IconComp size={24} color={isActive ? "#00E676" : "#A7B8B0"} strokeWidth={1.5} />;
                    })()}
                    <span style={{ color: isActive ? "#fff" : "#A7B8B0", fontSize: "0.75rem", fontWeight: isActive ? 600 : 500 }}>{cat.label}</span>
                    
                    {/* Active Triangle */}
                    {isActive && (
                      <div style={{
                        position: "absolute", bottom: "-6px", left: "50%", transform: "translateX(-50%) rotate(45deg)",
                        width: "10px", height: "10px", background: "#00E676",
                        borderRight: "1px solid #00E676", borderBottom: "1px solid #00E676",
                        boxShadow: "2px 2px 5px rgba(0,230,118,0.3)"
                      }} />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Input Row */}
            <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
              <label style={{ color: "#00E676", fontSize: "0.8rem", fontWeight: 700 }}>Add item and quantity</label>
              <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
                <input 
                  type="text"
                  placeholder="e.g. Lays Chips, Doritos, KitKat..."
                  value={currentItemName}
                  onChange={e => setCurrentItemName(e.target.value)}
                  style={{
                    flex: 1,
                    background: "rgba(0,0,0,0.3)",
                    border: "1px solid rgba(255,255,255,0.1)",
                    borderRadius: "12px",
                    padding: "0.85rem 1rem",
                    color: "#fff",
                    fontSize: "0.9rem",
                    outline: "none"
                  }}
                />
                <div style={{ display: "flex", alignItems: "center", background: "rgba(0,0,0,0.3)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "12px", overflow: "hidden" }}>
                  <button onClick={() => setCurrentItemQty(Math.max(1, currentItemQty - 1))} style={{ background: "transparent", border: "none", color: "rgba(255,255,255,0.6)", padding: "0.85rem 1rem", cursor: "pointer" }}><Minus size={14} /></button>
                  <span style={{ color: "#fff", fontWeight: 700, fontSize: "0.9rem", minWidth: "20px", textAlign: "center" }}>{currentItemQty}</span>
                  <button onClick={() => setCurrentItemQty(currentItemQty + 1)} style={{ background: "transparent", border: "none", color: "rgba(255,255,255,0.6)", padding: "0.85rem 1rem", cursor: "pointer" }}><Plus size={14} /></button>
                </div>
                <button onClick={handleAddItem} style={{
                  background: "rgba(0,230,118,0.15)", border: "1px solid rgba(0,230,118,0.3)",
                  color: "#00E676", fontWeight: 700, fontSize: "0.9rem",
                  padding: "0.85rem 1.5rem", borderRadius: "12px", cursor: "pointer"
                }}>
                  Add
                </button>
              </div>
            </div>

            {/* List / Empty State */}
            <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", marginTop: "0.5rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ color: "#A7B8B0", fontSize: "0.8rem", fontWeight: 500 }}>Added Items ({items.length})</span>
                {items.length > 0 && (
                  <button onClick={handleClearAll} style={{ background: "transparent", border: "none", color: "#A7B8B0", fontSize: "0.8rem", display: "flex", alignItems: "center", gap: "0.4rem", cursor: "pointer" }}>
                    Clear all <Trash2 size={14} />
                  </button>
                )}
              </div>

              {items.length === 0 ? (
                <div style={{
                  border: "1px dashed rgba(255,255,255,0.1)",
                  borderRadius: "16px",
                  padding: "3rem",
                  display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "0.5rem",
                  background: "rgba(0,0,0,0.2)"
                }}>
                  <div style={{ position: "relative", marginBottom: "0.5rem" }}>
                    <Box size={32} color="#00E676" />
                    {/* Tiny sparkles/lines around box to match image loosely without being a particle system */}
                    <div style={{ position: "absolute", top: "-10px", left: "50%", transform: "translateX(-50%)", width: "40px", height: "20px", borderTop: "2px dotted #00E676", borderRadius: "50%", opacity: 0.5 }} />
                  </div>
                  <h4 style={{ color: "#fff", fontWeight: 700, margin: 0, fontSize: "1rem" }}>No items added yet.</h4>
                  <p style={{ color: "#A7B8B0", margin: 0, fontSize: "0.85rem" }}>Search and add items to proceed.</p>
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", background: "rgba(0,0,0,0.2)", borderRadius: "16px", padding: "1rem", border: "1px solid rgba(255,255,255,0.05)" }}>
                  {items.map(item => (
                    <div key={item.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid rgba(255,255,255,0.05)", paddingBottom: "0.5rem" }}>
                      <div>
                        <span style={{ color: "#fff", fontWeight: 600, fontSize: "0.9rem" }}>{item.quantity} × {item.name}</span>
                        <span style={{ color: "#00E676", fontSize: "0.7rem", marginLeft: "0.5rem", padding: "0.1rem 0.4rem", background: "rgba(0,230,118,0.1)", borderRadius: "8px" }}>{item.category}</span>
                      </div>
                      <button onClick={() => handleRemoveItem(item.id)} style={{ background: "transparent", border: "none", color: "#ef4444", cursor: "pointer" }}><Trash2 size={16} /></button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Continue Button */}
            <button
              onClick={() => setStep(2)}
              disabled={items.length === 0}
              style={{
                width: "100%",
                background: items.length > 0 ? "linear-gradient(135deg, #00C853 0%, #00E676 100%)" : "rgba(255,255,255,0.05)",
                color: items.length > 0 ? "#000" : "rgba(255,255,255,0.3)",
                fontWeight: 800,
                fontSize: "1rem",
                padding: "1rem",
                borderRadius: "12px",
                border: "none",
                display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem",
                cursor: items.length > 0 ? "pointer" : "not-allowed",
                marginTop: "0.5rem",
                boxShadow: items.length > 0 ? "0 0 20px rgba(0,230,118,0.3)" : "none"
              }}
            >
              Continue <ArrowRight size={18} />
            </button>
          </>
        )}

        {/* Step 2 */}
        {step === 2 && (
          <>
            <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
              <div style={{ width: "40px", height: "40px", borderRadius: "12px", background: "rgba(0,230,118,0.1)", display: "flex", alignItems: "center", justifyContent: "center", border: "1px solid rgba(0,230,118,0.2)" }}>
                <MapPin size={20} color="#00E676" />
              </div>
              <div>
                <h2 style={{ color: "#fff", fontWeight: 800, fontSize: "1.2rem", margin: 0 }}>Logistics & Reward</h2>
                <p style={{ color: "#A7B8B0", fontSize: "0.85rem", margin: 0, marginTop: "0.2rem" }}>Where should it be picked up and delivered?</p>
              </div>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
              {/* Pickup Location */}
              <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                <label style={{ color: "#00E676", fontSize: "0.8rem", fontWeight: 700, display: "flex", alignItems: "center", gap: "0.4rem" }}><MapPin size={14} /> Pickup Location</label>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.5rem" }}>
                  {PICKUP_LOCATIONS.map((loc) => (
                    <button
                      key={loc}
                      onClick={() => setPickupLocation(loc)}
                      style={{
                        background: pickupLocation === loc ? "rgba(0,230,118,0.15)" : "rgba(0,0,0,0.3)",
                        border: pickupLocation === loc ? "1px solid #00E676" : "1px solid rgba(255,255,255,0.1)",
                        color: pickupLocation === loc ? "#00E676" : "#A7B8B0",
                        padding: "0.85rem 1rem", borderRadius: "12px", textAlign: "left", cursor: "pointer", fontSize: "0.85rem", fontWeight: pickupLocation === loc ? 700 : 500,
                        transition: "all 0.2s"
                      }}
                    >
                      {loc}
                    </button>
                  ))}
                </div>
              </div>

              {/* Delivery Details */}
              <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", borderTop: "1px solid rgba(255,255,255,0.05)", paddingTop: "1.5rem" }}>
                <label style={{ color: "#00E676", fontSize: "0.8rem", fontWeight: 700, display: "flex", alignItems: "center", gap: "0.4rem" }}><MapPin size={14} /> Delivery Details</label>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.5rem", marginBottom: "0.5rem" }}>
                  {HOSTELS.map((hostel) => (
                    <button
                      key={hostel}
                      onClick={() => setDropoffHostel(hostel)}
                      style={{
                        background: dropoffHostel === hostel ? "rgba(0,230,118,0.15)" : "rgba(0,0,0,0.3)",
                        border: dropoffHostel === hostel ? "1px solid #00E676" : "1px solid rgba(255,255,255,0.1)",
                        color: dropoffHostel === hostel ? "#00E676" : "#A7B8B0",
                        padding: "0.75rem 1rem", borderRadius: "12px", cursor: "pointer", fontSize: "0.85rem", fontWeight: dropoffHostel === hostel ? 700 : 500,
                        transition: "all 0.2s"
                      }}
                    >
                      {hostel}
                    </button>
                  ))}
                </div>
                <input
                  type="text"
                  placeholder="Room Number (e.g. 104)"
                  value={dropoffRoom}
                  onChange={(e) => setDropoffRoom(e.target.value)}
                  style={{ background: "rgba(0,0,0,0.3)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "12px", padding: "0.85rem 1rem", color: "#fff", fontSize: "0.9rem", outline: "none" }}
                />
              </div>

              {/* Reward */}
              <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", borderTop: "1px solid rgba(255,255,255,0.05)", paddingTop: "1.5rem" }}>
                <label style={{ color: "#00E676", fontSize: "0.8rem", fontWeight: 700 }}>Delivery Reward (₹)</label>
                <p style={{ color: "#A7B8B0", fontSize: "0.75rem", margin: 0, marginBottom: "0.5rem" }}>Suggested reward based on your {items.length} item(s): ₹{calculateSuggestedReward()}</p>
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                  <span style={{ color: "#fff", fontSize: "1.5rem", fontWeight: 800 }}>₹</span>
                  <input
                    type="number"
                    placeholder={calculateSuggestedReward().toString()}
                    value={customReward}
                    onChange={(e) => setCustomReward(e.target.value)}
                    style={{ background: "rgba(0,0,0,0.3)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "12px", padding: "0.85rem 1rem", color: "#fff", fontSize: "1rem", fontWeight: 700, width: "120px", outline: "none" }}
                  />
                </div>
              </div>

              <div style={{ display: "flex", gap: "1rem", marginTop: "1rem" }}>
                <button onClick={() => setStep(1)} style={{ background: "rgba(255,255,255,0.05)", border: "none", color: "#fff", padding: "1rem", borderRadius: "12px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", width: "60px" }}>
                  <ArrowLeft size={18} />
                </button>
                <button
                  onClick={() => setStep(3)}
                  disabled={!dropoffRoom.trim()}
                  style={{
                    flex: 1,
                    background: dropoffRoom.trim() ? "linear-gradient(135deg, #00C853 0%, #00E676 100%)" : "rgba(255,255,255,0.05)",
                    color: dropoffRoom.trim() ? "#000" : "rgba(255,255,255,0.3)",
                    fontWeight: 800, fontSize: "1rem", padding: "1rem", borderRadius: "12px", border: "none",
                    display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem",
                    cursor: dropoffRoom.trim() ? "pointer" : "not-allowed",
                    boxShadow: dropoffRoom.trim() ? "0 0 20px rgba(0,230,118,0.3)" : "none"
                  }}
                >
                  Continue <ArrowRight size={18} />
                </button>
              </div>
            </div>
          </>
        )}

        {/* Step 3 */}
        {step === 3 && (
          <>
            <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
              <div style={{ width: "40px", height: "40px", borderRadius: "12px", background: "rgba(0,230,118,0.1)", display: "flex", alignItems: "center", justifyContent: "center", border: "1px solid rgba(0,230,118,0.2)" }}>
                <Box size={20} color="#00E676" />
              </div>
              <div>
                <h2 style={{ color: "#fff", fontWeight: 800, fontSize: "1.2rem", margin: 0 }}>Almost there</h2>
                <p style={{ color: "#A7B8B0", fontSize: "0.85rem", margin: 0, marginTop: "0.2rem" }}>Add any final instructions for the runner.</p>
              </div>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
              <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                <label style={{ color: "#00E676", fontSize: "0.8rem", fontWeight: 700 }}>Extra Instructions (Optional)</label>
                <textarea
                  placeholder="E.g. If Coke is not available, get Pepsi. Call me when you reach the gate."
                  value={instructions}
                  onChange={(e) => setInstructions(e.target.value)}
                  style={{
                    background: "rgba(0,0,0,0.3)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "12px",
                    padding: "1rem", color: "#fff", fontSize: "0.9rem", minHeight: "100px", resize: "vertical", outline: "none"
                  }}
                />
              </div>

              <div style={{ background: "rgba(0,230,118,0.05)", border: "1px solid rgba(0,230,118,0.15)", borderRadius: "16px", padding: "1.25rem", display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.85rem" }}>
                  <span style={{ color: "#A7B8B0" }}>Items ({items.length})</span>
                  <span style={{ color: "#fff", fontWeight: 600, maxWidth: "200px", textAlign: "right", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{items.map(i => i.name).join(', ')}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.85rem" }}>
                  <span style={{ color: "#A7B8B0" }}>Pickup</span>
                  <span style={{ color: "#fff", fontWeight: 600 }}>{pickupLocation}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.85rem" }}>
                  <span style={{ color: "#A7B8B0" }}>Dropoff</span>
                  <span style={{ color: "#fff", fontWeight: 600 }}>{dropoffHostel}, Rm {dropoffRoom}</span>
                </div>
                <div style={{ borderTop: "1px solid rgba(255,255,255,0.05)", paddingTop: "0.75rem", marginTop: "0.25rem", display: "flex", justifyContent: "space-between", fontSize: "1.1rem", fontWeight: 800 }}>
                  <span style={{ color: "#fff" }}>Reward</span>
                  <span style={{ color: "#00E676" }}>₹{currentReward}</span>
                </div>
              </div>

              <div style={{ display: "flex", gap: "1rem", marginTop: "1rem" }}>
                <button onClick={() => setStep(2)} disabled={isSubmitting} style={{ background: "rgba(255,255,255,0.05)", border: "none", color: "#fff", padding: "1rem", borderRadius: "12px", cursor: isSubmitting ? "not-allowed" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", width: "60px", opacity: isSubmitting ? 0.5 : 1 }}>
                  <ArrowLeft size={18} />
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  style={{
                    flex: 1,
                    background: "linear-gradient(135deg, #00C853 0%, #00E676 100%)",
                    color: "#000",
                    fontWeight: 800, fontSize: "1rem", padding: "1rem", borderRadius: "12px", border: "none",
                    display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem",
                    cursor: isSubmitting ? "not-allowed" : "pointer",
                    boxShadow: "0 0 20px rgba(0,230,118,0.3)",
                    opacity: isSubmitting ? 0.7 : 1
                  }}
                >
                  {isSubmitting ? "Creating Request..." : "Confirm Request"}
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
