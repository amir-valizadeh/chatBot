import React, { useState, useRef, useEffect } from 'react';
import { Attatchment01, ExploreIcon, Frame, NewChatIcon, Sidebar, Vector } from "../icons";
import Logo from '../../public/logo.png';
import apiService from "../services/api";

// Type definitions
interface Conversation {
    id: string;
    title: string;
    created_at: string;
}

interface Message {
    id: number;
    text: string;
    file?: File | null;
    sender: 'user' | 'bot' |string;
    timestamp: string;
}

interface ApiMessage {
    role: 'user' | 'assistant';
    content: string;
    timestamp: string;
}

interface ChatKeyboardEvent {
    key: string;
}

const ChatInterface: React.FC = () => {
    // State management
    const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(true);
    const [inputMessage, setInputMessage] = useState<string>('');
    const [chatHistory, setChatHistory] = useState<Message[]>([]);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [currentChatId, setCurrentChatId] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);

    // Search functionality
    const [searchQuery, setSearchQuery] = useState<string>('');
    const [searchResults, setSearchResults] = useState<Conversation[]>([]);
    const [isSearching, setIsSearching] = useState<boolean>(false);
    const [isSearchBarVisible, setIsSearchBarVisible] = useState<boolean>(false);

    const fileInputRef = useRef<HTMLInputElement>(null);
    const chatContainerRef = useRef<HTMLDivElement>(null);

    // Load conversations from API
    useEffect(() => {
        const loadConversations = async () => {
            try {
                const result = await apiService.getCompanyChats();
                if (result.chats && Array.isArray(result.chats)) {
                    // Format conversations for display
                    const formattedChats = result.chats.map(chat => ({
                        id: chat.chat_id,
                        title: ` ${chat.chat_id.substring(0, 10)}...`,
                        created_at: chat.created_at
                    }));
                    setConversations(formattedChats);
                }
            } catch (error) {
                console.error('Failed to load conversations:', error);
            }
        };

        loadConversations();
    }, []);

    // Search effect - filter conversations when search query changes
    useEffect(() => {
        if (searchQuery.trim() === '') {
            setSearchResults([]);
            setIsSearching(false);
            return;
        }

        setIsSearching(true);
        const query = searchQuery.toLowerCase();

        // First search through conversation titles
        const filteredConversations = conversations.filter(conv =>
            conv.title.toLowerCase().includes(query)
        );

        setSearchResults(filteredConversations);

        // If connected to API and you want to search through message content too:
        // This would require additional API call to search through message content
        // For this example, we'll just search through titles
    }, [searchQuery, conversations]);

    // Toggle sidebar
    const toggleSidebar = (): void => {
        setIsSidebarOpen(!isSidebarOpen);
    };

    // Toggle search bar visibility
    const toggleSearchBar = (): void => {
        setIsSearchBarVisible(!isSearchBarVisible);
        if (isSearchBarVisible) {
            // Clear search when hiding search bar
            setSearchQuery('');
            setSearchResults([]);
            setIsSearching(false);
        }
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

    // Handle search input
    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
        setSearchQuery(e.target.value);
    };

    // Clear search
    const clearSearch = (): void => {
        setSearchQuery('');
        setSearchResults([]);
        setIsSearching(false);
    };

    // Handle message submission
    const handleSubmit = async (): Promise<void> => {
        if (inputMessage.trim() === '' && !selectedFile) return;
        setIsLoading(true);

        // Add user message to chat
        const newMessage: Message = {
            id: Date.now(),
            text: inputMessage,
            file: selectedFile,
            sender: 'user',
            timestamp: new Date().toISOString()
        };

        setChatHistory(prev => [...prev, newMessage]);

        try {
            // Send message to API using the chat ID (either existing or newly created)
            const response = await apiService.sendMessage(inputMessage, currentChatId);

            // Refresh conversations list if we created a new chat
            if (!currentChatId) {
                const result = await apiService.getCompanyChats();
                if (result.chats && Array.isArray(result.chats)) {
                    const formattedChats = result.chats.map(chat => ({
                        id: chat.chat_id,
                        title: `Chat ${chat.chat_id.substring(0, 8)}...`,
                        created_at: chat.created_at
                    }));
                    setConversations(formattedChats);
                }
            }

            // Add bot response to chat
            const botResponse: Message = {
                id: Date.now() + 1,
                text: response.response || 'Sorry, I could not process your request.',
                sender: 'bot',
                timestamp: new Date().toISOString()
            };

            setChatHistory(prev => [...prev, botResponse]);
        } catch (error) {
            console.error('Error sending message:', error);

            // Add error message to chat
            const errorMessage: Message = {
                id: Date.now() + 1,
                text: 'مشکلی در ارتباط با سرور به وجود آمد. لطفا دوباره تلاش کنید.',
                sender: 'bot',
                timestamp: new Date().toISOString()
            };

            setChatHistory(prev => [...prev, errorMessage]);
        } finally {
            setIsLoading(false);
            setInputMessage('');
            setSelectedFile(null);
        }
    };

    // Handle creating a new chat
    const handleNewChat = (): void => {
        setChatHistory([]);
        setCurrentChatId(null);
    };

    // Handle selecting a conversation
    const handleSelectConversation = async (chatId: string): Promise<void> => {
        setIsLoading(true);
        setCurrentChatId(chatId);
        // Close search bar and clear search when selecting a conversation
        setIsSearchBarVisible(false);
        clearSearch();

        try {
            // Load chat history from API
            const history = await apiService.getChatHistory(chatId);

            if (history.messages && Array.isArray(history.messages)) {
                // Convert API format to our Message format
                const formattedMessages = history.messages.map((msg: ApiMessage, index: number) => ({
                    id: Date.now() - (1000 * (history.messages.length - index)),
                    text: msg.content,
                    sender: msg.role === 'user' ? 'user' : 'bot',
                    timestamp: msg.timestamp
                }));

                setChatHistory(formattedMessages);
            }
        } catch (error) {
            console.error('Failed to load chat history:', error);
            setChatHistory([]);
        } finally {
            setIsLoading(false);
        }
    };

    // Scroll to bottom of chat when messages change
    useEffect(() => {
        if (chatContainerRef.current) {
            chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
        }
    }, [chatHistory]);

    // Handle Enter key press in input field
    const handleKeyPress = (e: ChatKeyboardEvent): void => {
        if (e.key === 'Enter') {
            handleSubmit();
        }
    };

    // Group conversations by date
    const groupConversations = () => {
        const today = new Date();
        const oneWeekAgo = new Date(today);
        oneWeekAgo.setDate(today.getDate() - 7);
        const oneMonthAgo = new Date(today);
        oneMonthAgo.setDate(today.getDate() - 30);

        const groupedConversations = {
            today: [] as Conversation[],
            week: [] as Conversation[],
            month: [] as Conversation[],
            older: [] as Conversation[]
        };

        // Use search results if searching, otherwise use all conversations
        const convsToGroup = isSearching ? searchResults : conversations;

        convsToGroup.forEach(conv => {
            const convDate = new Date(conv.created_at);

            if (convDate.toDateString() === today.toDateString()) {
                groupedConversations.today.push(conv);
            } else if (convDate >= oneWeekAgo) {
                groupedConversations.week.push(conv);
            } else if (convDate >= oneMonthAgo) {
                groupedConversations.month.push(conv);
            } else {
                groupedConversations.older.push(conv);
            }
        });

        return groupedConversations;
    };

    const groupedConvs = groupConversations();

    return (
        <div className="flex h-screen w-full bg-white pb-8">
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
                            <h2 className="text-xl text-gray-800 font-normal text-center w-full ">من هوروش هستم, دستیار فنی هوشمند شما, چطور می‌توانم کمک کنم؟</h2>
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

                    {isLoading && (
                        <div className="self-start p-3 bg-gray-100 rounded-lg mb-10">
                            <div className="flex space-x-reverse">
                                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.3s' }}></div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Input area */}
                <div className={`p-4 pb-6 flex flex-col w-full ${chatHistory.length > 0 ? 'shadow-inner ' : 'absolute top-[60%] xl:top-[55%] '} bg-white`}>
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
                                className={`size-8 flex items-center justify-center bg-gray-500 ${isLoading || (inputMessage.trim() === '' && !selectedFile) ? 'opacity-50 cursor-not-allowed' : ''} rounded-full`}
                                onClick={handleSubmit}
                                disabled={isLoading || (inputMessage.trim() === '' && !selectedFile)}
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
                <div className="w-72 bg-[#F9F9F9] p-4 overflow-auto">
                    {/* User profile */}
                    <div className="flex justify-start gap-4 mb-4 [&>svg]:cursor-pointer">
                        <NewChatIcon className="mr-auto" onClick={handleNewChat} />

                        <Sidebar  onClick={toggleSidebar} />
                    </div>

                    <div className="flex flex-col items-end  gap-4 mb-4">
                        <img src={Logo} width={104} height={24} alt="Logo" />
                        <div className="flex gap-2 w-full items-center">
                            <button
                                className="p-2 hover:bg-gray-200 rounded-full mr-auto"
                                onClick={toggleSearchBar}
                            >
                                <Vector  />
                            </button>
                            <span className="text-xs text-gray-500">اکسپلور</span>
                            <ExploreIcon/>

                        </div>
                    </div>

                    {/* Search icon and bar */}
                    <div className="flex items-center justify-end mb-4">

                    </div>

                    {/* Search bar - conditionally rendered */}
                    {isSearchBarVisible && (
                        <div className="relative mb-4">
                            <input
                                type="text"
                                className="w-full px-4  py-2 text-right bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300 text-gray-600 placeholder-gray-400"
                                placeholder=" ...جستجو"
                                value={searchQuery}
                                onChange={handleSearchChange}
                                autoFocus
                            />
                            {searchQuery && (
                                <button
                                    className="absolute left-2 top-1/3  transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                    onClick={clearSearch}
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <line x1="18" y1="6" x2="6" y2="18"></line>
                                        <line x1="6" y1="6" x2="18" y2="18"></line>
                                    </svg>
                                </button>
                            )}
                        </div>
                    )}

                    {/* Search results message */}
                    {isSearching && (
                        <div className="text-xs text-gray-500 text-right mb-2">
                            {searchResults.length === 0
                                ? 'موردی یافت نشد'
                                : `${searchResults.length} مورد یافت شد`}
                        </div>
                    )}

                    {/* Chat history */}
                    <div className="py-2">
                        {groupedConvs.today.length > 0 && (
                            <>
                                <div className="text-xs text-gray-400 text-right mt-4 mb-3">امروز</div>
                                <div className="space-y-3">
                                    {groupedConvs.today.map((conv) => (
                                        <div
                                            key={conv.id}
                                            className={`text-sm text-right text-[$141B34] cursor-pointer hover:bg-gray-200 p-2 rounded ${currentChatId === conv.id ? 'bg-gray-200' : ''}`}
                                            onClick={() => handleSelectConversation(conv.id)}
                                        >
                                            {conv.title}
                                        </div>
                                    ))}
                                </div>
                            </>
                        )}

                        {groupedConvs.week.length > 0 && (
                            <>
                                <div className="text-xs text-gray-400 text-right mt-4 mb-3">۷ روز پیش</div>
                                <div className="space-y-3">
                                    {groupedConvs.week.map((conv) => (
                                        <div
                                            key={conv.id}
                                            className={`text-sm text-right text-[$141B34] cursor-pointer hover:bg-gray-200 p-2 rounded ${currentChatId === conv.id ? 'bg-gray-200' : ''}`}
                                            onClick={() => handleSelectConversation(conv.id)}
                                        >
                                            {conv.title}
                                        </div>
                                    ))}
                                </div>
                            </>
                        )}

                        {groupedConvs.month.length > 0 && (
                            <>
                                <div className="text-xs text-gray-400 text-right mt-4 mb-3">۳۰ روز پیش</div>
                                <div className="space-y-3">
                                    {groupedConvs.month.map((conv) => (
                                        <div
                                            key={conv.id}
                                            className={`text-sm text-right text-[$141B34] cursor-pointer hover:bg-gray-200 p-2 rounded ${currentChatId === conv.id ? 'bg-gray-200' : ''}`}
                                            onClick={() => handleSelectConversation(conv.id)}
                                        >
                                            {conv.title}
                                        </div>
                                    ))}
                                </div>
                            </>
                        )}

                        {groupedConvs.older.length > 0 && (
                            <>
                                <div className="text-xs text-gray-400 text-right mt-4 mb-3">قدیمی‌تر</div>
                                <div className="space-y-3">
                                    {groupedConvs.older.map((conv) => (
                                        <div
                                            key={conv.id}
                                            className={`text-sm text-right text-[$141B34] cursor-pointer hover:bg-gray-200 p-2 rounded ${currentChatId === conv.id ? 'bg-gray-200' : ''}`}
                                            onClick={() => handleSelectConversation(conv.id)}
                                        >
                                            {conv.title}
                                        </div>
                                    ))}
                                </div>
                            </>
                        )}
                    </div>
                </div>
            )}
            <CopyrightFooter/>
        </div>
    );
};

const CopyrightFooter: React.FC = () => {
    return (
        <div className="fixed bottom-0 left-0 w-full text-center p-2 text-xs text-gray-500 bg-white border-t border-gray-100">
            © 2025 <a className="text-blue-500" href="/" >Pegah-e-Aftab Company</a>. All rights reserved.
        </div>
    );
};

export default ChatInterface;