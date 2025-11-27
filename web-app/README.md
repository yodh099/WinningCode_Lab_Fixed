# Winning Code Lab - Web Application

A modern, multilingual Next.js application built with TypeScript, Tailwind CSS, and Supabase integration.

## 🌐 Features

- **Multilingual Support**: Full i18n support for English, French, Haitian Creole, and Spanish
- **Modern Stack**: Built with Next.js 15, React 19, and TypeScript
- **Supabase Integration**: Ready-to-use Supabase client and server configurations
- **Responsive Design**: Mobile-first design with Tailwind CSS
- **Type-Safe**: Full TypeScript support with strict mode enabled
- **Production-Ready**: Optimized build configuration and best practices

## 🚀 Getting Started

### Prerequisites

- Node.js 18.x or higher
- npm or yarn
- A Supabase account (for backend features)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd web-app
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   
   Copy the example environment file:
   ```bash
   cp env.example .env.local
   ```
   
   Update `.env.local` with your Supabase credentials:
   ```
   NEXT_PUBLIC_SUPABASE_URL=your-project-url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   ```

4. **Run the development server**
   ```bash
   npm run dev
   ```
   
   Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📁 Project Structure

```
web-app/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── [locale]/           # Locale-specific routes
│   │   │   ├── layout.tsx      # Root layout with i18n provider
│   │   │   ├── page.tsx        # Home page
│   │   │   └── not-found.tsx   # 404 page
│   │   ├── globals.css         # Global styles and Tailwind setup
│   │   └── favicon.ico         # Favicon
│   ├── components/             # React components
│   │   ├── Navbar.tsx          # Navigation bar with language switcher
│   │   └── Footer.tsx          # Footer component
│   ├── i18n/                   # Internationalization configuration
│   │   ├── routing.ts          # Locale routing setup
│   │   └── request.ts          # Request-based locale detection
│   ├── lib/                    # Utility libraries
│   │   ├── supabase/           # Supabase client configurations
│   │   │   ├── client.ts       # Browser client
│   │   │   ├── server.ts       # Server client
│   │   │   └── database.types.ts # Database type definitions
│   │   └── utils.ts            # Utility functions (cn, etc.)
│   ├── messages/               # Translation files
│   │   ├── en.json             # English translations
│   │   ├── fr.json             # French translations
│   │   ├── ht.json             # Haitian Creole translations
│   │   └── es.json             # Spanish translations
│   └── middleware.ts           # Next.js middleware for i18n
├── public/                     # Static assets
├── next.config.mjs             # Next.js configuration
├── tailwind.config.ts          # Tailwind CSS configuration
├── tsconfig.json               # TypeScript configuration
└── package.json                # Dependencies and scripts
```

## 🌍 Internationalization (i18n)

This application uses `next-intl` for internationalization with support for:

- **English** (en) - Default locale
- **French** (fr)
- **Haitian Creole** (ht)
- **Spanish** (es)

### How It Works

1. **Middleware** (`src/middleware.ts`) detects the user's locale from:
   - URL path (e.g., `/fr/about`)
   - Browser language preferences
   - Cookies (for persistence)

2. **Routing** (`src/i18n/routing.ts`) defines supported locales and navigation utilities

3. **Messages** (`src/messages/*.json`) contain translations for each locale

### Adding New Translations

1. Add the translation key to all message files (`src/messages/*.json`)
2. Use in components with `useTranslations`:
   ```tsx
   const t = useTranslations('YourSection');
   return <p>{t('yourKey')}</p>;
   ```

### Adding a New Locale

1. Update `src/i18n/routing.ts` to include the new locale code
2. Create a new message file `src/messages/{locale}.json`
3. Add translations for all existing keys

## 🔧 Available Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |
| `npm run type-check` | Check TypeScript types |
| `npm run clean` | Clean build artifacts |
| `npm run check-updates` | Check for outdated packages |

## 🎨 Styling

This project uses:
- **Tailwind CSS 4**: Utility-first CSS framework
- **Custom Design System**: Defined in `src/app/globals.css`
- **Google Fonts**: Space Grotesk (headings) and Inter Tight (body)

### Color Palette

The application uses a dark-themed palette with cyan accents:
- Background: `#0A1A2F`
- Primary: `#5CF4E8` (Cyan)
- Foreground: `#FFFFFF`

Colors are CSS custom properties and can be easily customized in `globals.css`.

## 🗄️ Supabase Integration

The application includes pre-configured Supabase clients:

### Browser Client
Use in client components:
```tsx
'use client';
import { createClient } from '@/lib/supabase/client';

const supabase = createClient();
```

### Server Client
Use in server components, actions, and route handlers:
```tsx
import { createClient } from '@/lib/supabase/server';

const supabase = await createClient();
```

## 📦 Dependencies

### Core
- Next.js 15.1.6
- React 19.2.0
- TypeScript 5.x

### Styling
- Tailwind CSS 4.x
- clsx & tailwind-merge (for className utilities)

### Internationalization
- next-intl 4.5.5

### Backend
- Supabase SSR 0.7.0
- Supabase JS 2.83.0

### UI/UX
- Framer Motion 12.x (animations)
- Lucide React (icons)

## 🚦 Development Workflow

1. **Create a feature branch**
   ```bash
   git checkout -b feature/your-feature
   ```

2. **Make changes and test**
   ```bash
   npm run dev
   npm run type-check
   npm run lint
   ```

3. **Build for production**
   ```bash
   npm run build
   ```

4. **Commit and push**
   ```bash
   git add .
   git commit -m "feat: your feature description"
   git push origin feature/your-feature
   ```

## 🔍 Type Safety

This project enforces strict TypeScript checking:
- All components use TypeScript
- Supabase types are auto-generated
- Helper types are exported from relevant modules

## 📝 License

[Your License Here]

## 🤝 Contributing

Contributions are welcome! Please follow the existing code style and add tests for new features.

## 📞 Support

For questions or issues, please contact [your contact information]

---

**Last Deployment:** 2025-11-27 (Vercel configuration updated)
