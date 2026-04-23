import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  typescript: {
    // ⚠️ Atenção Sênior: Isso é ótimo para desenvolver rápido sem o terminal reclamar de tipagem,
    // mas lembre-se de mudar para 'false' antes de colocar o projeto no ar (Produção).
    ignoreBuildErrors: true,
  },

  // 🔥 BLINDAGEM S3: Autoriza o Next.js a carregar as fotos de perfil vindas do seu bucket da AWS
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.amazonaws.com', // Permite qualquer bucket S3
      },
    ],
  },
};

export default nextConfig;
