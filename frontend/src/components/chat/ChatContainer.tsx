import React from 'react';
import { ChatHeader } from './ChatHeader';
import { MessageList } from './MessageList';
import { ChatInput } from './ChatInput';

export function ChatContainer() {
  return (
    <div className="flex flex-col flex-1 w-full h-full bg-slate-50 relative overflow-hidden">
      <ChatHeader />
      <div className="flex-1 overflow-scroll relative">
        <MessageList />
      </div>
      <ChatInput />
    </div>
  );
}
