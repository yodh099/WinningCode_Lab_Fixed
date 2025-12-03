-- Add updated_at column to inquiries table
ALTER TABLE inquiries ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
