-- ========================================
-- WINNING CODE LAB - ADMIN SCHEMA MIGRATION
-- Migration: 20250120_006_admin_schema.sql
-- Description: Admin dashboard, analytics, and audit logging
-- ========================================

-- ========================================
-- TABLE: client_dashboard_data
-- Dashboard metrics and KPIs for admin
-- ========================================
CREATE TABLE IF NOT EXISTS public.client_dashboard_data (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    metric_name VARCHAR(100) NOT NULL, -- 'total_projects', 'active_clients', 'revenue_mtd', etc.
    metric_value JSONB NOT NULL, -- Can store number, string, array, object
    metric_type VARCHAR(20) DEFAULT 'counter' CHECK (metric_type IN ('counter', 'gauge', 'percentage', 'currency', 'list')),
    category VARCHAR(50), -- 'projects', 'financials', 'clients', 'performance'
    time_period VARCHAR(20), -- 'daily', 'weekly', 'monthly', 'yearly', 'all_time'
    reference_date DATE,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- ========================================
-- TABLE: audit_log
-- Complete audit trail for compliance and security
-- ========================================
CREATE TABLE IF NOT EXISTS public.audit_log (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    action VARCHAR(50) NOT NULL, -- 'create', 'read', 'update', 'delete', 'login', 'logout'
    table_name VARCHAR(100), -- Which table was affected
    record_id UUID, -- ID of affected record
    old_values JSONB, -- Previous values (for updates/deletes)
    new_values JSONB, -- New values (for creates/updates)
    ip_address INET,
    user_agent TEXT,
    request_path TEXT,
    request_method VARCHAR(10), -- 'GET', 'POST', 'PUT', 'DELETE'
    status_code INTEGER,
    error_message TEXT,
    execution_time INTEGER, -- Milliseconds
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- ========================================
-- TABLE: system_settings
-- Application-wide configuration
-- ========================================
CREATE TABLE IF NOT EXISTS public.system_settings (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    setting_key VARCHAR(100) UNIQUE NOT NULL,
    setting_value JSONB NOT NULL,
    setting_type VARCHAR(20) DEFAULT 'string' CHECK (setting_type IN ('string', 'number', 'boolean', 'json', 'array')),
    category VARCHAR(50), -- 'general', 'email', 'security', 'features'
    description TEXT,
    is_public BOOLEAN DEFAULT false, -- Can non-admins read this?
    is_editable BOOLEAN DEFAULT true, -- Can this be changed via UI?
    validation_rules JSONB, -- JSON schema for validation
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- ========================================
-- TABLE: activity_log
-- User activity tracking (lighter than audit_log)
-- ========================================
CREATE TABLE IF NOT EXISTS public.activity_log (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    activity_type VARCHAR(50) NOT NULL, -- 'page_view', 'file_download', 'search', etc.
    description TEXT,
    resource_type VARCHAR(50), -- 'project', 'blog_post', 'service', etc.
    resource_id UUID,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- ========================================
-- INDEXES for performance
-- ========================================
CREATE INDEX IF NOT EXISTS idx_dashboard_data_metric ON public.client_dashboard_data(metric_name, time_period);
CREATE INDEX IF NOT EXISTS idx_dashboard_data_category ON public.client_dashboard_data(category, reference_date DESC);
CREATE INDEX IF NOT EXISTS idx_dashboard_data_date ON public.client_dashboard_data(reference_date DESC);

CREATE INDEX IF NOT EXISTS idx_audit_log_user ON public.audit_log(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_log_action ON public.audit_log(action, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_log_table ON public.audit_log(table_name, action, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_log_record ON public.audit_log(record_id) WHERE record_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_audit_log_created ON public.audit_log(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_system_settings_key ON public.system_settings(setting_key);
CREATE INDEX IF NOT EXISTS idx_system_settings_category ON public.system_settings(category);
CREATE INDEX IF NOT EXISTS idx_system_settings_public ON public.system_settings(is_public) WHERE is_public = true;

CREATE INDEX IF NOT EXISTS idx_activity_log_user ON public.activity_log(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_activity_log_type ON public.activity_log(activity_type, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_activity_log_resource ON public.activity_log(resource_type, resource_id);

-- ========================================
-- TRIGGERS
-- ========================================
CREATE TRIGGER update_dashboard_data_updated_at 
    BEFORE UPDATE ON public.client_dashboard_data
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_system_settings_updated_at 
    BEFORE UPDATE ON public.system_settings
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ========================================
-- FUNCTION: Log audit event
-- ========================================
CREATE OR REPLACE FUNCTION public.log_audit_event(
    p_action VARCHAR(50),
    p_table_name VARCHAR(100),
    p_record_id UUID DEFAULT NULL,
    p_old_values JSONB DEFAULT NULL,
    p_new_values JSONB DEFAULT NULL,
    p_metadata JSONB DEFAULT '{}'::jsonb
)
RETURNS UUID AS $$
DECLARE
    new_audit_id UUID;
BEGIN
    INSERT INTO public.audit_log (
        user_id,
        action,
        table_name,
        record_id,
        old_values,
        new_values,
        metadata
    )
    VALUES (
        auth.uid(),
        p_action,
        p_table_name,
        p_record_id,
        p_old_values,
        p_new_values,
        p_metadata
    )
    RETURNING id INTO new_audit_id;
    
    RETURN new_audit_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ========================================
-- FUNCTION: Get system setting
-- ========================================
CREATE OR REPLACE FUNCTION public.get_system_setting(p_key VARCHAR(100))
RETURNS JSONB AS $$
DECLARE
    setting_val JSONB;
BEGIN
    SELECT setting_value INTO setting_val
    FROM public.system_settings
    WHERE setting_key = p_key;
    
    RETURN setting_val;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ========================================
-- FUNCTION: Calculate dashboard metrics
-- ========================================
CREATE OR REPLACE FUNCTION public.refresh_dashboard_metrics()
RETURNS void AS $$
DECLARE
    total_clients INTEGER;
    active_projects INTEGER;
    total_inquiries INTEGER;
    current_date DATE := CURRENT_DATE;
BEGIN
    -- Count total clients
    SELECT COUNT(*) INTO total_clients
    FROM public.profiles
    WHERE role = 'client' AND is_active = true;
    
    -- Count active projects
    SELECT COUNT(*) INTO active_projects
    FROM public.client_projects
    WHERE status = 'active';
    
    -- Count inquiries this month
    SELECT COUNT(*) INTO total_inquiries
    FROM public.inquiries
    WHERE created_at >= DATE_TRUNC('month', CURRENT_TIMESTAMP);
    
    -- Insert/update metrics
    INSERT INTO public.client_dashboard_data (metric_name, metric_value, metric_type, category, time_period, reference_date)
    VALUES 
        ('total_clients', to_jsonb(total_clients), 'counter', 'clients', 'all_time', current_date),
        ('active_projects', to_jsonb(active_projects), 'counter', 'projects', 'all_time', current_date),
        ('inquiries_this_month', to_jsonb(total_inquiries), 'counter', 'inquiries', 'monthly', current_date)
    ON CONFLICT (id) DO UPDATE
    SET metric_value = EXCLUDED.metric_value,
        updated_at = TIMEZONE('utc'::text, NOW());
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ========================================
-- FUNCTION: Cleanup old audit logs
-- ========================================
CREATE OR REPLACE FUNCTION public.cleanup_old_audit_logs(days_to_keep INTEGER DEFAULT 90)
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    DELETE FROM public.audit_log
    WHERE created_at < TIMEZONE('utc'::text, NOW()) - INTERVAL '1 day' * days_to_keep;
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ========================================
-- SEED DATA: Default system settings
-- ========================================
INSERT INTO public.system_settings (setting_key, setting_value, setting_type, category, description, is_public)
VALUES 
    ('site_name', '"Winning Code Lab"'::jsonb, 'string', 'general', 'Website name', true),
    ('default_language', '"en"'::jsonb, 'string', 'general', 'Default language for new users', true),
    ('supported_languages', '["en", "fr", "ht", "es"]'::jsonb, 'array', 'general', 'Supported languages', true),
    ('maintenance_mode', 'false'::jsonb, 'boolean', 'general', 'Enable maintenance mode', false),
    ('contact_email', '"info@winningcode.com"'::jsonb, 'string', 'general', 'Contact email address', true),
    ('max_file_upload_mb', '50'::jsonb, 'number', 'security', 'Maximum file upload size in MB', false),
    ('inquiry_rate_limit', '5'::jsonb, 'number', 'security', 'Max inquiries per hour per IP', false),
    ('enable_blog_comments', 'true'::jsonb, 'boolean', 'features', 'Enable blog comments', true)
ON CONFLICT (setting_key) DO NOTHING;

-- ========================================
-- COMMENTS for documentation
-- ========================================
COMMENT ON TABLE public.client_dashboard_data IS 'Dashboard metrics and KPIs for admin panel';
COMMENT ON TABLE public.audit_log IS 'Complete audit trail for security and compliance';
COMMENT ON TABLE public.system_settings IS 'Application-wide configuration settings';
COMMENT ON TABLE public.activity_log IS 'User activity tracking for analytics';
COMMENT ON FUNCTION public.log_audit_event IS 'Log an audit event for compliance tracking';
COMMENT ON FUNCTION public.refresh_dashboard_metrics IS 'Recalculate and update dashboard metrics';
COMMENT ON FUNCTION public.cleanup_old_audit_logs IS 'Delete audit logs older than specified days';
