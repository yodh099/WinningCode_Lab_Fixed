-- ========================================
-- WINNING CODE LAB - FIXES & TRIGGERS
-- Migration: 20250120_009_fixes_and_triggers.sql
-- Description: Fix RLS for projects and add notification triggers
-- ========================================

-- 1. FIX RLS FOR CLIENT_PROJECTS (Aggressive Fix)
-- Drop existing policies to start fresh
DROP POLICY IF EXISTS "Admins and staff can manage client projects" ON public.client_projects;
DROP POLICY IF EXISTS "Admins and staff can insert client projects" ON public.client_projects;
DROP POLICY IF EXISTS "Admins and staff can update client projects" ON public.client_projects;
DROP POLICY IF EXISTS "Admins and staff can delete client projects" ON public.client_projects;
DROP POLICY IF EXISTS "Admins and staff can view all client projects" ON public.client_projects;
DROP POLICY IF EXISTS "Clients can view own projects" ON public.client_projects;

-- Re-create policies
CREATE POLICY "Admins and staff can manage all client projects"
    ON public.client_projects
    USING (public.is_admin_or_staff())
    WITH CHECK (public.is_admin_or_staff());

CREATE POLICY "Clients can view own projects"
    ON public.client_projects FOR SELECT
    USING (auth.uid() = client_id);

-- 2. TRIGGER FOR NEW MESSAGES -> NOTIFICATION
CREATE OR REPLACE FUNCTION public.handle_new_message()
RETURNS TRIGGER AS $$
DECLARE
    sender_name TEXT;
BEGIN
    -- Get sender name
    SELECT full_name INTO sender_name FROM public.profiles WHERE id = NEW.sender_id;
    
    -- Create notification for recipient
    INSERT INTO public.notifications (user_id, notification_type, title, message, action_url, severity)
    VALUES (
        NEW.recipient_id,
        'message',
        'New Message from ' || COALESCE(sender_name, 'User'),
        substring(NEW.content from 1 for 50) || '...',
        '/admin/messages', -- Default to admin link, client will redirect if needed
        'info'
    );
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_new_message ON public.messages;
CREATE TRIGGER on_new_message
    AFTER INSERT ON public.messages
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_message();

-- 3. TRIGGER FOR NEW IDEAS (INQUIRIES) -> NOTIFICATION (FOR ADMINS)
CREATE OR REPLACE FUNCTION public.handle_new_inquiry()
RETURNS TRIGGER AS $$
DECLARE
    admin_record RECORD;
BEGIN
    -- Only notify for new inquiries
    IF NEW.status = 'new' THEN
        -- Loop through all admins and create notification
        FOR admin_record IN SELECT id FROM public.profiles WHERE role = 'admin' LOOP
            INSERT INTO public.notifications (user_id, notification_type, title, message, action_url, severity)
            VALUES (
                admin_record.id,
                'idea',
                'New Idea Submitted',
                'New idea from ' || NEW.name || ': ' || NEW.project_idea,
                '/admin/ideas',
                'success'
            );
        END LOOP;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_new_inquiry ON public.inquiries;
CREATE TRIGGER on_new_inquiry
    AFTER INSERT ON public.inquiries
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_inquiry();
