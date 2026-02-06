import React, { useState } from 'react';
import { Send, Headphones } from 'lucide-react';
import { useAppContext } from '../../context/AppContext';
import { useChat } from '../../hooks/useChat';
import { VoiceButton } from '../voice/VoiceButton';

export function ChatInput() {
  const { state } = useAppContext();
  const { sendMessage, streaming, startVoiceMode } = useChat();
  const [input, setInput] = useState('');

  const sessionId = state.sessions.selectedId;
  const isDisabled = !sessionId || streaming || state.voice.isProcessing || state.voice.isRecording;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !sessionId || isDisabled) return;

    const content = input.trim();
    setInput('');
    await sendMessage(sessionId, content);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <div className="p-4 bg-white border-t border-slate-200">
      <div className="max-w-4xl mx-auto w-full">
        <form onSubmit={handleSubmit} className="relative flex items-end gap-2 bg-slate-50 p-2 rounded-2xl border border-slate-200 focus-within:ring-2 focus-within:ring-primary-500/20 focus-within:border-primary-500 transition-all shadow-sm">
          <div className="flex-1 min-w-0">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type a message..."
              disabled={isDisabled}
              rows={1}
              className="w-full px-4 py-3 bg-transparent border-none focus:ring-0 resize-none max-h-32 min-h-[48px] placeholder:text-slate-400 text-slate-700 disabled:opacity-50"
              style={{ height: 'auto' }}
              onInput={(e) => {
                const target = e.target as HTMLTextAreaElement;
                target.style.height = 'auto';
                target.style.height = `${Math.min(target.scrollHeight, 128)}px`;
              }}
            />
          </div>

          <div className="flex items-center gap-2 pb-1 pr-1">
            <button
              type="button"
              onClick={startVoiceMode}
              className="flex-shrink-0 h-10 w-10 rounded-xl bg-violet-100 text-violet-600 flex items-center justify-center hover:bg-violet-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              title="Enter Voice Mode"
              disabled={isDisabled}
            >
              <Headphones className="h-5 w-5" />
            </button>
            
            <VoiceButton />
            
            <button
              type="submit"
              disabled={!input.trim() || isDisabled}
              className="flex-shrink-0 h-10 w-10 rounded-xl bg-primary-600 text-white flex items-center justify-center hover:bg-primary-700 transition-all disabled:bg-slate-300 disabled:cursor-not-allowed shadow-md shadow-primary-500/20 active:scale-95"
            >
              <Send className="h-5 w-5" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
