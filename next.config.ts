import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Keep the dev badge clear of the sidebar's bottom links.
  devIndicators: { position: "bottom-right" },
};

export default nextConfig;
