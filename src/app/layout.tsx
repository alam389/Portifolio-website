import type { Metadata } from "next";
import { Fraunces, Geist, Geist_Mono } from "next/font/google";
import PetMount from "@/components/pet/PetMount";
import Sidebar from "@/components/Sidebar";
import SmoothScroll from "@/components/SmoothScroll";
import AssistantChat from "@/components/assistant/AssistantChat";
import { themeInitScript } from "@/components/theme";
import { profile, site, assistant } from "@/data";
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
    // The font variables go on <html>: Tailwind's @theme tokens are declared
    // on :root and reference them, so they must be defined there.
    <html
      lang="en"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} ${fraunces.variable}`}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body className="antialiased">
        <SmoothScroll />
        <Sidebar />
        <PetMount />
        <AssistantChat greeting={assistant.greeting} starters={assistant.starters} privacyNote={assistant.privacyNote} />
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
