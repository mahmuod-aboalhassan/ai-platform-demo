# AI Agent Platform

A AI Agent Platform that enables users to create and manage AI agents with custom personalities, have text conversations with real-time streaming responses, and use voice communication.

## Features

- **Agent Management**: Create, update, and delete AI agents with custom system prompts
- **AI Prompt Refinement**: Auto-generate professional system prompts from simple descriptions
- **Knowledge Base**: Agent-specific document storage for RAG (Retrieval-Augmented Generation) context
- **Session Management**: Multiple chat sessions per agent
- **Text Chat**: Real-time streaming responses via Server-Sent Events (SSE)
- **Voice Interaction**: Speech-to-Text (Whisper) → AI → Text-to-Speech conversation
- **Message History**: Pagination support for long conversations
- **Auto-generated Session Titles**: Based on the first message

## Demo

## ## Watch the Platform in Action
[![Watch the demo](https://cdn.loom.com/sessions/thumbnails/0ecdec25eb0547f0a5b74f2ef001a631-with-play.gif)](https://www.loom.com/share/0ecdec25eb0547f0a5b74f2ef001a631)
[View the full demo on Loom →](https://www.loom.com/share/0ecdec25eb0547f0a5b74f2ef001a631)

## Tech Stack

### Backend

- Python 3.10+
- FastAPI (async)
- SQLAlchemy (async ORM)
- SQLite database
- OpenAI API (GPT-4o-mini, Whisper, TTS)

### Frontend

- React 18+ with TypeScript
- Tailwind CSS
- React Context + useReducer

### DevOps

- Docker & docker-compose

## Quick Start

### Prerequisites

- Python 3.10+
- Node.js 18+
- OpenAI API key

### Backend Setup

1. Navigate to the backend directory:

   ```bash
   cd backend
   ```

2. Create a virtual environment:

   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. Install dependencies:

   ```bash
   pip install -r requirements.txt
   ```

4. Create `.env` file from example:

   ```bash
   cp .env.example .env
   ```

5. Add your OpenAI API key to `.env`:

   ```
   OPENAI_API_KEY=your-api-key-here
   ```

6. Run the server:
   ```bash
   uvicorn app.main:app --reload
   ```

The API will be available at `http://localhost:8000`

### Frontend Setup

1. Navigate to the frontend directory:

   ```bash
   cd frontend
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Create `.env` file:

   ```
   VITE_API_URL=http://localhost:8000/api
   ```

4. Run the development server:
   ```bash
   npm run dev
   ```

The frontend will be available at `http://localhost:5173`

### Docker Setup

1. Create a `.env` file in the root directory:

   ```
   OPENAI_API_KEY=your-api-key-here
   ```

2. Run with Docker Compose:
   ```bash
   docker-compose up --build
   ```

- Backend: `http://localhost:8000`
- Frontend: `http://localhost:3000`

## API Documentation

Once the backend is running, visit `http://localhost:8000/docs` for the interactive Swagger documentation.

### API Endpoints

#### Agents

- `GET /api/agents` - List all agents
- `POST /api/agents` - Create new agent
- `POST /api/agents/refine` - Refine system prompt using AI
- `GET /api/agents/{id}` - Get agent by ID
- `PUT /api/agents/{id}` - Update agent
- `DELETE /api/agents/{id}` - Delete agent
- `GET /api/agents/{id}/documents` - List agent documents
- `POST /api/agents/{id}/documents` - Upload document

#### Sessions

- `GET /api/agents/{id}/sessions` - List sessions for agent
- `POST /api/agents/{id}/sessions` - Create new session
- `GET /api/sessions/{id}` - Get session with messages
- `DELETE /api/sessions/{id}` - Delete session

#### Messages

- `GET /api/sessions/{id}/messages` - Get messages (paginated)
- `POST /api/sessions/{id}/messages` - Send text message (SSE stream)

#### Voice

- `POST /api/sessions/{id}/voice` - Send voice message
- `GET /api/audio/{folder}/{filename}` - Serve audio file

#### Health

- `GET /api/health` - Health check

## Project Structure

```
.
├── backend/
│   ├── app/
│   │   ├── main.py              # FastAPI application
│   │   ├── config.py            # Settings
│   │   ├── models/              # SQLAlchemy models
│   │   ├── schemas/             # Pydantic schemas
│   │   ├── routes/              # API endpoints
│   │   ├── services/            # Business logic
│   │   ├── integrations/        # OpenAI client
│   │   └── database/            # Database connection
│   ├── tests/                   # Backend tests
│   ├── audio_files/             # Stored audio
│   ├── requirements.txt
│   └── Dockerfile
├── frontend/
│   ├── src/
│   │   ├── components/          # React components
│   │   ├── hooks/               # Custom hooks
│   │   ├── context/             # State management
│   │   ├── services/            # API services
│   │   ├── test/                # Test setup
│   │   └── types/               # TypeScript types
│   ├── package.json
│   └── Dockerfile
├── postman/
│   └── collection.json          # Postman API collection
├── docker-compose.yml
└── README.md
```

## Running Tests

### Backend Tests

```bash
cd backend
pytest
```

To run with verbose output:

```bash
pytest -v
```

To run with coverage:

```bash
pytest --cov=app
```

### Frontend Tests

```bash
cd frontend
npm test
```

To run with UI:

```bash
npm run test:ui
```

To run with coverage:

```bash
npm run test:coverage
```

## Postman Collection

A Postman collection is included for API testing at `postman/collection.json`.

### Importing the Collection

1. Open Postman
2. Click "Import" button
3. Select the `postman/collection.json` file
4. The collection includes:
   - All API endpoints with examples
   - Test scripts for validation
   - Environment variables for easy configuration
   - Complete workflow examples for text and voice chat

### Using the Collection

1. Set the `baseUrl` variable to your API URL (default: `http://localhost:8000`)
2. Run the "Create Agent" request first to get an `agentId`
3. Run the "Create Session" request to get a `sessionId`
4. Use the message and voice endpoints with the session

## Voice Interaction Flow

The voice interaction follows this pipeline:

1. **Client Recording**: User holds the microphone button to record audio (WebM format)
2. **Upload**: Audio file is sent to `POST /api/sessions/{id}/voice`
3. **Speech-to-Text**: Backend uses OpenAI Whisper to transcribe the audio
4. **Chat Response**: Transcribed text is sent to GPT-4o-mini for response
5. **Text-to-Speech**: Response is converted to audio using OpenAI TTS
6. **Response**: Both user message (with audio_url) and assistant message (with tts_audio_url) are returned
7. **Playback**: Client can play the AI's voice response

### Audio File Storage

- User uploads: `audio_files/uploads/`
- TTS responses: `audio_files/tts/`
- Files are served via `GET /api/audio/{folder}/{filename}`

## Environment Variables

### Backend (.env)

```
OPENAI_API_KEY=your-api-key-here
DATABASE_URL=sqlite+aiosqlite:///./ai_agent.db
DEBUG=false
```

### Frontend (.env)

```
VITE_API_URL=http://localhost:8000/api
```

## License

MIT
