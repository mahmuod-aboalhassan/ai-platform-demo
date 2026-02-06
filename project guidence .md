AI Agent Platform - Deep Requirements Analysis & Planning Discussion
Excellent approach! Let's thoroughly understand the requirements before writing any code. I'll break this down systematically, and we can discuss each aspect.

📋 First, Let Me Summarize My Understanding of the Requirements
Core Features (Priority Order)
Priority Feature Description
1 Text Chat Send text → OpenAI → Response → Store
2 Agent Management Create/Update/List agents with name + system prompt
3 Session Management Multiple chat sessions per agent
4 Voice Interaction Audio → STT → Chat → TTS → Audio response
5 Knowledge Base (RAG) Upload docs per agent → Retrieve context during chat
6 Prompt Refinement AI-assisted generation of system prompts
Key Technical Constraints
Backend: Python 3.10+, FastAPI, SQLAlchemy (async), SQLite
Frontend: React, Audio recording/playback
APIs: OpenAI Chat, Whisper (STT), TTS
Deployment: Docker, docker-compose
🤔 Questions We Need to Discuss Before Designing
Let me raise some clarifying questions that will shape our architecture:

1. User Authentication
   The document doesn't mention authentication. Should we:

Option A: No auth (single user, simpler)
Option B: Simple auth (username/password)
Option C: Just a user identifier without login
My recommendation: Option A for MVP - keeps it simple, focuses on core functionality.

2. Real-time vs Polling for Chat
   For displaying AI responses:

Option A: Simple request/response (user waits for full response)
Option B: Server-Sent Events (SSE) for streaming responses
Option C: WebSockets for real-time updates
My recommendation: Option A initially, can add SSE for streaming later.

3. Voice Message Storage
   Should we store:

Option A: Only the transcribed text
Option B: Both audio file + transcribed text
Option C: Audio file + text + generated audio response
My recommendation: Option B - store original audio for playback history.

4. Audio Format
   What format for recording? (WebM, WAV, MP3)
   What format for TTS response? (MP3, WAV)
   My recommendation: WebM for recording (browser native), MP3 for TTS response.

5. Error Handling Strategy
   How to handle OpenAI API failures?
   Retry logic? Fallback messages?
   Let's Start the Discussion
   What are your thoughts on these questions?

Once we align on these, we can dive into:

System Architecture (component diagram, data flow)
Database Design (ERD, table schemas)
API Design (endpoints, request/response formats)
Frontend Architecture (component hierarchy, state management)
Module Breakdown (services, utilities, etc.)
Which aspect would you like to discuss first, or should we go through my questions above first?

User Authentication keeps it simple
. Real-time Server-Sent Events (SSE) for streaming responses

-

3. Voice Message Storage Option C: Audio file + text + generated audio response
4. Audio Format your recommendation
   error handling Fallback messages
   this is my answers for your asked questions
   list dive into next points

5:04 PM

Synthesized user preferences and architected comprehensive technical framework
Excellent Choices! Now Let's Dive Deep 🚀
Your decisions give us a clear direction:

✅ No authentication (simple)
✅ SSE for streaming
✅ Store audio + text + TTS response
✅ WebM recording / MP3 TTS
✅ Fallback messages for errors

1. System Architecture
   High-Level Component Diagram
   ┌─────────────────────────────────────────────────────────────────────────────┐
   │ CLIENT │
   │ ┌─────────────────────────────────────────────────────────────────────┐ │
   │ │ React Application │ │
   │ │ ┌──────────────┐ ┌──────────────┐ ┌──────────────────────────┐ │ │
   │ │ │ Agent │ │ Chat │ │ Voice │ │ │
   │ │ │ Management │ │ Interface │ │ Recorder │ │ │
   │ │ │ Module │ │ Module │ │ Module │ │ │
   │ │ └──────────────┘ └──────────────┘ └──────────────────────────┘ │ │
   │ │ │ │ │
   │ │ ┌──────────────────────────────────────────────────────────────┐ │ │
   │ │ │ API Service Layer │ │ │
   │ │ │ (Axios + SSE EventSource + Audio Handling) │ │ │
   │ │ └──────────────────────────────────────────────────────────────┘ │ │
   │ └─────────────────────────────────────────────────────────────────────┘ │
   └─────────────────────────────────────────────────────────────────────────────┘
   │
   │ HTTP/SSE
   ▼
   ┌─────────────────────────────────────────────────────────────────────────────┐
   │ SERVER │
   │ ┌─────────────────────────────────────────────────────────────────────┐ │
   │ │ FastAPI Application │ │
   │ │ │ │
   │ │ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌───────────┐ │ │
   │ │ │ Agents │ │ Sessions │ │ Messages │ │ Voice │ │ │
   │ │ │ Router │ │ Router │ │ Router │ │ Router │ │ │
   │ │ └──────┬──────┘ └──────┬──────┘ └──────┬──────┘ └─────┬─────┘ │ │
   │ │ │ │ │ │ │ │
   │ │ ┌──────▼────────────────▼────────────────▼───────────────▼─────┐ │ │
   │ │ │ Service Layer │ │ │
   │ │ │ ┌─────────────┐ ┌─────────────┐ ┌─────────────────────┐ │ │ │
   │ │ │ │ Agent │ │ Chat │ │ Voice │ │ │ │
   │ │ │ │ Service │ │ Service │ │ Service │ │ │ │
   │ │ │ └─────────────┘ └──────┬──────┘ └──────────┬──────────┘ │ │ │
   │ │ └──────────────────────────┼────────────────────┼──────────────┘ │ │
   │ │ │ │ │ │
   │ │ ┌──────────────────────────▼────────────────────▼──────────────┐ │ │
   │ │ │ OpenAI Integration Layer │ │ │
   │ │ │ ┌─────────────┐ ┌─────────────┐ ┌─────────────────────┐ │ │ │
   │ │ │ │ Chat │ │ Whisper │ │ TTS │ │ │ │
   │ │ │ │ Completion │ │ (STT) │ │ Service │ │ │ │
   │ │ │ └─────────────┘ └─────────────┘ └─────────────────────┘ │ │ │
   │ │ └──────────────────────────────────────────────────────────────┘ │ │
   │ │ │ │
   │ │ ┌──────────────────────────────────────────────────────────────┐ │ │
   │ │ │ Database Layer (SQLAlchemy) │ │ │
   │ │ └──────────────────────────────────────────────────────────────┘ │ │
   │ └─────────────────────────────────────────────────────────────────────┘ │
   └─────────────────────────────────────────────────────────────────────────────┘
   │
   ▼
   ┌─────────────────────────────────┐
   │ SQLite DB │
   │ ┌───────┐ ┌────────┐ ┌──────┐ │
   │ │Agents │ │Sessions│ │ Msgs │ │
   │ └───────┘ └────────┘ └──────┘ │
   └─────────────────────────────────┘
   │
   ┌─────────────────────────────────┐
   │ File Storage │
   │ (Audio Files - Local) │
   └─────────────────────────────────┘
   Data Flow Diagrams
   Flow 1: Text Message (with SSE Streaming)
   ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐
   │ React │ │ FastAPI │ │ OpenAI │ │ Database │
   │ Client │ │ Server │ │ API │ │ SQLite │
   └────┬─────┘ └────┬─────┘ └────┬─────┘ └────┬─────┘
   │ │ │ │
   │ POST /messages │ │ │
   │ {content, type} │ │ │
   │───────────────────>│ │ │
   │ │ │ │
   │ │ Save user message │ │
   │ │───────────────────────────────────────->│
   │ │ │ │
   │ │ Load chat history │ │
   │ │<────────────────────────────────────────│
   │ │ │ │
   │ │ Stream completion │ │
   │ │───────────────────>│ │
   │ │ │ │
   │ SSE: token chunk │<───stream chunk────│ │
   │<───────────────────│ │ │
   │ SSE: token chunk │<───stream chunk────│ │
   │<───────────────────│ │ │
   │ SSE: token chunk │<───stream chunk────│ │
   │<───────────────────│ │ │
   │ │ │ │
   │ │ Save AI message │ │
   │ │───────────────────────────────────────->│
   │ │ │ │
   │ SSE: [DONE] │ │ │
   │<───────────────────│ │ │
   │ │ │ │
   Flow 2: Voice Message (Async Request/Response)
   ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐
   │ React │ │ FastAPI │ │ OpenAI │ │ Storage │
   │ Client │ │ Server │ │ APIs │ │ (Files) │
   └────┬─────┘ └────┬─────┘ └────┬─────┘ └────┬─────┘
   │ │ │ │
   │ POST /voice │ │ │
   │ (audio file) │ │ │
   │───────────────────>│ │ │
   │ │ │ │
   │ │ Save audio file │ │
   │ │───────────────────────────────────────->│
   │ │ │ │
   │ │ Whisper STT │ │
   │ │───────────────────>│ │
   │ │<──transcribed text─│ │
   │ │ │ │
   │ │ Chat Completion │ │
   │ │───────────────────>│ │
   │ │<───AI response─────│ │
   │ │ │ │
   │ │ TTS │ │
   │ │───────────────────>│ │
   │ │<───audio bytes─────│ │
   │ │ │ │
   │ │ Save TTS audio │ │
   │ │───────────────────────────────────────->│
   │ │ │ │
   │ Response JSON │ │ │
   │ {text, audio_url} │ │ │
   │<───────────────────│ │ │
   │ │ │ │
2. Database Design
   Entity Relationship Diagram (ERD)
   ┌─────────────────────────────────────────────────────────────────────────┐
   │ │
   │ ┌─────────────────┐ ┌─────────────────┐ ┌───────────────┐ │
   │ │ AGENTS │ │ SESSIONS │ │ MESSAGES │ │
   │ ├─────────────────┤ ├─────────────────┤ ├───────────────┤ │
   │ │ PK id (UUID) │ │ PK id (UUID) │ │ PK id (UUID) │ │
   │ │ name │ │ FK agent_id │───┐ │ FK session_id │ │
   │ │ system_prompt│ │ title │ │ │ role │ │
   │ │ created_at │ │ created_at │ │ │ content │ │
   │ │ updated_at │ │ updated_at │ │ │ msg_type │ │
   │ └────────┬────────┘ └────────┬────────┘ │ │ audio_url │ │
   │ │ │ │ │ tts_url │ │
   │ │ 1:N │ │ │ created_at │ │
   │ └─────────────────────────┘ │ └───────┬───────┘ │
   │ │ │ │
   │ 1:N │ │ │
   │ └────────────────────────┘ │
   │ │
   └─────────────────────────────────────────────────────────────────────────┘
   Detailed Table Schemas
   sql
   -- AGENTS TABLE
   CREATE TABLE agents (
   id VARCHAR(36) PRIMARY KEY, -- UUID
   name VARCHAR(100) NOT NULL,
   system_prompt TEXT NOT NULL,
   created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
   updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
   );

-- SESSIONS TABLE  
CREATE TABLE sessions (
id VARCHAR(36) PRIMARY KEY, -- UUID
agent_id VARCHAR(36) NOT NULL,
title VARCHAR(200), -- Auto-generated or user-defined
created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (agent_id) REFERENCES agents(id) ON DELETE CASCADE

);

-- MESSAGES TABLE
CREATE TABLE messages (
id VARCHAR(36) PRIMARY KEY, -- UUID
session_id VARCHAR(36) NOT NULL,
role VARCHAR(20) NOT NULL, -- 'user' | 'assistant'
content TEXT NOT NULL, -- The actual message text
message_type VARCHAR(20) DEFAULT 'text', -- 'text' | 'voice'
audio_url VARCHAR(500), -- Path to user's voice recording
tts_audio_url VARCHAR(500), -- Path to AI's TTS response
created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (session_id) REFERENCES sessions(id) ON DELETE CASCADE

);

-- INDEXES for performance
CREATE INDEX idx_sessions_agent_id ON sessions(agent_id);
CREATE INDEX idx_messages_session_id ON messages(session_id);
CREATE INDEX idx_messages_created_at ON messages(created_at);
SQLAlchemy Models (Preview)
python

# models/agent.py

