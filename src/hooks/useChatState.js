// hooks/useChatState.js
import { useState, useCallback, useRef, useEffect } from 'react';

export const useChatState = (initialMessages = [], initialChats = []) => {
    const [messages, setMessages] = useState(initialMessages);
    const [chats, setChats] = useState(initialChats);
    const [activeChat, setActiveChat] = useState(chats[0]?.title || 'New Chat');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [sidebarOpen, setSidebarOpen] = useState(true);

    // For performance optimization
    const messagesEndRef = useRef(null);

    // Scroll to bottom when messages change
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    // Toggle sidebar
    const toggleSidebar = useCallback(() => {
        setSidebarOpen(prev => !prev);
    }, []);

    // Send message handler with memoization
    const sendMessage = useCallback(async (text) => {
        if (!text.trim()) return;

        // Optimistic update for better UX
        const newUserMessage = {
            id: Date.now(),
            text,
            sender: 'user',
            timestamp: new Date().toISOString(),
        };

        setMessages(prev => [...prev, newUserMessage]);
        setLoading(true);
        setError(null);

        try {
            // In a real app, you would call an API here
            // Simulating API call with timeout
            await new Promise(resolve => setTimeout(resolve, 1000));

            const assistantResponse = {
                id: Date.now() + 1,
                text: 'این یک پاسخ خودکار است.',
                sender: 'assistant',
                timestamp: new Date().toISOString(),
            };

            setMessages(prev => [...prev, assistantResponse]);
        } catch (err) {
            setError('Failed to send message. Please try again.');
            console.error('Error sending message:', err);
        } finally {
            setLoading(false);
        }
    }, []);

    // Switch chat handler
    const switchChat = useCallback((chatTitle) => {
        // In a real app, you would load messages for the selected chat
        setActiveChat(chatTitle);
        // Reset messages for demo purposes
        setMessages([]);
    }, []);

    // Create a new chat
    const createNewChat = useCallback((title = 'New Chat') => {
        const newChat = {
            id: Date.now(),
            title,
            category: 'today',
            createdAt: new Date().toISOString(),
        };

        setChats(prev => [newChat, ...prev]);
        setActiveChat(title);
        setMessages([]);
    }, []);

    return {
        messages,
        chats,
        activeChat,
        loading,
        error,
        sidebarOpen,
        sendMessage,
        switchChat,
        setActiveChat,
        toggleSidebar,
        createNewChat,
        messagesEndRef
    };
};

export default useChatState;