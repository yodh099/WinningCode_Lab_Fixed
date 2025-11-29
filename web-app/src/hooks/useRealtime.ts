'use client';

import { useEffect, useRef } from 'react';
import { createClient } from '@/lib/supabase/client';

interface UseRealtimeMessagesProps {
    conversationId: string | null;
    onNewMessage: (message: any) => void;
}

export function useRealtimeMessages({ conversationId, onNewMessage }: UseRealtimeMessagesProps) {
    const channelRef = useRef<any>(null);

    useEffect(() => {
        if (!conversationId) return;

        const supabase = createClient();

        // Create channel for this conversation
        const channel = supabase
            .channel(`messages:${conversationId}`)
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'messages',
                    filter: `conversation_id=eq.${conversationId}`
                },
                (payload) => {
                    console.log('New message received:', payload);
                    onNewMessage(payload.new);
                }
            )
            .subscribe();

        channelRef.current = channel;

        // Cleanup
        return () => {
            if (channelRef.current) {
                supabase.removeChannel(channelRef.current);
            }
        };
    }, [conversationId, onNewMessage]);
}

export function useRealtimeConversations(onConversationUpdate: (conversation: any) => void) {
    const channelRef = useRef<any>(null);

    useEffect(() => {
        const supabase = createClient();

        // Subscribe to conversation updates
        const channel = supabase
            .channel('conversations')
            .on(
                'postgres_changes',
                {
                    event: '*', // all events (INSERT, UPDATE, DELETE)
                    schema: 'public',
                    table: 'conversations'
                },
                (payload) => {
                    console.log('Conversation update:', payload);
                    onConversationUpdate(payload);
                }
            )
            .subscribe();

        channelRef.current = channel;

        // Cleanup
        return () => {
            if (channelRef.current) {
                supabase.removeChannel(channelRef.current);
            }
        };
    }, [onConversationUpdate]);
}
