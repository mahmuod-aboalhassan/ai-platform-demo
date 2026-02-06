import React from 'react';
import { MessageSquarePlus } from 'lucide-react';
import { useAppContext } from '../../context/AppContext';
import { ChatContainer } from '../chat/ChatContainer';

export function MainContent() {
  const { state } = useAppContext();
  const hasSession = state.sessions.selectedId !== null;

  if (!hasSession) {
    return (
      <main className="flex-1 flex flex-col items-center justify-center bg-slate-50 p-8">
        <div className="text-center animate-fade-in">
          <div className="mx-auto h-16 w-16 flex items-center justify-center rounded-full bg-white border border-slate-200 shadow-sm mb-4">
            <MessageSquarePlus className="h-8 w-8 text-primary-500" />
          </div>
          <h2 className="text-xl font-semibold text-slate-900 mb-2">
            Select a conversation
          </h2>
          <p className="text-slate-500 max-w-sm">
            Choose an agent and start a new session, or select an existing session to continue your conversation.
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="flex-1 flex flex-col h-full overflow-hidden">
      <ChatContainer />
    </main>
  );
}
