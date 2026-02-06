import api from './api';
import type { VoiceMessageResponse } from '../types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

export const voiceService = {
  async sendVoiceMessage(sessionId: string, audioBlob: Blob): Promise<VoiceMessageResponse> {
    const formData = new FormData();
    formData.append('audio', audioBlob, 'recording.webm');

    const response = await api.post<VoiceMessageResponse>(
      `/sessions/${sessionId}/voice`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return response.data;
  },

  getAudioUrl(path: string): string {
    if (path.startsWith('http')) {
      return path;
    }
    // Path is like /api/audio/uploads/xxx.webm
    return `${API_URL.replace('/api', '')}${path}`;
  },
};
