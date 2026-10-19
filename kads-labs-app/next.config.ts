import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: ["*.e2b.app"],
  /* Static export (out/) so the site can be served from any static host,
     including GitHub Pages (.github/workflows/pages.yml builds this app). */
  output: "export",
  images: {
    // Local images only — no remote loader needed on a static host.
    unoptimized: true,
  },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
