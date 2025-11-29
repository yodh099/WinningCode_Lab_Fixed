'use client';

import { useState, useEffect } from 'react';
import { MessageSquare, Clock, User, Circle } from 'lucide-react';

interface Conversation {
    id: string;
    subject: string;
    status: 'open' | 'in_progress' | 'closed';
    last_message_at: string;
    client: {
        full_name: string;
        email: string;
        company_name: string;
    };
    admin: {
        full_name: string;
    } | null;
}

interface ConversationListProps {
    onSelectConversation: (conversationId: string) => void;
    selectedConversationId?: string;
}

export default function ConversationList({ onSelectConversation, selectedConversationId }: ConversationListProps) {
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<string>('all');

    useEffect(() => {
        fetchConversations();
    }, [filter]);

    async function fetchConversations() {
        try {
            const url = filter !== 'all'
                ? `/api/conversations?status=${filter}`
                : '/api/conversations';

            const response = await fetch(url);
            const data = await response.json();

            if (response.ok) {
                setConversations(data.conversations || []);
            }
        } catch (error) {
            console.error('Error fetching conversations:', error);
        } finally {
            setLoading(false);
        }
    }

    function getStatusColor(status: string) {
        switch (status) {
            case 'open': return 'text-green-500';
            case 'in_progress': return 'text-yellow-500';
            case 'closed': return 'text-gray-500';
            default: return 'text-gray-500';
        }
    }

    function formatTime(dateString: string) {
        const date = new Date(dateString);
        const now = new Date();
        const diffHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));

        if (diffHours < 1) return 'Just now';
        if (diffHours < 24) return `${diffHours}h ago`;
        return date.toLocaleDateString();
    }

    if (loading) {
        return <div className="p-4 text-muted-foreground">Loading conversations...</div>;
    }

    return (
        <div className="flex flex-col h-full">
            {/* Filter tabs */}
            <div className="flex border-b border-border bg-card">
                {['all', 'open', 'in_progress', 'closed'].map((statusFilter) => (
                    <button
                        key={statusFilter}
                        onClick={() => setFilter(statusFilter)}
                        className={`px-4 py-3 text-sm font-medium transition-colors ${filter === statusFilter
                                ? 'text-primary border-b-2 border-primary'
                                : 'text-muted-foreground hover:text-foreground'
                            }`}
                    >
                        {statusFilter === 'all' ? 'All' : statusFilter.replace('_', ' ')}
                    </button>
                ))}
            </div>

            {/* Conversations list */}
            <div className="flex-1 overflow-y-auto">
                {conversations.length === 0 ? (
                    <div className="p-8 text-center text-muted-foreground">
                        <MessageSquare className="h-12 w-12 mx-auto mb-2 opacity-50" />
                        <p>No conversations yet</p>
                    </div>
                ) : (
                    conversations.map((conv) => (
                        <button
                            key={conv.id}
                            onClick={() => onSelectConversation(conv.id)}
                            className={`w-full text-left p-4 border-b border-border hover:bg-muted/50 transition-colors ${selectedConversationId === conv.id ? 'bg-muted' : ''
                                }`}
                        >
                            <div className="flex items-start gap-3">
                                <div className="flex-shrink-0 h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                                    <User className="h-5 w-5 text-primary" />
                                </div>

                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between mb-1">
                                        <h3 className="font-semibold text-foreground truncate">
                                            {conv.client.full_name || conv.client.email}
                                        </h3>
                                        <span className="text-xs text-muted-foreground flex-shrink-0 ml-2">
                                            <Clock className="inline h-3 w-3 mr-1" />
                                            {formatTime(conv.last_message_at)}
                                        </span>
                                    </div>

                                    <p className="text-sm text-foreground/80 truncate mb-1">
                                        {conv.subject}
                                    </p>

                                    {conv.client.company_name && (
                                        <p className="text-xs text-muted-foreground truncate">
                                            {conv.client.company_name}
                                        </p>
                                    )}

                                    <div className="flex items-center gap-2 mt-2">
                                        <Circle className={`h-2 w-2 fill-current ${getStatusColor(conv.status)}`} />
                                        <span className="text-xs text-muted-foreground capitalize">
                                            {conv.status.replace('_', ' ')}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </button>
                    ))
                )}
            </div>
        </div>
    );
}
