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
