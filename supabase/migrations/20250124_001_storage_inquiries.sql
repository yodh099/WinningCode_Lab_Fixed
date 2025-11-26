-- ========================================
-- WINNING CODE LAB - INQUIRIES ATTACHMENTS BUCKET
-- Migration: 20250124_001_storage_inquiries.sql
-- Description: Storage bucket for contact form file attachments
-- ========================================

-- ========================================
-- BUCKET: inquiries-attachments
-- Purpose: Store files uploaded via "Just Ask" contact form
-- Access: Public read, Edge Function write only
-- ========================================

-- NOTE: Bucket must be created via Supabase Dashboard or CLI:
-- supabase storage create inquiries-attachments --public

-- ========== STORAGE POLICIES ==========

-- Allow public to view inquiry attachments (for admin review)
CREATE POLICY "Public can view inquiry attachments"
    ON storage.objects FOR SELECT
    USING (bucket_id = 'inquiries-attachments');

-- Only service role can upload (via Edge Function)
-- This prevents spam and ensures files are associated with valid inquiries
CREATE POLICY "Service role can upload inquiry attachments"
    ON storage.objects FOR INSERT
    WITH CHECK (
        bucket_id = 'inquiries-attachments'
        -- No auth.uid() check - only Edge Function with service_role can upload
    );

-- Allow admins to delete inquiry attachments
CREATE POLICY "Admins can delete inquiry attachments"
    ON storage.objects FOR DELETE
    USING (
        bucket_id = 'inquiries-attachments' AND
        public.is_admin()
    );

-- ========================================
-- BUCKET CONFIGURATION INSTRUCTIONS
-- ========================================

/*
RUN THESE COMMANDS TO CONFIGURE THE BUCKET:

1. Create bucket via Dashboard or CLI:
   
   Via Dashboard (Storage section):
   - Name: inquiries-attachments
   - Public: true
   - File size limit: 10MB
   - Allowed MIME types: Most common file types
   
   Via CLI:
   supabase storage create inquiries-attachments --public

2. Set file size limit (10MB):

UPDATE storage.buckets 
SET file_size_limit = 10485760
WHERE id = 'inquiries-attachments';

3. Set allowed MIME types:

UPDATE storage.buckets 
SET allowed_mime_types = ARRAY[
    'image/jpeg',
    'image/png',
    'image/webp',
    'image/gif',
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'text/plain',
    'application/zip'
]
WHERE id = 'inquiries-attachments';

4. Verify bucket exists:

SELECT id, name, public, file_size_limit, allowed_mime_types
FROM storage.buckets
WHERE id = 'inquiries-attachments';
*/

-- ========================================
-- COMMENTS
-- ========================================
COMMENT ON POLICY "Public can view inquiry attachments" ON storage.objects 
IS 'Allows anyone to view files uploaded via contact form (needed for admin review)';

COMMENT ON POLICY "Service role can upload inquiry attachments" ON storage.objects 
IS 'Only Edge Function with service_role key can upload files (prevents spam)';

COMMENT ON POLICY "Admins can delete inquiry attachments" ON storage.objects 
IS 'Allows admins to delete spam or inappropriate files';
