'use client';

import { useState, useEffect } from 'react';
import { X, Loader2 } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

interface NewProjectModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

interface ClientOption {
    id: string;
    full_name: string | null;
    email?: string;
}

export default function NewProjectModal({ isOpen, onClose, onSuccess }: NewProjectModalProps) {
    const [loading, setLoading] = useState(false);
    const [clients, setClients] = useState<ClientOption[]>([]);
    const [loadingClients, setLoadingClients] = useState(false);

    const [formData, setFormData] = useState({
        clientId: '',
        projectName: '',
        description: '',
        status: 'pending',
        priority: 'normal',
        budget: '',
        currency: 'USD',
        deadline: ''
    });

    useEffect(() => {
        if (isOpen) {
            fetchClients();
        }
    }, [isOpen]);

    async function fetchClients() {
        setLoadingClients(true);
        try {
            const supabase = createClient();
            const { data, error } = await supabase
                .from('profiles')
                .select('id, full_name')
                .eq('role', 'client')
                .order('full_name');

            if (error) throw error;
            setClients(data || []);
        } catch (error) {
            console.error('Error fetching clients:', error);
        } finally {
            setLoadingClients(false);
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const supabase = createClient();

            const { error } = await supabase
                .from('client_projects')
                .insert({
                    client_id: formData.clientId,
                    project_name: formData.projectName,
                    description: formData.description,
                    status: formData.status as any,
                    priority: formData.priority as any,
                    budget: formData.budget ? parseFloat(formData.budget) : null,
                    currency: formData.currency,
                    deadline: formData.deadline || null,
                    progress: 0
                });

            if (error) throw error;

            onSuccess();
            onClose();
            setFormData({
                clientId: '',
                projectName: '',
                description: '',
                status: 'pending',
                priority: 'normal',
                budget: '',
                currency: 'USD',
                deadline: ''
            });

        } catch (error) {
            console.error('Error creating project:', error);
            alert('Failed to create project');
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="bg-card w-full max-w-2xl rounded-xl shadow-lg border border-border p-6 animate-in fade-in zoom-in duration-200 max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold text-foreground">Create New Project</h2>
                    <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
                        <X className="h-5 w-5" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="col-span-2">
                            <label className="block text-sm font-medium text-foreground mb-1">Project Name</label>
                            <input
                                type="text"
                                required
                                value={formData.projectName}
                                onChange={e => setFormData({ ...formData, projectName: e.target.value })}
                                className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                                placeholder="Website Redesign"
                            />
                        </div>

                        <div className="col-span-2">
                            <label className="block text-sm font-medium text-foreground mb-1">Client</label>
                            <select
                                required
                                value={formData.clientId}
                                onChange={e => setFormData({ ...formData, clientId: e.target.value })}
                                className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                                disabled={loadingClients}
                            >
                                <option value="">Select a client</option>
                                {clients.map(client => (
                                    <option key={client.id} value={client.id}>
                                        {client.full_name || 'Unnamed Client'}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="col-span-2">
                            <label className="block text-sm font-medium text-foreground mb-1">Description</label>
                            <textarea
                                rows={3}
                                value={formData.description}
                                onChange={e => setFormData({ ...formData, description: e.target.value })}
                                className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                                placeholder="Project details..."
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-foreground mb-1">Status</label>
                            <select
                                value={formData.status}
                                onChange={e => setFormData({ ...formData, status: e.target.value })}
                                className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                            >
                                <option value="pending">Pending</option>
                                <option value="active">Active</option>
                                <option value="on_hold">On Hold</option>
                                <option value="completed">Completed</option>
                                <option value="cancelled">Cancelled</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-foreground mb-1">Priority</label>
                            <select
                                value={formData.priority}
                                onChange={e => setFormData({ ...formData, priority: e.target.value })}
                                className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                            >
                                <option value="low">Low</option>
                                <option value="normal">Normal</option>
                                <option value="high">High</option>
                                <option value="urgent">Urgent</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-foreground mb-1">Budget</label>
                            <div className="relative">
                                <input
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    value={formData.budget}
                                    onChange={e => setFormData({ ...formData, budget: e.target.value })}
                                    className="w-full pl-3 pr-16 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                                    placeholder="0.00"
                                />
                                <div className="absolute inset-y-0 right-0 flex items-center">
                                    <select
                                        value={formData.currency}
                                        onChange={e => setFormData({ ...formData, currency: e.target.value })}
                                        className="h-full py-0 pl-2 pr-7 border-transparent bg-transparent text-muted-foreground sm:text-sm rounded-md focus:ring-2 focus:ring-primary/50"
                                    >
                                        <option value="USD">USD</option>
                                        <option value="EUR">EUR</option>
                                        <option value="GBP">GBP</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-foreground mb-1">Deadline</label>
                            <input
                                type="date"
                                value={formData.deadline}
                                onChange={e => setFormData({ ...formData, deadline: e.target.value })}
                                className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                            />
                        </div>
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
                                    Creating...
                                </>
                            ) : (
                                'Create Project'
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
