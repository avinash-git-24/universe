/**
 * UniVerse — useDebounce
 *
 * Delays updating a value until after a period of inactivity.
 * Useful for search inputs, API calls, and expensive calculations.
 */

"use client";

import { useEffect, useState } from "react";

/**
 * Returns a debounced version of the provided value.
 *
 * @param value - The value to debounce
 * @param delay - Delay in milliseconds (default: 400ms)
 *
 * @example
 * const debouncedSearch = useDebounce(searchQuery, 400);
 * // Use debouncedSearch in your useEffect / API call
 */
export function useDebounce<T>(value: T, delay = 400): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => clearTimeout(timer);
  }, [value, delay]);

  return debouncedValue;
}
