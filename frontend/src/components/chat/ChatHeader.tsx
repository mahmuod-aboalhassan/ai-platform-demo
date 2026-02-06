import React from 'react';
import { Bot } from 'lucide-react';
import { useAppContext } from '../../context/AppContext';

export function ChatHeader() {
  const { state } = useAppContext();
  const selectedAgent = state.agents.items.find((a) => a.id === state.agents.selectedId);
  const selectedSession = state.sessions.items.find((s) => s.id === state.sessions.selectedId);

  return (
    <header className="flex items-center gap-4 px-6 py-4 border-b border-gray-200 bg-white">
      <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
        <Bot className="h-5 w-5 text-blue-600" />
      </div>
      <div>
        <h2 className="font-semibold text-gray-900">
          {selectedAgent?.name || 'Agent'}
        </h2>
        <p className="text-sm text-gray-500 truncate max-w-md">
          {selectedSession?.title || 'New Session'}
        </p>
      </div>
    </header>
  );
}
