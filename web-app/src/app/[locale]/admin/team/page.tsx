import { UserPlus, MoreHorizontal, Mail, Shield, Briefcase, CheckCircle2 } from 'lucide-react';

export default function AdminTeam() {
    const team = [
        { id: 1, name: 'John Doe', role: 'Senior Developer', email: 'john@winningcode.com', status: 'Active', projects: 3, access: 'Developer' },
        { id: 2, name: 'Mike Johnson', role: 'Frontend Engineer', email: 'mike@winningcode.com', status: 'Active', projects: 2, access: 'Developer' },
        { id: 3, name: 'Sarah Connor', role: 'Project Manager', email: 'sarah@winningcode.com', status: 'Active', projects: 5, access: 'Admin' },
        { id: 4, name: 'David Smith', role: 'UI/UX Designer', email: 'david@winningcode.com', status: 'On Leave', projects: 1, access: 'Developer' },
    ];

    return (
        <div className="p-8 max-w-7xl mx-auto">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Team Management</h1>
                    <p className="text-gray-600 mt-2">Manage team members, roles, and access permissions.</p>
                </div>
                <button className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors">
                    <UserPlus className="h-4 w-4 mr-2" />
                    Add Member
                </button>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Member</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role & Access</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Active Projects</th>
                            <th scope="col" className="relative px-6 py-3"><span className="sr-only">Actions</span></th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {team.map((member) => (
                            <tr key={member.id} className="hover:bg-gray-50 transition-colors">
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="flex items-center">
                                        <div className="flex-shrink-0 h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 font-bold">
                                            {member.name.charAt(0)}
                                        </div>
                                        <div className="ml-4">
                                            <div className="text-sm font-medium text-gray-900">{member.name}</div>
                                            <div className="text-xs text-gray-500 flex items-center mt-0.5">
                                                <Mail className="h-3 w-3 mr-1" />
                                                {member.email}
                                            </div>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm text-gray-900 flex items-center">
                                        <Briefcase className="h-3 w-3 mr-1 text-gray-400" />
                                        {member.role}
                                    </div>
                                    <div className="text-xs text-gray-500 flex items-center mt-1">
                                        <Shield className="h-3 w-3 mr-1 text-indigo-500" />
                                        {member.access} Access
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${member.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                                        }`}>
                                        {member.status}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    <div className="flex items-center">
                                        <CheckCircle2 className="h-4 w-4 mr-2 text-gray-400" />
                                        {member.projects} Projects
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                    <button className="text-gray-400 hover:text-gray-600">
                                        <MoreHorizontal className="h-5 w-5" />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
