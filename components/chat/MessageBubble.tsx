'use client';

import dayjs from 'dayjs';
import { motion } from 'framer-motion';
import clsx from 'clsx';

import type { ChatMessage } from '@/lib/types';

interface MessageBubbleProps {
  message: ChatMessage;
}

export const MessageBubble = ({ message }: MessageBubbleProps) => {
  const isUser = message.role === 'user';
  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: isUser ? 28 : -28 }}
      className={clsx('max-w-[88%] rounded-3xl px-4 py-3 text-sm shadow-md transition-colors', {
        'ml-auto bg-gradient-to-r from-accent-400 to-calm-400 text-white': isUser,
        'mr-auto bg-white/90 text-surface-800 dark:bg-surface-800/80 dark:text-surface-50': !isUser
      })}
      aria-live={isUser ? 'off' : 'polite'}
    >
      <p className="leading-relaxed">{message.content}</p>
      <time
        className={clsx('mt-2 block text-[0.65rem] uppercase tracking-wide', {
          'text-white/80': isUser,
          'text-surface-400 dark:text-surface-200': !isUser
        })}
      >
        {dayjs(message.timestamp).format('MMM D, h:mm A')}
      </time>
    </motion.article>
  );
};
