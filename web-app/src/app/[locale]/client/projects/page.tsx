import { Calendar, CheckCircle2, Clock, MoreVertical } from 'lucide-react';

export default function ClientProjects() {
    const projects = [
        {
            id: 1,
            name: 'Website Redesign',
            status: 'In Progress',
            progress: 60,
            dueDate: 'Dec 15, 2025',
            description: 'Complete overhaul of the corporate website with new branding and improved UX.',
            milestones: [
                { name: 'Design Phase', status: 'completed' },
                { name: 'Frontend Development', status: 'in-progress' },
                { name: 'Backend Integration', status: 'pending' },
            ]
        },
        {
            id: 2,
            name: 'Mobile App Development',
            status: 'Planning',
            progress: 15,
            dueDate: 'Jan 20, 2026',
            description: 'Native iOS and Android application for customer loyalty program.',
            milestones: [
                { name: 'Requirements Gathering', status: 'completed' },
                { name: 'UI/UX Design', status: 'in-progress' },
                { name: 'Development', status: 'pending' },
            ]
        }
    ];

    return (
        <div className="p-8 max-w-7xl mx-auto">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">My Projects</h1>
                    <p className="text-gray-600 mt-2">Track progress and milestones for all your active projects.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-6">
                {projects.map((project) => (
                    <div key={project.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                        <div className="p-6 border-b border-gray-100 flex justify-between items-start">
                            <div>
                                <div className="flex items-center space-x-3">
                                    <h2 className="text-xl font-bold text-gray-900">{project.name}</h2>
                                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${project.status === 'In Progress' ? 'bg-blue-100 text-blue-700' :
                                            project.status === 'Completed' ? 'bg-green-100 text-green-700' :
                                                'bg-yellow-100 text-yellow-700'
                                        }`}>
                                        {project.status}
                                    </span>
                                </div>
                                <p className="text-gray-600 mt-2 max-w-2xl">{project.description}</p>
                            </div>
                            <button className="text-gray-400 hover:text-gray-600">
                                <MoreVertical className="h-5 w-5" />
                            </button>
                        </div>

                        <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-8">
                            {/* Progress Section */}
                            <div className="col-span-1">
                                <div className="flex justify-between text-sm font-medium mb-2">
                                    <span className="text-gray-600">Overall Progress</span>
                                    <span className="text-indigo-600">{project.progress}%</span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2.5">
                                    <div
                                        className="bg-indigo-600 h-2.5 rounded-full transition-all duration-500"
                                        style={{ width: `${project.progress}%` }}
                                    ></div>
                                </div>
                                <div className="mt-4 flex items-center text-sm text-gray-500">
                                    <Calendar className="h-4 w-4 mr-2" />
                                    Due: {project.dueDate}
                                </div>
                            </div>

                            {/* Milestones Section */}
                            <div className="col-span-2">
                                <h3 className="text-sm font-medium text-gray-900 mb-4">Milestones</h3>
                                <div className="space-y-3">
                                    {project.milestones.map((milestone, idx) => (
                                        <div key={idx} className="flex items-center">
                                            {milestone.status === 'completed' ? (
                                                <CheckCircle2 className="h-5 w-5 text-green-500 mr-3" />
                                            ) : milestone.status === 'in-progress' ? (
                                                <Clock className="h-5 w-5 text-blue-500 mr-3" />
                                            ) : (
                                                <div className="h-5 w-5 rounded-full border-2 border-gray-300 mr-3"></div>
                                            )}
                                            <span className={`text-sm ${milestone.status === 'completed' ? 'text-gray-900 line-through' :
                                                    milestone.status === 'in-progress' ? 'text-blue-700 font-medium' :
                                                        'text-gray-500'
                                                }`}>
                                                {milestone.name}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
