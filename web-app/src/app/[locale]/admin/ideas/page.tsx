'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { Loader2, Eye, Clock, CheckCircle2, XCircle, AlertCircle } from 'lucide-react';

interface Idea {
    id: string;
    user_id: string;
    title: string;
    description: string;
    budget: string | null;
    deadline: string | null;
    file_url: string | null;
    priority: string;
    status: string;
    created_at: string;
    user_email?: string;
    user_name?: string;
}

export default function AdminIdeasPage() {
    const [ideas, setIdeas] = useState<Idea[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<string>('all');
    const [selectedIdea, setSelectedIdea] = useState<Idea | null>(null);
    const router = useRouter();

    useEffect(() => {
        fetchIdeas();
    }, [filter]);

    async function fetchIdeas() {
        try {
            const supabase = createClient();

            let query = supabase
                .from('ideas')
                .select(`
                    *,
                    profiles:user_id (
                        email,
                        full_name
                    )
                `)
                .order('created_at', { ascending: false });

            if (filter !== 'all') {
                query = query.eq('status', filter);
            }

            const { data, error } = await query;

            if (error) throw error;

            // Map profiles data to idea
            const ideasData = (data as any[]) || [];
            const ideasWithUserInfo = ideasData.map(idea => ({
                ...idea,
                user_email: idea.profiles?.email || 'Unknown',
                user_name: idea.profiles?.full_name || 'Unknown User'
            }));

            setIdeas(ideasWithUserInfo);
        } catch (error) {
            console.error('Error fetching ideas:', error instanceof Error ? error.message : error);
            console.error('Full error object:', JSON.stringify(error, Object.getOwnPropertyNames(error)));
            console.error('Error details:', { type: typeof error, constructor: error?.constructor?.name });
        } finally {
            setLoading(false);
        }
    }

    async function updateStatus(ideaId: string, newStatus: string) {
        try {
            const supabase = createClient();
            const { error } = await (supabase
                .from('ideas') as any)
                .update({ status: newStatus, updated_at: new Date().toISOString() })
                .eq('id', ideaId);

            if (error) throw error;

            // Refresh ideas list
            fetchIdeas();
            if (selectedIdea?.id === ideaId) {
                setSelectedIdea({ ...selectedIdea, status: newStatus });
            }
        } catch (error) {
            console.error('Error updating status:', error);
        }
    }

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'pending':
                return <Clock className="h-5 w-5 text-yellow-500" />;
            case 'in-progress':
                return <AlertCircle className="h-5 w-5 text-blue-500" />;
            case 'completed':
                return <CheckCircle2 className="h-5 w-5 text-green-500" />;
            case 'rejected':
                return <XCircle className="h-5 w-5 text-red-500" />;
            default:
                return <Clock className="h-5 w-5 text-gray-500" />;
        }
    };

    const getStatusBadge = (status: string) => {
        const baseClasses = "px-3 py-1 rounded-full text-xs font-semibold";
        switch (status) {
            case 'pending':
                return `${baseClasses} bg-yellow-100 text-yellow-800`;
            case 'in-progress':
                return `${baseClasses} bg-blue-100 text-blue-800`;
            case 'completed':
                return `${baseClasses} bg-green-100 text-green-800`;
            case 'rejected':
                return `${baseClasses} bg-red-100 text-red-800`;
            default:
                return `${baseClasses} bg-gray-100 text-gray-800`;
        }
    };

    const getPriorityBadge = (priority: string) => {
        const baseClasses = "px-2 py-1 rounded text-xs font-medium";
        switch (priority) {
            case 'urgent':
                return `${baseClasses} bg-red-100 text-red-700`;
            case 'high':
                return `${baseClasses} bg-orange-100 text-orange-700`;
            case 'normal':
                return `${baseClasses} bg-blue-100 text-blue-700`;
            case 'low':
                return `${baseClasses} bg-gray-100 text-gray-700`;
            default:
                return `${baseClasses} bg-gray-100 text-gray-700`;
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-foreground">Client Ideas & Requests</h1>
                    <p className="text-muted-foreground mt-1">Manage submitted project ideas</p>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={() => setFilter('all')}
                        className={`px-4 py-2 rounded-lg font-medium transition-colors ${filter === 'all'
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-card text-foreground hover:bg-accent'
                            }`}
                    >
                        All ({ideas.length})
                    </button>
                    <button
                        onClick={() => setFilter('pending')}
                        className={`px-4 py-2 rounded-lg font-medium transition-colors ${filter === 'pending'
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-card text-foreground hover:bg-accent'
                            }`}
                    >
                        Pending
                    </button>
                    <button
                        onClick={() => setFilter('in-progress')}
                        className={`px-4 py-2 rounded-lg font-medium transition-colors ${filter === 'in-progress'
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-card text-foreground hover:bg-accent'
                            }`}
                    >
                        In Progress
                    </button>
                    <button
                        onClick={() => setFilter('completed')}
                        className={`px-4 py-2 rounded-lg font-medium transition-colors ${filter === 'completed'
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-card text-foreground hover:bg-accent'
                            }`}
                    >
                        Completed
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Ideas List */}
                <div className="lg:col-span-2 space-y-4">
                    {ideas.length === 0 ? (
                        <div className="bg-card border border-border rounded-lg p-12 text-center">
                            <p className="text-muted-foreground">No ideas found</p>
                        </div>
                    ) : (
                        ideas.map((idea) => (
                            <div
                                key={idea.id}
                                onClick={() => setSelectedIdea(idea)}
                                className={`bg-card border rounded-lg p-6 cursor-pointer transition-all hover:shadow-lg ${selectedIdea?.id === idea.id
                                    ? 'border-primary ring-2 ring-primary/20'
                                    : 'border-border'
                                    }`}
                            >
                                <div className="flex items-start justify-between mb-3">
                                    <div className="flex-1">
                                        <h3 className="text-lg font-semibold text-foreground mb-1">{idea.title}</h3>
                                        <p className="text-sm text-muted-foreground">
                                            By {idea.user_name} ({idea.user_email})
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        {getStatusIcon(idea.status)}
                                        <span className={getStatusBadge(idea.status)}>
                                            {idea.status}
                                        </span>
                                    </div>
                                </div>

                                <p className="text-muted-foreground line-clamp-2 mb-3">
                                    {idea.description}
                                </p>

                                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                    <span className={getPriorityBadge(idea.priority)}>
                                        {idea.priority}
                                    </span>
                                    {idea.budget && (
                                        <span>Budget: {idea.budget}</span>
                                    )}
                                    {idea.deadline && (
                                        <span>Deadline: {new Date(idea.deadline).toLocaleDateString()}</span>
                                    )}
                                    <span className="ml-auto">
                                        {new Date(idea.created_at).toLocaleDateString()}
                                    </span>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {/* Idea Details */}
                <div className="lg:col-span-1">
                    {selectedIdea ? (
                        <div className="bg-card border border-border rounded-lg p-6 sticky top-4">
                            <h2 className="text-xl font-bold text-foreground mb-4">Idea Details</h2>

                            <div className="space-y-4">
                                <div>
                                    <label className="text-sm font-medium text-muted-foreground">Title</label>
                                    <p className="text-foreground font-semibold">{selectedIdea.title}</p>
                                </div>

                                <div>
                                    <label className="text-sm font-medium text-muted-foreground">Description</label>
                                    <p className="text-foreground whitespace-pre-wrap">{selectedIdea.description}</p>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-sm font-medium text-muted-foreground">Priority</label>
                                        <p className="text-foreground capitalize">{selectedIdea.priority}</p>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-muted-foreground">Status</label>
                                        <p className="text-foreground capitalize">{selectedIdea.status}</p>
                                    </div>
                                </div>

                                {selectedIdea.budget && (
                                    <div>
                                        <label className="text-sm font-medium text-muted-foreground">Budget</label>
                                        <p className="text-foreground">{selectedIdea.budget}</p>
                                    </div>
                                )}

                                {selectedIdea.deadline && (
                                    <div>
                                        <label className="text-sm font-medium text-muted-foreground">Deadline</label>
                                        <p className="text-foreground">
                                            {new Date(selectedIdea.deadline).toLocaleDateString()}
                                        </p>
                                    </div>
                                )}

                                {selectedIdea.file_url && (
                                    <div>
                                        <label className="text-sm font-medium text-muted-foreground">Attachment</label>
                                        <a
                                            href={selectedIdea.file_url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-primary hover:underline"
                                        >
                                            View File
                                        </a>
                                    </div>
                                )}

                                <div>
                                    <label className="text-sm font-medium text-muted-foreground">Submitted By</label>
                                    <p className="text-foreground">{selectedIdea.user_name}</p>
                                    <p className="text-sm text-muted-foreground">{selectedIdea.user_email}</p>
                                </div>

                                <div>
                                    <label className="text-sm font-medium text-muted-foreground">Submitted On</label>
                                    <p className="text-foreground">
                                        {new Date(selectedIdea.created_at).toLocaleString()}
                                    </p>
                                </div>

                                <div className="pt-4 border-t border-border">
                                    <label className="text-sm font-medium text-muted-foreground mb-2 block">
                                        Update Status
                                    </label>
                                    <div className="space-y-2">
                                        <button
                                            onClick={() => updateStatus(selectedIdea.id, 'pending')}
                                            className="w-full py-2 px-4 rounded-lg bg-yellow-100 text-yellow-800 font-semibold hover:bg-yellow-200 transition-colors"
                                        >
                                            Mark as Pending
                                        </button>
                                        <button
                                            onClick={() => updateStatus(selectedIdea.id, 'in-progress')}
                                            className="w-full py-2 px-4 rounded-lg bg-blue-100 text-blue-800 font-semibold hover:bg-blue-200 transition-colors"
                                        >
                                            Mark as In Progress
                                        </button>
                                        <button
                                            onClick={() => updateStatus(selectedIdea.id, 'completed')}
                                            className="w-full py-2 px-4 rounded-lg bg-green-100 text-green-800 font-semibold hover:bg-green-200 transition-colors"
                                        >
                                            Mark as Completed
                                        </button>
                                        <button
                                            onClick={() => updateStatus(selectedIdea.id, 'rejected')}
                                            className="w-full py-2 px-4 rounded-lg bg-red-100 text-red-800 font-semibold hover:bg-red-200 transition-colors"
                                        >
                                            Mark as Rejected
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="bg-card border border-border rounded-lg p-12 text-center">
                            <Eye className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                            <p className="text-muted-foreground">Select an idea to view details</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
