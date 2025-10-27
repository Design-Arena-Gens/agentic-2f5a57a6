'use client';

import { AnimatePresence } from 'framer-motion';
import { useEffect, useRef } from 'react';

import type { ChatMessage } from '@/lib/types';
import { MessageBubble } from './MessageBubble';

interface MessageListProps {
  messages: ChatMessage[];
}

export const MessageList = ({ messages }: MessageListProps) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' });
  }, [messages]);

  return (
    <div
      ref={containerRef}
      className="scrollbar-hidden relative flex h-[50vh] w-full flex-col gap-3 overflow-y-auto px-1 pb-4 pt-3 sm:h-[45vh]"
      role="log"
      aria-live="polite"
      aria-relevant="additions"
    >
      <AnimatePresence initial={false}>
        {messages.map(message => (
          <MessageBubble key={message.id} message={message} />
        ))}
      </AnimatePresence>
    </div>
  );
};
