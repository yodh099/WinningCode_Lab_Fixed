# 🏆 Winning Code Lab

**Build. Innovate. Win.**  
Every Move Builds the Future. Let's Make It Legendary.

---

## 📖 About | Sou

**English**: Winning Code Lab is a modern web development agency portfolio and client management platform built with HTML, CSS, JavaScript, and Supabase as the backend.

**Kreyòl**: Winning Code Lab se yon platfòm modèn pou pòtfòy ajans devlopman web ak jesyon kliyan ki bati ak HTML, CSS, JavaScript, ak Supabase kòm backend.

**Français**: Winning Code Lab est une plateforme moderne de portfolio d'agence de développement web et de gestion de clients construite avec HTML, CSS, JavaScript et Supabase comme backend.

**Español**: Winning Code Lab es una plataforma moderna de portafolio de agencia de desarrollo web y gestión de clientes construida con HTML, CSS, JavaScript y Supabase como backend.

---

## ✨ Features | Karakteristik

- 🌍 **Multi-language support** (EN, FR, HT, ES)
- 🔐 **User authentication** with Supabase Auth
- 📊 **Client dashboard** for project tracking
- 💬 **Messaging system** between clients and team
- 📁 **File management** with Supabase Storage
- 📝 **Blog/CMS** with multi-language content
- 📱 **Responsive design** for all devices
- 🎨 **Modern UI/UX** with smooth animations
- 🔒 **Row Level Security** for data protection

---

## 🚀 Quick Start

### Prerequisites
- Supabase account (free tier available)
- Modern web browser
- Basic HTTP server (Python, Node.js, or any)

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/yourusername/winning-code-lab.git
cd winning-code-lab
```

2. **Configure Supabase**
```bash
# Copy environment template
cp .env.example .env

# Edit .env and add your Supabase credentials
# SUPABASE_URL=your-project-url
# SUPABASE_ANON_KEY=your-anon-key
```

3. **Setup Database**
- Go to Supabase Dashboard → SQL Editor
- Run the SQL script from `supabase/schema.sql`

4. **Create Storage Buckets**
- Create these buckets in Supabase Storage:
  - `project-images` (public)
  - `blog-images` (public)
  - `client-files` (private)
  - `inquiry-attachments` (private)

5. **Configure Application**
- Open `js/supabase-config.js`
- Add your Supabase URL and anon key:
```javascript
const SUPABASE_CONFIG = {
    url: 'YOUR_SUPABASE_URL',
    anonKey: 'YOUR_ANON_KEY'
};
```

6. **Run the application**
```bash
# Option 1: Python
python -m http.server 8000

# Option 2: Node.js (npx)
npx serve .

# Option 3: PHP
php -S localhost:8000
```

7. **Open in browser**
```
http://localhost:8000
```

---

## 📂 Project Structure

```
winning-code-lab/
├── index.html              # Homepage
├── about.html              # About page
├── projects.html           # Projects showcase
├── services.html           # Services page
├── blog.html               # Blog listing
├── blog-post-*.html        # Individual blog posts
├── client-space.html       # Client dashboard
├── just-ask.html           # Contact/inquiry form
├── style.css               # Main stylesheet
├── script.js               # Main JavaScript
├── translations.js         # Multi-language translations
├── js/
│   ├── supabase-config.js  # Supabase configuration
│   ├── auth.js             # Authentication module
│   ├── api.js              # API functions
│   └── constants.js        # Constants and helpers
├── supabase/
│   ├── schema.sql          # Database schema
│   └── migrations/         # Future migrations
├── .env                    # Environment variables (not in git)
├── .env.example            # Environment template
├── .gitignore              # Git ignore rules
├── package.json            # NPM dependencies
├── SETUP.md                # Detailed setup guide
└── README.md               # This file
```

---

## 🔧 Configuration Files

### `.env`
Contains sensitive configuration (never commit to git):
```bash
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOi...
```

### `js/supabase-config.js`
JavaScript configuration for Supabase client initialization.

---

## 📚 API Reference

### Authentication (`WCAuth`)

```javascript
// Sign up
await WCAuth.signUp(email, password, { full_name, language });

// Sign in
await WCAuth.signIn(email, password);

// Sign out
await WCAuth.signOut();

// Check if authenticated
const isAuth = WCAuth.isAuthenticated();

// Get current user
const user = WCAuth.currentUser;
const profile = WCAuth.currentProfile;
```

### Projects API (`WCAPI.projects`)

```javascript
// Get all published projects
const { data } = await WCAPI.projects.getAll({ limit: 10 });

// Get single project
const { data } = await WCAPI.projects.getById(projectId);

// Create project (admin only)
const { data } = await WCAPI.projects.create(projectData);
```

### Inquiries API (`WCAPI.inquiries`)

```javascript
// Create inquiry (public)
const { data } = await WCAPI.inquiries.create({
    name: 'John Doe',
    email: 'john@example.com',
    project_idea: 'Build a website',
    budget: '$5000'
});

// Get all inquiries (admin only)
const { data } = await WCAPI.inquiries.getAll();
```

### Client Projects API (`WCAPI.clientProjects`)

```javascript
// Get my projects
const { data } = await WCAPI.clientProjects.getMyProjects();

// Get project by ID
const { data } = await WCAPI.clientProjects.getById(projectId);
```

### Messages API (`WCAPI.messages`)

```javascript
// Get my messages
const { data } = await WCAPI.messages.getMyMessages();

// Send message
const { data } = await WCAPI.messages.send({
    recipient_id: userId,
    subject: 'Hello',
    content: 'Message content'
});

// Mark as read
await WCAPI.messages.markAsRead(messageId);
```

---

## 🎨 Customization

### Adding New Languages

1. Edit `translations.js`
2. Add new language object
3. Update language switcher in HTML
4. Update database JSONB fields

### Changing Colors/Theme

Edit `style.css` and modify CSS variables:
```css
:root {
    --primary-color: #your-color;
    --secondary-color: #your-color;
}
```

---

## 🔐 Security

- ✅ Row Level Security (RLS) enabled on all tables
- ✅ Environment variables for sensitive data
- ✅ Input validation on client and server
- ✅ CORS configured properly
- ✅ Rate limiting on forms
- ⚠️ Never expose `service_role_key`

---

## 📖 Documentation

- [Setup Guide](SETUP.md) - Detailed Supabase configuration
- [Supabase Docs](https://supabase.com/docs)
- [JavaScript Client Reference](https://supabase.com/docs/reference/javascript)

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📝 License

This project is licensed under the MIT License.

---

## 👥 Authors

**Winning Code Lab Team**
- Website: [winningcode.com](#)
- Email: info@winningcode.com

---

## 🙏 Acknowledgments

- Supabase for the amazing backend platform
- Font: Inter Tight & Space Grotesk
- Icons and design inspiration

---

## 📞 Support

Need help? Check out:
- [Setup Guide](SETUP.md)
- [GitHub Issues](https://github.com/yourusername/winning-code-lab/issues)
- Email: support@winningcode.com

---

**Build. Innovate. Win.** 🏆
