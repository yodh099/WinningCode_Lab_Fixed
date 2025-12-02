-- Check the actual schema of client_projects table
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'client_projects' 
  AND table_schema = 'public'
ORDER BY ordinal_position;
