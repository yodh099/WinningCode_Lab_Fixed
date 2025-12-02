-- Run this query in Supabase SQL Editor to verify if migrations were applied
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'client_projects'
ORDER BY ordinal_position;
