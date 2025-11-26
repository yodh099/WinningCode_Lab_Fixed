# Supabase API Integration Guide
## Winning Code Lab - Frontend Integration Reference

---

## 🔌 API Client Setup

### Initialize Supabase Client

```javascript
// js/supabase-config.js
import { createClient } from '@supabase/supabase-js'

// Read from environment variables (NOT hard-coded!)
const supabaseUrl = process.env.SUPABASE_URL || import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
```

**Important**: Never hard-code credentials. Always use environment variables!

---

## 🔐 Authentication

### Sign Up

```javascript
const { data, error } = await supabase.auth.signUp({
  email: 'user@example.com',
  password: 'secure-password',
  options: {
    data: {
      full_name: 'John Doe',
      language: 'en',
      company_name: 'Acme Inc'
    }
  }
})

// Profile is automatically created via trigger
```

### Sign In

```javascript
const { data, error } = await supabase.auth.signInWithPassword({
  email: 'user@example.com',
  password: 'password'
})

// Get session
const { data: { session } } = await supabase.auth.getSession()
```

### Sign Out

```javascript
const { error } = await supabase.auth.signOut()
```

### Get Current User

```javascript
const { data: { user } } = await supabase.auth.getUser()

// Get full profile
const { data: profile } = await supabase
  .from('profiles')
  .select('*')
  .eq('id', user.id)
  .single()
```

---

## 📝 Projects API

### Get Published Projects

```javascript
const { data: projects, error } = await supabase
  .from('projects')
  .select('*')
  .eq('published', true)
  .order('display_order', { ascending: true })
  .limit(10)

// Extract language-specific content
const title = projects[0].title[currentLanguage] || projects[0].title.en
```

### Get Single Project

```javascript
const { data: project, error } = await supabase
  .from('projects')
  .select('*')
  .eq('id', projectId)
  .eq('published', true)
  .single()
```

### Create Project (Admin Only)

```javascript
const { data, error } = await supabase
  .from('projects')
  .insert({
    title: {
      en: 'My Project',
      fr: 'Mon Projet',
      ht: 'Pwojè Mwen',
      es: 'Mi Proyecto'
    },
    description: {
      en: 'Description...',
      fr: 'Description...',
      ht: 'Deskripsyon...',
      es: 'Descripción...'
    },
    technologies: ['React', 'Node.js', 'PostgreSQL'],
    published: true,
    featured: false
  })
```

---

## 📰 Blog API

### Get Published Posts

```javascript
const { data: posts, error } = await supabase
  .from('blog_posts')
  .select(`
    *,
    author:profiles(full_name, avatar_url),
    category:blog_categories(name, slug)
  `)
  .eq('published', true)
  .order('published_at', { ascending: false })
  .limit(10)
```

### Get Post by Slug

```javascript
const { data: post, error } = await supabase
  .from('blog_posts')
  .select(`
    *,
    author:profiles(full_name, avatar_url, bio),
    category:blog_categories(name, slug, color)
  `)
  .eq('slug', 'my-blog-post')
  .eq('published', true)
  .single()

// Increment view count
await supabase.rpc('increment_blog_view_count', { 
  post_id_param: post.id 
})
```

### Search Blog Posts

```javascript
const { data: results, error } = await supabase
  .from('blog_posts')
  .select('*')
  .eq('published', true)
  .textSearch('title->en', 'search term', {
    type: 'websearch',
    config: 'english'
  })
```

### Get Posts by Category

```javascript
const { data: posts, error } = await supabase
  .from('blog_posts')
  .select(`
    *,
    category:blog_categories(name, slug)
  `)
  .eq('published', true)
  .eq('category_id', categoryId)
  .order('published_at', { ascending: false })
```

### Get Posts by Tag

```javascript
const { data: posts, error } = await supabase
  .from('blog_posts')
  .select('*')
  .eq('published', true)
  .contains('tags', ['JavaScript'])
```

---

## 🛠️ Services API

### Get Active Services

```javascript
const { data: services, error } = await supabase
  .from('services')
  .select('*')
  .eq('is_active', true)
  .order('display_order', { ascending: true })

// Or use helper function for specific language
const { data, error } = await supabase
  .rpc('get_services_by_language', { lang: 'en' })
```

### Get Service by Slug

```javascript
const { data: service, error } = await supabase
  .from('services')
  .select('*')
  .eq('slug', 'web-development')
  .eq('is_active', true)
  .single()
```

---

## 📧 Inquiries / Contact Form

### Submit Inquiry (Public)

