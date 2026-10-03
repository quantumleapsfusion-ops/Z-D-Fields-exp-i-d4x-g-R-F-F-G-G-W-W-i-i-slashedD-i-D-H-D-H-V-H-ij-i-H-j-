import type { Metadata, Viewport } from "next";
import { EB_Garamond, Michroma, Space_Grotesk } from "next/font/google";
import Link from "next/link";
import { Earth1Mark } from "@earth-one/ui";

import "katex/dist/katex.min.css";
import "./globals.css";
import { Footer } from "@/components/Footer";
import { Nav } from "@/components/Nav";
import { SolarSystem } from "@/components/SolarSystem";
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

const garamond = EB_Garamond({
  subsets: ["latin"],
  style: ["normal", "italic"],
  display: "swap",
  variable: "--font-eb-garamond",
});

/**
 * Google Search Console "HTML tag" verification. Set NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION in the
 * Vercel project (see docs/SEARCH-CONSOLE.md); unset, no tag is rendered.
 */
const googleVerification = process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION?.trim();

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: `${site.org} — Global citizenship for all`,
    template: `%s — ${site.name}`,
  },
  description: site.description,
  applicationName: site.name,
  creator: site.org,
  publisher: site.org,
  keywords: [...site.keywords],
  ...(googleVerification ? { verification: { google: googleVerification } } : {}),
  openGraph: {
    type: "website",
    url: site.url,
    siteName: site.org,
    title: `${site.org} — Global citizenship for all`,
    description: site.description,
    // The card image itself comes from app/opengraph-image.png (file convention).
  },
  twitter: {
    card: "summary_large_image",
    title: `${site.org} — Global citizenship for all`,
    description: site.description,
  },
  robots: { index: true, follow: true },
  icons: {
    icon: [
      { url: "/favicon.svg", type: "image/svg+xml" },
      { url: "/icon.png", type: "image/png", sizes: "512x512" },
    ],
    apple: "/apple-icon.png",
  },
};

export const viewport: Viewport = {
  themeColor: "#000000",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${michroma.variable} ${spaceGrotesk.variable} ${garamond.variable}`}
    >
      <body className="flex min-h-svh flex-col bg-black font-sans text-white antialiased">
        <Starfield />
        <SolarSystem />
        <header className="px-6 pt-[max(1.5rem,env(safe-area-inset-top))] sm:px-10 sm:pt-8">
          <Link
            href="/"
            className="label inline-flex items-center gap-3 text-white/60 transition-colors hover:text-white"
          >
            <Earth1Mark size={28} className="shrink-0" />
            {site.org}
          </Link>
        </header>
        <Nav />
        <main className="flex flex-1 flex-col items-center justify-end px-6 pt-[52svh] pb-12 text-center sm:pt-[60svh]">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
