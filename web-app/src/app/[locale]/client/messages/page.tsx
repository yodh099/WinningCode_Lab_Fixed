'use client';

import { useState, useEffect } from 'react';
import { Send, User, Loader2, AlertCircle } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';

interface Message {
    id: string;
    sender_id: string;
    receiver_id: string;
    content: string;
    created_at: string;
    sender_name?: string;
    is_me: boolean;
}

export default function ClientMessages() {
    const [messages, setMessages] = useState<Message[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);
    const [userId, setUserId] = useState<string | null>(null);
    const router = useRouter();

    useEffect(() => {
        fetchMessages();
    }, []);

    async function fetchMessages() {
        try {
            const supabase = createClient();

            // Get current user
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                router.push('/login');
                return;
            }

            setUserId(user.id);

            // Simple query for production compatibility (no view needed)
            const { data, error } = await supabase
                .from('messages')
                .select('*')
                .or(`sender_id.eq.${user.id},recipient_id.eq.${user.id}`)
                .order('created_at', { ascending: true });

            if (error) {
                console.error('=== FETCH ERROR ===');
                console.error('Error:', error);
                console.error('==================');
                throw error;
            }

            const messagesData = (data as any[]) || [];
            const formattedMessages = messagesData.map(msg => ({
                id: msg.id,
                sender_id: msg.sender_id,
                receiver_id: msg.recipient_id,
                content: msg.content,
                created_at: msg.created_at,
                sender_name: 'User', // Simple fallback
                is_me: msg.sender_id === user.id
            }));

            setMessages(formattedMessages);
        } catch (error) {
            console.error('Error fetching messages:', error instanceof Error ? error.message : error);
        } finally {
            setLoading(false);
        }
    }

    async function handleSendMessage() {
        if (!newMessage.trim() || !userId) return;

        setSending(true);
        try {
            const supabase = createClient();

            // Get admin user (or default receiver)
            // For now, send to the first admin user found
            const { data: adminUsers } = await supabase
                .from('profiles')
                .select('id')
                .eq('role', 'admin')
                .limit(1);

            const receiverId = adminUsers?.[0]?.id;
            if (!receiverId) {
                alert('No admin available to receive messages');
                return;
            }

            // Check for existing conversation
            let conversationId: string | null = null;

            const { data: existingConv } = await (supabase
                .from('conversations') as any)
                .select('id')
                .or(`client_id.eq.${userId},client_id.eq.${receiverId}`)
                .limit(1)
                .single();

            if (existingConv) {
                conversationId = existingConv.id;
            } else {
                // Create new conversation
                const { data: newConv, error: convError } = await (supabase
                    .from('conversations') as any)
                    .insert({
                        client_id: userId,
                        subject: 'General Inquiry',
                        status: 'open'
                    })
                    .select()
                    .single();

                if (convError) {
                    console.error('Error creating conversation:', convError);
                    // Fallback: try sending without conversation_id if creation fails
                } else {
                    conversationId = newConv.id;
                }
            }

            // Send message
            const insertData: any = {
                sender_id: userId,
                recipient_id: receiverId,
                content: newMessage.trim(),
                conversation_id: conversationId
            };

            const { error } = await (supabase
                .from('messages') as any)
                .insert(insertData);

            if (error) {
                console.error('=== MESSAGE SEND ERROR ===');
                console.error('Error code:', error.code);
                console.error('Error message:', error.message);
                console.error('Error details:', error.details);
                console.error('Full error:', JSON.stringify(error, null, 2));
                console.error('Sender ID:', userId);
                console.error('Recipient ID:', receiverId);
                console.error('=========================');
                throw error;
            }

            setNewMessage('');
            fetchMessages(); // Refresh messages
        } catch (error: any) {
            console.error('=== CATCH BLOCK ERROR ===');
            console.error('Error type:', typeof error);
            console.error('Error name:', error?.name);
            console.error('Error message:', error?.message);
            console.error('Full error object:', error);
            console.error('========================');
            alert(`Failed to send message: ${error?.message || 'Unknown error'}`);
        } finally {
            setSending(false);
        }
    }

    const formatTime = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-[calc(100vh-64px)]">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="flex flex-col h-[calc(100vh-64px)] bg-background">
            <div className="bg-card border-b border-border p-4 flex items-center justify-between">
                <div>
                    <h1 className="text-xl font-bold text-foreground">Messages</h1>
                    <p className="text-sm text-muted-foreground">Chat with your project manager</p>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.length > 0 ? (
                    messages.map((msg) => (
                        <div key={msg.id} className={`flex ${msg.is_me ? 'justify-end' : 'justify-start'}`}>
                            <div className={`flex max-w-[70%] ${msg.is_me ? 'flex-row-reverse' : 'flex-row'}`}>
                                <div className={`flex-shrink-0 h-8 w-8 rounded-full flex items-center justify-center ${msg.is_me ? 'bg-primary/10 ml-2' : 'bg-muted mr-2'}`}>
                                    <User className={`h-4 w-4 ${msg.is_me ? 'text-primary' : 'text-muted-foreground'}`} />
                                </div>
                                <div>
                                    <div className={`p-3 rounded-lg ${msg.is_me ? 'bg-primary text-primary-foreground rounded-tr-none' : 'bg-card border border-border text-foreground rounded-tl-none'}`}>
                                        <p className="text-sm">{msg.content}</p>
                                    </div>
                                    <p className={`text-xs mt-1 ${msg.is_me ? 'text-right text-muted-foreground' : 'text-left text-muted-foreground'}`}>
                                        {formatTime(msg.created_at)}
                                    </p>
                                </div>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="flex flex-col items-center justify-center h-full text-center">
                        <AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
                        <p className="text-muted-foreground">No messages yet</p>
                        <p className="text-sm text-muted-foreground mt-1">Start a conversation by sending a message below</p>
                    </div>
                )}
            </div>

            <div className="bg-card border-t border-border p-4">
                <div className="flex items-center space-x-4">
                    <input
                        type="text"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && !sending && handleSendMessage()}
                        placeholder="Type your message..."
                        disabled={sending}
                        className="flex-1 border border-border rounded-full px-4 py-2 bg-background text-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary disabled:opacity-50"
                    />
                    <button
                        onClick={handleSendMessage}
                        disabled={sending || !newMessage.trim()}
                        className="bg-primary text-primary-foreground p-2 rounded-full hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {sending ? (
                            <Loader2 className="h-5 w-5 animate-spin" />
                        ) : (
                            <Send className="h-5 w-5" />
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}
