import { get, post, put } from '@/lib/api-client';
import {
  Message,
  MessageThread,
  ApiResponse,
  PaginatedResponse,
} from '@/types';

interface NewMessageRequest {
  recipientId: string;
  subject: string;
  body: string;
  attachmentIds?: string[];
}

interface ReplyMessageRequest {
  body: string;
  attachmentIds?: string[];
}

export const messagesApi = {
  /**
   * Get all message threads
   */
  async getThreads(
    page: number = 1,
    pageSize: number = 20
  ): Promise<ApiResponse<PaginatedResponse<MessageThread>>> {
    return get<PaginatedResponse<MessageThread>>('/portal/messages/threads', {
      page,
      pageSize,
    });
  },

  /**
   * Get unread message count
   */
  async getUnreadCount(): Promise<ApiResponse<{ count: number }>> {
    return get<{ count: number }>('/portal/messages/unread-count');
  },

  /**
   * Get messages in a thread
   */
  async getThreadMessages(
    threadId: string,
    page: number = 1,
    pageSize: number = 50
  ): Promise<ApiResponse<PaginatedResponse<Message>>> {
    return get<PaginatedResponse<Message>>(
      `/portal/messages/threads/${threadId}/messages`,
      { page, pageSize }
    );
  },

  /**
   * Get a single message by ID
   */
  async getMessage(id: string): Promise<ApiResponse<Message>> {
    return get<Message>(`/portal/messages/${id}`);
  },

  /**
   * Send a new message (create new thread)
   */
  async sendMessage(
    request: NewMessageRequest
  ): Promise<ApiResponse<{ thread: MessageThread; message: Message }>> {
    return post<{ thread: MessageThread; message: Message }>(
      '/portal/messages',
      request
    );
  },

  /**
   * Reply to a message thread
   */
  async replyToThread(
    threadId: string,
    request: ReplyMessageRequest
  ): Promise<ApiResponse<Message>> {
    return post<Message>(`/portal/messages/threads/${threadId}/reply`, request);
  },

  /**
   * Mark a message as read
   */
  async markAsRead(messageId: string): Promise<ApiResponse<{ success: boolean }>> {
    return put<{ success: boolean }>(`/portal/messages/${messageId}/read`);
  },

  /**
   * Mark all messages in a thread as read
   */
  async markThreadAsRead(
    threadId: string
  ): Promise<ApiResponse<{ success: boolean }>> {
    return put<{ success: boolean }>(
      `/portal/messages/threads/${threadId}/read`
    );
  },

  /**
   * Get available recipients (care team members)
   */
  async getRecipients(): Promise<
    ApiResponse<
      {
        id: string;
        name: string;
        role: string;
        specialty?: string;
      }[]
    >
  > {
    return get('/portal/messages/recipients');
  },

  /**
   * Upload attachment for message
   */
  async uploadAttachment(
    file: FormData
  ): Promise<ApiResponse<{ id: string; fileName: string; fileSize: number }>> {
    return post('/portal/messages/attachments', file);
  },

  /**
   * Get attachment download URL
   */
  async getAttachmentUrl(
    attachmentId: string
  ): Promise<ApiResponse<{ url: string }>> {
    return get<{ url: string }>(
      `/portal/messages/attachments/${attachmentId}/download`
    );
  },

  /**
   * Search messages
   */
  async searchMessages(
    query: string,
    page: number = 1,
    pageSize: number = 20
  ): Promise<ApiResponse<PaginatedResponse<Message>>> {
    return get<PaginatedResponse<Message>>('/portal/messages/search', {
      q: query,
      page,
      pageSize,
    });
  },
};

export default messagesApi;
