import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.telesco.pe',
        port: '',
        pathname: '/file/**',
      },
    ],
  },
};

export default nextConfig;
