import React from 'react';
import { Bot, User, Mic, Volume2 } from 'lucide-react';
import { useAudioPlayer } from '../../hooks/useAudioPlayer';
import type { Message } from '../../types';

interface MessageBubbleProps {
  message: Message;
}

export function MessageBubble({ message }: MessageBubbleProps) {
  const { isPlaying, currentUrl, toggle } = useAudioPlayer();
  const isUser = message.role === 'user';
  const isVoice = message.message_type === 'voice';
  const audioUrl = isUser ? message.audio_url : message.tts_audio_url;

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className={`flex gap-3 max-w-[85%] ${isUser ? 'ml-auto flex-row-reverse' : ''}`}>
      {/* Avatar */}
      <div
        className={`flex-shrink-0 h-9 w-9 rounded-full flex items-center justify-center shadow-sm ${
          isUser ? 'bg-primary-600' : 'bg-white border border-slate-200'
        }`}
      >
        {isUser ? (
          <User className="h-4 w-4 text-white" />
        ) : (
          <Bot className="h-5 w-5 text-primary-600" />
        )}
      </div>

      {/* Message Content */}
      <div className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} min-w-0`}>
        <div
          className={`px-5 py-3 rounded-2xl shadow-sm ${
            isUser
              ? 'bg-primary-600 text-white rounded-tr-sm'
              : 'bg-white text-slate-800 rounded-tl-sm border border-slate-100'
          }`}
        >
          {/* Voice indicator */}
          {isVoice && (
            <div className={`flex items-center gap-1.5 mb-2 ${isUser ? 'text-white/80' : 'text-slate-500'}`}>
              <div className={`p-1 rounded-full ${isUser ? 'bg-white/20' : 'bg-slate-100'}`}>
                <Mic className="h-3 w-3" />
              </div>
              <span className="text-xs font-medium">Voice message</span>
            </div>
          )}

          {/* Message text */}
          <p className="whitespace-pre-wrap break-words leading-relaxed text-[15px]">{message.content}</p>

          {/* Audio player */}
          {audioUrl && (
            <button
              onClick={() => toggle(audioUrl)}
              className={`mt-3 flex items-center gap-2 pl-3 pr-4 py-2 rounded-xl text-sm font-medium transition-all ${
                isUser
                  ? 'bg-white/10 hover:bg-white/20 text-white border border-white/10'
                  : 'bg-primary-50 hover:bg-primary-100 text-primary-700 border border-primary-200'
              }`}
            >
              <div className={`flex items-center justify-center h-6 w-6 rounded-lg ${
                isUser ? 'bg-white/20' : 'bg-primary-200'
              }`}>
                <Volume2
                  className={`h-3.5 w-3.5 ${
                    isPlaying && currentUrl === audioUrl ? 'animate-pulse' : ''
                  }`}
                />
              </div>
              {isPlaying && currentUrl === audioUrl ? 'Playing...' : 'Play audio'}
            </button>
          )}
        </div>

        {/* Timestamp */}
        <span className={`text-[11px] font-medium text-slate-400 mt-1.5 px-1 ${isUser ? 'text-right' : 'text-left'}`}>
          {formatTime(message.created_at)}
        </span>
      </div>
    </div>
  );
}
