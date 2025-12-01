'use server';

export async function debugEnvVars() {
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;

    return {
        serviceRoleKey: {
            exists: !!serviceRoleKey,
            length: serviceRoleKey?.length || 0,
            prefix: serviceRoleKey ? serviceRoleKey.substring(0, 5) + '...' : 'N/A',
            isAnon: serviceRoleKey === anonKey
        },
        anonKey: {
            exists: !!anonKey,
            length: anonKey?.length || 0,
            prefix: anonKey ? anonKey.substring(0, 5) + '...' : 'N/A'
        },
        url: {
            exists: !!url,
            value: url
        }
    };
}
