import { CheckSquare, Folder, Clock, AlertCircle } from 'lucide-react';
import Link from 'next/link';

export default function TeamDashboard() {
    const stats = [
        { name: 'My Tasks', value: '8', icon: CheckSquare, color: 'bg-indigo-500' },
        { name: 'Active Projects', value: '3', icon: Folder, color: 'bg-blue-500' },
        { name: 'Pending Review', value: '2', icon: Clock, color: 'bg-yellow-500' },
        { name: 'Urgent', value: '1', icon: AlertCircle, color: 'bg-red-500' },
    ];

    const myTasks = [
        { id: 1, title: 'Implement Login Page', project: 'Website Redesign', priority: 'High', due: 'Today' },
        { id: 2, title: 'Fix Navigation Bug', project: 'Mobile App', priority: 'Medium', due: 'Tomorrow' },
        { id: 3, title: 'Update API Documentation', project: 'Website Redesign', priority: 'Low', due: 'Nov 26' },
        { id: 4, title: 'Optimize Database Queries', project: 'Internal Tools', priority: 'High', due: 'Nov 28' },
    ];

    return (
        <div className="p-8 max-w-7xl mx-auto">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900">Developer Dashboard</h1>
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
                {/* My Tasks Card */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                        <h2 className="text-lg font-semibold text-gray-900">My Tasks</h2>
                        <Link href="/team/tasks" className="text-sm text-indigo-600 hover:text-indigo-700 font-medium">
                            View All
                        </Link>
                    </div>
                    <div className="p-6">
                        <div className="space-y-4">
                            {myTasks.map((task) => (
                                <div key={task.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-100">
                                    <div className="flex items-start space-x-3">
                                        <div className={`mt-1 h-2 w-2 rounded-full ${task.priority === 'High' ? 'bg-red-500' :
                                                task.priority === 'Medium' ? 'bg-yellow-500' : 'bg-green-500'
                                            }`}></div>
                                        <div>
                                            <h3 className="text-sm font-medium text-gray-900">{task.title}</h3>
                                            <p className="text-xs text-gray-500">{task.project}</p>
                                        </div>
                                    </div>
                                    <span className="text-xs font-medium text-gray-500 bg-white px-2 py-1 rounded border border-gray-200">
                                        {task.due}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Assigned Projects Card */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="p-6 border-b border-gray-100">
                        <h2 className="text-lg font-semibold text-gray-900">Assigned Projects</h2>
                    </div>
                    <div className="p-6">
                        <div className="space-y-6">
                            {['Website Redesign', 'Mobile App', 'Internal Tools'].map((project, i) => (
                                <div key={i} className="flex items-center justify-between">
                                    <div className="flex items-center">
                                        <div className="h-10 w-10 rounded-lg bg-gray-900 text-white flex items-center justify-center font-bold">
                                            {project.charAt(0)}
                                        </div>
                                        <div className="ml-4">
                                            <h3 className="text-sm font-medium text-gray-900">{project}</h3>
                                            <p className="text-xs text-gray-500">Active</p>
                                        </div>
                                    </div>
                                    <div className="flex -space-x-2">
                                        {[1, 2, 3].map((u) => (
                                            <div key={u} className="h-8 w-8 rounded-full bg-gray-200 border-2 border-white flex items-center justify-center text-xs text-gray-500">
                                                U{u}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
