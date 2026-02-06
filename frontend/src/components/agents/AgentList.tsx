import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAgents } from '../../hooks/useAgents';
import { AgentCard } from './AgentCard';
import { LoadingSpinner } from '../common/LoadingSpinner';

export function AgentList() {
  const { agents, loading, error, selectedId } = useAgents();
  const navigate = useNavigate();

  const handleSelectAgent = (agentId: string) => {
    navigate(`/chat/${agentId}`);
  };

  if (loading) {
    return <LoadingSpinner size="sm" className="py-4" />;
  }

  if (error) {
    return <p className="text-red-400 text-sm py-4">{error}</p>;
  }

  if (agents.length === 0) {
    return (
      <p className="text-gray-500 text-sm py-4">
        No agents yet. Create one to get started!
      </p>
    );
  }

  return (
    <div className="space-y-2 flex-1 overflow-y-auto">
      {agents.map((agent) => (
        <AgentCard
          key={agent.id}
          agent={agent}
          isSelected={agent.id === selectedId}
          onSelect={() => handleSelectAgent(agent.id)}
        />
      ))}
    </div>
  );
}

