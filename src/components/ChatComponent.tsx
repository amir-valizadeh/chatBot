import React, { useState, useRef, useEffect } from 'react';
import {Attatchment01, ExploreIcon, Frame, NewChatIcon, Sidebar, Vector} from "../icons";
import Logo from '../../public/logo.png';

// Type definitions
interface Conversation {
    id: number;
    title: string;
}

interface ConversationGroups {
    today: Conversation[];
    week: Conversation[];
    month: Conversation[];
}

interface Message {
    id: number;
    text: string;
    file?: File | null;
    sender: 'user' | 'bot';
    timestamp: string;
}

interface KeyboardEvent {
    key: string;
}

const ChatInterface: React.FC = () => {
    // State management
    const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(true);
    const [inputMessage, setInputMessage] = useState<string>('');
    const [chatHistory, setChatHistory] = useState<Message[]>([]);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [conversations, setConversations] = useState<ConversationGroups>({
        today: [
            { id: 1, title: 'سفر به کلیولند' },
            { id: 2, title: 'سفر به کلیولند' }
        ],
        week: [
            { id: 3, title: 'سفر به کلیولند' },
            { id: 4, title: 'سفر به کلیولند' },
            { id: 5, title: 'سفر به کلیولند' }
        ],
        month: [
            { id: 6, title: 'سفر به کلیولند' },
            { id: 7, title: 'سفر به کلیولند' },
            { id: 8, title: 'سفر به کلیولند' }
        ]
    });

    const fileInputRef = useRef<HTMLInputElement>(null);
    const chatContainerRef = useRef<HTMLDivElement>(null);

    // Toggle sidebar
    const toggleSidebar = (): void => {
        setIsSidebarOpen(!isSidebarOpen);
    };

    // Handle file attachment
    const handleFileAttachment = (): void => {
        if (fileInputRef?.current) fileInputRef.current.click();
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
        if (e.target.files && e.target.files.length > 0) {
            setSelectedFile(e.target.files[0]);
        }
    };

    // Handle input message
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
        setInputMessage(e.target.value);
    };

    // Handle message submission
    const handleSubmit = (): void => {
        if (inputMessage.trim() === '' && !selectedFile) return;

        const newMessage: Message = {
            id: Date.now(),
            text: inputMessage,
            file: selectedFile,
            sender: 'user',
            timestamp: new Date().toISOString()
        };

        setChatHistory([...chatHistory, newMessage]);

        // Simulate bot response after a delay
        setTimeout(() => {
            const botResponse: Message = {
                id: Date.now() + 1,
                text: 'این یک پاسخ خودکار است.', // This is an automatic response
                sender: 'bot',
                timestamp: new Date().toISOString()
            };
            setChatHistory(prevChat => [...prevChat, botResponse]);
        }, 1000);

        // Create a new conversation if this is the start of one
        if (chatHistory.length === 0) {
            const newConversation: Conversation = {
                id: Date.now(),
                title: inputMessage.substring(0, 30) + (inputMessage.length > 30 ? '...' : '')
            };

            setConversations(prev => ({
                ...prev,
                today: [newConversation, ...prev.today]
            }));
        }

        // Clear input and file after sending
        setInputMessage('');
        setSelectedFile(null);
    };

    // Handle creating a new chat
    const handleNewChat = (): void => {
        setChatHistory([]);
    };

    // Handle selecting a conversation
    const handleSelectConversation = (id: number): void => {
        // In a real app, you would load the conversation from a database
        // For now, just simulating different conversations
        setChatHistory([
            { id: Date.now() - 1000, text: `این مکالمه ${id} است.`, sender: 'user', timestamp: new Date().toISOString() },
            { id: Date.now() - 500, text: 'بله، چطور می‌توانم کمک کنم؟', sender: 'bot', timestamp: new Date().toISOString() }
        ]);
    };

    // Scroll to bottom of chat when messages change
    useEffect(() => {
        if (chatContainerRef.current) {
            chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
        }
    }, [chatHistory]);

    // Handle Enter key press in input field
    const handleKeyPress = (e: KeyboardEvent): void => {
        if (e.key === 'Enter') {
            handleSubmit();
        }
    };

    return (
        <div className="flex h-screen w-full bg-white">
            {/* Main content area */}
            <div className="flex-1 flex flex-col relative">
                {!isSidebarOpen && (
                    <button
                        className="absolute top-4 right-4 z-10 p-2 rounded-full bg-gray-100 hover:bg-gray-200"
                        onClick={toggleSidebar}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="3" y1="12" x2="21" y2="12"></line>
                            <line x1="3" y1="6" x2="21" y2="6"></line>
                            <line x1="3" y1="18" x2="21" y2="18"></line>
                        </svg>
                    </button>
                )}
                {/* Top header */}
                <div className="h-12 bg-white flex items-center px-4">
                    <div className="flex items-center">
                        <button className="flex items-center focus:outline-none hover:cursor-pointer">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 text-gray-500 ml-1">
                                <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" clipRule="evenodd" />
                            </svg>
                            <span className="text-sm text-gray-700">پگاه آفتاب</span>
                        </button>
                    </div>

                    <div className="ml-auto flex items-center space-x-4 space-x-reverse">
                        {/* You can add more header items here if needed */}
                    </div>
                </div>

                {/* Chat area */}
                <div
                    ref={chatContainerRef}
                    className="flex-1 overflow-y-auto p-4 flex flex-col "
                    style={{
                        justifyContent: chatHistory.length === 0 ? 'center' : 'flex-end'
                    }}
                >
                    {chatHistory.length === 0 ? (
                        // Empty state with prompt
                        <div className="flex flex-col w-full items-center justify-center relative ">
                            <h2 className="text-xl text-gray-800 font-normal text-center w-full">چطور می‌توانم کمکت کنم؟</h2>
                        </div>
                    ) : (
                        // Chat messages
                        chatHistory.map((message) => (
                            <div
                                key={message.id}
                                className={`max-w-3/4 mb-4 ${message.sender === 'user' ? 'self-end' : 'self-start'}`}
                            >
                                <div
                                    className={`p-3 rounded-lg ${
                                        message.sender === 'user'
                                            ? 'bg-blue-100 text-right'
                                            : 'bg-gray-100 text-right'
                                    }`}
                                >
                                    {message.text}
                                    {message.file && (
                                        <div className="mt-2 text-xs text-gray-500">
                                            فایل پیوست: {message.file.name}
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {/* Input area */}
                <div className={`p-4 pb-6 flex flex-col w-full ${chatHistory.length > 0 ? 'shadow-inner ' : 'absolute top-[55%]'} bg-white`}>
                    <div className={`bg-white ${chatHistory.length === 0 ? 'w-3xl drop-shadow-2xl shadow-2xl ' : 'w-full'} min-h-24 rounded-3xl border border-gray-200 flex flex-col items-center mx-auto`}>
                        <input
                            type="text"
                            className="flex-1 w-full py-3 px-4 text-right bg-transparent focus:outline-none text-gray-600 placeholder-gray-400"
                            placeholder="هر چی می‌خواهی بپرس"
                            value={inputMessage}
                            onChange={handleInputChange}
                            onKeyPress={handleKeyPress}
                        />

                        {selectedFile && (
                            <div className="w-full px-4 py-2 text-right text-sm text-gray-600">
                                فایل انتخاب شده: {selectedFile.name}
                                <button
                                    className="ml-2 text-red-500"
                                    onClick={() => setSelectedFile(null)}
                                >
                                    ×
                                </button>
                            </div>
                        )}

                        <div className="flex w-full justify-between items-center px-4 py-2">
                            <button
                                className={`size-8 flex items-center justify-center bg-gray-500  ${inputMessage.trim() === '' && !selectedFile ? 'opacity-50 cursor-not-allowed' : ''} rounded-full`}
                                onClick={handleSubmit}
                                disabled={inputMessage.trim() === '' && !selectedFile}
                            >
                                <Frame/>
                            </button>

                            <input
                                type="file"
                                ref={fileInputRef}
                                onChange={handleFileChange}
                                style={{ display: 'none' }}
                            />

                            <button
                                className="w-12 h-12 flex items-center justify-center"
                                onClick={handleFileAttachment}
                            >
                                <Attatchment01/>
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Sidebar - conditionally rendered based on state */}
            {isSidebarOpen && (
                <div className="w-72 bg-[#F9F9F9] p-4">
                    {/* User profile */}
                    <div className="flex justify-start gap-4 mb-4 [&>svg]:cursor-pointer">
                        <NewChatIcon onClick={handleNewChat} />
                        <Vector className="mr-auto" />
                        <Sidebar onClick={toggleSidebar} />
                    </div>

                    <div className="flex flex-col items-end gap-4">
                        <img src={Logo} width={104} height={24} alt="Logo" />
                        <div className="flex gap-2">
                            <span className="text-xs text-gray-500">اکسپلور</span>
                            <ExploreIcon/>
                        </div>
                    </div>

                    {/* Chat history */}
                    <div className="py-2">
                        <div className="text-xs text-gray-400 text-right mt-4 mb-3">امروز</div>
                        <div className="space-y-3">
                            {conversations.today.map((conv) => (
                                <div
                                    key={conv.id}
                                    className="text-sm text-right text-[$141B34] cursor-pointer hover:bg-gray-200 p-2 rounded"
                                    onClick={() => handleSelectConversation(conv.id)}
                                >
                                    {conv.title}
                                </div>
                            ))}
                        </div>

                        <div className="text-xs text-gray-400 text-right mt-4 mb-3">۷ روز پیش</div>
                        <div className="space-y-3">
                            {conversations.week.map((conv) => (
                                <div
                                    key={conv.id}
                                    className="text-sm text-right text-[$141B34] cursor-pointer hover:bg-gray-200 p-2 rounded"
                                    onClick={() => handleSelectConversation(conv.id)}
                                >
                                    {conv.title}
                                </div>
                            ))}
                        </div>

                        <div className="text-xs text-gray-400 text-right mt-4 mb-3">۳۰ روز پیش</div>
                        <div className="space-y-3">
                            {conversations.month.map((conv) => (
                                <div
                                    key={conv.id}
                                    className="text-sm text-right text-[$141B34] cursor-pointer hover:bg-gray-200 p-2 rounded"
                                    onClick={() => handleSelectConversation(conv.id)}
                                >
                                    {conv.title}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ChatInterface;