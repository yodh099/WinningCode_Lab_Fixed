# Architecture Documentation

## Overview

This document describes the architecture and design decisions of the Winning Code Lab web application. The application is built using modern web technologies with a focus on maintainability, scalability, and internationalization.

## Technology Stack

### Core Framework
- **Next.js 15.1.6**: React framework with App Router
- **React 19.2.0**: UI library
- **TypeScript 5.x**: Type-safe JavaScript

### Styling
- **Tailwind CSS 4.x**: Utility-first CSS framework
- **PostCSS**: CSS processing
- **Google Fonts**: Space Grotesk & Inter Tight

### Internationalization
- **next-intl 4.5.5**: i18n library for Next.js
- Supported locales: en, fr, ht, es

### Backend Integration
- **Supabase**: Backend-as-a-Service
  - Authentication
  - Database (PostgreSQL)
  - Real-time subscriptions
  - Storage

### Development Tools
- **ESLint 9.x**: Code linting
- **TypeScript Compiler**: Type checking

## Architecture Patterns

### 1. App Router Architecture

The application uses Next.js App Router with a locale-based routing structure:

```
/[locale]/          → Root for all localized pages
/[locale]/page      → Home page
/[locale]/about     → About page
/[locale]/services  → Services page
... etc
```

**Benefits:**
- Automatic locale prefix handling
- Server Components by default (better performance)
- Nested layouts support
- Streaming and Suspense out of the box

### 2. Client vs Server Components

#### Server Components (Default)
Used for:
- Layouts
- Static content pages
- Data fetching from Supabase
- SEO-critical pages

**Advantages:**
- Zero JavaScript bundle impact
- Direct database access
- Better SEO
- Faster initial page load

#### Client Components ('use client')
Used for:
- Interactive UI (forms, buttons)
- Browser APIs access
- Event handlers
- State management with hooks

**Files using Client Components:**
- `src/components/Navbar.tsx` - Interactive navigation
- `src/components/Footer.tsx` - Dynamic translations
- `src/app/[locale]/page.tsx` - Uses translation hooks
- `src/app/[locale]/not-found.tsx` - Uses translation hooks

### 3. Internationalization (i18n) Architecture

#### Flow Diagram

```
Request → Middleware → Locale Detection → Route Resolution
                ↓
          Set Locale Cookie
                ↓
          Load Messages
                ↓
          Render Component
```

#### Components

**1. Middleware** (`src/middleware.ts`)
- Intercepts all requests
- Detects locale from URL, cookies, or Accept-Language header
- Redirects to locale-prefixed URLs
- Sets locale cookie for persistence

**2. Routing Configuration** (`src/i18n/routing.ts`)
- Defines supported locales
- Sets default locale
- Exports type-safe navigation utilities

**3. Request Configuration** (`src/i18n/request.ts`)
- Loads translation messages per request
- Validates locale
- Provides fallback to default locale

**4. Message Files** (`src/messages/*.json`)
- Organized by locale
- Structured JSON with nested keys
- Shared across all pages

#### Adding a New Page

When adding a new page with translations:

1. **Add route:**
   ```
   src/app/[locale]/your-page/page.tsx
   ```

2. **Add translations to all locale files:**
   ```json
   {
     "YourPage": {
       "title": "...",
       "description": "..."
     }
   }
   ```

3. **Use in component:**
   ```tsx
   'use client';
   import { useTranslations } from 'next-intl';
   
   export default function YourPage() {
     const t = useTranslations('YourPage');
     return <h1>{t('title')}</h1>;
   }
   ```

### 4. Supabase Integration Architecture

#### Two Client Types

**Browser Client** (`src/lib/supabase/client.ts`)
- Used in Client Components
- Runs in browser only
- User authentication handled via cookies

**Server Client** (`src/lib/supabase/server.ts`)
- Used in Server Components, Actions, Route Handlers
- Runs on server only
- Cookie management with Next.js cookies() API

#### Authentication Flow

```
1. User logs in → Supabase Auth
2. Auth sets cookies → Middleware reads cookies
3. Subsequent requests → Auto-authenticated via cookies
4. Actions/Components → Use respective client (server/browser)
```

#### Type Safety

- `database.types.ts`: Auto-generated from Supabase schema
- Provides full TypeScript support for queries
- Regenerate when schema changes

### 5. Styling Architecture

#### Tailwind CSS Configuration

**Design Tokens** (in `globals.css`):
- Colors defined as CSS custom properties
- Dark mode enabled by default
- Light mode support via media query
- Font families as CSS variables

**Utility Organization:**
```css
@theme {
  --color-*        → Color tokens
  --font-*         → Font families
  --radius-*       → Border radius
}
```

#### Component Styling Pattern

Use the `cn()` utility for conditional classes:

```tsx
import { cn } from '@/lib/utils';

<div className={cn(
  'base-class',
  isActive && 'active-class',
  variant === 'primary' && 'primary-class'
)} />
```

**Benefits:**
- Resolves Tailwind class conflicts
- Type-safe with TypeScript
- Cleaner conditional logic

### 6. Component Organization

#### File Structure

```
src/components/
├── Navbar.tsx         → Navigation (Client Component)
├── Footer.tsx         → Footer (Client Component)
└── ui/               → Reusable UI components (future)
```

#### Component Patterns

