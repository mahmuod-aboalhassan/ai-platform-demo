import { useCallback } from 'react';
import { useAppContext } from '../context/AppContext';
import { sessionService } from '../services/sessionService';
import { messageService } from '../services/messageService';
import type { SessionCreate } from '../types';

export function useSessions() {
  const { state, dispatch } = useAppContext();

  const fetchSessions = useCallback(
    async (agentId: string) => {
      dispatch({ type: 'SET_SESSIONS_LOADING' });
      try {
        const response = await sessionService.list(agentId);
        dispatch({ type: 'SET_SESSIONS', payload: response.sessions });
      } catch (error) {
        dispatch({ type: 'SET_SESSIONS_ERROR', payload: 'Failed to load sessions' });
      }
    },
    [dispatch]
  );

  const selectSession = useCallback(
    async (id: string | null) => {
      dispatch({ type: 'SELECT_SESSION', payload: id });

      if (id) {
        // Load messages for the selected session
        dispatch({ type: 'SET_MESSAGES_LOADING' });
        try {
          const response = await messageService.list(id);
          dispatch({
            type: 'SET_MESSAGES',
            payload: {
              messages: response.messages,
              hasMore: response.has_more,
              totalCount: response.total_count,
            },
          });
        } catch (error) {
          dispatch({ type: 'SET_MESSAGES_ERROR', payload: 'Failed to load messages' });
        }
      }
    },
    [dispatch]
  );

  const createSession = useCallback(
    async (agentId: string, data: SessionCreate = {}) => {
      const session = await sessionService.create(agentId, data);
      dispatch({ type: 'ADD_SESSION', payload: session });
      return session;
    },
    [dispatch]
  );

  const deleteSession = useCallback(
    async (id: string) => {
      await sessionService.delete(id);
      dispatch({ type: 'REMOVE_SESSION', payload: id });
    },
    [dispatch]
  );

  return {
    sessions: state.sessions.items,
    loading: state.sessions.loading,
    error: state.sessions.error,
    selectedId: state.sessions.selectedId,
    selectedSession: state.sessions.items.find((s) => s.id === state.sessions.selectedId) || null,
    fetchSessions,
    selectSession,
    createSession,
    deleteSession,
  };
}
