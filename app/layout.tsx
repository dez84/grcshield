import type { Metadata, Viewport } from 'next';
import './globals.css';
import { ThemeProvider } from '@/components/theme-provider';
import { ProgressProvider } from '@/components/progress-provider';
import { AppShell } from '@/components/app-shell';
import { PwaRegister } from '@/components/pwa-register';

export const metadata: Metadata = {
  title: {
    default: 'GRC Shield — Micro-learning for governance, risk and compliance',
    template: '%s · GRC Shield',
  },
  description:
    'Interactive micro-learning for GRC, cybersecurity frameworks, IT auditing and risk management, with hands-on capstone projects.',
  applicationName: 'GRC Shield',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'GRC Shield',
  },
  icons: {
    icon: '/icons/icon.svg',
    apple: '/icons/icon.svg',
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#0b1220' },
  ],
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  viewportFit: 'cover',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ThemeProvider>
          <ProgressProvider>
            <AppShell>{children}</AppShell>
            <PwaRegister />
          </ProgressProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