class Agent(Base):
**tablename** = "agents"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid4()))
    name = Column(String(100), nullable=False)
    system_prompt = Column(Text, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    sessions = relationship("Session", back_populates="agent", cascade="all, delete-orphan")

# models/session.py

class Session(Base):
**tablename** = "sessions"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid4()))
    agent_id = Column(String(36), ForeignKey("agents.id", ondelete="CASCADE"), nullable=False)
    title = Column(String(200), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    agent = relationship("Agent", back_populates="sessions")
    messages = relationship("Message", back_populates="session", cascade="all, delete-orphan")

# models/message.py

class MessageType(str, Enum):
TEXT = "text"
VOICE = "voice"

class MessageRole(str, Enum):
USER = "user"
ASSISTANT = "assistant"

class Message(Base):
**tablename** = "messages"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid4()))
    session_id = Column(String(36), ForeignKey("sessions.id", ondelete="CASCADE"), nullable=False)
    role = Column(String(20), nullable=False)  # user | assistant
    content = Column(Text, nullable=False)
    message_type = Column(String(20), default=MessageType.TEXT)
    audio_url = Column(String(500), nullable=True)
    tts_audio_url = Column(String(500), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    session = relationship("Session", back_populates="messages")

```

---

## 3. API Design

### RESTful Endpoints
```

┌────────────────────────────────────────────────────────────────────────────┐
│ API ENDPOINTS │
├────────────────────────────────────────────────────────────────────────────┤
│ │
│ AGENTS │
│ ─────────────────────────────────────────────────────────────────────── │
│ GET /api/agents List all agents │
│ POST /api/agents Create new agent │
│ GET /api/agents/{id} Get agent details │
│ PUT /api/agents/{id} Update agent │
│ PUT /api/agents/{id} Update agent │
│ DELETE /api/agents/{id} Delete agent │
│ POST /api/agents/refine Refine prompt with AI │
│ │
│ AGENT KNOWLEDGE BASE │
│ ─────────────────────────────────────────────────────────────────────── │
│ GET /api/agents/{id}/documents List uploaded documents │
│ POST /api/agents/{id}/documents Upload PDF/TXT file │
│ DELETE /api/documents/{id} Delete document │
│ │
│ SESSIONS │
│ ─────────────────────────────────────────────────────────────────────── │
│ GET /api/agents/{id}/sessions List sessions for agent │
│ POST /api/agents/{id}/sessions Create new session │
│ GET /api/sessions/{id} Get session with messages │
│ DELETE /api/sessions/{id} Delete session │
│ │
│ MESSAGES │
│ ─────────────────────────────────────────────────────────────────────── │
│ GET /api/sessions/{id}/messages Get messages in session │
│ POST /api/sessions/{id}/messages Send text message (SSE stream) │
│ │
│ VOICE │
│ ─────────────────────────────────────────────────────────────────────── │
│ POST /api/sessions/{id}/voice Send voice message │
│ GET /api/audio/{filename} Serve audio file │
│ │
│ HEALTH │
│ ─────────────────────────────────────────────────────────────────────── │
│ GET /api/health Health check │
│ │
└────────────────────────────────────────────────────────────────────────────┘
Request/Response Schemas
python

# ═══════════════════════════════════════════════════════════════════════════

# AGENT SCHEMAS

# ═══════════════════════════════════════════════════════════════════════════

# Request: Create/Update Agent

class AgentCreate(BaseModel):
name: str = Field(..., min_length=1, max_length=100)
system_prompt: str = Field(..., min_length=1)

# Response: Agent

class AgentResponse(BaseModel):
id: str
name: str
system_prompt: str
created_at: datetime
updated_at: datetime
session_count: int = 0 # Computed field

# ═══════════════════════════════════════════════════════════════════════════

# SESSION SCHEMAS

# ═══════════════════════════════════════════════════════════════════════════

# Request: Create Session

class SessionCreate(BaseModel):
title: Optional[str] = None # Auto-generated if not provided

# Response: Session

class SessionResponse(BaseModel):
id: str
agent_id: str
title: str
created_at: datetime
updated_at: datetime
message_count: int = 0 # Computed field

# Response: Session with Messages

class SessionDetailResponse(SessionResponse):
messages: List[MessageResponse]
agent: AgentResponse

# ═══════════════════════════════════════════════════════════════════════════

# MESSAGE SCHEMAS

# ═══════════════════════════════════════════════════════════════════════════

# Request: Send Text Message

class MessageCreate(BaseModel):
content: str = Field(..., min_length=1)

# Response: Message

class MessageResponse(BaseModel):
id: str
session_id: str
role: str # 'user' | 'assistant'
content: str
message_type: str # 'text' | 'voice'
audio_url: Optional[str] = None
tts_audio_url: Optional[str] = None
created_at: datetime

# SSE Event Format (for streaming)

class SSEEvent(BaseModel):
event: str # 'token' | 'done' | 'error'
data: str # Token content or final message

# ═══════════════════════════════════════════════════════════════════════════

# VOICE SCHEMAS

# ═══════════════════════════════════════════════════════════════════════════

# Request: Voice message is multipart/form-data with audio file

# Response: Voice Message

class VoiceMessageResponse(BaseModel):
user_message: MessageResponse # Transcribed user message
assistant_message: MessageResponse # AI response with TTS

# ═══════════════════════════════════════════════════════════════════════════

# ERROR SCHEMAS

# ═══════════════════════════════════════════════════════════════════════════

class ErrorResponse(BaseModel):
error: str
detail: Optional[str] = None
fallback_message: Optional[str] = None # For OpenAI failures

```

### SSE Streaming Format
```

# Text Message Streaming Response

# ─────────────────────────────────

# Token events (partial response)

event: token
data: {"content": "Hello"}

event: token  
data: {"content": ", how"}

event: token
data: {"content": " can I"}

event: token
data: {"content": " help?"}

# Completion event

event: done
data: {"message_id": "uuid-here", "full_content": "Hello, how can I help?"}

# Error event (if OpenAI fails)

event: error
data: {"error": "API Error", "fallback": "I apologize, I'm having trouble responding right now."}

```

---

## 4. Frontend Architecture

### Component Hierarchy
```

┌─────────────────────────────────────────────────────────────────────────────┐
│ App │
│ ┌───────────────────────────────────────────────────────────────────────┐ │
│ │ AppProvider │ │
│ │ (Global State Context) │ │
│ │ ┌─────────────────────────────────────────────────────────────────┐ │ │
│ │ │ Layout │ │ │
│ │ │ ┌─────────────────┐ ┌───────────────────────────────────────┐ │ │ │
│ │ │ │ │ │ │ │ │ │
│ │ │ │ Sidebar │ │ MainContent │ │ │ │
│ │ │ │ │ │ │ │ │ │
│ │ │ │ ┌───────────┐ │ │ ┌─────────────────────────────────┐ │ │ │ │
│ │ │ │ │ Agent │ │ │ │ ChatContainer │ │ │ │ │
│ │ │ │ │ List │ │ │ │ │ │ │ │ │
│ │ │ │ │ │ │ │ │ ┌───────────────────────────┐ │ │ │ │ │
│ │ │ │ │ ┌───────┐ │ │ │ │ │ ChatHeader │ │ │ │ │ │
│ │ │ │ │ │Agent │ │ │ │ │ │ (Agent name, options) │ │ │ │ │ │
│ │ │ │ │ │ Card │ │ │ │ │ └───────────────────────────┘ │ │ │ │ │
│ │ │ │ │ └───────┘ │ │ │ │ │ │ │ │ │
│ │ │ │ │ ┌───────┐ │ │ │ │ ┌───────────────────────────┐ │ │ │ │ │
│ │ │ │ │ │Agent │ │ │ │ │ │ MessageList │ │ │ │ │ │
│ │ │ │ │ │ Card │ │ │ │ │ │ │ │ │ │ │ │
│ │ │ │ │ └───────┘ │ │ │ │ │ ┌─────────────────────┐ │ │ │ │ │ │
│ │ │ │ └───────────┘ │ │ │ │ │ MessageBubble │ │ │ │ │ │ │
│ │ │ │ │ │ │ │ │ (User message) │ │ │ │ │ │ │
│ │ │ │ ┌───────────┐ │ │ │ │ └─────────────────────┘ │ │ │ │ │ │
│ │ │ │ │ Session │ │ │ │ │ ┌─────────────────────┐ │ │ │ │ │ │
│ │ │ │ │ List │ │ │ │ │ │ MessageBubble │ │ │ │ │ │ │
│ │ │ │ │ │ │ │ │ │ │ (AI + AudioPlayer)│ │ │ │ │ │ │
│ │ │ │ │ ┌───────┐ │ │ │ │ │ └─────────────────────┘ │ │ │ │ │ │
│ │ │ │ │ │Session│ │ │ │ │ └───────────────────────────┘ │ │ │ │ │
│ │ │ │ │ │ Card │ │ │ │ │ │ │ │ │ │
│ │ │ │ │ └───────┘ │ │ │ │ ┌───────────────────────────┐ │ │ │ │ │
│ │ │ │ └───────────┘ │ │ │ │ ChatInput │ │ │ │ │ │
│ │ │ │ │ │ │ │ ┌─────────┐ ┌──────────┐ │ │ │ │ │ │
│ │ │ │ ┌───────────┐ │ │ │ │ │TextInput│ │VoiceBtn │ │ │ │ │ │ │
│ │ │ │ │ AddAgent │ │ │ │ │ └─────────┘ └──────────┘ │ │ │ │ │ │
│ │ │ │ │ Button │ │ │ │ └───────────────────────────┘ │ │ │ │ │
│ │ │ │ └───────────┘ │ │ └─────────────────────────────────┘ │ │ │ │
│ │ │ └─────────────────┘ └───────────────────────────────────────┘ │ │ │
│ │ └─────────────────────────────────────────────────────────────────┘ │ │
│ └───────────────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────────────┘

MODALS (Rendered at root level)
┌─────────────────┐ ┌─────────────────┐
│ AgentModal │ │ DeleteConfirm │
│ (Create/Edit) │ │ Modal │
└─────────────────┘ └─────────────────┘

```

### State Management (React Context + useReducer)
```

┌─────────────────────────────────────────────────────────────────────────────┐
│ GLOBAL STATE STRUCTURE │
├─────────────────────────────────────────────────────────────────────────────┤
│ │
│ { │
│ // Agents State │
│ agents: { │
│ items: Agent[], │
│ loading: boolean, │
│ error: string | null, │
│ selectedId: string | null │
│ }, │
│ │
│ // Sessions State │
│ sessions: { │
│ items: Session[], │
│ loading: boolean, │
│ error: string | null, │
│ selectedId: string | null │
│ }, │
│ │
│ // Messages State (for current session) │
│ messages: { │
│ items: Message[], │
│ loading: boolean, │
│ streaming: boolean, // True during SSE │
│ streamingContent: string, // Partial content during stream │
│ error: string | null │
│ }, │
│ │
│ // Voice Recording State │
│ voice: { │
│ isRecording: boolean, │
│ isProcessing: boolean, // True while waiting for response │
│ error: string | null │
│ }, │
│ │
│ // UI State │
│ ui: { │
│ sidebarOpen: boolean, │
│ modalOpen: 'agent' | 'delete' | null, │
│ editingAgent: Agent | null │
│ } │
│ } │
│ │
└─────────────────────────────────────────────────────────────────────────────┘
Custom Hooks
typescript
// ═══════════════════════════════════════════════════════════════════════════
// CUSTOM HOOKS
// ═══════════════════════════════════════════════════════════════════════════

// Agent Management
useAgents()
├── agents: Agent[]
├── loading: boolean
├── error: string | null
├── selectedAgent: Agent | null
├── selectAgent(id: string): void
├── createAgent(data: AgentCreate): Promise<Agent>
├── updateAgent(id: string, data: AgentUpdate): Promise<Agent>
└── deleteAgent(id: string): Promise<void>

// Session Management
useSessions(agentId: string)
├── sessions: Session[]
├── loading: boolean
├── error: string | null
├── selectedSession: Session | null
├── selectSession(id: string): void
├── createSession(): Promise<Session>
└── deleteSession(id: string): Promise<void>

// Messages & Chat
useChat(sessionId: string)
├── messages: Message[]
├── loading: boolean
├── streaming: boolean
├── streamingContent: string
├── error: string | null
├── sendMessage(content: string): Promise<void> // Handles SSE
└── sendVoiceMessage(audioBlob: Blob): Promise<void>

// Voice Recording
useVoiceRecorder()
├── isRecording: boolean
├── isSupported: boolean
├── error: string | null
├── startRecording(): Promise<void>
├── stopRecording(): Promise<Blob> // Returns WebM blob
└── cancelRecording(): void

// Audio Playback
useAudioPlayer()
├── isPlaying: boolean
├── currentUrl: string | null
├── play(url: string): void
├── pause(): void
└── stop(): void

```

---

## 5. Backend Module Breakdown

### Project Structure
```

backend/
├── app/
│ ├── **init**.py
│ ├── main.py # FastAPI app initialization
│ ├── config.py # Settings & environment variables
│ │
│ ├── models/ # SQLAlchemy models
│ │ ├── **init**.py
│ │ ├── base.py # Base model class
│ │ ├── agent.py
│ │ ├── session.py
│ │ └── message.py
│ │
│ ├── schemas/ # Pydantic schemas
│ │ ├── **init**.py
│ │ ├── agent.py
│ │ ├── session.py
│ │ ├── message.py
│ │ └── common.py # Shared schemas (errors, pagination)
│ │
│ ├── routes/ # API route handlers
│ │ ├── **init**.py
│ │ ├── agents.py
│ │ ├── sessions.py
│ │ ├── messages.py
│ │ ├── voice.py
│ │ └── health.py
│ │
│ ├── services/ # Business logic
│ │ ├── **init**.py
│ │ ├── agent_service.py
│ │ ├── session_service.py
│ │ ├── chat_service.py # Handles OpenAI chat + SSE
│ │ └── voice_service.py # Handles STT + TTS
│ │
│ ├── integrations/ # External API clients
│ │ ├── **init**.py
│ │ └── openai_client.py # OpenAI API wrapper
│ │
│ ├── database/ # Database configuration
│ │ ├── **init**.py
│ │ ├── connection.py # Async SQLAlchemy setup
│ │ └── migrations/ # Alembic migrations (if needed)
│ │
│ └── utils/ # Utilities
│ ├── **init**.py
│ ├── audio.py # Audio file handling
│ ├── sse.py # SSE helper functions
│ └── exceptions.py # Custom exceptions
│
├── tests/
│ ├── **init**.py
│ ├── conftest.py # Pytest fixtures
│ ├── test_agents.py
│ ├── test_sessions.py
│ ├── test_messages.py
│ └── test_voice.py
│
├── audio_files/ # Stored audio files (gitignored)
│ ├── uploads/ # User voice recordings
│ └── tts/ # Generated TTS audio
│
├── requirements.txt
├── Dockerfile
└── .env.example
Key Service Implementations (Conceptual)
python

# ═══════════════════════════════════════════════════════════════════════════

# services/chat_service.py - SSE Streaming

# ═══════════════════════════════════════════════════════════════════════════

class ChatService:
def **init**(self, openai_client: OpenAIClient, db: AsyncSession):
self.openai = openai_client
self.db = db

    async def send_message_stream(
        self,
        session_id: str,
        content: str
    ) -> AsyncGenerator[str, None]:
        """
        1. Save user message to DB
        2. Load conversation history
        3. Stream OpenAI response
        4. Yield SSE events
        5. Save complete AI message to DB
        """
        # Save user message
        user_msg = await self._save_message(session_id, "user", content)

        # Get conversation history for context
        history = await self._get_conversation_history(session_id)

        # Get agent's system prompt
        agent = await self._get_agent_for_session(session_id)

        # Stream from OpenAI
        full_response = ""
        try:
            async for chunk in self.openai.chat_stream(
                system_prompt=agent.system_prompt,
                messages=history
            ):
                full_response += chunk
                yield f"event: token\ndata: {json.dumps({'content': chunk})}\n\n"

            # Save AI message
            ai_msg = await self._save_message(session_id, "assistant", full_response)

            yield f"event: done\ndata: {json.dumps({'message_id': ai_msg.id})}\n\n"

        except OpenAIError as e:
            fallback = "I apologize, I'm having trouble responding right now. Please try again."
            await self._save_message(session_id, "assistant", fallback)
            yield f"event: error\ndata: {json.dumps({'fallback': fallback})}\n\n"

# ═══════════════════════════════════════════════════════════════════════════

# services/voice_service.py - Voice Processing

# ═══════════════════════════════════════════════════════════════════════════

class VoiceService:
def **init**(self, openai_client: OpenAIClient, chat_service: ChatService):
self.openai = openai_client
self.chat = chat_service

    async def process_voice_message(
        self,
        session_id: str,
        audio_file: UploadFile
    ) -> VoiceMessageResponse:
        """
        1. Save uploaded audio file
        2. Transcribe with Whisper (STT)
        3. Get chat response (non-streaming for voice)
        4. Generate TTS audio
        5. Save TTS file
        6. Save messages to DB
        7. Return response with audio URLs
        """
        # Save user audio
        audio_path = await self._save_audio_file(audio_file, "uploads")

        # Transcribe
        transcript = await self.openai.speech_to_text(audio_path)

        # Get AI response (non-streaming)
        history = await self.chat._get_conversation_history(session_id)
        agent = await self.chat._get_agent_for_session(session_id)
        ai_response = await self.openai.chat_completion(
            system_prompt=agent.system_prompt,
            messages=history + [{"role": "user", "content": transcript}]
        )

        # Generate TTS
        tts_audio = await self.openai.text_to_speech(ai_response)
        tts_path = await self._save_audio_file(tts_audio, "tts")

        # Save messages
        user_msg = await self._save_voice_message(
            session_id, "user", transcript, audio_url=audio_path
        )
        ai_msg = await self._save_voice_message(
            session_id, "assistant", ai_response, tts_audio_url=tts_path
        )

        return VoiceMessageResponse(
            user_message=user_msg,
            assistant_message=ai_msg
        )

```

---

## 6. Frontend Module Breakdown

### Project Structure
```

frontend/
├── src/
│ ├── index.tsx # Entry point
│ ├── App.tsx # Root component
│ │
│ ├── components/
│ │ ├── layout/
│ │ │ ├── Layout.tsx
│ │ │ ├── Sidebar.tsx
│ │ │ └── MainContent.tsx
│ │ │
│ │ ├── agents/
│ │ │ ├── AgentList.tsx
│ │ │ ├── AgentCard.tsx
│ │ │ ├── AgentModal.tsx # Create/Edit modal
│ │ │ └── AgentForm.tsx
│ │ │
│ │ ├── sessions/
│ │ │ ├── SessionList.tsx
│ │ │ └── SessionCard.tsx
│ │ │
│ │ ├── chat/
│ │ │ ├── ChatContainer.tsx
│ │ │ ├── ChatHeader.tsx
│ │ │ ├── MessageList.tsx
│ │ │ ├── MessageBubble.tsx
│ │ │ ├── ChatInput.tsx
│ │ │ └── StreamingMessage.tsx # Shows partial response
│ │ │
│ │ ├── voice/
│ │ │ ├── VoiceButton.tsx # Push-to-talk button
│ │ │ ├── RecordingIndicator.tsx
│ │ │ └── AudioPlayer.tsx
│ │ │
│ │ └── common/
│ │ ├── Button.tsx
│ │ ├── Input.tsx
│ │ ├── Modal.tsx
│ │ ├── LoadingSpinner.tsx
│ │ ├── ErrorMessage.tsx
│ │ └── ConfirmDialog.tsx
│ │
│ ├── hooks/
│ │ ├── useAgents.ts
│ │ ├── useSessions.ts
│ │ ├── useChat.ts
│ │ ├── useVoiceRecorder.ts
│ │ ├── useAudioPlayer.ts
│ │ └── useSSE.ts # SSE handling hook
│ │
│ ├── context/
│ │ ├── AppContext.tsx
│ │ └── AppReducer.ts
│ │
│ ├── services/
│ │ ├── api.ts # Axios instance
│ │ ├── agentService.ts
│ │ ├── sessionService.ts
│ │ ├── messageService.ts
│ │ └── voiceService.ts
│ │
│ ├── types/
│ │ ├── agent.ts
│ │ ├── session.ts
│ │ ├── message.ts
│ │ └── api.ts
│ │
│ ├── utils/
│ │ ├── audio.ts # Audio blob handling
│ │ ├── formatters.ts # Date formatting, etc.
│ │ └── constants.ts
│ │
│ └── styles/
│ ├── globals.css
│ └── variables.css
│
├── public/
│ └── index.html
│
├── tests/
│ ├── components/
│ └── hooks/
│
├── package.json
├── tsconfig.json
├── Dockerfile
└── .env.example

```

---

## 7. Error Handling Strategy
```

┌─────────────────────────────────────────────────────────────────────────────┐
│ ERROR HANDLING FLOW │
├─────────────────────────────────────────────────────────────────────────────┤
│ │
│ OPENAI API ERRORS │
│ ───────────────── │
│ ┌─────────────┐ ┌─────────────────────────────────────────────────┐ │
│ │ Rate Limit │ ──> │ Return fallback + "Please try again shortly" │ │
│ └─────────────┘ └─────────────────────────────────────────────────┘ │
│ ┌─────────────┐ ┌─────────────────────────────────────────────────┐ │
│ │ API Error │ ──> │ Return fallback + "Having trouble responding" │ │
│ └─────────────┘ └─────────────────────────────────────────────────┘ │
│ ┌─────────────┐ ┌─────────────────────────────────────────────────┐ │
│ │ Timeout │ ──> │ Return fallback + "Request timed out" │ │
│ └─────────────┘ └─────────────────────────────────────────────────┘ │
│ │
│ VOICE PROCESSING ERRORS │
│ ─────────────────────── │
│ ┌─────────────┐ ┌─────────────────────────────────────────────────┐ │
│ │ STT Failed │ ──> │ Return error: "Couldn't understand audio" │ │
│ └─────────────┘ └─────────────────────────────────────────────────┘ │
│ ┌─────────────┐ ┌─────────────────────────────────────────────────┐ │
│ │ TTS Failed │ ──> │ Return text response + "Audio unavailable" │ │
│ └─────────────┘ └─────────────────────────────────────────────────┘ │
│ │
│ DATABASE ERRORS │
│ ─────────────── │
│ ┌─────────────┐ ┌─────────────────────────────────────────────────┐ │
│ │ Not Found │ ──> │ 404 with clear message │ │
│ └─────────────┘ └─────────────────────────────────────────────────┘ │
│ ┌─────────────┐ ┌─────────────────────────────────────────────────┐ │
│ │ Validation │ ──> │ 422 with field-level errors │ │
│ └─────────────┘ └─────────────────────────────────────────────────┘ │
│ │
└─────────────────────────────────────────────────────────────────────────────┘

FALLBACK MESSAGES:
─────────────────
const FALLBACK_MESSAGES = {
default: "I apologize, I'm having trouble responding right now. Please try again.",
rate_limit: "I'm receiving too many requests. Please wait a moment and try again.",
timeout: "The request took too long. Please try again with a shorter message.",
stt_failed: "I couldn't understand the audio. Please try speaking more clearly.",
tts_failed: "I couldn't generate audio for this response, but here's my text reply."
}
Summary & Next Steps
What We've Defined:
Aspect Decision
Auth No authentication (simple single-user)
Streaming SSE for real-time text responses
Audio Storage Full: user audio + transcript + TTS response
Audio Format WebM (recording) / MP3 (TTS)
Error Handling Fallback messages, graceful degradation
Database SQLite with 3 tables (agents, sessions, messages)
State Mgmt React Context + useReducer
Styling TBD (Tailwind recommended)
Questions Before Implementation:
Styling Framework: Should we use Tailwind CSS, or do you prefer something else?
Session Titles: Should session titles be auto-generated from the first message, or user-provided?
Message Pagination: Should we paginate messages in long conversations, or load all at once?
Audio Duration Limits: Any max duration for voice recordings?
Delete Behavior: Soft delete (mark as deleted) or hard delete?
Let me know your thoughts on these remaining questions, and we can start implementation! 🚀

the styling with tailwind and the session titiles can be auto-generated from the first meesage
audio duration limits from the documentation what is the best approach you see you can recommend this
and also the delete behavior

5:11 PM

Weighed audio limits, pagination strategies, and deletion approaches comprehensively
Great Choices! Here Are My Recommendations
Confirmed Decisions
✅ Styling: Tailwind CSS
✅ Session Titles: Auto-generated from first message

1. Audio Duration Limits - My Recommendation
   OpenAI Whisper API Constraints
   Constraint Limit
   Max file size 25 MB
   Supported formats mp3, mp4, mpeg, mpga, m4a, wav, webm
   Max duration (practical) ~240 minutes at low bitrate
   My Recommendation: 2 Minutes (120 seconds)
   Reasoning:

┌─────────────────────────────────────────────────────────────────────────────┐
│ WHY 2 MINUTES IS OPTIMAL │
├─────────────────────────────────────────────────────────────────────────────┤
│ │
│ 1. USER EXPERIENCE │
│ ├── Conversational messages are typically 10-30 seconds │
│ ├── 2 min allows for detailed questions/explanations │
│ └── Beyond 2 min, users should probably type instead │
│ │
│ 2. TECHNICAL CONSIDERATIONS │
│ ├── WebM at ~32kbps voice ≈ 480KB for 2 minutes │
│ ├── Well under 25MB limit (safe margin) │
│ ├── Fast upload even on slower connections │
│ └── Quick transcription processing time │
│ │
│ 3. COST EFFICIENCY │
│ ├── Whisper API: $0.006 per minute │
│ ├── 2 min max = $0.012 max per transcription │
│ └── Prevents accidental expensive long recordings │
│ │
│ 4. RESPONSE TIME │
│ ├── STT processing: ~2-5 seconds for 2 min audio │
│ ├── Chat completion: ~2-10 seconds │
│ ├── TTS generation: ~2-5 seconds │
│ └── Total: ~6-20 seconds (acceptable wait time) │
│ │
└─────────────────────────────────────────────────────────────────────────────┘
Implementation Approach
typescript
// Frontend - Recording limits
const VOICE_CONFIG = {
maxDuration: 120, // 2 minutes in seconds
warningThreshold: 100, // Show warning at 1:40
format: 'webm',
mimeType: 'audio/webm;codecs=opus'
};

// Visual feedback during recording
// 0:00 - 1:40 → Normal recording indicator
// 1:40 - 2:00 → Yellow warning "20 seconds remaining"
// 2:00 → Auto-stop recording
python

# Backend - Validation

MAX*AUDIO_DURATION = 120 # seconds
MAX_AUDIO_SIZE = 5 * 1024 \_ 1024 # 5MB (generous for 2 min WebM)

async def validate_audio_file(file: UploadFile): # Check file size
content = await file.read()
if len(content) > MAX_AUDIO_SIZE:
raise HTTPException(400, "Audio file too large (max 5MB)")

    # Reset file pointer
    await file.seek(0)
    return True

```

---

## 2. Message Pagination - My Recommendation

### Recommendation: **Hybrid Approach - Load Recent + Lazy Load**
```

┌─────────────────────────────────────────────────────────────────────────────┐
│ PAGINATION STRATEGY │
├─────────────────────────────────────────────────────────────────────────────┤
│ │
│ INITIAL LOAD │
│ ───────────── │
│ • Load last 50 messages by default │
│ • Sufficient for most conversations │
│ • Fast initial page load │
│ │
│ LOAD MORE (if needed) │
│ ───────────────────── │
│ • "Load earlier messages" button at top │
│ • Loads 50 more messages per click │
│ • Maintains scroll position │
│ │
│ WHY NOT INFINITE SCROLL? │
│ ──────────────────────── │
│ • Chat UX: users scroll DOWN for new, UP for old │
│ • Infinite scroll at top feels unnatural │
│ • Explicit "load more" gives user control │
│ │
└─────────────────────────────────────────────────────────────────────────────┘
API Design for Pagination
python

# GET /api/sessions/{id}/messages?limit=50&before={message_id}

class MessageQueryParams(BaseModel):
limit: int = Field(default=50, le=100, ge=1)
before: Optional[str] = None # Load messages before this ID (cursor)

class PaginatedMessages(BaseModel):
messages: List[MessageResponse]
has_more: bool
total_count: int

```

### Frontend Implementation
```

┌─────────────────────────────────────────────────────────────────┐
│ CHAT INTERFACE │
├─────────────────────────────────────────────────────────────────┤
│ ┌───────────────────────────────────────────────────────────┐ │
│ │ ▼ Load earlier messages (23 more) │ │ ← Only shows if has_more
│ └───────────────────────────────────────────────────────────┘ │
│ │
│ ┌─────────────────────────────────────────────┐ │
│ │ 📅 January 15, 2026 │ │ ← Date separator
│ └─────────────────────────────────────────────┘ │
│ │
│ ┌─────────────────────────────────────────────┐ │
│ │ User: What's the weather like? │ │
│ └─────────────────────────────────────────────┘ │
│ │
│ ┌─────────────────────────────────────────────┐ │
│ │ AI: I don't have access to real-time... │ │
│ └─────────────────────────────────────────────┘ │
│ │
│ ... more messages ... │
│ │
│ ┌─────────────────────────────────────────────┐ │
│ │ User: Thanks! │ ← Most recent │
│ └─────────────────────────────────────────────┘ │
│ │
├─────────────────────────────────────────────────────────────────┤
│ [Type a message... ] [🎤] [➤] │
└─────────────────────────────────────────────────────────────────┘

```

---

## 3. Delete Behavior - My Recommendation

### Recommendation: **Hard Delete with Cascade + Confirmation**

**Reasoning:**
```

┌─────────────────────────────────────────────────────────────────────────────┐
│ SOFT DELETE vs HARD DELETE │
├──────────────────────────────────┬──────────────────────────────────────────┤
│ SOFT DELETE │ HARD DELETE │
├──────────────────────────────────┼──────────────────────────────────────────┤
│ ✓ Data recovery possible │ ✓ Simpler implementation │
│ ✓ Audit trail │ ✓ Cleaner database │
│ ✓ Better for production │ ✓ No "deleted_at" filters everywhere │
│ │ ✓ True data removal (privacy) │
│ ✗ Complex queries │ ✓ Cascade deletes work naturally │
│ ✗ Database bloat over time │ │
│ ✗ Need cleanup jobs │ ✗ No recovery │
│ ✗ Overkill for MVP/assessment │ ✗ Accidental deletion risk │
└──────────────────────────────────┴──────────────────────────────────────────┘

FOR THIS PROJECT: Hard Delete is appropriate because:

1. It's an assessment/MVP, not production
2. No user accounts = no compliance concerns
3. Simpler code = faster development
4. Confirmation dialogs mitigate accidental deletion

```

### Delete Cascade Rules
```

┌─────────────────────────────────────────────────────────────────────────────┐
│ CASCADE DELETE RULES │
├─────────────────────────────────────────────────────────────────────────────┤
│ │
│ DELETE AGENT │
│ ──────────── │
│ Agent deleted │
│ └── All sessions deleted (CASCADE) │
│ └── All messages deleted (CASCADE) │
│ └── All audio files deleted (application logic) │
│ │
│ DELETE SESSION │
│ ────────────── │
│ Session deleted │
│ └── All messages deleted (CASCADE) │
│ └── All audio files deleted (application logic) │
│ │
│ DELETE MESSAGE │
│ ────────────── │
│ ❌ NOT ALLOWED - Messages are part of conversation history │
│ (Deleting individual messages breaks context) │
│ │
└─────────────────────────────────────────────────────────────────────────────┘
Implementation
python

# Database - Cascade setup

class Session(Base):
**tablename** = "sessions"
agent_id = Column(String(36), ForeignKey("agents.id", ondelete="CASCADE")) # When agent is deleted, sessions are automatically deleted

class Message(Base):
**tablename** = "messages"
session_id = Column(String(36), ForeignKey("sessions.id", ondelete="CASCADE")) # When session is deleted, messages are automatically deleted

# Service - Handle audio file cleanup

class AgentService:
async def delete_agent(self, agent_id: str) -> bool: # 1. Get all sessions for this agent
sessions = await self.get_sessions_for_agent(agent_id)

        # 2. Delete audio files for each session
        for session in sessions:
            await self.audio_service.delete_session_audio_files(session.id)

        # 3. Delete agent (cascades to sessions → messages)
        await self.db.delete(agent)
        await self.db.commit()

        return True

```

### Frontend - Confirmation Dialogs
```

┌─────────────────────────────────────────────────────────────────┐
│ ⚠️ Delete Agent │
├─────────────────────────────────────────────────────────────────┤
│ │
│ Are you sure you want to delete "Customer Support Bot"? │
│ │
│ This will permanently delete: │
│ • The agent and its configuration │
│ • 5 chat sessions │
│ • 127 messages │
│ • All voice recordings │
│ │
│ This action cannot be undone. │
│ │
│ ┌─────────────┐ ┌─────────────────────┐ │
│ │ Cancel │ │ Delete Agent 🗑️ │ │
│ └─────────────┘ └─────────────────────┘ │
│ (red button) │
└─────────────────────────────────────────────────────────────────┘

```

---

## Updated Final Decisions Summary

| Aspect | Decision |
|--------|----------|
| **Auth** | No authentication |
| **Streaming** | SSE for text responses |
| **Audio Storage** | User audio + transcript + TTS response |
| **Audio Format** | WebM (recording) / MP3 (TTS) |
| **Audio Duration** | **2 minutes max** with visual countdown |
| **Error Handling** | Fallback messages |
| **Database** | SQLite, 3 tables |
| **Styling** | **Tailwind CSS** |
| **Session Titles** | **Auto-generated from first message** |
| **Pagination** | **50 messages initial, load more button** |
| **Delete Behavior** | **Hard delete with cascade + confirmation** |

---

## Ready to Start Implementation?

We now have a complete design. Here's my suggested implementation order:
```

┌─────────────────────────────────────────────────────────────────────────────┐
│ IMPLEMENTATION PHASES │
├─────────────────────────────────────────────────────────────────────────────┤
│ │
│ PHASE 1: Backend Foundation (Day 1) │
│ ─────────────────────────────────── │
│ □ Project setup (FastAPI, SQLAlchemy, folder structure) │
│ □ Database models + connection │
│ □ Agent CRUD endpoints │
│ □ Session CRUD endpoints │
│ □ Basic tests │
│ │
│ PHASE 2: Chat Functionality (Day 2) │
│ ─────────────────────────────────── │
│ □ OpenAI integration (chat completion) │
│ □ Message endpoints with SSE streaming │
│ □ Conversation history handling │
│ □ Error handling + fallbacks │
│ │
│ PHASE 3: Voice Functionality (Day 3) │
│ ─────────────────────────────────── │
│ □ Whisper STT integration │
│ □ TTS integration │
│ □ Audio file storage │
│ □ Voice message endpoint │
│ │
│ PHASE 4: Frontend Foundation (Day 4) │
│ ─────────────────────────────────── │
│ □ React + Tailwind setup │
│ □ Layout components (Sidebar, MainContent) │
│ □ Agent management UI │
│ □ Session list UI │
│ │
│ PHASE 5: Chat UI (Day 5) │
│ ───────────────────── │
│ □ Chat interface components │
│ □ SSE integration for streaming │
│ □ Message display + auto-scroll │
│ │
│ PHASE 6: Voice UI + Polish (Day 6) │
│ ────────────────────────────────── │
│ □ Voice recording UI │
│ □ Audio playback │
│ □ Loading states, error handling │
│ □ Responsive design │
│ │
│ PHASE 7: Testing + Documentation (Day 7) │
│ ──────────────────────────────────────── │
│ □ Backend tests │
│ □ Frontend tests │
│ □ Docker setup │
│ □ README + Postman collection │
│ □ Demo video │
│ │
└─────────────────────────────────────────────────────────────────────────────┘
Should we start with Phase 1 - Backend Foundation? I can begin scaffolding the project structure and implementing the first components.

continue

10:34 PM

Orchestrated backend foundation setup and directory verification
Phase 1: Backend Foundation - Let's Begin! 🚀
Let me start by setting up the project structure and implementing the backend foundation.

Evaluating alternative directories for project placement
F

List allowed directories

Response
I can see the allowed directories. Let me use one of these directories to create the AI Agent Platform project. I'll use C:\Users\mahmu\PycharmProjects\SDRA-Interviewer or create a new project folder. Let me first check what's in the SDRA-Interviewer directory to see if it's empty or has existing content.

Actually, looking at the directory names, it seems like these are existing projects. Let me check one of them to understand the structure and then decide where to create our new project.

Let me check the SDRA-Interviewer directory first.

F

List directory

Response
This directory already has an existing project. Let me check if I can create a new project in a different location or if I should use one of the other directories. Let me check the other directories to see if any is suitable for our new AI Agent Platform project.

Actually, looking at the document the user uploaded, it seems like this is an assessment task. I should probably create a new directory for this project. Let me ask the user where they'd like me to create the project, or I can suggest creating it in one of the allowed directories.

Wait, I should check if I can create a subdirectory in one of these directories. Let me check what's available and then proceed to create the project structure.

Let me create the project in the SDRA-Interviewer parent directory or ask user. Actually, let me just proceed with creating a new project structure. I'll create it as a subfolder or in Claude's computer filesystem.

Actually, I see the user has uploaded a document about the fullstack assessment. Let me create the project structure in Claude's computer filesystem first, and then we can move it or the user can copy it.

Let me start by creating the backend foundation in Claude's computer.

Show more
Done
I can see you have some existing projects. Let me create the AI Agent Platform project structure.

Claude's response was interrupted
write there your detailed guidence

10:57 PM

Thinking about clarifying an incomplete or vague request for guidance
Creating Detailed Project Guidance Document
Let me create a comprehensive guidance document that covers everything we've discussed.

Orchestrated comprehensive technical documentation across multiple architectural domains
F

Create directory

Response
Now let me create a comprehensive guidance document that includes everything we discussed - system design, database design, API design, frontend architecture, and implementation details.

F

Write file

Response
Claude's response was interrupted
write there in the chat not in directory

10:58 PM

Pivoted to deliver comprehensive guidance directly in conversation
AI Agent Platform - Complete Project Guidance
I'll provide the complete detailed guidance here in the chat. This is a comprehensive document covering everything.

Table of Contents
Project Overview
Architecture Decisions
System Architecture
Database Design
API Design
Frontend Architecture
Backend Implementation Guide
Frontend Implementation Guide
OpenAI Integration Guide
Error Handling Strategy
Testing Strategy
Deployment Guide
Implementation Phases

1. Project Overview
   1.1 What We're Building
   A fullstack AI Agent Platform that enables users to:

Create and manage AI agents with custom personalities (system prompts)
Have text conversations with AI agents
Use voice to communicate with AI agents (speech-to-text → AI → text-to-speech)
Manage multiple chat sessions per agent
1.2 Core Features (Priority Order)
Priority Feature Description
1 Text Chat Send text → OpenAI → Response → Store
2 Agent Management Create/Update/List agents with name + system prompt
3 Session Management Multiple chat sessions per agent
4 Voice Interaction Audio → STT → Chat → TTS → Audio response
1.3 Tech Stack
Backend:

Python 3.10+
FastAPI (async)
SQLAlchemy (async ORM)
SQLite database
OpenAI API (GPT-4, Whisper, TTS)
Frontend:

React 18+ with TypeScript
Tailwind CSS
React Context + useReducer (state management)
Web Audio API (recording)
DevOps:

Docker & docker-compose
pytest (backend testing)
Jest + React Testing Library (frontend testing) 2. Architecture Decisions
2.1 Decisions Made
Aspect Decision Rationale
Authentication No auth (single user) Simplifies MVP, focuses on core functionality
Streaming SSE (Server-Sent Events) Real-time token streaming, simpler than WebSockets
Audio Storage Store all (user audio + transcript + TTS) Full history, playback capability
Audio Format WebM (record) / MP3 (TTS) Browser native recording, efficient playback
Audio Duration 2 minutes max Balance of UX, cost, and processing time
Error Handling Fallback messages Graceful degradation, always respond to user
Styling Tailwind CSS Rapid development, consistent design
Session Titles Auto-generated from first message Better UX, less user input required
Pagination 50 messages + load more Performance, handles long conversations
Delete Behavior Hard delete with cascade Simpler for MVP, confirmation prevents accidents
2.2 Why These Decisions?
SSE over WebSockets:

SSE Advantages:
├── Built on HTTP (simpler)
├── Auto-reconnection
├── One-way (server → client) is all we need
├── Native EventSource API in browsers
└── Easier to implement and debug

WebSockets would be overkill:
├── Bidirectional not needed
├── More complex connection management
└── Harder to scale
Audio Duration (2 minutes):

Calculation:
├── WebM at ~32kbps voice ≈ 480KB for 2 min
├── Well under 25MB Whisper limit
├── Whisper cost: $0.006/min → $0.012 max
├── Processing time: ~10-20 seconds total
└── Long enough for detailed questions 3. System Architecture
3.1 High-Level Architecture Diagram
┌─────────────────────────────────────────────────────────────────────────────┐
│ CLIENT │
│ ┌─────────────────────────────────────────────────────────────────────┐ │
│ │ React Application │ │
│ │ ┌──────────────┐ ┌──────────────┐ ┌──────────────────────────┐ │ │
│ │ │ Agent │ │ Chat │ │ Voice │ │ │
│ │ │ Management │ │ Interface │ │ Recorder │ │ │
│ │ │ Module │ │ Module │ │ Module │ │ │
│ │ └──────────────┘ └──────────────┘ └──────────────────────────┘ │ │
│ │ │ │ │
│ │ ┌──────────────────────────────────────────────────────────────┐ │ │
│ │ │ API Service Layer │ │ │
│ │ │ (Axios + SSE EventSource + Audio Handling) │ │ │
│ │ └──────────────────────────────────────────────────────────────┘ │ │
│ └─────────────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────────────┘
│
│ HTTP / SSE
▼
┌─────────────────────────────────────────────────────────────────────────────┐
│ SERVER │
│ ┌─────────────────────────────────────────────────────────────────────┐ │
│ │ FastAPI Application │ │
│ │ │ │
│ │ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌───────────┐ │ │
│ │ │ Agents │ │ Sessions │ │ Messages │ │ Voice │ │ │
│ │ │ Router │ │ Router │ │ Router │ │ Router │ │ │
│ │ └──────┬──────┘ └──────┬──────┘ └──────┬──────┘ └─────┬─────┘ │ │
│ │ │ │ │ │ │ │
│ │ ┌──────▼────────────────▼────────────────▼───────────────▼─────┐ │ │
│ │ │ Service Layer │ │ │
│ │ │ ┌─────────────┐ ┌─────────────┐ ┌─────────────────────┐ │ │ │
│ │ │ │ Agent │ │ Chat │ │ Voice │ │ │ │
│ │ │ │ Service │ │ Service │ │ Service │ │ │ │
│ │ │ └─────────────┘ └──────┬──────┘ └──────────┬──────────┘ │ │ │
│ │ └──────────────────────────┼────────────────────┼──────────────┘ │ │
│ │ │ │ │ │
│ │ ┌──────────────────────────▼────────────────────▼──────────────┐ │ │
│ │ │ OpenAI Integration Layer │ │ │
│ │ │ ┌─────────────┐ ┌─────────────┐ ┌─────────────────────┐ │ │ │
│ │ │ │ Chat │ │ Whisper │ │ TTS │ │ │ │
│ │ │ │ Completion │ │ (STT) │ │ Service │ │ │ │
│ │ │ └─────────────┘ └─────────────┘ └─────────────────────┘ │ │ │
│ │ └──────────────────────────────────────────────────────────────┘ │ │
│ │ │ │
│ │ ┌──────────────────────────────────────────────────────────────┐ │ │
│ │ │ Database Layer (SQLAlchemy Async) │ │ │
│ │ └──────────────────────────────────────────────────────────────┘ │ │
│ └─────────────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────────────┘
│
┌─────────────────┴─────────────────┐
▼ ▼
┌─────────────────────────────┐ ┌─────────────────────────────┐
│ SQLite DB │ │ File Storage │
│ ┌───────┐ ┌──────┐ ┌────┐ │ │ (Audio Files) │
│ │Agents │ │ Sess │ │Msg │ │ │ ┌─────────┐ ┌─────────┐ │
│ └───────┘ └──────┘ └────┘ │ │ │ uploads │ │ tts │ │
└─────────────────────────────┘ │ └─────────┘ └─────────┘ │
└─────────────────────────────┘
3.2 Data Flow Diagrams
3.2.1 Text Message Flow (with SSE Streaming)
┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐
│ React │ │ FastAPI │ │ OpenAI │ │ Database │
│ Client │ │ Server │ │ API │ │ SQLite │
└────┬─────┘ └────┬─────┘ └────┬─────┘ └────┬─────┘
│ │ │ │
│ 1. POST /messages │ │ │
│ {content} │ │ │
│───────────────────>│ │ │
│ │ │ │
│ │ 2. Save user msg │ │
│ │───────────────────────────────────────->│
│ │ │ │
│ │ 3. Load history │ │
│ │<────────────────────────────────────────│
│ │ │ │
│ │ 4. Stream request │ │
│ │───────────────────>│ │
│ │ │ │
│ 5. SSE: token │<───stream chunk────│ │
│<───────────────────│ │ │
│ 6. SSE: token │<───stream chunk────│ │
│<───────────────────│ │ │
│ 7. SSE: token │<───stream chunk────│ │
│<───────────────────│ │ │
│ ... │ ... │ │
│ │ │ │
│ │ 8. Save AI msg │ │
│ │───────────────────────────────────────->│
│ │ │ │
│ 9. SSE: [DONE] │ │ │
│<───────────────────│ │ │
│ │ │ │
▼ ▼ ▼ ▼
Step by Step:

User types message, frontend sends POST request
Backend saves user message to database immediately
Backend loads conversation history for context
Backend calls OpenAI with streaming enabled 5-7. As tokens arrive, they're sent to client via SSE
When complete, full AI response is saved to database
Final SSE event signals completion
3.2.2 Voice Message Flow
┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐
│ React │ │ FastAPI │ │ OpenAI │ │ Storage │
│ Client │ │ Server │ │ APIs │ │ (Files) │
└────┬─────┘ └────┬─────┘ └────┬─────┘ └────┬─────┘
│ │ │ │
│ 1. User records │ │ │
│ audio (WebM) │ │ │
│ │ │ │
│ 2. POST /voice │ │ │
│ (multipart) │ │ │
│───────────────────>│ │ │
│ │ │ │
│ │ 3. Save audio │ │
│ │───────────────────────────────────────->│
│ │ │ │
│ │ 4. Whisper STT │ │
│ │───────────────────>│ │
│ │<──"Hello, how..."──│ │
│ │ │ │
│ │ 5. Chat API │ │
│ │───────────────────>│ │
│ │<──"I can help..."──│ │
│ │ │ │
│ │ 6. TTS API │ │
│ │───────────────────>│ │
│ │<───audio bytes─────│ │
│ │ │ │
│ │ 7. Save TTS audio │ │
│ │───────────────────────────────────────->│
│ │ │ │
│ │ 8. Save messages │ │
│ │───────────────────────────────────────->│
│ │ │ │
│ 9. Response JSON │ │ │
│ {transcript, │ │ │
│ response, │ │ │
│ audio_url} │ │ │
│<───────────────────│ │ │
│ │ │ │
│ 10. Play audio │ │ │
│ │ │ │
▼ ▼ ▼ ▼
Step by Step:

User holds push-to-talk, records audio
Audio blob sent as multipart form data
Server saves original audio file
Whisper API transcribes audio to text
Chat API generates response
TTS API converts response to speech
TTS audio file saved
Both messages saved to database
Response includes text and audio URL
Frontend plays the audio 4. Database Design
4.1 Entity Relationship Diagram
┌─────────────────────────────────────────────────────────────────────────────┐
│ ENTITY RELATIONSHIP DIAGRAM │
├─────────────────────────────────────────────────────────────────────────────┤
│ │
│ ┌─────────────────┐ ┌─────────────────┐ ┌───────────────┐ │
│ │ AGENTS │ │ SESSIONS │ │ MESSAGES │ │
│ ├─────────────────┤ ├─────────────────┤ ├───────────────┤ │
│ │ PK id (UUID) │───┐ │ PK id (UUID) │───┐ │ PK id (UUID) │ │
│ │ name │ │ │ FK agent_id │ │ │ FK session_id │ │
│ │ system_prompt│ │ │ title │ │ │ role │ │
│ │ created_at │ │ │ created_at │ │ │ content │ │
│ │ updated_at │ │ │ updated_at │ │ │ msg_type │ │
│ └─────────────────┘ │ └─────────────────┘ │ │ audio_url │ │
│ │ │ │ tts_url │ │
│ │ 1:N │ │ created_at │ │
│ └───────────────────────────┘ └───────────────┘ │
│ │ │
│ 1:N │ │
│ ────────────┘ │
│ │
│ RELATIONSHIPS: │
│ • One Agent has many Sessions (1:N) │
│ • One Session has many Messages (1:N) │
│ • Cascade delete: Agent → Sessions → Messages │
│ │
└─────────────────────────────────────────────────────────────────────────────┘
4.2 Table Schemas
4.2.1 Agents Table
sql
CREATE TABLE agents (
id VARCHAR(36) PRIMARY KEY, -- UUID v4
name VARCHAR(100) NOT NULL, -- Agent display name
system_prompt TEXT NOT NULL, -- AI personality/instructions
created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Example data:
-- id: "550e8400-e29b-41d4-a716-446655440000"
-- name: "Customer Support Bot"
-- system_prompt: "You are a helpful customer support agent. Be polite and concise."
4.2.2 Sessions Table
sql
CREATE TABLE sessions (
id VARCHAR(36) PRIMARY KEY, -- UUID v4
agent_id VARCHAR(36) NOT NULL, -- FK to agents
title VARCHAR(200), -- Auto-generated from first message
created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (agent_id) REFERENCES agents(id) ON DELETE CASCADE

);

-- Index for faster lookups
CREATE INDEX idx_sessions_agent_id ON sessions(agent_id);

-- Example data:
-- id: "660e8400-e29b-41d4-a716-446655440001"
-- agent_id: "550e8400-e29b-41d4-a716-446655440000"
-- title: "Help with order #12345" (auto-generated from first message)
4.2.3 Messages Table
sql
CREATE TABLE messages (
id VARCHAR(36) PRIMARY KEY, -- UUID v4
session_id VARCHAR(36) NOT NULL, -- FK to sessions
role VARCHAR(20) NOT NULL, -- 'user' | 'assistant'
content TEXT NOT NULL, -- Message text
message_type VARCHAR(20) DEFAULT 'text', -- 'text' | 'voice'
audio_url VARCHAR(500), -- User's voice recording path
tts_audio_url VARCHAR(500), -- AI's TTS response path
created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (session_id) REFERENCES sessions(id) ON DELETE CASCADE

);

-- Indexes for performance
CREATE INDEX idx_messages_session_id ON messages(session_id);
CREATE INDEX idx_messages_created_at ON messages(created_at);

-- Example data (text message):
-- id: "770e8400-e29b-41d4-a716-446655440002"
-- session_id: "660e8400-e29b-41d4-a716-446655440001"
-- role: "user"
-- content: "I need help with my order"
-- message_type: "text"
-- audio_url: NULL
-- tts_audio_url: NULL

-- Example data (voice message):
-- id: "880e8400-e29b-41d4-a716-446655440003"
-- session_id: "660e8400-e29b-41d4-a716-446655440001"
-- role: "user"
-- content: "What's the status of my delivery?" (transcribed)
-- message_type: "voice"
-- audio_url: "/audio/uploads/880e8400.webm"
-- tts_audio_url: NULL

-- Example data (AI voice response):
-- id: "990e8400-e29b-41d4-a716-446655440004"
-- session_id: "660e8400-e29b-41d4-a716-446655440001"
-- role: "assistant"
-- content: "Your order is out for delivery..."
-- message_type: "voice"
-- audio_url: NULL
-- tts_audio_url: "/audio/tts/990e8400.mp3"
4.3 SQLAlchemy Models (Python)
python

# ═══════════════════════════════════════════════════════════════════════════

# models/base.py

# ═══════════════════════════════════════════════════════════════════════════

from sqlalchemy.ext.asyncio import AsyncAttrs
from sqlalchemy.orm import DeclarativeBase

class Base(AsyncAttrs, DeclarativeBase):
pass

# ═══════════════════════════════════════════════════════════════════════════

# models/agent.py

# ═══════════════════════════════════════════════════════════════════════════

from uuid import uuid4
from datetime import datetime
from sqlalchemy import Column, String, Text, DateTime
from sqlalchemy.orm import relationship
from .base import Base

class Agent(Base):
**tablename** = "agents"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid4()))
    name = Column(String(100), nullable=False)
    system_prompt = Column(Text, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    sessions = relationship(
        "Session",
        back_populates="agent",
        cascade="all, delete-orphan",
        lazy="selectin"
    )

    def __repr__(self):
        return f"<Agent(id={self.id}, name={self.name})>"

# ═══════════════════════════════════════════════════════════════════════════

# models/session.py

# ═══════════════════════════════════════════════════════════════════════════

from uuid import uuid4
from datetime import datetime
from sqlalchemy import Column, String, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from .base import Base

class Session(Base):
**tablename** = "sessions"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid4()))
    agent_id = Column(
        String(36),
        ForeignKey("agents.id", ondelete="CASCADE"),
        nullable=False,
        index=True
    )
    title = Column(String(200), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    agent = relationship("Agent", back_populates="sessions")
    messages = relationship(
        "Message",
        back_populates="session",
        cascade="all, delete-orphan",
        lazy="selectin",
        order_by="Message.created_at"
    )

    def __repr__(self):
        return f"<Session(id={self.id}, title={self.title})>"

# ═══════════════════════════════════════════════════════════════════════════

# models/message.py

# ═══════════════════════════════════════════════════════════════════════════

from uuid import uuid4
from datetime import datetime
from enum import Enum
from sqlalchemy import Column, String, Text, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from .base import Base

class MessageType(str, Enum):
TEXT = "text"
VOICE = "voice"

class MessageRole(str, Enum):
USER = "user"
ASSISTANT = "assistant"

class Message(Base):
**tablename** = "messages"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid4()))
    session_id = Column(
        String(36),
        ForeignKey("sessions.id", ondelete="CASCADE"),
        nullable=False,
        index=True
    )
    role = Column(String(20), nullable=False)  # 'user' | 'assistant'
    content = Column(Text, nullable=False)
    message_type = Column(String(20), default=MessageType.TEXT)
    audio_url = Column(String(500), nullable=True)      # User's recording
    tts_audio_url = Column(String(500), nullable=True)  # AI's TTS response
    created_at = Column(DateTime, default=datetime.utcnow, index=True)

    # Relationships
    session = relationship("Session", back_populates="messages")

    def __repr__(self):
        return f"<Message(id={self.id}, role={self.role})>"

