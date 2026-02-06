# Setup Guide

## Quick Fix for Current Issues

### Issue 1: OpenAI API Key Not Set

**Problem**: Chat and voice messages returning fallback messages like "I apologize, I'm having trouble responding right now."

**Solution**:

1. Create a `.env` file in the root directory:
   ```bash
   cp .env.example .env
   ```

2. Get your OpenAI API key from: https://platform.openai.com/api-keys

3. Edit `.env` and add your API key:
   ```
   OPENAI_API_KEY=sk-proj-xxxxxxxxxxxxxxxxxxxxxxxx
   ```

4. Restart Docker containers:
   ```bash
   docker-compose down
   docker-compose up --build
   ```

5. **Verify the API key is loaded** - Check the logs, you should see:
   ```
   INFO - OpenAI API key is configured
   ```

   If you see this error instead, the API key is not being loaded:
   ```
   CRITICAL: OPENAI_API_KEY is not set!
   ```

### Issue 2: Session Timestamps

**Note**: The backend uses UTC timestamps by default. This is the standard for APIs to avoid timezone confusion. The frontend should convert these to local time for display.

## Complete Setup Instructions

### Prerequisites

- Docker and Docker Compose installed
- OpenAI API key (Required for Chat, Voice, RAG, and Prompt Refinement)
    - Get from https://platform.openai.com/api-keys

### Step 1: Configure Environment

```bash
# In the project root directory
cp .env.example .env
```

Edit `.env` and set your API key:
```
OPENAI_API_KEY=your-actual-api-key-here
```

### Step 2: Start the Application

```bash
docker-compose up --build
```

### Step 3: Verify Everything Works

1. **Check logs** - Look for:
   - `INFO - OpenAI API key is configured` ✓
   - `INFO - Database initialized` ✓
   - `INFO:     Uvicorn running on http://0.0.0.0:8000` ✓

2. **Test the API** - Visit http://localhost:8000/docs

3. **Test the Frontend** - Visit http://localhost:3000

4. **Create an agent and send a message** - You should get real AI responses, not fallback messages

## Debugging

### View Logs

```bash
# View all logs
docker-compose logs

# View backend logs only
docker-compose logs backend

# Follow logs in real-time
docker-compose logs -f backend
```

### Common Issues

#### "Authentication Error" from OpenAI

**Cause**: Invalid or missing API key

**Solution**:
1. Verify your API key is correct at https://platform.openai.com/api-keys
2. Check that your OpenAI account has credits
3. Ensure the key has the correct permissions

#### Still getting fallback messages after setting API key

**Cause**: Docker is using cached environment variables

**Solution**:
```bash
docker-compose down
docker-compose up --build
```

#### Chat works but voice doesn't work

**Cause**: Check the backend logs for specific errors:
- STT failed - Audio format issue or Whisper API error
- TTS failed - TTS API error (may still return text)
- Chat completion failed - OpenAI API error

**Solution**: Check backend logs with `docker-compose logs backend | grep ERROR`

## Development Setup (Without Docker)

### Backend

```bash
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Create .env file
cp .env.example .env
# Edit .env and add your OPENAI_API_KEY

# Run server
uvicorn app.main:app --reload
```

### Frontend

```bash
cd frontend

# Install dependencies
npm install

# Create .env file
echo "VITE_API_URL=http://localhost:8000/api" > .env

# Run development server
npm run dev
```

## Testing

### Run Backend Tests

```bash
cd backend
pytest -v

# With coverage
pytest --cov=app
```

### Run Frontend Tests

```bash
cd frontend
npm test

# With UI
npm run test:ui
```

## API Documentation

Once running, access:
- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

## Logging

All errors are now logged with full details:

```
2026-02-06 13:57:43 - app.services.chat_service - ERROR - Error in chat stream for session abc123: AuthenticationError: Incorrect API key provided
```

This makes debugging much easier!
