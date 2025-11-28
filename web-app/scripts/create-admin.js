const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Try to load env vars from .env files
function loadEnv(filePath) {
    if (fs.existsSync(filePath)) {
        const content = fs.readFileSync(filePath, 'utf8');
        content.split('\n').forEach(line => {
            const match = line.match(/^([^=]+)=(.*)$/);
            if (match) {
                const key = match[1].trim();
                const value = match[2].trim().replace(/^["']|["']$/g, '');
                if (!process.env[key]) {
                    process.env[key] = value;
                }
            }
        });
    }
}

// Load from potential locations
loadEnv(path.join(__dirname, '../../.env'));
loadEnv(path.join(__dirname, '../.env.local'));

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
    console.error('Error: Missing environment variables.');
    console.error('Required: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY');
    console.error('Found URL:', !!supabaseUrl);
    console.error('Found Key:', !!serviceRoleKey);
    process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: {
        autoRefreshToken: false,
        persistSession: false
    }
});

const EMAIL = 'winningcode3@gmail.com';
const PASSWORD = 'WinningCode2024-20$';

async function createAdmin() {
    console.log(`Attempting to create/update admin user: ${EMAIL}`);

    try {
        // 1. Check if user exists
        const { data: { users }, error: listError } = await supabase.auth.admin.listUsers();

        if (listError) throw listError;

        let userId;
        const existingUser = users.find(u => u.email === EMAIL);

        if (existingUser) {
            console.log('User already exists. Updating...');
            userId = existingUser.id;

            // Update password and metadata
            const { error: updateError } = await supabase.auth.admin.updateUserById(userId, {
                password: PASSWORD,
                user_metadata: { role: 'admin', full_name: 'Admin User' },
                email_confirm: true
            });

            if (updateError) throw updateError;
            console.log('User auth updated.');

        } else {
            console.log('Creating new user...');
            const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
                email: EMAIL,
                password: PASSWORD,
                email_confirm: true,
                user_metadata: { role: 'admin', full_name: 'Admin User' }
            });

            if (createError) throw createError;
            userId = newUser.user.id;
            console.log('User created.');
        }

        // 2. Update public.profiles table
        console.log('Updating profiles table...');

        // First check if profile exists
        const { data: profile, error: profileFetchError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', userId)
            .single();

        if (profileFetchError && profileFetchError.code !== 'PGRST116') { // PGRST116 is "not found"
            console.log('Error fetching profile (might not exist yet):', profileFetchError.message);
        }

        if (profile) {
            const { error: profileUpdateError } = await supabase
                .from('profiles')
                .update({ role: 'admin' })
                .eq('id', userId);

            if (profileUpdateError) throw profileUpdateError;
        } else {
            // Insert if not exists (though trigger should have handled it, but just in case)
            const { error: profileInsertError } = await supabase
                .from('profiles')
                .insert({
                    id: userId,
                    role: 'admin',
                    full_name: 'Admin User',
                    email_verified: true
                });

            if (profileInsertError) throw profileInsertError;
        }

        console.log('Profile updated successfully.');
        console.log('-----------------------------------');
        console.log('SUCCESS! Admin account is ready.');
        console.log(`Email: ${EMAIL}`);
        console.log(`Password: ${PASSWORD}`);
        console.log('-----------------------------------');

    } catch (err) {
        console.error('Failed to create admin:', err);
        process.exit(1);
    }
}

createAdmin();
