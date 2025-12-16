import { API_ENDPOINTS, getApiUrl, getAuthHeaders } from '../config/api';
import { Chat, Message, ChatSettings } from '../types/chat';

export interface CreateChatData {
  title?: string;
  fileId?: string;
  settings?: ChatSettings;
}

export interface SendMessageData {
  content: string;
}

export interface MessageResponse {
  userMessage: Message;
  botMessage: Message;
}

class ChatService {
  async createChat(data: CreateChatData): Promise<Chat> {
    const response = await fetch(getApiUrl(API_ENDPOINTS.CHATS), {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'فشل إنشاء المحادثة');
    }

    return response.json();
  }

  async getChats(page = 1, limit = 20): Promise<{
    items: Chat[];
    total: number;
    page: number;
    limit: number;
    pages: number;
  }> {
    const response = await fetch(
      getApiUrl(`${API_ENDPOINTS.CHATS}?page=${page}&limit=${limit}`),
      {
        method: 'GET',
        headers: getAuthHeaders(),
      }
    );

    if (!response.ok) {
      throw new Error('فشل جلب المحادثات');
    }

    return response.json();
  }

  async getChatById(chatId: string): Promise<Chat> {
    const response = await fetch(getApiUrl(API_ENDPOINTS.CHAT_BY_ID(chatId)), {
      method: 'GET',
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error('فشل جلب المحادثة');
    }

    return response.json();
  }

  async updateChat(chatId: string, data: Partial<CreateChatData>): Promise<Chat> {
    const response = await fetch(getApiUrl(API_ENDPOINTS.CHAT_BY_ID(chatId)), {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error('فشل تحديث المحادثة');
    }

    return response.json();
  }

  async deleteChat(chatId: string): Promise<void> {
    const response = await fetch(getApiUrl(API_ENDPOINTS.CHAT_BY_ID(chatId)), {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error('فشل حذف المحادثة');
    }
  }

  async sendMessage(chatId: string, data: SendMessageData): Promise<MessageResponse> {
    const response = await fetch(getApiUrl(API_ENDPOINTS.MESSAGES(chatId)), {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'فشل إرسال الرسالة');
    }

    return response.json();
  }

  async getMessages(chatId: string, page = 1, limit = 50): Promise<{
    items: Message[];
    total: number;
    page: number;
    limit: number;
    pages: number;
  }> {
    const response = await fetch(
      getApiUrl(`${API_ENDPOINTS.MESSAGES(chatId)}?page=${page}&limit=${limit}`),
      {
        method: 'GET',
        headers: getAuthHeaders(),
      }
    );

    if (!response.ok) {
      throw new Error('فشل جلب الرسائل');
    }

    return response.json();
  }
}

export const chatService = new ChatService();
