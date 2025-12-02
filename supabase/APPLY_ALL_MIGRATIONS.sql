-- ========================================
-- WINNING CODE LAB - INITIAL SCHEMA MIGRATION
-- Migration: 20250120_001_initial_schema.sql
-- Description: Core authentication and user management tables
-- ========================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm"; -- For text search optimization

-- ========================================
-- TABLE: profiles
-- User profile information (extends auth.users)
-- ========================================
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    full_name TEXT,
    company_name TEXT,
    phone TEXT,
    bio TEXT,
    timezone VARCHAR(50) DEFAULT 'UTC',
    language VARCHAR(2) DEFAULT 'en' CHECK (language IN ('en', 'fr', 'ht', 'es')),
    avatar_url TEXT,
    role VARCHAR(20) DEFAULT 'client' CHECK (role IN ('client', 'admin', 'staff')),
    is_active BOOLEAN DEFAULT true,
    email_verified BOOLEAN DEFAULT false,
    last_login_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- ========================================
-- TABLE: language_preferences
-- Per-user language preferences for different content types
-- ========================================
CREATE TABLE IF NOT EXISTS public.language_preferences (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    content_type VARCHAR(50) NOT NULL, -- 'blog', 'service', 'ui', etc.
    preferred_language VARCHAR(2) NOT NULL CHECK (preferred_language IN ('en', 'fr', 'ht', 'es')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    UNIQUE(user_id, content_type)
);

-- ========================================
-- INDEXES for performance
-- ========================================
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_profiles_email_verified ON public.profiles(email_verified);
CREATE INDEX IF NOT EXISTS idx_language_preferences_user ON public.language_preferences(user_id);

-- ========================================
-- FUNCTION: Auto-update timestamps
-- ========================================
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc'::text, NOW());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Apply triggers
CREATE TRIGGER update_profiles_updated_at 
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_language_preferences_updated_at 
    BEFORE UPDATE ON public.language_preferences
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ========================================
-- FUNCTION: Auto-create profile on signup
-- ========================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, full_name, language, email_verified)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
        COALESCE(NEW.raw_user_meta_data->>'language', 'en'),
        NEW.email_confirmed_at IS NOT NULL
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ========================================
-- FUNCTION: Update last login timestamp
-- ========================================
CREATE OR REPLACE FUNCTION public.handle_user_login()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.last_sign_in_at IS NOT NULL AND (OLD.last_sign_in_at IS NULL OR NEW.last_sign_in_at > OLD.last_sign_in_at) THEN
        UPDATE public.profiles
        SET last_login_at = NEW.last_sign_in_at
        WHERE id = NEW.id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger
CREATE TRIGGER on_auth_user_login
    AFTER UPDATE ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_user_login();

-- ========================================
-- COMMENTS for documentation
-- ========================================
COMMENT ON TABLE public.profiles IS 'User profiles extending auth.users with additional information';
COMMENT ON TABLE public.language_preferences IS 'Per-user language preferences for different content types';
COMMENT ON COLUMN public.profiles.role IS 'User role: client (default), admin (full access), staff (limited admin)';
COMMENT ON COLUMN public.profiles.is_active IS 'Account status - inactive users cannot login';
-- ========================================
-- WINNING CODE LAB - PROJECTS SCHEMA MIGRATION
-- Migration: 20250120_002_projects_schema.sql
-- Description: Project management tables for showcase and client work
-- ========================================

