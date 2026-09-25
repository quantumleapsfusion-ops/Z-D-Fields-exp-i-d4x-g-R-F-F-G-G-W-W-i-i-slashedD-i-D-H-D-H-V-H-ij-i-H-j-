import type { Metadata, Viewport } from 'next';
import localFont from 'next/font/local';

import './globals.css';
import { CookieConsent } from '@/components/CookieConsent';
import { RegisterServiceWorker } from '@/components/RegisterServiceWorker';
import { site } from '@/lib/site';

const adventor = localFont({
  src: [
    { path: '../brand/fonts/texgyreadventor-regular.woff', weight: '400', style: 'normal' },
    { path: '../brand/fonts/texgyreadventor-bold.woff', weight: '700', style: 'normal' },
  ],
  display: 'swap',
  variable: '--font-adventor',
  fallback: ['Century Gothic', 'Questrial', 'sans-serif'],
});

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: `${site.name} — ${site.tagline}`,
    template: `%s — ${site.name}`,
  },
  description: site.description,
  applicationName: site.name,
  authors: [{ name: site.org, url: site.orgUrl }],
  keywords: ['e1-4', 'earth life-forms', 'voice', 'audio diary', 'voice social network'],
  manifest: '/manifest.webmanifest',
  appleWebApp: {
    capable: true,
    title: site.name,
    statusBarStyle: 'black-translucent',
  },
  openGraph: {
    type: 'website',
    url: site.url,
    siteName: site.name,
    title: `${site.name} — ${site.tagline}`,
    description: site.description,
    images: [{ url: '/brand/og-image_1200x630.png', width: 1200, height: 630 }],
  },
  twitter: {
    card: 'summary_large_image',
    title: `${site.name} — ${site.tagline}`,
    description: site.description,
    images: ['/brand/og-image_1200x630.png'],
  },
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/brand/favicon-32.png', sizes: '32x32', type: 'image/png' },
    ],
    apple: '/brand/apple-touch-icon.png',
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#FFFFFF' },
    { media: '(prefers-color-scheme: dark)', color: '#0B0E0D' },
  ],
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={adventor.variable}>
      <body className="min-h-screen bg-blackboard font-sans text-chalk antialiased">
        {children}
        <CookieConsent />
        <RegisterServiceWorker />
      </body>
    </html>
  );
}
