import { useState, useCallback, useRef, useEffect } from 'react';
import { voiceService } from '../services/voiceService';

export function useAudioPlayer() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentUrl, setCurrentUrl] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const play = useCallback((url: string, onEnded?: () => void) => {
    const audioUrl = voiceService.getAudioUrl(url);

    // Stop current audio if playing
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }

    const audio = new Audio(audioUrl);
    audioRef.current = audio;

    audio.onplay = () => {
      setIsPlaying(true);
      setCurrentUrl(url);
    };

    audio.onended = () => {
      setIsPlaying(false);
      setCurrentUrl(null);
      if (onEnded) onEnded();
    };

    audio.onerror = () => {
      setIsPlaying(false);
      setCurrentUrl(null);
    };

    audio.play().catch(() => {
      setIsPlaying(false);
      setCurrentUrl(null);
    });
  }, []);

  const pause = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
    }
  }, []);

  const stop = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      audioRef.current = null;
      setIsPlaying(false);
      setCurrentUrl(null);
    }
  }, []);

  const toggle = useCallback(
    (url: string) => {
      if (isPlaying && currentUrl === url) {
        pause();
      } else {
        play(url);
      }
    },
    [isPlaying, currentUrl, play, pause]
  );

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  return {
    isPlaying,
    currentUrl,
    play,
    pause,
    stop,
    toggle,
  };
}
