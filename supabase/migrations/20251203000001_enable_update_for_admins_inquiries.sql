-- Enable update for admins on inquiries table
CREATE POLICY "Enable update for admins" ON "public"."inquiries" FOR UPDATE USING ((auth.uid() IN (SELECT profiles.id FROM profiles WHERE (profiles.role = 'admin'::text OR profiles.role = 'staff'::text))));
