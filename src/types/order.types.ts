/**
 * UniVerse — Order / Request Types
 *
 * Covers the full lifecycle of a vending machine delivery request.
 */

// ─── Order Status ─────────────────────────────────────────────────────────────

export type OrderStatus =
  | "pending"      // Waiting for a deliverer to accept
  | "accepted"     // Deliverer picked it up
  | "purchasing"   // Deliverer is at the vending machine
  | "in-transit"   // Deliverer is on the way
  | "delivered"    // Delivered to the room
  | "cancelled"    // Cancelled by requester or auto-expired
  | "failed";      // Deliverer couldn't complete

// ─── Vending Machine Item ─────────────────────────────────────────────────────

export interface VendingItem {
  id: string;
  name: string;
  category: VendingItemCategory;
  estimatedPrice: number; // in INR
  imageUrl?: string;
}

export type VendingItemCategory =
  | "snacks"
  | "beverages"
  | "hot-drinks"
  | "instant-noodles"
  | "energy-drinks"
  | "water"
  | "other";

// ─── Delivery Request ─────────────────────────────────────────────────────────

export interface DeliveryRequest {
  id: string;
  requesterId: string;
  delivererId?: string;

  // What was ordered
  items: RequestedItem[];
  totalEstimatedAmount: number; // in INR

  // Where to deliver
  hostelBuilding: string;
  floorNumber: number;
  roomNumber: string;
  deliveryNotes?: string;

  // Vending machine location
  vendingMachineLocation: string;

  // Reward
  rewardAmount: number; // in INR — what the deliverer earns

  // Status tracking
  status: OrderStatus;
  statusHistory: StatusHistoryEntry[];

  // Timing
  createdAt: string;     // ISO 8601
  acceptedAt?: string;
  deliveredAt?: string;
  cancelledAt?: string;
  expiresAt: string;    // Auto-cancel deadline
}

export interface RequestedItem {
  vendingItemId: string;
  name: string;
  quantity: number;
  pricePerUnit: number;
  totalPrice: number;
}

export interface StatusHistoryEntry {
  status: OrderStatus;
  timestamp: string; // ISO 8601
  note?: string;
  actorId: string;
}

// ─── Review / Rating ──────────────────────────────────────────────────────────

export interface DeliveryReview {
  id: string;
  orderId: string;
  reviewerId: string;
  revieweeId: string;
  rating: 1 | 2 | 3 | 4 | 5;
  comment?: string;
  createdAt: string;
}