# ═══════════════════════════════════════════════════════════════════════════

# models/**init**.py

# ═══════════════════════════════════════════════════════════════════════════

from .base import Base
from .agent import Agent
from .session import Session
from .message import Message, MessageType, MessageRole

**all** = ["Base", "Agent", "Session", "Message", "MessageType", "MessageRole"]
4.4 Database Connection Setup
python

# ═══════════════════════════════════════════════════════════════════════════

# database/connection.py

# ═══════════════════════════════════════════════════════════════════════════

from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from app.models import Base
from app.config import settings

# Create async engine

engine = create_async_engine(
settings.DATABASE_URL,
echo=settings.DEBUG, # Log SQL queries in debug mode
future=True
)

# Create session factory

async*session_maker = async_sessionmaker(
engine,
class*=AsyncSession,
expire_on_commit=False,
autoflush=False,
autocommit=False
)

async def init_db():
"""Create all tables"""
async with engine.begin() as conn:
await conn.run_sync(Base.metadata.create_all)

async def get_db() -> AsyncSession:
"""Dependency for getting database session"""
async with async_session_maker() as session:
try:
yield session
await session.commit()
except Exception:
await session.rollback()
raise
finally:
await session.close()

```

---

## 5. API Design

### 5.1 API Endpoints Overview
```

