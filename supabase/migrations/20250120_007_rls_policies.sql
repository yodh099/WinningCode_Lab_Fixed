-- ========================================
-- WINNING CODE LAB - RLS POLICIES MIGRATION
-- Migration: 20250120_007_rls_policies.sql
-- Description: Row Level Security policies for all tables
-- ========================================

-- ========================================
-- ENABLE RLS ON ALL TABLES
-- ========================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.language_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.client_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_files ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_updates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blog_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blog_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blog_translations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.service_translations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.service_inquiries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inquiries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.client_dashboard_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.system_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_log ENABLE ROW LEVEL SECURITY;

-- ========================================
-- HELPER FUNCTIONS FOR RLS
-- ========================================

-- Check if current user is admin or staff
CREATE OR REPLACE FUNCTION public.is_admin_or_staff()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid() AND role IN ('admin', 'staff')
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Check if current user is admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid() AND role = 'admin'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- ========================================
-- PROFILES POLICIES
-- ========================================

CREATE POLICY "Anyone can view profiles"
    ON public.profiles FOR SELECT
    USING (true);

CREATE POLICY "Users can update own profile"
    ON public.profiles FOR UPDATE
    USING (auth.uid() = id);

CREATE POLICY "Admins can manage all profiles"
    ON public.profiles FOR ALL
    USING (public.is_admin());

-- ========================================
-- LANGUAGE PREFERENCES POLICIES
-- ========================================

CREATE POLICY "Users can view own language preferences"
    ON public.language_preferences FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own language preferences"
    ON public.language_preferences FOR ALL
    USING (auth.uid() = user_id);

-- ========================================
-- PROJECTS POLICIES (Public Showcase)
-- ========================================

CREATE POLICY "Published projects are viewable by everyone"
    ON public.projects FOR SELECT
    USING (published = true);

CREATE POLICY "Admins and staff can manage all projects"
    ON public.projects FOR ALL
    USING (public.is_admin_or_staff());

-- ========================================
-- CLIENT PROJECTS POLICIES
-- ========================================

CREATE POLICY "Clients can view own projects"
    ON public.client_projects FOR SELECT
    USING (auth.uid() = client_id);

CREATE POLICY "Admins and staff can view all client projects"
    ON public.client_projects FOR SELECT
    USING (public.is_admin_or_staff());

CREATE POLICY "Admins and staff can manage client projects"
    ON public.client_projects FOR ALL
    USING (public.is_admin_or_staff());

-- ========================================
-- PROJECT FILES POLICIES
-- ========================================

CREATE POLICY "Users can view files from their projects"
    ON public.project_files FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.client_projects
            WHERE client_projects.id = project_files.project_id
            AND client_projects.client_id = auth.uid()
        ) OR public.is_admin_or_staff()
    );

CREATE POLICY "Users can upload files to their projects"
    ON public.project_files FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.client_projects
            WHERE client_projects.id = project_files.project_id
            AND client_projects.client_id = auth.uid()
        ) OR public.is_admin_or_staff()
    );

CREATE POLICY "Admins and staff can manage all files"
    ON public.project_files FOR ALL
    USING (public.is_admin_or_staff());

-- ========================================
-- PROJECT UPDATES POLICIES
-- ========================================

CREATE POLICY "Users can view updates from their projects"
    ON public.project_updates FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.client_projects
            WHERE client_projects.id = project_updates.project_id
            AND client_projects.client_id = auth.uid()
        ) OR public.is_admin_or_staff()
    );

CREATE POLICY "Admins and staff can create project updates"
    ON public.project_updates FOR INSERT
    WITH CHECK (public.is_admin_or_staff());

CREATE POLICY "Admins and staff can manage project updates"
    ON public.project_updates FOR ALL
    USING (public.is_admin_or_staff());

-- ========================================
-- BLOG CATEGORIES POLICIES
-- ========================================

CREATE POLICY "Everyone can view active blog categories"
    ON public.blog_categories FOR SELECT
    USING (is_active = true);

CREATE POLICY "Admins and staff can manage blog categories"
    ON public.blog_categories FOR ALL
    USING (public.is_admin_or_staff());

-- ========================================
-- BLOG POSTS POLICIES
-- ========================================

CREATE POLICY "Everyone can view published blog posts"
    ON public.blog_posts FOR SELECT
    USING (published = true);

CREATE POLICY "Admins and staff can view all blog posts"
    ON public.blog_posts FOR SELECT
    USING (public.is_admin_or_staff());

CREATE POLICY "Admins and staff can manage blog posts"
    ON public.blog_posts FOR ALL
    USING (public.is_admin_or_staff());

-- ========================================
-- BLOG TRANSLATIONS POLICIES
-- ========================================

CREATE POLICY "Everyone can view blog translations for published posts"
    ON public.blog_translations FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.blog_posts
            WHERE blog_posts.id = blog_translations.post_id
            AND blog_posts.published = true
        )
    );

CREATE POLICY "Admins and staff can manage blog translations"
    ON public.blog_translations FOR ALL
    USING (public.is_admin_or_staff());

-- ========================================
-- SERVICES POLICIES
-- ========================================

CREATE POLICY "Everyone can view active services"
    ON public.services FOR SELECT
    USING (is_active = true);

