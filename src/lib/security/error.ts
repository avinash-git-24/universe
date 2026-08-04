/**
 * Sanitizes errors for production rendering, preventing exposure of internal stack traces.
 */
export function sanitizeErrorForProduction(
  error: unknown,
  fallbackMessage = "An unexpected error occurred. Please try again."
): string {
  if (process.env.NODE_ENV !== "production") {
    if (error instanceof Error) return error.message;
    if (typeof error === "string") return error;
  }

  // Friendly production error message
  if (error instanceof Error) {
    const msg = error.message.toLowerCase();
    if (msg.includes("network") || msg.includes("fetch")) {
      return "Network connection issue. Please check your internet connection.";
    }
    if (msg.includes("permission") || msg.includes("unauthorized") || msg.includes("jwt")) {
      return "You do not have permission to perform this action.";
    }
  }

  return fallbackMessage;
}
