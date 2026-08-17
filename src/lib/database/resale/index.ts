/**
 * UniVerse Resale — Service Layer Public API
 *
 * Import from this barrel file for all resale operations.
 *
 * @example
 * import { createResaleListing, getActiveResaleListings } from "@/lib/database/resale";
 */

// Types
export type {
  ResaleListingRow,
  ResaleListingImageRow,
  ResaleListingWithImages,
  ResaleListingFilters,
  ResaleSortOption,
  ResaleCategory,
  ResaleCondition,
  ResaleStatus,
  CreateResaleListingInput,
  UpdateResaleListingInput,
  PaginationParams,
  PaginationMeta,
  UploadedImageResult,
  AllowedImageMimeType,
} from "./types";

export {
  ResaleServiceError,
  VALID_CATEGORIES,
  VALID_CONDITIONS,
  VALID_SORT_OPTIONS,
  VALID_STATUSES,
  ALLOWED_IMAGE_MIME_TYPES,
  MAX_IMAGE_BYTES,
  MAX_IMAGES_PER_LISTING,
  DEFAULT_PAGE_SIZE,
  MAX_PAGE_SIZE,
  SORT_MAP,
} from "./types";

// Validation utilities (pure functions — safe to import in tests)
export {
  isValidUuid,
  assertValidUuid,
  isValidCategory,
  isValidCondition,
  isValidSortOption,
  validateCreateListingInput,
  validateUpdateListingInput,
  validateFilters,
  validatePagination,
  validateImageFile,
  buildImageStoragePath,
} from "./validation";

// Listing service
export type {
  GetActiveListingsResult,
  GetMyListingsResult,
} from "./listings";

export {
  createResaleListing,
  getResaleListingById,
  getActiveResaleListings,
  getMyResaleListings,
  updateResaleListing,
  deleteResaleListing,
} from "./listings";

// Image service
export {
  uploadResaleListingImage,
  deleteResaleListingImage,
  deleteAllListingImages,
  getResaleListingImages,
  getSignedImageUrl,
  getSignedImageUrls,
} from "./images";
export * from "./favorites";