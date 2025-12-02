'use client';

import { useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';

export default function PresenceBroadcaster() {
    useEffect(() => {
        const supabase = createClient();

        const trackPresence = async () => {
            const { data: { user } } = await supabase.auth.getUser();

            if (!user) return;

            const channel = supabase.channel('online-users', {
                config: {
                    presence: {
                        key: user.id,
                    },
                },
            });

            channel.subscribe(async (status) => {
                if (status === 'SUBSCRIBED') {
                    await channel.track({
                        online_at: new Date().toISOString(),
                        user_id: user.id,
                    });
                }
            });

            return () => {
                supabase.removeChannel(channel);
            };
        };

        trackPresence();
    }, []);

    return null; // This component doesn't render anything
}
