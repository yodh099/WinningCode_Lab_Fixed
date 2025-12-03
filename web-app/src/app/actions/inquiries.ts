'use server';

import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';

export async function submitInquiry(formData: {
    name: string;
    email: string;
    phone?: string;
    company_name?: string;
    projectIdea: string;
    project_type?: string;
    budget?: string;
    timeline?: string;
    message?: string;
    fileUrl?: string | null;
}) {
    // Use Admin Client to bypass RLS for public submissions
    const supabase = createAdminClient();

    const { error } = await (supabase
        .from('inquiries') as any)
        .insert({
            full_name: formData.name, // User requested 'full_name' column
            email: formData.email,
            phone: formData.phone,
            company_name: formData.company_name, // User requested 'company_name' column
            project_idea: formData.projectIdea, // User requested 'project_idea' column
            project_type: formData.project_type,
            budget: formData.budget,
            timeline: formData.timeline,
            message: formData.message,
            priority: 'normal',
            status: 'new',
            source: 'website',
            notes: formData.fileUrl ? `Attachment: ${formData.fileUrl}` : null
        });

    if (error) {
        console.error('Error submitting inquiry:', error);
        return { error: error.message };
    }

    // Notify admins
    try {
        const { notifyAdmins } = await import('./notifications');
        await notifyAdmins(
            'New Inquiry Received',
            `New inquiry from ${formData.name}: ${formData.projectIdea.substring(0, 50)}...`,
            'info',
            '/admin/ideas'
        );
    } catch (notifyError) {
        console.error('Failed to notify admins:', notifyError);
        // Don't fail the submission if notification fails
    }

    return { success: true };
}
