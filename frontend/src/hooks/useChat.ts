import { useCallback, useEffect, useRef } from 'react';
import { useAppContext } from '../context/AppContext';
import { messageService } from '../services/messageService';
import { voiceService } from '../services/voiceService';
import type { Message } from '../types';

export function useChat() {
  const { state, dispatch } = useAppContext();
  const sessionId = state.sessions.selectedId;
  const loadedSessionId = useRef<string | null>(null);

  // Fetch messages when session changes
  useEffect(() => {
    // Skip if no session
    if (!sessionId) return;

    // Check if we need to load messages for this session
    // We strictly load if the session ID has changed from what we last loaded
    // OR if the store is empty (e.g. on reload) but we have a session ID
    if (loadedSessionId.current === sessionId && state.messages.items.length > 0) {
      return;
    }

    const loadMessages = async () => {
      dispatch({ type: 'SET_MESSAGES_LOADING' });
      loadedSessionId.current = sessionId;

      try {
        const response = await messageService.list(sessionId);
        dispatch({
          type: 'SET_MESSAGES',
          payload: {
            messages: response.messages,
            totalCount: response.total_count,
            hasMore: response.has_more
          }
        });
      } catch (error) {
        dispatch({ type: 'SET_MESSAGES_ERROR', payload: 'Failed to load messages' });
        loadedSessionId.current = null; // Reset so we retry if needed
      }
    };

    loadMessages();
  }, [sessionId, dispatch]);

  const sendMessage = useCallback(
    async (sessionId: string, content: string) => {
      // Add optimistic user message
      const tempUserMessage: Message = {
        id: `temp-${Date.now()}`,
        session_id: sessionId,
        role: 'user',
        content,
        message_type: 'text',
        audio_url: null,
        tts_audio_url: null,
        created_at: new Date().toISOString(),
      };

      dispatch({ type: 'ADD_MESSAGE', payload: tempUserMessage });

      // Start streaming
      dispatch({ type: 'START_STREAMING' });

      try {
        await messageService.sendMessageStream(
          sessionId,
          content,
          // onToken
          (token) => {
            dispatch({ type: 'APPEND_STREAMING_CONTENT', payload: token });
          },
          // onDone
          (messageId, fullContent) => {
            const aiMessage: Message = {
              id: messageId,
              session_id: sessionId,
              role: 'assistant',
              content: fullContent,
              message_type: 'text',
              audio_url: null,
              tts_audio_url: null,
              created_at: new Date().toISOString(),
            };
            dispatch({ type: 'FINISH_STREAMING', payload: aiMessage });
          },
          // onError
          (error, fallback) => {
            const aiMessage: Message = {
              id: `error-${Date.now()}`,
              session_id: sessionId,
              role: 'assistant',
              content: fallback,
              message_type: 'text',
              audio_url: null,
              tts_audio_url: null,
              created_at: new Date().toISOString(),
            };
            dispatch({ type: 'FINISH_STREAMING', payload: aiMessage });
          }
        );
      } catch (error) {
        dispatch({ type: 'STREAMING_ERROR', payload: 'Failed to send message' });
      }
    },
    [dispatch]
  );

  const sendVoiceMessage = useCallback(
    async (sessionId: string, audioBlob: Blob) => {
      dispatch({ type: 'START_VOICE_PROCESSING' });

      try {
        const response = await voiceService.sendVoiceMessage(sessionId, audioBlob);

        // Add both user and assistant messages
        dispatch({ type: 'ADD_MESSAGE', payload: response.user_message });
        dispatch({ type: 'ADD_MESSAGE', payload: response.assistant_message });
        dispatch({ type: 'FINISH_VOICE_PROCESSING' });

        return response;
      } catch (error) {
        dispatch({ type: 'VOICE_ERROR', payload: 'Failed to process voice message' });
        throw error;
      }
    },
    [dispatch]
  );

  const loadMoreMessages = useCallback(
    async (sessionId: string) => {
      if (!state.messages.hasMore || state.messages.loading) return;

      const firstMessage = state.messages.items[0];
      if (!firstMessage) return;

      dispatch({ type: 'SET_MESSAGES_LOADING' });
      try {
        const response = await messageService.list(sessionId, 50, firstMessage.id);
        dispatch({
          type: 'PREPEND_MESSAGES',
          payload: {
            messages: response.messages,
            hasMore: response.has_more,
          },
        });
      } catch (error) {
        dispatch({ type: 'SET_MESSAGES_ERROR', payload: 'Failed to load more messages' });
      }
    },
    [dispatch, state.messages.hasMore, state.messages.loading, state.messages.items]
  );

  const isVoiceMode = state.voice.isVoiceMode;

  const startVoiceMode = useCallback(() => {
    dispatch({ type: 'SET_VOICE_MODE', payload: true });
  }, [dispatch]);

  const endVoiceMode = useCallback(() => {
    dispatch({ type: 'SET_VOICE_MODE', payload: false });
  }, [dispatch]);

  return {
    messages: state.messages.items,
    loading: state.messages.loading,
    error: state.messages.error,
    hasMore: state.messages.hasMore,
    totalCount: state.messages.totalCount,
    streaming: state.messages.streaming,
    streamingContent: state.messages.streamingContent,
    isVoiceMode,
    sendMessage,
    sendVoiceMessage,
    loadMoreMessages,
    startVoiceMode,
    endVoiceMode,
  };
}
