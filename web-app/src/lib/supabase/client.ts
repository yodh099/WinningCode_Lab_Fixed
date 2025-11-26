import { createBrowserClient } from '@supabase/ssr'
import { Database } from './database.types'

/**
 * Create Supabase Browser Client
 * 
 * Creates a Supabase client for use in client-side components.
 * This client runs in the browser and uses browser-based authentication.
 * 
 * Required environment variables:
 * - NEXT_PUBLIC_SUPABASE_URL: Your Supabase project URL
 * - NEXT_PUBLIC_SUPABASE_ANON_KEY: Your Supabase anonymous/public key
 * 
 * @returns Configured Supabase browser client
 * @throws {Error} If required environment variables are not set
 */
export function createClient() {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    // Validate required environment variables
    if (!supabaseUrl) {
        throw new Error(
            'Missing NEXT_PUBLIC_SUPABASE_URL environment variable. ' +
            'Please add it to your .env.local file.'
        );
    }

    if (!supabaseAnonKey) {
        throw new Error(
            'Missing NEXT_PUBLIC_SUPABASE_ANON_KEY environment variable. ' +
            'Please add it to your .env.local file.'
        );
    }

    // Log a warning in development if using placeholder values
    if (process.env.NODE_ENV === 'development') {
        if (supabaseUrl.includes('your-project-url')) {
            console.warn(
                '⚠️  You are using a placeholder Supabase URL. ' +
                'Please update NEXT_PUBLIC_SUPABASE_URL in your .env.local file.'
            );
        }
    }

    return createBrowserClient<Database>(supabaseUrl, supabaseAnonKey);
}
