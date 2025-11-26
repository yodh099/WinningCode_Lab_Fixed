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
