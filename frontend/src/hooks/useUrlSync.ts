import { useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { agentService } from '../services/agentService';
import { sessionService } from '../services/sessionService';

/**
 * Hook to sync URL params with app state.
 * - Reads URL params and hydrates state when params change
 * - Navigation is handled by components via useNavigate
 */
export function useUrlSync() {
    const { agentId, sessionId } = useParams<{ agentId?: string; sessionId?: string }>();
    const { state, dispatch } = useAppContext();

    // Track what we've already loaded to avoid duplicate fetches
    const loadedAgentId = useRef<string | null>(null);
    const loadedSessionId = useRef<string | null>(null);

    // Hydrate agents and select from URL
    useEffect(() => {
        const hydrateAgent = async () => {
            // If no agentId in URL, ensure nothing is selected
            if (!agentId) {
                if (state.agents.selectedId !== null) {
                    dispatch({ type: 'SELECT_AGENT', payload: null });
                }
                loadedAgentId.current = null;
                loadedSessionId.current = null;
                return;
            }

            // If we've already loaded this agent, skip
            if (loadedAgentId.current === agentId && state.agents.selectedId === agentId) {
                return;
            }

            // Load agents if not already loaded
            if (state.agents.items.length === 0 && !state.agents.loading) {
                dispatch({ type: 'SET_AGENTS_LOADING' });
                try {
                    const response = await agentService.list();
                    dispatch({ type: 'SET_AGENTS', payload: response.agents });
                } catch (error) {
                    dispatch({ type: 'SET_AGENTS_ERROR', payload: 'Failed to load agents' });
                    return;
                }
            }

            // Select the agent from URL
            if (state.agents.selectedId !== agentId) {
                dispatch({ type: 'SELECT_AGENT', payload: agentId });
                loadedAgentId.current = agentId;
            }
        };

        hydrateAgent();
    }, [agentId, state.agents.items.length, state.agents.loading, state.agents.selectedId, dispatch]);

    // Hydrate sessions and select from URL
    useEffect(() => {
        const hydrateSession = async () => {
            // If no agentId or sessionId, ensure nothing is selected
            if (!agentId || !sessionId) {
                if (state.sessions.selectedId !== null && !sessionId) {
                    dispatch({ type: 'SELECT_SESSION', payload: null });
                }
                loadedSessionId.current = null;
                return;
            }

            // Only proceed if agent is selected
            if (state.agents.selectedId !== agentId) {
                return;
            }

            // If we've already loaded this session, skip
            if (loadedSessionId.current === sessionId && state.sessions.selectedId === sessionId) {
                return;
            }

            // Load sessions if not already loaded for this agent
            if (state.sessions.items.length === 0 && !state.sessions.loading) {
                dispatch({ type: 'SET_SESSIONS_LOADING' });
                try {
                    const response = await sessionService.list(agentId);
                    dispatch({ type: 'SET_SESSIONS', payload: response.sessions });
                } catch (error) {
                    dispatch({ type: 'SET_SESSIONS_ERROR', payload: 'Failed to load sessions' });
                    return;
                }
            }

            // Select the session from URL
            if (state.sessions.selectedId !== sessionId) {
                dispatch({ type: 'SELECT_SESSION', payload: sessionId });
                loadedSessionId.current = sessionId;
            }
        };

        hydrateSession();
    }, [agentId, sessionId, state.agents.selectedId, state.sessions.items.length, state.sessions.loading, state.sessions.selectedId, dispatch]);

    return { agentId, sessionId };
}
