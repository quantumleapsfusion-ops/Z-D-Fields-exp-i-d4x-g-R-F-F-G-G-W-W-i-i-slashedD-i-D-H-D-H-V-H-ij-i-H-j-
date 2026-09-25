import type { Metadata } from "next";
import { Fraunces, Space_Grotesk } from "next/font/google";
import { SiteHeader } from "@/components/SiteHeader";
import { publicEnv } from "@/lib/env";
import "./globals.css";

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  axes: ["opsz", "SOFT"],
});

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(publicEnv.siteUrl),
  title: {
    default: "e1-4 — earth life-forms",
    template: "%s · e1-4",
  },
  description:
    "Greetings Earthling. Think. — e1-4.com, flagship of Earth One Global Coalescent.",
  openGraph: {
    title: "e1-4 — earth life-forms",
    description: "Greetings Earthling. Think.",
    siteName: "e1-4",
    type: "website",
  },
  twitter: { card: "summary_large_image" },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${fraunces.variable} ${spaceGrotesk.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col">
        <SiteHeader />
        <main className="flex flex-1 flex-col">{children}</main>
        <footer className="text-dust mx-auto w-full max-w-5xl px-6 py-8 text-xs">
          <div className="chalk-rule mb-6" />
          <p>
            e1-4.com · earth life-forms · a flagship of Earth One Global Coalescent ·
            sibling:{" "}
            <a className="hover:text-chalk underline" href="https://earth1.co">
              earth1.co
            </a>
          </p>
        </footer>
      </body>
    </html>
  );
}
