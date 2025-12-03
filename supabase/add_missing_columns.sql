-- Add 'phone' and other potentially missing columns to inquiries table
-- Run this in Supabase SQL Editor to fix the "Could not find column" errors

-- 1. Add 'phone' column (The specific error reported)
ALTER TABLE public.inquiries ADD COLUMN IF NOT EXISTS phone TEXT;

-- 2. Add other columns that might be missing based on the form fields
-- It's safe to run these even if the columns exist (IF NOT EXISTS)
ALTER TABLE public.inquiries ADD COLUMN IF NOT EXISTS project_type VARCHAR(100);
ALTER TABLE public.inquiries ADD COLUMN IF NOT EXISTS budget VARCHAR(100);
ALTER TABLE public.inquiries ADD COLUMN IF NOT EXISTS timeline VARCHAR(100);
ALTER TABLE public.inquiries ADD COLUMN IF NOT EXISTS message TEXT;

-- 3. Grant permissions again just to be sure
GRANT ALL ON TABLE public.inquiries TO service_role;
GRANT ALL ON TABLE public.inquiries TO postgres;
GRANT INSERT ON TABLE public.inquiries TO anon;
GRANT INSERT ON TABLE public.inquiries TO authenticated;
