-- Migration: Fix Messages Schema and RLS
-- Description: Updates FKs to point to profiles for easier joins and applies correct RLS policies.

BEGIN;

-- 1. Drop existing FKs to auth.users to replace them
ALTER TABLE public.messages 
DROP CONSTRAINT IF EXISTS messages_sender_id_fkey,
DROP CONSTRAINT IF EXISTS messages_recipient_id_fkey;

-- 2. Add FKs to public.profiles (enables the join: sender:sender_id(full_name))
ALTER TABLE public.messages
ADD CONSTRAINT messages_sender_id_fkey 
    FOREIGN KEY (sender_id) REFERENCES public.profiles(id) ON DELETE CASCADE,
ADD CONSTRAINT messages_recipient_id_fkey 
    FOREIGN KEY (recipient_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

-- 3. Enable RLS
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- 4. Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Users can view their own messages" ON public.messages;
DROP POLICY IF EXISTS "Users can send messages" ON public.messages;
DROP POLICY IF EXISTS "Admins can view all messages" ON public.messages;
DROP POLICY IF EXISTS "Admins can send messages" ON public.messages;

-- 5. Create new RLS policies

-- Policy: Users can view messages where they are the sender OR recipient
CREATE POLICY "Users can view their own messages" ON public.messages
FOR SELECT USING (
    auth.uid() = sender_id OR auth.uid() = recipient_id
);

-- Policy: Users can insert messages where they are the sender
CREATE POLICY "Users can send messages" ON public.messages
FOR INSERT WITH CHECK (
    auth.uid() = sender_id
);

-- Policy: Admins can view ALL messages
CREATE POLICY "Admins can view all messages" ON public.messages
FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid() AND role = 'admin'
    )
);

-- Policy: Admins can send messages
CREATE POLICY "Admins can send messages" ON public.messages
FOR INSERT WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid() AND role = 'admin'
    )
);

COMMIT;
