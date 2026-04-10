import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
    ],
  },
  // Hide bottom-right Next.js icon in development mode
  devIndicators: false,
  // Turbopack configuration (Next.js 16 default bundler)
  turbopack: {},
  // Webpack fallback for Fabric.js SSR compatibility (used with --webpack flag)
  webpack: (config) => {
    config.externals = [...(config.externals || []), { canvas: "commonjs canvas" }];
    return config;
  },
};

export default nextConfig;
