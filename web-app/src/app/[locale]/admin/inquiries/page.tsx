import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { AlertCircle, Mail, Building, Calendar, DollarSign, Clock, FileText } from 'lucide-react';
import Link from 'next/link';

export default async function AdminInquiriesPage() {
    const supabase = await createClient();

    // Check auth
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) redirect('/login');

    // Check admin role
    const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

    if (profile?.role !== 'admin') redirect('/not-authorized');

    // Fetch all inquiries
    const { data: inquiries, error } = await supabase
        .from('inquiries')
        .select('*')
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Error fetching inquiries:', error);
    }

    // Count by status
    const statusCounts = inquiries?.reduce((acc, inq) => {
        acc[inq.status] = (acc[inq.status] || 0) + 1;
        return acc;
    }, {} as Record<string, number>) || {};

    return (
        <div className="p-4 md:p-8 max-w-7xl mx-auto">
            {/* Header */}
            <div className="mb-8">
                <Link href="/admin/dashboard" className="text-sm text-primary hover:underline mb-2 inline-block">
                    ← Back to Dashboard
                </Link>
                <h1 className="text-3xl font-bold">Manage Inquiries</h1>
                <p className="text-muted-foreground mt-2">View and manage all contact form submissions</p>
            </div>

            {/* Status Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-8">
                {Object.entries(statusCounts).map(([status, count]) => (
                    <div key={status} className="bg-card p-4 rounded-lg border border-border">
                        <p className="text-sm text-muted-foreground capitalize">{status}</p>
                        <p className="text-2xl font-bold mt-1">{count}</p>
                    </div>
                ))}
            </div>

            {/* Inquiries List */}
            <div className="bg-card rounded-xl shadow-sm border border-border overflow-hidden">
                <div className="p-6 border-b border-border">
                    <h2 className="text-lg font-semibold">All Inquiries</h2>
                </div>

                {inquiries && inquiries.length > 0 ? (
                    <div className="divide-y divide-border">
                        {inquiries.map((inquiry) => (
                            <div key={inquiry.id} className="p-6 hover:bg-muted/30 transition-colors">
                                <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                                    {/* Main Info */}
                                    <div className="flex-1 space-y-3">
                                        <div className="flex items-start justify-between">
                                            <div>
                                                <h3 className="font-semibold text-lg">{inquiry.name}</h3>
                                                <div className="flex flex-wrap items-center gap-3 mt-1 text-sm text-muted-foreground">
                                                    <span className="flex items-center gap-1">
                                                        <Mail className="h-4 w-4" />
                                                        {inquiry.email}
                                                    </span>
                                                    {inquiry.phone && (
                                                        <span>{inquiry.phone}</span>
                                                    )}
                                                    {inquiry.company_name && (
                                                        <span className="flex items-center gap-1">
                                                            <Building className="h-4 w-4" />
                                                            {inquiry.company_name}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                            <span className={`px-3 py-1 text-xs font-semibold rounded-full whitespace-nowrap ${inquiry.status === 'new' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' :
                                                    inquiry.status === 'reviewing' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' :
                                                        inquiry.status === 'contacted' ? 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200' :
                                                            inquiry.status === 'responded' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                                                                inquiry.status === 'converted' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200' :
                                                                    inquiry.status === 'spam' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' :
                                                                        'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200'
                                                }`}>
                                                {inquiry.status}
                                            </span>
                                        </div>

                                        <p className="text-sm">{inquiry.project_idea}</p>

                                        {inquiry.message && (
                                            <p className="text-sm text-muted-foreground italic">{inquiry.message}</p>
                                        )}

                                        <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
                                            {inquiry.project_type && (
                                                <span className="capitalize">{inquiry.project_type}</span>
                                            )}
                                            {inquiry.budget && (
                                                <span className="flex items-center gap-1">
                                                    <DollarSign className="h-3 w-3" />
                                                    {inquiry.budget}
                                                </span>
                                            )}
                                            {inquiry.timeline && (
                                                <span className="flex items-center gap-1">
                                                    <Clock className="h-3 w-3" />
                                                    {inquiry.timeline}
                                                </span>
                                            )}
                                            <span className="flex items-center gap-1">
                                                <Calendar className="h-3 w-3" />
                                                {new Date(inquiry.created_at).toLocaleString()}
                                            </span>
                                        </div>

                                        {inquiry.file_url && (
                                            <div className="flex items-center gap-2 text-sm">
                                                <FileText className="h-4 w-4 text-primary" />
                                                <a
                                                    href={inquiry.file_url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="text-primary hover:underline"
                                                >
                                                    {inquiry.file_name || 'View Attachment'}
                                                </a>
                                            </div>
                                        )}
                                    </div>

                                    {/* Actions - These would need client components with server actions */}
                                    <div className="flex lg:flex-col gap-2">
                                        <span className="text-xs text-muted-foreground text-right">
                                            Priority: {inquiry.priority || 'normal'}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="p-12 text-center">
                        <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                        <p className="text-muted-foreground">No inquiries found</p>
                        <p className="text-sm text-muted-foreground mt-1">New inquiries will appear here</p>
                    </div>
                )}
            </div>
        </div>
    );
}
