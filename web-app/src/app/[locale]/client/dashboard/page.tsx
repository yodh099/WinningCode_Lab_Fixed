import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { Folder, FileText, AlertCircle, Calendar, TrendingUp } from 'lucide-react';
import Link from 'next/link';

interface Project {
    id: string;
    name: string;
    description: string | null;
    status: string;
    created_at: string;
    start_date: string | null;
    end_date: string | null;
    client_id: string;
}

export default async function ClientDashboard() {
    const supabase = await createClient();

    // Check auth
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) redirect('/login');

    // Get profile
    const { data: profile } = await supabase
        .from('profiles')
        .select('full_name, role')
        .eq('id', user.id)
        .single() as { data: { full_name: string; role: string } | null };

    // Fetch client's projects
    const { data: projects } = await supabase
        .from('client_projects')
        .select('*')
        .eq('client_id', user.id)
        .order('created_at', { ascending: false }) as { data: Project[] | null };

    const activeProjects = projects?.filter(p => p.status === 'active') || [];
    const totalProjects = projects?.length || 0;

    return (
        <div className="p-4 md:p-8 max-w-7xl mx-auto">
            <div className="mb-8">
                <h1 className="text-3xl font-bold">Welcome back, {profile?.full_name || 'Client'}</h1>
                <p className="text-muted-foreground mt-2">Here&apos;s what&apos;s happening with your projects today.</p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-card p-6 rounded-xl shadow-sm border border-border hover:border-primary/50 transition-all">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-muted-foreground">Total Projects</p>
                            <p className="text-3xl font-bold mt-2">{totalProjects}</p>
                        </div>
                        <div className="p-3 rounded-lg bg-blue-500 bg-opacity-10">
                            <Folder className="h-6 w-6 text-blue-500" />
                        </div>
                    </div>
                </div>

                <div className="bg-card p-6 rounded-xl shadow-sm border border-border hover:border-primary/50 transition-all">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-muted-foreground">Active Projects</p>
                            <p className="text-3xl font-bold mt-2">{activeProjects.length}</p>
                        </div>
                        <div className="p-3 rounded-lg bg-green-500 bg-opacity-10">
                            <TrendingUp className="h-6 w-6 text-green-500" />
                        </div>
                    </div>
                </div>

                <div className="bg-card p-6 rounded-xl shadow-sm border border-border hover:border-primary/50 transition-all">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-muted-foreground">Files</p>
                            <p className="text-3xl font-bold mt-2">0</p>
                            <p className="text-xs text-muted-foreground mt-1">Coming soon</p>
                        </div>
                        <div className="p-3 rounded-lg bg-purple-500 bg-opacity-10">
                            <FileText className="h-6 w-6 text-purple-500" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Projects List */}
            <div className="bg-card rounded-xl shadow-sm border border-border overflow-hidden">
                <div className="p-6 border-b border-border flex justify-between items-center">
                    <h2 className="text-lg font-semibold">Your Projects</h2>
                </div>

                {projects && projects.length > 0 ? (
                    <div className="divide-y divide-border">
                        {projects.map((project) => (
                            <Link
                                key={project.id}
                                href={`/client/projects/${project.id}`}
                                className="block p-6 hover:bg-muted/30 transition-colors"
                            >
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <h3 className="font-semibold text-lg">{project.name}</h3>
                                        {project.description && (
                                            <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                                                {project.description}
                                            </p>
                                        )}
                                        <div className="flex flex-wrap items-center gap-3 mt-3 text-xs text-muted-foreground">
                                            <span className="flex items-center gap-1">
                                                <Calendar className="h-3 w-3" />
                                                {new Date(project.created_at).toLocaleDateString()}
                                            </span>
                                            {project.start_date && (
                                                <span>Started: {new Date(project.start_date).toLocaleDateString()}</span>
                                            )}
                                            {project.end_date && (
                                                <span>Due: {new Date(project.end_date).toLocaleDateString()}</span>
                                            )}
                                        </div>
                                    </div>
                                    <span className={`ml-4 px-3 py-1 text-xs font-semibold rounded-full whitespace-nowrap ${project.status === 'active' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                                        project.status === 'pending' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' :
                                            project.status === 'completed' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' :
                                                project.status === 'on_hold' ? 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200' :
                                                    project.status === 'archived' ? 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200' :
                                                        'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200'
                                        }`}>
                                        {project.status}
                                    </span>
                                </div>
                            </Link>
                        ))}
                    </div>
                ) : (
                    <div className="p-12 text-center">
                        <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                        <p className="text-muted-foreground">No projects yet</p>
                        <p className="text-sm text-muted-foreground mt-1">Your projects will appear here once they&apos;re created</p>
                    </div>
                )}
            </div>
        </div>
    );
}
