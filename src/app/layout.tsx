import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Dock from "@/components/Dock";
import { dockInitScript } from "@/components/dockPlacement";
import SmoothScroll from "@/components/SmoothScroll";
import { profile } from "@/data";
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
  title: `${profile.name} | ${profile.role}`,
  description: `Portfolio of ${profile.name}, ${profile.role}.`,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    // suppressHydrationWarning: the dock script sets data-dock/--dock-t on
    // <html> before React hydrates.
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: dockInitScript }} />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <SmoothScroll />
        <Dock />
        <main className="page mx-auto box-content max-w-3xl px-6 pt-10 pb-28 md:px-24 md:py-16">
          {children}
        </main>
      </body>
    </html>
  );
}