CREATE POLICY "Admins can manage all services"
    ON public.services FOR ALL
    USING (public.is_admin());

-- ========================================
-- SERVICE TRANSLATIONS POLICIES
-- ========================================

CREATE POLICY "Everyone can view service translations for active services"
    ON public.service_translations FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.services
            WHERE services.id = service_translations.service_id
            AND services.is_active = true
        )
    );

CREATE POLICY "Admins and staff can manage service translations"
    ON public.service_translations FOR ALL
    USING (public.is_admin_or_staff());

-- ========================================
-- SERVICE INQUIRIES POLICIES
-- ========================================

CREATE POLICY "Admins and staff can view service inquiries"
    ON public.service_inquiries FOR SELECT
    USING (public.is_admin_or_staff());

CREATE POLICY "Anyone can create service inquiries"
    ON public.service_inquiries FOR INSERT
    WITH CHECK (true);

-- ========================================
-- INQUIRIES POLICIES
-- ========================================

CREATE POLICY "Anyone can create inquiries"
    ON public.inquiries FOR INSERT
    WITH CHECK (true);

CREATE POLICY "Admins and staff can view all inquiries"
    ON public.inquiries FOR SELECT
    USING (public.is_admin_or_staff());

CREATE POLICY "Admins and staff can update inquiries"
    ON public.inquiries FOR UPDATE
    USING (public.is_admin_or_staff());

CREATE POLICY "Admins can delete inquiries"
    ON public.inquiries FOR DELETE
    USING (public.is_admin());

-- ========================================
-- MESSAGES POLICIES
-- ========================================

CREATE POLICY "Users can view messages where they are sender or recipient"
    ON public.messages FOR SELECT
    USING (
        auth.uid() = sender_id OR
        auth.uid() = recipient_id OR
        public.is_admin_or_staff()
    );

CREATE POLICY "Authenticated users can send messages"
    ON public.messages FOR INSERT
    WITH CHECK (auth.uid() = sender_id);

CREATE POLICY "Recipients can update their messages (mark as read)"
    ON public.messages FOR UPDATE
    USING (auth.uid() = recipient_id);

CREATE POLICY "Admins can manage all messages"
    ON public.messages FOR ALL
    USING (public.is_admin());

-- ========================================
-- NOTIFICATIONS POLICIES
-- ========================================

CREATE POLICY "Users can view own notifications"
    ON public.notifications FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can update own notifications (mark as read)"
    ON public.notifications FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "System can create notifications for users"
    ON public.notifications FOR INSERT
    WITH CHECK (true); -- Controlled by SECURITY DEFINER functions

CREATE POLICY "Users can delete own notifications"
    ON public.notifications FOR DELETE
    USING (auth.uid() = user_id);

-- ========================================
-- CLIENT DASHBOARD DATA POLICIES
-- ========================================

CREATE POLICY "Admins and staff can view dashboard data"
    ON public.client_dashboard_data FOR SELECT
    USING (public.is_admin_or_staff());

CREATE POLICY "Admins and staff can manage dashboard data"
    ON public.client_dashboard_data FOR ALL
    USING (public.is_admin_or_staff());

-- ========================================
-- AUDIT LOG POLICIES
-- ========================================

CREATE POLICY "Admins can view audit logs"
    ON public.audit_log FOR SELECT
    USING (public.is_admin());

CREATE POLICY "System can create audit logs"
    ON public.audit_log FOR INSERT
    WITH CHECK (true); -- Controlled by SECURITY DEFINER functions

-- Note: No UPDATE or DELETE policies - audit logs are immutable

-- ========================================
-- SYSTEM SETTINGS POLICIES
-- ========================================

CREATE POLICY "Everyone can view public settings"
    ON public.system_settings FOR SELECT
    USING (is_public = true);

CREATE POLICY "Admins can view all settings"
    ON public.system_settings FOR SELECT
    USING (public.is_admin());

CREATE POLICY "Admins can manage editable settings"
    ON public.system_settings FOR ALL
    USING (public.is_admin() AND is_editable = true);

-- ========================================
-- ACTIVITY LOG POLICIES
-- ========================================

CREATE POLICY "Users can view own activity"
    ON public.activity_log FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all activity"
    ON public.activity_log FOR SELECT
    USING (public.is_admin());

CREATE POLICY "Users can create own activity logs"
    ON public.activity_log FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- ========================================
-- GRANT PERMISSIONS
-- ========================================

-- Grant usage on public schema
GRANT USAGE ON SCHEMA public TO anon, authenticated;

-- Grant access to tables
GRANT SELECT ON public.profiles TO anon, authenticated;
GRANT SELECT ON public.projects TO anon;
GRANT SELECT ON public.blog_posts TO anon;
GRANT SELECT ON public.blog_categories TO anon;
GRANT SELECT ON public.services TO anon;
GRANT INSERT ON public.inquiries TO anon;

-- Grant all on tables to authenticated users (RLS will restrict)
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;

-- Grant execute on functions
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO authenticated;

-- ========================================
-- COMMENTS
-- ========================================
COMMENT ON FUNCTION public.is_admin_or_staff IS 'Check if current user has admin or staff role';
COMMENT ON FUNCTION public.is_admin IS 'Check if current user has admin role';
