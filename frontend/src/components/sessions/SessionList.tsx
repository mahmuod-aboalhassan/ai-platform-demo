import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useSessions } from '../../hooks/useSessions';
import { useAgents } from '../../hooks/useAgents';
import { SessionCard } from './SessionCard';
import { LoadingSpinner } from '../common/LoadingSpinner';

export function SessionList() {
  const { sessions, loading, error, selectedId } = useSessions();
  const { selectedId: agentId } = useAgents();
  const navigate = useNavigate();

  const handleSelectSession = (sessionId: string) => {
    if (agentId) {
      navigate(`/chat/${agentId}/${sessionId}`);
    }
  };

  if (loading) {
    return <LoadingSpinner size="sm" className="py-4" />;
  }

  if (error) {
    return <p className="text-red-400 text-sm py-4">{error}</p>;
  }

  if (sessions.length === 0) {
    return (
      <p className="text-gray-500 text-sm py-4">
        No sessions yet. Start a new conversation!
      </p>
    );
  }

  return (
    <div className="space-y-2 flex-1 overflow-y-auto">
      {sessions.map((session) => (
        <SessionCard
          key={session.id}
          session={session}
          isSelected={session.id === selectedId}
          onSelect={() => handleSelectSession(session.id)}
        />
      ))}
    </div>
  );
}

