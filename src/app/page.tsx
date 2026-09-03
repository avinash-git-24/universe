"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Navbar } from "@/components/home/Navbar";
import { HeroSection } from "@/components/home/HeroSection";
import { WhyUniverseSection } from "@/components/home/WhyUniverseSection";
import { HowItWorksSection } from "@/components/home/HowItWorksSection";
import { FloatingObjects } from "@/components/home/FloatingObjects";
import { Footer } from "@/components/home/Footer";

export default function RootPage() {
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

  return (
    <>
      <Navbar />
      <HeroSection />
      <WhyUniverseSection />
      <HowItWorksSection />
      <FloatingObjects />
      <Footer />
    </>
  );
}
