import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { Suspense } from "react";
import { Toaster } from "sonner";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://mppsi.edu.ph"),
  title: {
    template: "%s | MPPSI",
    default: "Mother Perpetua Parochial School Inc. (MPPSI)",
  },
  description:
    "Official Portal of Mother Perpetua Parochial School Inc. Providing quality K-12 catholic education. Enroll now and join our growing community.",
  keywords: [
    "MPPSI",
    "Mother Perpetua",
    "Parochial School",
    "Catholic Education",
    "K-12",
    "Enrollment",
  ],
  openGraph: {
    title: "Mother Perpetua Parochial School Inc.",
    description:
      "Providing quality K-12 catholic education. Enroll now and join our growing community.",
    url: "https://mppsi.edu.ph",
    siteName: "MPPSI",
    images: [
      {
        url: "/logo.webp",
        width: 800,
        height: 600,
        alt: "MPPSI Logo",
      },
    ],
    locale: "en_PH",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Mother Perpetua Parochial School Inc.",
    description: "Providing quality K-12 catholic education.",
    images: ["/logo.webp"],
  },
  icons: {
    icon: [
      { url: "/logo.webp", sizes: "32x32", type: "image/webp" },
      { url: "/logo.webp", sizes: "192x192", type: "image/webp" },
    ],
    apple: "/logo.webp",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    // suppressHydrationWarning to prevent hydration mismatch in antigravity debugger
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} font-sans antialiased`}
      >
        <Suspense fallback={null}>{children}</Suspense>
        <Toaster position="top-right" />
        <SpeedInsights />
        <Analytics />
      </body>
    </html>
  );
}
