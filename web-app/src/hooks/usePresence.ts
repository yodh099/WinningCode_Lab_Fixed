import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';

export function usePresence(userId: string | null) {
    const [onlineUsers, setOnlineUsers] = useState<Set<string>>(new Set());

    useEffect(() => {
        if (!userId) return;

        const supabase = createClient();
        const channel = supabase.channel('online-users', {
            config: {
                presence: {
                    key: userId,
                },
            },
        });

        channel
            .on('presence', { event: 'sync' }, () => {
                const newState = channel.presenceState();
                const onlineIds = new Set(Object.keys(newState));
                setOnlineUsers(onlineIds);
            })
            .on('presence', { event: 'join' }, ({ key, newPresences }) => {
                setOnlineUsers((prev) => {
                    const newSet = new Set(prev);
                    newSet.add(key);
                    return newSet;
                });
            })
            .on('presence', { event: 'leave' }, ({ key, leftPresences }) => {
                setOnlineUsers((prev) => {
                    const newSet = new Set(prev);
                    newSet.delete(key);
                    return newSet;
                });
            })
            .subscribe(async (status) => {
                if (status === 'SUBSCRIBED') {
                    await channel.track({
                        online_at: new Date().toISOString(),
                        user_id: userId,
                    });
                }
            });

        return () => {
            supabase.removeChannel(channel);
        };
    }, [userId]);

    return onlineUsers;
}
