import React, { useEffect, useState } from 'react';
import { X, Mic, MicOff, Volume2 } from 'lucide-react';
import { useAppContext } from '../../context/AppContext';
import { useChat } from '../../hooks/useChat';
import { useVoiceRecorder } from '../../hooks/useVoiceRecorder';
import { useAudioPlayer } from '../../hooks/useAudioPlayer';

export function VoiceModeModal() {
  const { state, dispatch } = useAppContext();
  const { isVoiceMode, endVoiceMode, sendVoiceMessage } = useChat();
  const { isRecording, startRecording, stopRecording, cancelRecording } = useVoiceRecorder();
  const { isPlaying, stop: stopAudio, play } = useAudioPlayer();
  const [micPermission, setMicPermission] = useState<boolean | null>(null);
  const [lastPlayedId, setLastPlayedId] = useState<string | null>(null);

  useEffect(() => {
    if (isVoiceMode) {
      navigator.mediaDevices.getUserMedia({ audio: true })
        .then(() => setMicPermission(true))
        .catch(() => setMicPermission(false));
    }
  }, [isVoiceMode]);

  // Auto-play and Turn-taking logic
  useEffect(() => {
    if (!isVoiceMode) return;

    const lastMessage = state.messages.items[state.messages.items.length - 1];
    
    if (
      lastMessage &&
      lastMessage.role === 'assistant' &&
      lastMessage.tts_audio_url &&
      lastMessage.id !== lastPlayedId &&
      !isRecording
    ) {
      setLastPlayedId(lastMessage.id);
      play(lastMessage.tts_audio_url, () => {
        // On Ended, automatically start recording to simulate turn-taking
        startRecording();
      });
    }
  }, [state.messages.items, isVoiceMode, lastPlayedId, isRecording, play, startRecording]);

  if (!isVoiceMode) return null;

  const handleClose = () => {
    cancelRecording();
    stopAudio();
    endVoiceMode();
  };

  const handleInteraction = async () => {
    if (isPlaying) {
      // User interrupts agent
      stopAudio();
      await startRecording();
    } else if (isRecording) {
      // User finishes speaking
      const blob = await stopRecording();
      if (blob && state.sessions.selectedId) {
        await sendVoiceMessage(state.sessions.selectedId, blob);
      }
    } else {
      // User starts speaking (if not playing or recording)
      await startRecording();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-slate-900/95 backdrop-blur-xl animate-fade-in">
      {/* Close button */}
      <button 
        onClick={handleClose}
        className="absolute top-6 right-6 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-all"
      >
        <X className="h-6 w-6" />
      </button>

      {/* Main Content */}
      <div className="flex-1 flex flex-col items-center justify-center w-full max-w-md px-6">
        
        {/* Visualizer Area */}
        <div className="h-64 flex items-center justify-center w-full mb-12 relative">
          {/* Agent Speaking Visualizer (Simulated) */}
          {isPlaying && (
            <div className="flex items-center gap-2">
              {[...Array(5)].map((_, i) => (
                <div 
                  key={i} 
                  className="w-3 bg-primary-400 rounded-full animate-pulse-slow"
                  style={{ 
                    height: `${Math.random() * 60 + 40}px`, 
                    animationDelay: `${i * 0.1}s` 
                  }}
                />
              ))}
            </div>
          )}

          {/* User Recording Visualizer (Pulsing Circle) */}
          {isRecording && (
            <div className="relative">
              <div className="absolute inset-0 bg-red-500/30 rounded-full animate-ping" />
              <div className="relative h-24 w-24 bg-red-500 rounded-full flex items-center justify-center shadow-lg shadow-red-500/50">
                <Mic className="h-10 w-10 text-white" />
              </div>
            </div>
          )}

          {/* Idle State */}
          {!isPlaying && !isRecording && (
            <div className="text-center text-slate-400">
              <div className="mb-4">
                <div className="h-20 w-20 mx-auto rounded-full bg-slate-800 flex items-center justify-center border border-slate-700">
                  <MicOff className="h-8 w-8 text-slate-500" />
                </div>
              </div>
              <p>Tap below to speak</p>
            </div>
          )}
        </div>

        {/* Interaction Button */}
        <button
          onClick={handleInteraction}
          className={`w-full max-w-xs py-6 rounded-3xl font-semibold text-lg transition-all transform hover:scale-105 active:scale-95 shadow-xl ${
            isPlaying 
              ? 'bg-primary-600 text-white shadow-primary-500/30'
              : isRecording 
                ? 'bg-red-600 text-white shadow-red-500/30'
                : 'bg-white text-slate-900'
          }`}
        >
          {isPlaying ? 'Tap to Interrupt' : isRecording ? 'Tap to Send' : 'Tap to Speak'}
        </button>

        <p className="mt-8 text-slate-500 text-sm text-center">
          {isPlaying ? 'Agent is speaking...' : isRecording ? 'Listening...' : 'Ready'}
        </p>

      </div>
    </div>
  );
}
