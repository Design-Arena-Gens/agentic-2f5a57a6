'use client';

import { ThemeProvider } from 'next-themes';
import { AppStateProvider } from './AppStateProvider';

export const AppProviders = ({ children }: { children: React.ReactNode }) => (
  <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
    <AppStateProvider>{children}</AppStateProvider>
  </ThemeProvider>
);
