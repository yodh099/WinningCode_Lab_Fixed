# 🚀 WINNING CODE LAB - API QUICK REFERENCE

## 🔑 Authentication (WCAuth)

### Sign Up
```javascript
const { data, error } = await WCAuth.signUp(
    'user@example.com',
    'password123',
    {
        full_name: 'John Doe',
        language: 'en'
    }
);
```

### Sign In
```javascript
const { data, error } = await WCAuth.signIn(
    'user@example.com',
    'password123'
);
```

### Sign Out
```javascript
await WCAuth.signOut();
```

### Check Auth Status
```javascript
const isLoggedIn = WCAuth.isAuthenticated();
const isAdmin = WCAuth.isAdmin();
const user = WCAuth.currentUser;
const profile = WCAuth.currentProfile;
```

### Update Profile
```javascript
const { data, error } = await WCAuth.updateProfile({
    full_name: 'New Name',
    company_name: 'My Company',
    phone: '+1234567890'
});
```

---

## 📁 Projects (WCAPI.projects)

### Get All Projects
```javascript
const { data, error } = await WCAPI.projects.getAll({
    limit: 10
});
```

### Get Single Project
```javascript
const { data, error } = await WCAPI.projects.getById(projectId);
```

### Create Project (Admin)
```javascript
const { data, error } = await WCAPI.projects.create({
    title: {
        en: 'Project Name',
        fr: 'Nom du Projet',
        ht: 'Non Pwojè',
        es: 'Nombre del Proyecto'
    },
    description: { en: '...' },
    status: 'in_progress',
    published: true
});
```

---

## 📝 Blog Posts (WCAPI.blogPosts)

### Get All Posts
```javascript
const { data, error } = await WCAPI.blogPosts.getAll({
    limit: 10,
    category: 'technology'
});
```

### Get Post by Slug
```javascript
const { data, error } = await WCAPI.blogPosts.getBySlug('my-blog-post');
```

### Create Post (Admin)
```javascript
const { data, error } = await WCAPI.blogPosts.create({
    title: { en: 'Blog Title' },
    slug: 'blog-title',
    content: { en: 'Content...' },
    published: true
});
```

---

## 📨 Inquiries (WCAPI.inquiries)

### Create Inquiry (Public)
```javascript
const { data, error } = await WCAPI.inquiries.create({
    name: 'John Doe',
    email: 'john@example.com',
    phone: '+1234567890',
    project_idea: 'I want to build...',
    budget: '$5000',
    file_url: 'https://...'
});
```

### Get All Inquiries (Admin)
```javascript
const { data, error } = await WCAPI.inquiries.getAll({
    status: 'new',
    limit: 20
});
```

### Update Inquiry Status (Admin)
```javascript
const { data, error } = await WCAPI.inquiries.updateStatus(
    inquiryId,
    'reviewing',
    'Looking into this project'
);
```

---

## 💼 Client Projects (WCAPI.clientProjects)

### Get My Projects
```javascript
const { data, error } = await WCAPI.clientProjects.getMyProjects();
```

### Get Project Details
```javascript
const { data, error } = await WCAPI.clientProjects.getById(projectId);
```

### Create Project (Admin)
```javascript
const { data, error } = await WCAPI.clientProjects.create({
    client_id: userId,
    project_name: 'Website Development',
    description: 'Build a modern website',
    status: 'active',
    budget: 5000.00,
    currency: 'USD'
});
```

### Update Project
```javascript
const { data, error } = await WCAPI.clientProjects.update(projectId, {
    status: 'completed',
    progress: 100
});
```

---

## 💬 Messages (WCAPI.messages)

### Get My Messages
```javascript
const { data, error } = await WCAPI.messages.getMyMessages({
    projectId: 'project-uuid',
    unreadOnly: true
});
```

### Send Message
```javascript
const { data, error } = await WCAPI.messages.send({
    recipient_id: 'user-uuid',
    project_id: 'project-uuid',
    subject: 'Project Update',
    content: 'The project is progressing well...'
});
```

### Mark as Read
```javascript
await WCAPI.messages.markAsRead(messageId);
```

### Get Unread Count
```javascript
const { count } = await WCAPI.messages.getUnreadCount();
```

---

## 📎 Files (WCAPI.files)

### Get Project Files
```javascript
const { data, error } = await WCAPI.files.getProjectFiles(projectId);
```

### Upload File
```javascript
const fileInput = document.getElementById('fileInput');
const file = fileInput.files[0];

const { data, error } = await WCAPI.files.upload(
    projectId,
    file,
    'Project mockup design'
);
```

### Delete File
```javascript
await WCAPI.files.delete(fileId, fileUrl);
```

---

## 📋 Project Updates (WCAPI.projectUpdates)

### Get Project Updates
```javascript
const { data, error } = await WCAPI.projectUpdates.getByProject(projectId);
```

### Create Update (Admin)
```javascript
const { data, error } = await WCAPI.projectUpdates.create({
    project_id: projectId,
    update_type: 'milestone',
    title: 'Design Phase Completed',
    description: 'All mockups approved'
});
```

---

## 🗄️ Storage (supabaseStorage)

### Upload File to Storage
```javascript
const { data, error } = await supabaseStorage.uploadFile(
    supabaseStorage.BUCKETS.CLIENT_FILES,
    'path/to/file.pdf',
    fileObject
);
```

### Get Public URL
```javascript
const url = await supabaseStorage.getPublicUrl(
    supabaseStorage.BUCKETS.PROJECT_IMAGES,
    'image.jpg'
);
```

