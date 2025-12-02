-- Quick fix to add missing column to client_projects table
-- Run this in Supabase SQL Editor: https://supabase.com/dashboard/project/nancqltlgxcsxrtuttmh/sql

ALTER TABLE public.client_projects ADD COLUMN IF NOT EXISTS project_name TEXT;
