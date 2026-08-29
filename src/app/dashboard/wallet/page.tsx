import { getUser } from "@/lib/supabase/queries";
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
  const { data: { user }, error: authError } = await getUser();

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
    <div className="min-h-screen bg-[#080b09] text-white pt-4 sm:pt-8 pb-12 px-3 sm:px-6 selection:bg-emerald-500/30">
      <div className="max-w-4xl mx-auto space-y-6 sm:space-y-8 relative z-10">
        <div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-white flex items-center gap-2">
            Wallet
            <span className="text-[#00E676] text-2xl sm:text-3xl">✦</span>
          </h1>
          <p className="text-white/60 mt-1 text-sm sm:text-base">
            {profile.role === "runner" 
              ? "Track your earnings and withdraw funds." 
              : "Manage your funds for delivery requests."}
          </p>
        </div>
        
        <WalletOverview wallet={wallet} role={profile.role} userId={user.id} />

        <div className="pt-4">
          <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
            Transaction History
          </h2>
          <TransactionHistory transactions={transactions} />
        </div>
      </div>
    </div>
  );
}
