'use server';

import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { revalidatePath } from 'next/cache';
import { createNotification } from './notifications';

export async function updateProject(projectId: string, data: {
    clientId: string;
    projectName: string;
    description: string;
    status: string;
    priority: string;
    budget: number | null;
    currency: string;
    deadline: string | null;
    assignedTo: string | null;
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
            project_name: data.projectName, // Map projectName to project_name
            description: data.description,
            status: data.status,
            priority: data.priority,
            budget: data.budget,
            currency: data.currency,
            deadline: data.deadline,
            assigned_to: data.assignedTo
        })
        .eq('id', projectId);

    if (error) {
        console.error('Error updating project:', error);
        return { error: error.message };
    }

    // Create notification for assignment
    if (data.assignedTo) {
        await createNotification(
            data.assignedTo,
            'New Project Assignment',
            `You have been assigned to project: ${data.projectName}`,
            'info',
            `/admin/projects/${projectId}`
        );
    }

    // Create notification for client about project update
    await createNotification(
        data.clientId,
        'Project Updated',
        `Your project "${data.projectName}" has been updated`,
        'info',
        `/client/projects/${projectId}`
    );

    revalidatePath('/[locale]/admin/projects', 'page');
    revalidatePath('/[locale]/client/dashboard', 'page');
    return { success: true };
}

export async function createProject(data: {
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

    // 2. Create project using Admin Client
    const adminSupabase = createAdminClient();

    const projectData = {
        client_id: data.clientId,
        title: data.projectName, // Database requires 'title' column
        project_name: data.projectName,
        description: data.description,
        status: data.status,
        priority: data.priority,
        budget: data.budget,
        currency: data.currency,
        deadline: data.deadline,
        progress: 0
    };

    console.log('Creating project with data:', projectData);

    const { data: insertedProject, error } = await (adminSupabase
        .from('client_projects') as any)
        .insert(projectData)
        .select()
        .single();

    if (error) {
        console.error('Error creating project:', error);
        console.error('Project data that failed:', projectData);
        return { error: error.message };
    }

    // Create notification for client about new project
    await createNotification(
        data.clientId,
        'New Project Created',
        `A new project "${data.projectName}" has been created for you`,
        'info',
        `/client/projects/${insertedProject.id}`
    );

    revalidatePath('/[locale]/admin/projects', 'page');
    revalidatePath('/[locale]/client/dashboard', 'page');
    return { success: true };
}
