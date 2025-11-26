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
