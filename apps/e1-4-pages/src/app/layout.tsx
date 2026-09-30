import type { Metadata, Viewport } from "next";
import { Fraunces, Space_Grotesk } from "next/font/google";

import "./globals.css";

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

const description =
  "Greetings Earthling. Four ways to speak: Voice Stream, Da Vinci, Infinity Chalkboard, and Gravity Board. Built by Earth 1 Coalescent.";

export const metadata: Metadata = {
  metadataBase: new URL("https://e1-4.com"),
  title: "e1-4 — Greetings Earthling.",
  description,
  openGraph: {
    type: "website",
    url: "https://e1-4.com",
    siteName: "e1-4",
    title: "e1-4 — Greetings Earthling.",
    description,
    images: [{ url: "/icon.svg", alt: "e1-4 Ψ over π" }],
  },
  twitter: {
    card: "summary",
    title: "e1-4 — Greetings Earthling.",
    description,
  },
  icons: { icon: "/icon.svg", apple: "/icon.svg" },
};

export const viewport: Viewport = {
  themeColor: "#000000",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${fraunces.variable} ${spaceGrotesk.variable}`}>
      <body className="bg-blackboard text-chalk min-h-screen font-sans antialiased">
        {children}
      </body>
    </html>
  );
}
