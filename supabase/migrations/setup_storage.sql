-- Setup Supabase Storage for file attachments

-- Create storage bucket for message attachments
INSERT INTO storage.buckets (id, name, public)
VALUES ('message-attachments', 'message-attachments', false)
ON CONFLICT (id) DO NOTHING;

-- RLS Policies for storage bucket

-- Allow authenticated users to upload files
CREATE POLICY "Users can upload message attachments"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'message-attachments');

-- Allow users to read files from conversations they're part of
CREATE POLICY "Users can view their conversation files"
ON storage.objects FOR SELECT
TO authenticated
USING (
    bucket_id = 'message-attachments' AND (
        -- Extract conversation_id from path (format: conversation_id/filename)
        SPLIT_PART(name, '/', 1)::uuid IN (
            SELECT id FROM conversations
            WHERE client_id = auth.uid()
            OR admin_id = auth.uid()
            OR EXISTS (
                SELECT 1 FROM profiles
                WHERE profiles.id = auth.uid()
                AND profiles.role IN ('admin', 'staff')
            )
        )
    )
);

-- Allow users to delete their own uploads
CREATE POLICY "Users can delete their uploads"
ON storage.objects FOR DELETE
TO authenticated
USING (
    bucket_id = 'message-attachments' AND
    owner = auth.uid()
);
