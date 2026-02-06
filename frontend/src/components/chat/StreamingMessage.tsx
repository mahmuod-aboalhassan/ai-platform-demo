import React from 'react';
import { Bot } from 'lucide-react';

interface StreamingMessageProps {
  content: string;
}

export function StreamingMessage({ content }: StreamingMessageProps) {
  return (
    <div className="flex gap-3">
      {/* Avatar */}
      <div className="flex-shrink-0 h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center">
        <Bot className="h-4 w-4 text-gray-600" />
      </div>

      {/* Message Content */}
      <div className="flex flex-col items-start max-w-[70%]">
        <div className="px-4 py-2 rounded-2xl rounded-tl-none bg-white text-gray-900 shadow-sm border border-gray-100">
          {content ? (
            <p className="whitespace-pre-wrap break-words">{content}</p>
          ) : (
            <div className="flex items-center gap-1">
              <span className="h-2 w-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
              <span className="h-2 w-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
              <span className="h-2 w-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
