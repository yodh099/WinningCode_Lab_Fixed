# Quick Deployment Guide
## Winning Code Lab - Supabase Backend

Run these commands in order to deploy your complete backend.

---

## ✅ Prerequisites

```bash
# Install Supabase CLI
npm install -g supabase
# or
brew install supabase/tap/supabase

# Verify installation
supabase --version
```

---

## 🚀 Step 1: Link to Supabase Project

```bash
cd /Users/fortuneyodh-nicolas/Desktop/WC_P-25/WinningCode_Lab

# Link to your Supabase project
supabase link --project-ref <your-project-ref>

# Enter your database password when prompted
```

**Get project-ref:** Go to Supabase Dashboard → Settings → General → Reference ID

---

## 📦 Step 2: Apply All Migrations

```bash
# Apply all migrations in order
supabase db push

# Or apply individually if needed
supabase db push supabase/migrations/20250120_001_initial_schema.sql
supabase db push supabase/migrations/20250120_002_projects_schema.sql
supabase db push supabase/migrations/20250120_003_blog_schema.sql
supabase db push supabase/migrations/20250120_004_services_schema.sql
supabase db push supabase/migrations/20250120_005_communications_schema.sql
supabase db push supabase/migrations/20250120_006_admin_schema.sql
supabase db push supabase/migrations/20250120_007_rls_policies.sql
supabase db push supabase/migrations/20250120_008_storage_buckets.sql
```

---

## 🗄️ Step 3: Create Storage Buckets

```bash
# Create all 4 buckets
supabase storage create project_uploads --public
supabase storage create blog_images --public
supabase storage create client_documents
supabase storage create avatars --public
```

**Or via Dashboard:** Go to Storage → New Bucket

---

## ⚡ Step 4: Deploy Edge Functions

```bash
# Deploy all Edge Functions
supabase functions deploy contact-form-handler
supabase functions deploy generate-signed-urls
supabase functions deploy scheduled-cleanup

# Set environment secrets
supabase secrets set CRON_SECRET=$(openssl rand -base64 32)
```

---

## 🔑 Step 5: Get API Keys

```bash
# Get your Supabase URL and keys
supabase status

# Or get from dashboard:
# Settings → API → URL, anon key, service_role key
```

---

## 🌍 Step 6: Configure Environment

```bash
# Copy .env template
cp .env.example .env

# Edit .env with your values
nano .env
# or
code .env
```

**Required values:**
```bash
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOi...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOi...
```

---

## 👤 Step 7: Create Admin User

```bash
# 1. Sign up via your app
# 2. Get user ID from Supabase Dashboard → Authentication → Users
# 3. Run this SQL in SQL Editor:

# UPDATE profiles 
# SET role = 'admin', is_active = true
# WHERE id = '<your-user-uuid>';
```

---

## 🧪 Step 8: Test Everything

```bash
# Test database connection
supabase db remote --help

# Test functions
curl -X POST https://your-project.supabase.co/functions/v1/contact-form-handler \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","email":"test@example.com","project_idea":"Test inquiry"}'
```

---

## 📊 Step 9: Verify RLS Policies

```sql
-- Run in SQL Editor

-- Test anonymous access (should see published posts only)
SET request.jwt.claim.sub TO NULL;
SELECT COUNT(*) FROM blog_posts WHERE published = true;

-- Test user access (replace with your user ID)
SET request.jwt.claim.sub TO '<user-uuid>';
SELECT * FROM profiles WHERE id = '<user-uuid>';
```

---

## 🔄 Step 10: Setup Cron Jobs

**Via Dashboard:**
1. Go to Edge Functions → scheduled-cleanup
2. Add cron schedule: `0 0 * * *` (daily at midnight UTC)
3. Add header: `Authorization: Bearer <CRON_SECRET>`

**Or via CLI:**
```bash
supabase functions schedule create scheduled-cleanup \
  --schedule "0 0 * * *" \
  --headers "Authorization=Bearer <CRON_SECRET>"
```

---

## ✅ Verification Checklist

- [ ] Migrations applied successfully
- [ ] All 19 tables created
- [ ] Storage buckets exist
- [ ] Edge Functions deployed
- [ ] Environment variables set
- [ ] Admin user created
- [ ] RLS policies working
- [ ] Can sign up/sign in
- [ ] Can create inquiry
- [ ] Files upload to correct buckets

---

## 🐛 Troubleshooting

### Migration fails
```bash
# Reset database (⚠️ destructive!)
supabase db reset

# Or rollback specific migration
supabase db rollback
```

### Can't access data
```sql
-- Check RLS is enabled
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public';

-- View policies
SELECT * FROM pg_policies WHERE tablename = 'your_table';
```

### Edge Function deployment fails
```bash
# Check for syntax errors
deno check supabase/functions/*/index.ts

# View function logs
supabase functions logs contact-form-handler
```

---

## 📚 Next Steps

1. ✅ Backend deployed
2. Update frontend to use new .env variables
3. Test all API endpoints
4. Deploy frontend
5. Configure custom domain
6. Enable monitoring/alerts
7. Setup backups

---

## 🆘 Support

- **Setup Guide:** [SUPABASE_SETUP.md](./SUPABASE_SETUP.md)
- **API Reference:** [API_INTEGRATION.md](./API_INTEGRATION.md)
- **Supabase Docs:** https://supabase.com/docs
- **Discord:** https://discord.supabase.com

---

**Happy Deploying! 🚀**