┌────────────────────────────────────────────────────────────────────────────┐
│ API ENDPOINTS │
├────────────────────────────────────────────────────────────────────────────┤
│ │
│ BASE URL: http://localhost:8000/api │
│ │
│ ═══════════════════════════════════════════════════════════════════════ │
│ AGENTS │
│ ═══════════════════════════════════════════════════════════════════════ │
│ GET /agents → List all agents │
│ POST /agents → Create new agent │
│ GET /agents/{id} → Get agent by ID │
│ PUT /agents/{id} → Update agent │
│ DELETE /agents/{id} → Delete agent (cascades) │
│ │
│ ═══════════════════════════════════════════════════════════════════════ │
│ SESSIONS │
│ ═══════════════════════════════════════════════════════════════════════ │
│ GET /agents/{id}/sessions → List sessions for agent │
│ POST /agents/{id}/sessions → Create new session for agent │
│ GET /sessions/{id} → Get session with messages │
│ DELETE /sessions/{id} → Delete session (cascades) │
│ │
│ ═══════════════════════════════════════════════════════════════════════ │
│ MESSAGES │
│ ═══════════════════════════════════════════════════════════════════════ │
│ GET /sessions/{id}/messages → Get messages (paginated) │
│ POST /sessions/{id}/messages → Send text message (SSE stream) │
│ │
│ ═══════════════════════════════════════════════════════════════════════ │
│ VOICE │
│ ═══════════════════════════════════════════════════════════════════════ │
│ POST /sessions/{id}/voice → Send voice message │
│ GET /audio/{filepath} → Serve audio file │
│ │
│ ═══════════════════════════════════════════════════════════════════════ │
│ HEALTH │
│ ═══════════════════════════════════════════════════════════════════════ │
│ GET /health → Health check │
│ │
└────────────────────────────────────────────────────────────────────────────┘
5.2 Pydantic Schemas
python

# ═══════════════════════════════════════════════════════════════════════════

# schemas/agent.py

# ═══════════════════════════════════════════════════════════════════════════

from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional

class AgentCreate(BaseModel):
"""Request schema for creating an agent"""
name: str = Field(..., min_length=1, max_length=100, example="Customer Support Bot")
system_prompt: str = Field(
...,
min_length=1,
example="You are a helpful customer support agent. Be polite and concise."
)

class AgentUpdate(BaseModel):
"""Request schema for updating an agent"""
name: Optional[str] = Field(None, min_length=1, max_length=100)
system_prompt: Optional[str] = Field(None, min_length=1)

class AgentResponse(BaseModel):
"""Response schema for an agent"""
id: str
name: str
system_prompt: str
created_at: datetime
updated_at: datetime
session_count: int = 0 # Computed field

    class Config:
        from_attributes = True

class AgentListResponse(BaseModel):
"""Response schema for list of agents"""
agents: list[AgentResponse]
total: int

# ═══════════════════════════════════════════════════════════════════════════

# schemas/session.py

# ═══════════════════════════════════════════════════════════════════════════

from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional, List

class SessionCreate(BaseModel):
"""Request schema for creating a session"""
title: Optional[str] = Field(None, max_length=200) # If title is None, it will be auto-generated from first message

class SessionResponse(BaseModel):
"""Response schema for a session"""
id: str
agent_id: str
title: Optional[str]
created_at: datetime
updated_at: datetime
message_count: int = 0

    class Config:
        from_attributes = True

class SessionDetailResponse(SessionResponse):
"""Response schema for session with messages"""
messages: List["MessageResponse"]
agent: "AgentResponse"

class SessionListResponse(BaseModel):
"""Response schema for list of sessions"""
sessions: list[SessionResponse]
total: int

# ═══════════════════════════════════════════════════════════════════════════

# schemas/message.py

# ═══════════════════════════════════════════════════════════════════════════

from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional, List
from enum import Enum

class MessageTypeEnum(str, Enum):
TEXT = "text"
VOICE = "voice"

class MessageRoleEnum(str, Enum):
USER = "user"
ASSISTANT = "assistant"

class MessageCreate(BaseModel):
"""Request schema for sending a text message"""
content: str = Field(..., min_length=1, max_length=10000)

class MessageResponse(BaseModel):
"""Response schema for a message"""
id: str
session_id: str
role: MessageRoleEnum
content: str
message_type: MessageTypeEnum
audio_url: Optional[str] = None
tts_audio_url: Optional[str] = None
created_at: datetime

    class Config:
        from_attributes = True

class MessageListResponse(BaseModel):
"""Response schema for paginated messages"""
messages: List[MessageResponse]
has_more: bool
total_count: int

class MessageQueryParams(BaseModel):
"""Query parameters for message pagination"""
limit: int = Field(default=50, ge=1, le=100)
before: Optional[str] = None # Cursor-based pagination

# ═══════════════════════════════════════════════════════════════════════════

# schemas/voice.py

# ═══════════════════════════════════════════════════════════════════════════

from pydantic import BaseModel
from .message import MessageResponse

class VoiceMessageResponse(BaseModel):
"""Response schema for voice message"""
user_message: MessageResponse
assistant_message: MessageResponse

# ═══════════════════════════════════════════════════════════════════════════

# schemas/common.py

# ═══════════════════════════════════════════════════════════════════════════

from pydantic import BaseModel
from typing import Optional

class ErrorResponse(BaseModel):
"""Standard error response"""
error: str
detail: Optional[str] = None
fallback_message: Optional[str] = None

class HealthResponse(BaseModel):
"""Health check response"""
status: str
version: str
database: str
openai: str

# ═══════════════════════════════════════════════════════════════════════════

# schemas/sse.py

# ═══════════════════════════════════════════════════════════════════════════

from pydantic import BaseModel
from typing import Optional

class SSETokenEvent(BaseModel):
"""SSE event for streaming tokens"""
content: str

class SSEDoneEvent(BaseModel):
"""SSE event for completion"""
message_id: str
full_content: str

class SSEErrorEvent(BaseModel):
"""SSE event for errors"""
error: str
fallback_message: str
5.3 Detailed API Specifications
5.3.1 Agents API
yaml

# ═══════════════════════════════════════════════════════════════════════════

# GET /api/agents - List all agents

# ═══════════════════════════════════════════════════════════════════════════

Request:
Method: GET
Headers:
Content-Type: application/json

Response 200:
{
"agents": [
{
"id": "550e8400-e29b-41d4-a716-446655440000",
"name": "Customer Support Bot",
"system_prompt": "You are a helpful...",
"created_at": "2026-01-15T10:30:00Z",
"updated_at": "2026-01-15T10:30:00Z",
"session_count": 5
}
],
"total": 1
}

# ═══════════════════════════════════════════════════════════════════════════

# POST /api/agents - Create new agent

# ═══════════════════════════════════════════════════════════════════════════

Request:
Method: POST
Headers:
Content-Type: application/json
Body:
{
"name": "Sales Assistant",
"system_prompt": "You are a friendly sales assistant..."
}

Response 201:
{
"id": "660e8400-e29b-41d4-a716-446655440001",
"name": "Sales Assistant",
"system_prompt": "You are a friendly sales assistant...",
"created_at": "2026-01-15T10:35:00Z",
"updated_at": "2026-01-15T10:35:00Z",
"session_count": 0
}

Response 422 (Validation Error):
{
"error": "Validation Error",
"detail": "name: String should have at least 1 character"
}

# ═══════════════════════════════════════════════════════════════════════════

# GET /api/agents/{id} - Get agent by ID

# ═══════════════════════════════════════════════════════════════════════════

Request:
Method: GET
Path: /api/agents/550e8400-e29b-41d4-a716-446655440000

Response 200:
{
"id": "550e8400-e29b-41d4-a716-446655440000",
"name": "Customer Support Bot",
"system_prompt": "You are a helpful...",
"created_at": "2026-01-15T10:30:00Z",
"updated_at": "2026-01-15T10:30:00Z",
"session_count": 5
}

Response 404:
{
"error": "Not Found",
"detail": "Agent not found"
}

# ═══════════════════════════════════════════════════════════════════════════

# PUT /api/agents/{id} - Update agent

# ═══════════════════════════════════════════════════════════════════════════

Request:
Method: PUT
Path: /api/agents/550e8400-e29b-41d4-a716-446655440000
Body:
{
"name": "Updated Bot Name",
"system_prompt": "Updated prompt..."
}

Response 200:
{
"id": "550e8400-e29b-41d4-a716-446655440000",
"name": "Updated Bot Name",
"system_prompt": "Updated prompt...",
"created_at": "2026-01-15T10:30:00Z",
"updated_at": "2026-01-15T11:00:00Z",
"session_count": 5
}

# ═══════════════════════════════════════════════════════════════════════════

# DELETE /api/agents/{id} - Delete agent

# ═══════════════════════════════════════════════════════════════════════════

Request:
Method: DELETE
Path: /api/agents/550e8400-e29b-41d4-a716-446655440000

Response 204:
(No content - successful deletion)

Response 404:
{
"error": "Not Found",
"detail": "Agent not found"
}
5.3.2 Sessions API
yaml

# ═══════════════════════════════════════════════════════════════════════════

# GET /api/agents/{id}/sessions - List sessions for agent

# ═══════════════════════════════════════════════════════════════════════════

Request:
Method: GET
Path: /api/agents/550e8400-e29b-41d4-a716-446655440000/sessions

Response 200:
{
"sessions": [
{
"id": "770e8400-e29b-41d4-a716-446655440002",
"agent_id": "550e8400-e29b-41d4-a716-446655440000",
"title": "Help with order #12345",
"created_at": "2026-01-15T11:00:00Z",
"updated_at": "2026-01-15T11:30:00Z",
"message_count": 12
}
],
"total": 1
}

# ═══════════════════════════════════════════════════════════════════════════

# POST /api/agents/{id}/sessions - Create new session

# ═══════════════════════════════════════════════════════════════════════════

Request:
Method: POST
Path: /api/agents/550e8400-e29b-41d4-a716-446655440000/sessions
Body:
{
"title": null // Optional - will be auto-generated
}

Response 201:
{
"id": "880e8400-e29b-41d4-a716-446655440003",
"agent_id": "550e8400-e29b-41d4-a716-446655440000",
"title": null, // Will be set after first message
"created_at": "2026-01-15T12:00:00Z",
"updated_at": "2026-01-15T12:00:00Z",
"message_count": 0
}

# ═══════════════════════════════════════════════════════════════════════════

# GET /api/sessions/{id} - Get session with messages

# ═══════════════════════════════════════════════════════════════════════════

Request:
Method: GET
Path: /api/sessions/770e8400-e29b-41d4-a716-446655440002

Response 200:
{
"id": "770e8400-e29b-41d4-a716-446655440002",
"agent_id": "550e8400-e29b-41d4-a716-446655440000",
"title": "Help with order #12345",
"created_at": "2026-01-15T11:00:00Z",
"updated_at": "2026-01-15T11:30:00Z",
"message_count": 12,
"messages": [...], // Last 50 messages
"agent": {
"id": "550e8400-e29b-41d4-a716-446655440000",
"name": "Customer Support Bot",
...
}
}

# ═══════════════════════════════════════════════════════════════════════════

# DELETE /api/sessions/{id} - Delete session

# ═══════════════════════════════════════════════════════════════════════════

Request:
Method: DELETE
Path: /api/sessions/770e8400-e29b-41d4-a716-446655440002

Response 204:
(No content)
5.3.3 Messages API (with SSE)
yaml

# ═══════════════════════════════════════════════════════════════════════════

# GET /api/sessions/{id}/messages - Get messages (paginated)

# ═══════════════════════════════════════════════════════════════════════════

Request:
Method: GET
Path: /api/sessions/770e8400.../messages?limit=50&before=msg-id
Query Parameters: - limit: number (1-100, default 50) - before: string (message ID for cursor pagination)

