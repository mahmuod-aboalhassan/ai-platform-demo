import { describe, it, expect, vi, beforeEach } from 'vitest';
import { voiceService } from './voiceService';
import api from './api';

// Mock the api module
vi.mock('./api', () => ({
  default: {
    post: vi.fn(),
  },
}));

describe('voiceService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('sendVoiceMessage', () => {
    it('sends voice message with correct format', async () => {
      const mockResponse = {
        data: {
          user_message: {
            id: 'm1',
            session_id: 's1',
            role: 'user',
            content: 'Transcribed text',
            message_type: 'voice',
            audio_url: '/api/audio/uploads/recording.webm',
            tts_audio_url: null,
            created_at: '2024-01-01T00:00:00Z',
          },
          assistant_message: {
            id: 'm2',
            session_id: 's1',
            role: 'assistant',
            content: 'AI response',
            message_type: 'voice',
            audio_url: null,
            tts_audio_url: '/api/audio/tts/response.mp3',
            created_at: '2024-01-01T00:00:01Z',
          },
        },
      };

      (api.post as ReturnType<typeof vi.fn>).mockResolvedValue(mockResponse);

      const audioBlob = new Blob(['audio data'], { type: 'audio/webm' });
      const result = await voiceService.sendVoiceMessage('s1', audioBlob);

      expect(api.post).toHaveBeenCalledWith(
        '/sessions/s1/voice',
        expect.any(FormData),
        expect.objectContaining({
          headers: { 'Content-Type': 'multipart/form-data' },
        })
      );

      expect(result.user_message.content).toBe('Transcribed text');
      expect(result.assistant_message.content).toBe('AI response');
      expect(result.assistant_message.tts_audio_url).toBe('/api/audio/tts/response.mp3');
    });

    it('throws error on API failure', async () => {
      (api.post as ReturnType<typeof vi.fn>).mockRejectedValue(new Error('Network error'));

      const audioBlob = new Blob(['audio data'], { type: 'audio/webm' });

      await expect(voiceService.sendVoiceMessage('s1', audioBlob)).rejects.toThrow('Network error');
    });
  });

  describe('getAudioUrl', () => {
    it('returns full URL for API paths', () => {
      const path = '/api/audio/uploads/test.webm';
      const url = voiceService.getAudioUrl(path);
      expect(url).toBe('http://localhost:8000/api/audio/uploads/test.webm');
    });

    it('returns same URL for absolute URLs', () => {
      const path = 'https://example.com/audio/test.mp3';
      const url = voiceService.getAudioUrl(path);
      expect(url).toBe(path);
    });

    it('handles TTS audio paths', () => {
      const path = '/api/audio/tts/response.mp3';
      const url = voiceService.getAudioUrl(path);
      expect(url).toBe('http://localhost:8000/api/audio/tts/response.mp3');
    });
  });
});
