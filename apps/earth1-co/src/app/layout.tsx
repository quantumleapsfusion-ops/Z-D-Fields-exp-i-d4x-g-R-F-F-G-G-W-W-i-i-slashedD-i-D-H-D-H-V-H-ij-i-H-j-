import type { Metadata, Viewport } from "next";
import { EB_Garamond } from "next/font/google";

import "./globals.css";
import { site } from "@/lib/site";

const garamond = EB_Garamond({
  subsets: ["latin"],
  style: ["normal", "italic"],
  display: "swap",
  variable: "--font-eb-garamond",
});

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: site.title,
  description: site.description,
  applicationName: site.name,
  openGraph: {
    type: "website",
    url: site.url,
    siteName: site.org,
    title: site.title,
    description: site.description,
  },
  twitter: {
    card: "summary_large_image",
    title: site.title,
    description: site.description,
  },
  icons: { icon: "/icon.png", apple: "/apple-icon.png" },
};

export const viewport: Viewport = {
  themeColor: "#000000",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={garamond.variable}>
      <body className="font-serif">{children}</body>
    </html>
  );
}
