# Guide Deplwaman: Contact Form → Supabase

## 📋 Preparasyon

Avan ou kòmanse, asire w gen:
- ✅ Kont Supabase (https://app.supabase.com)
- ✅ Supabase CLI installed (`npm install -g supabase` oswa `brew install supabase`)
- ✅ Pwojè Supabase deja kreye

---

## 🔐 Etap 1: Konfigire Environment Variables

### 1.1 Kopye .env.example → .env

```bash
cd /Users/fortuneyodh-nicolas/Desktop/WC_P-25/WinningCode_Lab
cp .env.example .env
```

### 1.2 Jwenn Supabase Keys

1. Ale nan Supabase Dashboard: https://app.supabase.com
2. Chwazi pwojè ou
3. Ale nan **Settings** → **API**
4. Kopye:
   - **Project URL** (`https://xxx.supabase.co`)
   - **anon/public key** (long JWT token)
   - **service_role key** (⚠️ NEVER expose this!)

### 1.3 Update .env

Edit `.env` ak editor ou (VS Code, nano, vim, etc.):

```bash
# Core Supabase
SUPABASE_URL=https://YOUR-PROJECT-ID.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...YOUR_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...YOUR_SERVICE_KEY

# Application URL
APP_URL=http://localhost:3000
```

### 1.4 Update Next.js .env

Kopye keys yo nan `/web-app` folder tou:

```bash
cd web-app
cp ../.env .env.local

# Edit .env.local pou ajoute "NEXT_PUBLIC_" prefix pou frontend
echo "NEXT_PUBLIC_SUPABASE_URL=$SUPABASE_URL" >> .env.local
echo "NEXT_PUBLIC_SUPABASE_ANON_KEY=$SUPABASE_ANON_KEY" >> .env.local
```

---

## 🗄️ Etap 2: Link Project ak Apply Migrations

### 2.1 Link nan Supabase Project

```bash
cd /Users/fortuneyodh-nicolas/Desktop/WC_P-25/WinningCode_Lab

# Link avec project ou
supabase link --project-ref YOUR-PROJECT-REF
```

**Kote pou jwenn project-ref:**
- URL Dashboard ou: `https://app.supabase.com/project/YOUR-PROJECT-REF`
- Oswa Settings → General → Reference ID

### 2.2 Apply ALL Migrations

```bash
# Apply all migrations in order
supabase db push

# ⚠️ Si sa pa mache, apply yo manually youn pa youn:
supabase db push supabase/migrations/20250120_001_initial_schema.sql
supabase db push supabase/migrations/20250120_002_projects_schema.sql
supabase db push supabase/migrations/20250120_003_blog_schema.sql
supabase db push supabase/migrations/20250120_004_services_schema.sql
supabase db push supabase/migrations/20250120_005_communications_schema.sql
supabase db push supabase/migrations/20250120_006_admin_schema.sql
supabase db push supabase/migrations/20250120_007_rls_policies.sql
supabase db push supabase/migrations/20250120_008_storage_buckets.sql

# 🆕 NEW: Migration pou inquiry attachments
supabase db push supabase/migrations/20250124_001_storage_inquiries.sql

# Ideas schema (optional - if needed)
supabase db push supabase/migrations/20251124_001_ideas_schema.sql
```

### 2.3 Verify Migrations

Ale nan Supabase Dashboard → **Database** → **Tables**

Verifye tables sa yo egziste:
- ✅ `profiles`
- ✅ `inquiries`
- ✅ `messages`
- ✅ `notifications` 
- ✅ `client_projects`
- ✅ `blog_posts`
- ✅ (etc.)

---

## 📦 Etap 3: Create Storage Bucket

### 3.1 Via Supabase CLI (Rekòmande)

```bash
# Create "inquiries-attachments" bucket
supabase storage create inquiries-attachments --public

# Verify bucket was created
supabase storage list
```

### 3.2 Via Dashboard (Alternative)

1. Ale nan **Storage** section
2. Click **New bucket**
3. Bucket name: `inquiries-attachments`
4. Public: ✅ **Yes** (pou admin yo ka wè attachments)
5. File size limit: `10MB` (10485760 bytes)
6. Allowed MIME types:
   ```
   image/jpeg
   image/png
   image/webp
   image/gif
   application/pdf
   application/msword
   application/vnd.openxmlformats-officedocument.wordprocessingml.document
   application/vnd.ms-excel
   application/vnd.openxmlformats-officedocument.spreadsheetml.sheet
   text/plain
   application/zip
   ```

### 3.3 Configure Bucket Settings

Via SQL Editor:

```sql
-- Set file size limit (10MB)
UPDATE storage.buckets 
SET file_size_limit = 10485760
WHERE id = 'inquiries-attachments';

-- Set allowed MIME types
UPDATE storage.buckets 
SET allowed_mime_types = ARRAY[
    'image/jpeg',
    'image/png',
    'image/webp',
    'image/gif',
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'text/plain',
    'application/zip'
]
WHERE id = 'inquiries-attachments';
```

---

## ⚡ Etap 4: Deploy Edge Function

### 4.1 Deploy Contact Form Handler

```bash
# Deploy function
supabase functions deploy contact-form-handler

# Verify deployment
supabase functions list
```

### 4.2 Test Edge Function

```bash
# Get function URL
echo "https://YOUR-PROJECT-ID.supabase.co/functions/v1/contact-form-handler"

# Test with curl
curl -X POST \
  https://YOUR-PROJECT-ID.supabase.co/functions/v1/contact-form-handler \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "project_idea": "This is a test inquiry to verify the Edge Function works correctly",
    "budget": "$5k-$10k",
    "preferred_language": "en"
  }'
```

**Expected response:**
```json
{
  "success": true,
  "message": "Inquiry submitted successfully",
  "inquiry_id": "uuid-here"
}
```

---

## 👤 Etap 5: Create Admin User

### 5.1 Register First User

1. Ale nan `/login` page sou app ou
2. Register ak email/password
3. Check email pou verification link

### 5.2 Make User Admin

Ale nan Supabase Dashboard → **SQL Editor**, run:

```sql
-- Get user ID (replace email)
SELECT id, email FROM auth.users WHERE email = 'your-email@example.com';

-- Promote to admin (use ID from above)
UPDATE profiles 
SET role = 'admin', is_active = true
WHERE id = 'USER-UUID-HERE';

-- Verify
SELECT * FROM profiles WHERE role = 'admin';
```

---

## ✅ Etap 6: Test Contact Form

### 6.1 Test via Web App

1. Navigate to: `http://localhost:3000/en/ask`
2. Fill out form:
   - Name: Test User
   - Email: test@example.com
   - Phone: +1 234 567 8900
   - Project Idea: Testing contact form submission
   - Budget: $5k-$10k
   - Upload a PDF file (test.pdf)
3. Click **Submit Your Idea**
4. Verify success message appears

### 6.2 Verify in Supabase

**Check Database:**
1. Go to **Database** → **Table Editor**
2. Select `inquiries` table
3. Verify new row exists with:
   - ✅ Correct name, email, project_idea
   - ✅ `file_url` field populated
   - ✅ `file_name` field shows filename
   - ✅ `status` = 'new'

**Check Storage:**
1. Go to **Storage** → `inquiries-attachments`
2. Navigate to `inquiries/` folder
3. Verify file uploaded with naming pattern:
   ```
   test_example_com_1732543210_test.pdf
   ```

**Check Notifications:**
1. Go to **Database** → `notifications` table
2. Verify admin notification created:
   - `notification_type` = 'new_inquiry'
   - `title` = 'New Inquiry Received'
   - `message` contains user name & email

---

## 🔧 Troubleshooting

### Pwoblèm 1: "Cannot connect to Supabase"

**Solisyon:**
```bash
# Verify project is linked
supabase link --project-ref YOUR-PROJECT-REF

# Check .env variables
cat .env | grep SUPABASE
```

### Pwoblèm 2: "Bucket not found"

**Solisyon:**
```bash
# List all buckets
supabase storage list

# Create if missing
supabase storage create inquiries-attachments --public
```

### Pwoblèm 3: "File upload fails"

**Verifye:**
- ✅ File size < 10MB
- ✅ MIME type is allowed
- ✅ Bucket is public
- ✅ RLS policies applied correctly

**Debug:**
```sql
-- Check storage policies
SELECT * FROM storage.policies WHERE bucket_id = 'inquiries-attachments';

-- Check bucket config
SELECT * FROM storage.buckets WHERE id = 'inquiries-attachments';
```

### Pwoblèm 4: "Edge Function timeout"

**Solisyon:**
```bash
# View function logs
supabase functions logs contact-form-handler

# Redeploy if needed
supabase functions deploy contact-form-handler --no-verify-jwt
```

---

## 🎉 Success Checklist

Apre deplwaman, verifye:

- [ ] `.env` configured ak correct Supabase keys
- [ ] All 10 migrations applied successfully
- [ ] `inquiries-attachments` bucket created
- [ ] Bucket configured with 10MB limit & MIME types
- [ ] Edge Function deployed & responding
- [ ] Admin user created & verified
- [ ] Test inquiry submitted successfully
- [ ] File uploaded to storage properly
- [ ] Admin notification created
- [ ] Web app `/ask` page works in all 4 languages

---

## 📝 Next Steps

Apre deplwaman siksèsful:

1. ✅ Test nan tout 4 lang yo (en, fr, ht, es)
2. ✅ Configure email notifications (optional)
3. ✅ Setup monitoring/alerts
4. ✅ Move to Phase 2: Dashboard development

---

## 🆘 Bezwen Èd?

Si ou rankontre pwoblèm:

1. Check Supabase Dashboard → Logs
2. Check browser console pou erè
3. Run `supabase status` pou verify connection
4. View Edge Function logs: `supabase functions logs contact-form-handler`
