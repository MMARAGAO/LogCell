/** @type {import('next').NextConfig} */

// ============================================
// 🎛️ CONTROLE DE LOGS - MUDE AQUI
// ============================================
// true  = Remove console.log em DEV E PROD
// false = Mantém todos os logs (padrão)
const DISABLE_CONSOLE_LOGS = false;
// ============================================

const nextConfig = {
  typescript: {
    // Ignora erros de TypeScript durante build (use com cuidado!)
    ignoreBuildErrors: false,
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "qyzjvkthuuclsyjeweek.supabase.co",
        port: "",
        pathname: "/storage/v1/object/public/**",
      },
    ],
  },
  // Remove console.log conforme configuração acima
  compiler: {
    removeConsole: DISABLE_CONSOLE_LOGS
      ? {
          exclude: ["error"], // Mantém apenas errors
        }
      : process.env.NODE_ENV === "production"
        ? {
            exclude: ["error", "warn", "info"], // Remove só em produção
          }
        : false, // Mantém tudo em dev
  },
  // Configuração experimental para melhorar performance
  experimental: {
    // Otimizar carregamento de pacotes
    optimizePackageImports: ["@heroui/react"],
  },
};

export default nextConfig;
