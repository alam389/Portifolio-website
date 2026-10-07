import type { Metadata } from "next";
import { Fraunces, Geist, Geist_Mono } from "next/font/google";
import Sidebar from "@/components/Sidebar";
import SmoothScroll from "@/components/SmoothScroll";
import { themeInitScript } from "@/components/theme";
import { profile, site } from "@/data";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// Display serif for h1/h2 (see globals.css). Variable, so the SOFT axis works.
const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  axes: ["SOFT", "opsz"],
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
    // suppressHydrationWarning: the theme script sets data-theme on <html>
    // before React hydrates.
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${fraunces.variable} antialiased`}
      >
        <SmoothScroll />
        <Sidebar />
        <div className="md:pl-18">
          <main className="mx-auto box-content max-w-3xl px-6 pt-10 pb-28 md:px-16 md:py-16">
            {children}
            <footer className="mt-24 border-t border-foreground/10 pt-6 text-xs text-foreground/45">
              {site.colophon}
            </footer>
          </main>
        </div>
      </body>
    </html>
  );
}
