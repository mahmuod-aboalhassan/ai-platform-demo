import { describe, it, expect } from 'vitest';
import { appReducer, initialState, AppState } from './AppReducer';
import type { Agent, Session, Message } from '../types';

const mockAgent: Agent = {
  id: '1',
  name: 'Test Agent',
  system_prompt: 'You are a test agent',
  session_count: 0,
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z',
};

const mockSession: Session = {
  id: 's1',
  agent_id: '1',
  title: 'Test Session',
  message_count: 0,
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z',
};

const mockMessage: Message = {
  id: 'm1',
  session_id: 's1',
  role: 'user',
  content: 'Hello',
  message_type: 'text',
  audio_url: null,
  tts_audio_url: null,
  created_at: '2024-01-01T00:00:00Z',
};

describe('AppReducer', () => {
  describe('Agents', () => {
    it('sets agents loading state', () => {
      const state = appReducer(initialState, { type: 'SET_AGENTS_LOADING' });
      expect(state.agents.loading).toBe(true);
      expect(state.agents.error).toBeNull();
    });

    it('sets agents list', () => {
      const agents = [mockAgent];
      const state = appReducer(initialState, { type: 'SET_AGENTS', payload: agents });
      expect(state.agents.items).toEqual(agents);
      expect(state.agents.loading).toBe(false);
    });

    it('sets agents error', () => {
      const state = appReducer(initialState, { type: 'SET_AGENTS_ERROR', payload: 'Error' });
      expect(state.agents.error).toBe('Error');
      expect(state.agents.loading).toBe(false);
    });

    it('selects an agent and clears sessions/messages', () => {
      const stateWithSessions: AppState = {
        ...initialState,
        sessions: { ...initialState.sessions, items: [mockSession], selectedId: 's1' },
        messages: { ...initialState.messages, items: [mockMessage] },
      };
      const state = appReducer(stateWithSessions, { type: 'SELECT_AGENT', payload: '1' });
      expect(state.agents.selectedId).toBe('1');
      expect(state.sessions.items).toEqual([]);
      expect(state.sessions.selectedId).toBeNull();
      expect(state.messages.items).toEqual([]);
    });

    it('adds an agent to the beginning of the list', () => {
      const existingAgent = { ...mockAgent, id: '2', name: 'Existing' };
      const stateWithAgent: AppState = {
        ...initialState,
        agents: { ...initialState.agents, items: [existingAgent] },
      };
      const state = appReducer(stateWithAgent, { type: 'ADD_AGENT', payload: mockAgent });
      expect(state.agents.items).toHaveLength(2);
      expect(state.agents.items[0]).toEqual(mockAgent);
    });

    it('updates an agent', () => {
      const stateWithAgent: AppState = {
        ...initialState,
        agents: { ...initialState.agents, items: [mockAgent] },
      };
      const updatedAgent = { ...mockAgent, name: 'Updated Agent' };
      const state = appReducer(stateWithAgent, { type: 'UPDATE_AGENT', payload: updatedAgent });
      expect(state.agents.items[0].name).toBe('Updated Agent');
    });

    it('removes an agent', () => {
      const stateWithAgent: AppState = {
        ...initialState,
        agents: { ...initialState.agents, items: [mockAgent], selectedId: '1' },
      };
      const state = appReducer(stateWithAgent, { type: 'REMOVE_AGENT', payload: '1' });
      expect(state.agents.items).toHaveLength(0);
      expect(state.agents.selectedId).toBeNull();
    });
  });

  describe('Sessions', () => {
    it('sets sessions loading state', () => {
      const state = appReducer(initialState, { type: 'SET_SESSIONS_LOADING' });
      expect(state.sessions.loading).toBe(true);
    });

    it('sets sessions list', () => {
      const sessions = [mockSession];
      const state = appReducer(initialState, { type: 'SET_SESSIONS', payload: sessions });
      expect(state.sessions.items).toEqual(sessions);
      expect(state.sessions.loading).toBe(false);
    });

    it('selects a session and clears messages', () => {
      const stateWithMessages: AppState = {
        ...initialState,
        messages: { ...initialState.messages, items: [mockMessage], streaming: true },
      };
      const state = appReducer(stateWithMessages, { type: 'SELECT_SESSION', payload: 's1' });
      expect(state.sessions.selectedId).toBe('s1');
      expect(state.messages.items).toEqual([]);
      expect(state.messages.streaming).toBe(false);
    });

    it('adds a session', () => {
      const state = appReducer(initialState, { type: 'ADD_SESSION', payload: mockSession });
      expect(state.sessions.items).toHaveLength(1);
      expect(state.sessions.items[0]).toEqual(mockSession);
    });

    it('removes a session', () => {
      const stateWithSession: AppState = {
        ...initialState,
        sessions: { ...initialState.sessions, items: [mockSession], selectedId: 's1' },
      };
      const state = appReducer(stateWithSession, { type: 'REMOVE_SESSION', payload: 's1' });
      expect(state.sessions.items).toHaveLength(0);
      expect(state.sessions.selectedId).toBeNull();
    });
  });

  describe('Messages', () => {
    it('sets messages', () => {
      const payload = { messages: [mockMessage], hasMore: true, totalCount: 10 };
      const state = appReducer(initialState, { type: 'SET_MESSAGES', payload });
      expect(state.messages.items).toEqual([mockMessage]);
      expect(state.messages.hasMore).toBe(true);
      expect(state.messages.totalCount).toBe(10);
    });

    it('prepends messages for pagination', () => {
      const stateWithMessages: AppState = {
        ...initialState,
        messages: { ...initialState.messages, items: [mockMessage] },
      };
      const olderMessage = { ...mockMessage, id: 'm0', content: 'Older' };
      const state = appReducer(stateWithMessages, {
        type: 'PREPEND_MESSAGES',
        payload: { messages: [olderMessage], hasMore: false },
      });
      expect(state.messages.items).toHaveLength(2);
      expect(state.messages.items[0].id).toBe('m0');
    });

    it('adds a message', () => {
      const state = appReducer(initialState, { type: 'ADD_MESSAGE', payload: mockMessage });
      expect(state.messages.items).toHaveLength(1);
    });

    it('clears messages', () => {
      const stateWithMessages: AppState = {
        ...initialState,
        messages: { ...initialState.messages, items: [mockMessage], totalCount: 5 },
      };
      const state = appReducer(stateWithMessages, { type: 'CLEAR_MESSAGES' });
      expect(state.messages.items).toEqual([]);
      expect(state.messages.totalCount).toBe(0);
    });
  });

  describe('Streaming', () => {
    it('starts streaming', () => {
      const state = appReducer(initialState, { type: 'START_STREAMING' });
      expect(state.messages.streaming).toBe(true);
      expect(state.messages.streamingContent).toBe('');
    });

    it('appends streaming content', () => {
      const stateStreaming: AppState = {
        ...initialState,
        messages: { ...initialState.messages, streaming: true, streamingContent: 'Hello' },
      };
      const state = appReducer(stateStreaming, { type: 'APPEND_STREAMING_CONTENT', payload: ' World' });
      expect(state.messages.streamingContent).toBe('Hello World');
    });

    it('finishes streaming and adds message', () => {
      const stateStreaming: AppState = {
        ...initialState,
        messages: { ...initialState.messages, streaming: true, streamingContent: 'Complete' },
      };
      const aiMessage = { ...mockMessage, id: 'm2', role: 'assistant' as const, content: 'Complete' };
      const state = appReducer(stateStreaming, { type: 'FINISH_STREAMING', payload: aiMessage });
      expect(state.messages.streaming).toBe(false);
      expect(state.messages.streamingContent).toBe('');
      expect(state.messages.items).toContainEqual(aiMessage);
    });

    it('handles streaming error', () => {
      const stateStreaming: AppState = {
        ...initialState,
        messages: { ...initialState.messages, streaming: true },
      };
      const state = appReducer(stateStreaming, { type: 'STREAMING_ERROR', payload: 'Connection failed' });
      expect(state.messages.streaming).toBe(false);
      expect(state.messages.error).toBe('Connection failed');
    });
  });

  describe('Voice', () => {
    it('starts recording', () => {
      const state = appReducer(initialState, { type: 'START_RECORDING' });
      expect(state.voice.isRecording).toBe(true);
      expect(state.voice.recordingDuration).toBe(0);
    });

    it('updates recording duration', () => {
      const stateRecording: AppState = {
        ...initialState,
        voice: { ...initialState.voice, isRecording: true },
      };
      const state = appReducer(stateRecording, { type: 'UPDATE_RECORDING_DURATION', payload: 5 });
      expect(state.voice.recordingDuration).toBe(5);
    });

    it('stops recording', () => {
      const stateRecording: AppState = {
        ...initialState,
        voice: { ...initialState.voice, isRecording: true },
      };
      const state = appReducer(stateRecording, { type: 'STOP_RECORDING' });
      expect(state.voice.isRecording).toBe(false);
    });

    it('starts voice processing', () => {
      const state = appReducer(initialState, { type: 'START_VOICE_PROCESSING' });
      expect(state.voice.isProcessing).toBe(true);
    });

    it('finishes voice processing', () => {
      const stateProcessing: AppState = {
        ...initialState,
        voice: { ...initialState.voice, isProcessing: true },
      };
      const state = appReducer(stateProcessing, { type: 'FINISH_VOICE_PROCESSING' });
      expect(state.voice.isProcessing).toBe(false);
    });

    it('handles voice error', () => {
      const state = appReducer(initialState, { type: 'VOICE_ERROR', payload: 'Mic not found' });
      expect(state.voice.error).toBe('Mic not found');
      expect(state.voice.isProcessing).toBe(false);
    });
  });

  describe('UI', () => {
    it('toggles sidebar', () => {
      let state = appReducer(initialState, { type: 'TOGGLE_SIDEBAR' });
      expect(state.ui.sidebarCollapsed).toBe(true);
      state = appReducer(state, { type: 'TOGGLE_SIDEBAR' });
      expect(state.ui.sidebarCollapsed).toBe(false);
    });

    it('opens modal', () => {
      const state = appReducer(initialState, {
        type: 'OPEN_MODAL',
        payload: { type: 'agent-create' },
      });
      expect(state.ui.modalType).toBe('agent-create');
    });

    it('opens modal with agent for editing', () => {
      const state = appReducer(initialState, {
        type: 'OPEN_MODAL',
        payload: { type: 'agent-edit', agent: mockAgent },
      });
      expect(state.ui.modalType).toBe('agent-edit');
      expect(state.ui.editingAgent).toEqual(mockAgent);
    });

    it('closes modal and clears data', () => {
      const stateWithModal: AppState = {
        ...initialState,
        ui: { ...initialState.ui, modalType: 'agent-edit', editingAgent: mockAgent },
      };
      const state = appReducer(stateWithModal, { type: 'CLOSE_MODAL' });
      expect(state.ui.modalType).toBeNull();
      expect(state.ui.editingAgent).toBeNull();
    });
  });
});
