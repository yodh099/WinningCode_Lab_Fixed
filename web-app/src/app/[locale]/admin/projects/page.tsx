import { Plus, MoreVertical, Calendar, CheckCircle2, AlertTriangle } from 'lucide-react';

export default function AdminProjects() {
    const projects = [
        {
            id: 1,
            name: 'Website Redesign',
            client: 'Acme Corp',
            status: 'In Progress',
            progress: 60,
            dueDate: 'Dec 15, 2025',
            budget: '$15,000',
            team: ['John Doe', 'Mike Johnson'],
            priority: 'High'
        },
        {
            id: 2,
            name: 'Mobile App Development',
            client: 'TechStart Inc',
            status: 'Planning',
            progress: 15,
            dueDate: 'Jan 20, 2026',
            budget: '$25,000',
            team: ['Alice Smith'],
            priority: 'Medium'
        },
        {
            id: 3,
            name: 'Internal Dashboard',
            client: 'NextGen Solutions',
            status: 'Review',
            progress: 90,
            dueDate: 'Nov 30, 2025',
            budget: '$8,000',
            team: ['John Doe'],
            priority: 'Low'
        }
    ];

    return (
        <div className="p-8 max-w-7xl mx-auto">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Project Management</h1>
                    <p className="text-gray-600 mt-2">Oversee all active projects, timelines, and budgets.</p>
                </div>
                <button className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors">
                    <Plus className="h-4 w-4 mr-2" />
                    New Project
                </button>
            </div>

            <div className="grid grid-cols-1 gap-6">
                {projects.map((project) => (
                    <div key={project.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
                        <div className="p-6">
                            <div className="flex justify-between items-start">
                                <div className="flex items-start space-x-4">
                                    <div className={`h-12 w-12 rounded-lg flex items-center justify-center text-white font-bold text-lg ${project.priority === 'High' ? 'bg-indigo-600' :
                                        project.priority === 'Medium' ? 'bg-blue-500' : 'bg-gray-500'
                                        }`}>
                                        {project.name.charAt(0)}
                                    </div>
                                    <div>
                                        <h2 className="text-xl font-bold text-gray-900">{project.name}</h2>
                                        <p className="text-sm text-gray-500 mt-1">Client: <span className="font-medium text-gray-900">{project.client}</span></p>
                                    </div>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${project.status === 'In Progress' ? 'bg-blue-100 text-blue-700' :
                                        project.status === 'Review' ? 'bg-yellow-100 text-yellow-700' :
                                            project.status === 'Planning' ? 'bg-gray-100 text-gray-700' :
                                                'bg-green-100 text-green-700'
                                        }`}>
                                        {project.status}
                                    </span>
                                    <button className="text-gray-400 hover:text-gray-600 p-1">
                                        <MoreVertical className="h-5 w-5" />
                                    </button>
                                </div>
                            </div>

                            <div className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-6">
                                <div className="col-span-2">
                                    <div className="flex justify-between text-sm font-medium mb-2">
                                        <span className="text-gray-600">Progress</span>
                                        <span className="text-indigo-600">{project.progress}%</span>
                                    </div>
                                    <div className="w-full bg-gray-200 rounded-full h-2">
                                        <div
                                            className="bg-indigo-600 h-2 rounded-full transition-all duration-500"
                                            style={{ width: `${project.progress}%` }}
                                        ></div>
                                    </div>
                                </div>

                                <div className="flex flex-col justify-center">
                                    <span className="text-xs text-gray-500 uppercase tracking-wider font-medium">Due Date</span>
                                    <div className="flex items-center mt-1 text-sm text-gray-900">
                                        <Calendar className="h-4 w-4 mr-2 text-gray-400" />
                                        {project.dueDate}
                                    </div>
                                </div>

                                <div className="flex flex-col justify-center">
                                    <span className="text-xs text-gray-500 uppercase tracking-wider font-medium">Budget</span>
                                    <div className="flex items-center mt-1 text-sm font-bold text-gray-900">
                                        {project.budget}
                                    </div>
                                </div>
                            </div>

                            <div className="mt-6 pt-6 border-t border-gray-100 flex justify-between items-center">
                                <div className="flex -space-x-2">
                                    {project.team.map((member, i) => (
                                        <div key={i} className="h-8 w-8 rounded-full bg-gray-200 border-2 border-white flex items-center justify-center text-xs font-medium text-gray-600" title={member}>
                                            {member.charAt(0)}
                                        </div>
                                    ))}
                                    <button className="h-8 w-8 rounded-full bg-gray-100 border-2 border-white flex items-center justify-center text-xs text-gray-500 hover:bg-gray-200">
                                        <Plus className="h-3 w-3" />
                                    </button>
                                </div>

                                <div className="flex space-x-4 text-sm text-gray-500">
                                    <span className="flex items-center">
                                        <CheckCircle2 className="h-4 w-4 mr-1 text-green-500" />
                                        12 Tasks Done
                                    </span>
                                    <span className="flex items-center">
                                        <AlertTriangle className="h-4 w-4 mr-1 text-yellow-500" />
                                        2 Issues
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
