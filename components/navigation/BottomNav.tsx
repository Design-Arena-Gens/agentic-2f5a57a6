'use client';

import { motion } from 'framer-motion';
import { IconType } from 'react-icons';
import { PiChatCenteredDotsBold, PiClockCounterClockwiseBold, PiFoldersBold, PiGearBold } from 'react-icons/pi';

const tabs: Array<{ key: TabKey; label: string; icon: IconType }> = [
  { key: 'home', label: 'Home', icon: PiChatCenteredDotsBold },
  { key: 'categories', label: 'Categories', icon: PiFoldersBold },
  { key: 'history', label: 'History', icon: PiClockCounterClockwiseBold },
  { key: 'settings', label: 'Settings', icon: PiGearBold }
];

export type TabKey = 'home' | 'categories' | 'history' | 'settings';

interface BottomNavProps {
  active: TabKey;
  onChange: (tab: TabKey) => void;
}

export const BottomNav = ({ active, onChange }: BottomNavProps) => (
  <nav
    className="safe-area-inset glass-panel mx-auto mt-auto flex w-full max-w-md items-center justify-between rounded-3xl px-2 py-2 shadow-card"
    aria-label="Primary navigation"
  >
    {tabs.map(tab => {
      const Icon = tab.icon;
      const isActive = active === tab.key;
      return (
        <button
          key={tab.key}
          type="button"
          className={`relative flex flex-1 items-center justify-center rounded-2xl px-3 py-2 text-xs font-medium transition-colors duration-200 focus-ring ${
            isActive ? 'text-surface-50' : 'text-surface-400'
          }`}
          aria-label={tab.label}
          aria-pressed={isActive}
          onClick={() => onChange(tab.key)}
        >
          {isActive && (
            <motion.span
              layoutId="navHighlight"
              className="absolute inset-0 rounded-2xl bg-gradient-to-r from-accent-400 to-calm-400"
              transition={{ type: 'spring', stiffness: 320, damping: 30 }}
            />
          )}
          <span className="relative flex flex-col items-center gap-1">
            <Icon className="text-lg" aria-hidden />
            <span className="text-[0.65rem] font-semibold">{tab.label}</span>
          </span>
        </button>
      );
    })}
  </nav>
);
