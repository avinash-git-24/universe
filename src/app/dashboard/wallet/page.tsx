import { redirect } from "next/navigation";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Wallet · UniVerse",
  description: "Wallet is undergoing scheduled upgrades.",
};

export default function WalletPage() {
  redirect("/dashboard");
}

