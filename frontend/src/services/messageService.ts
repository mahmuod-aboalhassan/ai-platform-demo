import api from './api';
import type { MessageListResponse } from '../types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

export const messageService = {
  async list(sessionId: string, limit = 50, before?: string): Promise<MessageListResponse> {
    const params = new URLSearchParams({ limit: limit.toString() });
    if (before) {
      params.append('before', before);
    }
    const response = await api.get<MessageListResponse>(
      `/sessions/${sessionId}/messages?${params.toString()}`
    );
    return response.data;
  },

  // Returns EventSource for SSE streaming
  sendMessage(sessionId: string, content: string): EventSource {
    // For SSE, we need to use fetch with POST, then create a custom event reader
    // Since EventSource only supports GET, we'll use a workaround
    const url = `${API_URL}/sessions/${sessionId}/messages`;

    // Create a custom SSE-like reader using fetch
    const eventSource = new EventSource(url + `?content=${encodeURIComponent(content)}`);
    return eventSource;
  },

  // Alternative: Use fetch for POST with streaming
  async sendMessageStream(
    sessionId: string,
    content: string,
    onToken: (token: string) => void,
    onDone: (messageId: string, fullContent: string) => void,
    onError: (error: string, fallback: string) => void
  ): Promise<void> {
    const url = `${API_URL}/sessions/${sessionId}/messages`;

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'text/event-stream',
      },
      body: JSON.stringify({ content }),
    });

    if (!response.ok) {
      throw new Error('Failed to send message');
    }

    const reader = response.body?.getReader();
    if (!reader) {
      throw new Error('No reader available');
    }

    const decoder = new TextDecoder();
    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });

      // Parse SSE events
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      let eventType = '';
      let eventData = '';

      for (const line of lines) {
        if (line.startsWith('event: ')) {
          eventType = line.slice(7);
        } else if (line.startsWith('data: ')) {
          eventData = line.slice(6);

          if (eventType && eventData) {
            try {
              const data = JSON.parse(eventData);

              if (eventType === 'token') {
                onToken(data.content);
              } else if (eventType === 'done') {
                onDone(data.message_id, data.full_content);
              } else if (eventType === 'error') {
                onError(data.error, data.fallback_message);
              }
            } catch (e) {
              console.error('Failed to parse SSE data:', e);
            }

            eventType = '';
            eventData = '';
          }
        }
      }
    }
  },
};
