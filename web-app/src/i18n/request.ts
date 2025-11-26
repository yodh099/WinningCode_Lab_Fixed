import { getRequestConfig } from 'next-intl/server';
import { routing } from './routing';

/**
 * Next-intl Request Configuration
 * 
 * This configuration function is called for each request to:
 * 1. Resolve the locale from the request
 * 2. Validate the locale against supported locales
 * 3. Load the appropriate translation messages
 * 
 * The function handles edge cases like:
 * - Undefined or null locale values
 * - Unsupported locale codes
 * - Async locale resolution
 * 
 * If a locale is invalid, it falls back to the default locale
 * instead of throwing an error, ensuring the app remains functional.
 */
export default getRequestConfig(async ({ requestLocale }) => {
    // Await the potentially async locale value from the request
    let locale = await requestLocale;

    // Validate locale and provide fallback
    // Type-safe check: verify locale is in the supported locales array
    if (!locale || !routing.locales.includes(locale as (typeof routing.locales)[number])) {
        locale = routing.defaultLocale;
    }

    return {
        locale,
        // Dynamically import translation messages for the resolved locale
        // This ensures only the necessary translations are loaded per request
        messages: (await import(`../messages/${locale}.json`)).default
    };
});
