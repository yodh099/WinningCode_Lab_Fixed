-- ========================================
-- WINNING CODE LAB - DATABASE SCHEMA
-- ========================================
-- Supabase PostgreSQL Schema
-- Version: 1.0.0
-- ========================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ========================================
-- TABLE 1: profiles
-- User profile information (extends auth.users)
-- ========================================
CREATE TABLE IF NOT EXISTS profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    full_name TEXT,
    company_name TEXT,
    phone TEXT,
    language VARCHAR(2) DEFAULT 'en' CHECK (language IN ('en', 'fr', 'ht', 'es')),
    avatar_url TEXT,
    role VARCHAR(20) DEFAULT 'client' CHECK (role IN ('client', 'admin', 'staff')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- ========================================
-- TABLE 2: projects
-- Public projects showcase
-- ========================================
CREATE TABLE IF NOT EXISTS projects (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    title JSONB NOT NULL,
    description JSONB,
    excerpt JSONB,
    status VARCHAR(20) DEFAULT 'coming_soon' CHECK (status IN ('coming_soon', 'in_progress', 'completed', 'archived')),
    image_url TEXT,
    demo_url TEXT,
    github_url TEXT,
    technologies TEXT[] DEFAULT '{}',
    published BOOLEAN DEFAULT false,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- ========================================
-- TABLE 3: blog_posts
-- Blog articles with multi-language support
-- ========================================
CREATE TABLE IF NOT EXISTS blog_posts (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    title JSONB NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    content JSONB NOT NULL,
    excerpt JSONB,
    cover_image TEXT,
    author_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    category VARCHAR(50),
    tags TEXT[] DEFAULT '{}',
    published BOOLEAN DEFAULT false,
    published_at TIMESTAMP WITH TIME ZONE,
    views INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- ========================================
-- TABLE 4: inquiries
-- "Just Ask" form submissions
-- ========================================
CREATE TABLE IF NOT EXISTS inquiries (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT,
    email TEXT NOT NULL,
    phone TEXT,
    project_idea TEXT NOT NULL,
    budget TEXT,
    file_url TEXT,
    status VARCHAR(20) DEFAULT 'new' CHECK (status IN ('new', 'reviewing', 'responded', 'converted', 'closed')),
    priority VARCHAR(10) DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
    notes TEXT,
    assigned_to UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- ========================================
-- TABLE 5: client_projects
-- Active client projects
-- ========================================
CREATE TABLE IF NOT EXISTS client_projects (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    client_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    project_name TEXT NOT NULL,
    description TEXT,
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('pending', 'active', 'on_hold', 'completed', 'cancelled')),
    budget DECIMAL(12, 2),
    currency VARCHAR(3) DEFAULT 'USD',
    progress INTEGER DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
    start_date DATE,
    end_date DATE,
    deadline DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- ========================================
-- TABLE 6: messages
-- Communication between clients and team
-- ========================================
CREATE TABLE IF NOT EXISTS messages (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    project_id UUID REFERENCES client_projects(id) ON DELETE CASCADE,
    sender_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    recipient_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    subject TEXT,
    content TEXT NOT NULL,
    is_read BOOLEAN DEFAULT false,
    read_at TIMESTAMP WITH TIME ZONE,
    parent_message_id UUID REFERENCES messages(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- ========================================
-- TABLE 7: files
-- File attachments for projects
-- ========================================
CREATE TABLE IF NOT EXISTS files (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    project_id UUID REFERENCES client_projects(id) ON DELETE CASCADE NOT NULL,
    uploader_id UUID REFERENCES auth.users(id) ON DELETE SET NULL NOT NULL,
    file_name TEXT NOT NULL,
    file_url TEXT NOT NULL,
    file_size INTEGER,
    file_type TEXT,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- ========================================
-- TABLE 8: project_updates
-- Timeline/activity log for client projects
-- ========================================
CREATE TABLE IF NOT EXISTS project_updates (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    project_id UUID REFERENCES client_projects(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    update_type VARCHAR(30) CHECK (update_type IN ('status_change', 'milestone', 'note', 'file_upload', 'comment')),
    title TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- ========================================
-- INDEXES for performance
-- ========================================
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);
CREATE INDEX IF NOT EXISTS idx_projects_published ON projects(published, display_order);
CREATE INDEX IF NOT EXISTS idx_blog_posts_published ON blog_posts(published, published_at DESC);
CREATE INDEX IF NOT EXISTS idx_blog_posts_slug ON blog_posts(slug);
CREATE INDEX IF NOT EXISTS idx_inquiries_status ON inquiries(status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_client_projects_client ON client_projects(client_id, status);
CREATE INDEX IF NOT EXISTS idx_messages_recipient ON messages(recipient_id, is_read);
CREATE INDEX IF NOT EXISTS idx_messages_project ON messages(project_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_files_project ON files(project_id);
CREATE INDEX IF NOT EXISTS idx_project_updates_project ON project_updates(project_id, created_at DESC);

-- ========================================
-- FUNCTIONS: Auto-update timestamps
-- ========================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc'::text, NOW());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply triggers
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON projects
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_blog_posts_updated_at BEFORE UPDATE ON blog_posts
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_inquiries_updated_at BEFORE UPDATE ON inquiries
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_client_projects_updated_at BEFORE UPDATE ON client_projects
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ========================================
-- FUNCTION: Auto-create profile on signup
-- ========================================
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, full_name, language)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
        COALESCE(NEW.raw_user_meta_data->>'language', 'en')
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ========================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ========================================

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE inquiries ENABLE ROW LEVEL SECURITY;
ALTER TABLE client_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE files ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_updates ENABLE ROW LEVEL SECURITY;

-- ========================================
-- PROFILES POLICIES
-- ========================================
CREATE POLICY "Public profiles are viewable by everyone"
    ON profiles FOR SELECT
    USING (true);

CREATE POLICY "Users can update own profile"
    ON profiles FOR UPDATE
    USING (auth.uid() = id);

CREATE POLICY "Admins can update all profiles"
    ON profiles FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role = 'admin'
        )
    );

-- ========================================
-- PROJECTS POLICIES (Public Showcase)
-- ========================================
CREATE POLICY "Published projects are viewable by everyone"
    ON projects FOR SELECT
    USING (published = true);

CREATE POLICY "Admins can manage all projects"
    ON projects FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role IN ('admin', 'staff')
        )
    );

-- ========================================
-- BLOG_POSTS POLICIES
-- ========================================
CREATE POLICY "Published blog posts are viewable by everyone"
    ON blog_posts FOR SELECT
    USING (published = true);

CREATE POLICY "Admins and staff can manage blog posts"
    ON blog_posts FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role IN ('admin', 'staff')
        )
    );

-- ========================================
-- INQUIRIES POLICIES
-- ========================================
CREATE POLICY "Anyone can create inquiries"
    ON inquiries FOR INSERT
    WITH CHECK (true);

CREATE POLICY "Admins and staff can view all inquiries"
    ON inquiries FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role IN ('admin', 'staff')
        )
    );

CREATE POLICY "Admins and staff can update inquiries"
    ON inquiries FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role IN ('admin', 'staff')
        )
    );

