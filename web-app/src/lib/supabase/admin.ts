import { createClient } from '@supabase/supabase-js';
import { Database } from './database.types';

export function createAdminClient() {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !serviceRoleKey) {
        console.error('Admin Client Error: Missing env vars', {
            url: !!supabaseUrl,
            key: !!serviceRoleKey
        });
        throw new Error('Missing Supabase environment variables for admin client');
    }

    // Debug log (remove in production if sensitive, but helpful for now)
    // console.log('Initializing Admin Client with key length:', serviceRoleKey.length);

    return createClient<Database>(supabaseUrl, serviceRoleKey, {
        auth: {
            autoRefreshToken: false,
            persistSession: false
        }
    });
}
