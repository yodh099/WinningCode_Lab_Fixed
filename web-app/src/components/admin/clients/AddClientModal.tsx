'use client';

import { useState } from 'react';
import { X, Loader2 } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

interface AddClientModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

export default function AddClientModal({ isOpen, onClose, onSuccess }: AddClientModalProps) {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        companyName: '',
        phone: ''
    });

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            // In a real app, this would call a Server Action to create the auth user
            // For now, we'll simulate it or just show an alert that backend is needed
            // But since the user wants "real functions", we can try to insert into profiles if we had an ID.
            // Since we can't create a user client-side without logging out, we will show a message.

            // However, if we assume the user exists or we just want to create a profile record (if DB allows):
            // The DB requires 'id' which is usually auth.uid().

            // Let's check if we can use an Edge Function? 
            // For this task, I will implement the UI and a "Feature not available" alert 
            // explaining that it requires a backend admin environment.
            // OR I can try to use a "invite" mechanism if Supabase is configured.

            const supabase = createClient();

            // Check if user already exists in profiles (by email lookup if possible? No, email is in auth)

            // Call Edge Function to create user
            const { data, error } = await supabase.functions.invoke('create-user', {
                body: {
                    email: formData.email,
                    password: formData.password,
                    full_name: formData.full_name,
                    role: 'client',
                    phone: formData.phone,
                    company_name: formData.company_name
                }
            });

            if (error) throw error;

            onSuccess();
            onClose();
            setFormData({ fullName: '', email: '', companyName: '', phone: '' });

        } catch (error) {
            console.error('Error creating client:', error);
            alert('Failed to create client. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="bg-card w-full max-w-md rounded-xl shadow-lg border border-border p-6 animate-in fade-in zoom-in duration-200">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold text-foreground">Add New Client</h2>
                    <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
                        <X className="h-5 w-5" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-foreground mb-1">Full Name</label>
                        <input
                            type="text"
                            required
                            value={formData.fullName}
                            onChange={e => setFormData({ ...formData, fullName: e.target.value })}
                            className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                            placeholder="John Doe"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-foreground mb-1">Email</label>
                        <input
                            type="email"
                            required
                            value={formData.email}
                            onChange={e => setFormData({ ...formData, email: e.target.value })}
                            className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                            placeholder="john@example.com"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-foreground mb-1">Company Name</label>
                        <input
                            type="text"
                            value={formData.companyName}
                            onChange={e => setFormData({ ...formData, companyName: e.target.value })}
                            className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                            placeholder="Acme Inc."
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-foreground mb-1">Phone</label>
                        <input
                            type="tel"
                            value={formData.phone}
                            onChange={e => setFormData({ ...formData, phone: e.target.value })}
                            className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                            placeholder="+1 (555) 000-0000"
                        />
                    </div>

                    <div className="flex justify-end space-x-3 mt-6">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors flex items-center disabled:opacity-50"
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                    Adding...
                                </>
                            ) : (
                                'Add Client'
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
