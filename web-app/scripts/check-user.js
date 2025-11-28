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

loadEnv(path.join(__dirname, '../../.env'));
loadEnv(path.join(__dirname, '../.env.local'));

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
    console.error('Error: Missing environment variables.');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey);

const EMAIL = 'winningcode3@gmail.com';

async function checkUser() {
    console.log(`Checking user: ${EMAIL}`);

    const { data: { users }, error } = await supabase.auth.admin.listUsers();
    if (error) {
        console.error('Error listing users:', error);
        return;
    }

    const user = users.find(u => u.email === EMAIL);

    if (!user) {
        console.log('User NOT found in auth.users');
        return;
    }

    console.log('User FOUND in auth.users');
    console.log('ID:', user.id);
    console.log('Metadata:', user.user_metadata);
    console.log('Confirmed:', user.email_confirmed_at ? 'Yes' : 'No');

    const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

    if (profileError) {
        console.error('Error fetching profile:', profileError);
    } else {
        console.log('Profile FOUND in public.profiles');
        console.log('Role:', profile.role);
    }
}

checkUser();
