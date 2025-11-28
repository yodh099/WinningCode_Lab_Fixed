-- Add missing admin UPDATE policy for ideas table
CREATE POLICY "Admins can update all ideas"
    ON public.ideas
    FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM auth.users
            WHERE auth.users.id = auth.uid()
            AND (auth.users.raw_user_meta_data->>'role')::text = 'admin'
        )
    );
