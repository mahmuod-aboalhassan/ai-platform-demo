import React from 'react';
import { Mic, MicOff, Square } from 'lucide-react';
import { useAppContext } from '../../context/AppContext';
import { useVoiceRecorder } from '../../hooks/useVoiceRecorder';
import { useChat } from '../../hooks/useChat';
import { RecordingIndicator } from './RecordingIndicator';

export function VoiceButton() {
  const { state } = useAppContext();
  const { isRecording, isProcessing, isSupported, startRecording, stopRecording, cancelRecording } = useVoiceRecorder();
  const { sendVoiceMessage, streaming } = useChat();

  const sessionId = state.sessions.selectedId;
  const isDisabled = !sessionId || streaming || isProcessing;

  const handleMouseDown = async () => {
    if (isDisabled || !isSupported) return;
    await startRecording();
  };

  const handleMouseUp = async () => {
    if (!isRecording) return;
    const blob = await stopRecording();
    if (blob && sessionId) {
      await sendVoiceMessage(sessionId, blob);
    }
  };

  const handleCancel = () => {
    cancelRecording();
  };

  if (!isSupported) {
    return (
      <button
        disabled
        title="Voice recording not supported"
        className="flex-shrink-0 h-12 w-12 rounded-xl bg-gray-200 text-gray-400 flex items-center justify-center cursor-not-allowed"
      >
        <MicOff className="h-5 w-5" />
      </button>
    );
  }

  if (isRecording) {
    return (
      <div className="flex items-center gap-1">
        <RecordingIndicator />
        <button
          onClick={handleCancel}
          className="flex-shrink-0 h-10 w-10 rounded-xl bg-slate-100 text-slate-500 flex items-center justify-center hover:bg-slate-200 transition-colors"
          title="Cancel"
        >
          <Square className="h-4 w-4" />
        </button>
        <button
          onMouseUp={handleMouseUp}
          className="flex-shrink-0 h-10 w-10 rounded-xl bg-red-500 text-white flex items-center justify-center animate-pulse shadow-lg shadow-red-500/30"
          title="Release to send"
        >
          <Mic className="h-5 w-5" />
        </button>
      </div>
    );
  }

  return (
    <button
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      disabled={isDisabled}
      className="flex-shrink-0 h-10 w-10 rounded-xl bg-slate-100 text-slate-500 flex items-center justify-center hover:bg-slate-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed hover:text-primary-600"
      title="Hold to record"
    >
      <Mic className="h-5 w-5" />
    </button>
  );
}
