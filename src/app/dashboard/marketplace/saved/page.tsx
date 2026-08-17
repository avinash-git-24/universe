import { Metadata } from "next";
import { SavedListingsView } from "@/components/resale/SavedListingsView";

export const metadata: Metadata = {
  title: "Saved Listings · UniVerse Resale",
  description: "View your saved listings on UniVerse Resale.",
};

export default function SavedListingsPage() {
  return <SavedListingsView />;
}
