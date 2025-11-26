/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "via.placeholder.com",
      },
    ],
  },
  eslint: {
    // Permite que el build continúe aunque haya warnings de ESLint
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Permite que el build continúe aunque haya errores de TypeScript (solo warnings)
    ignoreBuildErrors: false,
  },
  webpack: (config, { isServer }) => {
    // Excluir lib/supabase/server.ts del bundle del cliente
    if (!isServer) {
      config.resolve.alias = {
        ...config.resolve.alias,
        "@/lib/supabase/server": false,
      };
    }
    return config;
  },
};

module.exports = nextConfig;
