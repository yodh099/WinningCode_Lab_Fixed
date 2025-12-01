'use server';

import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { revalidatePath } from 'next/cache';

export async function updateProject(projectId: string, data: {
    clientId: string;
    projectName: string;
    description: string;
    status: string;
    priority: string;
    budget: number | null;
    currency: string;
    deadline: string | null;
}) {
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

    // 2. Update project using Admin Client
    const adminSupabase = createAdminClient();

    const { error } = await (adminSupabase
        .from('client_projects') as any)
        .update({
            client_id: data.clientId,
            project_name: data.projectName,
            description: data.description,
            status: data.status,
            priority: data.priority,
            budget: data.budget,
            currency: data.currency,
            deadline: data.deadline
        })
        .eq('id', projectId);

    if (error) {
        console.error('Error updating project:', error);
        return { error: error.message };
    }

    revalidatePath('/[locale]/admin/projects', 'page');
    return { success: true };
}
