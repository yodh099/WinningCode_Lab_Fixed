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
