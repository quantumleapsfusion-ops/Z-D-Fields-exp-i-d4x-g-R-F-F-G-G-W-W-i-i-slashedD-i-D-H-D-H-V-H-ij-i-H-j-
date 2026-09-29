import type { Metadata, Viewport } from "next";
import { IBM_Plex_Mono, Manrope, Unbounded } from "next/font/google";

import "./globals.css";
import { AppShell } from "@/components/AppShell";
import { site } from "@/lib/site";

const unbounded = Unbounded({
  subsets: ["latin"],
  weight: ["300", "500", "700"],
  display: "swap",
  variable: "--font-unbounded",
});

const manrope = Manrope({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  display: "swap",
  variable: "--font-manrope",
});

const plexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  display: "swap",
  variable: "--font-plex-mono",
});

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: `${site.name} — ${site.tagline}`,
    template: `%s — ${site.name}`,
  },
  description: site.description,
  applicationName: site.name,
  authors: [{ name: site.org, url: site.philosophyUrl }],
  keywords: ["e1-4", "earth life-forms", "Earth 1 Coalescent", "voice", "chalkboard"],
  robots: { index: false, follow: false },
  openGraph: {
    type: "website",
    url: site.url,
    siteName: site.name,
    title: `${site.name} — ${site.tagline}`,
    description: site.description,
  },
  twitter: {
    card: "summary_large_image",
    title: `${site.name} — ${site.tagline}`,
    description: site.description,
  },
};

export const viewport: Viewport = {
  themeColor: "#050507",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${unbounded.variable} ${manrope.variable} ${plexMono.variable}`}
    >
      <body className="bg-bg text-text min-h-screen font-sans antialiased">
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
