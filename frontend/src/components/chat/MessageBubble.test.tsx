import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MessageBubble } from './MessageBubble';
import type { Message } from '../../types';

// Mock the useAudioPlayer hook
vi.mock('../../hooks/useAudioPlayer', () => ({
  useAudioPlayer: () => ({
    isPlaying: false,
    currentUrl: null,
    toggle: vi.fn(),
  }),
}));

const mockUserMessage: Message = {
  id: 'm1',
  session_id: 's1',
  role: 'user',
  content: 'Hello, how are you?',
  message_type: 'text',
  audio_url: null,
  tts_audio_url: null,
  created_at: '2024-01-01T12:00:00Z',
};

const mockAssistantMessage: Message = {
  id: 'm2',
  session_id: 's1',
  role: 'assistant',
  content: 'I am doing well, thank you!',
  message_type: 'text',
  audio_url: null,
  tts_audio_url: null,
  created_at: '2024-01-01T12:01:00Z',
};

const mockVoiceUserMessage: Message = {
  id: 'm3',
  session_id: 's1',
  role: 'user',
  content: 'This is a voice message',
  message_type: 'voice',
  audio_url: '/api/audio/uploads/test.webm',
  tts_audio_url: null,
  created_at: '2024-01-01T12:02:00Z',
};

const mockVoiceAssistantMessage: Message = {
  id: 'm4',
  session_id: 's1',
  role: 'assistant',
  content: 'This is an AI voice response',
  message_type: 'voice',
  audio_url: null,
  tts_audio_url: '/api/audio/tts/response.mp3',
  created_at: '2024-01-01T12:03:00Z',
};

describe('MessageBubble', () => {
  it('renders user message content', () => {
    render(<MessageBubble message={mockUserMessage} />);
    expect(screen.getByText('Hello, how are you?')).toBeInTheDocument();
  });

  it('renders assistant message content', () => {
    render(<MessageBubble message={mockAssistantMessage} />);
    expect(screen.getByText('I am doing well, thank you!')).toBeInTheDocument();
  });

  it('applies different styles for user vs assistant', () => {
    const { rerender } = render(<MessageBubble message={mockUserMessage} />);
    const userBubble = screen.getByText('Hello, how are you?').closest('div');
    expect(userBubble).toHaveClass('bg-blue-600', 'text-white');

    rerender(<MessageBubble message={mockAssistantMessage} />);
    const assistantBubble = screen.getByText('I am doing well, thank you!').closest('div');
    expect(assistantBubble).toHaveClass('bg-white', 'text-gray-900');
  });

  it('shows voice message indicator for voice messages', () => {
    render(<MessageBubble message={mockVoiceUserMessage} />);
    expect(screen.getByText('Voice message')).toBeInTheDocument();
  });

  it('shows play audio button for user voice message', () => {
    render(<MessageBubble message={mockVoiceUserMessage} />);
    expect(screen.getByRole('button', { name: /play audio/i })).toBeInTheDocument();
  });

  it('shows play audio button for assistant voice message with TTS', () => {
    render(<MessageBubble message={mockVoiceAssistantMessage} />);
    expect(screen.getByRole('button', { name: /play audio/i })).toBeInTheDocument();
  });

  it('does not show play button for text messages', () => {
    render(<MessageBubble message={mockUserMessage} />);
    expect(screen.queryByRole('button', { name: /play audio/i })).not.toBeInTheDocument();
  });

  it('displays formatted timestamp', () => {
    render(<MessageBubble message={mockUserMessage} />);
    // The time should be formatted according to locale
    const timestamp = screen.getByText(/\d{1,2}:\d{2}/);
    expect(timestamp).toBeInTheDocument();
  });

  it('shows user icon for user messages', () => {
    render(<MessageBubble message={mockUserMessage} />);
    // User messages have blue background avatar
    const avatar = document.querySelector('.bg-blue-600');
    expect(avatar).toBeInTheDocument();
  });

  it('shows bot icon for assistant messages', () => {
    render(<MessageBubble message={mockAssistantMessage} />);
    // Assistant messages have gray background avatar
    const avatar = document.querySelector('.bg-gray-200');
    expect(avatar).toBeInTheDocument();
  });
});