Response 200:
{
"messages": [
{
"id": "990e8400-e29b-41d4-a716-446655440004",
"session_id": "770e8400-e29b-41d4-a716-446655440002",
"role": "user",
"content": "I need help with my order",
"message_type": "text",
"audio_url": null,
"tts_audio_url": null,
"created_at": "2026-01-15T11:00:00Z"
},
{
"id": "aa0e8400-e29b-41d4-a716-446655440005",
"session_id": "770e8400-e29b-41d4-a716-446655440002",
"role": "assistant",
"content": "I'd be happy to help! What's your order number?",
"message_type": "text",
"audio_url": null,
"tts_audio_url": null,
"created_at": "2026-01-15T11:00:05Z"
}
],
"has_more": true,
"total_count": 127
}

# ═══════════════════════════════════════════════════════════════════════════

# POST /api/sessions/{id}/messages - Send text message (SSE stream)

# ═══════════════════════════════════════════════════════════════════════════

Request:
Method: POST
Path: /api/sessions/770e8400.../messages
Headers:
Content-Type: application/json
Accept: text/event-stream
Body:
{
"content": "What's the status of my order #12345?"
}

Response: text/event-stream

# Stream of SSE events:

event: token
data: {"content": "Let"}

event: token
data: {"content": " me"}

event: token
data: {"content": " check"}

event: token
data: {"content": " that"}

event: token
data: {"content": " for"}

event: token
data: {"content": " you"}

event: token
data: {"content": "."}

event: done
data: {"message_id": "bb0e8400...", "full_content": "Let me check that for you."}

# If error occurs:

event: error
data: {"error": "API Error", "fallback_message": "I apologize, I'm having trouble..."}
5.3.4 Voice API
yaml

# ═══════════════════════════════════════════════════════════════════════════

# POST /api/sessions/{id}/voice - Send voice message

# ═══════════════════════════════════════════════════════════════════════════

Request:
Method: POST
Path: /api/sessions/770e8400.../voice
Headers:
Content-Type: multipart/form-data
Body (FormData): - audio: File (WebM, max 5MB, max 2 minutes)

Response 200:
{
"user_message": {
"id": "cc0e8400-e29b-41d4-a716-446655440006",
"session_id": "770e8400-e29b-41d4-a716-446655440002",
"role": "user",
"content": "What's the weather like today?", // Transcribed
"message_type": "voice",
"audio_url": "/api/audio/uploads/cc0e8400.webm",
"tts_audio_url": null,
"created_at": "2026-01-15T12:00:00Z"
},
"assistant_message": {
"id": "dd0e8400-e29b-41d4-a716-446655440007",
"session_id": "770e8400-e29b-41d4-a716-446655440002",
"role": "assistant",
"content": "I don't have access to real-time weather data...",
"message_type": "voice",
"audio_url": null,
"tts_audio_url": "/api/audio/tts/dd0e8400.mp3",
"created_at": "2026-01-15T12:00:05Z"
}
}

Response 400:
{
"error": "Invalid Audio",
"detail": "Audio file too large (max 5MB)"
}

Response 422:
{
"error": "Transcription Failed",
"detail": "Could not understand audio",
"fallback_message": "I couldn't understand the audio. Please try again."
}

# ═══════════════════════════════════════════════════════════════════════════

# GET /api/audio/{filepath} - Serve audio file

# ═══════════════════════════════════════════════════════════════════════════

Request:
Method: GET
Path: /api/audio/uploads/cc0e8400.webm

# or

Path: /api/audio/tts/dd0e8400.mp3

Response 200:
Headers:
Content-Type: audio/webm (or audio/mpeg for mp3)
Content-Disposition: inline
Body: (binary audio data)

Response 404:
{
"error": "Not Found",
"detail": "Audio file not found"
}

```

---

## 6. Frontend Architecture

### 6.1 Component Hierarchy
```

┌─────────────────────────────────────────────────────────────────────────────┐
│ COMPONENT TREE │
├─────────────────────────────────────────────────────────────────────────────┤
│ │
│ App │
│ └── AppProvider (Context) │
│ └── Layout │
│ ├── Sidebar │
│ │ ├── Logo │
│ │ ├── AgentList │
│ │ │ ├── AgentCard (× N) │
│ │ │ │ ├── AgentName │
│ │ │ │ ├── SessionCount │
│ │ │ │ └── ActionButtons (Edit, Delete) │
│ │ │ └── LoadingState │
│ │ ├── AddAgentButton │
│ │ ├── Divider │
│ │ └── SessionList (when agent selected) │
│ │ ├── NewSessionButton │
│ │ ├── SessionCard (× N) │
│ │ │ ├── SessionTitle │
│ │ │ ├── LastMessage Preview │
│ │ │ └── Timestamp │
│ │ └── LoadingState │
│ │ │
│ └── MainContent │
│ ├── EmptyState (no session selected) │
│ │ └── "Select an agent and session to start chatting" │
│ │ │
│ └── ChatContainer (session selected) │
│ ├── ChatHeader │
│ │ ├── AgentAvatar │
│ │ ├── AgentName │
│ │ └── SessionTitle │
│ │ │
│ ├── MessageList │
│ │ ├── LoadMoreButton (if has_more) │
│ │ ├── DateSeparator │
│ │ ├── MessageBubble (× N) │
│ │ │ ├── Avatar │
│ │ │ ├── Content │
│ │ │ ├── AudioPlayer (if voice message) │
│ │ │ └── Timestamp │
│ │ ├── StreamingMessage (during SSE) │
│ │ │ └── TypingIndicator │
│ │ └── LoadingSpinner │
│ │ │
│ └── ChatInput │
│ ├── TextArea │
│ ├── SendButton │
│ └── VoiceButton │
│ └── RecordingIndicator (when recording) │
│ │
│ MODALS (Portal - rendered at root) │
│ ├── AgentModal (Create/Edit) │
│ │ ├── ModalHeader │
│ │ ├── AgentForm │
│ │ │ ├── NameInput │
│ │ │ └── SystemPromptTextarea │
│ │ └── ModalFooter (Cancel, Save) │
│ │ │
│ └── DeleteConfirmModal │
│ ├── WarningIcon │
│ ├── Message │
│ ├── ImpactList (sessions, messages to be deleted) │
│ └── Actions (Cancel, Delete) │
│ │
└─────────────────────────────────────────────────────────────────────────────┘
6.2 State Management
typescript
// ═══════════════════════════════════════════════════════════════════════════
// GLOBAL STATE STRUCTURE
// ═══════════════════════════════════════════════════════════════════════════

interface AppState {
// Agents
agents: {
items: Agent[];
loading: boolean;
error: string | null;
selectedId: string | null;
};

// Sessions (for selected agent)
sessions: {
items: Session[];
loading: boolean;
error: string | null;
selectedId: string | null;
};

// Messages (for selected session)
messages: {
items: Message[];
loading: boolean;
error: string | null;
hasMore: boolean;
totalCount: number;
// Streaming state
streaming: boolean;
streamingContent: string;
};

// Voice recording
voice: {
isRecording: boolean;
isProcessing: boolean;
recordingDuration: number;
error: string | null;
};

// UI state
ui: {
sidebarCollapsed: boolean;
modalType: 'agent-create' | 'agent-edit' | 'delete-agent' | 'delete-session' | null;
editingAgent: Agent | null;
deletingItem: { type: 'agent' | 'session'; id: string; name: string } | null;
};
}

// ═══════════════════════════════════════════════════════════════════════════
// ACTION TYPES
// ═══════════════════════════════════════════════════════════════════════════

type AppAction =
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
| { type: 'REMOVE_SESSION'; payload: string }

// Messages
| { type: 'SET_MESSAGES_LOADING' }
| { type: 'SET_MESSAGES'; payload: { messages: Message[]; hasMore: boolean; totalCount: number } }
| { type: 'PREPEND_MESSAGES'; payload: { messages: Message[]; hasMore: boolean } }
| { type: 'SET_MESSAGES_ERROR'; payload: string }
| { type: 'ADD_MESSAGE'; payload: Message }
| { type: 'UPDATE_MESSAGE'; payload: Message }

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

// UI
| { type: 'TOGGLE_SIDEBAR' }
| { type: 'OPEN_MODAL'; payload: AppState['ui']['modalType'] }
| { type: 'CLOSE_MODAL' }
| { type: 'SET_EDITING_AGENT'; payload: Agent | null }
| { type: 'SET_DELETING_ITEM'; payload: AppState['ui']['deletingItem'] };

// ═══════════════════════════════════════════════════════════════════════════
// INITIAL STATE
// ═══════════════════════════════════════════════════════════════════════════

const initialState: AppState = {
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
},
ui: {
sidebarCollapsed: false,
modalType: null,
editingAgent: null,
deletingItem: null,
},
};
6.3 Custom Hooks
typescript
// ═══════════════════════════════════════════════════════════════════════════
// hooks/useAgents.ts
// ═══════════════════════════════════════════════════════════════════════════

interface UseAgentsReturn {
agents: Agent[];
loading: boolean;
error: string | null;
selectedAgent: Agent | null;

// Actions
fetchAgents: () => Promise<void>;
selectAgent: (id: string | null) => void;
createAgent: (data: AgentCreate) => Promise<Agent>;
updateAgent: (id: string, data: AgentUpdate) => Promise<Agent>;
deleteAgent: (id: string) => Promise<void>;
}

function useAgents(): UseAgentsReturn {
const { state, dispatch } = useAppContext();

const fetchAgents = async () => {
dispatch({ type: 'SET_AGENTS_LOADING' });
try {
const response = await agentService.getAll();
dispatch({ type: 'SET_AGENTS', payload: response.agents });
} catch (error) {
dispatch({ type: 'SET_AGENTS_ERROR', payload: error.message });
}
};

const selectAgent = (id: string | null) => {
dispatch({ type: 'SELECT_AGENT', payload: id });
dispatch({ type: 'SELECT_SESSION', payload: null }); // Clear session selection
};

const createAgent = async (data: AgentCreate): Promise<Agent> => {
const agent = await agentService.create(data);
dispatch({ type: 'ADD_AGENT', payload: agent });
return agent;
};

const updateAgent = async (id: string, data: AgentUpdate): Promise<Agent> => {
const agent = await agentService.update(id, data);
dispatch({ type: 'UPDATE_AGENT', payload: agent });
return agent;
};

const deleteAgent = async (id: string): Promise<void> => {
await agentService.delete(id);
dispatch({ type: 'REMOVE_AGENT', payload: id });
if (state.agents.selectedId === id) {
dispatch({ type: 'SELECT_AGENT', payload: null });
}
};

const selectedAgent = state.agents.items.find(a => a.id === state.agents.selectedId) || null;

return {
agents: state.agents.items,
loading: state.agents.loading,
error: state.agents.error,
selectedAgent,
fetchAgents,
selectAgent,
createAgent,
updateAgent,
deleteAgent,
};
}

// ═══════════════════════════════════════════════════════════════════════════
// hooks/useSessions.ts
// ═══════════════════════════════════════════════════════════════════════════

interface UseSessionsReturn {
sessions: Session[];
loading: boolean;
error: string | null;
selectedSession: Session | null;

fetchSessions: (agentId: string) => Promise<void>;
selectSession: (id: string | null) => void;
createSession: (agentId: string) => Promise<Session>;
deleteSession: (id: string) => Promise<void>;
}

function useSessions(): UseSessionsReturn {
const { state, dispatch } = useAppContext();

const fetchSessions = async (agentId: string) => {
dispatch({ type: 'SET_SESSIONS_LOADING' });
try {
const response = await sessionService.getByAgent(agentId);
dispatch({ type: 'SET_SESSIONS', payload: response.sessions });
} catch (error) {
dispatch({ type: 'SET_SESSIONS_ERROR', payload: error.message });
}
};

const selectSession = (id: string | null) => {
dispatch({ type: 'SELECT_SESSION', payload: id });
};

const createSession = async (agentId: string): Promise<Session> => {
const session = await sessionService.create(agentId);
dispatch({ type: 'ADD_SESSION', payload: session });
return session;
};

const deleteSession = async (id: string): Promise<void> => {
await sessionService.delete(id);
dispatch({ type: 'REMOVE_SESSION', payload: id });
if (state.sessions.selectedId === id) {
dispatch({ type: 'SELECT_SESSION', payload: null });
}
};

const selectedSession = state.sessions.items.find(s => s.id === state.sessions.selectedId) || null;

return {
sessions: state.sessions.items,
loading: state.sessions.loading,
error: state.sessions.error,
selectedSession,
fetchSessions,
selectSession,
createSession,
deleteSession,
};
}

// ═══════════════════════════════════════════════════════════════════════════
// hooks/useChat.ts
// ═══════════════════════════════════════════════════════════════════════════

interface UseChatReturn {
messages: Message[];
loading: boolean;
error: string | null;
streaming: boolean;
streamingContent: string;
hasMore: boolean;

fetchMessages: (sessionId: string, before?: string) => Promise<void>;
sendMessage: (sessionId: string, content: string) => Promise<void>;
sendVoiceMessage: (sessionId: string, audioBlob: Blob) => Promise<void>;
loadMoreMessages: (sessionId: string) => Promise<void>;
}

function useChat(): UseChatReturn {
const { state, dispatch } = useAppContext();

const fetchMessages = async (sessionId: string, before?: string) => {
dispatch({ type: 'SET_MESSAGES_LOADING' });
try {
const response = await messageService.getBySession(sessionId, { limit: 50, before });
if (before) {
dispatch({ type: 'PREPEND_MESSAGES', payload: { messages: response.messages, hasMore: response.has_more } });
} else {
dispatch({ type: 'SET_MESSAGES', payload: { messages: response.messages, hasMore: response.has_more, totalCount: response.total_count } });
}
} catch (error) {
dispatch({ type: 'SET_MESSAGES_ERROR', payload: error.message });
}
};

const sendMessage = async (sessionId: string, content: string) => {
// Add optimistic user message
const tempUserMsg: Message = {
id: `temp-${Date.now()}`,
session_id: sessionId,
role: 'user',
content,
message_type: 'text',
created_at: new Date().toISOString(),
};
dispatch({ type: 'ADD_MESSAGE', payload: tempUserMsg });

    // Start streaming
    dispatch({ type: 'START_STREAMING' });

    try {
      // Connect to SSE endpoint
      const eventSource = new EventSource(
        `${API_BASE_URL}/sessions/${sessionId}/messages?content=${encodeURIComponent(content)}`,
        { withCredentials: false }
      );

      // Alternative: Use fetch with ReadableStream for POST
      await streamMessage(sessionId, content, {
        onToken: (token) => {
          dispatch({ type: 'APPEND_STREAMING_CONTENT', payload: token });
        },
        onDone: (message) => {
          dispatch({ type: 'FINISH_STREAMING', payload: message });
        },
        onError: (error, fallback) => {
          dispatch({ type: 'STREAMING_ERROR', payload: error });
          if (fallback) {
            dispatch({ type: 'ADD_MESSAGE', payload: fallback });
          }
        },
      });
    } catch (error) {
      dispatch({ type: 'STREAMING_ERROR', payload: error.message });
    }

};

const sendVoiceMessage = async (sessionId: string, audioBlob: Blob) => {
dispatch({ type: 'START_VOICE_PROCESSING' });
try {
const response = await voiceService.sendVoice(sessionId, audioBlob);
dispatch({ type: 'ADD_MESSAGE', payload: response.user_message });
dispatch({ type: 'ADD_MESSAGE', payload: response.assistant_message });
dispatch({ type: 'FINISH_VOICE_PROCESSING' });
} catch (error) {
dispatch({ type: 'VOICE_ERROR', payload: error.message });
}
};

const loadMoreMessages = async (sessionId: string) => {
if (state.messages.items.length > 0 && state.messages.hasMore) {
const oldestMessage = state.messages.items[0];
await fetchMessages(sessionId, oldestMessage.id);
}
};

return {
messages: state.messages.items,
loading: state.messages.loading,
error: state.messages.error,
streaming: state.messages.streaming,
streamingContent: state.messages.streamingContent,
hasMore: state.messages.hasMore,
fetchMessages,
sendMessage,
sendVoiceMessage,
loadMoreMessages,
};
}

// ═══════════════════════════════════════════════════════════════════════════
// hooks/useVoiceRecorder.ts
// ═══════════════════════════════════════════════════════════════════════════

interface UseVoiceRecorderReturn {
isRecording: boolean;
isSupported: boolean;
duration: number;
error: string | null;

startRecording: () => Promise<void>;
stopRecording: () => Promise<Blob>;
cancelRecording: () => void;
}

function useVoiceRecorder(): UseVoiceRecorderReturn {
const [isRecording, setIsRecording] = useState(false);
const [duration, setDuration] = useState(0);
const [error, setError] = useState<string | null>(null);

const mediaRecorderRef = useRef<MediaRecorder | null>(null);
const chunksRef = useRef<Blob[]>([]);
const timerRef = useRef<NodeJS.Timeout | null>(null);

const isSupported = typeof navigator !== 'undefined' &&
navigator.mediaDevices &&
'getUserMedia' in navigator.mediaDevices;

const startRecording = async () => {
try {
const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus'
      });

      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      mediaRecorder.start(100); // Collect data every 100ms
      setIsRecording(true);
      setDuration(0);

      // Start duration timer
      timerRef.current = setInterval(() => {
        setDuration(prev => {
          const newDuration = prev + 1;
          // Auto-stop at max duration
          if (newDuration >= MAX_RECORDING_DURATION) {
            stopRecording();
          }
          return newDuration;
        });
      }, 1000);

    } catch (err) {
      setError('Microphone access denied');
    }

};

const stopRecording = async (): Promise<Blob> => {
return new Promise((resolve) => {
const mediaRecorder = mediaRecorderRef.current;
if (!mediaRecorder) {
throw new Error('No active recording');
}

      // Clear timer
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });

        // Stop all tracks
        mediaRecorder.stream.getTracks().forEach(track => track.stop());

        setIsRecording(false);
        resolve(blob);
      };

      mediaRecorder.stop();
    });

};

const cancelRecording = () => {
const mediaRecorder = mediaRecorderRef.current;
if (mediaRecorder && mediaRecorder.state !== 'inactive') {
mediaRecorder.stop();
mediaRecorder.stream.getTracks().forEach(track => track.stop());
}
if (timerRef.current) {
clearInterval(timerRef.current);
}
setIsRecording(false);
setDuration(0);
chunksRef.current = [];
};

return {
isRecording,
isSupported,
duration,
error,
startRecording,
stopRecording,
cancelRecording,
};
}

// ═══════════════════════════════════════════════════════════════════════════
// hooks/useAudioPlayer.ts
// ═══════════════════════════════════════════════════════════════════════════

interface UseAudioPlayerReturn {
isPlaying: boolean;
currentUrl: string | null;
progress: number;
duration: number;

play: (url: string) => void;
pause: () => void;
stop: () => void;
seek: (time: number) => void;
}

function useAudioPlayer(): UseAudioPlayerReturn {
const [isPlaying, setIsPlaying] = useState(false);
const [currentUrl, setCurrentUrl] = useState<string | null>(null);
const [progress, setProgress] = useState(0);
const [duration, setDuration] = useState(0);

const audioRef = useRef<HTMLAudioElement | null>(null);

useEffect(() => {
audioRef.current = new Audio();

    const audio = audioRef.current;

    audio.addEventListener('timeupdate', () => {
      setProgress(audio.currentTime);
    });

    audio.addEventListener('loadedmetadata', () => {
      setDuration(audio.duration);
    });

    audio.addEventListener('ended', () => {
      setIsPlaying(false);
      setProgress(0);
    });

    return () => {
      audio.pause();
      audio.src = '';
    };

}, []);

const play = (url: string) => {
const audio = audioRef.current;
if (!audio) return;

    if (currentUrl !== url) {
      audio.src = url;
      setCurrentUrl(url);
    }

    audio.play();
    setIsPlaying(true);

};

const pause = () => {
audioRef.current?.pause();
setIsPlaying(false);
};

const stop = () => {
const audio = audioRef.current;
if (audio) {
audio.pause();
audio.currentTime = 0;
}
setIsPlaying(false);
setProgress(0);
};

const seek = (time: number) => {
if (audioRef.current) {
audioRef.current.currentTime = time;
}
};

return {
isPlaying,
currentUrl,
progress,
duration,
play,
pause,
stop,
seek,
};
}

