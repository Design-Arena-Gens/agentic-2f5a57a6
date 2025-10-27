'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { PiMicrophoneBold, PiMicrophoneSlashBold, PiPaperPlaneTiltBold } from 'react-icons/pi';

import { triggerHaptic } from '@/lib/haptics';
import { startVoiceInput } from '@/lib/voice';

interface ChatComposerProps {
  onSend: (message: string) => Promise<void> | void;
  isThinking: boolean;
  placeholder?: string;
}

export const ChatComposer = ({ onSend, isThinking, placeholder }: ChatComposerProps) => {
  const [message, setMessage] = useState('');
  const [listening, setListening] = useState(false);
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  const handleSend = useCallback(async () => {
    if (!message.trim()) return;
    triggerHaptic();
    await onSend(message.trim());
    setMessage('');
  }, [message, onSend]);

  const handleVoiceToggle = () => {
    if (listening) {
      recognitionRef.current?.stop();
      setListening(false);
      return;
    }

    recognitionRef.current = startVoiceInput(
      {
        onResult: transcript => {
          setMessage(prev => (prev ? `${prev} ${transcript}` : transcript));
        },
        onError: () => setListening(false),
        onStart: () => setListening(true),
        onEnd: () => setListening(false)
      },
      { interimResults: true, continuous: false, language: 'en-US' }
    );

    if (!recognitionRef.current) {
      setListening(false);
    }
  };

  useEffect(() => () => {
    recognitionRef.current?.stop();
  }, []);

  return (
    <div className="glass-panel flex w-full flex-col gap-3 rounded-3xl px-4 py-3 shadow-card">
      <label htmlFor="chat-input" className="text-xs font-semibold uppercase tracking-wide text-surface-500">
        Share what you need
      </label>
      <textarea
        id="chat-input"
        aria-label="Message the assistant"
        value={message}
        placeholder={placeholder ?? 'Ask for insights, coaching, or a check-in...'}
        onChange={event => setMessage(event.target.value)}
        className="focus-ring min-h-[88px] w-full resize-none rounded-2xl border border-surface-200 bg-white/90 px-4 py-3 text-sm leading-relaxed text-surface-800 shadow-inner placeholder:text-surface-400 dark:border-surface-700 dark:bg-surface-900/80 dark:text-surface-50"
        style={{ fontSize: 'clamp(0.9rem, 0.92rem + 0.1vw, 1.05rem)' }}
      />
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={handleVoiceToggle}
          className={`focus-ring flex items-center gap-2 rounded-2xl px-3 py-2 text-xs font-semibold uppercase tracking-wide ${
            listening
              ? 'bg-gradient-to-r from-accent-400 to-calm-400 text-white'
              : 'bg-surface-100 text-surface-500 dark:bg-surface-800 dark:text-surface-100'
          }`}
          aria-pressed={listening}
          aria-label={listening ? 'Stop voice input' : 'Start voice input'}
        >
          {listening ? <PiMicrophoneSlashBold aria-hidden /> : <PiMicrophoneBold aria-hidden />}
          {listening ? 'Listening…' : 'Voice' }
        </button>
        <button
          type="button"
          onClick={handleSend}
          disabled={!message.trim() || isThinking}
          className="focus-ring flex items-center gap-2 rounded-2xl bg-gradient-to-r from-accent-400 to-calm-400 px-4 py-2 text-sm font-semibold text-white shadow-lg transition hover:shadow-xl disabled:cursor-not-allowed disabled:bg-surface-200 disabled:text-surface-400"
        >
          <PiPaperPlaneTiltBold aria-hidden />
          {isThinking ? 'Thinking…' : 'Send'}
        </button>
      </div>
    </div>
  );
};
