'use server';

import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';

export async function submitInquiry(formData: {
    name: string;
    email: string;
    projectIdea: string;
    budget?: string;
    deadline?: string;
    priority?: string;
    fileUrl?: string | null;
}) {
    // Use Admin Client to bypass RLS for public submissions (if RLS is strict)
    // Or use standard client if RLS allows anon inserts
    const supabase = createAdminClient();

    const { error } = await (supabase
        .from('inquiries') as any)
        .insert({
            name: formData.name,
            email: formData.email,
            project_idea: formData.projectIdea,
            budget: formData.budget,
            timeline: formData.deadline,
            priority: formData.priority,
            // file_url: formData.fileUrl // inquiries table might not have file_url, checking schema...
            // Schema check: inquiries table does NOT have file_url in the provided types.
            // We will append file URL to the message or notes if needed.
            notes: formData.fileUrl ? `Attachment: ${formData.fileUrl}` : null,
            status: 'new',
            source: 'website'
        });

    if (error) {
        console.error('Error submitting inquiry:', error);
        return { error: error.message };
    }

    // Notify admins
    const { notifyAdmins } = await import('./notifications');
    await notifyAdmins(
        'New Inquiry Received',
        `New inquiry from ${formData.name}: ${formData.projectIdea?.substring(0, 50)}...`,
        'info',
        '/admin/inquiries' // Assuming this page exists or will exist
    );

    return { success: true };
}
