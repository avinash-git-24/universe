-- ==============================================================================
-- UniVerse Phase 4A: Database Foundation
-- Description: Core tables, Row Level Security (RLS), and Triggers for the delivery system.
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- 1. Custom Types
-- ------------------------------------------------------------------------------

CREATE TYPE user_role AS ENUM ('student', 'runner');
CREATE TYPE request_status AS ENUM ('pending', 'accepted', 'picked_up', 'delivered', 'cancelled');
CREATE TYPE assignment_status AS ENUM ('active', 'completed', 'cancelled');

-- ------------------------------------------------------------------------------
-- 2. Tables
-- ------------------------------------------------------------------------------

-- Profiles (Extends auth.users)
CREATE TABLE public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT,
    enrollment_number TEXT,
    role user_role DEFAULT 'student'::user_role NOT NULL,
    avatar_url TEXT,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Delivery Requests
CREATE TABLE public.delivery_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    requester_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    status request_status DEFAULT 'pending'::request_status NOT NULL,
    pickup_location TEXT NOT NULL,
    dropoff_location TEXT NOT NULL,
    instructions TEXT,
    total_estimated_amount NUMERIC(10, 2) DEFAULT 0.00 NOT NULL,
    delivery_fee NUMERIC(10, 2) DEFAULT 0.00 NOT NULL,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Request Items (Items within a delivery request)
CREATE TABLE public.request_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    request_id UUID REFERENCES public.delivery_requests(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    quantity INTEGER DEFAULT 1 NOT NULL,
    notes TEXT,
    estimated_price NUMERIC(10, 2) DEFAULT 0.00,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Delivery Assignments (Maps runners to requests)
CREATE TABLE public.delivery_assignments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    request_id UUID REFERENCES public.delivery_requests(id) ON DELETE CASCADE NOT NULL,
    runner_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    status assignment_status DEFAULT 'active'::assignment_status NOT NULL,
    assigned_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    completed_at TIMESTAMPTZ,
    UNIQUE (request_id, runner_id)
);

-- Ratings
CREATE TABLE public.ratings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    request_id UUID REFERENCES public.delivery_requests(id) ON DELETE SET NULL,
    rater_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    ratee_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    score INTEGER NOT NULL CHECK (score >= 1 AND score <= 5),
    comment TEXT,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Notifications
CREATE TABLE public.notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    type TEXT NOT NULL,
    is_read BOOLEAN DEFAULT false NOT NULL,
    reference_id UUID,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ------------------------------------------------------------------------------
-- 3. Row Level Security (RLS) Enablement
-- ------------------------------------------------------------------------------

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.delivery_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.request_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.delivery_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ratings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- ------------------------------------------------------------------------------
-- 4. RLS Policies
-- ------------------------------------------------------------------------------

-- Profiles
CREATE POLICY "Public profiles are viewable by everyone" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can update their own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- Delivery Requests
CREATE POLICY "Users can view their own requests" ON public.delivery_requests FOR SELECT USING (auth.uid() = requester_id);
CREATE POLICY "Runners can view pending requests" ON public.delivery_requests FOR SELECT USING (
    status = 'pending' AND EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'runner')
);
CREATE POLICY "Runners can view accepted requests they are assigned to" ON public.delivery_requests FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.delivery_assignments WHERE request_id = public.delivery_requests.id AND runner_id = auth.uid())
);
CREATE POLICY "Users can insert their own requests" ON public.delivery_requests FOR INSERT WITH CHECK (auth.uid() = requester_id);
CREATE POLICY "Users can update their own requests" ON public.delivery_requests FOR UPDATE USING (auth.uid() = requester_id);

-- Request Items
CREATE POLICY "Users can view items of requests they can view" ON public.request_items FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.delivery_requests WHERE id = public.request_items.request_id) -- Relies on delivery_requests policies
);
CREATE POLICY "Users can insert items to their own requests" ON public.request_items FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.delivery_requests WHERE id = public.request_items.request_id AND requester_id = auth.uid())
);
CREATE POLICY "Users can update items of their own requests" ON public.request_items FOR UPDATE USING (
    EXISTS (SELECT 1 FROM public.delivery_requests WHERE id = public.request_items.request_id AND requester_id = auth.uid())
);

-- Delivery Assignments
CREATE POLICY "Runners can view their own assignments" ON public.delivery_assignments FOR SELECT USING (auth.uid() = runner_id);
CREATE POLICY "Requesters can view assignments for their requests" ON public.delivery_assignments FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.delivery_requests WHERE id = public.delivery_assignments.request_id AND requester_id = auth.uid())
);
CREATE POLICY "Runners can insert their own assignments" ON public.delivery_assignments FOR INSERT WITH CHECK (auth.uid() = runner_id);
CREATE POLICY "Runners can update their own assignments" ON public.delivery_assignments FOR UPDATE USING (auth.uid() = runner_id);

-- Ratings
CREATE POLICY "Users can view ratings they gave or received" ON public.ratings FOR SELECT USING (auth.uid() = rater_id OR auth.uid() = ratee_id);
CREATE POLICY "Users can insert ratings as the rater" ON public.ratings FOR INSERT WITH CHECK (auth.uid() = rater_id);

-- Notifications
CREATE POLICY "Users can view their own notifications" ON public.notifications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update their own notifications" ON public.notifications FOR UPDATE USING (auth.uid() = user_id);

-- ------------------------------------------------------------------------------
-- 5. Functions & Triggers
-- ------------------------------------------------------------------------------

-- Update 'updated_at' column automatically
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_profiles_updated
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

CREATE TRIGGER on_requests_updated
    BEFORE UPDATE ON public.delivery_requests
    FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

-- Auto-create profile on auth.users INSERT
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, full_name, enrollment_number, role)
    VALUES (
        NEW.id,
        NEW.raw_user_meta_data->>'full_name',
        NEW.raw_user_meta_data->>'enrollment_number',
        'student'::user_role -- Default role
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
