import { defineRouting } from 'next-intl/routing';
import { createNavigation } from 'next-intl/navigation';

/**
 * Internationalization (i18n) Routing Configuration
 * 
 * Defines the supported locales and default locale for the application.
 * 
 * Supported locales:
 * - 'en': English
 * - 'fr': French (Français)
 * - 'ht': Haitian Creole (Kreyòl Ayisyen)
 * - 'es': Spanish (Español)
 * 
 * The default locale ('en') is used when:
 * - No locale is specified in the URL
 * - The requested locale is not in the supported list
 * - Locale detection fails
 */
export const routing = defineRouting({
    // A list of all locales that are supported
    locales: ['en', 'fr', 'ht', 'es'],

    // Used when no locale matches
    defaultLocale: 'en',

    // Always use locale prefix in URLs
    localePrefix: 'always',
});

/**
 * Type-safe navigation utilities
 * 
 * These are lightweight wrappers around Next.js' navigation APIs that
 * automatically handle locale prefixes based on the routing configuration.
 * 
 * - Link: Locale-aware Link component for client-side navigation
 * - redirect: Server-side redirect function with locale support
 * - usePathname: Hook to get current pathname without locale prefix
 * - useRouter: Locale-aware router for programmatic navigation
 * 
 * Always use these instead of Next.js built-in navigation to ensure
 * proper locale handling throughout the application.
 */
export const { Link, redirect, usePathname, useRouter } =
    createNavigation(routing);

/** 
 * Type helper for supported locale codes
 */
export type Locale = typeof routing.locales[number];
