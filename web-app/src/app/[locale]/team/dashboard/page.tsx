import { createClient } from '@/lib/supabase/server';
import { CheckSquare, Folder, Clock, AlertCircle, Calendar } from 'lucide-react';
import Link from 'next/link';
import { redirect } from 'next/navigation';

export default async function TeamDashboard() {
    const supabase = await createClient();

    // Check auth
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) redirect('/login');

    // Get profile to verify role
    const { data: profileData } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

    const profile = profileData as any;

    if (!profile || (profile.role !== 'staff' && profile.role !== 'admin' && profile.role !== 'developer')) {
        redirect('/not-authorized');
    }

    // Fetch assigned projects
    const { data: assignedProjectsData } = await supabase
        .from('client_projects')
        .select('*')
        .eq('assigned_to', user.id)
        .neq('status', 'completed')
        .neq('status', 'cancelled');

    const assignedProjects = assignedProjectsData as any[] || [];

    // Fetch assigned inquiries (as tasks/leads)
    const { data: assignedInquiriesData } = await supabase
        .from('inquiries')
        .select('*')
        .eq('assigned_to', user.id)
        .neq('status', 'closed')
        .neq('status', 'converted');

    const assignedInquiries = assignedInquiriesData as any[] || [];

    const activeProjectsCount = assignedProjects.length;
    const pendingInquiriesCount = assignedInquiries.length;
    // Mock "Urgent" count for now based on priority if available, or just 0
    const urgentCount = assignedProjects.filter((p: any) => p.priority === 'urgent').length + assignedInquiries.filter((i: any) => i.priority === 'urgent').length;

    const stats = [
        { name: 'My Projects', value: activeProjectsCount.toString(), icon: Folder, color: 'bg-indigo-500' },
        { name: 'Assigned Leads', value: pendingInquiriesCount.toString(), icon: CheckSquare, color: 'bg-blue-500' },
        { name: 'Urgent Items', value: urgentCount.toString(), icon: AlertCircle, color: 'bg-red-500' },
        { name: 'Completed', value: '0', icon: Clock, color: 'bg-green-500' }, // Placeholder for completed count if needed
    ];

    return (
        <div className="p-8 max-w-7xl mx-auto">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900">Staff Dashboard</h1>
                <p className="text-gray-600 mt-2">Overview of your assigned work and deadlines.</p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                {stats.map((stat) => (
                    <div key={stat.name} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">{stat.name}</p>
                                <p className="text-3xl font-bold text-gray-900 mt-2">{stat.value}</p>
                            </div>
                            <div className={`p-3 rounded-lg ${stat.color} bg-opacity-10`}>
                                <stat.icon className={`h-6 w-6 ${stat.color.replace('bg-', 'text-')}`} />
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Assigned Projects Card */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                        <h2 className="text-lg font-semibold text-gray-900">Active Projects</h2>
                        <Link href="/team/projects" className="text-sm text-indigo-600 hover:text-indigo-700 font-medium">
                            View All
                        </Link>
                    </div>
                    <div className="p-6">
                        {assignedProjects && assignedProjects.length > 0 ? (
                            <div className="space-y-6">
                                {assignedProjects.map((project) => (
                                    <div key={project.id} className="flex items-center justify-between">
                                        <div className="flex items-center">
                                            <div className="h-10 w-10 rounded-lg bg-gray-900 text-white flex items-center justify-center font-bold uppercase">
                                                {project.project_name.charAt(0)}
                                            </div>
                                            <div className="ml-4">
                                                <h3 className="text-sm font-medium text-gray-900">{project.project_name}</h3>
                                                <p className="text-xs text-gray-500 capitalize">{project.status}</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${project.priority === 'urgent' ? 'bg-red-100 text-red-800' :
                                                project.priority === 'high' ? 'bg-orange-100 text-orange-800' :
                                                    'bg-green-100 text-green-800'
                                                }`}>
                                                {project.priority}
                                            </span>
                                            {project.deadline && (
                                                <p className="text-xs text-gray-500 mt-1 flex items-center justify-end">
                                                    <Calendar className="h-3 w-3 mr-1" />
                                                    {new Date(project.deadline).toLocaleDateString()}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-gray-500 text-center py-4">No active projects assigned.</p>
                        )}
                    </div>
                </div>

                {/* Assigned Inquiries/Tasks Card */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                        <h2 className="text-lg font-semibold text-gray-900">Assigned Leads & Tasks</h2>
                        <Link href="/team/tasks" className="text-sm text-indigo-600 hover:text-indigo-700 font-medium">
                            View All
                        </Link>
                    </div>
                    <div className="p-6">
                        {assignedInquiries && assignedInquiries.length > 0 ? (
                            <div className="space-y-4">
                                {assignedInquiries.map((inquiry) => (
                                    <div key={inquiry.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-100">
                                        <div className="flex items-start space-x-3">
                                            <div className={`mt-1 h-2 w-2 rounded-full ${inquiry.priority === 'urgent' ? 'bg-red-500' :
                                                inquiry.priority === 'high' ? 'bg-orange-500' : 'bg-blue-500'
                                                }`}></div>
                                            <div>
                                                <h3 className="text-sm font-medium text-gray-900">{inquiry.name}</h3>
                                                <p className="text-xs text-gray-500">{inquiry.project_idea?.substring(0, 30)}...</p>
                                            </div>
                                        </div>
                                        <span className="text-xs font-medium text-gray-500 bg-white px-2 py-1 rounded border border-gray-200 capitalize">
                                            {inquiry.status}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-gray-500 text-center py-4">No pending inquiries or tasks.</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
