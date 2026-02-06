import type { Agent, Session, Message } from '../types';

// State interfaces
export interface AgentsState {
  items: Agent[];
  loading: boolean;
  error: string | null;
  selectedId: string | null;
}

export interface SessionsState {
  items: Session[];
  loading: boolean;
  error: string | null;
  selectedId: string | null;
}

export interface MessagesState {
  items: Message[];
  loading: boolean;
  error: string | null;
  hasMore: boolean;
  totalCount: number;
  streaming: boolean;
  streamingContent: string;
}

export interface VoiceState {
  isRecording: boolean;
  isProcessing: boolean;
  recordingDuration: number;
  error: string | null;
  isVoiceMode: boolean;
}

export interface UIState {
  sidebarCollapsed: boolean;
  modalType: 'agent-create' | 'agent-edit' | 'delete-agent' | 'delete-session' | null;
  editingAgent: Agent | null;
  deletingItem: { type: 'agent' | 'session'; id: string; name: string } | null;
}

export interface AppState {
  agents: AgentsState;
  sessions: SessionsState;
  messages: MessagesState;
  voice: VoiceState;
  ui: UIState;
}

// Initial state
export const initialState: AppState = {
  agents: {
    items: [],
    loading: false,
    error: null,
    selectedId: null,
  },
  sessions: {
    items: [],
    loading: false,
    error: null,
    selectedId: null,
  },
  messages: {
    items: [],
    loading: false,
    error: null,
    hasMore: false,
    totalCount: 0,
    streaming: false,
    streamingContent: '',
  },
  voice: {
    isRecording: false,
    isProcessing: false,
    recordingDuration: 0,
    error: null,
    isVoiceMode: false,
  },
  ui: {
    sidebarCollapsed: false,
    modalType: null,
    editingAgent: null,
    deletingItem: null,
  },
};

// Action types
export type AppAction =
  // Agents
  | { type: 'SET_AGENTS_LOADING' }
  | { type: 'SET_AGENTS'; payload: Agent[] }
  | { type: 'SET_AGENTS_ERROR'; payload: string }
  | { type: 'SELECT_AGENT'; payload: string | null }
  | { type: 'ADD_AGENT'; payload: Agent }
  | { type: 'UPDATE_AGENT'; payload: Agent }
  | { type: 'REMOVE_AGENT'; payload: string }
  // Sessions
  | { type: 'SET_SESSIONS_LOADING' }
  | { type: 'SET_SESSIONS'; payload: Session[] }
  | { type: 'SET_SESSIONS_ERROR'; payload: string }
  | { type: 'SELECT_SESSION'; payload: string | null }
  | { type: 'ADD_SESSION'; payload: Session }
  | { type: 'UPDATE_SESSION'; payload: Session }
  | { type: 'REMOVE_SESSION'; payload: string }
  // Messages
  | { type: 'SET_MESSAGES_LOADING' }
  | { type: 'SET_MESSAGES'; payload: { messages: Message[]; hasMore: boolean; totalCount: number } }
  | { type: 'PREPEND_MESSAGES'; payload: { messages: Message[]; hasMore: boolean } }
  | { type: 'SET_MESSAGES_ERROR'; payload: string }
  | { type: 'ADD_MESSAGE'; payload: Message }
  | { type: 'CLEAR_MESSAGES' }
  // Streaming
  | { type: 'START_STREAMING' }
  | { type: 'APPEND_STREAMING_CONTENT'; payload: string }
  | { type: 'FINISH_STREAMING'; payload: Message }
  | { type: 'STREAMING_ERROR'; payload: string }
  // Voice
  | { type: 'START_RECORDING' }
  | { type: 'UPDATE_RECORDING_DURATION'; payload: number }
  | { type: 'STOP_RECORDING' }
  | { type: 'START_VOICE_PROCESSING' }
  | { type: 'FINISH_VOICE_PROCESSING' }
  | { type: 'VOICE_ERROR'; payload: string }
  | { type: 'SET_VOICE_MODE'; payload: boolean }
  // UI
  | { type: 'TOGGLE_SIDEBAR' }
  | { type: 'OPEN_MODAL'; payload: { type: AppState['ui']['modalType']; agent?: Agent; deletingItem?: AppState['ui']['deletingItem'] } }
  | { type: 'CLOSE_MODAL' };

