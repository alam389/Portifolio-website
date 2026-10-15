import type { NextConfig } from "next";
import { MEDIA_ORIGIN } from "./src/data/media";

const dev = process.env.NODE_ENV !== "production";

// What pages may load. Next.js inlines its bootstrap scripts and the theme
// script in layout.tsx runs inline, so scripts need 'unsafe-inline' (nonces
// would force every page to render dynamically); the policy still blocks
// scripts from any other origin. Embeds: Spotify (Interests) and LinkedIn
// (Journey); media: the Supabase bucket; vercel.live is Vercel's preview
// toolbar. Dev adds eval and websockets for hot reload.
const csp = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${dev ? " 'unsafe-eval'" : ""} https://vercel.live`,
  "style-src 'self' 'unsafe-inline'",
  `img-src 'self' data: blob: ${MEDIA_ORIGIN} https://vercel.live https://vercel.com`,
  `media-src 'self' ${MEDIA_ORIGIN}`,
  "font-src 'self' https://vercel.live",
  `connect-src 'self' ${MEDIA_ORIGIN} https://vercel.live${dev ? " ws: wss:" : ""}`,
  "frame-src 'self' https://open.spotify.com https://www.linkedin.com https://vercel.live",
  "frame-ancestors 'self'",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  ...(dev ? [] : ["upgrade-insecure-requests"]),
].join("; ");

const nextConfig: NextConfig = {
  // Keep the dev badge clear of the sidebar's bottom links.
  devIndicators: { position: "bottom-right" },
  // The pets' souls are read at runtime by the AI twin (src/lib/twin/souls.ts).
  outputFileTracingIncludes: { "/api/chat": ["./src/components/pet/souls/*.md"] },
  images: {
    // Photos served from the Supabase media bucket (src/data/media.ts).
    remotePatterns: [new URL(`${MEDIA_ORIGIN}/storage/v1/object/public/media/**`)],
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          // SAMEORIGIN, not DENY: /resume frames /api/resume?view.
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), payment=(), usb=()" },
        ],
      },
      // Pages only: API responses are JSON, text or the resume PDF.
      { source: "/((?!api/).*)", headers: [{ key: "Content-Security-Policy", value: csp }] },
    ];
  },
};

export default nextConfig;
