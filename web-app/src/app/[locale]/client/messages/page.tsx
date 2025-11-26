import { Send, User } from 'lucide-react';

export default function ClientMessages() {
    const messages = [
        { id: 1, sender: 'Admin', text: 'Hello! I wanted to update you on the design phase.', time: '10:30 AM', isMe: false },
        { id: 2, sender: 'Me', text: 'Great, I am looking forward to seeing the mockups.', time: '10:32 AM', isMe: true },
        { id: 3, sender: 'Admin', text: 'I have uploaded them to the files section for your review.', time: '10:35 AM', isMe: false },
    ];

    return (
        <div className="flex flex-col h-[calc(100vh-64px)] bg-gray-50">
            <div className="bg-white border-b border-gray-200 p-4 flex items-center justify-between">
                <div>
                    <h1 className="text-xl font-bold text-gray-900">Project Manager</h1>
                    <p className="text-sm text-green-500 flex items-center">
                        <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                        Online
                    </p>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map((msg) => (
                    <div key={msg.id} className={`flex ${msg.isMe ? 'justify-end' : 'justify-start'}`}>
                        <div className={`flex max-w-[70%] ${msg.isMe ? 'flex-row-reverse' : 'flex-row'}`}>
                            <div className={`flex-shrink-0 h-8 w-8 rounded-full flex items-center justify-center ${msg.isMe ? 'bg-indigo-100 ml-2' : 'bg-gray-200 mr-2'}`}>
                                <User className={`h-4 w-4 ${msg.isMe ? 'text-indigo-600' : 'text-gray-500'}`} />
                            </div>
                            <div>
                                <div className={`p-3 rounded-lg ${msg.isMe ? 'bg-indigo-600 text-white rounded-tr-none' : 'bg-white border border-gray-200 text-gray-900 rounded-tl-none'}`}>
                                    <p className="text-sm">{msg.text}</p>
                                </div>
                                <p className={`text-xs mt-1 ${msg.isMe ? 'text-right text-gray-500' : 'text-left text-gray-500'}`}>
                                    {msg.time}
                                </p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="bg-white border-t border-gray-200 p-4">
                <div className="flex items-center space-x-4">
                    <input
                        type="text"
                        placeholder="Type your message..."
                        className="flex-1 border border-gray-300 rounded-full px-4 py-2 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                    />
                    <button className="bg-indigo-600 text-white p-2 rounded-full hover:bg-indigo-700 transition-colors">
                        <Send className="h-5 w-5" />
                    </button>
                </div>
            </div>
        </div>
    );
}
