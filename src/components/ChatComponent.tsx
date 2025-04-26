import React, { useState, useRef, useEffect } from 'react';
import { Attatchment01, ExploreIcon, Frame, NewChatIcon, Sidebar, Vector } from "../icons";
import Logo from '../../public/logo.png';
import apiService from "../services/api";


interface Conversation {
    id: string;
    title: string;
    created_at: string;
}

interface Message {
    id: number;
    text: string;
    sender: 'user' | 'bot' | string;
    timestamp: string;
    server_filename?: string; // For regular files
    image_name?: string;      // For images
}

interface ApiMessage {
    role: 'user' | 'assistant';
    content: string;
    timestamp: string;
    server_filename?: string;
    image_name?: string;
}

interface ChatKeyboardEvent {
    key: string;
}

const ChatInterface: React.FC = () => {
    useEffect(() => {
        const checkScreenSize = () => {
            const isLargeScreen = window.innerWidth > 1980;
            if (isLargeScreen) {
                document.documentElement.style.fontSize = '32px'; // 2x default font size
            } else {
                document.documentElement.style.fontSize = '16px'; // Reset to default
            }
        };

        // Initial check
        checkScreenSize();

        window.addEventListener('resize', checkScreenSize);

        return () => {
            window.removeEventListener('resize', checkScreenSize);
        };
    }, []);

    const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false);
    const [inputMessage, setInputMessage] = useState<string>('');
    const [chatHistory, setChatHistory] = useState<Message[]>([]);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [currentChatId, setCurrentChatId] = useState<string | null>(null);

    const [isMessageLoading, setIsMessageLoading] = useState<boolean>(false);
    const [isChatHistoryLoading, setIsChatHistoryLoading] = useState<boolean>(false);
    const [isFileUploading, setIsFileUploading] = useState<boolean>(false);

    const [fileType, setFileType] = useState<'image' | 'file' | null>(null);

    const [searchQuery, setSearchQuery] = useState<string>('');
    const [searchResults, setSearchResults] = useState<Conversation[]>([]);
    const [isSearching, setIsSearching] = useState<boolean>(false);
    const [isSearchBarVisible, setIsSearchBarVisible] = useState<boolean>(false);

    const fileInputRef = useRef<HTMLInputElement>(null);
    const chatContainerRef = useRef<HTMLDivElement>(null);
    const sidebarRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleScreenSizeChange = () => {
            const isMobileView = window.innerWidth <= 768;

            if (!isMobileView) {
                setIsSidebarOpen(true);
            } else {
                setIsSidebarOpen(false);
            }
        };

        handleScreenSizeChange();

        window.addEventListener('resize', handleScreenSizeChange);

        return () => {
            window.removeEventListener('resize', handleScreenSizeChange);
        };
    }, []);

    useEffect(() => {
        const loadConversations = async () => {
            try {
                const result = await apiService.getCompanyChats();
                if (result.chats && Array.isArray(result.chats)) {

                    const formattedChats = result.chats.map(chat => ({
                        id: chat.chat_id,
                        title: chat.title || 'گفتگوی جدید',
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

    useEffect(() => {
        if (searchQuery.trim() === '') {
            setSearchResults([]);
            setIsSearching(false);
            return;
        }

        setIsSearching(true);
        const query = searchQuery.toLowerCase();

        const filteredConversations = conversations.filter(conv =>
            conv.title.toLowerCase().includes(query)
        );

        setSearchResults(filteredConversations);
    }, [searchQuery, conversations]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            const isMobileView = window.innerWidth <= 768;
            if (isMobileView &&
                isSidebarOpen &&
                sidebarRef.current &&
                !sidebarRef.current.contains(event.target as Node)) {
                toggleSidebar();
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isSidebarOpen]);

    const toggleSidebar = (): void => {
        console.log("Toggling sidebar. Current state:", isSidebarOpen);

        // When opening sidebar, scroll to top
        if (!isSidebarOpen) {
            window.scrollTo(0, 0);
        }

        setIsSidebarOpen(prev => !prev);
    };

    const toggleSearchBar = (): void => {
        setIsSearchBarVisible(!isSearchBarVisible);
        if (isSearchBarVisible) {
            setSearchQuery('');
            setSearchResults([]);
            setIsSearching(false);
        }
    };

    const isImageFile = (file: File): boolean => {
        const imageTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/jpg'];
        return imageTypes.includes(file.type);
    };

    const isPdfFile = (file: File): boolean => {
        const documentTypes = [
            'application/pdf',                     // pdf
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // docx
            'text/plain',                          // txt
            'text/csv',                            // csv
            'text/markdown'                        // md
        ];
        return documentTypes.includes(file.type);
    };

    const handleFileAttachment = (): void => {
        if (fileInputRef?.current) fileInputRef.current.click();
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
        if (e.target.files && e.target.files.length > 0) {
            const file = e.target.files[0];

            if (isImageFile(file)) {
                setSelectedFile(file);
                setFileType('image');
            } else if (isPdfFile(file)) {
                setSelectedFile(file);
                setFileType('file');
            } else {
                alert('فقط فایل‌های PDF، DOCX، TXT، CSV، MD و تصاویر پشتیبانی می‌شوند.');
                e.target.value = '';
            }
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
        setInputMessage(e.target.value);
    };

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
        setSearchQuery(e.target.value);
    };

    const clearSearch = (): void => {
        setSearchQuery('');
        setSearchResults([]);
        setIsSearching(false);
    };

    const handleSubmit = async (): Promise<void> => {
        if (inputMessage.trim() === '' && !selectedFile) return;
        setIsMessageLoading(true);

        try {
            let serverFilename: string | undefined;
            let imageName: string | undefined;

            if (selectedFile) {
                setIsFileUploading(true);

                try {
                    if (fileType === 'image') {
                        const imageResponse = await apiService.uploadImage(selectedFile);
                        imageName = imageResponse.filename;
                    } else {
                        const fileResponse = await apiService.uploadFile(selectedFile);
                        serverFilename = fileResponse.server_filename;
                    }
                } catch (error) {
                    console.error('Error uploading file:', error);
                    const errorMessage: Message = {
                        id: Date.now(),
                        text: 'مشکلی در آپلود فایل به وجود آمد. لطفا دوباره تلاش کنید.',
                        sender: 'bot',
                        timestamp: new Date().toISOString()
                    };
                    setChatHistory(prev => [...prev, errorMessage]);
                    setIsMessageLoading(false);
                    setIsFileUploading(false);
                    return;
                }

                setIsFileUploading(false);
            }

            const newMessage: Message = {
                id: Date.now(),
                text: inputMessage,
                sender: 'user',
                timestamp: new Date().toISOString(),
                server_filename: serverFilename,
                image_name: imageName
            };

            setChatHistory(prev => [...prev, newMessage]);

            const response = await apiService.sendMessage(
                inputMessage,
                currentChatId,
                undefined,
                undefined,
                undefined,
                serverFilename,
                imageName
            );

            if (!currentChatId && response.chat_id) {
                setCurrentChatId(response.chat_id);
            }

            if (!currentChatId) {
                const result = await apiService.getCompanyChats();
                if (result.chats && Array.isArray(result.chats)) {
                    const formattedChats = result.chats.map(chat => ({
                        id: chat.chat_id,
                        title: chat.title,
                        created_at: chat.created_at
                    }));
                    setConversations(formattedChats);
                }
            }

            const botResponse: Message = {
                id: Date.now() + 1,
                text: response.response || 'Sorry, I could not process your request.',
                sender: 'bot',
                timestamp: new Date().toISOString()
            };

            setChatHistory(prev => [...prev, botResponse]);
        } catch (error) {
            console.error('Error sending message:', error);

            const errorMessage: Message = {
                id: Date.now() + 1,
                text: 'مشکلی در ارتباط با سرور به وجود آمد. لطفا دوباره تلاش کنید.',
                sender: 'bot',
                timestamp: new Date().toISOString()
            };

            setChatHistory(prev => [...prev, errorMessage]);
        } finally {
            setIsMessageLoading(false);
            setInputMessage('');
            setSelectedFile(null);
            setFileType(null);
        }
    };

    const handleNewChat = (): void => {
        setChatHistory([]);
        setCurrentChatId(null);
        if (window.innerWidth <= 768) {
            setIsSidebarOpen(false);
        }
    };

    const handleSelectConversation = async (chatId: string): Promise<void> => {
        setIsChatHistoryLoading(true);
        setCurrentChatId(chatId);
        setIsSearchBarVisible(false);
        clearSearch();

        try {
            const history = await apiService.getChatHistory(chatId);

            if (history.messages && Array.isArray(history.messages)) {
                const formattedMessages = history.messages.map((msg: ApiMessage, index: number) => ({
                    id: Date.now() - (1000 * (history.messages.length - index)),
                    text: msg.content,
                    sender: msg.role === 'user' ? 'user' : 'bot',
                    timestamp: msg.timestamp,
                    server_filename: msg.server_filename,
                    image_name: msg.image_name
                }));

                setChatHistory(formattedMessages);
            }
        } catch (error) {
            console.error('Failed to load chat history:', error);
            setChatHistory([]);
        } finally {
            setIsChatHistoryLoading(false);
            // Close sidebar on mobile after selecting a conversation
            if (window.innerWidth <= 768) {
                setIsSidebarOpen(false);
            }
        }
    };

    const handleDownload = (isImage: boolean, filename: string): void => {
        const baseUrl = isImage
            ? `${import.meta.env.VITE_API_BASE_URL || 'http://hurosh.pegaheaftab.com/backend'}/get-image/${import.meta.env.VITE_COMPANY_NAME || 'pegah'}/${filename}`
            : `${import.meta.env.VITE_API_BASE_URL || 'http://hurosh.pegaheaftab.com/backend'}/download-file/${import.meta.env.VITE_COMPANY_NAME || 'pegah'}/${filename}`;

        // Open in new tab or trigger download
        window.open(baseUrl, '_blank');
    };

    // Scroll to bottom when chat history changes
    useEffect(() => {
        if (chatContainerRef.current) {
            chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
        }
    }, [chatHistory]);

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

    // Skeleton loader for chat history
    const ChatSkeleton: React.FC = () => {
        return (
            <>
                {[1, 2, 3, 4].map((item) => (
                    <div key={item} className={`max-w-3/4 md:max-w-3/4 sm:max-w-[85%] mb-4 ${item % 2 === 0 ? 'self-end' : 'self-start'}`}>
                        <div
                            className={`p-3 rounded-lg ${
                                item % 2 === 0
                                    ? 'bg-blue-50 text-right'
                                    : 'bg-gray-50 text-right'
                            }`}
                        >
                            <div className="h-4 bg-gray-200 rounded w-24 mb-2 animate-pulse"></div>
                            <div className="h-3 bg-gray-200 rounded w-48 mb-1 animate-pulse"></div>
                            <div className="h-3 bg-gray-200 rounded w-32 animate-pulse"></div>
                        </div>
                    </div>
                ))}
            </>
        );
    };

    const renderAttachment = (message: Message) => {
        if (message.server_filename) {
            return (
                <div className="mt-2 text-xs md:text-xs text-blue-500 cursor-pointer" onClick={() => handleDownload(false, message.server_filename!)}>
                    دانلود فایل
                </div>
            );
        } else if (message.image_name) {
            return (
                <div className="mt-2">
                    <div className="text-xs md:text-xs text-blue-500 cursor-pointer" onClick={() => handleDownload(true, message.image_name!)}>
                        دانلود تصویر
                    </div>
                </div>
            );
        }
        return null;
    };

    // Determine if we're in mobile view
    const isMobileView = typeof window !== 'undefined' && window.innerWidth <= 768;

    // CSS class for sidebar
    const sidebarClasses = `
        sidebar-container ${!isMobileView?isSidebarOpen?"w-72":"w-0":"w-72"} h-full bg-[#F9F9F9] overflow-y-auto shadow-lg
        transition-all duration-300
        ${isMobileView
        ? `fixed top-0 right-0 z-30 ${isSidebarOpen ? 'translate-x-0' : 'translate-x-full'}`
        : 'relative translate-x-0'
    }
    `;

    return (
        <div className="flex h-screen bg-white pb-8 overflow-hidden">
            {/* Main content area */}
            <div className="flex-1 flex flex-col relative">
                {/* Menu toggle button for all screen sizes when sidebar is closed */}
                {!isSidebarOpen && (
                    <button
                        className="absolute top-4 right-4 z-30 p-2 rounded-full bg-gray-100 hover:bg-gray-200"
                        onClick={toggleSidebar}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="3" y1="12" x2="21" y2="12"></line>
                            <line x1="3" y1="6" x2="21" y2="6"></line>
                            <line x1="3" y1="18" x2="21" y2="18"></line>
                        </svg>
                    </button>
                )}

                {/* Chat container */}
                <div
                    ref={chatContainerRef}
                    className="flex-1 overflow-y-auto p-2 md:p-4 flex flex-col w-full h-full"
                    style={{
                        justifyContent: chatHistory.length === 0 && !isChatHistoryLoading ? 'center' : 'flex-start',
                        maxHeight: 'calc(100vh - 120px)' // Adjust based on your header/footer height
                    }}
                >
                    {!isMessageLoading && !isChatHistoryLoading && chatHistory.length === 0 ? (
                        // Empty state with prompt
                        <div className="flex flex-col w-full items-center justify-center relative">
                            <h2 className="text-xl text-gray-800 font-normal text-center w-full md:w-4/5 sm:w-full px-4">من هوروش هستم, دستیار فنی هوشمند شما, چطور می‌توانم کمک کنم؟</h2>
                        </div>
                    ) : isChatHistoryLoading ? (
                        // Show skeleton while loading chat history
                        <ChatSkeleton />
                    ) : (
                        // Chat messages
                        chatHistory.map((message) => (
                            <div
                                key={message.id}
                                className={`max-w-3/4 md:max-w-3/4 sm:max-w-[85%] mb-4 ${message.sender === 'user' ? 'self-end' : 'self-start'}`}
                            >
                                <div
                                    className={`p-3 rounded-lg ${
                                        message.sender === 'user'
                                            ? 'bg-blue-100 text-right'
                                            : 'bg-gray-100 text-right'
                                    }`}
                                >
                                    {message.text}
                                    {renderAttachment(message)}
                                </div>
                            </div>
                        ))
                    )}

                    {isMessageLoading && (
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

                    <div
                        className={`p-2 md:p-4 pb-6 flex flex-col w-full ${chatHistory.length > 0 ? 'shadow-inner ' : 'absolute top-[60%] xl:top-[55%] '} bg-white`}
                    >
                        <div
                            className={`bg-white ${chatHistory.length === 0 ? 'w-full xl:w-3xl drop-shadow-2xl shadow-2xl ' : 'w-full'} min-h-24 rounded-3xl border border-gray-200 flex flex-col items-center mx-auto`}
                        >
                            <input
                                dir={"rtl"}
                                type="text"
                                className="flex-1 w-full py-3 px-4 text-right bg-transparent focus:outline-none text-gray-600 placeholder-gray-400 text-sm md:text-base"
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
                                        onClick={() => {
                                            setSelectedFile(null);
                                            setFileType(null);
                                        }}
                                    >
                                        ×
                                    </button>
                                </div>
                            )}

                            <div className="flex w-full justify-between items-center px-4 py-2">
                                <button
                                    className={`size-8 flex items-center justify-center bg-gray-500 ${isMessageLoading || isFileUploading || (inputMessage.trim() === '' && !selectedFile) ? 'opacity-50 cursor-not-allowed' : ''} rounded-full`}
                                    onClick={handleSubmit}
                                    disabled={isMessageLoading || isFileUploading || (inputMessage.trim() === '' && !selectedFile)}
                                >
                                    <Frame/>
                                </button>

                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    onChange={handleFileChange}
                                    style={{display: 'none'}}
                                />

                                <button
                                    className="w-12 h-12 flex items-center justify-center"
                                    onClick={handleFileAttachment}
                                    disabled={isMessageLoading || isFileUploading}
                                >
                                    <Attatchment01/>
                                </button>
                            </div>
                        </div>
                    </div>

            </div>

            {/* Black overlay for mobile when sidebar is open */}
            {isMobileView && isSidebarOpen && (
                <div
                    className="fixed inset-0 bg-black opacity-50 z-20"
                    onClick={toggleSidebar}
                ></div>
            )}

            {/* Sidebar with improved CSS */}
            <div
                ref={sidebarRef}
                className={sidebarClasses}
                style={{
                    // Force the correct position based on screen size
                    position: isMobileView ? 'fixed' : 'relative',
                    // Only apply transform on mobile
                    transform: isMobileView
                        ? (isSidebarOpen ? 'translateX(0)' : 'translateX(100%)')
                        : 'translateX(0)'
                }}
            >
                {/* User profile */}
                <div className="flex items-center justify-start gap-4 p-4 [&>svg]:cursor-pointer">
                    <NewChatIcon className="mr-auto" onClick={handleNewChat} />

                    <div
                        onClick={toggleSidebar}
                        className="cursor-pointer p-2"
                    >
                        <Sidebar />
                    </div>
                </div>

                <div className="flex flex-col items-end gap-4 p-4">
                    <img src={Logo} width={104} height={24} alt="Logo" />
                    <div className="flex gap-2 w-full items-center">
                        <button
                            className="p-2 hover:bg-gray-200 rounded-full mr-auto"
                            onClick={toggleSearchBar}
                        >
                            <Vector />
                        </button>
                        <span className="text-xs text-gray-500">اکسپلور</span>
                        <ExploreIcon/>
                    </div>
                </div>

                {/* Search bar */}
                {isSearchBarVisible && (
                    <div className="relative px-4 mb-4">
                        <input
                            dir="rtl"
                            type="text"
                            className="w-full px-4 py-2 text-right bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300 text-gray-600 placeholder-gray-400"
                            placeholder=" جستجو ..."
                            value={searchQuery}
                            onChange={handleSearchChange}
                            autoFocus
                        />
                        {searchQuery && (
                            <button
                                className="absolute left-6 top-1/3 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
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
                    <div className="text-xs text-gray-500 text-right px-4 mb-2">
                        {searchResults.length === 0
                            ? 'موردی یافت نشد'
                            : `${searchResults.length} مورد یافت شد`}
                    </div>
                )}

                {/* Chat history sections */}
                <div className="px-4 py-2">
                    {groupedConvs.today.length > 0 && (
                        <>
                            <div className="text-xs text-gray-400 text-right mt-4 mb-3">امروز</div>
                            <div className="space-y-3">
                                {groupedConvs.today.map((conv) => (
                                    <div
                                        key={conv.id}
                                        dir="rtl"
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
                                        dir="rtl"
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

            <CopyrightFooter/>
        </div>
    );
};
const CopyrightFooter: React.FC = () => {
    return (
        <div className="fixed bottom-0 left-0 w-full text-center p-2 text-xs md:text-xs text-gray-500 bg-white border-t border-gray-100">
            © 2025 <a className="text-blue-500" href="/" >Pegah-e-Aftab Company</a>. All rights reserved.
        </div>
    );
};

export default ChatInterface;