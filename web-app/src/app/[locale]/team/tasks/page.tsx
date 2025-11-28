import { Plus, MoreHorizontal, Calendar } from 'lucide-react';

export default function TeamTasks() {
    const columns = [
        { name: 'To Do', color: 'bg-gray-100', dot: 'bg-gray-400' },
        { name: 'In Progress', color: 'bg-blue-50', dot: 'bg-blue-500' },
        { name: 'Review', color: 'bg-yellow-50', dot: 'bg-yellow-500' },
        { name: 'Done', color: 'bg-green-50', dot: 'bg-green-500' },
    ];

    const tasks = [
        { id: 1, title: 'Implement Login Page', project: 'Website Redesign', status: 'In Progress', assignee: 'Me', due: 'Today', priority: 'High' },
        { id: 2, title: 'Database Schema Design', project: 'Mobile App', status: 'To Do', assignee: 'Me', due: 'Nov 28', priority: 'Medium' },
        { id: 3, title: 'API Integration', project: 'Website Redesign', status: 'Review', assignee: 'John', due: 'Yesterday', priority: 'High' },
        { id: 4, title: 'Setup CI/CD Pipeline', project: 'Internal Tools', status: 'Done', assignee: 'Me', due: 'Nov 20', priority: 'Medium' },
    ];

    return (
        <div className="p-8 h-full flex flex-col">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Task Board</h1>
                    <p className="text-gray-600 mt-2">Manage and track your development tasks.</p>
                </div>
                <button className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors">
                    <Plus className="h-4 w-4 mr-2" />
                    New Task
                </button>
            </div>

            <div className="flex-1 overflow-x-auto">
                <div className="flex space-x-6 min-w-max h-full pb-4">
                    {columns.map((column) => (
                        <div key={column.name} className="w-80 flex flex-col bg-gray-50 rounded-xl border border-gray-200 h-full">
                            <div className="p-4 border-b border-gray-200 flex justify-between items-center">
                                <div className="flex items-center">
                                    <div className={`h-2 w-2 rounded-full ${column.dot} mr-2`}></div>
                                    <h3 className="font-semibold text-gray-700">{column.name}</h3>
                                    <span className="ml-2 bg-gray-200 text-gray-600 px-2 py-0.5 rounded-full text-xs font-medium">
                                        {tasks.filter(t => t.status === column.name).length}
                                    </span>
                                </div>
                                <button className="text-gray-400 hover:text-gray-600">
                                    <Plus className="h-4 w-4" />
                                </button>
                            </div>

                            <div className="p-4 space-y-4 overflow-y-auto flex-1">
                                {tasks.filter(t => t.status === column.name).map((task) => (
                                    <div key={task.id} className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow cursor-pointer">
                                        <div className="flex justify-between items-start mb-2">
                                            <span className={`px-2 py-1 rounded text-xs font-medium ${task.priority === 'High' ? 'bg-red-100 text-red-700' :
                                                task.priority === 'Medium' ? 'bg-yellow-100 text-yellow-700' :
                                                    'bg-green-100 text-green-700'
                                                }`}>
                                                {task.priority}
                                            </span>
                                            <button className="text-gray-400 hover:text-gray-600">
                                                <MoreHorizontal className="h-4 w-4" />
                                            </button>
                                        </div>
                                        <h4 className="font-medium text-gray-900 mb-1">{task.title}</h4>
                                        <p className="text-xs text-gray-500 mb-3">{task.project}</p>

                                        <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                                            <div className="flex items-center text-xs text-gray-500">
                                                <Calendar className="h-3 w-3 mr-1" />
                                                {task.due}
                                            </div>
                                            <div className="flex items-center">
                                                <div className="h-6 w-6 rounded-full bg-indigo-100 flex items-center justify-center text-xs text-indigo-700 font-bold" title={task.assignee}>
                                                    {task.assignee.charAt(0)}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
