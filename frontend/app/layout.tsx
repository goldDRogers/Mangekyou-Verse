import React from 'react';
import { Metadata, Viewport } from 'next';
import { AuthProvider } from '@/context/AuthContext';
import './globals.css';

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:5000'),
  title: {
    default: 'Mangekyou Verse | The Ultimate Anime Discovery Platform',
    template: '%s | Mangekyou Verse',
  },
  description: 'Mangekyou Verse is a high-performance anime discovery node. Explore trending titles, search through thousands of anime database entries, and manage your personalized watchlist.',
  keywords: ['anime', 'anime database', 'anime discovery', 'mangekyou verse', 'jikan', 'anilist', 'watchlist', 'anime streaming', 'legal anime'],
  authors: [{ name: 'Mangekyou Verse Team' }],
  creator: 'Mangekyou Verse',
  publisher: 'Mangekyou Verse',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://mangekyouversee.vercel.app/',
    siteName: 'Mangekyou Verse',
    title: 'Mangekyou Verse | The Ultimate Anime Discovery Platform',
    description: 'Explore, discover, and track your favorite anime with the most advanced discovery engine.',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Mangekyou Verse',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Mangekyou Verse | The Ultimate Anime Discovery Platform',
    description: 'Explore, discover, and track your favorite anime with the most advanced discovery engine.',
    images: ['/og-image.png'],
    creator: '@mangekyouverse',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  manifest: '/manifest.json',
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon-16x16.png',
    apple: '/apple-touch-icon.png',
  },
};

export const viewport: Viewport = {
  themeColor: '#0f1011',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
};

import Layout from '@/components/Layout';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Google Fonts */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&family=Outfit:wght@400;500;600;700;800;900&display=swap" rel="stylesheet" />
        {/* Font Awesome */}
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css" integrity="sha512-DTOQO9RWCH3ppGqcWaEA1BIZOC6xxalwEsw9c2QQeAIftl+Vegovlnee1c9QX4TctnWMn13TZye+giMm8e2LwA==" crossOrigin="anonymous" referrerPolicy="no-referrer" />
      </head>
      <body suppressHydrationWarning>
        <AuthProvider>
          <Layout>
            {children}
          </Layout>
        </AuthProvider>
      </body>
    </html>
  );
}
