import { useCallback } from 'react';
import { useAppContext } from '../context/AppContext';
import { agentService } from '../services/agentService';
import type { AgentCreate, AgentUpdate } from '../types';

export function useAgents() {
  const { state, dispatch } = useAppContext();

  const fetchAgents = useCallback(async () => {
    dispatch({ type: 'SET_AGENTS_LOADING' });
    try {
      const response = await agentService.list();
      dispatch({ type: 'SET_AGENTS', payload: response.agents });
    } catch (error) {
      dispatch({ type: 'SET_AGENTS_ERROR', payload: 'Failed to load agents' });
    }
  }, [dispatch]);

  const selectAgent = useCallback(
    (id: string | null) => {
      dispatch({ type: 'SELECT_AGENT', payload: id });
    },
    [dispatch]
  );

  const createAgent = useCallback(
    async (data: AgentCreate) => {
      const agent = await agentService.create(data);
      dispatch({ type: 'ADD_AGENT', payload: agent });
      return agent;
    },
    [dispatch]
  );

  const updateAgent = useCallback(
    async (id: string, data: AgentUpdate) => {
      const agent = await agentService.update(id, data);
      dispatch({ type: 'UPDATE_AGENT', payload: agent });
      return agent;
    },
    [dispatch]
  );

  const deleteAgent = useCallback(
    async (id: string) => {
      await agentService.delete(id);
      dispatch({ type: 'REMOVE_AGENT', payload: id });
    },
    [dispatch]
  );

  return {
    agents: state.agents.items,
    loading: state.agents.loading,
    error: state.agents.error,
    selectedId: state.agents.selectedId,
    selectedAgent: state.agents.items.find((a) => a.id === state.agents.selectedId) || null,
    fetchAgents,
    selectAgent,
    createAgent,
    updateAgent,
    deleteAgent,
  };
}
