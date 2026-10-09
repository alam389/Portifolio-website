import type { NextConfig } from "next";
import { MEDIA_ORIGIN } from "./src/data/media";

const nextConfig: NextConfig = {
  // Keep the dev badge clear of the sidebar's bottom links.
  devIndicators: { position: "bottom-right" },
  images: {
    // Photos served from the Supabase media bucket (src/data/media.ts).
    remotePatterns: [new URL(`${MEDIA_ORIGIN}/storage/v1/object/public/media/**`)],
  },
};

export default nextConfig;
