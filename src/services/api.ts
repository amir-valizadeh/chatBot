// src/services/api.ts

// Access environment variables
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://hurosh.pegaheaftab.com/backend';
const COMPANY_NAME = import.meta.env.VITE_COMPANY_NAME || 'pegah';

// Define interfaces for API responses
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
        server_filename?: string;
        image_name?: string;
    }>;
}

interface ChatResponse {
    response: string;
    chat_id: string;
}

interface FileUploadResponse {
    message: string;
    original_filename: string;
    server_filename: string;
}

interface ImageUploadResponse {
    message: string;
    filename: string;
    file_path: string;
}
interface ChatPayload {
    message: string;
    company_name: string;
    chat_id?: string;
    system_prompt?: string;
    model?: string;
    temperature?: number;
    server_filename?: string;
    image_name?: string;
}


// API service for chat operations
const apiService = {
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
    sendMessage: async (
        message: string,
        chatId?: string | null,
        systemPrompt?: string,
        model?: string,
        temperature?: number,
        serverFilename?: string,
        imageName?: string
    ): Promise<ChatResponse> => {
        try {

            const payload: ChatPayload = {
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

            if (model) {
                payload.model = model;
            }

            if (temperature) {
                payload.temperature = temperature;
            }

            if (serverFilename) {
                payload.server_filename = serverFilename;
            }

            if (imageName) {
                payload.image_name = imageName;
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
    },

    // Upload a file
    uploadFile: async (file: File): Promise<FileUploadResponse> => {
        try {
            const formData = new FormData();
            formData.append('company_name', COMPANY_NAME);
            formData.append('file', file);

            const response = await fetch(`${API_BASE_URL}/upload-file`, {
                method: 'POST',
                body: formData,
            });

            return await response.json();
        } catch (error) {
            console.error('Error uploading file:', error);
            throw error;
        }
    },

    // Upload an image
    uploadImage: async (image: File): Promise<ImageUploadResponse> => {
        try {
            const formData = new FormData();
            formData.append('company_name', COMPANY_NAME);
            formData.append('image', image);

            const response = await fetch(`${API_BASE_URL}/upload-image`, {
                method: 'POST',
                body: formData,
            });

            return await response.json();
        } catch (error) {
            console.error('Error uploading image:', error);
            throw error;
        }
    }
};

export default apiService;