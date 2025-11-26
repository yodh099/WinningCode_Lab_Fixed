# Supabase Backend Integration Guide
## Winning Code Lab - Complete Setup Instructions

---

## 📋 Prerequisites

Before you begin, ensure you have:

- **Supabase Account**: Create one at [supabase.com](https://supabase.com)
- **Supabase CLI**: Install via `npm install -g supabase` or `brew install supabase/tap/supabase`
- **Git**: For version control
- **Node.js 16+**: For local development

---

## 🚀 Quick Start

### 1. Create Supabase Project

**Option A: Via Supabase Dashboard**
1. Go to [app.supabase.com](https://app.supabase.com)
2. Click "New Project"
3. Choose organization, region (recommend `us-east-1` for best performance)
4. Set database password (save this securely!)
5. Wait for project to initialize (~2 minutes)

**Option B: Via CLI**
```bash
supabase projects create winning-code-lab --org-id <your-org-id> --region us-east-1
```

### 2. Link Local Project to Supabase

```bash
cd /path/to/WinningCode_Lab
supabase link --project-ref <your-project-ref>
```

### 3. Apply Migrations

Run all migrations in order:

```bash
# Apply all migrations
supabase db push

# Or apply individually
supabase db push supabase/migrations/20250120_001_initial_schema.sql
supabase db push supabase/migrations/20250120_002_projects_schema.sql
# ... continue with all 8 migrations
```

### 4. Create Storage Buckets

**Via Dashboard:**
1. Go to Storage in your Supabase project
2. Create these buckets:
   - `project_uploads` (public)
   - `blog_images` (public)
   - `client_documents` (private)
   - `avatars` (public)

**Via CLI:**
```bash
supabase storage create project_uploads --public
supabase storage create blog_images --public
supabase storage create client_documents
supabase storage create avatars --public
```

### 5. Deploy Edge Functions

```bash
# Deploy all functions
supabase functions deploy contact-form-handler
supabase functions deploy generate-signed-urls
supabase functions deploy scheduled-cleanup

# Set environment variables for Edge Functions
supabase secrets set CRON_SECRET=<generate-a-secure-random-string>
```

### 6. Configure Environment Variables

Update your `.env` file:

```bash
# Copy from .env.example
cp .env.example .env

# Edit .env with your values
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_ANON_KEY=<your-anon-key>
SUPABASE_SERVICE_ROLE_KEY=<your-service-role-key>
```

**Get your keys:**
- Go to Project Settings → API
- Copy `URL`, `anon/public key`, and `service_role key`

---

## 👤 Create First Admin User

### Method 1: Via Dashboard

1. Sign up a user via your app
2. Go to Supabase Dashboard → Authentication → Users
3. Find your user, copy the UUID
4. Go to SQL Editor and run:

```sql
UPDATE profiles 
SET role = 'admin', is_active = true
WHERE id = '<your-user-uuid>';
```

### Method 2: Programmatically

```javascript
// After user signs up
const { data: { user } } = await supabase.auth.signUp({
  email: 'admin@winningcode.com',
  password: 'secure-password'
})

// Then update their role (requires service_role key)
await supabaseAdmin
  .from('profiles')
  .update({ role: 'admin', is_active: true })
  .eq('id', user.id)
```

---

## 📦 Database Schema Overview

### Core Tables

| Table | Purpose | RLS |
|-------|---------|-----|
| `profiles` | User profiles (extends auth.users) | ✅ |
| `language_preferences` | Per-user language settings | ✅ |
| `projects` | Public showcase projects | ✅ Public read |
| `client_projects` | Private client work | ✅ Owner only |
| `project_files` | File attachments | ✅ Owner + admin |
| `project_updates` | Activity timeline | ✅ Owner + admin |

### Content Tables

| Table | Purpose | RLS |
|-------|---------|-----|
| `blog_posts` | Blog articles (JSONB multi-lang) | ✅ Public read |
| `blog_categories` | Blog categories | ✅ Public read |
| `blog_translations` | Alternative translation table | ✅ Public read |
| `services` | Service offerings | ✅ Public read |
| `service_translations` | Service translations | ✅ Public read |

### Communication Tables

| Table | Purpose | RLS |
|-------|---------|-----|
| `inquiries` | Contact form submissions | ✅ Admin only |
| `messages` | Client-team messaging | ✅ Sender/recipient |
| `notifications` | User notifications | ✅ Owner only |

### Admin Tables

| Table | Purpose | RLS |
|-------|---------|-----|
| `client_dashboard_data` | Dashboard metrics | ✅ Admin only |
| `audit_log` | Compliance audit trail | ✅ Admin only (read) |
| `system_settings` | App configuration | ✅ Public read select |
| `activity_log` | User activity tracking | ✅ Owner + admin |

---

## 🔐 Security Configuration

### Enable RLS

All tables have RLS enabled. Key policies:

- **Public access**: Published projects, blog posts, services (read-only)
- **User access**: Own profile, projects, messages, notifications
- **Admin access**: Full CRUD on all tables
- **Anonymous access**: Can only create inquiries

### Storage Security

- **Public buckets**: `project_uploads`, `blog_images`, `avatars`
  - Anyone can read
  - Only admins can write
  
- **Private buckets**: `client_documents`
  - Folder-based access: `/{user_id}/{project_id}/file.pdf`
  - Users can only access their own folders
  - Admins can access all

### API Keys

- **Anon Key**: Safe to expose in frontend (respects RLS)
- **Service Role Key**: ⚠️ NEVER expose to frontend! Server-side only.

---

## 🔄 Multi-Language Implementation

### JSONB Approach (Recommended)

All content tables use JSONB columns for translations:

```javascript
// Insert with multiple languages
await supabase.from('blog_posts').insert({
  title: {
    en: 'Hello World',
    fr: 'Bonjour le Monde',
    ht: 'Bonjou Mond',
    es: 'Hola Mundo'
  },
  content: {
    en: 'Content in English...',
    fr: 'Contenu en français...',
    ht: 'Kontni an Kreyòl...',
    es: 'Contenido en español...'
  }
})

// Query specific language
const { data } = await supabase
  .from('blog_posts')
  .select('title, content')
  
// Extract language in JavaScript
const title = data[0].title[currentLanguage] || data[0].title.en
```

### Translation Table Approach (Alternative)

```javascript
// Insert main post
const { data: post } = await supabase
  .from('blog_posts')
  .insert({ slug: 'hello-world', ... })
  .select()
  .single()

// Insert translations
await supabase.from('blog_translations').insert([
  { post_id: post.id, language: 'en', title: 'Hello World', content: '...' },
  { post_id: post.id, language: 'fr', title: 'Bonjour le Monde', content: '...' }
])
```

---

## 📊 Edge Functions Usage

### Contact Form Handler

**Endpoint**: `https://<project-ref>.supabase.co/functions/v1/contact-form-handler`

**Usage:**
```javascript
const response = await fetch(
  'https://your-project.supabase.co/functions/v1/contact-form-handler',
  {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: 'John Doe',
      email: 'john@example.com',
      project_idea: 'I need a website for my business',
      budget: '$5k-$10k',
      timeline: '1-3 months'
    })
  }
)

const result = await response.json()
// { success: true, inquiry_id: '...' }
```

### Generate Signed URLs

**Endpoint**: `https://<project-ref>.supabase.co/functions/v1/generate-signed-urls`

**Usage:**
```javascript
const { data: { session } } = await supabase.auth.getSession()

const response = await fetch(
  'https://your-project.supabase.co/functions/v1/generate-signed-urls',
  {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${session.access_token}`
    },
    body: JSON.stringify({
      bucket: 'client_documents',
      path: `${userId}/project-123/document.pdf`,
      expiresIn: 3600 // 1 hour
    })
  }
)

