'use client';

import { useEffect, useState } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import { Link } from '@/i18n/routing';
import { Loader2 } from 'lucide-react';

export default function ClientInvoicesPage() {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [invoices, setInvoices] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    useEffect(() => {
        const fetchInvoices = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            const { data, error } = await supabase
                .from('invoices')
                .select(`
          *,
          client_projects (
            title
          )
        `)
                .eq('client_projects.client_id', user.id) // This filtering is also enforced by RLS
                .neq('status', 'draft') // Clients shouldn't see drafts
                .order('created_at', { ascending: false });

            if (!error && data) {
                // Filter out any where client_projects is null (due to RLS or join)
                const validInvoices = data.filter(inv => inv.client_projects);
                setInvoices(validInvoices);
            }
            setLoading(false);
        };

        fetchInvoices();
    }, [supabase]);

    if (loading) {
        return (
            <div className="flex h-full items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold tracking-tight">My Invoices</h1>
            </div>

            <div className="rounded-md border bg-card">
                <div className="relative w-full overflow-auto">
                    <table className="w-full caption-bottom text-sm">
                        <thead className="[&_tr]:border-b">
                            <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Invoice #</th>
                                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Project</th>
                                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Amount</th>
                                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Status</th>
                                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Date</th>
                                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="[&_tr:last-child]:border-0">
                            {invoices.map((invoice) => (
                                <tr key={invoice.id} className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                                    <td className="p-4 align-middle font-medium">{invoice.id.slice(0, 8).toUpperCase()}</td>
                                    <td className="p-4 align-middle">{invoice.client_projects?.title}</td>
                                    <td className="p-4 align-middle">
                                        {new Intl.NumberFormat('en-US', { style: 'currency', currency: invoice.currency }).format(invoice.total_amount)}
                                    </td>
                                    <td className="p-4 align-middle">
                                        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${invoice.status === 'paid' ? 'bg-green-100 text-green-800' :
                                            invoice.status === 'overdue' ? 'bg-red-100 text-red-800' :
                                                invoice.status === 'sent' ? 'bg-blue-100 text-blue-800' :
                                                    'bg-gray-100 text-gray-800'
                                            }`}>
                                            {invoice.status.toUpperCase()}
                                        </span>
                                    </td>
                                    <td className="p-4 align-middle">{new Date(invoice.issue_date).toLocaleDateString()}</td>
                                    <td className="p-4 align-middle">
                                        <Link href={`/client/invoices/${invoice.id}`} className="text-primary hover:underline">
                                            View Details
                                        </Link>
                                    </td>
                                </tr>
                            ))}
                            {invoices.length === 0 && (
                                <tr>
                                    <td colSpan={6} className="p-4 text-center text-muted-foreground">
                                        No invoices found.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
