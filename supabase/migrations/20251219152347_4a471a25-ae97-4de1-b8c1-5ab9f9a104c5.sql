-- Add new fields to profiles table for professionals
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS location text,
ADD COLUMN IF NOT EXISTS consultation_rate numeric DEFAULT 0,
ADD COLUMN IF NOT EXISTS availability text;