-- ========================================
-- CLIENT_PROJECTS POLICIES
-- ========================================
CREATE POLICY "Clients can view own projects"
    ON client_projects FOR SELECT
    USING (auth.uid() = client_id);

CREATE POLICY "Admins and staff can view all projects"
    ON client_projects FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role IN ('admin', 'staff')
        )
    );

CREATE POLICY "Admins and staff can manage projects"
    ON client_projects FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role IN ('admin', 'staff')
        )
    );

-- ========================================
-- MESSAGES POLICIES
-- ========================================
CREATE POLICY "Users can view messages where they are sender or recipient"
    ON messages FOR SELECT
    USING (
        auth.uid() = sender_id OR
        auth.uid() = recipient_id OR
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role IN ('admin', 'staff')
        )
    );

CREATE POLICY "Users can send messages"
    ON messages FOR INSERT
    WITH CHECK (auth.uid() = sender_id);

CREATE POLICY "Recipients can update their messages (mark as read)"
    ON messages FOR UPDATE
    USING (auth.uid() = recipient_id);

-- ========================================
-- FILES POLICIES
-- ========================================
CREATE POLICY "Users can view files from their projects"
    ON files FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM client_projects
            WHERE client_projects.id = files.project_id
            AND client_projects.client_id = auth.uid()
        ) OR
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role IN ('admin', 'staff')
        )
    );

CREATE POLICY "Users can upload files to their projects"
    ON files FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM client_projects
            WHERE client_projects.id = files.project_id
            AND client_projects.client_id = auth.uid()
        ) OR
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role IN ('admin', 'staff')
        )
    );

-- ========================================
-- PROJECT_UPDATES POLICIES
-- ========================================
CREATE POLICY "Users can view updates from their projects"
    ON project_updates FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM client_projects
            WHERE client_projects.id = project_updates.project_id
            AND client_projects.client_id = auth.uid()
        ) OR
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role IN ('admin', 'staff')
        )
    );

CREATE POLICY "Admins and staff can create project updates"
    ON project_updates FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role IN ('admin', 'staff')
        )
    );

-- ========================================
-- STORAGE POLICIES (Run these in Supabase Dashboard -> Storage)
-- ========================================

-- For 'project-images' bucket (public):
-- CREATE POLICY "Public project images are accessible to everyone"
-- ON storage.objects FOR SELECT
-- USING (bucket_id = 'project-images');

-- CREATE POLICY "Admins can upload project images"
-- ON storage.objects FOR INSERT
-- WITH CHECK (
--     bucket_id = 'project-images' AND
--     (SELECT role FROM profiles WHERE id = auth.uid()) IN ('admin', 'staff')
-- );

-- For 'client-files' bucket (private):
-- CREATE POLICY "Users can access their project files"
-- ON storage.objects FOR SELECT
-- USING (
--     bucket_id = 'client-files' AND
--     (storage.foldername(name))[1] = auth.uid()::text
-- );

-- CREATE POLICY "Users can upload their project files"
-- ON storage.objects FOR INSERT
-- WITH CHECK (
--     bucket_id = 'client-files' AND
--     (storage.foldername(name))[1] = auth.uid()::text
-- );

-- ========================================
-- SEED DATA (Optional - for testing)
-- ========================================

-- Insert sample blog posts
-- INSERT INTO blog_posts (title, slug, content, excerpt, published) VALUES
-- (
--     '{"en": "The Future of AI", "fr": "L''avenir de l''IA", "ht": "Avni AI a", "es": "El Futuro de la IA"}'::jsonb,
--     'future-of-ai',
--     '{"en": "Content here...", "fr": "Contenu ici...", "ht": "Kontni isit...", "es": "Contenido aquí..."}'::jsonb,
--     '{"en": "AI is changing...", "fr": "L''IA change...", "ht": "AI ap chanje...", "es": "La IA está cambiando..."}'::jsonb,
--     true
-- );

-- ========================================
-- END OF SCHEMA
-- ========================================
