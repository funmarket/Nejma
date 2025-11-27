
import type {NextConfig} from 'next';

const nextConfig: NextConfig = {
  /* config options here */
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'picsum.photos',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'pbs.twimg.com',
        port: '',
        pathname: '/**',
      },
    ],
  },
  devIndicators: {
    allowedDevOrigins: [
      'https://6000-firebase-studio-1764196890126.cluster-fbfjltn375c6wqxlhoehbz44sk.cloudworkstations.dev',
    ],
  },
  experimental: {
    // This is required to allow the Next.js dev server to accept requests from the
    // Cloud Workstation's proxy.
    allowedDevOrigins: ["https://*.cloudworkstations.dev"],
  },
};

export default nextConfig;
