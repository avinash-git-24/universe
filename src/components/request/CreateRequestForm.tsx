"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Minus, Trash2, ArrowRight, ArrowLeft, Mic, Image as ImageIcon, MapPin, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CategorySelector, Category } from "./CategorySelector";
import { createClient } from "@/lib/supabase/client";
import { createDeliveryRequest } from "@/lib/database/requests";
import type { Database } from "@/types/database";

type InsertRequest = Database["public"]["Tables"]["delivery_requests"]["Insert"];
type InsertItem = Database["public"]["Tables"]["request_items"]["Insert"];

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

    // Check if there are any meals
    const hasMeal = items.some((item) => item.category === "Meal");
    if (hasMeal) return 25; // Default meal reward

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

  const handleRemoveItem = (id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  };

  const handleSubmit = async () => {
    if (items.length === 0 || !dropoffRoom.trim()) return;

    setIsSubmitting(true);

    try {
      const supabase = createClient();

      // Verify the user is still authenticated
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

      // Direct insert with detailed error capture
      const { data: request, error: requestError } = await supabase
        .from("delivery_requests")
        .insert({ ...requestData, requester_id: user.id })
        .select()
        .single();

      if (requestError || !request) {
        console.error("Request insert failed:", {
          code: requestError?.code,
          message: requestError?.message,
          details: requestError?.details,
          hint: requestError?.hint,
        });
        alert(
          `Failed to create request.\n\nError: ${requestError?.message || "Unknown error"}\nCode: ${requestError?.code || "N/A"}\nHint: ${requestError?.hint || "Check Supabase RLS policies"}`
        );
        setIsSubmitting(false);
        return;
      }

      // Insert items
      if (itemsData.length > 0) {
        const { error: itemsError } = await supabase
          .from("request_items")
          .insert(itemsData.map((item) => ({ ...item, request_id: request.id })));

        if (itemsError) {
          console.error("Items insert failed:", {
            code: itemsError.code,
            message: itemsError.message,
            details: itemsError.details,
          });
          // Request was created, just items failed — still navigate
        }
      }

      router.push("/dashboard");
      router.refresh();
    } catch (error) {
      console.error("Unexpected error:", error);
      alert(`Unexpected error: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto w-full space-y-6">
      {/* Progress Bar */}
      <div className="flex items-center justify-between mb-8 relative">
        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-secondary -z-10 rounded-full" />
        <div
          className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-primary -z-10 rounded-full transition-all duration-300"
          style={{ width: `${((step - 1) / 2) * 100}%` }}
        />

        {[1, 2, 3].map((s) => (
          <div
            key={s}
            className={`w-8 h-8 rounded-full flex items-center justify-center font-bold transition-all duration-300 ${s <= step ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground"
              }`}
          >
            {s < step ? <CheckCircle2 className="w-5 h-5" /> : s}
          </div>
        ))}
      </div>

      {step === 1 && (
        <Card className="border-none shadow-lg">
          <CardHeader>
            <CardTitle>What do you need?</CardTitle>
            <CardDescription>Add the items you want delivered.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <CategorySelector selectedCategory={currentCategory} onSelect={setCurrentCategory} />

            <div className="flex gap-2">
              <Input
                placeholder={`e.g. ${currentCategory === 'Snack' ? 'Lays Chips' : 'Item name'}...`}
                value={currentItemName}
                onChange={(e) => setCurrentItemName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddItem();
                  }
                }}
                className="flex-1"
              />
              <div className="flex items-center border rounded-md">
                <Button variant="ghost" size="icon" onClick={() => setCurrentItemQty(Math.max(1, currentItemQty - 1))} className="rounded-r-none h-10 w-10">
                  <Minus className="w-4 h-4" />
                </Button>
                <div className="w-8 text-center font-medium">{currentItemQty}</div>
                <Button variant="ghost" size="icon" onClick={() => setCurrentItemQty(currentItemQty + 1)} className="rounded-l-none h-10 w-10">
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
              <Button onClick={handleAddItem} disabled={!currentItemName.trim()}>
                Add
              </Button>
            </div>

            {items.length > 0 && (
              <div className="space-y-3 mt-6">
                <h4 className="font-semibold text-sm text-muted-foreground">Added Items</h4>
                {items.map((item) => (
                  <div key={item.id} className="flex items-center justify-between p-3 bg-secondary/30 rounded-lg border">
                    <div>
                      <span className="font-medium">{item.quantity} × {item.name}</span>
                      <span className="text-xs text-muted-foreground ml-2 px-2 py-1 bg-secondary rounded-full">
                        {item.category}
                      </span>
                    </div>
                    <Button variant="ghost" size="icon" onClick={() => handleRemoveItem(item.id)} className="text-destructive hover:text-destructive hover:bg-destructive/10">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}

            <Button
              className="w-full mt-6"
              onClick={() => setStep(2)}
              disabled={items.length === 0}
            >
              Continue <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </CardContent>
        </Card>
      )}

      {step === 2 && (
        <Card className="border-none shadow-lg animate-in slide-in-from-right-4">
          <CardHeader>
            <CardTitle>Logistics & Reward</CardTitle>
            <CardDescription>Where should it be picked up and delivered?</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-3">
              <label className="text-sm font-semibold flex items-center">
                <MapPin className="w-4 h-4 mr-2 text-primary" /> Pickup Location
              </label>
              <div className="grid grid-cols-2 gap-2">
                {PICKUP_LOCATIONS.map((loc) => (
                  <Button
                    key={loc}
                    type="button"
                    variant={pickupLocation === loc ? "primary" : "secondary"}
                    className="justify-start h-auto py-3 px-4 whitespace-normal text-left"
                    onClick={() => setPickupLocation(loc)}
                  >
                    {loc}
                  </Button>
                ))}
              </div>
            </div>

            <div className="space-y-3 pt-4 border-t">
              <label className="text-sm font-semibold flex items-center">
                <MapPin className="w-4 h-4 mr-2 text-primary" /> Delivery Details
              </label>
              <div className="grid grid-cols-2 gap-2 mb-3">
                {HOSTELS.map((hostel) => (
                  <Button
                    key={hostel}
                    type="button"
                    variant={dropoffHostel === hostel ? "primary" : "secondary"}
                    onClick={() => setDropoffHostel(hostel)}
                  >
                    {hostel}
                  </Button>
                ))}
              </div>
              <Input
                placeholder="Room Number (e.g. 104)"
                value={dropoffRoom}
                onChange={(e) => setDropoffRoom(e.target.value)}
              />
            </div>

            <div className="space-y-3 pt-4 border-t">
              <label className="text-sm font-semibold">Delivery Reward (₹)</label>
              <p className="text-xs text-muted-foreground mb-2">
                Suggested reward based on your {items.length} item(s): ₹{calculateSuggestedReward()}
              </p>
              <div className="flex gap-2 items-center">
                <span className="text-2xl font-bold">₹</span>
                <Input
                  type="number"
                  placeholder={calculateSuggestedReward().toString()}
                  value={customReward}
                  onChange={(e) => setCustomReward(e.target.value)}
                  className="text-lg font-semibold h-12"
                />
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <Button variant="secondary" onClick={() => setStep(1)} className="w-12 p-0">
                <ArrowLeft className="w-4 h-4" />
              </Button>
              <Button
                className="flex-1"
                onClick={() => setStep(3)}
                disabled={!dropoffRoom.trim()}
              >
                Continue <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {step === 3 && (
        <Card className="border-none shadow-lg animate-in slide-in-from-right-4">
          <CardHeader>
            <CardTitle>Almost there</CardTitle>
            <CardDescription>Add any final instructions for the runner.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-3">
              <label className="text-sm font-semibold">Extra Instructions (Optional)</label>
              <textarea
                className="flex min-h-[100px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                placeholder="E.g. If Coke is not available, get Pepsi. Call me when you reach the gate."
                value={instructions}
                onChange={(e) => setInstructions(e.target.value)}
              />
            </div>

            <div className="flex gap-3 border-t pt-4">
              <Button variant="secondary" type="button" className="flex-1 h-12 text-muted-foreground" onClick={() => alert('Storage integration coming soon!')}>
                <Mic className="w-4 h-4 mr-2" /> Voice Note
              </Button>
              <Button variant="secondary" type="button" className="flex-1 h-12 text-muted-foreground" onClick={() => alert('Storage integration coming soon!')}>
                <ImageIcon className="w-4 h-4 mr-2" /> Add Image
              </Button>
            </div>

            <div className="bg-primary/5 p-4 rounded-xl border border-primary/20 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Items ({items.length})</span>
                <span className="font-semibold text-right max-w-[200px] truncate">
                  {items.map(i => i.name).join(', ')}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Pickup</span>
                <span className="font-medium text-right">{pickupLocation}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Dropoff</span>
                <span className="font-medium text-right">{dropoffHostel}, Rm {dropoffRoom}</span>
              </div>
              <div className="border-t pt-2 mt-2 flex justify-between font-bold text-lg">
                <span>Reward</span>
                <span className="text-primary">₹{currentReward}</span>
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <Button variant="secondary" onClick={() => setStep(2)} className="w-12 p-0" disabled={isSubmitting}>
                <ArrowLeft className="w-4 h-4" />
              </Button>
              <Button
                className="flex-1 h-12 text-lg"
                onClick={handleSubmit}
                disabled={isSubmitting}
              >
                {isSubmitting ? "Creating..." : "Confirm Request"}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
