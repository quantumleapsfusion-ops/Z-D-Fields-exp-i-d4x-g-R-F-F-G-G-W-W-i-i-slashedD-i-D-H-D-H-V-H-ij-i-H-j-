import type { Metadata, Viewport } from "next";
import { EB_Garamond, IBM_Plex_Mono, Michroma } from "next/font/google";

import "./globals.css";
import { site } from "@/lib/site";

const garamond = EB_Garamond({
  subsets: ["latin"],
  weight: ["400", "500"],
  style: ["normal", "italic"],
  display: "swap",
  variable: "--font-garamond",
});

const plexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  display: "swap",
  variable: "--font-plex-mono",
});

const michroma = Michroma({
  subsets: ["latin"],
  weight: "400",
  display: "swap",
  variable: "--font-michroma",
});

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: `${site.org} — ${site.motto}`,
    template: `%s — ${site.name}`,
  },
  description: site.description,
  applicationName: site.name,
  keywords: [...site.keywords],
  openGraph: {
    type: "website",
    url: site.url,
    siteName: site.org,
    title: `${site.org} — ${site.motto}`,
    description: site.description,
  },
  twitter: {
    card: "summary",
    title: `${site.org} — ${site.motto}`,
    description: site.description,
  },
  robots: { index: true, follow: true },
  icons: { icon: "/icon.png", apple: "/apple-icon.png" },
};

export const viewport: Viewport = {
  themeColor: "#0f0d0b",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${garamond.variable} ${plexMono.variable} ${michroma.variable}`}
    >
      <body className="paper text-ink min-h-screen font-serif antialiased">
        {children}
      </body>
    </html>
  );
}
