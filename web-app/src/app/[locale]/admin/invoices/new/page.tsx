'use client';

import { use, useEffect, useState } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import { useRouter } from 'next/navigation';
import { Loader2, Plus, Trash2, Save } from 'lucide-react';

interface Project {
    id: string;
    title: string;
    client_projects: {
        profiles: {
            email: string;
        };
    };
}

interface InvoiceItem {
    description: string;
    quantity: number;
    unit_price: number;
}

export default function NewInvoicePage(props: { params: Promise<{ locale: string }> }) {
    const params = use(props.params);
    const { locale } = params;
    const router = useRouter();
    const [projects, setProjects] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    const [projectId, setProjectId] = useState('');
    const [issueDate, setIssueDate] = useState(new Date().toISOString().split('T')[0]);
    const [dueDate, setDueDate] = useState('');
    const [currency, setCurrency] = useState('USD');
    const [notes, setNotes] = useState('');
    const [items, setItems] = useState<InvoiceItem[]>([{ description: '', quantity: 1, unit_price: 0 }]);

    const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    useEffect(() => {
        const fetchProjects = async () => {
            const { data } = await supabase
                .from('client_projects')
                .select('id, title, profiles(email)')
                .order('created_at', { ascending: false });

            if (data) setProjects(data);
            setLoading(false);
        };
        fetchProjects();
    }, []);

    const handleAddItem = () => {
        setItems([...items, { description: '', quantity: 1, unit_price: 0 }]);
    };

    const handleRemoveItem = (index: number) => {
        setItems(items.filter((_, i) => i !== index));
    };

    const handleItemChange = (index: number, field: keyof InvoiceItem, value: string | number) => {
        const newItems = [...items];
        newItems[index] = { ...newItems[index], [field]: value };
        setItems(newItems);
    };

    const calculateTotal = () => {
        return items.reduce((sum, item) => sum + (item.quantity * item.unit_price), 0);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);

        try {
            // 1. Create Invoice
            const { data: invoice, error: invoiceError } = await supabase
                .from('invoices')
                .insert({
                    project_id: projectId,
                    issue_date: issueDate,
                    due_date: dueDate || null,
                    currency,
                    total_amount: calculateTotal(),
                    notes,
                    status: 'draft'
                })
                .select()
                .single();

            if (invoiceError) throw invoiceError;

            // 2. Create Invoice Items
            const invoiceItems = items.map(item => ({
                invoice_id: invoice.id,
                description: item.description,
                quantity: item.quantity,
                unit_price: item.unit_price
            }));

            const { error: itemsError } = await supabase
                .from('invoice_items')
                .insert(invoiceItems);

            if (itemsError) throw itemsError;

            router.push(`/${locale}/admin/invoices`);
            router.refresh();
        } catch (error) {
            console.error('Error creating invoice:', error);
            alert('Failed to create invoice');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return <div className="flex justify-center p-8"><Loader2 className="animate-spin" /></div>;

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <h1 className="text-2xl font-bold">Create New Invoice</h1>

            <form onSubmit={handleSubmit} className="space-y-8">
                {/* Invoice Details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-card p-6 rounded-lg border">
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Project</label>
                        <select
                            required
                            className="w-full p-2 rounded-md border bg-background"
                            value={projectId}
                            onChange={(e) => setProjectId(e.target.value)}
                        >
                            <option value="">Select a project...</option>
                            {projects.map((p) => (
                                <option key={p.id} value={p.id}>
                                    {p.title} ({p.profiles?.email})
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium">Currency</label>
                        <select
                            className="w-full p-2 rounded-md border bg-background"
                            value={currency}
                            onChange={(e) => setCurrency(e.target.value)}
                        >
                            <option value="USD">USD ($)</option>
                            <option value="HTG">HTG (G)</option>
                            <option value="EUR">EUR (€)</option>
                        </select>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium">Issue Date</label>
                        <input
                            type="date"
                            required
                            className="w-full p-2 rounded-md border bg-background"
                            value={issueDate}
                            onChange={(e) => setIssueDate(e.target.value)}
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium">Due Date</label>
                        <input
                            type="date"
                            className="w-full p-2 rounded-md border bg-background"
                            value={dueDate}
                            onChange={(e) => setDueDate(e.target.value)}
                        />
                    </div>
                </div>

                {/* Line Items */}
                <div className="bg-card p-6 rounded-lg border space-y-4">
                    <h2 className="text-lg font-semibold">Line Items</h2>

                    <div className="space-y-4">
                        {items.map((item, index) => (
                            <div key={index} className="flex gap-4 items-start">
                                <div className="flex-1">
                                    <input
                                        placeholder="Description"
                                        required
                                        className="w-full p-2 rounded-md border bg-background"
                                        value={item.description}
                                        onChange={(e) => handleItemChange(index, 'description', e.target.value)}
                                    />
                                </div>
                                <div className="w-24">
                                    <input
                                        type="number"
                                        min="0"
                                        step="0.01"
                                        placeholder="Qty"
                                        required
                                        className="w-full p-2 rounded-md border bg-background"
                                        value={item.quantity}
                                        onChange={(e) => handleItemChange(index, 'quantity', parseFloat(e.target.value))}
                                    />
                                </div>
                                <div className="w-32">
                                    <input
                                        type="number"
                                        min="0"
                                        step="0.01"
                                        placeholder="Price"
                                        required
                                        className="w-full p-2 rounded-md border bg-background"
                                        value={item.unit_price}
                                        onChange={(e) => handleItemChange(index, 'unit_price', parseFloat(e.target.value))}
                                    />
                                </div>
                                <div className="w-32 py-2 text-right font-medium">
                                    {(item.quantity * item.unit_price).toFixed(2)}
                                </div>
                                <button
                                    type="button"
                                    onClick={() => handleRemoveItem(index)}
                                    className="p-2 text-destructive hover:bg-destructive/10 rounded-md"
                                >
                                    <Trash2 className="h-4 w-4" />
                                </button>
                            </div>
                        ))}
                    </div>

                    <button
                        type="button"
                        onClick={handleAddItem}
                        className="flex items-center gap-2 text-sm text-primary hover:underline"
                    >
                        <Plus className="h-4 w-4" /> Add Item
                    </button>

                    <div className="pt-4 border-t flex justify-end">
                        <div className="text-xl font-bold">
                            Total: {new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(calculateTotal())}
                        </div>
                    </div>
                </div>

                {/* Notes */}
                <div className="bg-card p-6 rounded-lg border space-y-2">
                    <label className="text-sm font-medium">Notes</label>
                    <textarea
                        className="w-full p-2 rounded-md border bg-background min-h-[100px]"
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        placeholder="Payment instructions, terms, etc."
                    />
                </div>

                <div className="flex justify-end gap-4">
                    <button
                        type="button"
                        onClick={() => router.back()}
                        className="px-4 py-2 text-sm font-medium hover:bg-muted rounded-md"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={submitting}
                        className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 disabled:opacity-50"
                    >
                        {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                        Create Invoice
                    </button>
                </div>
            </form>
        </div>
    );
}
