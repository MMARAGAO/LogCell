/** @type {import('next').NextConfig} */

// ============================================
// 🎛️ CONTROLE DE LOGS - MUDE AQUI
// ============================================
// true  = Remove console.log em DEV E PROD
// false = Mantém todos os logs (padrão)
const DISABLE_CONSOLE_LOGS = true;
// ============================================

const nextConfig = {
  eslint: {
    // Desabilita ESLint durante build de produção
    ignoreDuringBuilds: true,
  },
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
};

export default nextConfig;
