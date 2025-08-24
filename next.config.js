/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: 'standalone',
  experimental: {
    esmExternals: false,
  },
}

module.exports = nextConfig