```javascript
// Option 1: Direct insert (rate-limited by RLS)
const { data, error } = await supabase
  .from('inquiries')
  .insert({
    name: 'John Doe',
    email: 'john@example.com',
    phone: '+1234567890',
    project_idea: 'I need a website for my business',
    project_type: 'web',
    budget: '$5k-$10k',
    timeline: '1-3 months',
    preferred_language: 'en',
    message: 'Additional details...'
  })

// Option 2: Use Edge Function (recommended - includes validation & notifications)
const response = await fetch(`${supabaseUrl}/functions/v1/contact-form-handler`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    name: 'John Doe',
    email: 'john@example.com',
    project_idea: 'I need a website...',
    budget: '$5k-$10k'
  })
})

const result = await response.json()
```

### Get All Inquiries (Admin Only)

```javascript
const { data: inquiries, error } = await supabase
  .from('inquiries')
  .select('*')
  .order('created_at', { ascending: false })
```

### Update Inquiry Status (Admin)

```javascript
const { data, error } = await supabase
  .from('inquiries')
  .update({ 
    status: 'responded',
    notes: 'Contacted via email'
  })
  .eq('id', inquiryId)
```

---

## 👤 Client Projects

### Get My Projects

```javascript
const { data: { user } } = await supabase.auth.getUser()

const { data: projects, error } = await supabase
  .from('client_projects')
  .select(`
    *,
    assigned_to:profiles!client_projects_assigned_to_fkey(full_name, avatar_url)
  `)
  .eq('client_id', user.id)
  .order('created_at', { ascending: false })
```

### Get Project with Updates

```javascript
const { data: project, error } = await supabase
  .from('client_projects')
  .select(`
    *,
    updates:project_updates(
      *,
      user:profiles(full_name, avatar_url)
    ),
    files:project_files(*)
  `)
  .eq('id', projectId)
  .single()

// Sort updates by date
project.updates.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
```

---

## 💬 Messages

### Get My Messages

```javascript
const { data: { user } } = await supabase.auth.getUser()

const { data: messages, error } = await supabase
  .from('messages')
  .select(`
    *,
    sender:profiles!messages_sender_id_fkey(full_name, avatar_url),
    recipient:profiles!messages_recipient_id_fkey(full_name, avatar_url),
    project:client_projects(project_name)
  `)
  .or(`sender_id.eq.${user.id},recipient_id.eq.${user.id}`)
  .order('created_at', { ascending: false })
```

### Send Message

```javascript
const { data, error } = await supabase
  .from('messages')
  .insert({
    sender_id: currentUserId,
    recipient_id: recipientId,
    project_id: projectId,
    subject: 'Project Update',
    content: 'Message content...',
    message_type: 'update'
  })
```

### Mark Message as Read

```javascript
// Using helper function (safer)
const { error } = await supabase
  .rpc('mark_message_read', { message_id_param: messageId })

// Or direct update (if you're the recipient)
const { error } = await supabase
  .from('messages')
  .update({ is_read: true, read_at: new Date().toISOString() })
  .eq('id', messageId)
  .eq('recipient_id', currentUserId)
```

### Get Unread Count

```javascript
const { data: count, error } = await supabase
  .rpc('get_unread_message_count')

// Or manual count
const { count, error } = await supabase
  .from('messages')
  .select('*', { count: 'exact', head: true })
  .eq('recipient_id', currentUserId)
  .eq('is_read', false)
```

---

## 🔔 Notifications

### Get My Notifications

```javascript
const { data: notifications, error } = await supabase
  .from('notifications')
  .select('*')
  .eq('user_id', currentUserId)
  .eq('is_dismissed', false)
  .order('created_at', { ascending: false })
```

### Mark as Read

```javascript
const { error } = await supabase
  .from('notifications')
  .update({ 
    is_read: true, 
    read_at: new Date().toISOString() 
  })
  .eq('id', notificationId)
  .eq('user_id', currentUserId)
```

### Create Notification (Admin/System)

```javascript
const { data, error } = await supabase
  .rpc('create_notification', {
    p_user_id: userId,
    p_type: 'project_update',
    p_title: 'Project Update',
    p_message: 'Your project status has been updated',
    p_action_url: '/client-space/projects/123',
    p_severity: 'info'
  })
```

---

## 📁 File Storage

### Upload File

```javascript
const file = fileInput.files[0]
const userId = (await supabase.auth.getUser()).data.user.id

// Upload to user's folder in client_documents bucket
const { data, error } = await supabase.storage
  .from('client_documents')
  .upload(`${userId}/project-${projectId}/${file.name}`, file, {
    cacheControl: '3600',
    upsert: false
  })

// Create file record in database
if (!error) {
  await supabase
    .from('project_files')
    .insert({
      project_id: projectId,
      uploader_id: userId,
      file_name: file.name,
      file_url: data.path,
      file_path: data.path,
      file_size: file.size,
      file_type: file.type
    })
}
```