const { signedUrl } = await response.json()
// Use signedUrl to download the file
```

### Scheduled Cleanup

Configure as cron job:

1. Go to Edge Functions → scheduled-cleanup → Settings
2. Add cron schedule: `0 0 * * *` (daily at midnight)
3. Set Authorization header: `Bearer <CRON_SECRET>`

---

## 🧪 Testing

### Test RLS Policies

```sql
-- Test as anonymous user
SET request.jwt.claim.sub TO NULL;
SELECT * FROM blog_posts; -- Should only show published posts

-- Test as specific user
SET request.jwt.claim.sub TO '<user-uuid>';
SELECT * FROM client_projects; -- Should only show user's projects

-- Test as admin
-- First update user to admin role, then test queries
```

### Test Storage Access

```javascript
// Upload to own folder (should work)
await supabase.storage
  .from('client_documents')
  .upload(`${userId}/test.pdf`, file)

// Upload to another user's folder (should fail)
await supabase.storage
  .from('client_documents')
  .upload(`${otherUserId}/test.pdf`, file) // Error: Access denied
```

---

## 📈 Performance Optimization

### Indexes Created

All migrations include appropriate indexes:

- **Projects**: `published`, `featured`, `category`
- **Blog**: `published_at`, `slug`, `tags` (GIN)
- **Messages**: `recipient_id`, `is_read`
- **Inquiries**: `status`, `email`

### Query Optimization Tips

```javascript
// ✅ Good: Use indexes
await supabase
  .from('blog_posts')
  .select('*')
  .eq('published', true)
  .order('published_at', { ascending: false })
  .limit(10)

