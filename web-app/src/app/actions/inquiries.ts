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

    const { error } = await supabase
        .from('inquiries')
        .insert({
            full_name: formData.name, // Schema uses full_name
            email: formData.email,
            phone: formData.phone,
            // company_name: formData.company_name, // Check if column exists, otherwise put in notes
            project_type: formData.project_type,
            budget: formData.budget,
            timeline: formData.timeline,
            message: formData.projectIdea + (formData.message ? `\n\nAdditional Message: ${formData.message}` : ''), // Combine idea and message
            priority: 'normal',
            status: 'new',
            source: 'website',
            notes: `Company: ${formData.company_name || 'N/A'}\nAttachment: ${formData.fileUrl || 'None'}`
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
