-- ========================================
-- WINNING CODE LAB - COMMUNICATIONS SCHEMA MIGRATION
-- Migration: 20250120_005_communications_schema.sql
-- Description: Inquiries, messages, and notifications
-- ========================================

-- ========================================
-- TABLE: inquiries
-- "Just Ask" form submissions and general inquiries
-- ========================================
CREATE TABLE IF NOT EXISTS public.inquiries (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT,
    company_name TEXT,
    project_idea TEXT NOT NULL,
    project_type VARCHAR(50), -- 'web', 'mobile', 'ai', 'custom', etc.
    budget VARCHAR(50), -- '$5k-$10k', '$10k-$25k', 'custom', etc.
    timeline VARCHAR(50), -- 'urgent', '1-3 months', '3-6 months', etc.
    preferred_language VARCHAR(2) DEFAULT 'en' CHECK (preferred_language IN ('en', 'fr', 'ht', 'es')),
    message TEXT,
    file_url TEXT, -- Attachment from storage
    file_name TEXT,
    source VARCHAR(50) DEFAULT 'website', -- 'website', 'referral', 'social_media', etc.
    status VARCHAR(20) DEFAULT 'new' CHECK (status IN ('new', 'reviewing', 'contacted', 'responded', 'converted', 'closed', 'spam')),
    priority VARCHAR(10) DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
    notes TEXT, -- Internal notes (admin only)
    assigned_to UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    converted_to_project_id UUID REFERENCES public.client_projects(id) ON DELETE SET NULL,
    ip_address INET, -- For spam prevention
    user_agent TEXT,
    utm_source TEXT, -- Marketing tracking
    utm_medium TEXT,
    utm_campaign TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    responded_at TIMESTAMP WITH TIME ZONE
);

