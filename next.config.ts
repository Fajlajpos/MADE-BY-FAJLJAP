import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  turbopack: {
    // A stray package-lock.json in the user's home dir would otherwise be picked as the root.
    root: import.meta.dirname,
  },
}

export default nextConfig
