-- ========================================
-- WINNING CODE LAB - FIX RLS POLICIES
-- Migration: 20250120_008_fix_rls.sql
-- Description: Fix RLS policies for client_projects to allow admins to create projects
-- ========================================

-- Drop existing policy
DROP POLICY IF EXISTS "Admins and staff can manage client projects" ON public.client_projects;

-- Re-create with explicit permissions
CREATE POLICY "Admins and staff can insert client projects"
    ON public.client_projects FOR INSERT
    WITH CHECK (public.is_admin_or_staff());

CREATE POLICY "Admins and staff can update client projects"
    ON public.client_projects FOR UPDATE
    USING (public.is_admin_or_staff());

CREATE POLICY "Admins and staff can delete client projects"
    ON public.client_projects FOR DELETE
    USING (public.is_admin_or_staff());

-- Ensure SELECT is covered (already exists but for completeness)
-- CREATE POLICY "Admins and staff can view all client projects" ... (already exists)
