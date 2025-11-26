-- Create ideas table
CREATE TABLE IF NOT EXISTS public.ideas (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    budget TEXT,
    deadline DATE,
    file_url TEXT,
    priority TEXT DEFAULT 'normal',
    status TEXT DEFAULT 'pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.ideas ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can insert their own ideas"
    ON public.ideas
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own ideas"
    ON public.ideas
    FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all ideas"
    ON public.ideas
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM auth.users
            WHERE auth.users.id = auth.uid()
            AND (auth.users.raw_user_meta_data->>'role')::text = 'admin'
        )
    );

-- Grant access
GRANT ALL ON public.ideas TO authenticated;
GRANT ALL ON public.ideas TO service_role;