// Reducer
export function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    // Agents
    case 'SET_AGENTS_LOADING':
      return { ...state, agents: { ...state.agents, loading: true, error: null } };
    case 'SET_AGENTS':
      return { ...state, agents: { ...state.agents, items: action.payload, loading: false } };
    case 'SET_AGENTS_ERROR':
      return { ...state, agents: { ...state.agents, error: action.payload, loading: false } };
    case 'SELECT_AGENT':
      return {
        ...state,
        agents: { ...state.agents, selectedId: action.payload },
        sessions: { ...state.sessions, items: [], selectedId: null },
        messages: { ...state.messages, items: [], hasMore: false, totalCount: 0 },
      };
    case 'ADD_AGENT':
      return { ...state, agents: { ...state.agents, items: [action.payload, ...state.agents.items] } };
    case 'UPDATE_AGENT':
      return {
        ...state,
        agents: {
          ...state.agents,
          items: state.agents.items.map((a) => (a.id === action.payload.id ? action.payload : a)),
        },
      };
    case 'REMOVE_AGENT':
      return {
        ...state,
        agents: {
          ...state.agents,
          items: state.agents.items.filter((a) => a.id !== action.payload),
          selectedId: state.agents.selectedId === action.payload ? null : state.agents.selectedId,
        },
      };

    // Sessions
    case 'SET_SESSIONS_LOADING':
      return { ...state, sessions: { ...state.sessions, loading: true, error: null } };
    case 'SET_SESSIONS':
      return { ...state, sessions: { ...state.sessions, items: action.payload, loading: false } };
    case 'SET_SESSIONS_ERROR':
      return { ...state, sessions: { ...state.sessions, error: action.payload, loading: false } };
    case 'SELECT_SESSION':
      return {
        ...state,
        sessions: { ...state.sessions, selectedId: action.payload },
        messages: { ...state.messages, items: [], hasMore: false, totalCount: 0, streaming: false, streamingContent: '' },
      };
    case 'ADD_SESSION':
      return { ...state, sessions: { ...state.sessions, items: [action.payload, ...state.sessions.items] } };
    case 'UPDATE_SESSION':
      return {
        ...state,
        sessions: {
          ...state.sessions,
          items: state.sessions.items.map((s) => (s.id === action.payload.id ? action.payload : s)),
        },
      };
    case 'REMOVE_SESSION':
      return {
        ...state,
        sessions: {
          ...state.sessions,
          items: state.sessions.items.filter((s) => s.id !== action.payload),
          selectedId: state.sessions.selectedId === action.payload ? null : state.sessions.selectedId,
        },
      };

    // Messages
    case 'SET_MESSAGES_LOADING':
      return { ...state, messages: { ...state.messages, loading: true, error: null } };
    case 'SET_MESSAGES':
      return {
        ...state,
        messages: {
          ...state.messages,
          items: action.payload.messages,
          hasMore: action.payload.hasMore,
          totalCount: action.payload.totalCount,
          loading: false,
        },
      };
    case 'PREPEND_MESSAGES':
      return {
        ...state,
        messages: {
          ...state.messages,
          items: [...action.payload.messages, ...state.messages.items],
          hasMore: action.payload.hasMore,
          loading: false,
        },
      };
    case 'SET_MESSAGES_ERROR':
      return { ...state, messages: { ...state.messages, error: action.payload, loading: false } };
    case 'ADD_MESSAGE':
      return { ...state, messages: { ...state.messages, items: [...state.messages.items, action.payload] } };
    case 'CLEAR_MESSAGES':
      return { ...state, messages: { ...state.messages, items: [], hasMore: false, totalCount: 0 } };

    // Streaming
    case 'START_STREAMING':
      return { ...state, messages: { ...state.messages, streaming: true, streamingContent: '' } };
    case 'APPEND_STREAMING_CONTENT':
      return { ...state, messages: { ...state.messages, streamingContent: state.messages.streamingContent + action.payload } };
    case 'FINISH_STREAMING':
      return {
        ...state,
        messages: {
          ...state.messages,
          streaming: false,
          streamingContent: '',
          items: [...state.messages.items, action.payload],
        },
      };
    case 'STREAMING_ERROR':
      return { ...state, messages: { ...state.messages, streaming: false, streamingContent: '', error: action.payload } };

    // Voice
    case 'START_RECORDING':
      return { ...state, voice: { ...state.voice, isRecording: true, recordingDuration: 0, error: null } };
    case 'UPDATE_RECORDING_DURATION':
      return { ...state, voice: { ...state.voice, recordingDuration: action.payload } };
    case 'STOP_RECORDING':
      return { ...state, voice: { ...state.voice, isRecording: false } };
    case 'START_VOICE_PROCESSING':
      return { ...state, voice: { ...state.voice, isProcessing: true, error: null } };
    case 'FINISH_VOICE_PROCESSING':
      return { ...state, voice: { ...state.voice, isProcessing: false } };
    case 'VOICE_ERROR':
      return { ...state, voice: { ...state.voice, isProcessing: false, error: action.payload } };
    case 'SET_VOICE_MODE':
      return { ...state, voice: { ...state.voice, isVoiceMode: action.payload } };

    // UI
    case 'TOGGLE_SIDEBAR':
      return { ...state, ui: { ...state.ui, sidebarCollapsed: !state.ui.sidebarCollapsed } };
    case 'OPEN_MODAL':
      return {
        ...state,
        ui: {
          ...state.ui,
          modalType: action.payload.type,
          editingAgent: action.payload.agent || null,
          deletingItem: action.payload.deletingItem || null,
        },
      };
    case 'CLOSE_MODAL':
      return { ...state, ui: { ...state.ui, modalType: null, editingAgent: null, deletingItem: null } };

    default:
      return state;
  }
}
