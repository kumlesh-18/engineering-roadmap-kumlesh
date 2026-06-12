import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Providers } from '@/components/providers';

const inter = Inter({ subsets: ['latin'], variable: '--font-sans' });

export const metadata: Metadata = {
  title: {
    default: 'AI Engineer Roadmap - Learn AI Engineering Step by Step',
    template: '%s | AI Engineer Roadmap',
  },
  description: 'Interactive roadmap to become an AI Engineer. Learn LLMs, RAG, Agents, MLOps, and more with AI tutoring, quizzes, and knowledge graphs.',
  keywords: ['AI engineering', 'LLM', 'RAG', 'machine learning', 'roadmap', 'tutorial', 'course'],
  authors: [{ name: 'AI Engineer Roadmap' }],
  creator: 'AI Engineer Roadmap',
  publisher: 'AI Engineer Roadmap',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://ai-engineer-roadmap.com',
    siteName: 'AI Engineer Roadmap',
    title: 'AI Engineer Roadmap - Learn AI Engineering Step by Step',
    description: 'Interactive roadmap to become an AI Engineer with AI tutoring, quizzes, and knowledge graphs.',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'AI Engineer Roadmap',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AI Engineer Roadmap',
    description: 'Interactive roadmap to become an AI Engineer with AI tutoring, quizzes, and knowledge graphs.',
    images: ['/og-image.png'],
  },
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon-16x16.png',
    apple: '/apple-touch-icon.png',
  },
  manifest: '/site.webmanifest',
};

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: 'white' },
    { media: '(prefers-color-scheme: dark)', color: '#0f172a' },
  ],
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className={`${inter.variable} font-sans antialiased`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}