/** @type {import('next').NextConfig} */
const nextConfig = {
  // Adicione este bloco:
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
};

module.exports = nextConfig;
