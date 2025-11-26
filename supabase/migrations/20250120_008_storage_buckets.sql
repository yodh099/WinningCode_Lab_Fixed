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
INSERT INTO storage.objects FOR INSERT
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