```

### 6.4 Project Structure
```

frontend/
├── public/
│ ├── index.html
│ └── favicon.ico
│
├── src/
│ ├── index.tsx # Entry point
│ ├── App.tsx # Root component
│ │
│ ├── components/
│ │ ├── layout/
│ │ │ ├── Layout.tsx
│ │ │ ├── Sidebar.tsx
│ │ │ ├── MainContent.tsx
│ │ │ └── index.ts
│ │ │
│ │ ├── agents/
│ │ │ ├── AgentList.tsx
│ │ │ ├── AgentCard.tsx
│ │ │ ├── AgentModal.tsx
│ │ │ ├── AgentForm.tsx
│ │ │ └── index.ts
│ │ │
│ │ ├── sessions/
│ │ │ ├── SessionList.tsx
│ │ │ ├── SessionCard.tsx
│ │ │ └── index.ts
│ │ │
│ │ ├── chat/
│ │ │ ├── ChatContainer.tsx
│ │ │ ├── ChatHeader.tsx
│ │ │ ├── MessageList.tsx
│ │ │ ├── MessageBubble.tsx
│ │ │ ├── ChatInput.tsx
│ │ │ ├── StreamingMessage.tsx
│ │ │ └── index.ts
│ │ │
│ │ ├── voice/
│ │ │ ├── VoiceButton.tsx
│ │ │ ├── RecordingIndicator.tsx
│ │ │ ├── AudioPlayer.tsx
│ │ │ └── index.ts
│ │ │
│ │ └── common/
│ │ ├── Button.tsx
│ │ ├── Input.tsx
│ │ ├── TextArea.tsx
│ │ ├── Modal.tsx
│ │ ├── LoadingSpinner.tsx
│ │ ├── ErrorMessage.tsx
│ │ ├── ConfirmDialog.tsx
│ │ ├── EmptyState.tsx
│ │ └── index.ts
│ │
│ ├── hooks/
│ │ ├── useAgents.ts
│ │ ├── useSessions.ts
│ │ ├── useChat.ts
│ │ ├── useVoiceRecorder.ts
│ │ ├── useAudioPlayer.ts
│ │ ├── useSSE.ts
│ │ └── index.ts
│ │
│ ├── context/
│ │ ├── AppContext.tsx
│ │ ├── AppReducer.ts
│ │ └── index.ts
│ │
│ ├── services/
│ │ ├── api.ts # Axios instance & config
│ │ ├── agentService.ts
│ │ ├── sessionService.ts
│ │ ├── messageService.ts
│ │ ├── voiceService.ts
│ │ └── index.ts
│ │
│ ├── types/
│ │ ├── agent.ts
│ │ ├── session.ts
│ │ ├── message.ts
│ │ ├── api.ts
│ │ └── index.ts
│ │
│ ├── utils/
│ │ ├── audio.ts # Audio blob utilities
│ │ ├── formatters.ts # Date, time formatting
│ │ ├── constants.ts
│ │ └── index.ts
│ │
│ └── styles/
│ └── globals.css # Tailwind imports + custom styles
│
├── tests/
│ ├── components/
│ │ ├── AgentList.test.tsx
│ │ ├── MessageBubble.test.tsx
│ │ └── ...
│ ├── hooks/
│ │ ├── useAgents.test.ts
│ │ └── ...
│ └── setup.ts
│
├── package.json
├── tsconfig.json
├── tailwind.config.js
├── postcss.config.js
├── Dockerfile
├── .env.example
└── .gitignore

```

---

## 7. Backend Implementation Guide

### 7.1 Project Structure
```

backend/
├── app/
│ ├── **init**.py
│ ├── main.py # FastAPI app initialization
│ ├── config.py # Settings & environment variables
│ │
│ ├── models/
│ │ ├── **init**.py
│ │ ├── base.py # Base model class
│ │ ├── agent.py
│ │ ├── session.py
│ │ └── message.py
│ │
│ ├── schemas/
│ │ ├── **init**.py
│ │ ├── agent.py
│ │ ├── session.py
│ │ ├── message.py
│ │ ├── voice.py
│ │ └── common.py
│ │
│ ├── routes/
│ │ ├── **init**.py
│ │ ├── agents.py
│ │ ├── sessions.py
│ │ ├── messages.py
│ │ ├── voice.py
│ │ └── health.py
│ │
│ ├── services/
│ │ ├── **init**.py
│ │ ├── agent_service.py
│ │ ├── session_service.py
│ │ ├── chat_service.py
│ │ └── voice_service.py
│ │
│ ├── integrations/
│ │ ├── **init**.py
│ │ └── openai_client.py
│ │
│ ├── database/
│ │ ├── **init**.py
│ │ └── connection.py
│ │
│ └── utils/
│ ├── **init**.py
│ ├── audio.py
│ ├── sse.py
│ └── exceptions.py
│
├── tests/
│ ├── **init**.py
│ ├── conftest.py
│ ├── test_agents.py
│ ├── test_sessions.py
│ ├── test_messages.py
│ └── test_voice.py
│
├── audio_files/
│ ├── uploads/ # User voice recordings
│ └── tts/ # Generated TTS audio
│
├── requirements.txt
├── Dockerfile
├── .env.example
└── .gitignore
7.2 Core Implementation Files
python

# ═══════════════════════════════════════════════════════════════════════════

# app/config.py

# ═══════════════════════════════════════════════════════════════════════════

from pydantic_settings import BaseSettings
from functools import lru_cache

class Settings(BaseSettings): # App
APP_NAME: str = "AI Agent Platform"
APP_VERSION: str = "1.0.0"
DEBUG: bool = False

    # Database
    DATABASE_URL: str = "sqlite+aiosqlite:///./app.db"

    # OpenAI
    OPENAI_API_KEY: str
    OPENAI_MODEL: str = "gpt-4"
    OPENAI_TTS_MODEL: str = "tts-1"
    OPENAI_TTS_VOICE: str = "alloy"
    OPENAI_WHISPER_MODEL: str = "whisper-1"

    # Audio
    MAX_AUDIO_DURATION: int = 120  # seconds
    MAX_AUDIO_SIZE: int = 5 * 1024 * 1024  # 5MB
    AUDIO_UPLOAD_DIR: str = "audio_files/uploads"
    AUDIO_TTS_DIR: str = "audio_files/tts"

    # CORS
    CORS_ORIGINS: list[str] = ["http://localhost:3000", "http://localhost:5173"]

    class Config:
        env_file = ".env"

@lru_cache()
def get_settings() -> Settings:
return Settings()

settings = get_settings()

# ═══════════════════════════════════════════════════════════════════════════

# app/main.py

# ═══════════════════════════════════════════════════════════════════════════

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from contextlib import asynccontextmanager

from app.config import settings
from app.database.connection import init_db
from app.routes import agents, sessions, messages, voice, health

@asynccontextmanager
async def lifespan(app: FastAPI): # Startup
await init_db() # Ensure audio directories exist
import os
os.makedirs(settings.AUDIO_UPLOAD_DIR, exist_ok=True)
os.makedirs(settings.AUDIO_TTS_DIR, exist_ok=True)
yield # Shutdown
pass

app = FastAPI(
title=settings.APP_NAME,
version=settings.APP_VERSION,
lifespan=lifespan,
docs_url="/api/docs",
redoc_url="/api/redoc",
openapi_url="/api/openapi.json"
)

# CORS

app.add_middleware(
CORSMiddleware,
allow_origins=settings.CORS_ORIGINS,
allow_credentials=True,
allow_methods=["*"],
allow_headers=["*"],
)

# Static files for audio

app.mount("/api/audio", StaticFiles(directory="audio_files"), name="audio")

# Routes

app.include_router(health.router, prefix="/api", tags=["Health"])
app.include_router(agents.router, prefix="/api", tags=["Agents"])
app.include_router(sessions.router, prefix="/api", tags=["Sessions"])
app.include_router(messages.router, prefix="/api", tags=["Messages"])
app.include_router(voice.router, prefix="/api", tags=["Voice"])

# ═══════════════════════════════════════════════════════════════════════════

# app/integrations/openai_client.py

# ═══════════════════════════════════════════════════════════════════════════

from openai import AsyncOpenAI
from typing import AsyncGenerator, List, Dict
import aiofiles
from pathlib import Path

from app.config import settings

class OpenAIClient:
def **init**(self):
self.client = AsyncOpenAI(api_key=settings.OPENAI_API_KEY)

    async def chat_completion(
        self,
        system_prompt: str,
        messages: List[Dict[str, str]]
    ) -> str:
        """Non-streaming chat completion"""
        response = await self.client.chat.completions.create(
            model=settings.OPENAI_MODEL,
            messages=[
                {"role": "system", "content": system_prompt},
                *messages
            ],
            temperature=0.7,
        )
        return response.choices[0].message.content

    async def chat_completion_stream(
        self,
        system_prompt: str,
        messages: List[Dict[str, str]]
    ) -> AsyncGenerator[str, None]:
        """Streaming chat completion"""
        stream = await self.client.chat.completions.create(
            model=settings.OPENAI_MODEL,
            messages=[
                {"role": "system", "content": system_prompt},
                *messages
            ],
            temperature=0.7,
            stream=True,
        )

        async for chunk in stream:
            if chunk.choices[0].delta.content:
                yield chunk.choices[0].delta.content

    async def speech_to_text(self, audio_path: str) -> str:
        """Transcribe audio using Whisper"""
        async with aiofiles.open(audio_path, "rb") as audio_file:
            content = await audio_file.read()

        # OpenAI expects a file-like object
        from io import BytesIO
        audio_buffer = BytesIO(content)
        audio_buffer.name = Path(audio_path).name

        transcript = await self.client.audio.transcriptions.create(
            model=settings.OPENAI_WHISPER_MODEL,
            file=audio_buffer,
            response_format="text"
        )
        return transcript

    async def text_to_speech(self, text: str) -> bytes:
        """Generate speech from text"""
        response = await self.client.audio.speech.create(
            model=settings.OPENAI_TTS_MODEL,
            voice=settings.OPENAI_TTS_VOICE,
            input=text,
            response_format="mp3"
        )
        return response.content

# Global instance

openai_client = OpenAIClient()

# ═══════════════════════════════════════════════════════════════════════════

# app/services/chat_service.py

# ═══════════════════════════════════════════════════════════════════════════

from typing import AsyncGenerator, List, Dict
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
import json

from app.models import Message, Session, Agent, MessageType, MessageRole
from app.integrations.openai_client import openai_client
from app.schemas.message import MessageResponse

class ChatService:
def **init**(self, db: AsyncSession):
self.db = db

    async def get_conversation_history(
        self,
        session_id: str,
        limit: int = 20
    ) -> List[Dict[str, str]]:
        """Get recent messages for context"""
        query = (
            select(Message)
            .where(Message.session_id == session_id)
            .order_by(Message.created_at.desc())
            .limit(limit)
        )
        result = await self.db.execute(query)
        messages = result.scalars().all()

        # Reverse to chronological order and format for OpenAI
        return [
            {"role": msg.role, "content": msg.content}
            for msg in reversed(messages)
        ]

    async def get_agent_for_session(self, session_id: str) -> Agent:
        """Get the agent associated with a session"""
        query = (
            select(Agent)
            .join(Session, Session.agent_id == Agent.id)
            .where(Session.id == session_id)
        )
        result = await self.db.execute(query)
        agent = result.scalar_one_or_none()
        if not agent:
            raise ValueError(f"No agent found for session {session_id}")
        return agent

    async def save_message(
        self,
        session_id: str,
        role: str,
        content: str,
        message_type: str = MessageType.TEXT,
        audio_url: str = None,
        tts_audio_url: str = None
    ) -> Message:
        """Save a message to the database"""
        message = Message(
            session_id=session_id,
            role=role,
            content=content,
            message_type=message_type,
            audio_url=audio_url,
            tts_audio_url=tts_audio_url
        )
        self.db.add(message)
        await self.db.commit()
        await self.db.refresh(message)

        # Update session title if this is the first message
        await self._update_session_title_if_needed(session_id, content, role)

        return message

    async def _update_session_title_if_needed(
        self,
        session_id: str,
        content: str,
        role: str
    ):
        """Auto-generate session title from first user message"""
        if role != MessageRole.USER:
            return

        query = select(Session).where(Session.id == session_id)
        result = await self.db.execute(query)
        session = result.scalar_one_or_none()

        if session and not session.title:
            # Generate title from first ~50 chars of first message
            title = content[:50] + "..." if len(content) > 50 else content
            session.title = title
            await self.db.commit()

    async def send_message_stream(
        self,
        session_id: str,
        content: str
    ) -> AsyncGenerator[str, None]:
        """
        Send a message and stream the response via SSE.

        Yields SSE-formatted events:
        - event: token, data: {"content": "..."}
        - event: done, data: {"message_id": "...", "full_content": "..."}
        - event: error, data: {"error": "...", "fallback_message": "..."}
        """
        # Save user message
        user_message = await self.save_message(
            session_id=session_id,
            role=MessageRole.USER,
            content=content
        )

        # Get conversation history
        history = await self.get_conversation_history(session_id)

        # Get agent's system prompt
        agent = await self.get_agent_for_session(session_id)

        # Stream from OpenAI
        full_response = ""
        try:
            async for chunk in openai_client.chat_completion_stream(
                system_prompt=agent.system_prompt,
                messages=history
            ):
                full_response += chunk
                yield f"event: token\ndata: {json.dumps({'content': chunk})}\n\n"

            # Save AI message
            ai_message = await self.save_message(
                session_id=session_id,
                role=MessageRole.ASSISTANT,
                content=full_response
            )

            # Send completion event
            yield f"event: done\ndata: {json.dumps({'message_id': ai_message.id, 'full_content': full_response})}\n\n"

        except Exception as e:
            # Handle OpenAI errors with fallback
            fallback = "I apologize, I'm having trouble responding right now. Please try again."

            # Save fallback message
            await self.save_message(
                session_id=session_id,
                role=MessageRole.ASSISTANT,
                content=fallback
            )

            yield f"event: error\ndata: {json.dumps({'error': str(e), 'fallback_message': fallback})}\n\n"

# ═══════════════════════════════════════════════════════════════════════════

# app/services/voice_service.py

# ═══════════════════════════════════════════════════════════════════════════

import aiofiles
from pathlib import Path
from uuid import uuid4
from fastapi import UploadFile

from app.config import settings
from app.integrations.openai_client import openai_client
from app.services.chat_service import ChatService
from app.models import MessageType, MessageRole
from app.schemas.voice import VoiceMessageResponse
from app.schemas.message import MessageResponse

class VoiceService:
def **init**(self, chat_service: ChatService):
self.chat = chat_service

    async def save_audio_file(
        self,
        file: UploadFile,
        directory: str
    ) -> str:
        """Save uploaded audio file and return path"""
        # Generate unique filename
        extension = Path(file.filename).suffix or ".webm"
        filename = f"{uuid4()}{extension}"
        filepath = Path(directory) / filename

        # Save file
        async with aiofiles.open(filepath, "wb") as f:
            content = await file.read()
            await f.write(content)

        return str(filepath)

    async def save_tts_audio(self, audio_bytes: bytes) -> str:
        """Save TTS audio and return path"""
        filename = f"{uuid4()}.mp3"
        filepath = Path(settings.AUDIO_TTS_DIR) / filename

        async with aiofiles.open(filepath, "wb") as f:
            await f.write(audio_bytes)

        return str(filepath)

    def get_audio_url(self, filepath: str) -> str:
        """Convert filesystem path to API URL"""
        # audio_files/uploads/xxx.webm → /api/audio/uploads/xxx.webm
        relative_path = filepath.replace("audio_files/", "")
        return f"/api/audio/{relative_path}"

    async def process_voice_message(
        self,
        session_id: str,
        audio_file: UploadFile
    ) -> VoiceMessageResponse:
        """
        Process voice message:
        1. Save audio file
        2. Transcribe with Whisper
        3. Get chat response
        4. Generate TTS
        5. Save messages
        """
        # 1. Save user's audio file
        audio_path = await self.save_audio_file(
            audio_file,
            settings.AUDIO_UPLOAD_DIR
        )

        # 2. Transcribe audio
        try:
            transcript = await openai_client.speech_to_text(audio_path)
        except Exception as e:
            raise ValueError(f"Could not transcribe audio: {str(e)}")

        # 3. Get conversation history and agent
        history = await self.chat.get_conversation_history(session_id)
        agent = await self.chat.get_agent_for_session(session_id)

        # 4. Get chat response (non-streaming for voice)
        try:
            ai_response = await openai_client.chat_completion(
                system_prompt=agent.system_prompt,
                messages=history + [{"role": "user", "content": transcript}]
            )
        except Exception as e:
            ai_response = "I apologize, I'm having trouble responding right now."

        # 5. Generate TTS
        try:
            tts_audio = await openai_client.text_to_speech(ai_response)
            tts_path = await self.save_tts_audio(tts_audio)
            tts_url = self.get_audio_url(tts_path)
        except Exception as e:
            tts_url = None  # TTS failed, but we still have text response

        # 6. Save messages
        user_message = await self.chat.save_message(
            session_id=session_id,
            role=MessageRole.USER,
            content=transcript,
            message_type=MessageType.VOICE,
            audio_url=self.get_audio_url(audio_path)
        )

        ai_message = await self.chat.save_message(
            session_id=session_id,
            role=MessageRole.ASSISTANT,
            content=ai_response,
            message_type=MessageType.VOICE,
            tts_audio_url=tts_url
        )

        return VoiceMessageResponse(
            user_message=MessageResponse.model_validate(user_message),
            assistant_message=MessageResponse.model_validate(ai_message)
        )

# ═══════════════════════════════════════════════════════════════════════════

# app/routes/messages.py

# ═══════════════════════════════════════════════════════════════════════════

from fastapi import APIRouter, Depends, HTTPException, Query
from fastapi.responses import StreamingResponse
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from typing import Optional

from app.database.connection import get_db
from app.models import Message, Session
from app.schemas.message import MessageCreate, MessageResponse, MessageListResponse
from app.services.chat_service import ChatService

router = APIRouter()

@router.get("/sessions/{session_id}/messages", response_model=MessageListResponse)
async def get_messages(
session_id: str,
limit: int = Query(default=50, ge=1, le=100),
before: Optional[str] = Query(default=None),
db: AsyncSession = Depends(get_db)
):
"""Get messages for a session with pagination""" # Verify session exists
session = await db.get(Session, session_id)
if not session:
raise HTTPException(status_code=404, detail="Session not found")

    # Build query
    query = select(Message).where(Message.session_id == session_id)

    # Cursor-based pagination
    if before:
        before_msg = await db.get(Message, before)
        if before_msg:
            query = query.where(Message.created_at < before_msg.created_at)

    # Order and limit
    query = query.order_by(Message.created_at.desc()).limit(limit + 1)  # +1 to check has_more

    result = await db.execute(query)
    messages = list(result.scalars().all())

    # Check if there are more
    has_more = len(messages) > limit
    if has_more:
        messages = messages[:limit]

    # Reverse to chronological order
    messages.reverse()

    # Get total count
    count_query = select(func.count()).where(Message.session_id == session_id)
    total_result = await db.execute(count_query)
    total_count = total_result.scalar()

    return MessageListResponse(
        messages=[MessageResponse.model_validate(m) for m in messages],
        has_more=has_more,
        total_count=total_count
    )

@router.post("/sessions/{session_id}/messages")
async def send_message(
session_id: str,
message: MessageCreate,
db: AsyncSession = Depends(get_db)
):
"""Send a text message and stream the response via SSE""" # Verify session exists
session = await db.get(Session, session_id)
if not session:
raise HTTPException(status_code=404, detail="Session not found")

    chat_service = ChatService(db)

    return StreamingResponse(
        chat_service.send_message_stream(session_id, message.content),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no",  # Disable nginx buffering
        }
    )

# ═══════════════════════════════════════════════════════════════════════════

# app/routes/voice.py

# ═══════════════════════════════════════════════════════════════════════════

from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy.ext.asyncio import AsyncSession

