import React from 'react';
import { useVoiceRecorder } from '../../hooks/useVoiceRecorder';

export function RecordingIndicator() {
  const { recordingDuration, isWarning, maxDuration } = useVoiceRecorder();

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const remainingTime = maxDuration - recordingDuration;
  const progress = (recordingDuration / maxDuration) * 100;

  return (
    <div className="flex items-center gap-2 px-3 py-2 bg-red-50 rounded-lg">
      {/* Recording dot */}
      <span className="h-2.5 w-2.5 bg-red-500 rounded-full animate-pulse" />

      {/* Timer */}
      <span className={`font-mono text-sm ${isWarning ? 'text-red-600' : 'text-gray-700'}`}>
        {formatTime(recordingDuration)}
      </span>

      {/* Progress bar */}
      <div className="w-24 h-1.5 bg-gray-200 rounded-full overflow-hidden">
        <div
          className={`h-full transition-all ${isWarning ? 'bg-red-500' : 'bg-blue-500'}`}
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Warning */}
      {isWarning && (
        <span className="text-xs text-red-600">
          {remainingTime}s left
        </span>
      )}
    </div>
  );
}