// ❌ Bad: No index on unstructured JSONB
await supabase
  .from('blog_posts')
  .filter('title->>en', 'like', '%search%') // Slow without index
```

---

## 🔄 Scheduled Tasks

Configure these cron jobs in your Edge Functions:

```bash
# Daily cleanup at midnight UTC
0 0 * * * - scheduled-cleanup

# Weekly metric refresh (Sunday 1 AM)
0 1 * * 0 - Execute: refresh_dashboard_metrics()

# Monthly audit log cleanup (1st of month)
0 2 1 * * - Execute: cleanup_old_audit_logs(90)
```

---

## 🆘 Troubleshooting

### Common Issues

**Issue**: Migrations fail with "relation already exists"
```bash
# Solution: Reset database (⚠️ destructive)
supabase db reset

# Or drop specific table
supabase db execute "DROP TABLE IF EXISTS table_name CASCADE;"
```

**Issue**: RLS blocks all access
```sql
-- Check current user
SELECT auth.uid();

-- Check policies
SELECT * FROM pg_policies WHERE tablename = 'your_table';

-- Temporarily disable RLS for testing (NOT in production!)
ALTER TABLE your_table DISABLE ROW LEVEL SECURITY;
```

**Issue**: Storage upload fails
```javascript
// Check bucket exists
const { data: buckets } = await supabase.storage.listBuckets()
console.log(buckets)

// Check file size
console.log(file.size) // Must be under bucket limit

// Check MIME type
console.log(file.type) // Must be in allowed types
```

---

## 📚 Next Steps

1. ✅ Complete database setup
2. ✅ Deploy Edge Functions
3. ✅ Configure storage buckets
4. ✅ Create admin user
5. 🔄 Update frontend to use `.env` variables
6. 🔄 Test all API endpoints
7. 🔄 Set up monitoring and alerts
8. 🔄 Configure custom domain (optional)
9. 🔄 Enable email templates
10. 🔄 Production deployment

---

## 📞 Support

- **Supabase Docs**: [supabase.com/docs](https://supabase.com/docs)
- **Discord**: [discord.supabase.com](https://discord.supabase.com)
- **GitHub Issues**: [github.com/supabase/supabase](https://github.com/supabase/supabase)

---

**Built with ❤️ by Winning Code Lab**
