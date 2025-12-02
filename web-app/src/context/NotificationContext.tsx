'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';

interface NotificationContextType {
    unreadMessages: number;
    newIdeas: number;
    totalNotifications: number;
    refreshCounts: () => Promise<void>;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function NotificationProvider({ children }: { children: React.ReactNode }) {
    const [unreadMessages, setUnreadMessages] = useState(0);
    const [newIdeas, setNewIdeas] = useState(0);
    const [userId, setUserId] = useState<string | null>(null);

    const supabase = createClient();

    const refreshCounts = async () => {
        // Fetch unread messages count
        if (userId) {
            const { count: msgCount } = await supabase
                .from('messages')
                .select('*', { count: 'exact', head: true })
                .eq('recipient_id', userId)
                .eq('is_read', false);
            setUnreadMessages(msgCount || 0);
        }

        // Fetch new ideas count
        const { count: ideaCount } = await supabase
            .from('inquiries')
            .select('*', { count: 'exact', head: true })
            .eq('status', 'new');
        setNewIdeas(ideaCount || 0);
    };

    useEffect(() => {
        const getUser = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                setUserId(user.id);
            }
        };
        getUser();
    }, []);

    useEffect(() => {
        if (!userId) return;

        refreshCounts();

        // Subscribe to messages changes
        const messageChannel = supabase.channel('realtime-messages')
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'messages',
                    filter: `recipient_id=eq.${userId}`
                },
                () => {
                    refreshCounts();
                }
            )
            .subscribe();

        // Subscribe to inquiries changes
        const ideaChannel = supabase.channel('realtime-ideas')
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'inquiries'
                },
                () => {
                    refreshCounts();
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(messageChannel);
            supabase.removeChannel(ideaChannel);
        };
    }, [userId]);

    return (
        <NotificationContext.Provider value={{
            unreadMessages,
            newIdeas,
            totalNotifications: unreadMessages + newIdeas,
            refreshCounts
        }}>
            {children}
        </NotificationContext.Provider>
    );
}

export function useNotifications() {
    const context = useContext(NotificationContext);
    if (context === undefined) {
        throw new Error('useNotifications must be used within a NotificationProvider');
    }
    return context;
}
