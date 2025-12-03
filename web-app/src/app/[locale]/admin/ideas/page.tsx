'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { Loader2, Eye, Clock, CheckCircle2, XCircle, AlertCircle } from 'lucide-react';

interface Inquiry {
    id: string;
    full_name: string;
    email: string;
    phone: string | null;
    company_name: string | null;
    project_idea: string;
    project_type: string | null;
    budget: string | null;
    timeline: string | null;
    message: string | null;
    file_url: string | null;
    priority: string;
    status: string;
    created_at: string;
    source: string;
}

export default function AdminIdeasPage() {
    const [inquiries, setInquiries] = useState<Inquiry[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<string>('all');
    const [selectedInquiry, setSelectedInquiry] = useState<Inquiry | null>(null);
    const router = useRouter();

    useEffect(() => {
        fetchInquiries();

        // Real-time subscription
        const supabase = createClient();
        const channel = supabase
            .channel('inquiries-realtime')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'inquiries' }, () => {
                fetchInquiries();
            })
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [filter]);

    async function fetchInquiries() {
        try {
            const supabase = createClient();

            let query = supabase
                .from('inquiries')
                .select('*')
                .order('created_at', { ascending: false });

            if (filter !== 'all') {
                query = query.eq('status', filter);
            }

            const { data, error } = await query;

            if (error) throw error;

            setInquiries((data as any[]) || []);
        } catch (error) {
            console.error('Error fetching inquiries:', error);
        } finally {
            setLoading(false);
        }
    }

    async function updateStatus(inquiryId: string, newStatus: string) {
        try {
            const supabase = createClient();
            const { error } = await (supabase
                .from('inquiries') as any)
                .update({ status: newStatus, updated_at: new Date().toISOString() })
                .eq('id', inquiryId);

            if (error) throw error;

            // Refresh list
            fetchInquiries();
            if (selectedInquiry?.id === inquiryId) {
                setSelectedInquiry({ ...selectedInquiry, status: newStatus });
            }
        } catch (error) {
            console.error('Error updating status:', error);
        }
    }

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'new':
                return <AlertCircle className="h-5 w-5 text-blue-500" />;
            case 'reviewing':
                return <Clock className="h-5 w-5 text-yellow-500" />;
            case 'contacted':
                return <CheckCircle2 className="h-5 w-5 text-purple-500" />;
            case 'responded':
                return <CheckCircle2 className="h-5 w-5 text-green-500" />;
            case 'converted':
                return <CheckCircle2 className="h-5 w-5 text-green-600" />;
            case 'closed':
            case 'spam':
                return <XCircle className="h-5 w-5 text-red-500" />;
            default:
                return <Clock className="h-5 w-5 text-gray-500" />;
        }
    };

    const getStatusBadge = (status: string) => {
        const baseClasses = "px-3 py-1 rounded-full text-xs font-semibold capitalize";
        switch (status) {
            case 'new':
                return `${baseClasses} bg-blue-100 text-blue-800`;
            case 'reviewing':
                return `${baseClasses} bg-yellow-100 text-yellow-800`;
            case 'contacted':
                return `${baseClasses} bg-purple-100 text-purple-800`;
            case 'responded':
                return `${baseClasses} bg-green-100 text-green-800`;
            case 'converted':
                return `${baseClasses} bg-green-200 text-green-900`;
            case 'closed':
            case 'spam':
                return `${baseClasses} bg-red-100 text-red-800`;
            default:
                return `${baseClasses} bg-gray-100 text-gray-800`;
        }
    };

    const getPriorityBadge = (priority: string) => {
        const baseClasses = "px-2 py-1 rounded text-xs font-medium capitalize";
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
                    <p className="text-muted-foreground mt-1">Manage submitted project ideas and inquiries</p>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={() => setFilter('all')}
                        className={`px-4 py-2 rounded-lg font-medium transition-colors ${filter === 'all'
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-card text-foreground hover:bg-accent'
                            }`}
                    >
                        All ({inquiries.length})
                    </button>
                    <button
                        onClick={() => setFilter('new')}
                        className={`px-4 py-2 rounded-lg font-medium transition-colors ${filter === 'new'
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-card text-foreground hover:bg-accent'
                            }`}
                    >
                        New
                    </button>
                    <button
                        onClick={() => setFilter('reviewing')}
                        className={`px-4 py-2 rounded-lg font-medium transition-colors ${filter === 'reviewing'
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-card text-foreground hover:bg-accent'
                            }`}
                    >
                        Reviewing
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Inquiries List */}
                <div className="lg:col-span-2 space-y-4">
                    {inquiries.length === 0 ? (
                        <div className="bg-card border border-border rounded-lg p-12 text-center">
                            <p className="text-muted-foreground">No inquiries found</p>
                        </div>
                    ) : (
                        inquiries.map((inquiry) => (
                            <div
                                key={inquiry.id}
                                onClick={() => setSelectedInquiry(inquiry)}
                                className={`bg-card border rounded-lg p-6 cursor-pointer transition-all hover:shadow-lg ${selectedInquiry?.id === inquiry.id
                                    ? 'border-primary ring-2 ring-primary/20'
                                    : 'border-border'
                                    }`}
                            >
                                <div className="flex items-start justify-between mb-3">
                                    <div className="flex-1">
                                        <h3 className="text-lg font-semibold text-foreground mb-1">
                                            {inquiry.project_type ? `${inquiry.project_type} Project` : 'New Inquiry'}
                                        </h3>
                                        <p className="text-sm text-muted-foreground">
                                            By {inquiry.full_name || inquiry.email}
                                        </p>
                                        {inquiry.company_name && (
                                            <p className="text-xs text-muted-foreground font-medium">
                                                {inquiry.company_name}
                                            </p>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-2">
                                        {getStatusIcon(inquiry.status)}
                                        <span className={getStatusBadge(inquiry.status)}>
                                            {inquiry.status}
                                        </span>
                                    </div>
                                </div>

                                <p className="text-muted-foreground line-clamp-2 mb-3">
                                    {inquiry.project_idea}
                                </p>

                                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                    <span className={getPriorityBadge(inquiry.priority)}>
                                        {inquiry.priority}
                                    </span>
                                    {inquiry.budget && (
                                        <span>Budget: {inquiry.budget}</span>
                                    )}
                                    <span className="ml-auto">
                                        {new Date(inquiry.created_at).toLocaleDateString()}
                                    </span>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {/* Inquiry Details */}
                <div className="lg:col-span-1">
                    {selectedInquiry ? (
                        <div className="bg-card border border-border rounded-lg p-6 sticky top-4">
                            <h2 className="text-xl font-bold text-foreground mb-4">Inquiry Details</h2>

                            <div className="space-y-4">
                                <div>
                                    <label className="text-sm font-medium text-muted-foreground">Project Idea</label>
                                    <p className="text-foreground whitespace-pre-wrap">{selectedInquiry.project_idea}</p>
                                </div>

                                {selectedInquiry.message && (
                                    <div>
                                        <label className="text-sm font-medium text-muted-foreground">Additional Message</label>
                                        <p className="text-foreground whitespace-pre-wrap">{selectedInquiry.message}</p>
                                    </div>
                                )}

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-sm font-medium text-muted-foreground">Priority</label>
                                        <p className="text-foreground capitalize">{selectedInquiry.priority}</p>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-muted-foreground">Status</label>
                                        <p className="text-foreground capitalize">{selectedInquiry.status}</p>
                                    </div>
                                </div>

                                {selectedInquiry.budget && (
                                    <div>
                                        <label className="text-sm font-medium text-muted-foreground">Budget</label>
                                        <p className="text-foreground">{selectedInquiry.budget}</p>
                                    </div>
                                )}

                                {selectedInquiry.timeline && (
                                    <div>
                                        <label className="text-sm font-medium text-muted-foreground">Timeline</label>
                                        <p className="text-foreground">{selectedInquiry.timeline}</p>
                                    </div>
                                )}

                                {selectedInquiry.file_url && (
                                    <div>
                                        <label className="text-sm font-medium text-muted-foreground">Attachment</label>
                                        <a
                                            href={selectedInquiry.file_url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-primary hover:underline"
                                        >
                                            View File
                                        </a>
                                    </div>
                                )}

                                <div className="pt-4 border-t border-border">
                                    <h3 className="font-semibold mb-2">Contact Info</h3>
                                    <div>
                                        <label className="text-sm font-medium text-muted-foreground">Name</label>
                                        <p className="text-foreground">{selectedInquiry.full_name}</p>
                                    </div>
                                    <div className="mt-2">
                                        <label className="text-sm font-medium text-muted-foreground">Email</label>
                                        <p className="text-foreground">{selectedInquiry.email}</p>
                                    </div>
                                    {selectedInquiry.phone && (
                                        <div className="mt-2">
                                            <label className="text-sm font-medium text-muted-foreground">Phone</label>
                                            <p className="text-foreground">{selectedInquiry.phone}</p>
                                        </div>
                                    )}
                                    {selectedInquiry.company_name && (
                                        <div className="mt-2">
                                            <label className="text-sm font-medium text-muted-foreground">Company</label>
                                            <p className="text-foreground">{selectedInquiry.company_name}</p>
                                        </div>
                                    )}
                                </div>

                                <div className="pt-4 border-t border-border">
                                    <label className="text-sm font-medium text-muted-foreground mb-2 block">
                                        Update Status
                                    </label>
                                    <div className="space-y-2">
                                        <button
                                            onClick={() => updateStatus(selectedInquiry.id, 'reviewing')}
                                            className="w-full py-2 px-4 rounded-lg bg-yellow-100 text-yellow-800 font-semibold hover:bg-yellow-200 transition-colors"
                                        >
                                            Mark as Reviewing
                                        </button>
                                        <button
                                            onClick={() => updateStatus(selectedInquiry.id, 'contacted')}
                                            className="w-full py-2 px-4 rounded-lg bg-purple-100 text-purple-800 font-semibold hover:bg-purple-200 transition-colors"
                                        >
                                            Mark as Contacted
                                        </button>
                                        <button
                                            onClick={() => updateStatus(selectedInquiry.id, 'converted')}
                                            className="w-full py-2 px-4 rounded-lg bg-green-100 text-green-800 font-semibold hover:bg-green-200 transition-colors"
                                        >
                                            Convert to Project
                                        </button>
                                        <button
                                            onClick={() => updateStatus(selectedInquiry.id, 'closed')}
                                            className="w-full py-2 px-4 rounded-lg bg-gray-100 text-gray-800 font-semibold hover:bg-gray-200 transition-colors"
                                        >
                                            Close Inquiry
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="bg-card border border-border rounded-lg p-12 text-center">
                            <Eye className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                            <p className="text-muted-foreground">Select an inquiry to view details</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
