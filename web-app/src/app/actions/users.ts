'use server';

import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { revalidatePath } from 'next/cache';

export async function updateUserRole(userId: string, newRole: 'admin' | 'staff' | 'client' | 'developer') {
    const supabase = await createClient();

    // 1. Check if current user is admin
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        return { error: 'Not authenticated' };
    }

    const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

    // Cast profile to any to avoid type errors if types aren't perfect
    const userProfile = profile as any;

    if (!userProfile || userProfile.role !== 'admin') {
        return { error: 'Not authorized' };
    }

    // 2. Update profile in database
    const { error: profileError } = await (supabase
        .from('profiles') as any)
        .update({ role: newRole })
        .eq('id', userId);

    if (profileError) {
        return { error: profileError.message };
    }

    // 3. Update user metadata in Auth (requires admin client)
    try {
        const adminSupabase = createAdminClient();
        const { error: authError } = await adminSupabase.auth.admin.updateUserById(
            userId,
            { user_metadata: { role: newRole } }
        );

        if (authError) {
            console.error('Error updating auth metadata:', authError);
            return { error: 'Profile updated but Auth metadata failed: ' + authError.message };
        }
    } catch (err) {
        console.error('Error creating admin client or updating auth:', err);
        // If we can't create the admin client (e.g. missing key), we should probably let the user know
        // but the profile update already happened.
        return { error: 'Failed to update auth metadata (Check server logs)' };
    }

    // Revalidate the users page to show updated data
    // We use a wildcard for locale since we don't know it here easily, 
    // or we can just rely on client-side state update for immediate feedback.
    // revalidatePath('/[locale]/admin/users', 'page'); 
    revalidatePath('/[locale]/admin/team', 'page');

    return { success: true };
}

export async function updateTeamMember(userId: string, data: {
    fullName: string;
    email: string;
    role: string;
    phone: string;
    companyName: string;
}) {
    const supabase = await createClient();

    // 1. Check if current user is admin
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: 'Not authenticated' };

    const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

    const userProfile = profile as any;
    if (!userProfile || userProfile.role !== 'admin') {
        return { error: 'Not authorized' };
    }

    // 2. Update profile details using Admin Client (to bypass RLS)
    const adminSupabase = createAdminClient();

    // Debug: Check key prefix
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
    const keyPrefix = key.substring(0, 5) + '...' + key.substring(key.length - 3);

    const { error: profileError } = await (adminSupabase
        .from('profiles') as any)
        .update({
            full_name: data.fullName,
            phone: data.phone,
            company_name: data.companyName,
            role: data.role
        })
        .eq('id', userId);

    if (profileError) {
        return { error: `Profile update failed (Key: ${keyPrefix}): ${profileError.message}` };
    }

    // 3. Update Auth metadata
    const { error: authError } = await adminSupabase.auth.admin.updateUserById(
        userId,
        { user_metadata: { role: data.role } }
    );

    if (authError) {
        console.error('Error updating auth metadata:', authError);
        return { error: `Auth update failed (Key: ${keyPrefix}): ${authError.message}` };
    }

    revalidatePath('/[locale]/admin/team', 'page');
    return { success: true };
}
