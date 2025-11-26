# 🚀 GUIDE KONFIGIRASYON SUPABASE - WINNING CODE LAB
# SUPABASE SETUP GUIDE - WINNING CODE LAB

## 📋 KONTNI / TABLE of Contents
1. [Kreyasyon Kont Supabase / Create Supabase Account](#1-kreyasyon-kont)
2. [Konfigire Database / Configure Database](#2-konfigire-database)
3. [Kreye Storage Buckets / Create Storage Buckets](#3-storage-buckets)
4. [Konfigire Aplikasyon / Configure Application](#4-konfigire-aplikasyon)
5. [Test Koneksyon / Test Connection](#5-test-koneksyon)

---

## 1. KREYASYON KONT / Create Account

### Kreyòl:
1. Ale sou **https://supabase.com**
2. Klike sou **"Start your project"**
3. Kreye yon kont ak Google oswa GitHub
4. Verifye email ou
5. Klike sou **"New Project"**
6. Chwazi yon non pou pwojè a: `winning-code-lab`
7. Kreye yon password solid pou database la
8. Chwazi yon region ki pre w (ex: us-east-1)
9. Klike **"Create new project"**
10. Tann 2-3 minit pou pwojè a fini konfigire

### English:
1. Go to **https://supabase.com**
2. Click **"Start your project"**
3. Create an account with Google or GitHub
4. Verify your email
5. Click **"New Project"**
6. Choose a project name: `winning-code-lab`
7. Create a strong database password
8. Select a region close to you (ex: us-east-1)
9. Click **"Create new project"**
10. Wait 2-3 minutes for setup to complete

---

## 2. KONFIGIRE DATABASE / Configure Database

### Kreyòl:

#### Etap 1: Jwenn API Keys
1. Nan dashboard Supabase, ale nan **Settings** → **API**
2. Kopye **Project URL** (ex: https://xxxxx.supabase.co)
3. Kopye **anon public key**
4. ATANSYON: PA JANM pataje **service_role key** an piblik!

#### Etap 2: Konfigire .env
1. Louvri fichye `.env` nan pwojè a
2. Ranpli enfòmasyon yo:

```bash
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOi...
```

#### Etap 3: Egzekite Schema SQL
1. Nan Supabase dashboard, ale nan **SQL Editor**
2. Klike **"New query"**
3. Louvri fichye `supabase/schema.sql` nan pwojè a
4. Kopye tout kontni a
5. Kole nan SQL Editor Supabase
6. Klike **"Run"** ↙️
7. Verifye pa gen erè

### English:

#### Step 1: Get API Keys
1. In Supabase dashboard, go to **Settings** → **API**
2. Copy **Project URL** (ex: https://xxxxx.supabase.co)
3. Copy **anon public key**
4. WARNING: NEVER share the **service_role key** publicly!

#### Step 2: Configure .env
1. Open `.env` file in the project
2. Fill in the information:

```bash
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOi...
```

#### Step 3: Execute SQL Schema
1. In Supabase dashboard, go to **SQL Editor**
2. Click **"New query"**
3. Open `supabase/schema.sql` file in your project
4. Copy all content
5. Paste into Supabase SQL Editor
6. Click **"Run"** ↙️
7. Verify no errors occurred

---

## 3. STORAGE BUCKETS

### Kreyòl:

1. Nan Supabase dashboard, ale nan **Storage**
2. Klike **"Create a new bucket"**
3. Kreye 4 buckets sa yo:

#### Bucket 1: project-images (Public)
- **Bucket name**: `project-images`
- **Public bucket**: ✅ Checked
- **File size limit**: 5 MB
- **Allowed MIME types**: `image/jpeg, image/png, image/webp, image/gif`

#### Bucket 2: blog-images (Public)
- **Bucket name**: `blog-images`
- **Public bucket**: ✅ Checked
- **File size limit**: 5 MB
- **Allowed MIME types**: `image/jpeg, image/png, image/webp`

#### Bucket 3: client-files (Private)
- **Bucket name**: `client-files`
- **Public bucket**: ❌ Unchecked
- **File size limit**: 25 MB
- **Allowed MIME types**: Leave empty (all types)

#### Bucket 4: inquiry-attachments (Private)
- **Bucket name**: `inquiry-attachments`
- **Public bucket**: ❌ Unchecked
- **File size limit**: 10 MB
- **Allowed MIME types**: Leave empty (all types)

### English:

1. In Supabase dashboard, go to **Storage**
2. Click **"Create a new bucket"**
3. Create these 4 buckets:

*(Same configuration as above in Kreyòl)*

---

## 4. KONFIGIRE APLIKASYON / Configure Application

### Kreyòl:

#### Etap 1: Enpòte Supabase JS Library
Ajoute sa nan `<head>` section nan tout paj HTML:

```html
<!-- Supabase JS Client -->
<script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>

<!-- Winning Code Backend Scripts -->
<script src="js/constants.js"></script>
<script src="js/supabase-config.js"></script>
<script src="js/auth.js"></script>
<script src="js/api.js"></script>
```

#### Etap 2: Konfigire Keys
Louvri `js/supabase-config.js` epi ajoute keys ou yo:

```javascript
const SUPABASE_CONFIG = {
    url: 'https://xxxxx.supabase.co',
    anonKey: 'eyJhbGciOi...'
};
```

#### Etap 3: Inisyalize nan paj ou yo
Ajoute sa nan script ou yo:

```javascript
document.addEventListener('DOMContentLoaded', async () => {
    // Initialize Supabase
    initSupabase();
    
    // Check authentication
    const isAuth = await WCAuth.initialize();
    
    if (isAuth) {
        console.log('User logged in:', WCAuth.currentUser);
    }
});
```

### English:

#### Step 1: Import Supabase JS Library
Add this to the `<head>` section in all HTML pages:

```html
<!-- Supabase JS Client -->
<script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>

<!-- Winning Code Backend Scripts -->
<script src="js/constants.js"></script>
<script src="js/supabase-config.js"></script>
<script src="js/auth.js"></script>
<script src="js/api.js"></script>
```

#### Step 2: Configure Keys
Open `js/supabase-config.js` and add your keys:

```javascript
const SUPABASE_CONFIG = {
    url: 'https://xxxxx.supabase.co',
    anonKey: 'eyJhbGciOi...'
};
```

#### Step 3: Initialize in your pages
Add this to your scripts:

```javascript
document.addEventListener('DOMContentLoaded', async () => {
    // Initialize Supabase
    initSupabase();
    
    // Check authentication
    const isAuth = await WCAuth.initialize();
    
    if (isAuth) {
        console.log('User logged in:', WCAuth.currentUser);
    }
});
```

---

## 5. TEST KONEKSYON / Test Connection

### Kreyòl:

#### Test 1: Verifye Koneksyon
Louvri browser console (F12) epi tape:

```javascript
// Test connection
const client = getSupabaseClient();
console.log('Supabase client:', client);

// Test database query
const { data, error } = await WCAPI.projects.getAll();
console.log('Projects:', data);
```

#### Test 2: Test Authentication
```javascript
// Sign up test user
const result = await WCAuth.signUp(
    'test@example.com',
    'password123',
    { full_name: 'Test User', language: 'en' }
);

console.log('Sign up result:', result);

// Sign in
const loginResult = await WCAuth.signIn('test@example.com', 'password123');
console.log('Login result:', loginResult);
```

#### Test 3: Test API Functions
```javascript
// Create test inquiry
const inquiry = await WCAPI.inquiries.create({
    name: 'Test User',
    email: 'test@example.com',
    project_idea: 'This is a test inquiry',
    budget: '$5000'
});

console.log('Inquiry created:', inquiry);
```

### English:

*(Same tests as above in Kreyòl)*

---

## 🔐 SEKIRITE / Security Checklist

### ✅ Kreyòl:
- [ ] Fichye `.env` nan `.gitignore`
- [ ] Pa janm expose `service_role_key`
- [ ] RLS policies aktivé sou tout tables
- [ ] Test RLS policies ak diferan itilizatè
- [ ] CORS konfigire kòrèkteman
- [ ] Rate limiting aktivé sou fòmilè

### ✅ English:
- [ ] `.env` file in `.gitignore`
- [ ] Never expose `service_role_key`
- [ ] RLS policies enabled on all tables
- [ ] Test RLS policies with different users
- [ ] CORS configured correctly
- [ ] Rate limiting enabled on forms

---

## 📚 RESOUS ITIL / Useful Resources

- **Supabase Documentation**: https://supabase.com/docs
- **Supabase JavaScript Client**: https://supabase.com/docs/reference/javascript
- **Row Level Security Guide**: https://supabase.com/docs/guides/auth/row-level-security
- **Storage Guide**: https://supabase.com/docs/guides/storage

---

## 🆘 DEPANNAJ / Troubleshooting

### Pwoblèm: "Supabase not initialized"
**Solisyon**: Verifye ke ou gen `SUPABASE_URL` ak `SUPABASE_ANON_KEY` nan fichye konfigirasyon ou

### Pwoblèm: "Row level security policy violation"
**Solisyon**: Verifye RLS policies nan schema.sql epi asire w ke yo egzekite kòrèkteman

### Pwoblèm: "Storage bucket not found"
**Solisyon**: Verifye ke ou te kreye 4 storage buckets nan Supabase Dashboard

### Pwoblèm: Authentication errors
**Solisyon**: Verifye ke Email Auth aktivé nan Supabase Authentication settings

---

## ✅ CHECKLIST FINAL / Final Checklist

### Kreyòl:
- [ ] Kont Supabase kreye
- [ ] Pwojè kreye ak konfigire
- [ ] Schema SQL egzekite
- [ ] 4 storage buckets kreye
- [ ] API keys kopye nan .env
- [ ] Scripts ajoute nan HTML pages
- [ ] Test koneksyon reyisi
- [ ] Authentication teste
- [ ] API functions teste

### English:
- [ ] Supabase account created
- [ ] Project created and configured
- [ ] SQL schema executed
- [ ] 4 storage buckets created
- [ ] API keys copied to .env
- [ ] Scripts added to HTML pages
- [ ] Connection test successful
- [ ] Authentication tested
- [ ] API functions tested

---

## 🎉 FELISITASYON / CONGRATULATIONS!

### Kreyòl:
Backend ou konfigire kounye a! Ou ka kòmanse devlope aplikasyon an ak tout fonksyonalite Supabase yo.

### English:
Your backend is now configured! You can start developing the application with all Supabase features.

---

**Last updated**: 2025
**Version**: 1.0.0
