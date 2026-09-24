import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://e1-4.com"),
  title: {
    default: "e1-4.com — Engineering for what comes next",
    template: "%s | e1-4.com",
  },
  description:
    "e1-4.com builds software, data and automation systems for teams that need results they can measure.",
  keywords: ["e1-4", "e1-4.com", "software", "automation", "data"],
  openGraph: {
    title: "e1-4.com — Engineering for what comes next",
    description:
      "e1-4.com builds software, data and automation systems for teams that need results they can measure.",
    url: "https://e1-4.com",
    siteName: "e1-4.com",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "e1-4.com — Engineering for what comes next",
    description:
      "e1-4.com builds software, data and automation systems for teams that need results they can measure.",
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