### Download File (Public)

```javascript
// For public buckets
const { data } = supabase.storage
  .from('blog_images')
  .getPublicUrl('path/to/file.jpg')

console.log(data.publicUrl)
```

### Download File (Private - Signed URL)

```javascript
// Option 1: Generate signed URL directly (if user has access)
const { data, error } = await supabase.storage
  .from('client_documents')
  .createSignedUrl(`${userId}/project-123/document.pdf`, 3600) // 1 hour

// Option 2: Use Edge Function (recommended - includes access control)
const { data: { session } } = await supabase.auth.getSession()

const response = await fetch(`${supabaseUrl}/functions/v1/generate-signed-urls`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${session.access_token}`
  },
  body: JSON.stringify({
    bucket: 'client_documents',
    path: `${userId}/project-123/document.pdf`,
    expiresIn: 3600
  })
})

const { signedUrl } = await response.json()
```

### List Files

```javascript
const { data: files, error } = await supabase.storage
  .from('client_documents')
  .list(`${userId}/project-${projectId}`)
```

### Delete File

```javascript
const { error } = await supabase.storage
  .from('client_documents')
  .remove([`${userId}/project-${projectId}/file.pdf`])

// Also delete database record
await supabase
  .from('project_files')
  .delete()
  .eq('file_path', `${userId}/project-${projectId}/file.pdf`)
```

---

## 📊 Dashboard (Admin)

### Get Dashboard Metrics

```javascript
const { data: metrics, error } = await supabase
  .from('client_dashboard_data')
  .select('*')
  .eq('time_period', 'all_time')
  .order('metric_name')
```

### Refresh Metrics

```javascript
const { error } = await supabase
  .rpc('refresh_dashboard_metrics')
```

---

## 🔍 Real-time Subscriptions

### Subscribe to New Messages

```javascript
const channel = supabase
  .channel('messages_channel')
  .on(
    'postgres_changes',
    {
      event: 'INSERT',
      schema: 'public',
      table: 'messages',
      filter: `recipient_id=eq.${currentUserId}`
    },
    (payload) => {
      console.log('New message:', payload.new)
      // Update UI with new message
    }
  )
  .subscribe()

// Unsubscribe when component unmounts
channel.unsubscribe()
```

### Subscribe to Project Updates

```javascript
const channel = supabase
  .channel(`project_${projectId}`)
  .on(
    'postgres_changes',
    {
      event: '*',
      schema: 'public',
      table: 'project_updates',
      filter: `project_id=eq.${projectId}`
    },
    (payload) => {
      console.log('Project update:', payload)
    }
  )
  .subscribe()
```

---

## 🔐 Admin Operations

### Check if User is Admin

```javascript
const { data: { user } } = await supabase.auth.getUser()

const { data: profile } = await supabase
  .from('profiles')
  .select('role')
  .eq('id', user.id)
  .single()

const isAdmin = profile.role === 'admin'
const isStaff = profile.role === 'staff' || profile.role === 'admin'
```

### Promote User to Admin (Service Role Required)

```javascript
// This requires service_role key - do NOT do this from frontend!
// Only use in backend/Edge Function

const { error } = await adminClient
  .from('profiles')
  .update({ role: 'admin' })
  .eq('id', userId)
```

---

## 🎨 Multi-Language Queries

### Query with Language Fallback

```javascript
function getLocalizedValue(jsonbField, language) {
  return jsonbField[language] || jsonbField['en'] || Object.values(jsonbField)[0]
}

// Usage
const { data: services } = await supabase
  .from('services')
  .select('*')
  .eq('is_active', true)

const localizedServices = services.map(service => ({
  ...service,
  name: getLocalizedValue(service.name, currentLanguage),
  description: getLocalizedValue(service.description, currentLanguage)
}))
```

---

## ⚠️ Error Handling

```javascript
const { data, error } = await supabase
  .from('projects')
  .select('*')

if (error) {
  console.error('Error:', error.message)
  
  // RLS violation
  if (error.code === 'PGRST301') {
    console.log('Access denied')
  }
  
  // Not found
  if (error.code === 'PGRST116') {
    console.log('Record not found')
  }
  
  return
}

// Use data
console.log(data)
```

---

## 🔗 Useful Resources

- [Supabase JavaScript Client Docs](https://supabase.com/docs/reference/javascript)
- [Supabase Auth Reference](https://supabase.com/docs/guides/auth)
- [Storage Reference](https://supabase.com/docs/guides/storage)
- [Real-time Reference](https://supabase.com/docs/guides/realtime)

---

**Happy Coding! 🚀**
