-- Create tables for tontine application

-- Users table (this is automatically created by Supabase Auth, but we need to add some fields)
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  name TEXT,
  email TEXT UNIQUE NOT NULL,
  image TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);

-- Tontines table
CREATE TABLE IF NOT EXISTS public.tontines (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  stake_amount DECIMAL(10, 2) NOT NULL,
  max_subscriptions INTEGER NOT NULL,
  frequency TEXT NOT NULL,
  user_id UUID NOT NULL REFERENCES public.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
  is_private BOOLEAN DEFAULT FALSE NOT NULL
);

-- Tontine participants table
CREATE TABLE IF NOT EXISTS public.tontine_participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tontine_id UUID NOT NULL REFERENCES public.tontines(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  position INTEGER NOT NULL,
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
  UNIQUE(tontine_id, user_id),
  UNIQUE(tontine_id, position)
);

-- Tontine payments table
CREATE TABLE IF NOT EXISTS public.tontine_payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tontine_id UUID NOT NULL REFERENCES public.tontines(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  amount DECIMAL(10, 2) NOT NULL,
  payment_date TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending'
);

-- Row Level Security (RLS) policies

-- Users table policies
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view other users"
  ON public.users FOR SELECT
  USING (true);

CREATE POLICY "Users can update own record"
  ON public.users FOR UPDATE
  USING (auth.uid() = id);

-- Tontines table policies
ALTER TABLE public.tontines ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view non-private tontines"
  ON public.tontines FOR SELECT
  USING (NOT is_private OR user_id = auth.uid());

CREATE POLICY "Participants can view private tontines"
  ON public.tontines FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.tontine_participants
      WHERE tontine_id = id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Only creator can update tontine"
  ON public.tontines FOR UPDATE
  USING (user_id = auth.uid());

CREATE POLICY "Only creator can delete tontine"
  ON public.tontines FOR DELETE
  USING (user_id = auth.uid());

CREATE POLICY "Authenticated users can create tontines"
  ON public.tontines FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

-- Tontine participants policies
ALTER TABLE public.tontine_participants ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view participants"
  ON public.tontine_participants FOR SELECT
  USING (true);

CREATE POLICY "Users can join tontines they don't moderate"
  ON public.tontine_participants FOR INSERT
  WITH CHECK (
    auth.uid() = user_id AND
    NOT EXISTS (
      SELECT 1 FROM public.tontines
      WHERE id = tontine_id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can leave tontines"
  ON public.tontine_participants FOR DELETE
  USING (user_id = auth.uid());

-- Tontine payments policies
ALTER TABLE public.tontine_payments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view payments"
  ON public.tontine_payments FOR SELECT
  USING (true);

CREATE POLICY "Users can create their own payments"
  ON public.tontine_payments FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Only user or creator can update payment"
  ON public.tontine_payments FOR UPDATE
  USING (
    auth.uid() = user_id OR
    EXISTS (
      SELECT 1 FROM public.tontines
      WHERE id = tontine_id AND user_id = auth.uid()
    )
  );
