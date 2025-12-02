# Database Migration Instructions

## Problem
The error "Could not find the 'project_name' column" means the database migrations have not been applied to your production Supabase database yet.

## Solution: Apply Migrations to Supabase

### Option 1: Using Supabase Dashboard (Recommended)

1. **Go to your Supabase Project Dashboard**
   - Visit: https://supabase.com/dashboard/project/nancqltlgxcsxrtuttmh

2. **Open the SQL Editor**
   - Click on "SQL Editor" in the left sidebar

3. **Run Each Migration File** (in order):
   - Copy the content from each migration file below and run them in the SQL Editor
   - **IMPORTANT**: Run them in this exact order:

#### Step 1: Run Initial Schema
```sql
-- Copy content from: supabase/migrations/20250120_001_initial_schema.sql
```

#### Step 2: Run Projects Schema  
```sql
-- Copy content from: supabase/migrations/20250120_002_projects_schema.sql
```

#### Step 3: Run Blog Schema
```sql
-- Copy content from: supabase/migrations/20250120_003_blog_schema.sql
```

#### Step 4: Run Services Schema
```sql
-- Copy content from: supabase/migrations/20250120_004_services_schema.sql
```

#### Step 5: Run Communications Schema
```sql
-- Copy content from: supabase/migrations/20250120_005_communications_schema.sql
```

#### Step 6: Run Admin Schema
```sql
-- Copy content from: supabase/migrations/20250120_006_admin_schema.sql
```

#### Step 7: Run RLS Policies
```sql
-- Copy content from: supabase/migrations/20250120_007_rls_policies.sql
```

#### Step 8: Run Storage Buckets
```sql
-- Copy content from: supabase/migrations/20250120_008_storage_buckets.sql
```

#### Step 9: Run Latest Fixes
```sql
-- Copy content from: supabase/migrations/20250120_009_fixes_and_triggers.sql
```

### Option 2: Using Supabase CLI (Advanced)

If you have Supabase CLI installed:

```bash
cd /Users/fortuneyodh-nicolas/Desktop/WC_P-25/WinningCode_Lab
supabase db push
```

## Verification

After running migrations, verify by running this query in the SQL Editor:

```sql
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'client_projects';
```

You should see `project_name` in the results.

## Next Steps

Once migrations are applied:
1. Refresh your Vercel deployment
2. Test project creation/update again
