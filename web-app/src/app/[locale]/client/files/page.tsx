import { FileText, Download, Upload, MoreHorizontal, Image as ImageIcon, FileCode } from 'lucide-react';

export default function ClientFiles() {
    const files = [
        { id: 1, name: 'Homepage_Mockup_v2.fig', type: 'image', size: '4.2 MB', date: 'Nov 23, 2025', uploadedBy: 'Admin' },
        { id: 2, name: 'Project_Requirements.pdf', type: 'document', size: '1.5 MB', date: 'Nov 20, 2025', uploadedBy: 'Me' },
        { id: 3, name: 'Database_Schema.sql', type: 'code', size: '256 KB', date: 'Nov 22, 2025', uploadedBy: 'Admin' },
    ];

    const getIcon = (type: string) => {
        switch (type) {
            case 'image': return <ImageIcon className="h-6 w-6 text-purple-500" />;
            case 'code': return <FileCode className="h-6 w-6 text-blue-500" />;
            default: return <FileText className="h-6 w-6 text-gray-500" />;
        }
    };

    return (
        <div className="p-8 max-w-7xl mx-auto">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Files & Documents</h1>
                    <p className="text-gray-600 mt-2">Access and manage project deliverables and resources.</p>
                </div>
                <button className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors">
                    <Upload className="h-4 w-4 mr-2" />
                    Upload File
                </button>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Size</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date Uploaded</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Uploaded By</th>
                            <th scope="col" className="relative px-6 py-3"><span className="sr-only">Actions</span></th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {files.map((file) => (
                            <tr key={file.id} className="hover:bg-gray-50 transition-colors">
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="flex items-center">
                                        <div className="flex-shrink-0 h-10 w-10 rounded-lg bg-gray-100 flex items-center justify-center">
                                            {getIcon(file.type)}
                                        </div>
                                        <div className="ml-4">
                                            <div className="text-sm font-medium text-gray-900">{file.name}</div>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{file.size}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{file.date}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{file.uploadedBy}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                    <div className="flex items-center justify-end space-x-2">
                                        <button className="text-indigo-600 hover:text-indigo-900 p-2 hover:bg-indigo-50 rounded-full">
                                            <Download className="h-4 w-4" />
                                        </button>
                                        <button className="text-gray-400 hover:text-gray-600 p-2 hover:bg-gray-100 rounded-full">
                                            <MoreHorizontal className="h-4 w-4" />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
