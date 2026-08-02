/**
 * UniVerse — API Response Types
 *
 * Standardized API response shapes for all endpoints.
 */

// ─── Base Response Envelope ───────────────────────────────────────────────────

export interface ApiSuccess<T = unknown> {
  success: true;
  data: T;
  message?: string;
  meta?: PaginationMeta;
}

export interface ApiError {
  success: false;
  error: {
    code: string;
    message: string;
    field?: string;        // For validation errors
    details?: unknown;     // For debug info (dev only)
  };
}

export type ApiResponse<T = unknown> = ApiSuccess<T> | ApiError;

// ─── Pagination ───────────────────────────────────────────────────────────────

export interface PaginationMeta {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface PaginatedRequest {
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

// ─── Common Error Codes ───────────────────────────────────────────────────────

export type ApiErrorCode =
  | "UNAUTHORIZED"
  | "FORBIDDEN"
  | "NOT_FOUND"
  | "VALIDATION_ERROR"
  | "RATE_LIMITED"
  | "SERVER_ERROR"
  | "STUDENT_NOT_VERIFIED"
  | "REQUEST_EXPIRED"
  | "REQUEST_ALREADY_ACCEPTED"
  | "INSUFFICIENT_BALANCE";
