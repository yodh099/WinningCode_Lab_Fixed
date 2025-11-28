import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { Calendar, CheckCircle2, Clock, AlertCircle } from 'lucide-react';

interface Project {
    id: string;
    name: string;
    description: string | null;
    status: string;
    created_at: string;
    start_date: string | null;
    end_date: string | null;
    client_id: string;
    progress?: number;
}

export default async function ClientProjects() {
    const supabase = await createClient();

    // Check auth
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) redirect('/login');

    // Fetch client's projects with more details
    const { data: projects } = await supabase
        .from('client_projects')
        .select('*')
        .eq('client_id', user.id)
        .order('created_at', { ascending: false }) as { data: Project[] | null };

    const getStatusColor = (status: string) => {
        switch (status.toLowerCase()) {
            case 'active':
            case 'in progress':
                return 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200';
            case 'completed':
                return 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-200';
            case 'pending':
            case 'planning':
                return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-200';
            case 'on_hold':
                return 'bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-200';
            case 'archived':
                return 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-200';
            default:
                return 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-200';
        }
    };

    const calculateProgress = (project: Project) => {
        // Simple progress calculation based on dates
        if (project.status === 'completed') return 100;
        if (project.status === 'pending' || project.status === 'planning') return 15;
        if (!project.start_date || !project.end_date) return 30;

        const start = new Date(project.start_date).getTime();
        const end = new Date(project.end_date).getTime();
        const now = Date.now();

        if (now <= start) return 10;
        if (now >= end) return 95;

        const progress = ((now - start) / (end - start)) * 100;
        return Math.min(Math.max(Math.round(progress), 10), 95);
    };

    return (
        <div className="p-4 md:p-8 max-w-7xl mx-auto">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-foreground">My Projects</h1>
                    <p className="text-muted-foreground mt-2">Track progress and milestones for all your active projects.</p>
                </div>
            </div>

            {projects && projects.length > 0 ? (
                <div className="grid grid-cols-1 gap-6">
                    {projects.map((project) => {
                        const progress = calculateProgress(project);

                        return (
                            <div key={project.id} className="bg-card rounded-xl shadow-sm border border-border overflow-hidden hover:shadow-md transition-shadow">
                                <div className="p-6 border-b border-border flex justify-between items-start">
                                    <div>
                                        <div className="flex items-center space-x-3">
                                            <h2 className="text-xl font-bold text-foreground">{project.name}</h2>
                                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(project.status)}`}>
                                                {project.status}
                                            </span>
                                        </div>
                                        {project.description && (
                                            <p className="text-muted-foreground mt-2 max-w-2xl">{project.description}</p>
                                        )}
                                    </div>
                                </div>

                                <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-8">
                                    {/* Progress Section */}
                                    <div className="col-span-1">
                                        <div className="flex justify-between text-sm font-medium mb-2">
                                            <span className="text-muted-foreground">Overall Progress</span>
                                            <span className="text-primary">{progress}%</span>
                                        </div>
                                        <div className="w-full bg-muted rounded-full h-2.5">
                                            <div
                                                className="bg-primary h-2.5 rounded-full transition-all duration-500"
                                                style={{ width: `${progress}%` }}
                                            ></div>
                                        </div>
                                        {project.end_date && (
                                            <div className="mt-4 flex items-center text-sm text-muted-foreground">
                                                <Calendar className="h-4 w-4 mr-2" />
                                                Due: {new Date(project.end_date).toLocaleDateString()}
                                            </div>
                                        )}
                                    </div>

                                    {/* Project Details Section */}
                                    <div className="col-span-2">
                                        <h3 className="text-sm font-medium text-foreground mb-4">Project Timeline</h3>
                                        <div className="space-y-3">
                                            <div className="flex items-center">
                                                <CheckCircle2 className="h-5 w-5 text-green-500 mr-3" />
                                                <div>
                                                    <span className="text-sm font-medium text-foreground">Project Created</span>
                                                    <p className="text-xs text-muted-foreground">
                                                        {new Date(project.created_at).toLocaleDateString()}
                                                    </p>
                                                </div>
                                            </div>

                                            {project.start_date && (
                                                <div className="flex items-center">
                                                    <CheckCircle2 className="h-5 w-5 text-green-500 mr-3" />
                                                    <div>
                                                        <span className="text-sm font-medium text-foreground">Started</span>
                                                        <p className="text-xs text-muted-foreground">
                                                            {new Date(project.start_date).toLocaleDateString()}
                                                        </p>
                                                    </div>
                                                </div>
                                            )}

                                            {project.status === 'active' && project.end_date && (
                                                <div className="flex items-center">
                                                    <Clock className="h-5 w-5 text-blue-500 mr-3" />
                                                    <div>
                                                        <span className="text-sm font-medium text-foreground">In Progress</span>
                                                        <p className="text-xs text-muted-foreground">
                                                            {Math.ceil((new Date(project.end_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24))} days remaining
                                                        </p>
                                                    </div>
                                                </div>
                                            )}

                                            {project.status === 'completed' && (
                                                <div className="flex items-center">
                                                    <CheckCircle2 className="h-5 w-5 text-green-500 mr-3" />
                                                    <div>
                                                        <span className="text-sm font-medium text-foreground">Completed</span>
                                                    </div>
                                                </div>
                                            )}

                                            {(project.status === 'pending' || project.status === 'planning') && (
                                                <div className="flex items-center">
                                                    <div className="h-5 w-5 rounded-full border-2 border-gray-300 mr-3"></div>
                                                    <div>
                                                        <span className="text-sm text-muted-foreground">Awaiting start</span>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            ) : (
                <div className="bg-card rounded-xl shadow-sm border border-border p-12 text-center">
                    <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">No projects yet</p>
                    <p className="text-sm text-muted-foreground mt-1">Your projects will appear here once they're created</p>
                </div>
            )}
        </div>
    );
}
