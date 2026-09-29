import type { Metadata, Viewport } from "next";
import { Fraunces, Space_Grotesk } from "next/font/google";
import { SpacetimeBackground } from "@earth-one/spacetime";

import "./globals.css";
import { site } from "@/lib/site";

const fraunces = Fraunces({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-fraunces",
});

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-space-grotesk",
});

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: `${site.org} — Global citizenship for all`,
    template: `%s — ${site.name}`,
  },
  description: site.description,
  applicationName: site.name,
  keywords: [...site.keywords],
  openGraph: {
    type: "website",
    url: site.url,
    siteName: site.org,
    title: `${site.org} — Global citizenship for all`,
    description: site.description,
  },
  twitter: {
    card: "summary",
    title: `${site.org} — Global citizenship for all`,
    description: site.description,
  },
  robots: { index: true, follow: true },
  icons: { icon: "/icon.png", apple: "/apple-icon.png" },
};

export const viewport: Viewport = {
  themeColor: "#0e1a13",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${fraunces.variable} ${spaceGrotesk.variable}`}>
      <body className="bg-blackboard text-chalk min-h-screen font-sans antialiased">
        <SpacetimeBackground theme="earth1" />
        {children}
      </body>
    </html>
  );
}
