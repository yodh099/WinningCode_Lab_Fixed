'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export async function submitIdea(formData: {
    title: string;
    description: string;
    budget: string;
    deadline: string;
    priority: string;
    fileUrl: string | null;
}) {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        return { error: 'Not authenticated' };
    }

    const { error } = await (supabase
        .from('ideas') as any)
        .insert({
            user_id: user.id,
            title: formData.title,
            description: formData.description,
            budget: formData.budget,
            deadline: formData.deadline || null,
            priority: formData.priority,
            file_url: formData.fileUrl
        });

    if (error) {
        console.error('Error submitting idea:', error);
        return { error: error.message };
    }

    // Revalidate relevant paths if needed (e.g. if there's a list of ideas)
    // revalidatePath('/[locale]/client/ideas');

    // Notify admins
    const { notifyAdmins } = await import('./notifications');
    await notifyAdmins(
        'New Project Idea',
        `New idea from user ${user.email}: ${formData.title}`,
        'info',
        '/admin/ideas' // Assuming this page exists
    );

    return { success: true };
}
