import type { NextConfig } from "next";

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Prevent webpack from bundling the Stripe server SDK — it must run in
  // the Node.js module system, not the webpack bundle.
  serverExternalPackages: ["stripe"],
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        port: '',
        pathname: '/**',
      },
      // Adding this as a backup for high-res Unsplash plus images
      {
        protocol: 'https',
        hostname: 'plus.unsplash.com',
        port: '',
        pathname: '/**',
      },
    ],
  },
};

export default nextConfig;