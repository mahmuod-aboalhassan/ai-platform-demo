import { useCallback, useRef, useEffect } from 'react';
import { useAppContext } from '../context/AppContext';

const MAX_DURATION = 120; // 2 minutes
const WARNING_THRESHOLD = 100; // 1:40

export function useVoiceRecorder() {
  const { state, dispatch } = useAppContext();
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<number | null>(null);
  const startTimeRef = useRef<number>(0);

  const isSupported = typeof navigator !== 'undefined' && navigator.mediaDevices && navigator.mediaDevices.getUserMedia;

  const startRecording = useCallback(async () => {
    if (!isSupported) {
      dispatch({ type: 'VOICE_ERROR', payload: 'Voice recording is not supported in this browser' });
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus',
      });

      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      mediaRecorder.start(100); // Collect data every 100ms
      mediaRecorderRef.current = mediaRecorder;

      dispatch({ type: 'START_RECORDING' });
      startTimeRef.current = Date.now();

      // Update duration every second
      timerRef.current = window.setInterval(() => {
        const duration = Math.floor((Date.now() - startTimeRef.current) / 1000);
        dispatch({ type: 'UPDATE_RECORDING_DURATION', payload: duration });

        // Auto-stop at max duration
        if (duration >= MAX_DURATION) {
          stopRecording();
        }
      }, 1000);
    } catch (error) {
      dispatch({ type: 'VOICE_ERROR', payload: 'Failed to access microphone' });
    }
  }, [dispatch, isSupported]);

  const stopRecording = useCallback(async (): Promise<Blob | null> => {
    return new Promise((resolve) => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }

      const mediaRecorder = mediaRecorderRef.current;
      if (!mediaRecorder || mediaRecorder.state === 'inactive') {
        dispatch({ type: 'STOP_RECORDING' });
        resolve(null);
        return;
      }

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        chunksRef.current = [];

        // Stop all tracks
        mediaRecorder.stream.getTracks().forEach((track) => track.stop());

        dispatch({ type: 'STOP_RECORDING' });
        resolve(blob);
      };

      mediaRecorder.stop();
    });
  }, [dispatch]);

  const cancelRecording = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    const mediaRecorder = mediaRecorderRef.current;
    if (mediaRecorder && mediaRecorder.state !== 'inactive') {
      mediaRecorder.stop();
      mediaRecorder.stream.getTracks().forEach((track) => track.stop());
    }

    chunksRef.current = [];
    dispatch({ type: 'STOP_RECORDING' });
  }, [dispatch]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      const mediaRecorder = mediaRecorderRef.current;
      if (mediaRecorder && mediaRecorder.state !== 'inactive') {
        mediaRecorder.stop();
        mediaRecorder.stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  return {
    isRecording: state.voice.isRecording,
    isProcessing: state.voice.isProcessing,
    recordingDuration: state.voice.recordingDuration,
    error: state.voice.error,
    isSupported: !!isSupported,
    isWarning: state.voice.recordingDuration >= WARNING_THRESHOLD,
    maxDuration: MAX_DURATION,
    startRecording,
    stopRecording,
    cancelRecording,
  };
}
