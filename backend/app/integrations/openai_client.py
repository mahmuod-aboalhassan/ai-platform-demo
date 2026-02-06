from typing import AsyncGenerator, List, Dict, Optional
from pathlib import Path

from openai import AsyncOpenAI

from app.config import settings


class OpenAIClient:
    """Client for OpenAI API interactions."""

    def __init__(self):
        self.client = AsyncOpenAI(api_key=settings.OPENAI_API_KEY)
        self.model = settings.OPENAI_MODEL
        self.tts_model = settings.OPENAI_TTS_MODEL
        self.tts_voice = settings.OPENAI_TTS_VOICE
        self.whisper_model = settings.OPENAI_WHISPER_MODEL

    async def chat_stream(
        self,
        system_prompt: str,
        messages: List[Dict[str, str]],
    ) -> AsyncGenerator[str, None]:
        """Stream chat completion tokens."""
        response = await self.client.chat.completions.create(
            model=self.model,
            messages=[
                {"role": "system", "content": system_prompt},
                *messages,
            ],
            stream=True,
        )

        async for chunk in response:
            if chunk.choices[0].delta.content:
                yield chunk.choices[0].delta.content

    async def chat_completion(
        self,
        system_prompt: str,
        messages: List[Dict[str, str]],
    ) -> str:
        """Get non-streaming chat completion."""
        response = await self.client.chat.completions.create(
            model=self.model,
            messages=[
                {"role": "system", "content": system_prompt},
                *messages,
            ],
            stream=False,
        )

        return response.choices[0].message.content or ""

    async def speech_to_text(self, audio_path: Path) -> str:
        """Transcribe audio to text using Whisper."""
        with open(audio_path, "rb") as audio_file:
            response = await self.client.audio.transcriptions.create(
                model=self.whisper_model,
                file=audio_file,
            )

        return response.text

    async def text_to_speech(self, text: str) -> bytes:
        """Convert text to speech."""
        response = await self.client.audio.speech.create(
            model=self.tts_model,
            voice=self.tts_voice,
            input=text,
        )

        return response.content


# Singleton instance
openai_client = OpenAIClient()