from app.database.connection import get_db
from app.models import Session
from app.config import settings
from app.services.chat_service import ChatService
from app.services.voice_service import VoiceService
from app.schemas.voice import VoiceMessageResponse

router = APIRouter()

@router.post("/sessions/{session_id}/voice", response_model=VoiceMessageResponse)
async def send_voice_message(
session_id: str,
audio: UploadFile = File(...),
db: AsyncSession = Depends(get_db)
):
"""Send a voice message""" # Verify session exists
session = await db.get(Session, session_id)
if not session:
raise HTTPException(status_code=404, detail="Session not found")

    # Validate file type
    allowed_types = ["audio/webm", "audio/mp3", "audio/mpeg", "audio/wav", "audio/m4a"]
    if audio.content_type not in allowed_types:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid audio format. Allowed: {', '.join(allowed_types)}"
        )

    # Check file size (read content to check, then reset)
    content = await audio.read()
    if len(content) > settings.MAX_AUDIO_SIZE:
        raise HTTPException(
            status_code=400,
            detail=f"Audio file too large. Maximum size: {settings.MAX_AUDIO_SIZE // (1024*1024)}MB"
        )
    await audio.seek(0)  # Reset file pointer

    # Process voice message
    chat_service = ChatService(db)
    voice_service = VoiceService(chat_service)

    try:
        return await voice_service.process_voice_message(session_id, audio)
    except ValueError as e:
        raise HTTPException(status_code=422, detail=str(e))

8. Frontend Implementation Guide
   8.1 Key Components Implementation
   tsx
   // ═══════════════════════════════════════════════════════════════════════════
   // components/chat/MessageList.tsx
   // ═══════════════════════════════════════════════════════════════════════════
   import React, { useRef, useEffect } from 'react';
   import { Message } from '../../types';
   import { MessageBubble } from './MessageBubble';
   import { StreamingMessage } from './StreamingMessage';
   import { LoadingSpinner } from '../common';

interface MessageListProps {
messages: Message[];
loading: boolean;
streaming: boolean;
streamingContent: string;
hasMore: boolean;
onLoadMore: () => void;
}

export const MessageList: React.FC<MessageListProps> = ({
messages,
loading,
streaming,
streamingContent,
hasMore,
onLoadMore,
}) => {
const bottomRef = useRef<HTMLDivElement>(null);
const containerRef = useRef<HTMLDivElement>(null);

// Auto-scroll to bottom on new messages
useEffect(() => {
if (bottomRef.current) {
bottomRef.current.scrollIntoView({ behavior: 'smooth' });
}
}, [messages, streamingContent]);

// Group messages by date
const groupedMessages = groupMessagesByDate(messages);

return (

<div 
      ref={containerRef}
      className="flex-1 overflow-y-auto p-4 space-y-4"
    >
{/_ Load more button _/}
{hasMore && (
<div className="text-center">
<button
            onClick={onLoadMore}
            disabled={loading}
            className="text-sm text-blue-600 hover:text-blue-800 
                       disabled:text-gray-400"
          >
{loading ? 'Loading...' : '↑ Load earlier messages'}
</button>
</div>
)}

      {/* Messages grouped by date */}
      {Object.entries(groupedMessages).map(([date, msgs]) => (
        <div key={date}>
          {/* Date separator */}
          <div className="flex items-center justify-center my-4">
            <div className="bg-gray-200 text-gray-600 text-xs px-3 py-1 rounded-full">
              {date}
            </div>
          </div>

          {/* Messages for this date */}
          {msgs.map((message) => (
            <MessageBubble key={message.id} message={message} />
          ))}
        </div>
      ))}

      {/* Streaming message */}
      {streaming && (
        <StreamingMessage content={streamingContent} />
      )}

      {/* Loading indicator */}
      {loading && messages.length === 0 && (
        <div className="flex justify-center py-8">
          <LoadingSpinner />
        </div>
      )}

      {/* Scroll anchor */}
      <div ref={bottomRef} />
    </div>

);
};

function groupMessagesByDate(messages: Message[]): Record<string, Message[]> {
return messages.reduce((groups, message) => {
const date = new Date(message.created_at).toLocaleDateString();
if (!groups[date]) {
groups[date] = [];
}
groups[date].push(message);
return groups;
}, {} as Record<string, Message[]>);
}

// ═══════════════════════════════════════════════════════════════════════════
// components/chat/MessageBubble.tsx
// ═══════════════════════════════════════════════════════════════════════════
import React from 'react';
import { Message } from '../../types';
import { AudioPlayer } from '../voice/AudioPlayer';
import { formatTime } from '../../utils/formatters';

