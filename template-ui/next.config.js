/** @type {import('next').NextConfig} */
module.exports = {
  reactStrictMode: true,
  swcMinify: false,
  typescript: {
    ignoreBuildErrors: true,
  },
  experimental: {
    instrumentationHook: false,
  },
  env: {
    BACKEND_URL: process.env.BACKEND_URL || 'http://localhost:8890/velocity-engine-app',
  }
}; 