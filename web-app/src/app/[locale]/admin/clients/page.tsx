'use client';

import { useState, useEffect } from 'react';
import { Search, UserPlus, MoreHorizontal, Mail, Building, Calendar, Loader2, AlertCircle } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import AddClientModal from '@/components/admin/clients/AddClientModal';
import ClientActions from '@/components/admin/clients/ClientActions';

interface Client {
    id: string;
    full_name: string | null;
    email: string;
    company_name: string | null;
    phone: string | null;
    role: string;
    is_active: boolean;
    created_at: string;
    project_count?: number;
}

export default function AdminClients() {
    const [clients, setClients] = useState<Client[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState<string>('all');
    const [isAddClientModalOpen, setIsAddClientModalOpen] = useState(false);
    const router = useRouter();

    useEffect(() => {
        fetchClients();
    }, [statusFilter]);

    async function fetchClients() {
        try {
            const supabase = createClient();

            // Get authenticated user
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                router.push('/login');
                return;
            }

            // Query profiles for clients with auth users email
            let query = supabase
                .from('profiles')
                .select('*')
                .eq('role', 'client');

            if (statusFilter !== 'all') {
                const isActive = statusFilter === 'active';
                query = query.eq('is_active', isActive);
            }

            const { data: profilesData, error: profilesError } = await query.order('created_at', { ascending: false });

            if (profilesError) throw profilesError;

            // Get project counts for each client
            const clientsWithCounts = await Promise.all(
                ((profilesData as any[]) || []).map(async (profile) => {
                    const { count } = await supabase
                        .from('client_projects')
                        .select('*', { count: 'exact', head: true })
                        .eq('client_id', profile.id);

                    return {
                        ...profile,
                        email: profile.email || 'No email',
                        full_name: profile.full_name || (profile.email ? profile.email.split('@')[0] : 'Unknown'),
                        project_count: count || 0
                    };
                })
            );

            setClients(clientsWithCounts);
        } catch (error) {
            console.error('Error fetching clients:', error);
        } finally {
            setLoading(false);
        }
    }

    const filteredClients = clients.filter(client =>
        client.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        client.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        client.company_name?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="p-8 max-w-7xl mx-auto">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-foreground">Client Management</h1>
                    <p className="text-muted-foreground mt-2">Manage client accounts, access, and project assignments.</p>
                </div>
                <button
                    onClick={() => setIsAddClientModalOpen(true)}
                    className="flex items-center px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
                >
                    <UserPlus className="h-4 w-4 mr-2" />
                    Add Client
                </button>
            </div>

            <div className="bg-card rounded-xl shadow-sm border border-border">
                {/* Search and Filter */}
                <div className="p-4 border-b border-border flex justify-between items-center bg-muted/30">
                    <div className="relative max-w-md w-full">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Search className="h-5 w-5 text-muted-foreground" />
                        </div>
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="block w-full pl-10 pr-3 py-2 border border-border rounded-md leading-5 bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary sm:text-sm"
                            placeholder="Search clients..."
                        />
                    </div>
                    <div className="flex space-x-2">
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="block w-full pl-3 pr-10 py-2 text-base border-border bg-background text-foreground focus:outline-none focus:ring-primary focus:border-primary sm:text-sm rounded-md"
                        >
                            <option value="all">All Statuses</option>
                            <option value="active">Active</option>
                            <option value="inactive">Inactive</option>
                        </select>
                    </div>
                </div>

                {filteredClients.length === 0 ? (
                    <div className="flex flex-col items-center justify-center p-12 text-center">
                        <AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
                        <p className="text-muted-foreground">No clients found</p>
                        <p className="text-sm text-muted-foreground mt-1">
                            {searchTerm ? 'Try adjusting your search criteria' : 'Get started by adding your first client'}
                        </p>
                    </div>
                ) : (
                    <table className="min-w-full divide-y divide-border">
                        <thead className="bg-muted/50">
                            <tr>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Client / Company</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Contact Info</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Projects</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Status</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Joined</th>
                                <th scope="col" className="relative px-6 py-3"><span className="sr-only">Actions</span></th>
                            </tr>
                        </thead>
                        <tbody className="bg-card divide-y divide-border">
                            {filteredClients.map((client) => (
                                <tr key={client.id} className="hover:bg-muted/30 transition-colors">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center">
                                            <div className="flex-shrink-0 h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                                                {client.full_name?.charAt(0) || client.email.charAt(0).toUpperCase()}
                                            </div>
                                            <div className="ml-4">
                                                <div className="text-sm font-medium text-foreground">
                                                    {client.full_name || 'No name'}
                                                </div>
                                                {client.company_name && (
                                                    <div className="text-xs text-muted-foreground flex items-center mt-0.5">
                                                        <Building className="h-3 w-3 mr-1" />
                                                        {client.company_name}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm text-foreground">{client.email}</div>
                                        {client.phone && (
                                            <div className="text-sm text-muted-foreground mt-0.5">
                                                {client.phone}
                                            </div>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                                            {client.project_count || 0} Active
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${client.is_active
                                            ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                                            : 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200'
                                            }`}>
                                            {client.is_active ? 'Active' : 'Inactive'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                                        <div className="flex items-center">
                                            <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                                            {new Date(client.created_at).toLocaleDateString()}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <ClientActions
                                            clientId={client.id}
                                            onDelete={fetchClients}
                                        />
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
            <div className="pb-32"></div>


            <AddClientModal
                isOpen={isAddClientModalOpen}
                onClose={() => setIsAddClientModalOpen(false)}
                onSuccess={() => {
                    fetchClients();
                    setIsAddClientModalOpen(false);
                }}
            />
        </div >
    );
}
