-- Fix client_projects assigned_to foreign key to reference profiles instead of auth.users
ALTER TABLE client_projects DROP CONSTRAINT IF EXISTS client_projects_assigned_to_fkey;
ALTER TABLE client_projects ADD CONSTRAINT client_projects_assigned_to_fkey FOREIGN KEY (assigned_to) REFERENCES profiles(id);
