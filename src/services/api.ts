// src/services/api.ts

// Access environment variables
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://hurosh.pegaheaftab.com/backend';
const COMPANY_NAME = import.meta.env.VITE_COMPANY_NAME || 'pegah';

// Define interfaces for API responses
// interface CreateChatResponse {
//     message: string;
//     chat_id: string;
// }

interface CompanyChatResponse {
    chats: Array<{
        chat_id: string;
        created_at: string;
        title: string;
    }>;
}

interface ChatHistoryResponse {
    company_name: string;
    messages: Array<{
        role: 'user' | 'assistant';
        content: string;
        timestamp: string;
    }>;
}

interface ChatResponse {
    response: string;
    chat_id: string;
}

// API service for chat operations
const apiService = {
    // Create a new chat
    // createChat: async (): Promise<CreateChatResponse> => {
    //     try {
    //         const response = await fetch(`${API_BASE_URL}/create-chat`, {
    //             method: 'POST',
    //             headers: {
    //                 'Content-Type': 'application/json',
    //             },
    //             body: JSON.stringify({
    //                 company_name: COMPANY_NAME,
    //             }),
    //         });
    //
    //         return await response.json();
    //     } catch (error) {
    //         console.error('Error creating chat:', error);
    //         throw error;
    //     }
    // },

    // Get all chats for the company
    getCompanyChats: async (): Promise<CompanyChatResponse> => {
        try {
            const response = await fetch(`${API_BASE_URL}/company-chats/${COMPANY_NAME}`);
            return await response.json();
        } catch (error) {
            console.error('Error fetching company chats:', error);
            throw error;
        }
    },

    // Get chat history for a specific chat
    getChatHistory: async (chatId: string): Promise<ChatHistoryResponse> => {
        try {
            const response = await fetch(`${API_BASE_URL}/chat-history/${chatId}`);
            return await response.json();
        } catch (error) {
            console.error('Error fetching chat history:', error);
            throw error;
        }
    },

    // Send a message to chat
    sendMessage: async (message: string, chatId?: string|null, systemPrompt?: string): Promise<ChatResponse> => {
        try {
            const payload: {
                message: string;
                company_name: string;
                chat_id?: string;
                system_prompt?: string;
            } = {
                message,
                company_name: COMPANY_NAME,
            };

            // Add chat_id if provided
            if (chatId) {
                payload.chat_id = chatId;
            }

            // Add optional parameters if provided
            if (systemPrompt) {
                payload.system_prompt = systemPrompt;
            }

            const response = await fetch(`${API_BASE_URL}/chat`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload),
            });

            return await response.json();
        } catch (error) {
            console.error('Error sending message:', error);
            throw error;
        }
    }
};

export default apiService;