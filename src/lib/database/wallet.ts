import { SupabaseClient } from "@supabase/supabase-js";
import { Database } from "@/types/database";

export type Wallet = Database["public"]["Tables"]["wallets"]["Row"];
export type Transaction = Database["public"]["Tables"]["transactions"]["Row"];

export async function getWallet(
  supabase: SupabaseClient<Database>,
  userId: string
): Promise<Wallet | null> {
  const { data, error } = await supabase
    .from("wallets")
    .select("*")
    .eq("profile_id", userId)
    .single();

  if (error) {
    console.error("Error fetching wallet:", error);
    return null;
  }
  return data;
}

export async function getTransactions(
  supabase: SupabaseClient<Database>,
  walletId: string
): Promise<Transaction[]> {
  const { data, error } = await supabase
    .from("transactions")
    .select("*")
    .eq("wallet_id", walletId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching transactions:", error);
    return [];
  }
  return data;
}

export async function addFundsMock(
  supabase: SupabaseClient<Database>,
  userId: string,
  amount: number
): Promise<{ success: boolean; wallet?: Wallet; error?: string }> {
  try {
    const { data, error } = await supabase.rpc("mock_deposit", {
      user_id: userId,
      deposit_amount: amount,
    });

    if (error) {
      console.error("Mock deposit error:", error);
      return { success: false, error: error.message };
    }

    // Since RPC returns the wallet record:
    return { success: true, wallet: data as unknown as Wallet };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return { success: false, error: message };
  }
}
