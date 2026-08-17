-- ------------------------------------------------------------------------------
-- Phase 6B: Payments & Wallet System
-- ------------------------------------------------------------------------------

BEGIN;

CREATE TYPE transaction_type AS ENUM ('deposit', 'withdrawal', 'payment', 'earning', 'refund');
CREATE TYPE transaction_status AS ENUM ('pending', 'completed', 'failed');

-- ------------------------------------------------------------------------------
-- Wallets Table
-- ------------------------------------------------------------------------------
CREATE TABLE public.wallets (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  profile_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL UNIQUE,
  balance DECIMAL(12, 2) DEFAULT 0.00 NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ------------------------------------------------------------------------------
-- Transactions Table
-- ------------------------------------------------------------------------------
CREATE TABLE public.transactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  wallet_id UUID REFERENCES public.wallets(id) ON DELETE CASCADE NOT NULL,
  amount DECIMAL(12, 2) NOT NULL, -- Positive means adding to wallet, negative means deducting
  type transaction_type NOT NULL,
  status transaction_status DEFAULT 'pending'::transaction_status NOT NULL,
  reference_id UUID, -- E.g., a delivery_request_id
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ------------------------------------------------------------------------------
-- RLS Policies
-- ------------------------------------------------------------------------------
ALTER TABLE public.wallets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

-- Wallets RLS
CREATE POLICY "Users can view their own wallet" ON public.wallets
  FOR SELECT USING (profile_id = auth.uid() OR public.is_admin(auth.uid()));

-- We DO NOT allow INSERT/UPDATE on wallets from the client.
-- Wallets are modified exclusively by secure database functions.

-- Transactions RLS
CREATE POLICY "Users can view their own transactions" ON public.transactions
  FOR SELECT USING (
    wallet_id IN (SELECT id FROM public.wallets WHERE profile_id = auth.uid()) 
    OR public.is_admin(auth.uid())
  );

-- We DO NOT allow INSERT/UPDATE on transactions from the client.

-- ------------------------------------------------------------------------------
-- Triggers for updated_at
-- ------------------------------------------------------------------------------
CREATE TRIGGER handle_updated_at_wallets
  BEFORE UPDATE ON public.wallets
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- ------------------------------------------------------------------------------
-- Wallet Backfill and Auto-creation
-- ------------------------------------------------------------------------------

-- Backfill existing profiles
INSERT INTO public.wallets (profile_id, balance)
SELECT id, 0.00 FROM public.profiles
ON CONFLICT (profile_id) DO NOTHING;

-- Trigger to create a wallet automatically when a profile is created
CREATE OR REPLACE FUNCTION public.create_wallet_for_new_profile()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.wallets (profile_id, balance)
  VALUES (NEW.id, 0.00);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_profile_created
  AFTER INSERT ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.create_wallet_for_new_profile();

-- ------------------------------------------------------------------------------
-- Secure Transaction Functions
-- ------------------------------------------------------------------------------

-- Mock deposit (Add Funds)
CREATE OR REPLACE FUNCTION public.mock_deposit(user_id UUID, deposit_amount DECIMAL)
RETURNS public.wallets AS $$
DECLARE
  target_wallet_id UUID;
  updated_wallet public.wallets;
BEGIN
  -- Get wallet id
  SELECT id INTO target_wallet_id FROM public.wallets WHERE profile_id = user_id;
  
  -- Record transaction
  INSERT INTO public.transactions (wallet_id, amount, type, status, description)
  VALUES (target_wallet_id, deposit_amount, 'deposit', 'completed', 'Added funds via Mock Gateway');
  
  -- Update balance
  UPDATE public.wallets 
  SET balance = balance + deposit_amount
  WHERE id = target_wallet_id
  RETURNING * INTO updated_wallet;
  
  RETURN updated_wallet;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMIT;
