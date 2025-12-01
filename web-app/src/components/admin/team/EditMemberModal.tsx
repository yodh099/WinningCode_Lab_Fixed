'use client';

import { useState, useEffect } from 'react';
import { X, Loader2 } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { updateTeamMember } from '@/app/actions/users';

interface EditMemberModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    memberId: string;
}

export default function EditMemberModal({ isOpen, onClose, onSuccess, memberId }: EditMemberModalProps) {
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(true);
    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        role: 'staff',
        phone: '',
        companyName: ''
    });

    useEffect(() => {
        if (isOpen && memberId) {
            fetchMemberDetails();
        }
    }, [isOpen, memberId]);

    async function fetchMemberDetails() {
        setFetching(true);
        try {
            const supabase = createClient();
            const { data, error } = await (supabase
                .from('profiles') as any)
                .select('full_name, email, role, phone, company_name')
                .eq('id', memberId)
                .single();

            if (error) throw error;

            if (data) {
                setFormData({
                    fullName: data.full_name || '',
                    email: data.email || '', // Email might not be in profiles depending on schema, but let's try
                    role: data.role || 'staff',
                    phone: data.phone || '',
                    companyName: data.company_name || ''
                });
            }
        } catch (error) {
            console.error('Error fetching member details:', error);
            alert('Failed to load member details');
            onClose();
        } finally {
            setFetching(false);
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            // Use server action for everything
            const result = await updateTeamMember(memberId, formData);

            if (result.error) {
                throw new Error(result.error);
            }

            onSuccess();
            onClose();

        } catch (error: any) {
            console.error('Error updating member:', error);
            alert('Failed to update member: ' + (error.message || 'Unknown error'));
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="bg-card w-full max-w-md rounded-xl shadow-lg border border-border p-6 animate-in fade-in zoom-in duration-200">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold text-foreground">Edit Team Member</h2>
                    <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
                        <X className="h-5 w-5" />
                    </button>
                </div>

                {fetching ? (
                    <div className="flex justify-center py-8">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-foreground mb-1">Full Name</label>
                            <input
                                type="text"
                                required
                                value={formData.fullName}
                                onChange={e => setFormData({ ...formData, fullName: e.target.value })}
                                className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                                placeholder="Jane Smith"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-foreground mb-1">Role</label>
                            <select
                                value={formData.role}
                                onChange={e => setFormData({ ...formData, role: e.target.value })}
                                className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                            >
                                <option value="staff">Staff</option>
                                <option value="admin">Admin</option>
                                <option value="client">Client</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-foreground mb-1">Company Name</label>
                            <input
                                type="text"
                                value={formData.companyName}
                                onChange={e => setFormData({ ...formData, companyName: e.target.value })}
                                className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                                placeholder="Winning Code Lab"
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
                                        Saving...
                                    </>
                                ) : (
                                    'Save Changes'
                                )}
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
}
