'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { ArrowLeft, Building, Mail, Phone, Calendar, Loader2 } from 'lucide-react';
import Link from 'next/link';

interface ClientDetails {
    id: string;
    full_name: string | null;
    email: string;
    company_name: string | null;
    phone: string | null;
    role: string;
    is_active: boolean;
    created_at: string;
}

export default function ClientDetailsPage() {
    const params = useParams();
    const router = useRouter();
    const [client, setClient] = useState<ClientDetails | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (params.id) {
            fetchClientDetails(params.id as string);
        }
    }, [params.id]);

    async function fetchClientDetails(id: string) {
        try {
            const supabase = createClient();
            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', id)
                .single();

            if (error) throw error;
            setClient(data);
        } catch (error) {
            console.error('Error fetching client:', error);
            alert('Failed to load client details');
            router.push('/admin/clients');
        } finally {
            setLoading(false);
        }
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    if (!client) return null;

    return (
        <div className="p-8 max-w-4xl mx-auto">
            <Link href="/admin/clients" className="flex items-center text-muted-foreground hover:text-foreground mb-6 transition-colors">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Clients
            </Link>

            <div className="bg-card rounded-xl shadow-sm border border-border overflow-hidden">
                <div className="p-6 border-b border-border bg-muted/30">
                    <div className="flex justify-between items-start">
                        <div className="flex items-center">
                            <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center text-primary text-2xl font-bold mr-4">
                                {client.full_name?.charAt(0) || client.email.charAt(0).toUpperCase()}
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold text-foreground">
                                    {client.full_name || (client.email ? client.email.split('@')[0] : 'Unknown')}
                                </h1>
                                <div className="flex items-center text-muted-foreground mt-1">
                                    <Mail className="h-4 w-4 mr-1" />
                                    {client.email}
                                </div>
                            </div>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${client.is_active
                            ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                            : 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200'
                            }`}>
                            {client.is_active ? 'Active' : 'Inactive'}
                        </span>
                    </div>
                </div>

                <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-4">Contact Information</h3>
                        <div className="space-y-3">
                            <div className="flex items-center text-foreground">
                                <Building className="h-5 w-5 mr-3 text-muted-foreground" />
                                {client.company_name || 'No company'}
                            </div>
                            <div className="flex items-center text-foreground">
                                <Phone className="h-5 w-5 mr-3 text-muted-foreground" />
                                {client.phone || 'No phone'}
                            </div>
                            <div className="flex items-center text-foreground">
                                <Calendar className="h-5 w-5 mr-3 text-muted-foreground" />
                                Joined {new Date(client.created_at).toLocaleDateString()}
                            </div>
                        </div>
                    </div>

                    <div>
                        <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-4">Account Details</h3>
                        <div className="space-y-3">
                            <div className="flex justify-between py-2 border-b border-border">
                                <span className="text-muted-foreground">Role</span>
                                <span className="font-medium capitalize">{client.role}</span>
                            </div>
                            <div className="flex justify-between py-2 border-b border-border">
                                <span className="text-muted-foreground">User ID</span>
                                <span className="font-mono text-xs">{client.id}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
