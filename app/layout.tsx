import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';

import { GorillaAccountProvider } from '@/components/gorilla-account-provider';

import './globals.css';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  metadataBase: new URL('https://gorillahockey.ru'),
  title: {
    default: 'Gorilla Hockey',
    template: '%s | Gorilla Hockey',
  },
  description:
    'Gorilla Hockey — хоккейная школа, команды, аренда льда и запись на тренировки.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ru"
      data-scroll-behavior="smooth"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col bg-[color:var(--gh-bg)]">
        <GorillaAccountProvider>{children}</GorillaAccountProvider>
      </body>
    </html>
  );
}
