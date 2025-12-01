'use server';

import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { revalidatePath } from 'next/cache';

export async function updateClientProfile(clientId: string, data: { fullName: string; companyName: string; phone: string }) {
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

    const userProfile = profile as any;

    if (!userProfile || userProfile.role !== 'admin') {
        return { error: 'Not authorized' };
    }

    // 2. Update profile in database using Admin Client to bypass RLS if needed
    // (or just standard client if RLS allows admins to update others, but admin client is safer guarantee)
    const adminSupabase = createAdminClient();

    const { error } = await adminSupabase
        .from('profiles')
        .update({
            full_name: data.fullName,
            company_name: data.companyName,
            phone: data.phone
        })
        .eq('id', clientId);

    if (error) {
        return { error: error.message };
    }

    // Revalidate relevant paths
    revalidatePath('/[locale]/admin/clients', 'page');

    return { success: true };
}
