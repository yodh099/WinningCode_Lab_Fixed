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

export async function notifyAdmins(title: string, message: string, type: string = 'info', link?: string) {
    const supabase = createAdminClient();

    // Fetch all users with role 'admin' or 'super_admin'
    // Assuming there's a 'profiles' table or similar with roles, OR checking metadata
    // For now, let's assume we notify a specific set of admins or fetch from profiles

    // Option 1: Fetch from profiles (if role is in profiles)
    const { data: admins, error } = await (supabase
        .from('profiles') as any)
        .select('id')
        .in('role', ['admin', 'super_admin']);

    if (error) {
        console.error('Error fetching admins for notification:', error);
        return { error: error.message };
    }

    if (!admins || admins.length === 0) {
        console.warn('No admins found to notify.');
        return { success: true }; // Not an error, just no one to notify
    }

    // Create notifications for each admin
    const notifications = admins.map((admin: any) => ({
        user_id: admin.id,
        title,
        message,
        type,
        link
    }));

    const { error: insertError } = await (supabase
        .from('notifications') as any)
        .insert(notifications);

    if (insertError) {
        console.error('Error creating admin notifications:', insertError);
        return { error: insertError.message };
    }

    return { success: true };
}