interface MessageBubbleProps {
message: Message;
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({ message }) => {
const isUser = message.role === 'user';
const isVoice = message.message_type === 'voice';

return (

<div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4`}>
<div
className={`max-w-[70%] rounded-2xl px-4 py-3 ${
          isUser
            ? 'bg-blue-600 text-white rounded-br-md'
            : 'bg-gray-100 text-gray-900 rounded-bl-md'
        }`} >
{/_ Voice indicator _/}
{isVoice && (
<div className="flex items-center gap-2 mb-2 text-xs opacity-70">
<span>🎤</span>
<span>Voice message</span>
</div>
)}

        {/* Message content */}
        <p className="whitespace-pre-wrap break-words">{message.content}</p>

        {/* Audio player for voice messages */}
        {isVoice && message.audio_url && isUser && (
          <div className="mt-2">
            <AudioPlayer
              url={message.audio_url}
              variant={isUser ? 'light' : 'dark'}
            />
          </div>
        )}

        {/* TTS audio for AI responses */}
        {isVoice && message.tts_audio_url && !isUser && (
          <div className="mt-2">
            <AudioPlayer
              url={message.tts_audio_url}
              variant="dark"
            />
          </div>
        )}

        {/* Timestamp */}
        <div
          className={`text-xs mt-2 ${
            isUser ? 'text-blue-200' : 'text-gray-500'
          }`}
        >
          {formatTime(message.created_at)}
        </div>
      </div>
    </div>

);
};

// ═══════════════════════════════════════════════════════════════════════════
// components/chat/ChatInput.tsx
// ═══════════════════════════════════════════════════════════════════════════
import React, { useState, useRef, useEffect } from 'react';
import { VoiceButton } from '../voice/VoiceButton';

interface ChatInputProps {
onSendMessage: (content: string) => void;
onSendVoice: (blob: Blob) => void;
disabled?: boolean;
streaming?: boolean;
}

export const ChatInput: React.FC<ChatInputProps> = ({
onSendMessage,
onSendVoice,
disabled = false,
streaming = false,
}) => {
const [message, setMessage] = useState('');
const textareaRef = useRef<HTMLTextAreaElement>(null);

// Auto-resize textarea
useEffect(() => {
const textarea = textareaRef.current;
if (textarea) {
textarea.style.height = 'auto';
textarea.style.height = `${Math.min(textarea.scrollHeight, 150)}px`;
}
}, [message]);

const handleSubmit = (e: React.FormEvent) => {
e.preventDefault();
if (message.trim() && !disabled && !streaming) {
onSendMessage(message.trim());
setMessage('');
}
};

const handleKeyDown = (e: React.KeyboardEvent) => {
if (e.key === 'Enter' && !e.shiftKey) {
e.preventDefault();
handleSubmit(e);
}
};

return (

<form 
      onSubmit={handleSubmit}
      className="border-t border-gray-200 p-4 bg-white"
    >
<div className="flex items-end gap-3">
{/_ Text input _/}
<div className="flex-1 relative">
<textarea
ref={textareaRef}
value={message}
onChange={(e) => setMessage(e.target.value)}
onKeyDown={handleKeyDown}
placeholder="Type a message..."
disabled={disabled || streaming}
rows={1}
className="w-full resize-none rounded-2xl border border-gray-300
px-4 py-3 pr-12 focus:outline-none focus:border-blue-500
disabled:bg-gray-100 disabled:text-gray-500"
/>
</div>

        {/* Voice button */}
        <VoiceButton
          onRecordingComplete={onSendVoice}
          disabled={disabled || streaming}
        />

        {/* Send button */}
        <button
          type="submit"
          disabled={!message.trim() || disabled || streaming}
          className="p-3 rounded-full bg-blue-600 text-white
                     hover:bg-blue-700 disabled:bg-gray-300
                     disabled:cursor-not-allowed transition-colors"
        >
          {streaming ? (
            <LoadingDots />
          ) : (
            <SendIcon className="w-5 h-5" />
          )}
        </button>
      </div>
    </form>

);
};

// ═══════════════════════════════════════════════════════════════════════════
// components/voice/VoiceButton.tsx
// ═══════════════════════════════════════════════════════════════════════════
import React, { useState } from 'react';
import { useVoiceRecorder } from '../../hooks/useVoiceRecorder';
import { RecordingIndicator } from './RecordingIndicator';

interface VoiceButtonProps {
onRecordingComplete: (blob: Blob) => void;
disabled?: boolean;
}

const MAX_DURATION = 120; // 2 minutes
const WARNING_THRESHOLD = 100; // 1:40

export const VoiceButton: React.FC<VoiceButtonProps> = ({
onRecordingComplete,
disabled = false,
}) => {
const {
isRecording,
isSupported,
duration,
error,
startRecording,
stopRecording,
cancelRecording,
} = useVoiceRecorder();

const handleMouseDown = async () => {
if (!disabled && isSupported) {
await startRecording();
}
};

const handleMouseUp = async () => {
if (isRecording) {
try {
const blob = await stopRecording();
onRecordingComplete(blob);
} catch (err) {
console.error('Recording failed:', err);
}
}
};

const handleMouseLeave = () => {
if (isRecording) {
cancelRecording();
}
};

if (!isSupported) {
return (
<button
        disabled
        className="p-3 rounded-full bg-gray-200 text-gray-400 cursor-not-allowed"
        title="Voice recording not supported"
      >
<MicOffIcon className="w-5 h-5" />
</button>
);
}

return (

<div className="relative">
{/_ Recording indicator _/}
{isRecording && (
<RecordingIndicator 
          duration={duration} 
          maxDuration={MAX_DURATION}
          warningThreshold={WARNING_THRESHOLD}
        />
)}

      {/* Record button */}
      <button
        type="button"
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseLeave}
        onTouchStart={handleMouseDown}
        onTouchEnd={handleMouseUp}
        disabled={disabled}
        className={`p-3 rounded-full transition-all ${
          isRecording
            ? 'bg-red-600 text-white scale-110 animate-pulse'
            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
        } disabled:opacity-50 disabled:cursor-not-allowed`}
        title={isRecording ? 'Release to send' : 'Hold to record'}
      >
        <MicIcon className="w-5 h-5" />
      </button>

      {/* Error message */}
      {error && (
        <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2
                        bg-red-100 text-red-700 text-xs px-2 py-1 rounded">
          {error}
        </div>
      )}
    </div>

);
};

// ═══════════════════════════════════════════════════════════════════════════
// components/voice/RecordingIndicator.tsx
// ═══════════════════════════════════════════════════════════════════════════
import React from 'react';

interface RecordingIndicatorProps {
duration: number;
maxDuration: number;
warningThreshold: number;
}

export const RecordingIndicator: React.FC<RecordingIndicatorProps> = ({
duration,
maxDuration,
warningThreshold,
}) => {
const remaining = maxDuration - duration;
const isWarning = duration >= warningThreshold;
const progress = (duration / maxDuration) \* 100;

const formatDuration = (seconds: number) => {
const mins = Math.floor(seconds / 60);
const secs = seconds % 60;
return `${mins}:${secs.toString().padStart(2, '0')}`;
};

return (

<div className="absolute bottom-full mb-3 left-1/2 -translate-x-1/2 
                    bg-white shadow-lg rounded-lg px-4 py-2 min-w-[120px]">
{/_ Recording indicator _/}
<div className="flex items-center gap-2 mb-2">
<span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
<span className="text-sm font-medium">Recording</span>
</div>

      {/* Duration */}
      <div className={`text-center text-lg font-mono ${
        isWarning ? 'text-orange-600' : 'text-gray-700'
      }`}>
        {formatDuration(duration)}
      </div>

      {/* Warning */}
      {isWarning && (
        <div className="text-xs text-orange-600 text-center mt-1">
          {remaining}s remaining
        </div>
      )}

      {/* Progress bar */}
      <div className="h-1 bg-gray-200 rounded-full mt-2 overflow-hidden">
        <div
          className={`h-full transition-all ${
            isWarning ? 'bg-orange-500' : 'bg-red-500'
          }`}
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>

);
};

// ═══════════════════════════════════════════════════════════════════════════
// components/voice/AudioPlayer.tsx
// ═══════════════════════════════════════════════════════════════════════════
import React, { useState, useRef, useEffect } from 'react';

interface AudioPlayerProps {
url: string;
variant?: 'light' | 'dark';
}

export const AudioPlayer: React.FC<AudioPlayerProps> = ({
url,
variant = 'dark'
}) => {
const [isPlaying, setIsPlaying] = useState(false);
const [progress, setProgress] = useState(0);
const [duration, setDuration] = useState(0);
const audioRef = useRef<HTMLAudioElement>(null);

useEffect(() => {
const audio = audioRef.current;
if (!audio) return;

    const handleTimeUpdate = () => {
      setProgress(audio.currentTime);
    };

    const handleLoadedMetadata = () => {
      setDuration(audio.duration);
    };

    const handleEnded = () => {
      setIsPlaying(false);
      setProgress(0);
    };

    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('ended', handleEnded);
    };

}, []);

const togglePlay = () => {
const audio = audioRef.current;
if (!audio) return;

    if (isPlaying) {
      audio.pause();
    } else {
      audio.play();
    }
    setIsPlaying(!isPlaying);

};

const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
const audio = audioRef.current;
if (!audio) return;

    const time = parseFloat(e.target.value);
    audio.currentTime = time;
    setProgress(time);

};

const formatTime = (seconds: number) => {
const mins = Math.floor(seconds / 60);
const secs = Math.floor(seconds % 60);
return `${mins}:${secs.toString().padStart(2, '0')}`;
};

const isLight = variant === 'light';

return (

<div className={`flex items-center gap-3 p-2 rounded-lg ${
      isLight ? 'bg-blue-500/20' : 'bg-gray-200'
    }`}>
<audio ref={audioRef} src={url} preload="metadata" />

      {/* Play/Pause button */}
      <button
        onClick={togglePlay}
        className={`w-8 h-8 rounded-full flex items-center justify-center ${
          isLight
            ? 'bg-white/30 hover:bg-white/40 text-white'
            : 'bg-gray-300 hover:bg-gray-400 text-gray-700'
        }`}
      >
        {isPlaying ? (
          <PauseIcon className="w-4 h-4" />
        ) : (
          <PlayIcon className="w-4 h-4" />
        )}
      </button>

      {/* Progress bar */}
      <div className="flex-1">
        <input
          type="range"
          min={0}
          max={duration || 100}
          value={progress}
          onChange={handleSeek}
          className={`w-full h-1 rounded-full appearance-none cursor-pointer ${
            isLight ? 'bg-white/30' : 'bg-gray-300'
          }`}
        />
      </div>

      {/* Time display */}
      <span className={`text-xs font-mono ${
        isLight ? 'text-white/80' : 'text-gray-600'
      }`}>
        {formatTime(progress)} / {formatTime(duration)}
      </span>
    </div>

);
};
8.2 SSE Integration for Streaming
typescript
// ═══════════════════════════════════════════════════════════════════════════
// services/messageService.ts - SSE Streaming
// ═══════════════════════════════════════════════════════════════════════════

interface StreamCallbacks {
onToken: (token: string) => void;
onDone: (message: Message) => void;
onError: (error: string, fallbackMessage?: Message) => void;
}

export async function streamMessage(
sessionId: string,
content: string,
callbacks: StreamCallbacks
): Promise<void> {
const { onToken, onDone, onError } = callbacks;

try {
const response = await fetch(
`${API_BASE_URL}/sessions/${sessionId}/messages`,
{
method: 'POST',
headers: {
'Content-Type': 'application/json',
'Accept': 'text/event-stream',
},
body: JSON.stringify({ content }),
}
);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const reader = response.body?.getReader();
    if (!reader) {
      throw new Error('No response body');
    }

    const decoder = new TextDecoder();
    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();

      if (done) break;

      buffer += decoder.decode(value, { stream: true });

      // Parse SSE events from buffer
      const lines = buffer.split('\n');
      buffer = lines.pop() || ''; // Keep incomplete line in buffer

      let currentEvent = '';
      let currentData = '';

      for (const line of lines) {
        if (line.startsWith('event: ')) {
          currentEvent = line.slice(7);
        } else if (line.startsWith('data: ')) {
          currentData = line.slice(6);

          // Process complete event
          if (currentEvent && currentData) {
            try {
              const data = JSON.parse(currentData);

              switch (currentEvent) {
                case 'token':
                  onToken(data.content);
                  break;

                case 'done':
                  onDone({
                    id: data.message_id,
                    content: data.full_content,
                    role: 'assistant',
                    message_type: 'text',
                    session_id: sessionId,
                    created_at: new Date().toISOString(),
                  });
                  break;

                case 'error':
                  onError(data.error, {
                    id: `fallback-${Date.now()}`,
                    content: data.fallback_message,
                    role: 'assistant',
                    message_type: 'text',
                    session_id: sessionId,
                    created_at: new Date().toISOString(),
                  });
                  break;
              }
            } catch (e) {
              console.error('Failed to parse SSE data:', e);
            }

            currentEvent = '';
            currentData = '';
          }
        }
      }
    }

} catch (error) {
onError(error instanceof Error ? error.message : 'Unknown error');
}
}

```

---

## 9. OpenAI Integration Guide

### 9.1 API Overview
```

┌─────────────────────────────────────────────────────────────────────────────┐
│ OPENAI APIS USED │
├─────────────────────────────────────────────────────────────────────────────┤
│ │
│ 1. CHAT COMPLETIONS API │
│ Endpoint: POST /v1/chat/completions │
│ Model: gpt-4 (or gpt-3.5-turbo for cost savings) │
│ Use: Generate AI agent responses │
│ Features: Streaming support, system prompts │
│ │
│ 2. WHISPER API (Speech-to-Text) │
│ Endpoint: POST /v1/audio/transcriptions │
│ Model: whisper-1 │
│ Use: Transcribe user voice recordings │
│ Supported formats: mp3, mp4, mpeg, mpga, m4a, wav, webm │
│ Max file size: 25 MB │
│ Cost: $0.006 per minute │
│ │
│ 3. TTS API (Text-to-Speech) │
│ Endpoint: POST /v1/audio/speech │
│ Models: tts-1 (fast), tts-1-hd (high quality) │
│ Voices: alloy, echo, fable, onyx, nova, shimmer │
│ Output formats: mp3, opus, aac, flac │
│ Use: Generate voice responses for AI agents │
│ │
└─────────────────────────────────────────────────────────────────────────────┘

```

### 9.2 Pricing Considerations
```

┌─────────────────────────────────────────────────────────────────────────────┐
│ COST ESTIMATION │
├─────────────────────────────────────────────────────────────────────────────┤
│ │
│ Per Voice Interaction (2 min audio max): │
│ ───────────────────────────────────────── │
│ Whisper STT: $0.006/min × 2 min = $0.012 │
│ GPT-4 Chat: ~500 tokens avg = ~$0.015 │
│ TTS Response: ~200 chars avg = ~$0.003 │
│ ───────────────────────────────────────── │
│ Total per voice interaction: ≈ $0.03 │
│ │
│ Per Text Interaction: │
│ ───────────────────────────────────────── │
│ GPT-4 Chat: ~500 tokens avg = ~$0.015 │
│ │
│ Cost Savings Options: │
│ • Use gpt-3.5-turbo instead of gpt-4 (10x cheaper) │
│ • Use tts-1 instead of tts-1-hd (same price, faster) │
│ • Implement response caching for common queries │
│ │
└─────────────────────────────────────────────────────────────────────────────┘

```

---

## 10. Error Handling Strategy

### 10.1 Error Categories & Responses
```

┌─────────────────────────────────────────────────────────────────────────────┐
│ ERROR HANDLING MATRIX │
├─────────────────────────────────────────────────────────────────────────────┤
│ │
│ OPENAI API ERRORS │
│ ═════════════════ │
│ ┌────────────────────┬─────────────────────────────────────────────────┐ │
│ │ Error Type │ Handling Strategy │ │
│ ├────────────────────┼─────────────────────────────────────────────────┤ │
│ │ Rate Limit (429) │ • Return fallback message │ │
│ │ │ • "I'm receiving many requests. Please wait." │ │
│ │ │ • Log for monitoring │ │
│ ├────────────────────┼─────────────────────────────────────────────────┤ │
│ │ API Error (500) │ • Return fallback message │ │
│ │ │ • "Having trouble responding. Please retry." │ │
│ │ │ • Log error details │ │
│ ├────────────────────┼─────────────────────────────────────────────────┤ │
│ │ Timeout │ • Return fallback after 30s │ │
│ │ │ • "Request timed out. Please try again." │ │
│ ├────────────────────┼─────────────────────────────────────────────────┤ │
│ │ Invalid API Key │ • Return 500 error │ │
│ │ │ • Log critical alert │ │
│ │ │ • "Service configuration error." │ │
│ └────────────────────┴─────────────────────────────────────────────────┘ │
│ │
│ VOICE PROCESSING ERRORS │
│ ════════════════════════ │
│ ┌────────────────────┬─────────────────────────────────────────────────┐ │
│ │ Error Type │ Handling Strategy │ │
│ ├────────────────────┼─────────────────────────────────────────────────┤ │
│ │ STT Failed │ • Return 422 error │ │
│ │ │ • "Couldn't understand audio. Try again." │ │
│ │ │ • Don't save message │ │
│ ├────────────────────┼─────────────────────────────────────────────────┤ │
│ │ TTS Failed │ • Still return text response │ │
│ │ │ • Set tts_audio_url to null │ │
│ │ │ • "Audio unavailable, text response below." │ │
│ ├────────────────────┼─────────────────────────────────────────────────┤ │
│ │ Invalid Audio │ • Return 400 error │ │
│ │ │ • "Invalid audio format or size." │ │
│ └────────────────────┴─────────────────────────────────────────────────┘ │
│ │
│ DATABASE ERRORS │
│ ═══════════════ │
│ ┌────────────────────┬─────────────────────────────────────────────────┐ │
│ │ Error Type │ Handling Strategy │ │
│ ├────────────────────┼─────────────────────────────────────────────────┤ │
│ │ Not Found │ • Return 404 │ │
│ │ │ • "Resource not found" │ │
│ ├────────────────────┼─────────────────────────────────────────────────┤ │
│ │ Validation │ • Return 422 │ │
│ │ │ • Field-level error messages │ │
│ ├────────────────────┼─────────────────────────────────────────────────┤ │
│ │ Connection Error │ • Return 500 │ │
│ │ │ • "Database unavailable" │ │
│ └────────────────────┴─────────────────────────────────────────────────┘ │
│ │
└─────────────────────────────────────────────────────────────────────────────┘
10.2 Fallback Messages
python

# utils/fallback_messages.py

FALLBACK_MESSAGES = {
"default": "I apologize, I'm having trouble responding right now. Please try again.",
"rate_limit": "I'm receiving too many requests at the moment. Please wait a few seconds and try again.",
"timeout": "The request took too long to process. Please try again with a shorter message.",
"stt_failed": "I couldn't understand the audio clearly. Please try speaking more clearly or use text instead.",
"tts_failed": "I couldn't generate audio for this response, but here's my text reply.",
"service_unavailable": "The service is temporarily unavailable. Please try again in a few minutes.",
}

def get_fallback_message(error_type: str = "default") -> str:
return FALLBACK_MESSAGES.get(error_type, FALLBACK_MESSAGES["default"]) 11. Testing Strategy
11.1 Backend Testing
python

# ═══════════════════════════════════════════════════════════════════════════

# tests/conftest.py

# ═══════════════════════════════════════════════════════════════════════════

import pytest
import pytest_asyncio
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker

from app.main import app
from app.models import Base
from app.database.connection import get_db

# Test database

TEST_DATABASE_URL = "sqlite+aiosqlite:///./test.db"

@pytest_asyncio.fixture
async def test_db():
engine = create_async_engine(TEST_DATABASE_URL, echo=False)

    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    async_session = async_sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)

    async with async_session() as session:
        yield session

    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)

@pytest_asyncio.fixture
async def client(test_db):
async def override_get_db():
yield test_db

    app.dependency_overrides[get_db] = override_get_db

    async with AsyncClient(app=app, base_url="http://test") as ac:
        yield ac

    app.dependency_overrides.clear()

# ═══════════════════════════════════════════════════════════════════════════

# tests/test_agents.py

# ═══════════════════════════════════════════════════════════════════════════

import pytest

@pytest.mark.asyncio
async def test_create_agent(client):
response = await client.post("/api/agents", json={
"name": "Test Agent",
"system_prompt": "You are a test agent."
})

    assert response.status_code == 201
    data = response.json()
    assert data["name"] == "Test Agent"
    assert data["system_prompt"] == "You are a test agent."
    assert "id" in data

@pytest.mark.asyncio
async def test_list_agents(client): # Create some agents first
await client.post("/api/agents", json={"name": "Agent 1", "system_prompt": "Prompt 1"})
await client.post("/api/agents", json={"name": "Agent 2", "system_prompt": "Prompt 2"})

    response = await client.get("/api/agents")

    assert response.status_code == 200
    data = response.json()
    assert data["total"] == 2
    assert len(data["agents"]) == 2

@pytest.mark.asyncio
async def test_get_agent_not_found(client):
response = await client.get("/api/agents/nonexistent-id")

    assert response.status_code == 404

@pytest.mark.asyncio
async def test_update_agent(client): # Create agent
create_response = await client.post("/api/agents", json={
"name": "Original Name",
"system_prompt": "Original prompt"
})
agent_id = create_response.json()["id"]

    # Update agent
    response = await client.put(f"/api/agents/{agent_id}", json={
        "name": "Updated Name"
    })

    assert response.status_code == 200
    data = response.json()
    assert data["name"] == "Updated Name"
    assert data["system_prompt"] == "Original prompt"  # Unchanged

@pytest.mark.asyncio
async def test_delete_agent(client): # Create agent
create_response = await client.post("/api/agents", json={
"name": "To Delete",
"system_prompt": "Will be deleted"
})
agent_id = create_response.json()["id"]

    # Delete
    response = await client.delete(f"/api/agents/{agent_id}")
    assert response.status_code == 204

    # Verify deleted
    get_response = await client.get(f"/api/agents/{agent_id}")
    assert get_response.status_code == 404

11.2 Frontend Testing
typescript
// ═══════════════════════════════════════════════════════════════════════════
// tests/components/MessageBubble.test.tsx
// ═══════════════════════════════════════════════════════════════════════════
import { render, screen } from '@testing-library/react';
import { MessageBubble } from '../../src/components/chat/MessageBubble';

describe('MessageBubble', () => {
const userMessage = {
id: '1',
session_id: 'session-1',
role: 'user' as const,
content: 'Hello, how are you?',
message_type: 'text' as const,
created_at: '2026-01-15T10:00:00Z',
};

const assistantMessage = {
id: '2',
session_id: 'session-1',
role: 'assistant' as const,
content: 'I am doing well, thank you!',
message_type: 'text' as const,
created_at: '2026-01-15T10:00:05Z',
};

it('renders user message correctly', () => {
render(<MessageBubble message={userMessage} />);

    expect(screen.getByText('Hello, how are you?')).toBeInTheDocument();

});

it('renders assistant message correctly', () => {
render(<MessageBubble message={assistantMessage} />);

    expect(screen.getByText('I am doing well, thank you!')).toBeInTheDocument();

});

it('shows voice indicator for voice messages', () => {
const voiceMessage = {
...userMessage,
message_type: 'voice' as const,
audio_url: '/api/audio/test.webm',
};

    render(<MessageBubble message={voiceMessage} />);

    expect(screen.getByText('Voice message')).toBeInTheDocument();

});

it('renders audio player for voice messages with audio_url', () => {
const voiceMessage = {
...userMessage,
message_type: 'voice' as const,
audio_url: '/api/audio/test.webm',
};

    render(<MessageBubble message={voiceMessage} />);

    // Audio player should be present
    expect(screen.getByRole('button')).toBeInTheDocument(); // Play button

});
});

// ═══════════════════════════════════════════════════════════════════════════
// tests/hooks/useVoiceRecorder.test.ts
// ═══════════════════════════════════════════════════════════════════════════
import { renderHook, act } from '@testing-library/react';
import { useVoiceRecorder } from '../../src/hooks/useVoiceRecorder';

// Mock MediaRecorder
const mockMediaRecorder = {
start: jest.fn(),
stop: jest.fn(),
ondataavailable: null as any,
onstop: null as any,
state: 'inactive',
stream: {
getTracks: () => [{ stop: jest.fn() }],
},
};

const mockGetUserMedia = jest.fn().mockResolvedValue({
getTracks: () => [{ stop: jest.fn() }],
});

beforeAll(() => {
global.MediaRecorder = jest.fn().mockImplementation(() => mockMediaRecorder);
global.navigator.mediaDevices = {
getUserMedia: mockGetUserMedia,
} as any;
});

describe('useVoiceRecorder', () => {
it('should initialize with correct default values', () => {
const { result } = renderHook(() => useVoiceRecorder());

    expect(result.current.isRecording).toBe(false);
    expect(result.current.isSupported).toBe(true);
    expect(result.current.duration).toBe(0);
    expect(result.current.error).toBeNull();

});

it('should start recording when startRecording is called', async () => {
const { result } = renderHook(() => useVoiceRecorder());

    await act(async () => {
      await result.current.startRecording();
    });

    expect(mockGetUserMedia).toHaveBeenCalledWith({ audio: true });
    expect(result.current.isRecording).toBe(true);

});

it('should handle microphone permission denied', async () => {
mockGetUserMedia.mockRejectedValueOnce(new Error('Permission denied'));

    const { result } = renderHook(() => useVoiceRecorder());

    await act(async () => {
      await result.current.startRecording();
    });

    expect(result.current.error).toBe('Microphone access denied');
    expect(result.current.isRecording).toBe(false);

});
}); 12. Deployment Guide
12.1 Docker Configuration
dockerfile

# ═══════════════════════════════════════════════════════════════════════════

# backend/Dockerfile

# ═══════════════════════════════════════════════════════════════════════════

FROM python:3.11-slim

WORKDIR /app

# Install system dependencies

RUN apt-get update && apt-get install -y \
 gcc \
 && rm -rf /var/lib/apt/lists/\*

# Install Python dependencies

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code

COPY . .

# Create audio directories

RUN mkdir -p audio_files/uploads audio_files/tts

# Expose port

EXPOSE 8000

# Run application

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]

# ═══════════════════════════════════════════════════════════════════════════

# frontend/Dockerfile

# ═══════════════════════════════════════════════════════════════════════════

# Build stage

FROM node:18-alpine AS build

WORKDIR /app

COPY package\*.json ./
RUN npm ci

COPY . .
RUN npm run build

# Production stage

FROM nginx:alpine

COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]

# ═══════════════════════════════════════════════════════════════════════════

# docker-compose.yml

# ═══════════════════════════════════════════════════════════════════════════

version: '3.8'

services:
backend:
build:
context: ./backend
dockerfile: Dockerfile
ports: - "8000:8000"
environment: - OPENAI_API_KEY=${OPENAI_API_KEY} - DATABASE_URL=sqlite+aiosqlite:///./app.db - DEBUG=false
volumes: - backend-data:/app/audio_files - sqlite-data:/app
restart: unless-stopped

frontend:
build:
context: ./frontend
dockerfile: Dockerfile
ports: - "3000:80"
depends_on: - backend
environment: - VITE_API_URL=http://localhost:8000/api
restart: unless-stopped

volumes:
backend-data:
sqlite-data:
12.2 Environment Configuration
bash

# ═══════════════════════════════════════════════════════════════════════════

# backend/.env.example

# ═══════════════════════════════════════════════════════════════════════════

# App Configuration

APP_NAME="AI Agent Platform"
APP_VERSION="1.0.0"
DEBUG=true

# Database

DATABASE_URL="sqlite+aiosqlite:///./app.db"

# OpenAI API

OPENAI_API_KEY="sk-your-api-key-here"
OPENAI_MODEL="gpt-4"
OPENAI_TTS_MODEL="tts-1"
OPENAI_TTS_VOICE="alloy"
OPENAI_WHISPER_MODEL="whisper-1"

# Audio Configuration

MAX_AUDIO_DURATION=120
MAX_AUDIO_SIZE=5242880
AUDIO_UPLOAD_DIR="audio_files/uploads"
AUDIO_TTS_DIR="audio_files/tts"

# CORS

CORS_ORIGINS=["http://localhost:3000","http://localhost:5173"]

# ═══════════════════════════════════════════════════════════════════════════

# frontend/.env.example

# ═══════════════════════════════════════════════════════════════════════════

VITE_API_URL=http://localhost:8000/api
VITE_MAX_RECORDING_DURATION=120 13. Implementation Phases
Phase-by-Phase Breakdown
┌─────────────────────────────────────────────────────────────────────────────┐
│ IMPLEMENTATION PHASES │
├─────────────────────────────────────────────────────────────────────────────┤
│ │
│ ══════════════════════════════════════════════════════════════════════ │
│ PHASE 1: BACKEND FOUNDATION (Day 1) │
│ ══════════════════════════════════════════════════════════════════════ │
│ │
│ Tasks: │
│ ☐ Project setup (FastAPI, folder structure) │
│ ☐ Configuration management (pydantic-settings) │
│ ☐ Database models (Agent, Session, Message) │
│ ☐ Database connection (async SQLAlchemy) │
│ ☐ Agent CRUD endpoints │
│ ☐ Session CRUD endpoints │
│ ☐ Basic health check endpoint │
│ ☐ Swagger documentation setup │
│ │
│ Deliverables: │
│ • Working API with agents and sessions endpoints │
│ • Database models and migrations │
│ • API documentation at /api/docs │
│ │
│ ══════════════════════════════════════════════════════════════════════ │
│ PHASE 2: CHAT FUNCTIONALITY (Day 2) │
│ ══════════════════════════════════════════════════════════════════════ │
│ │
│ Tasks: │
│ ☐ OpenAI client integration │
│ ☐ Chat completion (non-streaming) │
│ ☐ Chat completion (streaming with SSE) │
│ ☐ Message endpoints (create, list with pagination) │
│ ☐ Conversation history management │
│ ☐ Auto-generate session titles │
│ ☐ Error handling with fallback messages │
│ │
│ Deliverables: │
│ • Working chat API with streaming │
│ • Message storage and retrieval │
│ • Error handling for OpenAI failures │
│ │
│ ══════════════════════════════════════════════════════════════════════ │
│ PHASE 3: VOICE FUNCTIONALITY (Day 3) │
│ ══════════════════════════════════════════════════════════════════════ │
│ │
│ Tasks: │
│ ☐ Whisper STT integration │
│ ☐ TTS integration │
│ ☐ Audio file storage (uploads and TTS) │
│ ☐ Voice message endpoint │
│ ☐ Audio file serving endpoint │
│ ☐ Audio validation (size, format, duration) │
│ ☐ Voice error handling │
│ │
│ Deliverables: │
│ • Complete voice processing pipeline │
│ • Audio file storage and retrieval │
│ • Backend tests for all endpoints │
│ │
│ ══════════════════════════════════════════════════════════════════════ │
│ PHASE 4: FRONTEND FOUNDATION (Day 4) │
│ ══════════════════════════════════════════════════════════════════════ │
│ │
│ Tasks: │
│ ☐ React + TypeScript + Vite setup │
│ ☐ Tailwind CSS configuration │
│ ☐ API service layer (axios) │
│ ☐ State management (Context + Reducer) │
│ ☐ Layout components (Sidebar, MainContent) │
│ ☐ Agent management UI (list, create, edit, delete) │
│
Continue

11:07 PM

Orchestrated comprehensive project phases and synthesis
│ ☐ Session list UI │
│ ☐ Common components (Button, Input, Modal, etc.) │
│ │
│ Deliverables: │
│ • Working frontend with agent management │
│ • Session selection and creation │
│ • Responsive sidebar layout │
│ │
│ ══════════════════════════════════════════════════════════════════════ │
│ PHASE 5: CHAT UI (Day 5) │
│ ══════════════════════════════════════════════════════════════════════ │
│ │
│ Tasks: │
│ ☐ Chat container component │
│ ☐ Message list with auto-scroll │
│ ☐ Message bubble component │
│ ☐ Chat input component │
│ ☐ SSE integration for streaming │
│ ☐ Streaming message display │
│ ☐ Load more (pagination) │
│ ☐ Date separators │
│ │
│ Deliverables: │
│ • Complete chat interface │
│ • Real-time streaming display │
│ • Message history with pagination │
│ │
│ ══════════════════════════════════════════════════════════════════════ │
│ PHASE 6: VOICE UI + POLISH (Day 6) │
│ ══════════════════════════════════════════════════════════════════════ │
│ │
│ Tasks: │
│ ☐ Voice recorder hook │
│ ☐ Push-to-talk button │
│ ☐ Recording indicator with countdown │
│ ☐ Audio player component │
│ ☐ Voice message integration in chat │
│ ☐ Loading states and animations │
│ ☐ Error handling and display │
│ ☐ Responsive design tweaks │
│ ☐ Empty states │
│ │
│ Deliverables: │
│ • Complete voice interaction UI │
│ • Polished user experience │
│ • Responsive across devices │
│ │
│ ══════════════════════════════════════════════════════════════════════ │
│ PHASE 7: TESTING + DOCUMENTATION + DEPLOYMENT (Day 7) │
│ ══════════════════════════════════════════════════════════════════════ │
│ │
│ Tasks: │
│ ☐ Backend unit tests (pytest) │
│ ☐ Frontend component tests (Jest + RTL) │
│ ☐ Integration tests │
│ ☐ Docker configuration │
│ ☐ docker-compose setup │
│ ☐ README documentation │
│ ☐ Postman collection │
│ ☐ Demo video recording │
│ │
│ Deliverables: │
│ • Test suite with good coverage │
│ • Docker deployment ready │
│ • Complete documentation │
│ • Demo video │
│ │
└─────────────────────────────────────────────────────────────────────────────┘

---

## Quick Reference Cheat Sheet

### API Endpoints Quick Reference

| Method | Endpoint                      | Description     |
| ------ | ----------------------------- | --------------- |
| GET    | `/api/agents`                 | List all agents |
| POST   | `/api/agents`                 | Create agent    |
| GET    | `/api/agents/{id}`            | Get agent       |
| PUT    | `/api/agents/{id}`            | Update agent    |
| DELETE | `/api/agents/{id}`            | Delete agent    |
| GET    | `/api/agents/{id}/sessions`   | List sessions   |
| POST   | `/api/agents/{id}/sessions`   | Create session  |
| GET    | `/api/sessions/{id}`          | Get session     |
| DELETE | `/api/sessions/{id}`          | Delete session  |
| GET    | `/api/sessions/{id}/messages` | Get messages    |
| POST   | `/api/sessions/{id}/messages` | Send text (SSE) |
| POST   | `/api/sessions/{id}/voice`    | Send voice      |
| GET    | `/api/audio/{path}`           | Get audio file  |
| GET    | `/api/health`                 | Health check    |

### Key Configuration Values

| Setting            | Value       | Notes             |
| ------------------ | ----------- | ----------------- |
| Max audio duration | 120 seconds | 2 minutes         |
| Max audio size     | 5 MB        | ~480KB typical    |
| Messages per page  | 50          | Cursor pagination |
| Recording format   | WebM        | Browser native    |
| TTS format         | MP3         | OpenAI default    |
| OpenAI model       | gpt-4       | Configurable      |
| TTS voice          | alloy       | 6 options         |

### Commands Quick Reference

```bash
# Backend
cd backend
pip install -r requirements.txt
uvicorn app.main:app --reload

# Frontend
cd frontend
npm install
npm run dev

# Docker
docker-compose up --build

# Tests
pytest                          # Backend
npm test                        # Frontend
```

---
