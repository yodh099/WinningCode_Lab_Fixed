'use server';

import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';

export async function fetchNotifications() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return { notifications: [] };

    const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(20);

    if (error) {
        console.error('Error fetching notifications:', error);
        return { notifications: [] };
    }

    return { notifications: data };
}

export async function markNotificationAsRead(notificationId: string) {
    const supabase = await createClient();
    const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('id', notificationId);

    if (error) return { error: error.message };
    return { success: true };
}

export async function createNotification(userId: string, title: string, message: string, type: string = 'info', link?: string) {
    const supabase = createAdminClient();
    const { error } = await supabase
        .from('notifications')
        .insert({
            user_id: userId,
            title,
            message,
            type,
            link
        });

    if (error) {
        console.error('Error creating notification:', error);
        return { error: error.message };
    }
    return { success: true };
}
