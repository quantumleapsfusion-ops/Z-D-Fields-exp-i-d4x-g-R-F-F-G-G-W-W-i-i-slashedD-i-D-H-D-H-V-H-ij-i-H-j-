import type { Metadata, Viewport } from "next";
import { Fraunces, Space_Grotesk } from "next/font/google";

import "./globals.css";
import { AppShell } from "@/components/AppShell";
import { getLanguageModel } from "@/lib/llm";
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
    default: `${site.name}: ${site.tagline}`,
    template: `%s · ${site.name}`,
  },
  description: site.description,
  applicationName: site.name,
  authors: [{ name: site.org, url: site.philosophyUrl }],
  keywords: [
    "e1-4",
    "earth life-forms",
    "Earth One Global Coalescent",
    "voice",
    "chalkboard",
  ],
  openGraph: {
    type: "website",
    url: site.url,
    siteName: site.name,
    title: `${site.name}: ${site.tagline}`,
    description: site.description,
  },
  twitter: {
    card: "summary_large_image",
    title: `${site.name}: ${site.tagline}`,
    description: site.description,
  },
  icons: {
    icon: "/icon.svg",
    apple: "/icon.svg",
  },
};

export const viewport: Viewport = {
  themeColor: "#000000",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const llmReady = getLanguageModel() !== null;

  return (
    <html lang="en" className={`${fraunces.variable} ${spaceGrotesk.variable}`}>
      <body className="bg-blackboard text-chalk min-h-screen font-sans antialiased">
        <AppShell llmReady={llmReady}>{children}</AppShell>
      </body>
    </html>
  );
}
