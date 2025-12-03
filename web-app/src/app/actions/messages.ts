'use server';

import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { revalidatePath } from 'next/cache';
import { createNotification } from './notifications';

export async function sendAdminMessage(recipientId: string, content: string) {
    const supabase = await createClient();

    // Check if current user is admin
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

    // Use admin client to insert message
    const adminSupabase = createAdminClient();

    const { error } = await (adminSupabase
        .from('messages') as any)
        .insert({
            sender_id: user.id,
            recipient_id: recipientId,
            content: content.trim()
        });

    if (error) {
        console.error('Error sending message:', error);
        return { error: error.message };
    }

    // Create notification for the recipient
    await createNotification(
        recipientId,
        'New Message',
        'You have received a new message from your project manager',
        'message',
        '/client/messages'
    );

    revalidatePath('/[locale]/admin/messages', 'page');
    revalidatePath('/[locale]/client/messages', 'page');

    return { success: true };
}