-- ========================================
-- TABLE: projects
-- Public projects showcase with multi-language support
-- ========================================
CREATE TABLE IF NOT EXISTS public.projects (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    title JSONB NOT NULL, -- {"en": "Title", "fr": "Titre", "ht": "Tit", "es": "Título"}
    description JSONB, -- Multi-language detailed description
    excerpt JSONB, -- Multi-language short summary
    status VARCHAR(20) DEFAULT 'coming_soon' CHECK (status IN ('coming_soon', 'in_progress', 'completed', 'archived')),
    image_url TEXT,
    thumbnail_url TEXT,
    demo_url TEXT,
    github_url TEXT,
    live_url TEXT,
    technologies TEXT[] DEFAULT '{}', -- ['React', 'Node.js', 'PostgreSQL']
    category VARCHAR(50), -- 'web', 'mobile', 'ai', 'blockchain', etc.
    featured BOOLEAN DEFAULT false,
    published BOOLEAN DEFAULT false,
    display_order INTEGER DEFAULT 0,
    view_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Ensure columns exist if table already existed
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS published BOOLEAN DEFAULT false;
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS display_order INTEGER DEFAULT 0;
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS category VARCHAR(50);
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS featured BOOLEAN DEFAULT false;

-- ========================================
-- TABLE: client_projects
-- Active client projects (private)
-- ========================================
CREATE TABLE IF NOT EXISTS public.client_projects (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    client_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    project_name TEXT NOT NULL,
    description TEXT,
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('pending', 'active', 'on_hold', 'completed', 'cancelled')),
    priority VARCHAR(10) DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
    budget DECIMAL(12, 2),
    currency VARCHAR(3) DEFAULT 'USD',
    progress INTEGER DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
    start_date DATE,
    end_date DATE,
    deadline DATE,
    milestones JSONB DEFAULT '[]'::jsonb, -- [{"name": "Phase 1", "date": "2025-01-15", "completed": false}]
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    assigned_to UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Ensure columns exist for client_projects
ALTER TABLE public.client_projects ADD COLUMN IF NOT EXISTS project_name TEXT;
ALTER TABLE public.client_projects ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE public.client_projects ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'active';
ALTER TABLE public.client_projects ADD COLUMN IF NOT EXISTS priority VARCHAR(10) DEFAULT 'normal';
ALTER TABLE public.client_projects ADD COLUMN IF NOT EXISTS budget DECIMAL(12, 2);
ALTER TABLE public.client_projects ADD COLUMN IF NOT EXISTS currency VARCHAR(3) DEFAULT 'USD';
ALTER TABLE public.client_projects ADD COLUMN IF NOT EXISTS progress INTEGER DEFAULT 0;
ALTER TABLE public.client_projects ADD COLUMN IF NOT EXISTS start_date DATE;
ALTER TABLE public.client_projects ADD COLUMN IF NOT EXISTS end_date DATE;
ALTER TABLE public.client_projects ADD COLUMN IF NOT EXISTS deadline DATE;
ALTER TABLE public.client_projects ADD COLUMN IF NOT EXISTS milestones JSONB DEFAULT '[]'::jsonb;
ALTER TABLE public.client_projects ADD COLUMN IF NOT EXISTS created_by UUID;
ALTER TABLE public.client_projects ADD COLUMN IF NOT EXISTS assigned_to UUID;

-- ========================================
-- TABLE: project_files
-- File attachments for client projects
-- ========================================
CREATE TABLE IF NOT EXISTS public.project_files (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    project_id UUID REFERENCES public.client_projects(id) ON DELETE CASCADE NOT NULL,
    uploader_id UUID REFERENCES auth.users(id) ON DELETE SET NULL NOT NULL,
    file_name TEXT NOT NULL,
    file_url TEXT NOT NULL,
    file_path TEXT, -- Storage bucket path
    file_size INTEGER, -- Size in bytes
    file_type TEXT, -- MIME type
    description TEXT,
    is_public BOOLEAN DEFAULT false,
    version INTEGER DEFAULT 1,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- ========================================
-- TABLE: project_updates
-- Timeline/activity log for client projects
-- ========================================
CREATE TABLE IF NOT EXISTS public.project_updates (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    project_id UUID REFERENCES public.client_projects(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    update_type VARCHAR(30) CHECK (update_type IN ('status_change', 'milestone', 'note', 'file_upload', 'comment', 'progress_update')),
    title TEXT NOT NULL,
    description TEXT,
    metadata JSONB DEFAULT '{}'::jsonb, -- Additional data like old/new status, progress percentage, etc.
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- ========================================
-- INDEXES for performance
-- ========================================
CREATE INDEX IF NOT EXISTS idx_projects_published ON public.projects(published, display_order) WHERE published = true;
CREATE INDEX IF NOT EXISTS idx_projects_featured ON public.projects(featured, display_order) WHERE featured = true;
CREATE INDEX IF NOT EXISTS idx_projects_category ON public.projects(category) WHERE published = true;
CREATE INDEX IF NOT EXISTS idx_projects_status ON public.projects(status);

CREATE INDEX IF NOT EXISTS idx_client_projects_client ON public.client_projects(client_id, status);
CREATE INDEX IF NOT EXISTS idx_client_projects_status ON public.client_projects(status, priority);
CREATE INDEX IF NOT EXISTS idx_client_projects_assigned ON public.client_projects(assigned_to) WHERE assigned_to IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_project_files_project ON public.project_files(project_id);
CREATE INDEX IF NOT EXISTS idx_project_files_uploader ON public.project_files(uploader_id);

CREATE INDEX IF NOT EXISTS idx_project_updates_project ON public.project_updates(project_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_project_updates_type ON public.project_updates(update_type);

-- ========================================
-- TRIGGERS
-- ========================================
CREATE TRIGGER update_projects_updated_at 
    BEFORE UPDATE ON public.projects
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_client_projects_updated_at 
    BEFORE UPDATE ON public.client_projects
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ========================================
-- FUNCTION: Auto-log project status changes
-- ========================================
CREATE OR REPLACE FUNCTION public.log_project_status_change()
RETURNS TRIGGER AS $$
BEGIN
    IF OLD.status IS DISTINCT FROM NEW.status THEN
        INSERT INTO public.project_updates (project_id, user_id, update_type, title, description, metadata)
        VALUES (
            NEW.id,
            auth.uid(),
            'status_change',
            'Status updated',
            format('Project status changed from %s to %s', OLD.status, NEW.status),
            jsonb_build_object('old_status', OLD.status, 'new_status', NEW.status)
        );
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger
CREATE TRIGGER on_client_project_status_change
    AFTER UPDATE ON public.client_projects
    FOR EACH ROW 
    WHEN (OLD.status IS DISTINCT FROM NEW.status)
    EXECUTE FUNCTION public.log_project_status_change();

-- ========================================
-- FUNCTION: Auto-log progress updates
-- ========================================
CREATE OR REPLACE FUNCTION public.log_project_progress_change()
RETURNS TRIGGER AS $$
BEGIN
    IF OLD.progress IS DISTINCT FROM NEW.progress THEN
        INSERT INTO public.project_updates (project_id, user_id, update_type, title, description, metadata)
        VALUES (
            NEW.id,
            auth.uid(),
            'progress_update',
            'Progress updated',
            format('Project progress updated to %s%%', NEW.progress),
            jsonb_build_object('old_progress', OLD.progress, 'new_progress', NEW.progress)
        );
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger
CREATE TRIGGER on_client_project_progress_change
    AFTER UPDATE ON public.client_projects
    FOR EACH ROW 
    WHEN (OLD.progress IS DISTINCT FROM NEW.progress)
    EXECUTE FUNCTION public.log_project_progress_change();

-- ========================================
-- COMMENTS for documentation
-- ========================================
COMMENT ON TABLE public.projects IS 'Public showcase projects with multi-language support';
COMMENT ON TABLE public.client_projects IS 'Active client projects with progress tracking';
COMMENT ON TABLE public.project_files IS 'File attachments for client projects';
COMMENT ON TABLE public.project_updates IS 'Activity timeline for client projects';
COMMENT ON COLUMN public.projects.title IS 'Multi-language title stored as JSONB: {"en": "...", "fr": "...", "ht": "...", "es": "..."}';
COMMENT ON COLUMN public.client_projects.progress IS 'Project completion percentage (0-100)';
COMMENT ON COLUMN public.client_projects.milestones IS 'Project milestones as JSON array';
-- ========================================
-- WINNING CODE LAB - BLOG SCHEMA MIGRATION
-- Migration: 20250120_003_blog_schema.sql
-- Description: Blog system with categories and multi-language support
-- ========================================

-- ========================================
-- TABLE: blog_categories
-- Hierarchical blog categories
-- ========================================
CREATE TABLE IF NOT EXISTS public.blog_categories (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name JSONB NOT NULL, -- {"en": "Technology", "fr": "Technologie", ...}
    slug VARCHAR(255) UNIQUE NOT NULL,
    description JSONB,
    parent_id UUID REFERENCES public.blog_categories(id) ON DELETE SET NULL,
    icon TEXT, -- Icon name or URL
    color VARCHAR(7), -- Hex color code
    display_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- ========================================
-- TABLE: blog_posts
-- Blog articles with multi-language JSONB fields
-- ========================================
CREATE TABLE IF NOT EXISTS public.blog_posts (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    title JSONB NOT NULL, -- {"en": "Title", "fr": "Titre", ...}
    slug VARCHAR(255) UNIQUE NOT NULL,
    content JSONB NOT NULL, -- {"en": "Content...", "fr": "Contenu...", ...}
    excerpt JSONB, -- Short summary
    cover_image TEXT,
    cover_image_alt JSONB, -- Alt text for cover image in multiple languages
    author_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    category_id UUID REFERENCES public.blog_categories(id) ON DELETE SET NULL,
    tags TEXT[] DEFAULT '{}', -- ['AI', 'Web Development', 'Tutorial']
    status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
    published BOOLEAN DEFAULT false,
    published_at TIMESTAMP WITH TIME ZONE,
    featured BOOLEAN DEFAULT false,
    allow_comments BOOLEAN DEFAULT true,
    view_count INTEGER DEFAULT 0,
    reading_time INTEGER, -- Estimated reading time in minutes
    seo_title JSONB, -- Custom SEO title
    seo_description JSONB, -- Custom meta description
    og_image TEXT, -- Open Graph image for social sharing
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Ensure columns exist for blog_posts
ALTER TABLE public.blog_posts ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'draft';
ALTER TABLE public.blog_posts ADD COLUMN IF NOT EXISTS published BOOLEAN DEFAULT false;
ALTER TABLE public.blog_posts ADD COLUMN IF NOT EXISTS published_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE public.blog_posts ADD COLUMN IF NOT EXISTS featured BOOLEAN DEFAULT false;
ALTER TABLE public.blog_posts ADD COLUMN IF NOT EXISTS category_id UUID;

-- ========================================
-- TABLE: blog_translations (Alternative approach)
-- Separate table for blog translations (if preferred over JSONB)
-- NOTE: This is optional - use either JSONB in blog_posts OR this table
-- ========================================
CREATE TABLE IF NOT EXISTS public.blog_translations (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    post_id UUID REFERENCES public.blog_posts(id) ON DELETE CASCADE NOT NULL,
    language VARCHAR(2) NOT NULL CHECK (language IN ('en', 'fr', 'ht', 'es')),
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    excerpt TEXT,
    cover_image_alt TEXT,
    seo_title TEXT,
    seo_description TEXT,
    is_primary BOOLEAN DEFAULT false, -- Mark the primary language version
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    UNIQUE(post_id, language)
);

-- ========================================
-- INDEXES for performance
-- ========================================
CREATE INDEX IF NOT EXISTS idx_blog_categories_slug ON public.blog_categories(slug);
CREATE INDEX IF NOT EXISTS idx_blog_categories_parent ON public.blog_categories(parent_id) WHERE parent_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_blog_categories_active ON public.blog_categories(is_active, display_order);

CREATE INDEX IF NOT EXISTS idx_blog_posts_published ON public.blog_posts(published, published_at DESC) WHERE published = true;
CREATE INDEX IF NOT EXISTS idx_blog_posts_slug ON public.blog_posts(slug);
CREATE INDEX IF NOT EXISTS idx_blog_posts_author ON public.blog_posts(author_id);
CREATE INDEX IF NOT EXISTS idx_blog_posts_category ON public.blog_posts(category_id) WHERE published = true;
CREATE INDEX IF NOT EXISTS idx_blog_posts_status ON public.blog_posts(status);
CREATE INDEX IF NOT EXISTS idx_blog_posts_featured ON public.blog_posts(featured) WHERE published = true AND featured = true;
CREATE INDEX IF NOT EXISTS idx_blog_posts_tags ON public.blog_posts USING GIN(tags); -- GIN index for array search

-- Full-text search index on title (for English - can add more languages)
CREATE INDEX IF NOT EXISTS idx_blog_posts_title_search ON public.blog_posts USING GIN((title->>'en') gin_trgm_ops);

CREATE INDEX IF NOT EXISTS idx_blog_translations_post ON public.blog_translations(post_id, language);
CREATE INDEX IF NOT EXISTS idx_blog_translations_language ON public.blog_translations(language) WHERE is_primary = false;

-- ========================================
-- TRIGGERS
-- ========================================
CREATE TRIGGER update_blog_categories_updated_at 
    BEFORE UPDATE ON public.blog_categories
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_blog_posts_updated_at 
    BEFORE UPDATE ON public.blog_posts
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_blog_translations_updated_at 
    BEFORE UPDATE ON public.blog_translations
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ========================================
-- FUNCTION: Auto-set published_at timestamp
-- ========================================
CREATE OR REPLACE FUNCTION public.set_blog_published_at()
RETURNS TRIGGER AS $$
BEGIN
    -- Set published_at when status changes to published
    IF NEW.published = true AND OLD.published = false AND NEW.published_at IS NULL THEN
        NEW.published_at = TIMEZONE('utc'::text, NOW());
    END IF;
    
    -- Clear published_at when unpublishing
    IF NEW.published = false AND OLD.published = true THEN
        NEW.published_at = NULL;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger
CREATE TRIGGER on_blog_post_publish
    BEFORE UPDATE ON public.blog_posts
    FOR EACH ROW 
    WHEN (OLD.published IS DISTINCT FROM NEW.published)
    EXECUTE FUNCTION public.set_blog_published_at();

-- ========================================
-- FUNCTION: Calculate reading time
-- ========================================
CREATE OR REPLACE FUNCTION public.calculate_reading_time()
RETURNS TRIGGER AS $$
DECLARE
    word_count INTEGER;
    content_text TEXT;
BEGIN
    -- Get English content (default), calculate word count, estimate reading time
    content_text := NEW.content->>'en';
    IF content_text IS NOT NULL THEN
        word_count := array_length(regexp_split_to_array(content_text, '\s+'), 1);
        NEW.reading_time := GREATEST(1, ROUND(word_count / 200.0)); -- 200 words per minute
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger
CREATE TRIGGER on_blog_post_content_change
    BEFORE INSERT OR UPDATE ON public.blog_posts
    FOR EACH ROW 
    WHEN (NEW.content IS NOT NULL)
    EXECUTE FUNCTION public.calculate_reading_time();

-- ========================================
-- FUNCTION: Increment view count
-- ========================================
CREATE OR REPLACE FUNCTION public.increment_blog_view_count(post_id_param UUID)
RETURNS void AS $$
BEGIN
    UPDATE public.blog_posts
    SET view_count = view_count + 1
    WHERE id = post_id_param AND published = true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ========================================
-- COMMENTS for documentation
-- ========================================
COMMENT ON TABLE public.blog_categories IS 'Hierarchical categories for blog posts with multi-language support';
COMMENT ON TABLE public.blog_posts IS 'Blog posts with multi-language content stored in JSONB fields';
COMMENT ON TABLE public.blog_translations IS 'Alternative translation approach - separate rows per language (optional)';
COMMENT ON COLUMN public.blog_posts.reading_time IS 'Estimated reading time in minutes (auto-calculated)';
COMMENT ON COLUMN public.blog_posts.seo_title IS 'Custom SEO title for meta tags (overrides post title)';
COMMENT ON FUNCTION public.increment_blog_view_count IS 'Safely increment view count without exposing to RLS';
-- ========================================
-- WINNING CODE LAB - SERVICES SCHEMA MIGRATION
-- Migration: 20250120_004_services_schema.sql
-- Description: Service offerings with multi-language support
-- ========================================

-- ========================================
-- TABLE: services
-- Service offerings showcase
-- ========================================
CREATE TABLE IF NOT EXISTS public.services (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name JSONB NOT NULL, -- {"en": "Web Development", "fr": "Développement Web", ...}
    slug VARCHAR(255) UNIQUE NOT NULL,
    description JSONB NOT NULL, -- Full description in multiple languages
    short_description JSONB, -- Brief summary
    icon TEXT, -- Icon name or URL
    icon_type VARCHAR(20) DEFAULT 'emoji' CHECK (icon_type IN ('emoji', 'url', 'svg', 'fontawesome')),
    cover_image TEXT,
    features JSONB DEFAULT '[]'::jsonb, -- [{"en": "Feature 1", "fr": "Fonctionnalité 1"}]
    benefits JSONB DEFAULT '[]'::jsonb, -- Similar to features
    pricing_type VARCHAR(20) DEFAULT 'custom' CHECK (pricing_type IN ('fixed', 'hourly', 'custom', 'quote')),
    price_from DECIMAL(12, 2), -- Starting price
    price_to DECIMAL(12, 2), -- Maximum price (optional)
    currency VARCHAR(3) DEFAULT 'USD',
    duration_estimate VARCHAR(100), -- "2-4 weeks", "1-3 months", etc.
    category VARCHAR(50), -- 'web', 'mobile', 'ai', 'consulting', etc.
    tags TEXT[] DEFAULT '{}',
    is_active BOOLEAN DEFAULT true,
    is_featured BOOLEAN DEFAULT false,
    display_order INTEGER DEFAULT 0,
    cta_text JSONB, -- Custom call-to-action text {"en": "Get Started", ...}
    cta_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- ========================================
-- TABLE: service_translations (Alternative approach)
-- Separate table for service translations
-- NOTE: Optional - use if you prefer separate rows over JSONB
-- ========================================
CREATE TABLE IF NOT EXISTS public.service_translations (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    service_id UUID REFERENCES public.services(id) ON DELETE CASCADE NOT NULL,
    language VARCHAR(2) NOT NULL CHECK (language IN ('en', 'fr', 'ht', 'es')),
    name TEXT NOT NULL,
    description TEXT NOT NULL,
    short_description TEXT,
    features TEXT[], -- Array of feature descriptions
    benefits TEXT[], -- Array of benefits
    cta_text TEXT,
    is_primary BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    UNIQUE(service_id, language)
);

-- ========================================
-- TABLE: service_inquiries
-- Specific inquiries for services (linked to main inquiries)
-- ========================================
CREATE TABLE IF NOT EXISTS public.service_inquiries (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    service_id UUID REFERENCES public.services(id) ON DELETE SET NULL,
    inquiry_id UUID, -- Will reference inquiries table (created in next migration)
    preferred_timeline TEXT,
    additional_requirements TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- ========================================
-- INDEXES for performance
-- ========================================
CREATE INDEX IF NOT EXISTS idx_services_slug ON public.services(slug);
CREATE INDEX IF NOT EXISTS idx_services_active ON public.services(is_active, display_order) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_services_featured ON public.services(is_featured) WHERE is_featured = true AND is_active = true;
CREATE INDEX IF NOT EXISTS idx_services_category ON public.services(category) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_services_tags ON public.services USING GIN(tags);

CREATE INDEX IF NOT EXISTS idx_service_translations_service ON public.service_translations(service_id, language);
CREATE INDEX IF NOT EXISTS idx_service_inquiries_service ON public.service_inquiries(service_id);

-- ========================================
-- TRIGGERS
-- ========================================
CREATE TRIGGER update_services_updated_at 
    BEFORE UPDATE ON public.services
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_service_translations_updated_at 
    BEFORE UPDATE ON public.service_translations
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ========================================
-- FUNCTION: Get services with translations
-- Helper function to fetch services in a specific language
-- ========================================
CREATE OR REPLACE FUNCTION public.get_services_by_language(lang VARCHAR(2) DEFAULT 'en')
RETURNS TABLE (
    id UUID,
    name TEXT,
    slug VARCHAR(255),
    description TEXT,
    short_description TEXT,
    icon TEXT,
    features TEXT[],
    price_from DECIMAL(12, 2),
    price_to DECIMAL(12, 2),
    currency VARCHAR(3),
    is_featured BOOLEAN
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        s.id,
        COALESCE(s.name->>lang, s.name->>'en') as name,
        s.slug,
        COALESCE(s.description->>lang, s.description->>'en') as description,
        COALESCE(s.short_description->>lang, s.short_description->>'en') as short_description,
        s.icon,
        ARRAY(SELECT jsonb_array_elements_text(s.features)) as features,
        s.price_from,
        s.price_to,
        s.currency,
        s.is_featured
    FROM public.services s
    WHERE s.is_active = true
    ORDER BY s.display_order, s.name;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ========================================
-- COMMENTS for documentation
-- ========================================
COMMENT ON TABLE public.services IS 'Service offerings with multi-language support and pricing information';
COMMENT ON TABLE public.service_translations IS 'Alternative translation table for services (optional)';
COMMENT ON TABLE public.service_inquiries IS 'Service-specific inquiry details linked to main inquiries';
COMMENT ON COLUMN public.services.features IS 'Array of feature descriptions in JSONB format';
COMMENT ON COLUMN public.services.pricing_type IS 'Type of pricing: fixed, hourly, custom quote, etc.';
COMMENT ON FUNCTION public.get_services_by_language IS 'Retrieves services with content in specified language, falls back to English';
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

-- Ensure columns exist for inquiries
ALTER TABLE public.inquiries ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'new';
ALTER TABLE public.inquiries ADD COLUMN IF NOT EXISTS priority VARCHAR(10) DEFAULT 'normal';
ALTER TABLE public.inquiries ADD COLUMN IF NOT EXISTS assigned_to UUID;
ALTER TABLE public.inquiries ADD COLUMN IF NOT EXISTS project_type VARCHAR(50);
ALTER TABLE public.inquiries ADD COLUMN IF NOT EXISTS budget VARCHAR(50);
ALTER TABLE public.inquiries ADD COLUMN IF NOT EXISTS timeline VARCHAR(50);

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
-- ========================================
-- WINNING CODE LAB - STORAGE BUCKETS MIGRATION
-- Migration: 20250120_008_storage_buckets.sql
-- Description: Storage buckets and policies for file management
-- ========================================

-- NOTE: Storage buckets must be created via Supabase Dashboard or CLI
-- This migration contains the SQL policies for bucket access control

-- ========================================
-- STORAGE BUCKET POLICIES
-- ========================================

-- ========== BUCKET: project_uploads (Public Read, Admin Write) ==========

-- Allow public to view project images
CREATE POLICY "Public can view project uploads"
    ON storage.objects FOR SELECT
    USING (bucket_id = 'project_uploads');

-- Allow admins and staff to upload project images
CREATE POLICY "Admins and staff can upload project images"
    ON storage.objects FOR INSERT
    WITH CHECK (
        bucket_id = 'project_uploads' AND
        public.is_admin_or_staff()
    );

-- Allow admins and staff to update project images
CREATE POLICY "Admins and staff can update project images"
    ON storage.objects FOR UPDATE
    USING (
        bucket_id = 'project_uploads' AND
        public.is_admin_or_staff()
    );

-- Allow admins to delete project images
CREATE POLICY "Admins can delete project images"
    ON storage.objects FOR DELETE
    USING (
        bucket_id = 'project_uploads' AND
        public.is_admin()
    );

-- ========== BUCKET: blog_images (Public Read, Admin Write) ==========

-- Allow public to view blog images
CREATE POLICY "Public can view blog images"
    ON storage.objects FOR SELECT
    USING (bucket_id = 'blog_images');

-- Allow admins and staff to upload blog images
CREATE POLICY "Admins and staff can upload blog images"
    ON storage.objects FOR INSERT
    WITH CHECK (
        bucket_id = 'blog_images' AND
        public.is_admin_or_staff()
    );

-- Allow admins and staff to update blog images
CREATE POLICY "Admins and staff can update blog images"
    ON storage.objects FOR UPDATE
    USING (
        bucket_id = 'blog_images' AND
        public.is_admin_or_staff()
    );

-- Allow admins to delete blog images
CREATE POLICY "Admins can delete blog images"
    ON storage.objects FOR DELETE
    USING (
        bucket_id = 'blog_images' AND
        public.is_admin()
    );

-- ========== BUCKET: client_documents (Private - User Folder-Based) ==========

-- Users can view their own files (stored in /user_id/ folders)
CREATE POLICY "Users can view own client documents"
    ON storage.objects FOR SELECT
    USING (
        bucket_id = 'client_documents' AND
        (
            (storage.foldername(name))[1] = auth.uid()::text OR
            public.is_admin_or_staff()
        )
    );

-- Users can upload to their own folder
CREATE POLICY "Users can upload own client documents"
    ON storage.objects FOR INSERT
    WITH CHECK (
        bucket_id = 'client_documents' AND
        (
            (storage.foldername(name))[1] = auth.uid()::text OR
            public.is_admin_or_staff()
        )
    );

-- Users can update their own files
CREATE POLICY "Users can update own client documents"
    ON storage.objects FOR UPDATE
    USING (
        bucket_id = 'client_documents' AND
        (
            (storage.foldername(name))[1] = auth.uid()::text OR
            public.is_admin_or_staff()
        )
    );

-- Users can delete their own files
CREATE POLICY "Users can delete own client documents"
    ON storage.objects FOR DELETE
    USING (
        bucket_id = 'client_documents' AND
        (
            (storage.foldername(name))[1] = auth.uid()::text OR
            public.is_admin()
        )
    );

-- ========== BUCKET: avatars (Public Read, Owner Write) ==========

-- Allow everyone to view avatars
CREATE POLICY "Public can view avatars"
    ON storage.objects FOR SELECT
    USING (bucket_id = 'avatars');

-- Users can upload to their own folder
CREATE POLICY "Users can upload own avatar"
    ON storage.objects FOR INSERT
    WITH CHECK (
        bucket_id = 'avatars' AND
        (storage.foldername(name))[1] = auth.uid()::text
    );

-- Users can update their own avatar
CREATE POLICY "Users can update own avatar"
    ON storage.objects FOR UPDATE
    USING (
        bucket_id = 'avatars' AND
        (storage.foldername(name))[1] = auth.uid()::text
    );

-- Users can delete their own avatar
CREATE POLICY "Users can delete own avatar"
    ON storage.objects FOR DELETE
    USING (
        bucket_id = 'avatars' AND
        (storage.foldername(name))[1] = auth.uid()::text
    );

-- ========================================
-- HELPER FUNCTIONS FOR STORAGE
-- ========================================

-- Function to generate signed URL for private files
CREATE OR REPLACE FUNCTION public.get_signed_url(
    bucket_name TEXT,
    file_path TEXT,
    expiry_seconds INTEGER DEFAULT 3600
)
RETURNS TEXT AS $$
DECLARE
    signed_url TEXT;
BEGIN
    -- Check if user has access to this file
    IF bucket_name = 'client_documents' THEN
        -- Verify user owns this file or is admin
        IF (storage.foldername(file_path))[1] != auth.uid()::text AND NOT public.is_admin_or_staff() THEN
            RAISE EXCEPTION 'Access denied to file: %', file_path;
        END IF;
    END IF;
    
    -- Generate signed URL (requires service_role in actual implementation)
    -- This is a placeholder - actual signed URL generation happens client-side or via Edge Function
    signed_url := format('https://your-project.supabase.co/storage/v1/object/sign/%s/%s?token=...', bucket_name, file_path);
    
    RETURN signed_url;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check file upload permissions
CREATE OR REPLACE FUNCTION public.can_upload_file(
    bucket_name TEXT,
    file_path TEXT,
    file_size BIGINT
)
RETURNS BOOLEAN AS $$
DECLARE
    max_size BIGINT;
BEGIN
    -- Get max file size from system settings
    max_size := (public.get_system_setting('max_file_upload_mb')::TEXT::INTEGER * 1024 * 1024);
    
    -- Check file size
    IF file_size > max_size THEN
        RETURN FALSE;
    END IF;
    
    -- Check bucket-specific permissions
    CASE bucket_name
        WHEN 'project_uploads', 'blog_images' THEN
            RETURN public.is_admin_or_staff();
        WHEN 'client_documents' THEN
            RETURN (storage.foldername(file_path))[1] = auth.uid()::text OR public.is_admin_or_staff();
        WHEN 'avatars' THEN
            RETURN (storage.foldername(file_path))[1] = auth.uid()::text;
        ELSE
            RETURN FALSE;
    END CASE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ========================================
-- BUCKET CREATION INSTRUCTIONS
-- ========================================

/*
RUN THESE COMMANDS IN SUPABASE DASHBOARD OR CLI:

1. Create buckets via Dashboard (Storage section):
   - project_uploads (public: true)
   - blog_images (public: true)
   - client_documents (public: false)
   - avatars (public: true)

2. OR via Supabase CLI:

supabase storage create project_uploads --public
supabase storage create blog_images --public
supabase storage create client_documents
supabase storage create avatars --public

3. Set file size limits (optional):

UPDATE storage.buckets 
SET file_size_limit = 10485760 -- 10MB
WHERE id = 'project_uploads';

UPDATE storage.buckets 
SET file_size_limit = 5242880 -- 5MB
WHERE id = 'blog_images';

UPDATE storage.buckets 
SET file_size_limit = 52428800 -- 50MB
WHERE id = 'client_documents';

UPDATE storage.buckets 
SET file_size_limit = 2097152 -- 2MB
WHERE id = 'avatars';

4. Set allowed MIME types (optional):

UPDATE storage.buckets 
SET allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'application/pdf']
WHERE id IN ('project_uploads', 'blog_images');

UPDATE storage.buckets 
SET allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
WHERE id = 'avatars';
*/

-- ========================================
-- COMMENTS
-- ========================================
COMMENT ON FUNCTION public.get_signed_url IS 'Generate signed URL for private file access (requires service_role)';
COMMENT ON FUNCTION public.can_upload_file IS 'Check if user has permission to upload file to bucket';
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
        FOR admin_record IN (SELECT id FROM public.profiles WHERE role = 'admin') LOOP
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
