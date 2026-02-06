import React from 'react';
import { Bot, Edit2, Trash2, MessageSquare } from 'lucide-react';
import { useAppContext } from '../../context/AppContext';
import type { Agent } from '../../types';

interface AgentCardProps {
  agent: Agent;
  isSelected: boolean;
  onSelect: () => void;
}

export function AgentCard({ agent, isSelected, onSelect }: AgentCardProps) {
  const { dispatch } = useAppContext();

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    dispatch({
      type: 'OPEN_MODAL',
      payload: { type: 'agent-edit', agent },
    });
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    dispatch({
      type: 'OPEN_MODAL',
      payload: {
        type: 'delete-agent',
        deletingItem: {
          type: 'agent',
          id: agent.id,
          name: agent.name,
        },
      },
    });
  };

  return (
    <div
      onClick={onSelect}
      className={`group p-4 rounded-xl cursor-pointer transition-all duration-200 border border-transparent ${
        isSelected
          ? 'bg-primary-500/10 border-primary-500/20 text-white shadow-lg shadow-primary-900/20'
          : 'bg-white/5 hover:bg-white/10 border-white/5 hover:border-white/10 text-slate-400 hover:text-slate-200'
      }`}
    >
      <div className="flex items-start gap-4">
        <div
          className={`flex-shrink-0 h-12 w-12 rounded-xl flex items-center justify-center transition-colors ${
            isSelected ? 'bg-primary-500 text-white' : 'bg-slate-800 text-slate-400 group-hover:bg-slate-700'
          }`}
        >
          <Bot className="h-6 w-6" />
        </div>
        <div className="flex-1 min-w-0 py-0.5">
          <div className="flex items-center justify-between">
            <h4 className={`font-medium text-lg truncate ${isSelected ? 'text-white' : 'text-slate-200'}`}>
              {agent.name}
            </h4>
            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                onClick={handleEdit}
                className={`p-1.5 rounded-md hover:bg-white/10 transition-colors ${
                  isSelected ? 'text-white' : 'text-slate-400 hover:text-white'
                }`}
                title="Edit"
              >
                <Edit2 className="h-4 w-4" />
              </button>
              <button
                onClick={handleDelete}
                className={`p-1.5 rounded-md hover:bg-red-500/20 hover:text-red-400 transition-colors ${
                  isSelected ? 'text-white/60' : 'text-slate-400'
                }`}
                title="Delete"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </div>
          <div className="flex items-center gap-1.5 mt-2">
            <MessageSquare className={`h-3.5 w-3.5 ${isSelected ? 'text-primary-300' : 'text-slate-500'}`} />
            <span className={`text-sm ${isSelected ? 'text-primary-200' : 'text-slate-500'}`}>
              {agent.session_count} sessions
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
