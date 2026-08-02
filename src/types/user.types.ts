/**
 * UniVerse — User Types
 */

// ─── User Roles ───────────────────────────────────────────────────────────────

export type UserRole = "requester" | "deliverer";

export type VerificationStatus =
  | "unverified"
  | "pending"
  | "verified"
  | "rejected";

// ─── Student / User ───────────────────────────────────────────────────────────

export interface User {
  id: string;
  name: string;
  email: string;
  studentId: string;
  hostelName: string;
  roomNumber: string;
  profileImageUrl?: string;
  role: UserRole;
  verificationStatus: VerificationStatus;
  rating: number;
  totalDeliveries: number;
  totalRequests: number;
  rewardBalance: number; // in smallest currency unit
  createdAt: string; // ISO 8601
  updatedAt: string;
}

export interface UserProfile extends User {
  bio?: string;
  phoneNumber?: string;
  preferredFloor?: number;
}

// ─── Auth ─────────────────────────────────────────────────────────────────────

export interface AuthSession {
  user: User;
  accessToken: string;
  expiresAt: string; // ISO 8601
}
