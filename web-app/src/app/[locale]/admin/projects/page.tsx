'use client';

import { useState, useEffect } from 'react';
import { Plus, MoreVertical, Calendar, CheckCircle2, AlertTriangle, Loader2, AlertCircle } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import NewProjectModal from '@/components/admin/projects/NewProjectModal';
import ProjectActions from '@/components/admin/projects/ProjectActions';

interface Project {
    id: string;
    project_name: string;
    description: string | null;
    status: string;
    progress: number;
    deadline: string | null;
    budget: number | null;
    currency: string;
    client_id: string;
    client_name?: string;
    client_email?: string;
    assigned_to: string | null;
    created_at: string;
}

export default function AdminProjects() {
    const [projects, setProjects] = useState<Project[]>([]);
    const [loading, setLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState<string>('all');
    const [isNewProjectModalOpen, setIsNewProjectModalOpen] = useState(false);
    const router = useRouter();

    useEffect(() => {
        fetchProjects();
    }, [statusFilter]);

    async function fetchProjects() {
        try {
            const supabase = createClient();

            // Log environment variables (without exposing sensitive data)
            console.log('Environment check:', {
                hasUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
                hasKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
                urlPrefix: process.env.NEXT_PUBLIC_SUPABASE_URL?.substring(0, 20)
            });

            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                router.push('/login');
                return;
            }

            let query = supabase
                .from('client_projects')
                .select(`
                    *,
                    client:profiles!client_id(full_name, id, email)
                `);

            if (statusFilter !== 'all') {
                query = query.eq('status', statusFilter);
            }

            const { data, error } = await query.order('created_at', { ascending: false });

            if (error) {
                console.error('Error fetching projects:', error);
                throw error;
            }

            const projectsWithEmails = ((data as any[]) || []).map((project) => {
                return {
                    ...project,
                    client_name: project.client?.full_name || 'Unknown Client',
                    client_email: project.client?.email || 'No email'
                };
            });

            setProjects(projectsWithEmails);
        } catch (error) {
            console.error('Error fetching projects:', error instanceof Error ? error.message : error);
            console.error('Full error object:', JSON.stringify(error, Object.getOwnPropertyNames(error)));
            console.error('Error type:', typeof error, 'Constructor:', error?.constructor?.name);
        } finally {
            setLoading(false);
        }
    }

    const handleDeleteProject = async (projectId: string) => {
        if (!confirm('Are you sure you want to delete this project? This action cannot be undone.')) return;

        try {
            const supabase = createClient();
            const { error } = await (supabase
                .from('client_projects') as any)
                .delete()
                .eq('id', projectId);

            if (error) throw error;

            setProjects(projects.filter(p => p.id !== projectId));
        } catch (error) {
            console.error('Error deleting project:', error);
            alert('Failed to delete project');
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'active':
                return 'bg-blue-100 text-blue-700';
            case 'completed':
                return 'bg-green-100 text-green-700';
            case 'on_hold':
                return 'bg-yellow-100 text-yellow-700';
            case 'cancelled':
                return 'bg-red-100 text-red-700';
            case 'pending':
                return 'bg-gray-100 text-gray-700';
            default:
                return 'bg-gray-100 text-gray-700';
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
                    <h1 className="text-3xl font-bold text-foreground">Project Management</h1>
                    <p className="text-muted-foreground mt-2">Oversee all active projects, timelines, and budgets.</p>
                </div>
                <button
                    onClick={() => setIsNewProjectModalOpen(true)}
                    className="flex items-center px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
                >
                    <Plus className="h-4 w-4 mr-2" />
                    New Project
                </button>
            </div>

            {/* Filters */}
            <div className="mb-6 flex gap-2">
                <button
                    onClick={() => setStatusFilter('all')}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${statusFilter === 'all'
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-card text-foreground border border-border hover:bg-accent'
                        }`}
                >
                    All
                </button>
                <button
                    onClick={() => setStatusFilter('active')}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${statusFilter === 'active'
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-card text-foreground border border-border hover:bg-accent'
                        }`}
                >
                    Active
                </button>
                <button
                    onClick={() => setStatusFilter('pending')}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${statusFilter === 'pending'
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-card text-foreground border border-border hover:bg-accent'
                        }`}
                >
                    Pending
                </button>
                <button
                    onClick={() => setStatusFilter('completed')}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${statusFilter === 'completed'
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-card text-foreground border border-border hover:bg-accent'
                        }`}
                >
                    Completed
                </button>
            </div>

            {projects.length === 0 ? (
                <div className="flex flex-col items-center justify-center p-12 bg-card border border-border rounded-lg text-center">
                    <AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">No projects found</p>
                    <p className="text-sm text-muted-foreground mt-1">
                        {statusFilter !== 'all' ? `No ${statusFilter} projects` : 'Get started by creating your first project'}
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-6">
                    {projects.map((project) => (
                        <div key={project.id} className="bg-card rounded-xl shadow-sm border border-border hover:shadow-md transition-shadow">
                            <div className="p-6">
                                <div className="flex justify-between items-start">
                                    <div className="flex items-start space-x-4">
                                        <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center text-primary font-bold text-lg">
                                            {project.project_name.charAt(0)}
                                        </div>
                                        <div>
                                            <h2 className="text-xl font-bold text-foreground">{project.project_name}</h2>
                                            <p className="text-sm text-muted-foreground mt-1">
                                                Client: <span className="font-medium text-foreground">{project.client_name}</span>
                                            </p>
                                            {project.description && (
                                                <p className="text-sm text-muted-foreground mt-2 line-clamp-2">{project.description}</p>
                                            )}
                                        </div>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(project.status)}`}>
                                            {project.status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                                        </span>
                                        <ProjectActions
                                            projectId={project.id}
                                            onDelete={() => handleDeleteProject(project.id)}
                                        />
                                    </div>
                                </div>

                                <div className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-6">
                                    <div className="col-span-2">
                                        <div className="flex justify-between text-sm font-medium mb-2">
                                            <span className="text-muted-foreground">Progress</span>
                                            <span className="text-primary">{project.progress}%</span>
                                        </div>
                                        <div className="w-full bg-muted rounded-full h-2">
                                            <div
                                                className="bg-primary h-2 rounded-full transition-all duration-500"
                                                style={{ width: `${project.progress}%` }}
                                            ></div>
                                        </div>
                                    </div>

                                    {project.deadline && (
                                        <div className="flex flex-col justify-center">
                                            <span className="text-xs text-muted-foreground uppercase tracking-wider font-medium">Due Date</span>
                                            <div className="flex items-center mt-1 text-sm text-foreground">
                                                <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                                                {new Date(project.deadline).toLocaleDateString()}
                                            </div>
                                        </div>
                                    )}

                                    {project.budget && (
                                        <div className="flex flex-col justify-center">
                                            <span className="text-xs text-muted-foreground uppercase tracking-wider font-medium">Budget</span>
                                            <div className="flex items-center mt-1 text-sm font-bold text-foreground">
                                                {project.currency} ${project.budget.toLocaleString()}
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <div className="mt-6 pt-6 border-t border-border flex justify-between items-center">
                                    <div className="text-sm text-muted-foreground">
                                        Created {new Date(project.created_at).toLocaleDateString()}
                                    </div>
                                    <div className="flex space-x-4 text-sm text-muted-foreground">
                                        <span className="flex items-center">
                                            <CheckCircle2 className="h-4 w-4 mr-1 text-green-500" />
                                            {project.progress}% Complete
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}


            <NewProjectModal
                isOpen={isNewProjectModalOpen}
                onClose={() => setIsNewProjectModalOpen(false)}
                onSuccess={() => {
                    fetchProjects();
                    setIsNewProjectModalOpen(false);
                }}
            />
        </div>
    );
}
