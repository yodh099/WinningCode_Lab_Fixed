# Fix Ideas RLS and Other Admin Console Issues

## Instructions

Kopi epi kole SQL sa a nan Supabase SQL Editor pou fikse admins policies sou ideas table:

```sql
-- Fix ideas table RLS policies to use profiles table for admin check
-- Drop old policies
DROP POLICY IF EXISTS "Admins can view all ideas" ON public.ideas;
DROP POLICY IF EXISTS "Admins can update all ideas" ON public.ideas;

-- Create new policies using profiles table
CREATE POLICY "Admins can view all ideas"
    ON public.ideas
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role = 'admin'
        )
    );

CREATE POLICY "Admins can update all ideas"
    ON public.ideas
    FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role = 'admin'
        )
    );

CREATE POLICY "Admins can delete ideas"
    ON public.ideas
    FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role = 'admin'
        )
    );
```

## Where to run this:

1. Go to https://supabase.com/dashboard
2. Select your project
3. Navigate to SQL Editor
4. Paste the SQL above
5. Click "Run"

After applying this, the Ideas page should work without errors for admins.
