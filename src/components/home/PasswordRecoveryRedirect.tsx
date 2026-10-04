"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export function PasswordRecoveryRedirect() {
  const router = useRouter();

  // If user arrives at homepage from password reset email link
  useEffect(() => {
    if (typeof window === "undefined") return;

    const hash = window.location.hash || "";
    const search = window.location.search || "";

    if (
      hash.includes("type=recovery") ||
      hash.includes("access_token") ||
      search.includes("type=recovery") ||
      search.includes("code=")
    ) {
      window.location.href = `/reset-password${hash || search}`;
    }
  }, [router]);

  return null;
}
