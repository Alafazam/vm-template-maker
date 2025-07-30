/** @type {import('next').NextConfig} */
module.exports = {
  reactStrictMode: true,
  swcMinify: false,
  env: {
    BACKEND_URL: process.env.BACKEND_URL,
  }
}; 