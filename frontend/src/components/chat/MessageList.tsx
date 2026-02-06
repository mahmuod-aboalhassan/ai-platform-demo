import React, { useRef, useEffect } from 'react';
import { useAppContext } from '../../context/AppContext';
import { useChat } from '../../hooks/useChat';
import { useAudioPlayer } from '../../hooks/useAudioPlayer';
import { MessageBubble } from './MessageBubble';
import { StreamingMessage } from './StreamingMessage';
import { LoadingSpinner } from '../common/LoadingSpinner';
import { Button } from '../common/Button';

export function MessageList() {
  const { state } = useAppContext();
  const { messages, loading, hasMore, streaming, streamingContent, loadMoreMessages, isVoiceMode } = useChat();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const { play } = useAudioPlayer();
  const [lastAutoPlayedId, setLastAutoPlayedId] = React.useState<string | null>(null);
  
  // Track if user is near bottom to allow reading history without auto-scrolling
  const isNearBottomRef = useRef(true);

  const sessionId = state.sessions.selectedId;

  // Handle scroll events to update isNearBottomRef
  const handleScroll = () => {
    if (containerRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = containerRef.current;
      // Consider "near bottom" if within 100px of the bottom
      const isNear = scrollHeight - scrollTop - clientHeight < 100;
      isNearBottomRef.current = isNear;
    }
  };

  // Auto-scroll logic
  const scrollToBottom = (behavior: 'smooth' | 'auto' = 'smooth') => {
    if (messagesEndRef.current) {
      if (behavior === 'auto') {
        // Direct DOM manipulation for instant scroll without "locking" effect
        messagesEndRef.current.scrollIntoView({ behavior: 'auto' });
      } else {
        messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  // Scroll on new messages or streaming content
  useEffect(() => {
    // Always scroll effectively on new message start (when streaming starts)
    if (streaming && !streamingContent) {
      isNearBottomRef.current = true;
      scrollToBottom('smooth');
      return;
    }

    // During streaming, use instant scroll ('auto') if user is near bottom
    // This allows browser to anchor properly and prevents "fighting" the user's scroll
    if (streaming && streamingContent) {
      if (isNearBottomRef.current) {
        scrollToBottom('auto');
      }
      return;
    }

    // For other message updates (loading history etc), scroll smooth if near bottom
    if (isNearBottomRef.current) {
      scrollToBottom('smooth');
    }
  }, [messages.length, streaming, streamingContent]);

  // Initial scroll on mount/session change
  useEffect(() => {
    isNearBottomRef.current = true;
    scrollToBottom('auto');
  }, [sessionId]);

  // Auto-play assistant response if user sent a voice message
  useEffect(() => {
    if (messages.length === 0 || isVoiceMode) return;

    const lastMsg = messages[messages.length - 1];

    if (
      lastMsg.role === 'assistant' &&
      lastMsg.tts_audio_url &&
      lastMsg.id !== lastAutoPlayedId &&
      !loading // Ensure not loading historic messages
    ) {
      // Check if previous message was voice
      const prevMsg = messages[messages.length - 2];
      const isResponseToVoice = prevMsg && (prevMsg.message_type === 'voice' || !!prevMsg.audio_url);

      if (isResponseToVoice) {
        setLastAutoPlayedId(lastMsg.id);
        play(lastMsg.tts_audio_url);
      }
    }
  }, [messages, isVoiceMode, lastAutoPlayedId, loading, play]);

  const handleLoadMore = () => {
    if (sessionId) {
      // Preserve scroll position logic could be added here if needed
      // For now, react-query / state updates usually handle this okayish, 
      // but ideally we'd save scrollHeight before and restore scrollTop after.
      loadMoreMessages(sessionId);
    }
  };

  if (loading && messages.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center bg-slate-50">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      onScroll={handleScroll}
      className="flex-1 overflow-y-auto p-6 space-y-4 bg-slate-50 scroll-smooth"
    >
      {/* Load More Button */}
      {hasMore && (
        <div className="flex justify-center py-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={handleLoadMore}
            loading={loading}
          >
            Load earlier messages
          </Button>
        </div>
      )}

      {/* Messages */}
      {messages.map((message) => (
        <MessageBubble key={message.id} message={message} />
      ))}

      {/* Streaming Message */}
      {streaming && (
        <StreamingMessage content={streamingContent} />
      )}

      {/* Voice Processing Indicator */}
      {state.voice.isProcessing && (
        <div className="flex items-center gap-2 text-gray-500 animate-pulse">
          <LoadingSpinner size="sm" />
          <span className="text-sm">Processing voice message...</span>
        </div>
      )}

      {/* Scroll anchor */}
      <div ref={messagesEndRef} className="h-0 w-0" />
    </div>
  );
}
