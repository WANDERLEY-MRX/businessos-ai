import type { NextConfig } from "next"

const nextConfig: NextConfig = {
  output: "export",
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "**.supabase.co" },
      { protocol: "https", hostname: "lh3.googleusercontent.com" },
      { protocol: "https", hostname: "avatars.githubusercontent.com" },
    ],
    unoptimized: true,
  },
  typescript: {
    ignoreBuildErrors: false,
  },
}

export default nextConfig
