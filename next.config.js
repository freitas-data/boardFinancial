/** @type {import('next').NextConfig} */
const nextConfig = {
  serverActions: {
    bodySizeLimit: "25mb"
  },
  experimental: {
    serverActions: {
      bodySizeLimit: "25mb"
    }
  }
};

module.exports = nextConfig;
