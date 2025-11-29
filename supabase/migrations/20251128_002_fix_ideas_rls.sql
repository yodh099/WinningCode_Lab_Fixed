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