-- ========================================
-- TABLE: messages
-- Communication between clients and team
-- ========================================
CREATE TABLE IF NOT EXISTS public.messages (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    project_id UUID REFERENCES public.client_projects(id) ON DELETE CASCADE,
    sender_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    recipient_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    subject TEXT NOT NULL,
    content TEXT NOT NULL,
    message_type VARCHAR(20) DEFAULT 'general' CHECK (message_type IN ('general', 'update', 'question', 'urgent', 'system')),
    priority VARCHAR(10) DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
    is_read BOOLEAN DEFAULT false,
    is_archived BOOLEAN DEFAULT false,
    read_at TIMESTAMP WITH TIME ZONE,
    parent_message_id UUID REFERENCES public.messages(id) ON DELETE SET NULL, -- For threading
    attachments JSONB DEFAULT '[]'::jsonb, -- [{"name": "file.pdf", "url": "...", "size": 12345}]
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- ========================================
-- TABLE: notifications
-- System notifications for users
-- ========================================
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    notification_type VARCHAR(50) NOT NULL, -- 'new_message', 'project_update', 'payment_due', etc.
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    action_url TEXT, -- URL to navigate to when clicked
    action_text TEXT, -- Text for action button
    icon TEXT,
    severity VARCHAR(20) DEFAULT 'info' CHECK (severity IN ('info', 'success', 'warning', 'error')),
    is_read BOOLEAN DEFAULT false,
    is_dismissed BOOLEAN DEFAULT false,
    read_at TIMESTAMP WITH TIME ZONE,
    dismissed_at TIMESTAMP WITH TIME ZONE,
    expires_at TIMESTAMP WITH TIME ZONE, -- Auto-delete after this date
    metadata JSONB DEFAULT '{}'::jsonb, -- Additional data
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- ========================================
-- INDEXES for performance
-- ========================================
CREATE INDEX IF NOT EXISTS idx_inquiries_status ON public.inquiries(status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_inquiries_email ON public.inquiries(email);
CREATE INDEX IF NOT EXISTS idx_inquiries_assigned ON public.inquiries(assigned_to) WHERE assigned_to IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_inquiries_priority ON public.inquiries(priority) WHERE status IN ('new', 'reviewing');
CREATE INDEX IF NOT EXISTS idx_inquiries_source ON public.inquiries(source);

CREATE INDEX IF NOT EXISTS idx_messages_recipient ON public.messages(recipient_id, is_read, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_messages_sender ON public.messages(sender_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_messages_project ON public.messages(project_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_messages_parent ON public.messages(parent_message_id) WHERE parent_message_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_messages_unread ON public.messages(recipient_id, is_read) WHERE is_read = false;

CREATE INDEX IF NOT EXISTS idx_notifications_user ON public.notifications(user_id, is_read, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_unread ON public.notifications(user_id, is_read) WHERE is_read = false;
CREATE INDEX IF NOT EXISTS idx_notifications_type ON public.notifications(notification_type);
CREATE INDEX IF NOT EXISTS idx_notifications_expires ON public.notifications(expires_at) WHERE expires_at IS NOT NULL;

-- ========================================
-- TRIGGERS
-- ========================================
CREATE TRIGGER update_inquiries_updated_at 
    BEFORE UPDATE ON public.inquiries
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ========================================
-- FUNCTION: Auto-set responded_at timestamp
-- ========================================
CREATE OR REPLACE FUNCTION public.set_inquiry_responded_at()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.status = 'responded' AND OLD.status != 'responded' AND NEW.responded_at IS NULL THEN
        NEW.responded_at = TIMEZONE('utc'::text, NOW());
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger
CREATE TRIGGER on_inquiry_responded
    BEFORE UPDATE ON public.inquiries
    FOR EACH ROW 
    WHEN (NEW.status = 'responded')
    EXECUTE FUNCTION public.set_inquiry_responded_at();

-- ========================================
-- FUNCTION: Mark message as read
-- ========================================
CREATE OR REPLACE FUNCTION public.mark_message_read(message_id_param UUID)
RETURNS void AS $$
BEGIN
    UPDATE public.messages
    SET is_read = true, read_at = TIMEZONE('utc'::text, NOW())
    WHERE id = message_id_param AND recipient_id = auth.uid() AND is_read = false;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ========================================
-- FUNCTION: Create notification
-- ========================================
CREATE OR REPLACE FUNCTION public.create_notification(
    p_user_id UUID,
    p_type VARCHAR(50),
    p_title TEXT,
    p_message TEXT,
    p_action_url TEXT DEFAULT NULL,
    p_severity VARCHAR(20) DEFAULT 'info'
)
RETURNS UUID AS $$
DECLARE
    new_notification_id UUID;
BEGIN
    INSERT INTO public.notifications (user_id, notification_type, title, message, action_url, severity)
    VALUES (p_user_id, p_type, p_title, p_message, p_action_url, p_severity)
    RETURNING id INTO new_notification_id;
    
    RETURN new_notification_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ========================================
-- FUNCTION: Auto-cleanup expired notifications
-- ========================================
CREATE OR REPLACE FUNCTION public.cleanup_expired_notifications()
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    DELETE FROM public.notifications
    WHERE expires_at IS NOT NULL AND expires_at < TIMEZONE('utc'::text, NOW());
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ========================================
-- FUNCTION: Get unread message count
-- ========================================
CREATE OR REPLACE FUNCTION public.get_unread_message_count()
RETURNS INTEGER AS $$
DECLARE
    unread_count INTEGER;
BEGIN
    SELECT COUNT(*)
    INTO unread_count
    FROM public.messages
    WHERE recipient_id = auth.uid() AND is_read = false AND is_archived = false;
    
    RETURN unread_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ========================================
-- COMMENTS for documentation
-- ========================================
COMMENT ON TABLE public.inquiries IS 'Contact form submissions and general inquiries from "Just Ask" feature';
COMMENT ON TABLE public.messages IS 'Direct messages between clients and team members';
COMMENT ON TABLE public.notifications IS 'System notifications for users (project updates, messages, etc.)';
COMMENT ON COLUMN public.inquiries.utm_source IS 'Marketing attribution tracking';
COMMENT ON COLUMN public.messages.parent_message_id IS 'For threaded conversations';
COMMENT ON FUNCTION public.mark_message_read IS 'Mark a message as read (only by recipient)';
COMMENT ON FUNCTION public.create_notification IS 'Create a new notification for a user';
COMMENT ON FUNCTION public.cleanup_expired_notifications IS 'Delete notifications past their expiration date';