### Delete File from Storage
```javascript
await supabaseStorage.deleteFile(
    supabaseStorage.BUCKETS.CLIENT_FILES,
    'path/to/file.pdf'
);
```

---

## 🛠️ Helper Functions (WCHelpers)

### Format Currency
```javascript
const formatted = WCHelpers.formatCurrency(5000, 'USD');
// Output: "$5000.00"
```

### Format Date
```javascript
const formatted = WCHelpers.formatDate(new Date(), 'en');
// Output: "January 15, 2025"
```

### Format File Size
```javascript
const size = WCHelpers.formatFileSize(1024000);
// Output: "1000 KB"
```

### Validate Email
```javascript
const isValid = WCHelpers.isValidEmail('test@example.com');
// Output: true
```

### Validate File
```javascript
const result = WCHelpers.validateFile(file, 'IMAGE');
// Output: { valid: true } or { valid: false, error: 'FILE_TOO_LARGE' }
```

### Show Notification
```javascript
WCHelpers.showNotification(
    'Profile updated successfully!',
    'success',
    3000
);
```

### Slugify Text
```javascript
const slug = WCHelpers.slugify('My Blog Post Title');
// Output: "my-blog-post-title"
```

### Truncate Text
```javascript
const short = WCHelpers.truncate('Long text here...', 50);
```

### Debounce Function
```javascript
const debouncedSearch = WCHelpers.debounce(searchFunction, 300);
```

---

## 🎯 Constants (WC_CONSTANTS)

### Project Status
```javascript
WC_CONSTANTS.PROJECT_STATUS.COMING_SOON
WC_CONSTANTS.PROJECT_STATUS.IN_PROGRESS
WC_CONSTANTS.PROJECT_STATUS.COMPLETED
WC_CONSTANTS.PROJECT_STATUS.ARCHIVED
```

### User Roles
```javascript
WC_CONSTANTS.USER_ROLES.CLIENT
WC_CONSTANTS.USER_ROLES.STAFF
WC_CONSTANTS.USER_ROLES.ADMIN
```

### Languages
```javascript
WC_CONSTANTS.LANGUAGES.EN // { code: 'en', name: 'English', flag: '🇺🇸' }
WC_CONSTANTS.LANGUAGES.FR
WC_CONSTANTS.LANGUAGES.HT
WC_CONSTANTS.LANGUAGES.ES
```

### Error Messages
```javascript
WCHelpers.getErrorMessage('AUTH_REQUIRED', 'en');
// "You must be logged in to perform this action."
```

### Success Messages
```javascript
WCHelpers.getSuccessMessage('SAVED', 'ht');
// "Anrejistre avèk siksè!"
```

---

## 🎣 Event Listeners

### Auth State Changed
```javascript
window.addEventListener('authStateChanged', (event) => {
    const { isAuthenticated, user, profile } = event.detail;
    
    if (isAuthenticated) {
        console.log('User logged in:', user);
        // Update UI
    } else {
        console.log('User logged out');
        // Redirect or update UI
    }
});
```

---

## 💡 Usage Examples

### Complete Login Flow
```javascript
// Login form submission
document.getElementById('loginForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    
    const { data, error } = await WCAuth.signIn(email, password);
    
    if (error) {
        WCHelpers.showNotification(
            WCHelpers.getErrorMessage('AUTH_REQUIRED', 'en'),
            'error'
        );
        return;
    }
    
    WCHelpers.showNotification('Login successful!', 'success');
    window.location.href = '/client-space.html';
});
```

### Load and Display Projects
```javascript
async function loadProjects() {
    const { data: projects, error } = await WCAPI.projects.getAll({ limit: 6 });
    
    if (error) {
        console.error('Error loading projects:', error);
        return;
    }
    
    const lang = localStorage.getItem('wc_lang') || 'en';
    const container = document.querySelector('.projects-grid');
    
    container.innerHTML = projects.map(project => `
        <article class="project-card">
            <img src="${project.image_url}" alt="${project.title[lang]}">
            <h3>${project.title[lang]}</h3>
            <p>${project.description[lang]}</p>
            <span class="status">${project.status}</span>
        </article>
    `).join('');
}
```

### File Upload with Progress
```javascript
async function uploadFile(file, projectId) {
    // Validate file
    const validation = WCHelpers.validateFile(file, 'GENERAL');
    if (!validation.valid) {
        WCHelpers.showNotification(
            WCHelpers.getErrorMessage(validation.error, 'en'),
            'error'
        );
        return;
    }
    
    // Upload
    const { data, error } = await WCAPI.files.upload(projectId, file);
    
    if (error) {
        WCHelpers.showNotification('Upload failed', 'error');
        return;
    }
    
    WCHelpers.showNotification('File uploaded successfully!', 'success');
    return data;
}
```

---

## 🔒 Protected Routes

### Require Authentication
```javascript
document.addEventListener('DOMContentLoaded', async () => {
    await WCAuth.initialize();
    
    // Require login
    if (!WCAuth.isAuthenticated()) {
        window.location.href = '/login.html';
        return;
    }
    
    // Load page content
    loadDashboard();
});
```

### Require Admin Role
```javascript
document.addEventListener('DOMContentLoaded', async () => {
    await WCAuth.initialize();
    
    if (!WCAuth.isAdmin()) {
        window.location.href = '/index.html';
        return;
    }
    
    loadAdminPanel();
});
```

---

**Version**: 1.0.0  
**Last Updated**: 2025

For more details, see [README.md](README.md) and [SETUP.md](SETUP.md)
