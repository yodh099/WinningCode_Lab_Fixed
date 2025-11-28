'use client';

import { use, useEffect, useState } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import { Loader2, ArrowLeft, Download } from 'lucide-react';
import { Link } from '@/i18n/routing';

export default function ClientInvoiceDetailsPage(props: { params: Promise<{ locale: string; id: string }> }) {
    const params = use(props.params);
    const { id } = params;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [invoice, setInvoice] = useState<any>(null);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [items, setItems] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    useEffect(() => {
        const fetchInvoice = async () => {
            const { data: invoiceData, error: invoiceError } = await supabase
                .from('invoices')
                .select(`
          *,
          client_projects (
            title,
            profiles (email)
          )
        `)
                .eq('id', id)
                .single();

            if (invoiceError) {
                console.error('Error fetching invoice:', invoiceError);
                return;
            }

            const { data: itemsData, error: itemsError } = await supabase
                .from('invoice_items')
                .select('*')
                .eq('invoice_id', id);

            if (itemsError) {
                console.error('Error fetching items:', itemsError);
                return;
            }

            setInvoice(invoiceData);
            setItems(itemsData || []);
            setLoading(false);
        };

        fetchInvoice();
    }, [id, supabase]);

    if (loading) return <div className="flex justify-center p-8"><Loader2 className="animate-spin" /></div>;
    if (!invoice) return <div className="p-8 text-center">Invoice not found</div>;

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
                <Link href="/client/invoices" className="flex items-center gap-2 text-muted-foreground hover:text-foreground">
                    <ArrowLeft className="h-4 w-4" /> Back to My Invoices
                </Link>
                <button
                    className="flex items-center gap-2 px-4 py-2 border rounded-md hover:bg-muted"
                    onClick={() => window.print()}
                >
                    <Download className="h-4 w-4" /> Download PDF
                </button>
            </div>

            <div className="bg-card p-8 rounded-lg border shadow-sm print:shadow-none print:border-0">
                <div className="flex justify-between items-start mb-8">
                    <div>
                        <h1 className="text-3xl font-bold">INVOICE</h1>
                        <p className="text-muted-foreground">#{invoice.id.slice(0, 8).toUpperCase()}</p>
                        <div className={`mt-2 inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${invoice.status === 'paid' ? 'bg-green-100 text-green-800' :
                            invoice.status === 'overdue' ? 'bg-red-100 text-red-800' :
                                invoice.status === 'sent' ? 'bg-blue-100 text-blue-800' :
                                    'bg-gray-100 text-gray-800'
                            }`}>
                            {invoice.status.toUpperCase()}
                        </div>
                    </div>
                    <div className="text-right">
                        <h2 className="font-semibold">Winning Code Lab</h2>
                        <p className="text-sm text-muted-foreground">contact@winningcodelab.com</p>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-8 mb-8">
                    <div>
                        <h3 className="text-sm font-medium text-muted-foreground mb-1">Bill To:</h3>
                        <p className="font-medium">{invoice.client_projects?.profiles?.email}</p>
                        <p className="text-sm text-muted-foreground">Project: {invoice.client_projects?.title}</p>
                    </div>
                    <div className="text-right space-y-1">
                        <div className="flex justify-end gap-4">
                            <span className="text-muted-foreground">Issue Date:</span>
                            <span>{new Date(invoice.issue_date).toLocaleDateString()}</span>
                        </div>
                        {invoice.due_date && (
                            <div className="flex justify-end gap-4">
                                <span className="text-muted-foreground">Due Date:</span>
                                <span>{new Date(invoice.due_date).toLocaleDateString()}</span>
                            </div>
                        )}
                    </div>
                </div>

                <table className="w-full mb-8">
                    <thead>
                        <tr className="border-b">
                            <th className="text-left py-2">Description</th>
                            <th className="text-right py-2">Qty</th>
                            <th className="text-right py-2">Price</th>
                            <th className="text-right py-2">Amount</th>
                        </tr>
                    </thead>
                    <tbody>
                        {items.map((item) => (
                            <tr key={item.id} className="border-b last:border-0">
                                <td className="py-2">{item.description}</td>
                                <td className="text-right py-2">{item.quantity}</td>
                                <td className="text-right py-2">
                                    {new Intl.NumberFormat('en-US', { style: 'currency', currency: invoice.currency }).format(item.unit_price)}
                                </td>
                                <td className="text-right py-2 font-medium">
                                    {new Intl.NumberFormat('en-US', { style: 'currency', currency: invoice.currency }).format(item.amount)}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                <div className="flex justify-end">
                    <div className="w-64 space-y-2">
                        <div className="flex justify-between text-lg font-bold border-t pt-2">
                            <span>Total</span>
                            <span>{new Intl.NumberFormat('en-US', { style: 'currency', currency: invoice.currency }).format(invoice.total_amount)}</span>
                        </div>
                    </div>
                </div>

                {invoice.notes && (
                    <div className="mt-8 pt-8 border-t">
                        <h3 className="text-sm font-medium text-muted-foreground mb-2">Notes:</h3>
                        <p className="text-sm whitespace-pre-wrap">{invoice.notes}</p>
                    </div>
                )}
            </div>
        </div>
    );
}
