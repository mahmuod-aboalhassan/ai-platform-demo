import React from 'react';
import { MessageSquare, Trash2 } from 'lucide-react';
import { useAppContext } from '../../context/AppContext';
import type { Session } from '../../types';

interface SessionCardProps {
  session: Session;
  isSelected: boolean;
  onSelect: () => void;
}

export function SessionCard({ session, isSelected, onSelect }: SessionCardProps) {
  const { dispatch } = useAppContext();

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    dispatch({
      type: 'OPEN_MODAL',
      payload: {
        type: 'delete-session',
        deletingItem: {
          type: 'session',
          id: session.id,
          name: session.title || 'Untitled Session',
        },
      },
    });
  };

  const formatDate = (dateString: string) => {
    // Backend sends UTC strings (e.g., "2024-02-06T16:00:00.123456").
    // If they lack 'Z', adding 'Z' forces UTC parsing.
    const normalizedDateString = dateString.endsWith('Z') ? dateString : `${dateString}Z`;
    const date = new Date(normalizedDateString);
    const now = new Date();
    
    // Ensure we are comparing timestamps roughly
    const diffMs = now.getTime() - date.getTime();
    
    // Handle potential future dates (clock skew) gracefully
    if (diffMs < 0) return 'Just now';

    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <div
      onClick={onSelect}
      className={`group p-3 rounded-xl cursor-pointer transition-all duration-200 border border-transparent ${
        isSelected
          ? 'bg-primary-500/10 border-primary-500/20 text-white shadow-lg shadow-primary-900/20'
          : 'hover:bg-white/5 text-slate-400 hover:text-slate-200'
      }`}
    >
      <div className="flex items-start gap-3">
        <div 
          className={`flex-shrink-0 h-8 w-8 rounded-lg flex items-center justify-center transition-colors ${
            isSelected ? 'bg-primary-500/20 text-primary-300' : 'bg-slate-800 text-slate-500 group-hover:bg-slate-700 group-hover:text-slate-300'
          }`}
        >
          <MessageSquare className="h-4 w-4" />
        </div>
        <div className="flex-1 min-w-0 py-0.5">
          <div className="flex items-center justify-between">
            <h4 className={`font-medium truncate text-sm ${isSelected ? 'text-white' : 'text-slate-300'}`}>
              {session.title || 'New Session'}
            </h4>
            <button
              onClick={handleDelete}
              className="p-1 rounded opacity-0 group-hover:opacity-100 hover:bg-red-500/20 hover:text-red-400 transition-all text-slate-500"
              title="Delete"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </div>
          <div className={`flex items-center gap-2 mt-1.5 text-xs ${isSelected ? 'text-primary-200' : 'text-slate-500'}`}>
            <span>{session.message_count} messages</span>
            <span>·</span>
            <span>{formatDate(session.updated_at)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
