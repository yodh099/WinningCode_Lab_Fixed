import createMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing';
import { createServerClient } from '@supabase/ssr';
import { type NextRequest, NextResponse } from 'next/server';

const intlMiddleware = createMiddleware(routing);

export default async function middleware(request: NextRequest) {
  // 1. Run i18n middleware first to handle locale
  const response = intlMiddleware(request);

  // 2. Setup Supabase client (with error handling for Edge runtime)
  let user = null;

  try {
    // Check if Supabase env vars are available
    if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
        {
          cookies: {
            getAll() {
              return request.cookies.getAll();
            },
            setAll(cookiesToSet) {
              cookiesToSet.forEach(({ name, value, options }) => {
                request.cookies.set(name, value);
                response.cookies.set(name, value, options);
              });
            },
          },
        }
      );

      // 3. Get User
      // This will refresh session if expired - required for Server Components
      const { data } = await supabase.auth.getUser();
      user = data.user;
    }
  } catch (error) {
    // If Supabase fails, continue without auth (allow public access)
    console.error('Middleware Supabase error:', error);
  }

  // 4. Role-Based Routing Logic
  const path = request.nextUrl.pathname;

  // Extract locale
  const segments = path.split('/');
  const locale = segments[1];

  // Check if the first segment is a valid locale
  const isValidLocale = routing.locales.some((l) => l === locale);

  // If not a valid locale, next-intl will handle redirect/rewrite
  if (!isValidLocale) {
    return response;
  }

  // Construct the "route" part (everything after locale)
  // e.g. /en/client/dashboard -> /client/dashboard
  const route = '/' + segments.slice(2).join('/');

  // Define Protected Routes
  // Define Protected Routes
  const isClientRoute = route.startsWith('/client');
  const isTeamRoute = route.startsWith('/team');
  const isAdminRoute = route.startsWith('/admin');
  const isSubmitIdeaRoute = route.startsWith('/submit-idea');
  const isProtected = isClientRoute || isTeamRoute || isAdminRoute || isSubmitIdeaRoute;

  const isAuthRoute = route.startsWith('/login');

  // 5. Handle Unauthenticated Users
  if (!user) {
    // Redirect unauthenticated users trying to access protected routes to login
    // Include the 'next' param to redirect back after login
    if (isProtected) {
      const loginUrl = new URL(`/${locale}/login`, request.url);
      loginUrl.searchParams.set('next', route);
      return NextResponse.redirect(loginUrl);
    }
  } else {
    // 6. Handle Authenticated Users
    const role = user.user_metadata?.role;

    // TEMPORARY: Allow ALL authenticated users to access admin routes
    if (isAdminRoute) {
      return response; // Skip all role checks for admin routes
    }

    // Redirect from login page if already authenticated
    if (isAuthRoute) {
      // Check for 'next' param to redirect back to intended page
      const nextParam = request.nextUrl.searchParams.get('next');
      if (nextParam && nextParam.startsWith('/')) {
        return NextResponse.redirect(new URL(`/${locale}${nextParam}`, request.url));
      }

      // Default role-based redirect
      if (role === 'client') return NextResponse.redirect(new URL(`/${locale}/client/dashboard`, request.url));
      if (role === 'developer') return NextResponse.redirect(new URL(`/${locale}/team/dashboard`, request.url));
      if (role === 'admin' || role === 'staff') return NextResponse.redirect(new URL(`/${locale}/admin/dashboard`, request.url));
    }

    // Enforce Role Access on Protected Routes (NOT admin)
    if (isClientRoute && role !== 'client' && role !== 'admin' && role !== 'staff') {
      return NextResponse.redirect(new URL(`/${locale}/not-authorized`, request.url));
    }
    if (isTeamRoute && role !== 'developer' && role !== 'admin' && role !== 'staff') {
      return NextResponse.redirect(new URL(`/${locale}/not-authorized`, request.url));
    }
  }

  return response;
}

export const config = {
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)']
};
