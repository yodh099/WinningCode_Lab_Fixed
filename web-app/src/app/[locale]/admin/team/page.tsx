'use client';

import { useState, useEffect } from 'react';
import { UserPlus, MoreHorizontal, Mail, Shield, Briefcase, CheckCircle2, Loader2, AlertCircle } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import AddMemberModal from '@/components/admin/team/AddMemberModal';
import TeamActions from '@/components/admin/team/TeamActions';

interface TeamMember {
    id: string;
    full_name: string | null;
    email: string;
    role: 'admin' | 'staff' | 'client' | 'developer';
    company_name: string | null;
    phone: string | null;
    is_active: boolean;
    created_at: string;
    project_count?: number;
}

export default function AdminTeam() {
    const [team, setTeam] = useState<TeamMember[]>([]);
    const [loading, setLoading] = useState(true);
    const [roleFilter, setRoleFilter] = useState<string>('all');
    const [isAddMemberModalOpen, setIsAddMemberModalOpen] = useState(false);
    const router = useRouter();

    useEffect(() => {
        fetchTeam();
    }, [roleFilter]);

    async function fetchTeam() {
        try {
            const supabase = createClient();

            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                router.push('/login');
                return;
            }

            // Query profiles for staff and admin (team members)
            let query = supabase
                .from('profiles')
                .select('*')
                .in('role', ['admin', 'staff', 'developer']);

            if (roleFilter !== 'all') {
                query = query.eq('role', roleFilter);
            }

            const { data: profilesData, error: profilesError } = await query.order('created_at', { ascending: false });

            if (profilesError) throw profilesError;

            // Get emails and project counts
            const teamWithDetails = await Promise.all(
                ((profilesData as any[]) || []).map(async (profile) => {
                    // Get project count where this person is assigned
                    const { count } = await supabase
                        .from('client_projects')
                        .select('*', { count: 'exact', head: true })
                        .eq('assigned_to', profile.id);

                    return {
                        ...profile,
                        email: profile.email || 'No email',
                        project_count: count || 0
                    };
                })
            );

            setTeam(teamWithDetails);
        } catch (error) {
            console.error('Error fetching team:', error);
        } finally {
            setLoading(false);
        }
    }

    const getRoleBadgeColor = (role: string) => {
        switch (role) {
            case 'admin':
                return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
            case 'staff':
                return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
            default:
                return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200';
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
        <div className="p-8 max-w-7xl mx-auto">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-foreground">Team Management</h1>
                    <p className="text-muted-foreground mt-2">Manage team members, roles, and access permissions.</p>
                </div>
                <button
                    onClick={() => setIsAddMemberModalOpen(true)}
                    className="flex items-center px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
                >
                    <UserPlus className="h-4 w-4 mr-2" />
                    Add Member
                </button>
            </div>

            {/* Role Filters */}
            <div className="mb-6 flex gap-2">
                <button
                    onClick={() => setRoleFilter('all')}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${roleFilter === 'all'
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-card text-foreground border border-border hover:bg-accent'
                        }`}
                >
                    All ({team.length})
                </button>
                <button
                    onClick={() => setRoleFilter('admin')}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${roleFilter === 'admin'
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-card text-foreground border border-border hover:bg-accent'
                        }`}
                >
                    Admins
                </button>
                <button
                    onClick={() => setRoleFilter('staff')}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${roleFilter === 'staff'
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-card text-foreground border border-border hover:bg-accent'
                        }`}
                >
                    Staff
                </button>
            </div>

            {team.length === 0 ? (
                <div className="flex flex-col items-center justify-center p-12 bg-card border border-border rounded-lg text-center">
                    <AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">No team members found</p>
                    <p className="text-sm text-muted-foreground mt-1">
                        {roleFilter !== 'all' ? `No ${roleFilter} members` : 'Get started by adding your first team member'}
                    </p>
                </div>
            ) : (
                <div className="bg-card rounded-xl shadow-sm border border-border">
                    <table className="min-w-full divide-y divide-border">
                        <thead className="bg-muted/50">
                            <tr>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Member</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Role & Access</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Status</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Active Projects</th>
                                <th scope="col" className="relative px-6 py-3"><span className="sr-only">Actions</span></th>
                            </tr>
                        </thead>
                        <tbody className="bg-card divide-y divide-border">
                            {team.map((member) => (
                                <tr key={member.id} className="hover:bg-muted/30 transition-colors">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center">
                                            <div className="flex-shrink-0 h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                                                {member.full_name?.charAt(0) || member.email.charAt(0).toUpperCase()}
                                            </div>
                                            <div className="ml-4">
                                                <div className="text-sm font-medium text-foreground">
                                                    {member.full_name || 'No name'}
                                                </div>
                                                <div className="text-xs text-muted-foreground flex items-center mt-0.5">
                                                    <Mail className="h-3 w-3 mr-1" />
                                                    {member.email}
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm text-foreground flex items-center">
                                            <Briefcase className="h-3 w-3 mr-1 text-muted-foreground" />
                                            {member.company_name || 'Winning Code Lab'}
                                        </div>
                                        <div className="text-xs flex items-center mt-1">
                                            <Shield className="h-3 w-3 mr-1" />
                                            <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${getRoleBadgeColor(member.role)}`}>
                                                {member.role.charAt(0).toUpperCase() + member.role.slice(1)}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${member.is_active
                                            ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                                            : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                                            }`}>
                                            {member.is_active ? 'Active' : 'Inactive'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                                        <div className="flex items-center">
                                            <CheckCircle2 className="h-4 w-4 mr-2 text-muted-foreground" />
                                            {member.project_count || 0} Projects
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <TeamActions
                                            memberId={member.id}
                                            onDelete={() => {
                                                if (confirm('Are you sure you want to remove this team member?')) {
                                                    alert('Remove member feature requires backend integration.');
                                                }
                                            }}
                                        />
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
            <div className="pb-32"></div>


            <AddMemberModal
                isOpen={isAddMemberModalOpen}
                onClose={() => setIsAddMemberModalOpen(false)}
                onSuccess={() => {
                    fetchTeam();
                    setIsAddMemberModalOpen(false);
                }}
            />
        </div >
    );
}
