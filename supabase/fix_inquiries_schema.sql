-- Fix inquiries table schema to match application requirements
-- Run this in your Supabase SQL Editor

-- 1. Ensure full_name exists (renaming name if necessary or adding new)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'inquiries' AND column_name = 'name') AND 
       NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'inquiries' AND column_name = 'full_name') THEN
        ALTER TABLE public.inquiries RENAME COLUMN name TO full_name;
    ELSIF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'inquiries' AND column_name = 'full_name') THEN
        ALTER TABLE public.inquiries ADD COLUMN full_name TEXT;
    END IF;
END $$;

-- 2. Ensure company_name exists
ALTER TABLE public.inquiries ADD COLUMN IF NOT EXISTS company_name TEXT;

-- 3. Ensure project_idea exists
ALTER TABLE public.inquiries ADD COLUMN IF NOT EXISTS project_idea TEXT;

-- 4. Ensure email exists (it should, but just in case)
ALTER TABLE public.inquiries ADD COLUMN IF NOT EXISTS email TEXT;

-- 5. Make required fields NOT NULL (optional, but good for data integrity)
-- We use DO block to avoid errors if data already exists with nulls
DO $$
BEGIN
    -- Only set NOT NULL if column exists
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'inquiries' AND column_name = 'full_name') THEN
        -- You might want to update nulls first: UPDATE public.inquiries SET full_name = 'Unknown' WHERE full_name IS NULL;
        -- ALTER TABLE public.inquiries ALTER COLUMN full_name SET NOT NULL;
    END IF;
END $$;

-- 6. Grant permissions just in case
GRANT ALL ON TABLE public.inquiries TO service_role;
GRANT ALL ON TABLE public.inquiries TO postgres;
-- Allow authenticated and anon to insert (since we use admin client in server action, this is less critical but good for RLS policies if we switch)
GRANT INSERT ON TABLE public.inquiries TO anon;
GRANT INSERT ON TABLE public.inquiries TO authenticated;
