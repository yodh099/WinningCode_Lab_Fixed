'use client';

import { useState, useEffect, useRef } from 'react';
import { Send, User, Loader2, AlertCircle, Search } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';

interface Message {
    id: string;
    sender_id: string;
    recipient_id: string;
    content: string;
    created_at: string;
    sender: { full_name: string | null };
    recipient: { full_name: string | null };
}

interface Conversation {
    userId: string;
    userName: string;
    lastMessage: string;
    lastMessageTime: string;
    unreadCount: number;
}

export default function AdminMessages() {
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(true);
    const [loadingMessages, setLoadingMessages] = useState(false);
    const [sending, setSending] = useState(false);
    const [currentAdminId, setCurrentAdminId] = useState<string | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const router = useRouter();

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    useEffect(() => {
        fetchConversations();
    }, []);

    useEffect(() => {
        if (selectedUserId) {
            fetchMessages(selectedUserId);
        }
    }, [selectedUserId]);

    async function fetchConversations() {
        try {
            const supabase = createClient();
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                router.push('/login');
                return;
            }
            setCurrentAdminId(user.id);

            // Fetch messages with sender and recipient profiles
            const { data, error } = await supabase
                .from('messages')
                .select(`
                    *,
                    sender:profiles!sender_id(full_name, email),
                    recipient:profiles!recipient_id(full_name, email)
                `)
                .or(`sender_id.eq.${user.id},recipient_id.eq.${user.id}`)
                .order('created_at', { ascending: false });

            if (error) throw error;

            // Group by other user
            const convMap = new Map<string, Conversation>();

            (data as any[])?.forEach(msg => {
                const otherId = msg.sender_id === user.id ? msg.recipient_id : msg.sender_id;

                // Determine other user's name/email
                let otherName = 'Unknown';
                if (msg.sender_id === user.id) {
                    // I am sender, other is recipient
                    otherName = msg.recipient?.full_name || msg.recipient?.email || 'Unknown';
                } else {
                    // I am recipient, other is sender
                    otherName = msg.sender?.full_name || msg.sender?.email || 'Unknown';
                }

                if (!otherId) return;

                if (!convMap.has(otherId)) {
                    convMap.set(otherId, {
                        userId: otherId,
                        userName: otherName,
                        lastMessage: msg.content,
                        lastMessageTime: msg.created_at,
                        unreadCount: 0 // TODO: Implement read status
                    });
                }
            });

            setConversations(Array.from(convMap.values()));

            // Select first conversation if none selected
            if (!selectedUserId && convMap.size > 0) {
                const firstKey = convMap.keys().next().value;
                if (firstKey) setSelectedUserId(firstKey);
            }

        } catch (error) {
            console.error('Error fetching conversations:', error instanceof Error ? error.message : error);
            console.error('Full error object:', JSON.stringify(error, Object.getOwnPropertyNames(error)));
            console.error('Error details:', { type: typeof error, constructor: error?.constructor?.name });
        } finally {
            setLoading(false);
        }
    }

    async function fetchMessages(otherUserId: string) {
        if (!currentAdminId) return;
        setLoadingMessages(true);
        try {
            const supabase = createClient();
            const { data, error } = await supabase
                .from('messages')
                .select('*')
                .or(`and(sender_id.eq.${currentAdminId},recipient_id.eq.${otherUserId}),and(sender_id.eq.${otherUserId},recipient_id.eq.${currentAdminId})`)
                .order('created_at', { ascending: true });

            if (error) throw error;
            setMessages((data as any[]) || []);
        } catch (error) {
            console.error('Error fetching messages:', error);
        } finally {
            setLoadingMessages(false);
        }
    }

    async function handleSendMessage() {
        if (!newMessage.trim() || !currentAdminId || !selectedUserId) return;

        setSending(true);
        try {
            const supabase = createClient();
            const { error } = await (supabase
                .from('messages') as any)
                .insert({
                    sender_id: currentAdminId,
                    recipient_id: selectedUserId,
                    content: newMessage.trim()
                });

            if (error) throw error;

            setNewMessage('');
            fetchMessages(selectedUserId);
            fetchConversations(); // Update last message in list
        } catch (error) {
            console.error('Error sending message:', error);
            alert('Failed to send message');
        } finally {
            setSending(false);
        }
    }

    const formatTime = (dateString: string) => {
        return new Date(dateString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-[calc(100vh-64px)]">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="flex h-[calc(100vh-64px)] bg-background">
            {/* Sidebar List */}
            <div className="w-1/3 border-r border-border flex flex-col bg-card">
                <div className="p-4 border-b border-border">
                    <h2 className="text-xl font-bold mb-4">Messages</h2>
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <input
                            type="text"
                            placeholder="Search conversations..."
                            className="w-full pl-9 pr-4 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                        />
                    </div>
                </div>
                <div className="flex-1 overflow-y-auto">
                    {conversations.length === 0 ? (
                        <div className="p-8 text-center text-muted-foreground">
                            No conversations yet
                        </div>
                    ) : (
                        conversations.map(conv => (
                            <div
                                key={conv.userId}
                                onClick={() => setSelectedUserId(conv.userId)}
                                className={`p-4 border-b border-border cursor-pointer hover:bg-muted/50 transition-colors ${selectedUserId === conv.userId ? 'bg-muted/50 border-l-4 border-l-primary' : ''}`}
                            >
                                <div className="flex justify-between items-start mb-1">
                                    <span className="font-semibold text-foreground">{conv.userName}</span>
                                    <span className="text-xs text-muted-foreground">{formatTime(conv.lastMessageTime)}</span>
                                </div>
                                <p className="text-sm text-muted-foreground truncate">{conv.lastMessage}</p>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Chat Area */}
            <div className="flex-1 flex flex-col bg-background">
                {selectedUserId ? (
                    <>
                        <div className="p-4 border-b border-border bg-card flex justify-between items-center">
                            <div className="flex items-center gap-3">
                                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                                    <User className="h-5 w-5 text-primary" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-foreground">
                                        {conversations.find(c => c.userId === selectedUserId)?.userName || 'Unknown'}
                                    </h3>
                                    <span className="text-xs text-green-500 flex items-center gap-1">
                                        <span className="h-2 w-2 rounded-full bg-green-500"></span>
                                        Online
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="flex-1 overflow-y-auto p-4 space-y-4">
                            {loadingMessages ? (
                                <div className="flex justify-center p-4">
                                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                                </div>
                            ) : messages.length === 0 ? (
                                <div className="text-center text-muted-foreground mt-10">
                                    No messages in this conversation.
                                </div>
                            ) : (
                                messages.map(msg => {
                                    const isMe = msg.sender_id === currentAdminId;
                                    return (
                                        <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                                            <div className={`max-w-[70%] p-3 rounded-lg ${isMe ? 'bg-primary text-primary-foreground rounded-tr-none' : 'bg-muted text-foreground rounded-tl-none'}`}>
                                                <p className="text-sm">{msg.content}</p>
                                                <p className={`text-[10px] mt-1 text-right ${isMe ? 'text-primary-foreground/70' : 'text-muted-foreground'}`}>
                                                    {formatTime(msg.created_at)}
                                                </p>
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                            <div ref={messagesEndRef} />
                        </div>

                        <div className="p-4 bg-card border-t border-border">
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    value={newMessage}
                                    onChange={(e) => setNewMessage(e.target.value)}
                                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                                    placeholder="Type a message..."
                                    className="flex-1 px-4 py-2 bg-background border border-border rounded-full focus:outline-none focus:ring-2 focus:ring-primary/50"
                                    disabled={sending}
                                />
                                <button
                                    onClick={handleSendMessage}
                                    disabled={sending || !newMessage.trim()}
                                    className="p-2 bg-primary text-primary-foreground rounded-full hover:bg-primary/90 transition-colors disabled:opacity-50"
                                >
                                    {sending ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
                                </button>
                            </div>
                        </div>
                    </>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground">
                        <AlertCircle className="h-12 w-12 mb-4 opacity-20" />
                        <p>Select a conversation to start messaging</p>
                    </div>
                )}
            </div>
        </div>
    );
}
