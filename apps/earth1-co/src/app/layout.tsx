import type { Metadata, Viewport } from "next";
import { Michroma, Space_Grotesk } from "next/font/google";

import "./globals.css";
import { Starfield } from "@/components/Starfield";
import { site } from "@/lib/site";

const michroma = Michroma({
  weight: "400",
  subsets: ["latin"],
  display: "swap",
  variable: "--font-michroma",
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
    images: [{ url: "/icon.svg", alt: site.org }],
  },
  twitter: {
    card: "summary_large_image",
    title: `${site.org} — Global citizenship for all`,
    description: site.description,
  },
  robots: { index: true, follow: true },
  icons: { icon: "/icon.png", apple: "/apple-icon.png" },
};

export const viewport: Viewport = {
  themeColor: "#000000",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${michroma.variable} ${spaceGrotesk.variable}`}>
      <body className="min-h-screen bg-black font-sans text-white antialiased">
        <Starfield />
        {children}
      </body>
    </html>
  );
}
