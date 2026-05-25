-- =======================================================================================
-- MESSAGE IN A BOTTLE - SUPABASE DATABASE SCHEMA
-- Copy and paste this entire file into the Supabase SQL Editor and click "Run".
-- =======================================================================================

-- 1. Create the `profiles` table to store extra user information
CREATE TABLE public.profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    username TEXT,
    email TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Create the `bottles` table to store all the digital time capsules
CREATE TABLE public.bottles (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    mood TEXT NOT NULL,
    unlock_date DATE NOT NULL,
    theme TEXT, -- Stores the chosen mood color
    spotify_url TEXT,
    opened BOOLEAN DEFAULT false,
    delivery_status TEXT DEFAULT 'pending',
    delivered_at TIMESTAMP WITH TIME ZONE,
    delivery_error TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- =======================================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- This ensures users can ONLY see and edit their own bottles and profile.
-- =======================================================================================

-- Enable RLS on tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bottles ENABLE ROW LEVEL SECURITY;

-- Profiles: Users can only view and update their own profile
CREATE POLICY "Users can view their own profile" 
    ON public.profiles FOR SELECT 
    USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" 
    ON public.profiles FOR UPDATE 
    USING (auth.uid() = id);

-- Bottles: Users have full CRUD access, but ONLY to their own bottles
CREATE POLICY "Users can fully manage their own bottles" 
    ON public.bottles FOR ALL 
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- =======================================================================================
-- AUTHENTICATION TRIGGERS
-- Automatically create a profile row whenever a new user signs up in Supabase Auth.
-- =======================================================================================

-- Create the trigger function
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, username)
  VALUES (
    new.id, 
    new.email, 
    new.raw_user_meta_data->>'username' -- Assumes you pass username in metadata during signup
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Attach the trigger to auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Database setup is complete! ==========================================================