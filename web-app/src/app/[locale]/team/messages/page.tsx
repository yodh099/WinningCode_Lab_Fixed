import { Send, User, Hash } from 'lucide-react';

export default function TeamMessages() {
    const channels = [
        { id: 1, name: 'general', unread: 0 },
        { id: 2, name: 'website-redesign', unread: 3 },
        { id: 3, name: 'mobile-app', unread: 0 },
        { id: 4, name: 'announcements', unread: 1 },
    ];

    const messages = [
        { id: 1, sender: 'Project Manager', text: 'Team, we need to prioritize the login flow for the website redesign.', time: '09:00 AM', isMe: false, role: 'Admin' },
        { id: 2, sender: 'Me', text: 'I am working on it right now. Should be done by EOD.', time: '09:15 AM', isMe: true, role: 'Dev' },
        { id: 3, sender: 'Designer', text: 'I just updated the Figma file with the new assets.', time: '09:30 AM', isMe: false, role: 'Design' },
    ];

    return (
        <div className="flex h-[calc(100vh-64px)] bg-white">
            {/* Channels Sidebar */}
            <div className="w-64 bg-gray-50 border-r border-gray-200 flex flex-col">
                <div className="p-4 border-b border-gray-200">
                    <h2 className="font-bold text-gray-700">Channels</h2>
                </div>
                <div className="flex-1 overflow-y-auto p-2 space-y-1">
                    {channels.map((channel) => (
                        <button key={channel.id} className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm ${channel.name === 'website-redesign' ? 'bg-indigo-50 text-indigo-700 font-medium' : 'text-gray-600 hover:bg-gray-100'}`}>
                            <div className="flex items-center">
                                <Hash className="h-4 w-4 mr-2 opacity-70" />
                                {channel.name}
                            </div>
                            {channel.unread > 0 && (
                                <span className="bg-indigo-600 text-white text-xs px-2 py-0.5 rounded-full">
                                    {channel.unread}
                                </span>
                            )}
                        </button>
                    ))}
                </div>
            </div>

            {/* Chat Area */}
            <div className="flex-1 flex flex-col bg-white">
                <div className="p-4 border-b border-gray-200 flex justify-between items-center shadow-sm z-10">
                    <div className="flex items-center">
                        <Hash className="h-5 w-5 text-gray-400 mr-2" />
                        <h2 className="font-bold text-gray-900">website-redesign</h2>
                        <span className="ml-4 text-xs text-gray-500">Topic: Main website overhaul project</span>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                    {messages.map((msg) => (
                        <div key={msg.id} className={`flex ${msg.isMe ? 'justify-end' : 'justify-start'}`}>
                            <div className={`flex max-w-[70%] ${msg.isMe ? 'flex-row-reverse' : 'flex-row'}`}>
                                <div className={`flex-shrink-0 h-10 w-10 rounded-lg flex items-center justify-center ${msg.role === 'Admin' ? 'bg-purple-100 text-purple-600' :
                                        msg.role === 'Design' ? 'bg-pink-100 text-pink-600' :
                                            msg.isMe ? 'bg-indigo-100 text-indigo-600 ml-3' : 'bg-gray-200 text-gray-600 mr-3'
                                    }`}>
                                    <span className="font-bold text-xs">{msg.sender.charAt(0)}</span>
                                </div>
                                <div className={msg.isMe ? 'mr-3' : 'ml-3'}>
                                    <div className={`flex items-baseline mb-1 ${msg.isMe ? 'justify-end' : 'justify-start'}`}>
                                        <span className="text-sm font-bold text-gray-900 mr-2">{msg.sender}</span>
                                        <span className="text-xs text-gray-500">{msg.time}</span>
                                    </div>
                                    <div className={`p-4 rounded-lg shadow-sm ${msg.isMe ? 'bg-indigo-600 text-white rounded-tr-none' : 'bg-gray-100 text-gray-900 rounded-tl-none'
                                        }`}>
                                        <p className="text-sm leading-relaxed">{msg.text}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="p-4 border-t border-gray-200 bg-gray-50">
                    <div className="bg-white border border-gray-300 rounded-lg shadow-sm flex items-center p-2">
                        <input
                            type="text"
                            placeholder="Message #website-redesign..."
                            className="flex-1 px-4 py-2 focus:outline-none text-sm"
                        />
                        <button className="p-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors">
                            <Send className="h-4 w-4" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
