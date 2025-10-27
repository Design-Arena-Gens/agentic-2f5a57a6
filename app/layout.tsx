import type { Metadata } from 'next';
import { Inter } from 'next/font/google';

import './globals.css';
import { AppProviders } from '@/components/providers/AppProviders';

const inter = Inter({ subsets: ['latin'], display: 'swap', variable: '--font-inter' });

export const metadata: Metadata = {
  title: 'Astra Companion – Multi-domain AI Assistant',
  description:
    'A calming AI assistant tailored for emotional support, agriculture insights, medical guidance, and technology coaching with voice-first experiences.'
};

const RootLayout = ({ children }: { children: React.ReactNode }) => (
  <html lang="en" className={inter.variable}>
    <body className="safe-area-inset bg-surface-50 text-surface-900 transition-colors duration-300">
      <a
        href="#main"
        className="sr-only sr-only-focusable focus-visible:top-4 focus-visible:left-4 focus-visible:z-50"
      >
        Skip to main content
      </a>
      <AppProviders>
        <div className="min-h-screen w-full">
          {children}
        </div>
      </AppProviders>
    </body>
  </html>
);

export default RootLayout;
