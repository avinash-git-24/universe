import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ROUTES } from "@/constants/routes";
import { getWallet, getTransactions } from "@/lib/database/wallet";
import { WalletOverview } from "@/components/wallet/WalletOverview";
import { TransactionHistory } from "@/components/wallet/TransactionHistory";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Wallet · UniVerse",
  description: "Manage your funds and view transaction history.",
};

export default async function WalletPage() {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    redirect(ROUTES.LOGIN);
  }

  // Get user profile to determine role
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (!profile) redirect(ROUTES.LOGIN);

  const wallet = await getWallet(supabase, user.id);
  const transactions = wallet ? await getTransactions(supabase, wallet.id) : [];

  return (
    <div className="min-h-screen bg-secondary/30 pt-24 pb-12 px-4">
      <div className="max-w-4xl mx-auto space-y-8">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">Wallet</h1>
          <p className="text-muted-foreground mt-1">
            {profile.role === "runner" 
              ? "Track your earnings and withdraw funds." 
              : "Manage your funds for delivery requests."}
          </p>
        </div>
        
        <WalletOverview wallet={wallet} role={profile.role} userId={user.id} />

        <div className="pt-4">
          <h2 className="text-xl font-bold">Transaction History</h2>
          <TransactionHistory transactions={transactions} />
        </div>
      </div>
    </div>
  );
}
