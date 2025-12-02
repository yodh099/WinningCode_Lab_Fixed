'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';

interface NotificationBadgeProps {
    type: 'messages' | 'ideas';
    userId?: string; // Required for messages
}

export default function NotificationBadge({ type, userId }: NotificationBadgeProps) {
    const [count, setCount] = useState(0);

    useEffect(() => {
        const supabase = createClient();

        const fetchCount = async () => {
            if (type === 'messages' && userId) {
                const { count } = await supabase
                    .from('messages')
                    .select('*', { count: 'exact', head: true })
                    .eq('recipient_id', userId)
                    .eq('is_read', false);
                setCount(count || 0);
            } else if (type === 'ideas') {
                const { count } = await supabase
                    .from('inquiries')
                    .select('*', { count: 'exact', head: true })
                    .eq('status', 'new');
                setCount(count || 0);
            }
        };

        fetchCount();

        // Subscribe to realtime changes
        const channel = supabase.channel(`badge-${type}`)
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: type === 'messages' ? 'messages' : 'inquiries',
                    filter: type === 'messages' && userId
                        ? `recipient_id=eq.${userId}`
                        : undefined
                },
                () => {
                    fetchCount();
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [type, userId]);

    if (count === 0) return null;

    return (
        <span className="ml-auto bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
            {count > 99 ? '99+' : count}
        </span>
    );
}
