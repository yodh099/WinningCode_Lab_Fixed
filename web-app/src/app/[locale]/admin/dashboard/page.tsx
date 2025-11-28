import { createClient } from '@/lib/supabase/server';
import { Users, Folder, Activity, Mail, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import { redirect } from 'next/navigation';



export default async function AdminDashboard() {
    const supabase = await createClient();

    // Check auth
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) redirect('/login');

    // Get profile
    const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single() as { data: { role: string } | null };

    if (!profile || profile.role !== 'admin') {
        redirect('/not-authorized');
    }

    // Fetch stats
    // Fetch dashboard stats
    const [inquiriesResult, projectsResult, usersResult] = await Promise.all([
        supabase.from('inquiries').select('id, status, created_at', { count: 'exact' }),
        supabase.from('client_projects').select('id, status', { count: 'exact' }),
        supabase.from('profiles').select('id, role, is_active', { count: 'exact' })
    ]);

    const totalInquiries = inquiriesResult.count || 0;
    const newInquiries = inquiriesResult.data?.filter(i => i.status === 'new').length || 0;
    const totalProjects = projectsResult.count || 0;
    const totalUsers = usersResult.count || 0;
    const activeUsers = usersResult.data?.filter(u => u.is_active).length || 0;

    // Recent inquiries (last 10)
    const { data: recentInquiries } = await supabase
        .from('inquiries')
        .select('id, name, email, project_idea, budget, status, created_at')
        .order('created_at', { ascending: false })
        .limit(10);

    const stats = [
        {
            name: 'Total Inquiries',
            value: totalInquiries.toString(),
            subtext: `${newInquiries} new`,
            icon: Mail,
            color: 'bg-blue-500',
            href: '/admin/inquiries'
        },
        {
            name: 'Active Projects',
            value: activeProjects.toString(),
            subtext: `${totalProjects} total`,
            icon: Folder,
            color: 'bg-green-500',
            href: '/admin/projects'
        },
        {
            name: 'Active Users',
            value: activeUsers.toString(),
            subtext: `${totalUsers} total`,
            icon: Users,
            color: 'bg-purple-500',
            href: '/admin/users'
        },
        {
            name: 'System Health',
            value: '100%',
            subtext: 'All systems operational',
            icon: Activity,
            color: 'bg-indigo-500'
        },
    ];

    return (
        <div className="p-4 md:p-8 max-w-7xl mx-auto">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold">Admin Dashboard</h1>
                    <p className="text-muted-foreground mt-2">Platform overview and key metrics</p>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {stats.map((stat) => (
                    <Link
                        key={stat.name}
                        href={stat.href || '#'}
                        className={`bg-card p-6 rounded-xl shadow-sm border border-border hover:border-primary/50 transition-all ${stat.href ? 'cursor-pointer' : 'pointer-events-none'}`}
                    >
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">{stat.name}</p>
                                <p className="text-3xl font-bold mt-2">{stat.value}</p>
                                <p className="text-xs text-muted-foreground mt-1">{stat.subtext}</p>
                            </div>
                            <div className={`p-3 rounded-lg ${stat.color} bg-opacity-10`}>
                                <stat.icon className={`h-6 w-6 ${stat.color.replace('bg-', 'text-')}`} />
                            </div>
                        </div>
                    </Link>
                ))}
            </div>

            {/* Recent Inquiries */}
            <div className="bg-card rounded-xl shadow-sm border border-border overflow-hidden">
                <div className="p-6 border-b border-border flex justify-between items-center">
                    <h2 className="text-lg font-semibold">Recent Inquiries</h2>
                    <Link
                        href="/admin/inquiries"
                        className="text-sm text-primary hover:underline"
                    >
                        View All →
                    </Link>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-muted/50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                                    Name
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                                    Email
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider hidden md:table-cell">
                                    Project
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider hidden lg:table-cell">
                                    Budget
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                                    Status
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider hidden sm:table-cell">
                                    Date
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {recentInquiries && recentInquiries.length > 0 ? (
                                recentInquiries.map((inquiry) => (
                                    <tr key={inquiry.id} className="hover:bg-muted/30 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="font-medium">{inquiry.name}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-muted-foreground">{inquiry.email}</div>
                                        </td>
                                        <td className="px-6 py-4 hidden md:table-cell">
                                            <div className="text-sm line-clamp-1 max-w-xs">{inquiry.project_idea}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap hidden lg:table-cell">
                                            <div className="text-sm">{inquiry.budget || 'N/A'}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${inquiry.status === 'new' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' :
                                                inquiry.status === 'reviewing' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' :
                                                    inquiry.status === 'contacted' ? 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200' :
                                                        'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200'
                                                }`}>
                                                {inquiry.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground hidden sm:table-cell">
                                            {new Date(inquiry.created_at).toLocaleDateString()}
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={6} className="px-6 py-12 text-center">
                                        <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                                        <p className="text-muted-foreground">No inquiries yet</p>
                                        <p className="text-sm text-muted-foreground mt-1">New inquiries will appear here</p>
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
