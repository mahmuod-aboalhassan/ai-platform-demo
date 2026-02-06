// Agent types
export interface Agent {
  id: string;
  name: string;
  system_prompt: string;
  created_at: string;
  updated_at: string;
  session_count: number;
}

export interface AgentCreate {
  name: string;
  system_prompt: string;
}

export interface AgentUpdate {
  name?: string;
  system_prompt?: string;
}

// Session types
export interface Session {
  id: string;
  agent_id: string;
  title: string | null;
  created_at: string;
  updated_at: string;
  message_count: number;
}

export interface SessionCreate {
  title?: string;
}

export interface SessionDetail extends Session {
  messages: Message[];
  agent: Agent;
}

// Message types
export type MessageRole = 'user' | 'assistant';
export type MessageType = 'text' | 'voice';

export interface Message {
  id: string;
  session_id: string;
  role: MessageRole;
  content: string;
  message_type: MessageType;
  audio_url: string | null;
  tts_audio_url: string | null;
  created_at: string;
}

export interface MessageCreate {
  content: string;
}

// Voice types
export interface VoiceMessageResponse {
  user_message: Message;
  assistant_message: Message;
}

// API Response types
export interface AgentListResponse {
  agents: Agent[];
  total: number;
}

export interface SessionListResponse {
  sessions: Session[];
  total: number;
}

export interface MessageListResponse {
  messages: Message[];
  has_more: boolean;
  total_count: number;
}

// SSE Event types
export interface SSETokenEvent {
  content: string;
}

export interface SSEDoneEvent {
  message_id: string;
  full_content: string;
}

export interface SSEErrorEvent {
  error: string;
  fallback_message: string;
}

// Health types
export interface HealthResponse {
  status: string;
  version: string;
  database: string;
  openai: string;
}