**1. Props Interface Pattern:**
```tsx
interface ComponentProps {
  /** JSDoc description */
  prop: string;
}

export function Component({ prop }: ComponentProps) {
  // ...
}
```

**2. Translation Pattern:**
```tsx
'use client';
import { useTranslations } from 'next-intl';

export function Component() {
  const t = useTranslations('Section');
  return <p>{t('key')}</p>;
}
```

**3. Navigation Pattern:**
```tsx
import { Link } from '@/i18n/routing';

export function Component() {
  return <Link href="/about">About</Link>;
}
```

### 7. Type Safety Architecture

#### TypeScript Configuration

- **Strict mode enabled**: Catches common errors
- **Path aliases**: `@/` maps to `src/`
- **No implicit any**: Forces explicit typing
- **Next.js plugin**: IDE integration

#### Type Exports

Key type exports for reuse:
- `Locale` from `src/i18n/routing.ts`
- `Database` from `src/lib/supabase/database.types.ts`
- Component prop interfaces

### 8. Performance Optimizations

#### Build-Time Optimizations

1. **Static Generation**: All locale paths pre-rendered
2. **Font Optimization**: Next.js automatic font optimization
3. **Image Optimization**: Built-in Next.js image optimization
4. **Code Splitting**: Automatic route-based splitting

#### Runtime Optimizations

1. **Server Components**: Zero client-side JavaScript for static content
2. **Dynamic Imports**: Lazy load client components
3. **Tailwind Purging**: Unused styles removed in production
4. **Console Removal**: console.log removed in production builds

### 9. Security Best Practices

#### Environment Variables

- Prefix public vars with `NEXT_PUBLIC_`
- Never commit `.env.local`
- Use `env.example` for documentation
- Validate env vars at runtime

#### Supabase Security

- Row Level Security (RLS) enabled on database
- Anon key is safe for client-side use
- Service key (if used) only in server code
- Cookie-based authentication

#### Content Security

- Type checking prevents XSS in templates
- Sanitize user input before database storage
- Use prepared statements (Supabase does this automatically)

## Folder Structure Conventions

### Pages
- Place in `src/app/[locale]/`
- Use `page.tsx` for route
- Use `layout.tsx` for shared layouts
- Use `loading.tsx` for loading states
- Use `error.tsx` for error boundaries

### Components
- Reusable UI: `src/components/`
- Page-specific: colocate with page
- Export as named functions
- One component per file

### Utilities
- Pure functions: `src/lib/utils.ts`
- Supabase clients: `src/lib/supabase/`
- Type definitions: `.types.ts` suffix

### Translations
- One file per locale in `src/messages/`
- Nested structure by page/section
- Always keep keys in sync

## Development Workflow

### Local Development

1. Start dev server: `npm run dev`
2. Make changes with hot reload
3. Check types: `npm run type-check`
4. Lint code: `npm run lint`

### Adding Features

1. Create feature branch
2. Add types first (if needed)
3. Implement component/page
4. Add translations (all locales)
5. Test in all locales
6. Type check and lint
7. Build to verify production build

### Database Changes

1. Update Supabase schema via dashboard or migrations
2. Regenerate types: `supabase gen types typescript --project-id PROJECT_ID > src/lib/supabase/database.types.ts`
3. Update affected queries/components

## Deployment

### Build Process

```bash
npm run build
```

**What happens:**
1. TypeScript compilation
2. Generate static pages for all locales
3. Optimize images and fonts
4. Bundle client JavaScript
5. Generate .next output directory

### Environment Variables

Required in production:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### Recommended Hosting

- **Vercel**: Optimal for Next.js (zero config)
- **Netlify**: Good alternative
- **Docker**: For self-hosting

## Future Enhancements

### Planned Improvements

1. **Component Library**: Build reusable UI component library
2. **Testing**: Add Jest + React Testing Library
3. **E2E Tests**: Playwright or Cypress
4. **API Routes**: Add custom API endpoints
5. **Monitoring**: Error tracking (Sentry)
6. **Analytics**: User analytics integration
7. **PWA**: Progressive Web App features
8. **Accessibility**: Full ARIA compliance audit

### Scalability Considerations

- Consider moving to monorepo if adding mobile apps
- Add caching layer (Redis) for high traffic
- Implement CDN for static assets
- Add rate limiting for API routes
- Consider edge functions for geolocation

## Troubleshooting

### Common Issues

**Issue**: 404 on locale routes
- **Solution**: Check middleware matcher pattern
- **Solution**: Verify locale in `routing.ts`

**Issue**: Missing translations
- **Solution**: Ensure key exists in all locale files
- **Solution**: Check spelling of translation keys

**Issue**: Supabase connection errors
- **Solution**: Verify environment variables
- **Solution**: Check Supabase project status

**Issue**: Type errors after schema change
- **Solution**: Regenerate `database.types.ts`

## References

- [Next.js Documentation](https://nextjs.org/docs)
- [next-intl Documentation](https://next-intl-docs.vercel.app/)
- [Supabase Documentation](https://supabase.com/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [TypeScript Documentation](https://www.typescriptlang.org/docs)

## Changelog

### 2025-11-23
- Initial architecture documentation
- Added comprehensive JSDoc documentation
- Improved type safety across all files
- Enhanced error handling for Supabase clients
- Updated to Next.js 15.1.6
- Added production optimizations
